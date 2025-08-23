import { Request, Response, NextFunction } from "express";
import Order from "../infrastructure/db/entities/Order"; 
import Address from "../infrastructure/db/entities/Address";
import Product from "../infrastructure/db/entities/Product";
import NotFoundError from "../domain/errors/not-found-error";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import ValidationError from "../domain/errors/validation-error";
import { getAuth, clerkClient } from "@clerk/express";

// Replace lines 9-22 in your backend order.ts file
const getUserFromClerk = async (userId: string) => {
  try {
    if (!userId || userId.trim() === '') {
      console.warn("⚠️ Empty userId provided to getUserFromClerk");
      return null;
    }

    console.log(`🔍 Fetching user info from Clerk for: ${userId}`);
    
    const user = await clerkClient.users.getUser(userId);
    
    if (!user) {
      console.warn(`⚠️ No user found in Clerk for ID: ${userId}`);
      return null;
    }

    const userInfo = {
      id: user.id,
      firstName: user.firstName || 'N/A',
      lastName: user.lastName || 'N/A',
      email: user.primaryEmailAddress?.emailAddress || 'No email',
      imageUrl: user.imageUrl || null,
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt
    };

    console.log(`✅ User info retrieved: ${userInfo.fullName} (${userInfo.email})`);
    return userInfo;
    
  } catch (error) {
    console.error(`❌ Error fetching user from Clerk for ID ${userId}:`, error);
    
    // Return a fallback user object instead of null
    return {
      id: userId,
      firstName: 'Unknown',
      lastName: 'User',
      email: 'No email available',
      imageUrl: null,
      fullName: 'Unknown User',
      createdAt: null,
      lastSignInAt: null,
      isClerkError: true
    };
  }
};

// ========== CREATE ORDER ==========
const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const { userId } = getAuth(req);
    
    console.log("📝 Creating order for user:", userId);
    
    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    // Validate required fields
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      throw new ValidationError("Order items are required");
    }

    if (!data.shippingAddress) {
      throw new ValidationError("Shipping address is required");
    }

    // Create shipping address
    const addressData = {
      line1: data.shippingAddress.line1,
      line2: data.shippingAddress.line2 || "",
      city: data.shippingAddress.city,
      phone: data.shippingAddress.phone
    };

    const address = await Address.create(addressData);

    // Process items and validate stock
    let totalAmount = 0;
    const processedItems = [];

    for (const item of data.items) {
      if (!item.productId || !item.quantity) {
        throw new ValidationError("Each item must have productId and quantity");
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        throw new NotFoundError(`Product with ID ${item.productId} not found`);
      }

      // Always check stock availability
      if (product.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`);
      }

      // Calculate price with discount
      let itemPrice = parseFloat(product.price.toString());
      if (product.discount && product.discount > 0) {
        itemPrice = parseFloat(product.price.toString()) * (1 - product.discount / 100);
      }
      
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;
      
      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: itemPrice
      });
    }

    const paymentMethod = data.paymentMethod || "CREDIT_CARD";
    
    // 🔧 KEY LOGIC: Different handling for COD vs Online Payment
    if (paymentMethod === "COD") {
      console.log("💰 COD Order - Deducting stock immediately");
      
      // For COD: Deduct stock immediately since payment is guaranteed on delivery
      for (const item of data.items) {
       const product = await Product.findById(item.productId);
       if (product) {
         product.stock -= item.quantity;
         product.salesCount = (product.salesCount || 0) + item.quantity;
         await product.save();
         console.log(`📦 Stock updated for ${product.name}: Remaining ${product.stock}`);
       }
      }

    } else {
      console.log("💳 Online Payment Order - Stock will be deducted after payment confirmation");
    }

    // Create order with appropriate initial status
    const orderData = {
      userId: userId,
      items: processedItems,
      addressId: address._id,
      totalAmount: data.totalAmount || totalAmount,
      paymentMethod: paymentMethod,
      // 🔧 FIXED: Proper initial status based on payment method
      paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING", // COD payment pending until delivery
      orderStatus: paymentMethod === "COD" ? "CONFIRMED" : "PENDING"  // COD order confirmed, online pending payment
    };

    const order = await Order.create(orderData);
    
    const populatedOrder = await Order.findById(order._id)
      .populate("addressId")
      .populate("items.productId");
    
    res.status(201).json({ 
      success: true,
      message: "Order created successfully", 
      orderId: order._id,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      order: populatedOrder
    });
    
  } catch (error) {
    console.error("❌ Error creating order:", error);
    next(error);
  }
};

// ========== GET USER'S ORDERS ==========
// 🔧 FIXED: Get User's Orders - Only return orders for authenticated user
const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    console.log(`🔍 Fetching orders for user: ${userId}`);

    // 🔧 CRITICAL FIX: Filter orders by userId
    const orders = await Order.find({ userId: userId })  // ✅ Only get THIS user's orders
      .populate({
        path: "items.productId",
        model: "Product", 
        select: "name price discount image description"
      })
      .populate("addressId")
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${orders.length} orders for user ${userId}`);
    
    res.status(200).json({
      success: true,
      orders: orders,
      count: orders.length
    });
  } catch (error) {
    console.error("❌ Error getting user orders:", error);
    next(error);
  }
};

// ========== GET SINGLE ORDER (CUSTOMER) ==========
const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }
    
    const orderId = req.params.id;
    
    if (!orderId || orderId === 'undefined') {
      throw new ValidationError("Valid order ID is required");
    }
    
    console.log(`🔍 Customer ${userId} accessing order: ${orderId}`);
    
    const order = await Order.findById(orderId)
      .populate("addressId")
      .populate("items.productId");
    
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    
    // Check if user owns this order (CUSTOMER ACCESS ONLY)
    if (order.userId !== userId) {
      throw new UnauthorizedError("Unauthorized to access this order");
    }
    
    res.status(200).json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error("❌ Error getting order:", error);
    next(error);
  }
};

// ========== ADMIN: GET ALL ORDERS ==========
// Replace the getAllOrders function (lines 173-193)
const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("🔍 Admin fetching all orders with user info...");
    
    const orders = await Order.find()
      .populate({
        path: "items.productId",
        model: "Product",
        select: "name price discount image description"
      })
      .populate("addressId")
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${orders.length} orders, enriching with user info...`);
    
    // 🔧 IMPROVED: Batch process user info with error handling
    const ordersWithUserInfo = await Promise.allSettled(
      orders.map(async (order) => {
        try {
          const userInfo = await getUserFromClerk(order.userId);
          return {
            ...order.toObject(),
            userInfo // Add user info from Clerk
          };
        } catch (error) {
          console.warn(`⚠️ Failed to get user info for order ${order._id}:`, error);
          return {
            ...order.toObject(),
            userInfo: {
              id: order.userId,
              firstName: 'Unknown',
              lastName: 'User',
              email: 'Error fetching email',
              fullName: 'Unknown User',
              isClerkError: true
            }
          };
        }
      })
    );
    
    // Extract successful results and handle rejections
    const processedOrders = ordersWithUserInfo.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`❌ Failed to process order ${orders[index]._id}:`, result.reason);
        return {
          ...orders[index].toObject(),
          userInfo: {
            id: orders[index].userId,
            firstName: 'Error',
            lastName: 'Loading',
            email: 'Failed to load',
            fullName: 'Error Loading User',
            isClerkError: true
          }
        };
      }
    });
    
    console.log(`✅ Successfully processed ${processedOrders.length} orders with user info`);
    
    res.status(200).json({
      success: true,
      orders: processedOrders,
      count: processedOrders.length,
      message: "Orders retrieved successfully with user information"
    });
  } catch (error) {
    console.error("❌ Error getting all orders:", error);
    next(error);
  }
};

// ========== ADMIN: GET ORDER BY ID ==========
// Replace the getOrderById function (lines 309-339)
const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    
    if (!orderId || orderId === 'undefined') {
      throw new ValidationError("Valid order ID is required");
    }
    
    console.log(`🔍 Admin fetching order with user info: ${orderId}`);
    
    const order = await Order.findById(orderId)
      .populate({
        path: "items.productId",  
        model: "Product",
        select: "name price discount image description"
      })
      .populate("addressId");
    
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    
    // 🔧 NEW: Enrich with user info from Clerk
    const userInfo = await getUserFromClerk(order.userId);
    
    const enrichedOrder = {
      ...order.toObject(),
      userInfo // Add user info from Clerk
    };
    
    console.log(`✅ Admin successfully fetched order with user info: ${orderId}`);
    
    res.status(200).json({
      success: true,
      order: enrichedOrder
    });
  } catch (error) {
    console.error("❌ Error getting order by ID:", error);
    next(error);
  }
};

// ========== UPDATE ORDER STATUS (ADMIN & WEBHOOK) ==========
const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, orderStatus, paymentStatus } = req.body;
    const orderId = req.params.orderId || req.params.id;
    
    console.log(`📊 Status update request:`, { 
      orderId, 
      status, 
      orderStatus, 
      paymentStatus,
      body: req.body 
    });
    
    // Validation
    if (!orderId || orderId === 'undefined' || orderId === 'null') {
      throw new ValidationError("Valid order ID is required");
    }
    
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ValidationError("Invalid order ID format");
    }
    
    const targetOrderStatus = orderStatus || status;
    
    const validOrderStatuses = ["PENDING", "CONFIRMED", "SHIPPED", "FULFILLED", "CANCELLED"];
    const validPaymentStatuses = ["PENDING", "PAID", "REFUNDED"];
    
    if (targetOrderStatus && !validOrderStatuses.includes(targetOrderStatus)) {
      throw new ValidationError(`Invalid order status. Must be one of: ${validOrderStatuses.join(', ')}`);
    }
    
    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      throw new ValidationError(`Invalid payment status. Must be one of: ${validPaymentStatuses.join(', ')}`);
    }
    
    if (!targetOrderStatus && !paymentStatus) {
      throw new ValidationError("Either order status or payment status must be provided");
    }
    
    // Build update object
    const updateData: any = { updatedAt: new Date() };
    
    if (targetOrderStatus) {
      updateData.orderStatus = targetOrderStatus;
    }
    
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    
    // 🔧 BUSINESS LOGIC: Auto-status transitions
    if (paymentStatus === "PAID" && !targetOrderStatus) {
      updateData.orderStatus = "CONFIRMED";
      console.log("🔄 Auto-confirming order due to successful payment");
    }
    
    if (targetOrderStatus === "CANCELLED" && !paymentStatus) {
      // Don't auto-refund COD orders
      const order = await Order.findById(orderId);
      if (order && order.paymentMethod !== "COD") {
        updateData.paymentStatus = "REFUNDED";
        console.log("🔄 Auto-setting payment to refunded due to cancellation");
      }
    }
    
    // 🔧 CRITICAL: Handle stock for COD payment completion
    if (paymentStatus === "PAID") {
      const order = await Order.findById(orderId).populate('items.productId');
      
      if (order && order.paymentMethod === "COD" && order.paymentStatus !== "PAID") {
        console.log("💰 COD Payment completed - order already confirmed, just updating payment status");
        // For COD, stock was already deducted when order was created
      }
      
      if (order && order.paymentMethod !== "COD" && order.paymentStatus !== "PAID") {
        console.log("💳 Online payment completed - this should be handled by webhook");
      }
    }
    
    console.log("📊 Final update data:", updateData);
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).populate("items.productId").populate("addressId");
    
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    
    console.log("✅ Order status updated successfully:", {
      orderId: order._id,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus
    });
    
    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: order
    });
    
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    next(error);
  }
};

// ========== UPDATE PAYMENT STATUS (ADMIN ONLY) ==========
// 🔧 REPLACE the updatePaymentStatus function in your order.ts backend file

const updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { paymentStatus } = req.body;
    const orderId = req.params.orderId || req.params.id;
    
    console.log(`💳 Payment status update request:`, { 
      orderId, 
      paymentStatus,
      body: req.body,
      params: req.params 
    });
    
    if (!orderId || orderId === 'undefined' || orderId === 'null') {
      throw new ValidationError("Valid order ID is required");
    }
    
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ValidationError("Invalid order ID format");
    }
    
    const validStatuses = ["PENDING", "PAID", "REFUNDED"];
    if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
      throw new ValidationError(`Invalid payment status. Must be one of: ${validStatuses.join(', ')}`);
    }
    
    console.log(`💳 Updating order ${orderId} payment status to ${paymentStatus}`);
    
    // Get the current order first
    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
      throw new NotFoundError("Order not found");
    }
    
    const updateData: any = {
      paymentStatus,
      updatedAt: new Date()
    };
    
    // 🔧 BUSINESS LOGIC: Handle payment status changes
    if (paymentStatus === "PAID") {
      if (existingOrder.paymentMethod === "COD") {
        // For COD, payment received means order is complete
        updateData.orderStatus = "FULFILLED";
        console.log("✅ COD payment received - marking order as fulfilled");
      } else if (existingOrder.orderStatus === "PENDING") {
        // For online payments, payment confirms the order
        updateData.orderStatus = "CONFIRMED";
        console.log("✅ Online payment received - confirming order");
        
        // 🔧 STOCK DEDUCTION: For online payments, deduct stock when payment is confirmed
        const orderWithItems = await Order.findById(orderId).populate('items.productId');
        
        if (orderWithItems && orderWithItems.items) {
          for (const item of orderWithItems.items) {
            const productId = item.productId._id || item.productId;
            const product = await Product.findById(productId);
            
            if (product) {
              // Check stock availability
              if (product.stock < item.quantity) {
                throw new ValidationError(`Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`);
              }
              
              // Deduct stock and update sales count
              product.stock -= item.quantity;
              product.salesCount = (product.salesCount || 0) + item.quantity;
              await product.save();
              
              console.log(`📦 Stock deducted for ${product.name}: -${item.quantity} (Remaining: ${product.stock})`);
            }
          }
        }
      }
    } else if (paymentStatus === "REFUNDED") {
      // Handle refund logic
      if (existingOrder.orderStatus !== "CANCELLED") {
        // If refunding but not cancelled, cancel the order and restore stock
        updateData.orderStatus = "CANCELLED";
        
        const orderWithItems = await Order.findById(orderId).populate('items.productId');
        
        if (orderWithItems && orderWithItems.items) {
          for (const item of orderWithItems.items) {
            const productId = item.productId._id || item.productId;
            const product = await Product.findById(productId);
            
            if (product) {
              product.stock += item.quantity;
              if (product.salesCount && product.salesCount >= item.quantity) {
                product.salesCount -= item.quantity;
              }
              await product.save();
              
              console.log(`📦 Stock restored for ${product.name}: +${item.quantity} (Total: ${product.stock})`);
            }
          }
        }
        
        console.log("🔄 Refund issued - order cancelled and stock restored");
      }
    }
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    ).populate("items.productId").populate("addressId");
    
    // console.log("✅ Payment status updated successfully:", {
    //   orderId: order._id,
    //   paymentStatus: order.paymentStatus,
    //   orderStatus: order.orderStatus
    // });

    if (order && order.paymentMethod === "COD" && order.paymentStatus !== "PAID") {
      console.log("💰 COD Payment completed - order already confirmed, just updating payment status");
      // For COD, stock was already deducted when order was created
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      order: order
    });
    
  } catch (error) {
    console.error("❌ Error updating payment status:", error);
    next(error);
  }
};

// ========== CANCEL ORDER (CUSTOMER) ==========
const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    const orderId = req.params.id;
    
    console.log(`🚫 Cancel order request: ${orderId} by user: ${userId}`);
    
    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }
    
    if (!orderId || orderId === 'undefined') {
      throw new ValidationError("Valid order ID is required");
    }

    const order = await Order.findById(orderId).populate('items.productId');
    
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    
    // Check if user owns this order
    if (order.userId !== userId) {
      throw new UnauthorizedError("Unauthorized to cancel this order");
    }
    
    // Check if order can be cancelled
    if (order.orderStatus === 'SHIPPED' || order.orderStatus === 'FULFILLED') {
      throw new ValidationError("Cannot cancel order that has been shipped or delivered");
    }
    
    if (order.orderStatus === 'CANCELLED') {
      throw new ValidationError("Order is already cancelled");
    }

    console.log(`📦 Restoring stock for ${order.items.length} items`);
    
    // 🔧 RESTORE STOCK for all items (both COD and online)
    for (const item of order.items) {
      const product = await Product.findById(item.productId._id || item.productId);
      
      if (product) {
        product.stock += item.quantity;
        
        if (product.salesCount && product.salesCount >= item.quantity) {
          product.salesCount -= item.quantity;
        }
        
        await product.save();
        
        console.log(`✅ Stock restored for ${product.name}: +${item.quantity} (Total: ${product.stock})`);
      }
    }

    // Update order status
    const updateData: any = { 
      orderStatus: 'CANCELLED',
      cancelledAt: new Date(),
      updatedAt: new Date()
    };
    
    // Only refund if payment was made
    if (order.paymentStatus === 'PAID') {
      updateData.paymentStatus = 'REFUNDED';
    }
    
    const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true })
      .populate('items.productId')
      .populate('addressId');

    console.log(`✅ Order cancelled successfully: ${orderId}`);

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully. Stock has been restored.",
      order: updatedOrder
    });

  } catch (error) {
    console.error("❌ Error cancelling order:", error);
    next(error);
  }
};


// 🔧 ADD this new function to your order controller (order.ts file)
// This handles payment completion by customers (not admin-only)

// ========== CUSTOMER PAYMENT COMPLETION (AFTER SUCCESSFUL PAYMENT) ==========
const updateOrderStatusAfterPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    const { status, orderStatus, paymentStatus } = req.body;
    const orderId = req.params.orderId || req.params.id;
    
    console.log(`💳 Customer payment completion update:`, { 
      orderId, 
      userId,
      status, 
      orderStatus, 
      paymentStatus,
      body: req.body 
    });
    
    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }
    
    // Validation
    if (!orderId || orderId === 'undefined' || orderId === 'null') {
      throw new ValidationError("Valid order ID is required");
    }
    
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ValidationError("Invalid order ID format");
    }
    
    // First, verify this order belongs to the authenticated user
    const existingOrder = await Order.findById(orderId);
    
    if (!existingOrder) {
      throw new NotFoundError("Order not found");
    }
    
    // 🔧 CRITICAL: Only the order owner can update their order's payment status
    if (existingOrder.userId !== userId) {
      throw new UnauthorizedError("You can only update your own orders");
    }
    
    // 🔧 BUSINESS LOGIC: Only allow payment completion updates
    const targetOrderStatus = orderStatus || status;
    
    if (targetOrderStatus && !['CONFIRMED'].includes(targetOrderStatus)) {
      throw new ValidationError("Customers can only confirm orders after payment");
    }
    
    // Build update object for payment completion
    const updateData: any = { 
      updatedAt: new Date(),
      paymentStatus: 'PAID',  // Mark payment as completed
      orderStatus: 'CONFIRMED'  // Confirm the order
    };
    
    // 🔧 HANDLE STOCK DEDUCTION for online payments
    if (existingOrder.paymentMethod !== "COD" && existingOrder.paymentStatus !== "PAID") {
      console.log("💳 Online payment completed - deducting stock");
      
      const populatedOrder = await Order.findById(orderId).populate('items.productId');
      
      if (populatedOrder && populatedOrder.items) {
        for (const item of populatedOrder.items) {
          const productId = item.productId._id || item.productId;
          const product = await Product.findById(productId);
          
          if (product) {
            // Check stock availability
            if (product.stock < item.quantity) {
              throw new ValidationError(`Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`);
            }
            
            // Deduct stock and update sales count
            product.stock -= item.quantity;
            product.salesCount = (product.salesCount || 0) + item.quantity;
            await product.save();
            
            console.log(`📦 Stock deducted for ${product.name}: -${item.quantity} (Remaining: ${product.stock})`);
          }
        }
      }
    } else {
      console.log("💰 COD order - stock already deducted during creation");
    }
    
    console.log("📊 Payment completion update data:", updateData);
    
  const order = await Order.findByIdAndUpdate(
    orderId,
    updateData,
    { 
      new: true,
      runValidators: true
    }
  ).populate("items.productId").populate("addressId");

  if (!order) {
    throw new NotFoundError("Order not found after update");
  }

  console.log("✅ Customer payment completion successful:", {
    orderId: order._id,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
    userId: order.userId
  });

  res.status(200).json({
    success: true,
    message: "Payment confirmed and order updated successfully",
    order: order
  });
    
  } catch (error) {
    console.error("❌ Error in customer payment completion:", error);
    next(error);
  }
};

// 🔧 UPDATED EXPORTS - Add the new function
export { 
  createOrder, 
  getOrder, 
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  updateOrderStatusAfterPayment  // 🔧 NEW: Add this export
};
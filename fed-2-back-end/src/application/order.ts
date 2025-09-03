import { Request, Response, NextFunction } from "express";
import Order from "../infrastructure/db/entities/Order"; 
import Address from "../infrastructure/db/entities/Address";
import Product from "../infrastructure/db/entities/Product";
import NotFoundError from "../domain/errors/not-found-error";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import ValidationError from "../domain/errors/validation-error";
import { getAuth, clerkClient } from "@clerk/express";

// Replace lines 9-22 in your backend order.ts file
const getUserFromClerk = async (userId : string) => {
  try {
    // Enhanced validation
    if (!userId || userId.trim() === '' || userId === 'undefined' || userId === 'null') {
      console.warn("⚠️ Invalid userId provided to getUserFromClerk:", userId);
      return {
        id: userId || 'unknown',
        firstName: 'Unknown',
        lastName: 'User',
        email: 'No email available',
        imageUrl: null,
        fullName: 'Unknown User',
        createdAt: null,
        lastSignInAt: null,
        isClerkError: true,
        errorReason: 'Invalid userId'
      };
    }

    console.log(`🔍 Fetching user info from Clerk for: ${userId}`);
    
    // 🔧 FIX 1: Check if Clerk client is properly configured
    if (!clerkClient) {
      console.error('❌ Clerk client is not initialized');
      throw new Error('Clerk client not configured');
    }

    // 🔧 FIX 2: Use proper Clerk API call with error handling
    let user;
    try {
      // Add retry logic for Clerk API calls
      const maxRetries = 3;
      let retryCount = 0;
      
      while (retryCount < maxRetries) {
        try {
          user = await clerkClient.users.getUser(userId);
          break; // Success, exit retry loop
        } catch (retryError) {
          retryCount++;
          if (retryCount === maxRetries) {
            throw retryError; // Final attempt failed
          }
          console.warn(`⚠️ Clerk API attempt ${retryCount} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Exponential backoff
        }
      }
    } catch (clerkError : any) {
      console.error('❌ Clerk API error:', {
        error: clerkError.message,
        status: clerkError.status,
        userId: userId
      });
      
      // Handle specific Clerk errors
      if (clerkError.status === 404) {
        return {
          id: userId,
          firstName: 'User Not Found',
          lastName: '',
          email: 'User not found in Clerk',
          imageUrl: null,
          fullName: 'User Not Found',
          createdAt: null,
          lastSignInAt: null,
          isClerkError: true,
          errorReason: 'User not found'
        };
      }
      
      throw clerkError; // Re-throw for general error handling
    }
    
    if (!user) {
      console.warn(`⚠️ No user found in Clerk for ID: ${userId}`);
      return {
        id: userId,
        firstName: 'User Not Found',
        lastName: '',
        email: 'User not found in Clerk',
        imageUrl: null,
        fullName: 'User Not Found',
        createdAt: null,
        lastSignInAt: null,
        isClerkError: true,
        errorReason: 'User not found'
      };
    }

    // 🔧 FIX 3: Better email extraction with fallbacks
    let userEmail = 'No email available';
    if (user.emailAddresses && user.emailAddresses.length > 0) {
      // Find primary email first
      const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
      if (primaryEmail) {
        userEmail = primaryEmail.emailAddress;
      } else {
        // Fallback to first email
        userEmail = user.emailAddresses[0].emailAddress;
      }
    }

    // 🔧 FIX 4: Better image URL handling
    let imageUrl = null;
    if (user.imageUrl) {
      imageUrl = user.imageUrl;
    } else if (user.hasImage && user.imageUrl) {
      imageUrl = user.imageUrl;
    }

    // 🔧 FIX 5: Enhanced user info object
    const userInfo = {
      id: user.id,
      firstName: user.firstName || 'Unknown',
      lastName: user.lastName || 'User',
      email: userEmail,
      imageUrl: imageUrl,
      fullName: `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`.trim(),
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      updatedAt: user.updatedAt,
      // Additional useful fields
      username: user.username || null,
      phoneNumbers: user.phoneNumbers || [],
      publicMetadata: user.publicMetadata || {},
      privateMetadata: user.privateMetadata || {},
      unsafeMetadata: user.unsafeMetadata || {},
      isClerkError: false
    };

    console.log(`✅ User info retrieved successfully:`, {
      id: userInfo.id,
      name: userInfo.fullName,
      email: userInfo.email,
      hasImage: !!userInfo.imageUrl
    });
    
    return userInfo;
    
  } catch (error: any) {
    console.error(`❌ Error fetching user from Clerk for ID ${userId}:`, {
      error: error?.message || error,
      status: error?.status,
      code: error?.code,
      userId,
      stack: error?.stack
    });
    
    // Return detailed fallback user object
    return {
      id: userId,
      firstName: 'Error Loading',
      lastName: 'User',
      email: 'Error fetching email',
      imageUrl: null,
      fullName: 'Error Loading User',
      createdAt: null,
      lastSignInAt: null,
      isClerkError: true,
      errorReason: error?.message || 'Unknown error',
      errorStatus: error?.status || null
    };
  }
};

// ========== CREATE ORDER ==========
const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const { userId } = getAuth(req);
    
    console.log("📝 Creating order for user:", userId);
    console.log("📦 Order data received:", JSON.stringify(data, null, 2));
    
    // 🔧 FIX 1: Enhanced validation with better error messages
    if (!userId) {
      console.error("❌ No userId found in auth");
      throw new UnauthorizedError("Authentication required");
    }

    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      console.error("❌ Invalid items data:", data.items);
      throw new ValidationError("Order items are required and must be a non-empty array");
    }

    if (!data.shippingAddress) {
      console.error("❌ Missing shipping address:", data.shippingAddress);
      throw new ValidationError("Shipping address is required");
    }

    // 🔧 FIX 2: Validate required shipping address fields
    const requiredAddressFields = ['firstName', 'lastName', 'line1', 'city', 'phone'];
    for (const field of requiredAddressFields) {
      if (!data.shippingAddress[field] || data.shippingAddress[field].trim() === '') {
        throw new ValidationError(`Shipping address ${field} is required`);
      }
    }

    // Create shipping address with error handling
    let address;
    try {
      const addressData = {
        line1: data.shippingAddress.line1.trim(),
        line2: data.shippingAddress.line2?.trim() || "",
        city: data.shippingAddress.city.trim(),
        phone: data.shippingAddress.phone.trim(),
      };

      console.log("📍 Creating address with data:", addressData);
      address = await Address.create(addressData);
      console.log("✅ Address created successfully:", address._id);
      
    } catch (addressError: any) {
      console.error("❌ Failed to create address:", addressError);
      throw new ValidationError(`Failed to create shipping address: ${addressError.message}`);
    }

    // 🔧 CRITICAL FIX: Enhanced item processing with better size/color validation
    let totalAmount = 0;
    const processedItems = [];

    console.log(`🔍 Processing ${data.items.length} items...`);

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      console.log(`📦 Processing item ${i + 1}:`, item);

      // Enhanced item validation
      if (!item.productId) {
        throw new ValidationError(`Item ${i + 1}: Product ID is required`);
      }
      
      if (!item.quantity || item.quantity <= 0) {
        throw new ValidationError(`Item ${i + 1}: Valid quantity is required`);
      }

      if (!Number.isInteger(item.quantity)) {
        throw new ValidationError(`Item ${i + 1}: Quantity must be a whole number`);
      }

      // Better product fetching with error handling
      let product;
      try {
        product = await Product.findById(item.productId);
        if (!product) {
          throw new NotFoundError(`Product with ID ${item.productId} not found`);
        }
        console.log(`✅ Product found: ${product.name}`);
      } catch (productError) {
        console.error(`❌ Failed to fetch product ${item.productId}:`, productError);
        throw new NotFoundError(`Product with ID ${item.productId} not found or invalid`);
      }
      // In your order controller, replace the size/color validation section with this:

      // Process size - handle null/undefined properly
      let selectedSize = null;
      let selectedColor = null;

      // Handle size validation
      if (item.size !== undefined && item.size !== null && item.size !== '' && item.size !== 'undefined') {
        selectedSize = item.size.toString().trim();
        
        // Only validate if product has size variants
        if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
          const availableSizes = product.sizes.map(s => s.toString().toLowerCase());
          if (!availableSizes.includes(selectedSize.toLowerCase())) {
            throw new ValidationError(
              `Size "${selectedSize}" is not available for "${product.name}". Available sizes: ${product.sizes.join(', ')}`
            );
          }
        }
      }

      // Handle color validation  
      if (item.color !== undefined && item.color !== null && item.color !== '' && item.color !== 'undefined') {
        selectedColor = item.color.toString().trim();
        
        // Only validate if product has color variants
        if (product.colors && Array.isArray(product.colors) && product.colors.length > 0) {
          const availableColors = product.colors.map(c => c.toString().toLowerCase());
          if (!availableColors.includes(selectedColor.toLowerCase())) {
            throw new ValidationError(
              `Color "${selectedColor}" is not available for "${product.name}". Available colors: ${product.colors.join(', ')}`
            );
          }
        }
      }

      // Better stock validation
      const availableStock = parseInt(product.stock.toString()) || 0;
      const requestedQuantity = parseInt(item.quantity.toString());
      
      if (availableStock < requestedQuantity) {
        const variantText = [selectedSize, selectedColor].filter(Boolean).join(', ');
        const variantDisplay = variantText ? ` (${variantText})` : '';
        throw new ValidationError(
          `Insufficient stock for "${product.name}"${variantDisplay}. Available: ${availableStock}, Requested: ${requestedQuantity}`
        );
      }

      // Robust price calculation
      let itemPrice;
      try {
        itemPrice = parseFloat(product.price.toString());
        if (isNaN(itemPrice) || itemPrice < 0) {
          throw new Error(`Invalid price for product ${product.name}`);
        }
        
        // Apply discount if exists
        if (product.discount && product.discount > 0) {
          const discountAmount = itemPrice * (product.discount / 100);
          itemPrice = itemPrice - discountAmount;
        }
      } catch (priceError) {
        console.error(`❌ Price calculation error for ${product.name}:`, priceError);
        throw new ValidationError(`Invalid price configuration for product "${product.name}"`);
      }
      
      const itemTotal = itemPrice * requestedQuantity;
      totalAmount += itemTotal;
      
      // 🔧 FIXED: Enhanced processed item with proper null handling
      const processedItem = {
        productId: item.productId,
        quantity: requestedQuantity,
        price: itemPrice,
        size: selectedSize, // null if no size selected/required
        color: selectedColor, // null if no color selected/required
        productName: product.name,
        productImage: product.image || null
      };
      
      processedItems.push(processedItem);

      console.log(`✅ Item ${i + 1} processed:`, {
        productName: product.name,
        quantity: requestedQuantity,
        price: itemPrice,
        size: selectedSize,
        color: selectedColor,
        itemTotal,
        availableStock
      });
    }

    const paymentMethod = (data.paymentMethod || "CREDIT_CARD").toUpperCase();
    
    // 🔧 FIX 9: Validate payment method
    const validPaymentMethods = ["CREDIT_CARD", "COD"];
    if (!validPaymentMethods.includes(paymentMethod)) {
      throw new ValidationError(`Invalid payment method. Must be one of: ${validPaymentMethods.join(', ')}`);
    }

    console.log(`💳 Payment method: ${paymentMethod}, Total: $${totalAmount.toFixed(2)}`);
    
    // 🔧 FIX 10: Enhanced stock deduction for COD with transaction-like behavior
    if (paymentMethod === "COD") {
      console.log("💰 COD Order - Deducting stock immediately");
      
      // Create array to track stock changes for rollback if needed
      const stockChanges = [];
      
      try {
        for (let i = 0; i < data.items.length; i++) {
          const item = data.items[i];
          const product = await Product.findById(item.productId);
          
          if (product) {
            const originalStock = product.stock;
            const originalSalesCount = product.salesCount || 0;
            
            // Update stock and sales
            product.stock -= item.quantity;
            product.salesCount = originalSalesCount + item.quantity;
            
            await product.save();
            
            // Track change for potential rollback
            stockChanges.push({
              productId: item.productId,
              originalStock,
              originalSalesCount,
              quantityDeducted: item.quantity
            });
            
            const variantText = [item.size, item.color].filter(Boolean).join(', ');
            const variantDisplay = variantText ? ` (${variantText})` : '';
            console.log(`📦 Stock updated for ${product.name}${variantDisplay}: ${originalStock} → ${product.stock}`);
          }
        }
      } catch (stockError: any) {
        console.error("❌ Stock deduction failed, rolling back changes:", stockError);
        
        // Rollback stock changes
        for (const change of stockChanges) {
          try {
            await Product.findByIdAndUpdate(change.productId, {
              stock: change.originalStock,
              salesCount: change.originalSalesCount
            });
          } catch (rollbackError) {
            console.error(`❌ Failed to rollback stock for ${change.productId}:`, rollbackError);
          }
        }
        
        throw new ValidationError(`Stock deduction failed: ${stockError.message}`);
      }
    }

    // 🔧 FIX 11: Enhanced order creation with better validation
    const orderData = {
      userId: userId,
      items: processedItems,
      addressId: address._id,
      totalAmount: parseFloat(totalAmount.toFixed(2)), // Ensure proper decimal handling
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
      orderStatus: paymentMethod === "COD" ? "CONFIRMED" : "PENDING",
      orderMetadata: {
        hasVariants: processedItems.some(item => item.size || item.color),
        itemCount: processedItems.length,
        totalItems: processedItems.reduce((sum, item) => sum + item.quantity, 0),
        createdFromCheckout: true
      }
    };

    console.log("📝 Creating order with data:", JSON.stringify(orderData, null, 2));

    let order;
    try {
      order = await Order.create(orderData);
      console.log("✅ Order created successfully:", order._id);
    } catch (orderCreationError: any) {
      console.error("❌ Order creation failed:", orderCreationError);
      
      // If COD order creation fails, rollback stock changes
      if (paymentMethod === "COD") {
        console.log("🔄 Rollback: Restoring stock due to order creation failure");
        for (const item of processedItems) {
          try {
            const product = await Product.findById(item.productId);
            if (product) {
              product.stock += item.quantity;
              if (product.salesCount >= item.quantity) {
                product.salesCount -= item.quantity;
              }
              await product.save();
            }
          } catch (rollbackError) {
            console.error(`❌ Failed to rollback stock for ${item.productId}:`, rollbackError);
          }
        }
      }
      
      throw new ValidationError(`Failed to create order: ${orderCreationError.message}`);
    }
    
    // 🔧 FIX 12: Better population with error handling
    let populatedOrder;
    try {
      populatedOrder = await Order.findById(order._id)
        .populate("addressId")
        .populate({
          path: "items.productId",
          select: "name price discount image description"
        });
      
      if (!populatedOrder) {
        throw new Error("Failed to populate order data");
      }
      
    } catch (populationError) {
      console.error("❌ Failed to populate order:", populationError);
      // Order was created but population failed - still return success
      populatedOrder = order;
    }
    
    console.log("✅ Order creation completed successfully:", {
      orderId: order._id,
      userId: userId,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      itemsWithVariants: processedItems.filter(item => item.size || item.color).length
    });
    
    // 🔧 FIX 13: Consistent response structure
    res.status(201).json({ 
      success: true,
      message: "Order created successfully", 
      orderId: order._id,
      totalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      orderStatus: order.orderStatus,
      order: populatedOrder
    });
    
  } catch (error: any) {
    console.error("❌ Error creating order:", {
      message: error.message,
      stack: error.stack,
      userId: req?.body?.userId,
      orderData: req?.body
    });
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

    const orders = await Order.find({ userId: userId })
      .populate({
        path: "items.productId",
        model: "Product", 
        select: "name price discount image description"
      })
      .populate("addressId")
      .sort({ createdAt: -1 });
    
    console.log(`📊 Found ${orders.length} orders for user ${userId}`);
    
    // 🔧 NEW: Add user info to all user orders (for consistency)
    if (orders.length > 0) {
      const userInfo = await getUserFromClerk(userId);
      
      const ordersWithUserInfo = orders.map(order => ({
        ...order.toObject(),
        userInfo
      }));
      
      res.status(200).json({
        success: true,
        orders: ordersWithUserInfo,
        count: ordersWithUserInfo.length
      });
    } else {
      res.status(200).json({
        success: true,
        orders: [],
        count: 0
      });
    }
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
    
    // Check if user owns this order
    if (order.userId !== userId) {
      throw new UnauthorizedError("Unauthorized to access this order");
    }
    
    // 🔧 NEW: Add user info even for customer's own order
    console.log(`📦 Adding user info to customer's order: ${userId}`);
    const userInfo = await getUserFromClerk(userId);
    
    const orderWithUserInfo = {
      ...order.toObject(),
      userInfo
    };
    
    res.status(200).json({
      success: true,
      order: orderWithUserInfo
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
    
    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        orders: [],
        count: 0,
        message: "No orders found"
      });
    }

    // 🔧 OPTIMIZATION: Get unique user IDs to avoid duplicate API calls
    const uniqueUserIds = Array.from(new Set(orders.map(order => order.userId)));
    console.log(`👥 Found ${uniqueUserIds.length} unique users for ${orders.length} orders`);

    // 🔧 OPTIMIZATION: Create a user cache to store Clerk responses
    const userCache = new Map();

    // 🔧 OPTIMIZATION: Fetch user info with controlled concurrency (max 5 at a time)
    const BATCH_SIZE = 5;
    for (let i = 0; i < uniqueUserIds.length; i += BATCH_SIZE) {
      const batch = uniqueUserIds.slice(i, i + BATCH_SIZE);
      
      const userPromises = batch.map(async (userId) => {
        if (userCache.has(userId)) {
          return { userId, userData: userCache.get(userId) };
        }

        try {
          const userData = await getUserFromClerk(userId);
          userCache.set(userId, userData);
          return { userId, userData };
        } catch (error) {
          console.error(`❌ Failed to fetch user ${userId}:`, (error as any)?.message || error);
          const fallbackUserData = {
            id: userId,
            firstName: 'Error',
            lastName: 'Loading',
            email: 'Failed to load from Clerk',
            fullName: 'Error Loading User',
            imageUrl: null,
            isClerkError: true,
            errorReason: (error as any)?.message || 'Unknown error'
          };
          userCache.set(userId, fallbackUserData);
          return { userId, userData: fallbackUserData };
        }
      });

      // Process batch and wait before next batch
      const batchResults = await Promise.allSettled(userPromises);
      
      // Log batch results
      const successful = batchResults.filter(r => r.status === 'fulfilled').length;
      const failed = batchResults.filter(r => r.status === 'rejected').length;
      console.log(`📋 Batch ${Math.floor(i/BATCH_SIZE) + 1}: ${successful} successful, ${failed} failed`);

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < uniqueUserIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`✅ User cache populated with ${userCache.size} users`);

    // 🔧 MAP ORDERS WITH CACHED USER DATA
    const ordersWithUserInfo = orders.map(order => {
      const userInfo = userCache.get(order.userId) || {
        id: order.userId,
        firstName: 'Unknown',
        lastName: 'User',
        email: 'User info not available',
        fullName: 'Unknown User',
        imageUrl: null,
        isClerkError: true,
        errorReason: 'Not found in cache'
      };

      return {
        ...order.toObject(),
        userInfo
      };
    });

    // 🔧 LOG SUMMARY STATISTICS
    const errorCount = ordersWithUserInfo.filter(order => order.userInfo.isClerkError).length;
    const successCount = ordersWithUserInfo.length - errorCount;
    
    console.log(`📊 Final Results:`, {
      totalOrders: ordersWithUserInfo.length,
      uniqueUsers: uniqueUserIds.length,
      successfulUserFetches: successCount,
      erroredUserFetches: errorCount,
      cacheHitRate: `${Math.round((successCount / ordersWithUserInfo.length) * 100)}%`
    });
    
    res.status(200).json({
      success: true,
      orders: ordersWithUserInfo,
      count: ordersWithUserInfo.length,
      meta: {
        uniqueUsers: uniqueUserIds.length,
        userFetchSuccess: successCount,
        userFetchErrors: errorCount
      },
      message: "Orders retrieved successfully with user information"
    });
    
  } catch (error) {
    console.error("❌ Error getting all orders:", error);
    next(error);
  }
};


// ========== ADMIN: GET ORDER BY ID WITH USER INFO ==========
const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderId = req.params.id;
    
    console.log(`🔍 Admin fetching order: ${orderId}`);
    
    if (!orderId || orderId === 'undefined' || orderId === 'null') {
      throw new ValidationError("Valid order ID is required");
    }
    
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ValidationError("Invalid order ID format");
    }
    
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
    
    console.log(`📦 Order found, fetching user info for: ${order.userId}`);
    
    // 🔧 FETCH USER INFO FROM CLERK
    const userInfo = await getUserFromClerk(order.userId);
    
    const orderWithUserInfo = {
      ...order.toObject(),
      userInfo // Add user info from Clerk
    };
    
    console.log(`✅ Order with user info prepared:`, {
      orderId: order._id,
      userId: order.userId,
      userInfo: {
        name: userInfo.fullName,
        email: userInfo.email,
        isClerkError: userInfo.isClerkError
      }
    });
    
    res.status(200).json({
      success: true,
      order: orderWithUserInfo,
      message: "Order retrieved successfully with user information"
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
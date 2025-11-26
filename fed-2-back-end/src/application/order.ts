import { Request, Response, NextFunction } from "express";
import Order from "../infrastructure/db/entities/Order";
import Address from "../infrastructure/db/entities/Address";
import Product from "../infrastructure/db/entities/Product";
import Cart from "../infrastructure/db/entities/Cart";
import NotFoundError from "../domain/errors/not-found-error";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import ValidationError from "../domain/errors/validation-error";
import { getAuth, clerkClient } from "@clerk/express";

// Helper to get user info from Clerk
const getUserFromClerk = async (userId: string) => {
  try {
    if (!userId || userId.trim() === '' || userId === 'undefined' || userId === 'null') {
      return {
        id: userId || 'unknown',
        firstName: 'Unknown',
        lastName: 'User',
        email: 'No email available',
        imageUrl: null,
        fullName: 'Unknown User',
        createdAt: null,
        isClerkError: true
      };
    }

    if (!clerkClient) {
      console.error('❌ Clerk client is not initialized');
      throw new Error('Clerk client not configured');
    }

    const user = await clerkClient.users.getUser(userId);

    let userEmail = 'No email available';
    if (user.emailAddresses && user.emailAddresses.length > 0) {
      const primaryEmail = user.emailAddresses.find(email => email.id === user.primaryEmailAddressId);
      userEmail = primaryEmail ? primaryEmail.emailAddress : user.emailAddresses[0].emailAddress;
    }

    return {
      id: user.id,
      firstName: user.firstName || 'Unknown',
      lastName: user.lastName || 'User',
      email: userEmail,
      imageUrl: user.imageUrl,
      fullName: `${user.firstName || 'Unknown'} ${user.lastName || 'User'}`.trim(),
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      updatedAt: user.updatedAt,
      username: user.username || null,
      phoneNumbers: user.phoneNumbers || [],
    };
  } catch (error) {
    console.error("❌ Error getting user info from Clerk:", error);
    return {
      id: userId,
      firstName: 'Unknown',
      lastName: 'User',
      email: 'No email available',
      imageUrl: null,
      fullName: 'Unknown User',
      createdAt: null,
      isClerkError: true
    };
  }
};

const getUserId = (req: Request): string => {
  const { userId } = getAuth(req);
  if (!userId) {
    throw new UnauthorizedError("User not authenticated");
  }
  return userId;
};

// Create Order
const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { addressId, paymentMethod, items, totalAmount } = req.body;

    // console.log('📝 Creating order:', { userId, addressId, paymentMethod, itemsCount: items?.length });

    // Validate Address
    const address = await Address.findById(addressId);
    if (!address) {
      throw new NotFoundError("Address not found");
    }

    // Validate Items and Stock
    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new NotFoundError(`Product not found: ${item.productId}`);
      }
      if (product.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for ${product.name}`);
      }

      // Deduct stock immediately for COD or reserve it? 
      // Usually deduct on payment, but for simplicity let's deduct on order creation for now, 
      // or handle it in payment status update.
      // Let's deduct stock here to prevent overselling.
      product.stock -= item.quantity;
      product.salesCount = (product.salesCount || 0) + item.quantity;
      await product.save();

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
        size: item.size,
        color: item.color
      });
      calculatedTotal += product.price * item.quantity; // Should use finalPrice if available
    }

    const order = await Order.create({
      userId,
      items: orderItems,
      addressId,
      paymentMethod,
      totalAmount: calculatedTotal,
      orderStatus: "PENDING",
      paymentStatus: "PENDING"
    });

    // Clear Cart
    await Cart.findOneAndUpdate({ userId }, { items: [], totalItems: 0, totalAmount: 0 });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    next(error);
  }
};

// Get User Orders
const getUserOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const orders = await Order.find({ userId }).sort({ createdAt: -1 })
      .populate("items.productId")
      .populate("addressId");

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("❌ Error getting user orders:", error);
    next(error);
  }
};

// Get Single Order (User)
const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId })
      .populate("items.productId")
      .populate("addressId");

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error("❌ Error getting order:", error);
    next(error);
  }
};

// Get All Orders (Admin)
const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 })
      .populate("items.productId")
      .populate("addressId");

    // Enrich with user info
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const userInfo = await getUserFromClerk(order.userId);
      return {
        ...order.toObject(),
        user: userInfo
      };
    }));

    res.json({
      success: true,
      orders: enrichedOrders
    });
  } catch (error) {
    console.error("❌ Error getting all orders:", error);
    next(error);
  }
};

// Get Order By ID (Admin)
const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate("items.productId")
      .populate("addressId");

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const userInfo = await getUserFromClerk(order.userId);

    res.json({
      success: true,
      order: {
        ...order.toObject(),
        user: userInfo
      }
    });
  } catch (error) {
    console.error("❌ Error getting order by ID:", error);
    next(error);
  }
};

// Update Order Status (Admin)
const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true }
    ).populate("items.productId").populate("addressId");

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    res.json({
      success: true,
      message: "Order status updated",
      order
    });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    next(error);
  }
};

// Update Payment Status (Admin)
const updatePaymentStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    const { paymentStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus },
      { new: true }
    ).populate("items.productId").populate("addressId");

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    res.json({
      success: true,
      message: "Payment status updated",
      order
    });
  } catch (error) {
    console.error("❌ Error updating payment status:", error);
    next(error);
  }
};

// Cancel Order (User)
const cancelOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId });
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.orderStatus !== "PENDING" && order.orderStatus !== "CONFIRMED") {
      throw new ValidationError("Cannot cancel order in current status");
    }

    order.orderStatus = "CANCELLED";
    // Restore stock logic should be here if we deducted it
    // For now, simple status update
    await order.save();

    res.json({
      success: true,
      message: "Order cancelled",
      order
    });
  } catch (error) {
    console.error("❌ Error cancelling order:", error);
    next(error);
  }
};

// Update Order Status After Payment (Webhook/Callback)
const updateOrderStatusAfterPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = req.params;
    // Assuming this is called after successful payment
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: "PAID", orderStatus: "CONFIRMED" },
      { new: true }
    );

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    res.json({
      success: true,
      message: "Order payment confirmed",
      order
    });
  } catch (error) {
    console.error("❌ Error updating order after payment:", error);
    next(error);
  }
};

export {
  createOrder,
  getUserOrders,
  getOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  updateOrderStatusAfterPayment
};
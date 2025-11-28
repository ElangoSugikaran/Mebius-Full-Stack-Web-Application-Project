// 🔧 FIXED: Order Routes - Proper separation and correct route order
// File: src/api/routes/order.ts (or wherever your order routes are defined)

import express from "express";
import { 
  createOrder, 
  getOrder, 
  getUserOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
  updateOrderStatusAfterPayment
} from "../application/order"; 
import { isAuthenticated } from "../api/middleware/authentication-middleware";
import { isAdmin } from "../api/middleware/authorization-middleware";

export const orderRouter = express.Router();

// 🔧 CRITICAL: Admin routes MUST come first to avoid conflicts!
// Otherwise /:id catches "admin" as an ID parameter

// ====== ADMIN ROUTES (Protected) ======
// 🔍 GET /api/orders/admin/all - Get all orders with user info
orderRouter.route("/admin/all")
  .get(isAuthenticated, isAdmin, getAllOrders);

// 🔍 GET /api/orders/admin/:id - Get specific order by ID with user info  
orderRouter.route("/admin/:id")
  .get(isAuthenticated, isAdmin, getOrderById);

// 🔄 PUT /api/orders/admin/:orderId/status - Update order status
orderRouter.route("/admin/:orderId/status")
  .put(isAuthenticated, isAdmin, updateOrderStatus);

// 💳 PUT /api/orders/admin/:orderId/payment - Update payment status
orderRouter.route("/admin/:orderId/payment")
  .put(isAuthenticated, isAdmin, updatePaymentStatus);

// ====== WEBHOOK ROUTES (No auth needed - Stripe/payment provider authenticates) ======
// 🔄 PUT /api/orders/:orderId/webhook-update - Webhook status update
orderRouter.route("/:orderId/webhook-update")
  .put(updateOrderStatus);

// 🔄 PUT /api/orders/:orderId/payment-complete - Customer payment completion
// orderRouter.route("/:orderId/payment-complete")
//   .put(isAuthenticated, updateOrderStatusAfterPayment);

// ====== CUSTOMER ROUTES (Authenticated Users) ======
// 📝 POST /api/orders - Create new order
// 📋 GET /api/orders - Get user's orders with user info
orderRouter.route("/")
  .post(isAuthenticated, createOrder)
  .get(isAuthenticated, getUserOrders);

// 🚫 PUT /api/orders/:id/cancel - Customer cancel order
orderRouter.route("/:id/cancel")
  .put(isAuthenticated, cancelOrder);

// 🔍 GET /api/orders/:id - Get single order with user info
// 🔧 IMPORTANT: This MUST be last because it catches any /:id
orderRouter.route("/:id")
  .get(isAuthenticated, getOrder);

// Specific routes first
orderRouter.route("/:orderId/payment-complete")
  .put(isAuthenticated, updateOrderStatusAfterPayment);

orderRouter.route("/:id/cancel")
  .put(isAuthenticated, cancelOrder);

// Generic /:id route LAST
orderRouter.route("/:id")
  .get(isAuthenticated, getOrder);

// 🔧 Add debugging middleware to log all requests
if (process.env.NODE_ENV === 'development') {
  orderRouter.use((req, res, next) => {
    console.log(`📍 Order Route: ${req.method} ${req.path}`, {
      params: req.params,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined
    });
    next();
  });
}

export default orderRouter;
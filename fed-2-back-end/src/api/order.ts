// 🔧 FIXED: Order Routes - Proper separation of admin and customer routes
// File: src/api/order.ts (or wherever your order routes are defined)

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
  updateOrderStatusAfterPayment  // 🔧 NEW: Import the new function
} from "../application/order"; 
import { isAuthenticated } from "../api/middleware/authentication-middleware";
import { isAdmin } from "../api/middleware/authorization-middleware";

export const orderRouter = express.Router();

// 🔧 CRITICAL: Admin routes MUST come first!
// Otherwise /:id catches "admin" as an ID parameter

// ====== ADMIN ROUTES (Protected) ======
orderRouter.route("/admin/all")
  .get(isAuthenticated, isAdmin, getAllOrders);      // GET /api/orders/admin/all

orderRouter.route("/admin/:id")
  .get(isAuthenticated, isAdmin, getOrderById);      // GET /api/orders/admin/:id

orderRouter.route("/admin/:orderId/status")
  .put(isAuthenticated, isAdmin, updateOrderStatus); // PUT /api/orders/admin/:id/status

orderRouter.route("/admin/:orderId/payment")
  .put(isAuthenticated, isAdmin, updatePaymentStatus); // PUT /api/orders/admin/:id/payment

// ====== WEBHOOK ROUTES (No auth needed - Stripe authenticates) ======
orderRouter.route("/:orderId/webhook-update")
  .put(updateOrderStatus);                  // PUT /api/orders/:id/webhook-update

// 🔧 NEW: Payment completion endpoint for customers (after successful payment)
orderRouter.route("/:orderId/payment-complete")
  .put(isAuthenticated, updateOrderStatusAfterPayment); // PUT /api/orders/:id/payment-complete

// ====== CUSTOMER ROUTES (Authenticated Users) ======
orderRouter.route("/")
  .post(isAuthenticated, createOrder)       // POST /api/orders - Create new order
  .get(isAuthenticated, getUserOrders);     // GET /api/orders - Get user's orders

orderRouter.route("/:id/cancel")
  .put(isAuthenticated, cancelOrder);       // PUT /api/orders/:id/cancel - Customer cancel

// 🔧 IMPORTANT: This MUST be last because it catches any /:id
orderRouter.route("/:id")
  .get(isAuthenticated, getOrder);          // GET /api/orders/:id - Get single order

export default orderRouter;
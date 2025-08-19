// 🔧 FIXED: Customer Routes - Support both MongoDB ID and Clerk ID lookups
// File: src/api/customer.ts (or wherever your customer routes are)

import express from "express";
import { 
  syncCurrentUser, 
  getAllCustomers, 
  getCustomerById,
  getCustomerByClerkId  // 🔧 NEW: Import the new function
} from "../application/customer";
import { isAuthenticated } from "../api/middleware/authentication-middleware";
import { isAdmin } from "../api/middleware/authorization-middleware";

export const customerRouter = express.Router();

// Customer routes - auto sync when user makes any request
customerRouter.route("/sync")
  .post(isAuthenticated, syncCurrentUser);

// Admin routes
customerRouter.route("/admin/all")
  .get(isAuthenticated, isAdmin, getAllCustomers);

// 🔧 NEW: Specific endpoint for Clerk ID lookup
customerRouter.route("/admin/clerk/:clerkId")
  .get(isAuthenticated, isAdmin, getCustomerByClerkId);

// 🔧 ENHANCED: This now supports both MongoDB ObjectId and Clerk user ID
customerRouter.route("/admin/:id")
  .get(isAuthenticated, isAdmin, getCustomerById);

export default customerRouter;
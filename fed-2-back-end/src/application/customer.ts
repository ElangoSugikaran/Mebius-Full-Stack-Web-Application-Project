// 🔧 FIXED: Customer Controller - Support both MongoDB ID and Clerk ID lookups
// File: src/application/customer.ts

import { Request, Response, NextFunction } from "express";
import Customer from "../infrastructure/db/entities/Customer";
import { syncClerkUserToDatabase } from "../infrastructure/clerk";
import { getAuth } from "@clerk/express";
import NotFoundError from "../domain/errors/not-found-error";
import UnauthorizedError from "../domain/errors/unauthorized-error";

// Sync current user from Clerk
const syncCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }
    
    const customer = await syncClerkUserToDatabase(userId);
    
    if (!customer) {
      throw new NotFoundError("Failed to sync user data");
    }
    
    res.status(200).json({
      success: true,
      message: "User synced successfully",
      customer
    });
    
  } catch (error) {
    console.error("❌ Error syncing current user:", error);
    next(error);
  }
};

// Get all customers (Admin only)
const getAllCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await Customer.find()
      .sort({ lastLoginAt: -1 });
    
    res.status(200).json({
      success: true,
      customers,
      count: customers.length
    });
  } catch (error) {
    console.error("❌ Error getting customers:", error);
    next(error);
  }
};

// 🔧 FIXED: Get single customer - Support both MongoDB ID and Clerk ID
const getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    console.log(`🔍 Looking up customer with ID: ${id}`);
    
    let customer = null;
    
    // 🔧 Check if it's a MongoDB ObjectId (24 hex characters)
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log("📋 Searching by MongoDB ObjectId");
      customer = await Customer.findById(id);
    } 
    // 🔧 Otherwise, assume it's a Clerk user ID
    else {
      console.log("🔍 Searching by Clerk user ID");
      customer = await Customer.findOne({ clerkId: id });
      
      // 🔧 If not found, try to sync from Clerk
      if (!customer) {
        console.log("🔄 Customer not found, attempting to sync from Clerk...");
        try {
          customer = await syncClerkUserToDatabase(id);
          if (customer) {
            console.log("✅ Successfully synced customer from Clerk");
          }
        } catch (syncError) {
          console.error("❌ Failed to sync from Clerk:", syncError);
          // Continue to return not found error below
        }
      }
    }
    
    if (!customer) {
      throw new NotFoundError(`Customer not found with ID: ${id}`);
    }
    
    console.log(`✅ Customer found: ${customer.firstName} ${customer.lastName}`);
    
    res.status(200).json({
      success: true,
      data: customer,  // 🔧 Use 'data' for consistency with frontend
      customer: customer // 🔧 Also provide 'customer' for backwards compatibility
    });
  } catch (error) {
    console.error("❌ Error getting customer:", error);
    next(error);
  }
};

// 🔧 NEW: Get customer by Clerk ID specifically (alternative endpoint)
const getCustomerByClerkId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clerkId } = req.params;
    
    console.log(`🔍 Looking up customer with Clerk ID: ${clerkId}`);
    
    let customer = await Customer.findOne({ clerkId });
    
    // If not found, try to sync from Clerk
    if (!customer) {
      console.log("🔄 Customer not found, attempting to sync from Clerk...");
      try {
        customer = await syncClerkUserToDatabase(clerkId);
        if (customer) {
          console.log("✅ Successfully synced customer from Clerk");
        }
      } catch (syncError) {
        console.error("❌ Failed to sync from Clerk:", syncError);
      }
    }
    
    if (!customer) {
      throw new NotFoundError(`Customer not found with Clerk ID: ${clerkId}`);
    }
    
    res.status(200).json({
      success: true,
      data: customer,
      customer: customer
    });
  } catch (error) {
    console.error("❌ Error getting customer by Clerk ID:", error);
    next(error);
  }
};

export { 
  syncCurrentUser, 
  getAllCustomers, 
  getCustomerById,
  getCustomerByClerkId  // 🔧 NEW: Export the new function
};
import { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { syncClerkUserToDatabase } from "../../infrastructure/clerk";

// Middleware to automatically sync user data on each request
export const autoSyncUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req);
    
    if (userId) {
      // Sync user data in background (don't block the request)
      syncClerkUserToDatabase(userId).catch(error => {
        console.error("Background user sync failed:", error);
      });
    }
    
    next();
  } catch (error) {
    // Don't block the request if sync fails
    console.error("Auto-sync middleware error:", error);
    next();
  }
};
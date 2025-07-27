import UnauthorizedError from "../../domain/errors/unauthorized-error";
import { Request, Response, NextFunction } from 'express';
import { getAuth } from "@clerk/express"; // Import Clerk's getAuth function to access user authentication data

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req?.auth) { // ← SOLUTION: Check actual Clerk auth data
    throw new UnauthorizedError("Unauthorized");
  }
  // console.log(req.auth());
  // console.log(getAuth(req)); // Log the authentication data for debugging
  next();
};

export { isAuthenticated };
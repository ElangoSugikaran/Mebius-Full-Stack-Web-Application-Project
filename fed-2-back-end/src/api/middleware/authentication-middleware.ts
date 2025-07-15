import UnauthorizedError from "../../domain/errors/unauthorized-error";
import { Request, Response, NextFunction } from 'express';

// Middleware to check if the user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    const isUserLoggedIn = false; // Replace with actual authentication logic
    if (!isUserLoggedIn) {
        // Throw custom error if not authenticated
        throw new UnauthorizedError('User is not authenticated');
    } else {
        next();
    }
};

export { isAuthenticated };
import { Request, Response, NextFunction } from 'express';
import { getAuth } from "@clerk/express"; // Import Clerk's getAuth function to access user authentication data
import ForbiddenError from '../../domain/errors/forbidden-error'; // Import the ForbiddenError class

const isAdmin = (req: Request, res: Response, next: NextFunction) => {

    const auth = getAuth(req); // Get the authentication data from the request
   
    const userIsAdmin = auth.sessionClaims?.metadata?.role === 'admin'; // Check if the user has an admin role
    // console.log(userIsAdmin);
    if (!userIsAdmin) {
        throw new ForbiddenError("Forbidden: Admin access required");
    }
   
    next();

};

export { isAdmin };
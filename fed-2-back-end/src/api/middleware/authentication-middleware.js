import UnauthorizedError from "../../domain/errors/unauthorized-error.js";

// Middleware to check if the user is authenticated
const isAuthenticated = (req, res, next) => {
    const isUserLoggedIn = false; // Replace with actual authentication logic
    if (!isUserLoggedIn) {
        // Throw custom error if not authenticated
        throw new UnauthorizedError('User is not authenticated');
    } else {
        next();
    }
};

export { isAuthenticated };
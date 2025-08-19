import ValidationError from "../../domain/errors/validation-error";
import NotFoundError from "../../domain/errors/not-found-error";
import UnauthorizedError from "../../domain/errors/unauthorized-error";

import { Request, Response, NextFunction } from 'express';

const globalErrorHandlingMiddleware = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  // Log the error for debugging purposes
  console.error(err);
  if (err instanceof ValidationError) {
    // Handle validation errors
    res.status(400).json({ message: err.message });
  } else if (err instanceof NotFoundError) {
    // Handle not found errors
    res.status(404).json({ message: err.message });
  } else if (err instanceof UnauthorizedError) {
    // Handle unauthorized errors
    res.status(401).json({ message: err.message });
  } else {
    // Handle other errors
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export default globalErrorHandlingMiddleware;
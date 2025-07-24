import { Request, Response, NextFunction } from "express";
import Order from "../infrastructure/db/entities/Order"; 
import Address from "../infrastructure/db/entities/Address";
import NotFoundError from "../domain/errors/not-found-error";
import UnauthorizedError from "../domain/errors/unauthorized-error";
import { getAuth } from "@clerk/express"; // Import Clerk's getAuth function to access user authentication data

// const createOrder = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const data = req.body;
//     const userId = "123";

//     const address = await Address.create(data.shippingAddress);
//     await Order.create({
//       addressId: address._id,
//       items: data.orderItems,
//       userId: userId
//     });
//     res.status(201).send();
//   } catch (error) {
//     next(error);
//   }
// };

// const getOrder = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const userId = "123"; 
//         const orderId = req.params.id;
//         const order = await Order.findById(orderId).populate("addressId");
//         if (!order) {
//             throw new NotFoundError("Order not found");
//         }
//         if (order.userId !== userId) {
//             throw new UnauthorizedError("unauthorized to access this order");
//         }
//         res.status(200).json(order);
//     } catch (error) {
//         next(error);
//     }
// };

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const { userId } = getAuth(req); // ← SOLUTION: Get real user ID from Clerk
    
    const address = await Address.create(data.shippingAddress);
    await Order.create({
      addressId: address._id,
      items: data.orderItems,
      userId: userId, // ← Using real user ID
    });
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

const getOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = getAuth(req); // ← SOLUTION: Get real user ID
    
    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }
    
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate("addressId");
    
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    
    if (order.userId !== userId) { // ← Comparing with real user ID
      throw new UnauthorizedError("Unauthorized to access this order");
    }
    
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export { createOrder, getOrder };
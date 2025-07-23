import express from "express";
import { createOrder, getOrder } from "../application/order"; 
import { isAuthenticated } from "./middleware/authentication-middleware";

const orderRouter = express.Router();

orderRouter.route("/").post( isAuthenticated, createOrder);

orderRouter.route("/:id").get(getOrder);

export default orderRouter;
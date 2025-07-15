import express from "express";
import { createOrder, getOrder } from "../application/order"; 

const orderRouter = express.Router();

orderRouter.route("/").post(createOrder);

orderRouter.route("/:id").get(getOrder);

export default orderRouter;
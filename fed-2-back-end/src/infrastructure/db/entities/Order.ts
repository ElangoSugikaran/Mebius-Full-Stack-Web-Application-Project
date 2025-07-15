import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    items: {
        type: [itemSchema],
        required: true
    },
    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true
    },
    orderStatus: {
        type: String,
        enum: ["PENDING", "SHIPPED", "FULFILLED", "CANCELLED"],
        default: "PENDING"
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "CREDIT_CARD"],
        default: "CREDIT_CARD",
    },
    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "REFUNDED"],
        default: "PENDING"
    }

});

const Order = mongoose.model("Order", orderSchema);

export default Order;

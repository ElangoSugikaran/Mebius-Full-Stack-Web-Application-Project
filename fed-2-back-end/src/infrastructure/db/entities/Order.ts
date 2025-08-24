import mongoose from "mongoose";

// Order item schema
const itemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    size: {
        type: String,
        required: false,
        trim: true,
    },
    color: {
        type: String,
        required: false
    },
});

// Order schema
const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
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
        enum: ["PENDING", "CONFIRMED", "SHIPPED", "FULFILLED", "CANCELLED"],
        default: "PENDING"
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "CREDIT_CARD"],
        default: "CREDIT_CARD"
    },
    paymentStatus: {
        type: String,
        enum: ["PENDING", "PAID", "REFUNDED"],
        default: "PENDING"
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

// Index for finding user's orders
orderSchema.index({ userId: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
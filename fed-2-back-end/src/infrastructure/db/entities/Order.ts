// 🔧 FIXED: Order Schema with correct enum values
import mongoose, { Document, Schema } from "mongoose";

// TypeScript interfaces
interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

interface IOrder extends Document {
  userId: string;
  items: IOrderItem[];
  addressId: mongoose.Types.ObjectId;
  orderStatus: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'FULFILLED' | 'CANCELLED';
  paymentMethod: 'COD' | 'CREDIT_CARD';
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  totalAmount: number;
}

// Simple order item schema
const itemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
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
  }
});

// 🔧 FIXED: Updated order schema with CONFIRMED status
const orderSchema = new Schema({
  userId: {
    type: String,
    required: true
    // NO unique here, because many orders can have same userId
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: "Customer",
    required: false // Make optional for backwards compatibility
  },
  items: {
    type: [itemSchema],
    required: true
  },
  addressId: {
    type: Schema.Types.ObjectId,
    ref: "Address",
    required: true
  },
  orderStatus: {
    type: String,
    // 🔧 ADDED "CONFIRMED" to fix the validation error
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
  timestamps: true  // Adds createdAt and updatedAt automatically
});

// Only add the most important index for finding user's orders
orderSchema.index({ userId: 1, createdAt: -1 });

const Order = mongoose.model<IOrder>("Order", orderSchema);
export default Order;
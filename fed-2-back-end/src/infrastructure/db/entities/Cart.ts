import mongoose, { Document } from 'mongoose';

// This file defines the Cart entity schema for MongoDB using Mongoose.
// Following the same structure as Product.js

export interface ICartItem {
  productId: mongoose.Schema.Types.ObjectId;
  name: string;
  price: number;
  finalPrice: number; // Price after any discounts
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  stock: number; // Available stock for this product
}

export interface ICart extends Document {
  userId: string; // Clerk user ID
  items: ICartItem[];
  totalAmount: number; // Calculated total
  totalItems: number; // Total quantity of all items
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new mongoose.Schema<ICartItem>({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  finalPrice: {
    type: Number,
    required: true,
    min: [0, 'Final price cannot be negative']
  },
  image: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  size: {
    type: String,
    required: false
  },
  color: {
    type: String,
    required: false
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative']
  }
});

const cartSchema = new mongoose.Schema<ICart>({
  userId: {
    type: String,
    required: true,
    unique: true, // One cart per user
    index: true
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
    min: [0, 'Total amount cannot be negative']
  },
  totalItems: {
    type: Number,
    default: 0,
    min: [0, 'Total items cannot be negative']
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt
});

// Pre-save middleware to calculate totals (similar to Product's finalPrice calculation)
cartSchema.pre('save', function(next) {
  // Calculate total items
  this.totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
  
  // Calculate total amount using finalPrice (discounted price)
  this.totalAmount = this.items.reduce((total, item) => total + (item.finalPrice * item.quantity), 0);
  
  next();
});

// Virtual for checking if cart is empty
cartSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

// Index for better query performance
// cartSchema.index({ userId: 1 });
// cartSchema.index({ 'items.productId': 1 });

const Cart = mongoose.model<ICart>('Cart', cartSchema);

export default Cart;
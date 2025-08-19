import mongoose, { Document, Schema } from "mongoose";

interface ICustomer extends Document {
  clerkId: string; // Clerk user ID
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string;
  isActive: boolean;
  lastLoginAt: Date;
}

const customerSchema = new Schema({
  clerkId: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  imageUrl: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Customer = mongoose.model<ICustomer>("Customer", customerSchema);
export default Customer;
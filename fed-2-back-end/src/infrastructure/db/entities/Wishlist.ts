// 🔧 FIXED: Proper Wishlist entity following Cart structure
import mongoose, { Document, Schema } from 'mongoose';

export interface IWishlistItem {
  productId: mongoose.Schema.Types.ObjectId; // ✅ Use ObjectId like Cart
  name: string;
  price: number;
  finalPrice: number; // ✅ Add finalPrice like Cart
  image: string;
  inStock: boolean;
  addedAt: Date;
}

export interface IWishlist extends Document {
  userId: string; // Clerk user ID
  items: IWishlistItem[];
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

const wishlistItemSchema = new Schema<IWishlistItem>({
  productId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // ✅ Add ref like Cart
    required: true 
  },
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  finalPrice: { type: Number, required: true, min: 0 }, // ✅ Add finalPrice
  image: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  addedAt: { type: Date, default: Date.now }
});

const wishlistSchema = new Schema<IWishlist>({
  userId: { 
    type: String, 
    required: true, 
    unique: true, // ✅ One wishlist per user like Cart
    index: true 
  },
  items: [wishlistItemSchema],
  totalItems: { type: Number, default: 0 }
}, {
  timestamps: true // ✅ Add timestamps like Cart
});

// ✅ Pre-save middleware like Cart
wishlistSchema.pre('save', function() {
  this.totalItems = this.items.length;
});

// ✅ Virtual for checking if empty like Cart
wishlistSchema.virtual('isEmpty').get(function() {
  return this.items.length === 0;
});

const Wishlist = mongoose.model<IWishlist>('Wishlist', wishlistSchema);
export default Wishlist;
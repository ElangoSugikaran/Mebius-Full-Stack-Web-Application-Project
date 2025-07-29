import mongoose from 'mongoose';

// This file defines the Product entity schema for MongoDB using Mongoose.
// Import Mongoose for MongoDB object modeling

const productSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
    index: true // Add index for faster queries
  },
  name: {
    type: String,
    required: true,
    trim: true // Remove whitespace
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative']
  },
  image: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },

  sizes: {
    type: [String],
    required: true,
    validate: [(arr: string[]) => arr.length > 0, 'At least one size is required']
  },

  colors: {
    type: [String],
    required: true,
    validate: [(arr: string[]) => arr.length > 0, 'At least one color is required']
  },

  material: {
    type: String,
    required: true,
    trim: true
  },

  brand: {
    type: String,
    required: false,
    trim: true
  },
  
  gender: {
    type: String,
    required: true,
    enum: ['men', 'women', 'unisex', 'kids'], // Add enum validation
    lowercase: true
  },

  discount: {
    type: Number, // percentage: 10 means 10% off
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },

  finalPrice: {
    type: Number, // Store calculated final price after discount for faster querying
  },

  // NEW: Featured product flag for homepage/promotions
  isFeatured: {
    type: Boolean,
    default: false,
    index: true // Index for efficient featured product queries
  },

  // Additional fields for better product management
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  tags: {
    type: [String],
    default: []
  },

  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  // Sales tracking
  salesCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // Rating average (calculated from reviews)
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
    
  reviews: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Review',
    default: [],
  },
}, {
  timestamps: true // Automatically add createdAt and updatedAt
});

// Pre-save middleware to calculate finalPrice
productSchema.pre('save', function(next) {
  if (this.isModified('price') || this.isModified('discount')) {
    this.finalPrice = this.price * (1 - this.discount / 100);
  }
  next();
});

// Indexes for better query performance
productSchema.index({ name: 'text' }); // Text search
productSchema.index({ finalPrice: 1 }); // Price sorting
productSchema.index({ averageRating: -1 }); // Rating sorting
productSchema.index({ salesCount: -1 }); // Popularity sorting
productSchema.index({ createdAt: -1 }); // Latest products

// Virtual for checking if product is in stock
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Virtual for discount amount in currency
productSchema.virtual('discountAmount').get(function() {
  return this.price * (this.discount / 100);
});

const Product = mongoose.model('Product', productSchema);

export default Product;
import mongoose from 'mongoose';

// This file defines the Category entity schema for MongoDB using Mongoose.
// Import Mongoose for MongoDB object modeling

// const categorySchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true
//   },
// });

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true // No duplicate category names
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  image: {
    type: String, // Category image for display
    required: false
  }
}, {
  timestamps: true // Add createdAt and updatedAt
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
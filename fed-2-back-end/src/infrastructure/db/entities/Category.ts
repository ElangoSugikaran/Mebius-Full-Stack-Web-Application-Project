import mongoose from 'mongoose';

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
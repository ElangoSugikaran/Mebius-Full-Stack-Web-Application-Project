import mongoose from 'mongoose';

// This file defines the Category entity schema for MongoDB using Mongoose.
// Import Mongoose for MongoDB object modeling

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
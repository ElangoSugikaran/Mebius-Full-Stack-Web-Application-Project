import mongoose from 'mongoose';

// This file defines the Product entity schema for MongoDB using Mongoose.
// Import Mongoose for MongoDB object modeling

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
});

const Product = mongoose.model('Product', productSchema);

export default Product;
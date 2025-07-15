import mongoose from 'mongoose';

// This file defines the Product entity schema for MongoDB using Mongoose.
// Import Mongoose for MongoDB object modeling

const productSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
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
  stock: {
    type: Number,
    required: true
  },
  reviews: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Review',
    default: [],
  },
});

const Product = mongoose.model('Product', productSchema);

export default Product;
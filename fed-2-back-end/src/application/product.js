// This module defines the routes for product-related operations in an Express application
// import { products } from '../data.js';
import Product from '../infrastructure/db/entities/product.js';
// Import the Product model from the database entities

const getAllProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

const getProductById = async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
};

const createProduct = async (req, res) => {
  // const { name, price, description, categoryId } = req.body;
  // if (!name || !price || !description || !categoryId) {
  //   return res.status(400).json({ message: 'All fields are required' });
  // }
  const newProduct = req.body;
  // Assuming req.body contains the new product data
  await Product.create(newProduct);
  // Create a new product in the database
  res.status(201).json(newProduct);
};

const updateProductById = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, categoryId, image } = req.body;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  product.name = name;
  product.price = price;
  product.description = description;
  product.category = categoryId;
  product.image = image;

  await product.save();

  res.status(200).json(product);
};

const deleteProductById = async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  await Product.deleteOne({ _id: id });
  res.status(200).json({ message: 'Product deleted successfully' });
};

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
};
// products.js
// This file contains the product-related logic for an Express application.
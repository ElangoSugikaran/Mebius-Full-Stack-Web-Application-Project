// This module defines the routes for product-related operations in an Express application
import { products } from '../data.js';

const getAllProducts = (req, res) => {
  res.json(products);
};

const getProductById = (req, res) => {
  const { id } = req.params;
  const product = products.find((p) => p._id === id);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  res.json(product);
};

const createProduct = (req, res) => {
  const { name, price, description, categoryId } = req.body;
  if (!name || !price || !description || !categoryId) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const newProduct = {
    _id: products.length + 1,
    name,
    price,
    description,
    categoryId,
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
};

const updateProductById = (req, res) => {
  const { id } = req.params;
  const { name, price, description, categoryId } = req.body;

  const productIndex = products.findIndex((p) => p._id === id);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  products[productIndex] = {
    ...products[productIndex],
    name,
    price,
    description,
    categoryId,
  };

  res.json(products[productIndex]);
};

const deleteProductById = (req, res) => {
  const { id } = req.params;

  const productIndex = products.findIndex((p) => p._id === id);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

  products.splice(productIndex, 1);
  res.json({ message: 'Product deleted successfully' });
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
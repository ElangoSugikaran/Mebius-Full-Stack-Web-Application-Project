// This module defines the routes for product-related operations in an Express application
import Product from '../infrastructure/db/entities/product.js';
// Import custom error classes for validation and not found errors
import ValidationError from "../domain/errors/validation-error.js";
import NotFoundError from "../domain/errors/not-found-error.js";

// Get all products, optionally filtered by categoryId
const getAllProducts = async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId;
    if (categoryId) {
      const products = await Product.find({ categoryId });
      return res.json(products);
    } else {
      const products = await Product.find();
      res.json(products);
    }
  } catch (error) {
    next(error);
  }
};

// Get a product by ID
const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Create a new product
const createProduct = async (req, res, next) => {
  try {
    const { name, price, description, categoryId, image } = req.body;
    if (!name || !price || !categoryId || !image) {
      throw new ValidationError('Name, price, categoryId, and image are required');
    }
    const createdProduct = await Product.create({ name, price, description, category: categoryId, image });
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// Update a product by ID
const updateProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, description, categoryId, image } = req.body;
    if (!name || !price || !categoryId || !image) {
      throw new ValidationError('Name, price, categoryId, and image are required');
    }
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    product.name = name;
    product.price = price;
    product.description = description;
    product.category = categoryId;
    product.image = image;
    await product.save();
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// Delete a product by ID
const deleteProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    await Product.deleteOne({ _id: id });
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById
};
// products.js
// This file contains the product-related logic for an Express application.
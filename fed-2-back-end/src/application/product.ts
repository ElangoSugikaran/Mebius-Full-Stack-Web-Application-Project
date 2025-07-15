// This module defines the routes for product-related operations in an Express application
import Product from '../infrastructure/db/entities/Product';
// Import custom error classes for validation and not found errors
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";
import { Request, Response, NextFunction } from "express";
import { createProductDTO } from '../domain/dto/product';

// Get all products, optionally filtered by categoryId
const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
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
const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate('reviews');
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    res.json(product);
  } catch (error) {
    next(error);
  }
};

// Create a new product
/**
 * Creates a new product after validating the request body.
 * Uses Zod schema (createProductDTO) for data validation.
 * Returns 201 status with created product on success.
 */
const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body against DTO schema
    const result = createProductDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Invalid product data');
    }

    // Create and save the product
    const createdProduct = await Product.create(result.data);
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};

// Update a product by ID
const updateProductById = async (req: Request, res: Response, next: NextFunction) => {
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
    // product.description = description;
    product.categoryId = categoryId;
    product.image = image;
    await product.save();
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// Delete a product by ID
const deleteProductById = async (req: Request, res: Response, next: NextFunction) => {
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
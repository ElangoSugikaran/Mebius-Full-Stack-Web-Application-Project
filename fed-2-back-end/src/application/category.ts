// This module defines the routes for category-related operations in an Express application
import Category from '../infrastructure/db/entities/Category'; // Import the Category entity
// Import custom error classes for validation and not found errors
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";

import { Request, Response, NextFunction } from "express";

// Get all categories
const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

// Get a category by ID
const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
};

// Create a new category
const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    if (!name) {
      throw new ValidationError('Name is required');
    }
    const newCategory = await Category.create({ name });
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};

// Update a category by ID
const updateCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      throw new ValidationError('Name is required');
    }
    const category = await Category.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    category.name = name;
    await category.save();
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

// Delete a category by ID
const deleteCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    await Category.deleteOne({ _id: id });
    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
};
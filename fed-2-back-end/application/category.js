// This module defines the routes for product-related operations in an Express application
import { categories } from '../data.js';

const getAllCategories = (req, res) => {
  res.json(categories);
};

const getCategoryById = (req, res) => {
  const { id } = req.params;
  const category = categories.find((c) => c._id === id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json(category);
};

const createCategory = (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const newCategory = {
    _id: (categories.length + 1).toString(),
    name,
  };

  categories.push(newCategory);
  res.status(201).json(newCategory);
};

const updateCategoryById = (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const categoryIndex = categories.findIndex((c) => c._id === id);
  if (categoryIndex === -1) {
    return res.status(404).json({ message: 'Category not found' });
  }

  categories[categoryIndex] = {
    ...categories[categoryIndex],
    name,
  };

  res.json(categories[categoryIndex]);
};

const deleteCategoryById = (req, res) => {
  const { id } = req.params;

  const categoryIndex = categories.findIndex((c) => c._id === id);
  if (categoryIndex === -1) {
    return res.status(404).json({ message: 'Category not found' });
  }

  categories.splice(categoryIndex, 1);
  res.json({ message: 'Category deleted successfully' });
};

export {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
};
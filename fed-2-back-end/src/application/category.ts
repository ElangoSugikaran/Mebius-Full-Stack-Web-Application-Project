// This module defines the routes for category-related operations in an Express application
import Category from '../infrastructure/db/entities/Category'; // Import the Category entity
// Import custom error classes for validation and not found errors
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";
import { randomUUID } from 'crypto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from '../infrastructure/s3';

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
// const createCategory = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { name } = req.body;
//     if (!name) {
//       throw new ValidationError('Name is required');
//     }
//     const newCategory = await Category.create({ name });
//     res.status(201).json(newCategory);
//   } catch (error) {
//     next(error);
//   }
// };

const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, isActive = true, image } = req.body;
    if (!name) {
      throw new ValidationError('Name is required');
    }
    
    const categoryData: any = { name, isActive };
    if (image) {
      categoryData.image = image;
    }
    
    const newCategory = await Category.create(categoryData);
    res.status(201).json(newCategory);
  } catch (error) {
    next(error);
  }
};

// Update a category by ID
// const updateCategoryById = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const { id } = req.params;
//     const { name } = req.body;
//     if (!name) {
//       throw new ValidationError('Name is required');
//     }
//     const category = await Category.findById(id);
//     if (!category) {
//       throw new NotFoundError('Category not found');
//     }
//     category.name = name;
//     await category.save();
//     res.status(200).json(category);
//   } catch (error) {
//     next(error);
//   }
// };

const updateCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, image, isActive } = req.body; // Accept all fields
    
    if (!name) {
      throw new ValidationError('Name is required');
    }
    
    const category = await Category.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }
    
    // Update all provided fields
    category.name = name;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;
    
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


// NEW: Generic upload for categories without ID (CREATE mode)
const uploadCategoryImageGeneric = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileType } = req.body;

    if (!fileType) {
      throw new NotFoundError('File type is required');
      //BadRequestError('File type is required');
    }

    const imageId = randomUUID();
    const publicURL = `${process.env.CLOUDFLARE_PUBLIC_DOMAIN}/${imageId}`;

    // Get signed URL for upload
    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: imageId,
        ContentType: fileType,
      }),
      { expiresIn: 60 }
    );

    // Return URLs without saving to database yet
    // The actual product will be created later with this image URL
    res.status(200).json({
      url,        // For uploading file
      publicURL   // For saving in product
    });
  } catch (error) {
    next(error);
  }
};

// EXISTING: Upload for specific product (EDIT mode)
const putCategoryImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { fileType } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    const imageId = randomUUID();
    const publicURL = `${process.env.CLOUDFLARE_PUBLIC_DOMAIN}/${imageId}`;

    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
        Key: imageId,
        ContentType: fileType,
      }),
      { expiresIn: 60 }
    );

    // Update category with new image URL
    category.image = publicURL;
    await category.save();

    res.status(200).json({
      url,
      publicURL,
      category
    });
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
  uploadCategoryImageGeneric, // Export the generic upload function
  putCategoryImage,           // Export the specific upload function
};
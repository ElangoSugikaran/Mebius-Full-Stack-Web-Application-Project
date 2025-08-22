import Product from '../infrastructure/db/entities/Product';
// Import custom error classes for validation and not found errors
import ValidationError from "../domain/errors/validation-error";
import NotFoundError from "../domain/errors/not-found-error";
import { Request, Response, NextFunction } from "express";
import { createProductDTO, updateProductDTO } from '../domain/dto/product';
import { randomUUID } from 'crypto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3 from '../infrastructure/s3';
import stripe from "../infrastructure/stripe";

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
    const product = await Product.findById(id)
      .populate('reviews')
      .populate('categoryId', 'name'); // Add this line to populate category
    
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

    const stripeProduct = await stripe.products.create({
      name: result.data.name,
      description: result.data.description,
      default_price_data: {
        currency: "usd",
        unit_amount: result.data.price * 100, // Convert to cents
      },
    });

    // Create product in your database with Stripe price ID
    const createdProduct = await Product.create({ 
      ...result.data, 
      stripePriceId: stripeProduct.default_price 
    });
    res.status(201).json(createdProduct);
      } catch (error) {
        next(error);
      }
    };

// Update a product by ID
const updateProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Combine URL param with request body for validation
    const dataToValidate = { ...req.body, id };
    
    // Validate against updateProductDTO schema
    const result = updateProductDTO.safeParse(dataToValidate);
    if (!result.success) {
      throw new ValidationError('Invalid product data');
    }

    // Extract update data (excluding id)
    const { id: _, ...updateData } = result.data;

    // Find product and update
    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Apply partial updates to existing product
    Object.assign(product, updateData);
    const updatedProduct = await product.save();

    res.status(200).json(updatedProduct);
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


// NEW: Generic upload for products without ID (CREATE mode)
const uploadProductImageGeneric = async (req: Request, res: Response, next: NextFunction) => {
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
const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { fileType } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
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

    // Update product with new image URL
    product.image = publicURL;
    await product.save();

    res.status(200).json({
      url,
      publicURL,
      product
    });
  } catch (error) {
    next(error);
  }
};

const getProductsForSearchQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { search } = req.query; // Backend expects 'search'
    
    if (!search) {
      return res.json([]);
    }

    const results = await Product.aggregate([
      {
        $search: {
          index: "default",
          autocomplete: {
            path: "name",
            query: search, // Use the search parameter here
            tokenOrder: "any",
            fuzzy: {
              maxEdits: 1,
              prefixLength: 2,
              maxExpansions: 256,
            },
          },
          highlight: {
            path: "name",
          },
        },
      },
    ]);
    res.json(results);
  } catch (error) {
    next(error);
  }
};


export {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
  uploadProductImage,
  uploadProductImageGeneric, // Export the generic upload function
  getProductsForSearchQuery,
};
// products.js
// This file contains the product-related logic for an Express application.
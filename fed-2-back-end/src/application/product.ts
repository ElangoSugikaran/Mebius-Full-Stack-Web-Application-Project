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
// Get a product by ID
const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate('reviews')
      .populate({
        path: 'categoryId',
        select: 'name',
        options: { lean: true }
      });
    
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // Transform the response to match frontend expectations
    const { categoryId, ...productData } = product.toObject();
    const productResponse = {
      ...productData,
      category: categoryId // Rename categoryId to category
    };

    res.json(productResponse);
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

// NEW: Get all available filter options from database
const getFilterOptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 Fetching filter options from database...');
    
    // Use MongoDB aggregation to get unique values efficiently
    const filterOptions = await Product.aggregate([
      {
        $match: { isActive: true } // Only include active products
      },
      {
        $group: {
          _id: null,
          brands: { $addToSet: "$brand" },
          colors: { $addToSet: { $arrayElemAt: ["$colors", 0] } }, // Flatten colors array
          sizes: { $addToSet: { $arrayElemAt: ["$sizes", 0] } },   // Flatten sizes array
          genders: { $addToSet: "$gender" },
          materials: { $addToSet: "$material" },
          minPrice: { $min: "$finalPrice" },
          maxPrice: { $max: "$finalPrice" }
        }
      },
      {
        $project: {
          _id: 0,
          brands: {
            $filter: {
              input: "$brands",
              cond: { $ne: ["$$this", null] } // Remove null values
            }
          },
          colors: {
            $filter: {
              input: "$colors",
              cond: { $ne: ["$$this", null] }
            }
          },
          sizes: {
            $filter: {
              input: "$sizes", 
              cond: { $ne: ["$$this", null] }
            }
          },
          genders: {
            $filter: {
              input: "$genders",
              cond: { $ne: ["$$this", null] }
            }
          },
          materials: {
            $filter: {
              input: "$materials",
              cond: { $ne: ["$$this", null] }
            }
          },
          priceRange: {
            min: "$minPrice",
            max: "$maxPrice"
          }
        }
      }
    ]);

    // For colors and sizes, we need a better approach since they're arrays
    const [colorsResult, sizesResult] = await Promise.all([
      Product.aggregate([
        { $match: { isActive: true } },
        { $unwind: "$colors" },
        { $group: { _id: "$colors" } },
        { $sort: { _id: 1 } }
      ]),
      Product.aggregate([
        { $match: { isActive: true } },
        { $unwind: "$sizes" },
        { $group: { _id: "$sizes" } },
        { $sort: { _id: 1 } }
      ])
    ]);

    const result = filterOptions[0] || {};
    
    // Replace with properly flattened arrays
    result.colors = colorsResult.map(item => item._id).filter(Boolean);
    result.sizes = sizesResult.map(item => item._id).filter(Boolean);
    
    // Ensure we have default values
    const response = {
      brands: result.brands || [],
      colors: result.colors || [],
      sizes: result.sizes || [],
      genders: result.genders || [],
      materials: result.materials || [],
      priceRange: {
        min: Math.floor(result.priceRange?.min || 0),
        max: Math.ceil(result.priceRange?.max || 1000)
      }
    };

    console.log('✅ Filter options:', response);
    res.json({ data: response });
    
  } catch (error) {
    console.error('❌ Error fetching filter options:', error);
    next(error);
  }
};

// NEW: Get filtered products based on query parameters
const getFilteredProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      categories,
      brands,
      sizes,
      colors,
      gender,
      minPrice,
      maxPrice,
      inStock,
      onSale,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('🔍 Filtering products with params:', req.query);

    // Build filter object
    const filter: any = { isActive: true };

    // Category filter
    if (categories) {
      const categoryArray = (categories as string).split(',');
      filter.categoryId = { $in: categoryArray };
    }

    // Brand filter
    if (brands) {
      const brandArray = (brands as string).split(',');
      filter.brand = { $in: brandArray };
    }

    // Size filter (product must have at least one matching size)
    if (sizes) {
      const sizeArray = (sizes as string).split(',');
      filter.sizes = { $in: sizeArray };
    }

    // Color filter (product must have at least one matching color)
    if (colors) {
      const colorArray = (colors as string).split(',');
      filter.colors = { $in: colorArray };
    }

    // Gender filter
    if (gender) {
      const genderArray = (gender as string).split(',').map(g => g.toLowerCase());
      filter.gender = { $in: genderArray };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.finalPrice = {};
      if (minPrice) filter.finalPrice.$gte = parseFloat(minPrice as string);
      if (maxPrice) filter.finalPrice.$lte = parseFloat(maxPrice as string);
    }

    // Stock filter
    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    }

    // Sale filter (discount > 0)
    if (onSale === 'true') {
      filter.discount = { $gt: 0 };
    }

    // Build sort object
    const sortObj: any = {};
    
    // Handle different sort options
    switch (sortBy) {
      case 'price':
        sortObj.finalPrice = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'name':
        sortObj.name = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'rating':
        sortObj.averageRating = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'popularity':
        sortObj.salesCount = sortOrder === 'desc' ? -1 : 1;
        break;
      default:
        sortObj.createdAt = sortOrder === 'desc' ? -1 : 1;
    }

    console.log('🔍 MongoDB filter:', JSON.stringify(filter, null, 2));
    console.log('🔍 MongoDB sort:', sortObj);

    // Execute query with population
    const products = await Product.find(filter)
      .populate({
        path: 'categoryId',
        select: 'name',
        options: { lean: true }
      })
      .sort(sortObj)
      .lean(); // Use lean for better performance

    // Transform response to match frontend expectations
    const transformedProducts = products.map(product => {
      const { categoryId, ...productData } = product;
      return {
        ...productData,
        category: categoryId // Rename categoryId to category
      };
    });

    console.log(`✅ Found ${transformedProducts.length} filtered products`);

    res.json({
      data: transformedProducts,
      count: transformedProducts.length,
      filters: {
        applied: req.query,
        total: await Product.countDocuments({ isActive: true })
      }
    });

  } catch (error) {
    console.error('❌ Error filtering products:', error);
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
  getFilterOptions,
  getFilteredProducts,
};
// products.js
// This file contains the product-related logic for an Express application.
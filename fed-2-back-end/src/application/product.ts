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
// 🔧 FIXED: getFilterOptions function with all TypeScript errors resolved
const getFilterOptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 Fetching filter options from database...');
    
    // 🔧 FIXED: Separate aggregation for each field to handle arrays properly
    const [brandsResult, colorsResult, sizesResult, gendersResult, materialsResult, priceResult] = await Promise.all([
      // Get unique brands
      Product.aggregate([
        { "$match": { isActive: true } },
        { "$group": { "_id": "$brand" } },
        { "$match": { "_id": { "$ne": null, "$ne": "" } } },
        { "$sort": { "_id": 1 } }
      ]),

      // Get unique colors (properly unwind arrays)
      Product.aggregate([
        { "$match": { isActive: true } },
        { "$unwind": "$colors" },
        { "$group": { "_id": "$colors" } },
        { "$match": { "_id": { "$ne": null, "$ne": "" } } },
        { "$sort": { "_id": 1 } }
      ]),

      // Get unique sizes (properly unwind arrays) - FIXED: Removed duplicate sort properties
      Product.aggregate([
        { "$match": { isActive: true } },
        { "$unwind": "$sizes" },
        { "$group": { "_id": "$sizes" } },
        { "$match": { "_id": { "$ne": null, "$ne": "" } } },
        // Custom sort for sizes to maintain logical order
        { "$addFields": { 
          sortOrder: {
            "$switch": {
              branches: [
                { "case": { "$eq": ["$_id", "XS"] }, "then": 1 },
                { "case": { "$eq": ["$_id", "S"] }, "then": 2 },
                { "case": { "$eq": ["$_id", "M"] }, "then": 3 },
                { "case": { "$eq": ["$_id", "L"] }, "then": 4 },
                { "case": { "$eq": ["$_id", "XL"] }, "then": 5 },
                { "case": { "$eq": ["$_id", "XXL"] }, "then": 6 },
                { "case": { "$eq": ["$_id", "XXXL"] }, "then": 7 }
              ],
              "default": 999
            }
          }
        }},
        { "$sort": { "sortOrder": 1 } }, // Fixed: Only sort by sortOrder, no duplicates
        { "$project": { "_id": 1 } } // Remove sortOrder from final result
      ]),

      // Get unique genders with proper enum handling - FIXED: Removed duplicate sort properties
      Product.aggregate([
        { "$match": { isActive: true } },
        { "$group": { "_id": "$gender" } },
        { "$match": { "_id": { "$ne": null, "$ne": "" } } },
        // Ensure all enum values are included, especially 'kids'
        { "$addFields": {
          sortOrder: {
            "$switch": {
              branches: [
                { "case": { "$eq": ["$_id", "men"] }, "then": 1 },
                { "case": { "$eq": ["$_id", "women"] }, "then": 2 },
                { "case": { "$eq": ["$_id", "kids"] }, "then": 3 },
                { "case": { "$eq": ["$_id", "unisex"] }, "then": 4 }
              ],
              "default": 5
            }
          }
        }},
        { "$sort": { "sortOrder": 1 } }, // Fixed: Only sort by sortOrder, no duplicates
        { "$project": { "_id": 1 } }
      ]),

      // Get unique materials
      Product.aggregate([
        { "$match": { isActive: true } },
        { "$group": { "_id": "$material" } },
        { "$match": { "_id": { "$ne": null, "$ne": "", "$ne": "none" } } },
        { "$sort": { "_id": 1 } }
      ]),

      // Get price range
      Product.aggregate([
        { "$match": { isActive: true } },
        {
          "$group": {
            "_id": null,
            "minPrice": { "$min": "$finalPrice" },
            "maxPrice": { "$max": "$finalPrice" }
          }
        }
      ])
    ]);

    // Process results with better error handling
    const brands = brandsResult.map(item => item._id).filter(Boolean);
    const colors = colorsResult.map(item => item._id).filter(Boolean);
    const sizes = sizesResult.map(item => item._id).filter(Boolean);
    const genders = gendersResult.map(item => item._id).filter(Boolean);
    const materials = materialsResult.map(item => item._id).filter(Boolean);

    // Ensure all gender options are available even if no products exist
    const allGenders = ['men', 'women', 'kids', 'unisex'];
    const gendersSet = new Set([...genders, ...allGenders]);
    const availableGenders = Array.from(gendersSet);

    // Price range with proper fallbacks
    const priceData = priceResult[0] || {};
    const priceRange = {
      min: Math.floor(priceData.minPrice || 0),
      max: Math.ceil(priceData.maxPrice || 1000)
    };

    const response = {
      brands,
      colors,
      sizes,
      genders: availableGenders,
      materials,
      priceRange
    };

    console.log('✅ Filter options:', {
      brands: brands.length,
      colors: colors.length, 
      sizes: sizes.length,
      genders: availableGenders.length,
      materials: materials.length,
      priceRange
    });

    console.log('🔍 Available genders:', availableGenders); // Debug log

    res.json({ data: response });
    
  } catch (error) {
    console.error('❌ Error fetching filter options:', error);
    next(error);
  }
};

// 🔧 FIXED: getFilteredProducts function with better gender handling - No TypeScript errors
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
      const categoryArray = (categories as string).split(',').filter(Boolean);
      if (categoryArray.length > 0) {
        filter.categoryId = { "$in": categoryArray };
      }
    }

    // Brand filter
    if (brands) {
      const brandArray = (brands as string).split(',').filter(Boolean);
      if (brandArray.length > 0) {
        filter.brand = { "$in": brandArray };
      }
    }

    // Size filter (product must have at least one matching size)
    if (sizes) {
      const sizeArray = (sizes as string).split(',').filter(Boolean);
      if (sizeArray.length > 0) {
        filter.sizes = { "$in": sizeArray };
      }
    }

    // Color filter (product must have at least one matching color)
    if (colors) {
      const colorArray = (colors as string).split(',').filter(Boolean);
      if (colorArray.length > 0) {
        filter.colors = { "$in": colorArray };
      }
    }

    // Gender filter with proper case handling
    if (gender) {
      const genderArray = (gender as string)
        .split(',')
        .map(g => g.toLowerCase().trim())
        .filter(Boolean);
      
      if (genderArray.length > 0) {
        console.log('🔍 Gender filter applied:', genderArray);
        filter.gender = { "$in": genderArray };
      }
    }

    // Price range filter - use finalPrice for accurate filtering
    if (minPrice || maxPrice) {
      filter.finalPrice = {};
      if (minPrice) {
        const min = parseFloat(minPrice as string);
        if (!isNaN(min)) {
          filter.finalPrice["$gte"] = min;
        }
      }
      if (maxPrice) {
        const max = parseFloat(maxPrice as string);
        if (!isNaN(max)) {
          filter.finalPrice["$lte"] = max;
        }
      }
    }

    // Stock filter
    if (inStock === 'true') {
      filter.stock = { "$gt": 0 };
    }

    // Sale filter (discount > 0)
    if (onSale === 'true') {
      filter.discount = { "$gt": 0 };
    }

    // Build sort object - FIXED: No duplicate properties
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
      case 'discount':
        sortObj.discount = sortOrder === 'desc' ? -1 : 1;
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

    // Add debug info for gender filtering
    if (gender) {
      const genderCounts = await Product.aggregate([
        { "$match": { isActive: true } },
        { "$group": { "_id": "$gender", count: { "$sum": 1 } } },
        { "$sort": { "_id": 1 } }
      ]);
      console.log('🔍 Products by gender in database:', genderCounts);
    }

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

// NEW: Get featured products only
const getFeaturedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 Fetching featured products...');
    
    const featuredProducts = await Product.find({ 
      isActive: true,
      isFeatured: true 
    })
    .populate({
      path: 'categoryId',
      select: 'name',
      options: { lean: true }
    })
    .sort({ createdAt: -1 }) // Latest featured products first
    .limit(20) // Limit for performance
    .lean();

    // Transform response to match frontend expectations
    const transformedProducts = featuredProducts.map(product => {
      const { categoryId, ...productData } = product;
      return {
        ...productData,
        category: categoryId
      };
    });

    console.log(`✅ Found ${transformedProducts.length} featured products`);

    res.json({ 
      data: transformedProducts,
      count: transformedProducts.length 
    });

  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
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
  getFeaturedProducts,
};
// products.js
// This file contains the product-related logic for an Express application.
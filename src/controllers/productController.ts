import type { Request, Response } from 'express';
import Product from '../models/Product.ts';
import Category from '../models/Category.ts';

type PricingNormalized = {
  size: number;
  price: number;
};

const normalizeAndValidatePricing = (pricing: any): { pricing: PricingNormalized[] } | { error: string } => {
  if (!pricing || !Array.isArray(pricing) || pricing.length === 0) {
    return { error: 'Product must have at least one pricing option' };
  }

  const normalized: PricingNormalized[] = [];

  for (const item of pricing) {
    // normalize size
    const size =
      typeof item?.size === 'string'
        ? Number(item.size)
        : item?.size;

    // normalize price
    const price =
      typeof item?.price === 'string'
        ? Number(item.price)
        : item?.price;

    if (size === undefined || typeof size !== 'number' || Number.isNaN(size)) {
      return { error: 'Each pricing option must have a valid numeric size' };
    }

    if (price === undefined || typeof price !== 'number' || Number.isNaN(price) || price < 0) {
      return { error: 'Each pricing option must have a valid price (>= 0)' };
    }

    normalized.push({ size, price });
  }

  // prevent duplicate sizes
  const sizes = normalized.map((p) => p.size);
  if (new Set(sizes).size !== sizes.length) {
    return { error: 'Duplicate size found in pricing options' };
  }

  return { pricing: normalized };
};

// CREATE - Create new product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ProductName, type, category, pricing, color, images, description, STLfile, Gcode } = req.body;

    // Validate and get category
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      res.status(404).json({ success: false, message: 'Category not found' });
      return;
    }

    // Normalize + validate pricing (size is Number, random allowed)
    const pricingResult = normalizeAndValidatePricing(pricing);
    if ('error' in pricingResult) {
      res.status(400).json({ success: false, message: pricingResult.error });
      return;
    }

    const product = new Product({
      ProductName,
      type,
      category: categoryDoc._id,
      categName: categoryDoc.categName, // auto-fill from category
      pricing: pricingResult.pricing,
      color,
      images,
      description,
      STLfile,
      Gcode,
    });

    await product.save();

    const productObj = product.toObject();
    delete productObj.__v;

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: productObj,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error creating product',
      error: error.message,
    });
  }
};

// READ ALL - Get all products
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find().select('-__v');
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message,
    });
  }
};

// READ ONE - Get product by ID
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).select('-__v');

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message,
    });
  }
};

// GET BY CATEGORY - Get products by category ID
export const getProductsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId } = req.params;

    const categoryDoc = await Category.findById(categoryId);
    if (!categoryDoc) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }

    const products = await Product.find({ category: categoryId }).select('-__v');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category',
      error: error.message,
    });
  }
};

// GET BY CATEGORY NAME - Get products by category name
export const getProductsByCategoryName = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categName } = req.params;

    const products = await Product.find({ categName }).select('-__v');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category name',
      error: error.message,
    });
  }
};

// GET BY TYPE - Get products by type (custom/catalogue)
export const getProductsByType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type } = req.params;

    if (type !== 'custom' && type !== 'catalogue') {
      res.status(400).json({
        success: false,
        message: 'Type must be either "custom" or "catalogue"',
      });
      return;
    }

    const products = await Product.find({ type }).select('-__v');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products by type',
      error: error.message,
    });
  }
};

// UPDATE - Update product by ID
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData: any = { ...req.body };

    // If updating category, validate and update categName
    if (updateData.category) {
      const categoryDoc = await Category.findById(updateData.category);

      if (!categoryDoc) {
        res.status(404).json({
          success: false,
          message: 'Category not found',
        });
        return;
      }

      updateData.categName = categoryDoc.categName;
    }

    // Normalize + validate pricing if provided
    if (updateData.pricing) {
      const pricingResult = normalizeAndValidatePricing(updateData.pricing);
      if ('error' in pricingResult) {
        res.status(400).json({ success: false, message: pricingResult.error });
        return;
      }
      updateData.pricing = pricingResult.pricing;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-__v');

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error updating product',
      error: error.message,
    });
  }
};

// DELETE - Delete product by ID
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id).select('-__v');

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message,
    });
  }
};
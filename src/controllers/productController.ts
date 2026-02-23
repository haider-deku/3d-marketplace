import type { Request, Response } from 'express';
import Product from '../models/Product.ts';
import Category from '../models/Category.ts';

// CREATE - Create new product
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ProductName, type, category, pricing, color, images, description, STLfile, Gcode } = req.body;

    // Validate and get category
    const categoryDoc = await Category.findById(category);
    
    if (!categoryDoc) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }

    // Validate pricing array
    if (!pricing || !Array.isArray(pricing) || pricing.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Product must have at least one pricing option',
      });
      return;
    }

    // Validate each pricing option
    const validSizes = ['small', 'medium', 'large'];
    for (const price of pricing) {
      if (!price.size || !validSizes.includes(price.size)) {
        res.status(400).json({
          success: false,
          message: `Invalid size. Must be one of: ${validSizes.join(', ')}`,
        });
        return;
      }
      if (price.price === undefined || price.price < 0) {
        res.status(400).json({
          success: false,
          message: 'Each pricing option must have a valid price (>= 0)',
        });
        return;
      }
    }

    // Create product with auto-filled categName
    const product = new Product({
      ProductName,
      type,
      category: categoryDoc._id,
      categName: categoryDoc.categName,  // ← Auto-fill from category
      pricing,
      color,
      images,
      description,
      STLfile,
      Gcode,
    });

    await product.save();

    // Return product without populating (categName is already there)
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
    const products = await Product.find();
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
    const product = await Product.findById(id);

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

    // Validate category exists
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
    const updateData = req.body;

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
      
      updateData.categName = categoryDoc.categName;  // ← Auto-update categName
    }

    // Validate pricing if provided
    if (updateData.pricing) {
      if (!Array.isArray(updateData.pricing) || updateData.pricing.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Product must have at least one pricing option',
        });
        return;
      }

      const validSizes = ['small', 'medium', 'large'];
      for (const price of updateData.pricing) {
        if (!price.size || !validSizes.includes(price.size)) {
          res.status(400).json({
            success: false,
            message: `Invalid size. Must be one of: ${validSizes.join(', ')}`,
          });
          return;
        }
        if (price.price === undefined || price.price < 0) {
          res.status(400).json({
            success: false,
            message: 'Each pricing option must have a valid price (>= 0)',
          });
          return;
        }
      }
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
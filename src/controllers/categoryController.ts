// 1. IMPORTS
import { type Request, type Response } from 'express';
import Category from '../models/category.ts';

// 2. CREATE - Add new document
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { categName } = req.body;

    const category = new Category({
      categName,
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error creating Category',
      error: error.message,
    });
  }
};

// 3. READ ALL - Get all documents
export const getAllCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const documents = await Category.find();

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Category',
      error: error.message,
    });
  }
};

// 4. READ ONE - Get document by ID
export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const document = await Category.findById(id);

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching Category',
      error: error.message,
    });
  }
};

// 5. UPDATE - Update document by ID
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const document = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: document,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error updating Category',
      error: error.message,
    });
  }
};

// 6. DELETE - Delete document by ID
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const document = await Category.findByIdAndDelete(id);

    if (!document) {
      res.status(404).json({
        success: false,
        message: 'Category not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: document,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting Category',
      error: error.message,
    });
  }
};
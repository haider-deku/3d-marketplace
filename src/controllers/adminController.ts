import type { Request, Response } from 'express';
import Admin from '../models/Admin.ts';

// CREATE - Register new admin
export const createAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;  // ← Only username and password

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username });
    
    if (existingAdmin) {
      res.status(400).json({
        success: false,
        message: 'Admin with this username already exists',
      });
      return;
    }

    // Create new admin
    const admin = new Admin({
      username,
      password,  // Will be hashed by pre-save hook
    });

    await admin.save();

    // Remove password from response
    const adminObj = admin.toObject();
    delete adminObj.password;

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: adminObj,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error creating admin',
      error: error.message,
    });
  }
};

// READ ALL - Get all admins
export const getAllAdmins = async (req: Request, res: Response): Promise<void> => {
  try {
    const admins = await Admin.find().select('-password');

    res.status(200).json({
      success: true,
      count: admins.length,
      data: admins,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admins',
      error: error.message,
    });
  }
};

// READ ONE - Get admin by ID
export const getAdminById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id).select('-password');

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: admin,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin',
      error: error.message,
    });
  }
};

// UPDATE - Update admin by ID
export const updateAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find admin first (to use .save() for password hashing)
    const admin = await Admin.findById(id);

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
      return;
    }

    // Check if updating username to existing value
    if (updateData.username && updateData.username !== admin.username) {
      const existingAdmin = await Admin.findOne({ 
        username: updateData.username,
        _id: { $ne: id }  // Exclude current admin
      });

      if (existingAdmin) {
        res.status(400).json({
          success: false,
          message: 'Username already in use by another admin',
        });
        return;
      }
    }

    // Update fields
    Object.assign(admin, updateData);

    // Save (triggers pre-save hook for password hashing)
    await admin.save();

    // Remove password from response
    const adminObj = admin.toObject();
    delete adminObj.password;

    res.status(200).json({
      success: true,
      message: 'Admin updated successfully',
      data: adminObj,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error updating admin',
      error: error.message,
    });
  }
};

// DELETE - Delete admin by ID
export const deleteAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const admin = await Admin.findByIdAndDelete(id).select('-password');

    if (!admin) {
      res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Admin deleted successfully',
      data: admin,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting admin',
      error: error.message,
    });
  }
};
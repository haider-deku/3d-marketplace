import type { Request, Response } from 'express';
import Client from '../models/client.ts';

// CREATE - Register new client
export const createClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, phoneNumber, address } = req.body;

    // Check if client already exists
    const existingClient = await Client.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingClient) {
      res.status(400).json({
        success: false,
        message: 'Client with this email or username already exists',
      });
      return;
    }

    const client = new Client({
      username,
      email,
      password,
      phoneNumber,
      address,
    });

    await client.save();

    // Remove password from response
    const clientObj = client.toObject();
    delete clientObj.password;

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: clientObj,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error creating client',
      error: error.message,
    });
  }
};

// READ ALL - Get all clients
export const getAllClients = async (req: Request, res: Response): Promise<void> => {
  try {
    const clients = await Client.find().select('-password');

    res.status(200).json({
      success: true,
      count: clients.length,
      data: clients,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching clients',
      error: error.message,
    });
  }
};

// READ ONE - Get client by ID
export const getClientById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id).select('-password');

    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: client,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching client',
      error: error.message,
    });
  }
};

// UPDATE - Update client by ID
export const updateClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find client first
    const client = await Client.findById(id);

    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    // Update fields
    Object.assign(client, updateData);

    // Save (triggers pre-save hook)
    await client.save();

    // Remove password from response
    const clientObj = client.toObject();
    delete clientObj.password;

    res.status(200).json({
      success: true,
      message: 'Client updated successfully',
      data: clientObj,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error updating client',
      error: error.message,
    });
  }
};

// DELETE - Delete client by ID
export const deleteClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const client = await Client.findByIdAndDelete(id).select('-password');

    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Client deleted successfully',
      data: client,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting client',
      error: error.message,
    });
  }
};
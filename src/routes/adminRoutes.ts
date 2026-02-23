import express from 'express';
import {
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
} from '../controllers/adminController.ts';

const Adminrouter = express.Router();

// CREATE
Adminrouter.post('/', createAdmin);

// READ
Adminrouter.get('/', getAllAdmins);
Adminrouter.get('/:id', getAdminById);

// UPDATE
Adminrouter.put('/:id', updateAdmin);

// DELETE
Adminrouter.delete('/:id', deleteAdmin);

export default Adminrouter;
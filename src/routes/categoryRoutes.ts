import express from 'express';

const Catrouter = express.Router();

import {
  createCategory,getAllCategory,getCategoryById,updateCategory,deleteCategory
} from '../controllers/categoryController.ts';

Catrouter.post('/',createCategory);
Catrouter.get('/',getAllCategory);
Catrouter.get('/:id',getCategoryById);
Catrouter.put('/:id',updateCategory);
Catrouter.delete('/:id',deleteCategory);

export default Catrouter;
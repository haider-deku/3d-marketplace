import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsByCategoryName,
  getProductsByType,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.ts';

const router = express.Router();

// CREATE
router.post('/', createProduct);

// READ
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/category/:categoryId', getProductsByCategory);        // By category ID
router.get('/category-name/:categName', getProductsByCategoryName); // By category name
router.get('/type/:type', getProductsByType);                      // By type

// UPDATE
router.put('/:id', updateProduct);

// DELETE
router.delete('/:id', deleteProduct);

export default router;
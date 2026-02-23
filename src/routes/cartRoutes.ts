import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/cartController.ts';

const router = express.Router();

// GET cart
router.get('/:clientId', getCart);

// ADD to cart
router.post('/add', addToCart);

// UPDATE cart item
router.put('/update', updateCartItem);

// REMOVE from cart
router.delete('/remove', removeFromCart);

// CLEAR cart
router.delete('/clear/:clientId', clearCart);

export default router;
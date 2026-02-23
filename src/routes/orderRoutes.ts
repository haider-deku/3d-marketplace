import express from 'express';
import {
  checkout,
  getAllOrders,
  getOrderById,
  getOrdersByClient,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController.ts';

const Ordrouter = express.Router();

// CHECKOUT (create order from cart)
Ordrouter.post('/checkout', checkout);

// READ
Ordrouter.get('/', getAllOrders);
Ordrouter.get('/:id', getOrderById);
Ordrouter.get('/client/:clientId', getOrdersByClient);

// UPDATE
Ordrouter.put('/:id/status', updateOrderStatus);

// DELETE
Ordrouter.delete('/:id', deleteOrder);

export default Ordrouter;
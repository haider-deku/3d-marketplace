import type { Request, Response } from 'express';
import Order from '../models/order.ts';
import Cart from '../models/cart.ts';
import Product from '../models/product.ts';
import Client from '../models/client.ts';

// CHECKOUT - Create order from cart
export const checkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.body;

    // Step 1: Validate client
    const client = await Client.findById(clientId);
    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    // Step 2: Get cart
    const cart = await Cart.findOne({ clientId });
    if (!cart || cart.items.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Cart is empty. Cannot create order.',
      });
      return;
    }

    // Step 3: Calculate total and build order items
    let totalPrice = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        res.status(404).json({
          success: false,
          message: `Product ${item.productId} not found`,
        });
        return;
      }

      // Find price for the selected size
      const pricingOption = product.pricing.find(
        (p: any) => p.size === item.size
      );

      if (!pricingOption) {
        res.status(400).json({
          success: false,
          message: `Size '${item.size}' not available for ${product.ProductName}`,
        });
        return;
      }

      const itemTotal = pricingOption.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
        price: pricingOption.price,
      });
    }

    // Step 4: Create order
    const order = new Order({
      clientId,
      items: orderItems,
      totalPrice,
      status: 'pending',
    });

    await order.save();

    // Step 5: Clear cart items
    cart.items = [];
    await cart.save();

    // Step 6: Return order
    const orderObj = order.toObject();
    delete orderObj.__v;

    res.status(201).json({
      success: true,
      message: 'Order created successfully. Cart has been cleared.',
      data: orderObj,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
    });
  }
};

// GET ALL ORDERS
export const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders = await Order.find()
      .select('-__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};

// GET ORDER BY ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).select('-__v');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message,
    });
  }
};

// GET ORDERS BY CLIENT
export const getOrdersByClient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;

    const client = await Client.findById(clientId);
    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    const orders = await Order.find({ clientId })
      .select('-__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};

// UPDATE ORDER STATUS
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error updating order status',
      error: error.message,
    });
  }
};

// DELETE ORDER
export const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await Order.findByIdAndDelete(id).select('-__v');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Order deleted successfully',
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: error.message,
    });
  }
};
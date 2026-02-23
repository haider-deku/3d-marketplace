import type { Request, Response } from 'express';
import Cart from '../models/Cart.ts';
import Product from '../models/Product.ts';
import Client from '../models/Client.ts';

// GET CART - Get client's cart with calculated prices
export const getCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;

    // Validate client exists
    const client = await Client.findById(clientId);
    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    // Find or create cart
    let cart = await Cart.findOne({ clientId });

    if (!cart) {
      cart = new Cart({ clientId, items: [] });
      await cart.save();
    }

    // If cart is empty
    if (cart.items.length === 0) {
      res.status(200).json({
        success: true,
        data: {
          clientId,
          items: [],
          totalPrice: 0,
        },
      });
      return;
    }

    // Calculate prices for each item
    let totalPrice = 0;
    const itemsWithPrices = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        // Skip products that no longer exist
        continue;
      }

      // Find price for selected size
      const pricingOption = product.pricing.find(
        (p: any) => p.size === item.size
      );

      if (!pricingOption) {
        // Skip if size no longer available
        continue;
      }

      const itemTotal = pricingOption.price * item.quantity;
      totalPrice += itemTotal;

      itemsWithPrices.push({
        productId: product._id,
        productName: product.ProductName,
        categName: product.categName,
        size: item.size,
        quantity: item.quantity,
        pricePerUnit: pricingOption.price,
        itemTotal: itemTotal,
        images: product.images,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        clientId,
        items: itemsWithPrices,
        totalPrice,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching cart',
      error: error.message,
    });
  }
};

// ADD TO CART - Add item with size to cart
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, productId, size, quantity } = req.body;

    // Validate client exists
    const client = await Client.findById(clientId);
    if (!client) {
      res.status(404).json({
        success: false,
        message: 'Client not found',
      });
      return;
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    // Validate size exists in product pricing
    const pricingOption = product.pricing.find((p: any) => p.size === size);
    if (!pricingOption) {
      res.status(400).json({
        success: false,
        message: `Size '${size}' not available for this product. Available sizes: ${product.pricing.map((p: any) => p.size).join(', ')}`,
      });
      return;
    }

    // Find or create cart
    let cart = await Cart.findOne({ clientId });
    if (!cart) {
      cart = new Cart({ clientId, items: [] });
    }

    // Check if same product + size already in cart
    const existingItemIndex = cart.items.findIndex(
      (item: any) => 
        item.productId.toString() === productId && 
        item.size === size
    );

    if (existingItemIndex > -1) {
      // Update quantity if same product + size exists
      cart.items[existingItemIndex].quantity += quantity || 1;
    } else {
      // Add new item with size
      cart.items.push({
        productId,
        size,
        quantity: quantity || 1,
      });
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item added to cart',
      data: cart,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error adding to cart',
      error: error.message,
    });
  }
};

// UPDATE CART ITEM - Change quantity
export const updateCartItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, productId, size, quantity } = req.body;

    if (quantity < 1) {
      res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1',
      });
      return;
    }

    const cart = await Cart.findOne({ clientId });
    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
      return;
    }

    const itemIndex = cart.items.findIndex(
      (item: any) => 
        item.productId.toString() === productId && 
        item.size === size
    );

    if (itemIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
      return;
    }

    // Update quantity
    cart.items[itemIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart item updated',
      data: cart,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error updating cart item',
      error: error.message,
    });
  }
};

// REMOVE FROM CART - Remove specific item
export const removeFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId, productId, size } = req.body;

    const cart = await Cart.findOne({ clientId });
    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
      return;
    }

    // Filter out the item
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      (item: any) => 
        !(item.productId.toString() === productId && item.size === size)
    );

    if (cart.items.length === initialLength) {
      res.status(404).json({
        success: false,
        message: 'Item not found in cart',
      });
      return;
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Item removed from cart',
      data: cart,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error removing item from cart',
      error: error.message,
    });
  }
};

// CLEAR CART - Remove all items
export const clearCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientId } = req.params;

    const cart = await Cart.findOne({ clientId });
    if (!cart) {
      res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
      return;
    }

    cart.items = [];
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared',
      data: cart,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: 'Error clearing cart',
      error: error.message,
    });
  }
};
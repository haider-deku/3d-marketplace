import mongoose, { Document, Schema } from 'mongoose';

interface ICartItem {
  productId: mongoose.Types.ObjectId;
  size: string;
  quantity: number;
}

interface ICart extends Document {
  clientId: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  size: {
    type: String,
    required: true,
    enum: ['small', 'medium', 'large'],
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1,
  },
}, { _id: false });

const CartSchema = new Schema<ICart>({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    unique: true,  // One cart per client
  },
  items: {
    type: [CartItemSchema],
    default: [],
  },
}, {
  timestamps: true,
});

// ✅ Check if model exists before creating
const Cart = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
import mongoose, { Document, Schema } from 'mongoose';

interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  size: string;
  quantity: number;
  price: number;
}

interface IOrder extends Document {
  clientId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalPrice: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
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
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  items: {
    type: [OrderItemSchema],
    required: true,
    validate: {
      validator: (items: IOrderItem[]) => items.length > 0,
      message: 'Order must have at least one item',
    },
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative'],
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['pending', 'processing', 'completed', 'cancelled'],
      message: 'Status must be pending, processing, completed, or cancelled',
    },
    default: 'pending',
  },
}, {
  timestamps: true,
});

const Order = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
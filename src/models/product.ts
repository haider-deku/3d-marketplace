import mongoose, { Document, Schema } from 'mongoose';

interface IPricing {
  size: number;   // use primitive `number` in TS interfaces
  price: number;
}

interface IProduct extends Document {
  ProductName: string;
  type: string;
  category: mongoose.Types.ObjectId;
  categName: string;
  pricing: IPricing[];
  color: string[];
  images: string[];
  description: string;
  STLfile: string;
  Gcode: string;
  createdAt: Date;
  updatedAt: Date;
}

const PricingSchema = new Schema<IPricing>({
  size: {
    type: Number,
    required: true,
    min: [0, 'Size cannot be negative'], // optional (remove if negatives allowed)
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
}, { _id: false });

const ProductSchema = new Schema<IProduct>({
  ProductName: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: {
      values: ['custom', 'catalogue'],
      message: 'Type must be either custom or catalogue',
    },
  },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  categName: { type: String, required: true, trim: true },
  pricing: {
    type: [PricingSchema],
    required: true,
    validate: [
      {
        validator: (pricing: IPricing[]) => Array.isArray(pricing) && pricing.length > 0,
        message: 'Product must have at least one pricing option',
      },
      {
        // no duplicate sizes in the same product
        validator: (pricing: IPricing[]) => {
          const sizes = pricing.map(p => p.size);
          return new Set(sizes).size === sizes.length;
        },
        message: 'Duplicate size found in pricing options',
      },
    ],
  },
  color: { type: [String], default: [] },
  images: { type: [String], default: [] },
  description: { type: String, required: true },
  STLfile: { type: String, required: false },
  Gcode: { type: String, required: false },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
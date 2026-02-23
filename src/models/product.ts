import mongoose, { Document, Schema } from 'mongoose';

interface IPricing {
  size: string;
  price: number;
}

interface IProduct extends Document {
  ProductName: string;
  type: string;
  category: mongoose.Types.ObjectId;  // ← Reference to Category
  categName: string;                   // ← Auto-filled from category
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
    type: String,
    required: true,
    enum: ['small', 'medium', 'large'],
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
  },
}, { _id: false });

const ProductSchema = new Schema<IProduct>({
  ProductName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: {
      values: ['custom', 'catalogue'],
      message: 'Type must be either custom or catalogue',
    },
  },
  category: {  // ← Add category reference
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  categName: {
    type: String,
    required: true,
    trim: true,
  },
  pricing: {
    type: [PricingSchema],
    required: true,
    validate: {
      validator: (pricing: IPricing[]) => pricing.length > 0,
      message: 'Product must have at least one pricing option',
    },
  },
  color: {
    type: [String],
    default: [],
  },
  images: {
    type: [String],
    default: [],
  },
  description: {
    type: String,
    required: true,
  },
  STLfile: {
    type: String,
    required: false,
  },
  Gcode: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

// ✅ Check if model exists before creating
const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
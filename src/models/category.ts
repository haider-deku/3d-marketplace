import mongoose, { Document, Schema } from 'mongoose';

// 1. INTERFACE - Define the structure
interface ICategory extends Document {
  categName: string;
}

// 2. SCHEMA - Define the Mongoose schema
const CategorySchema = new Schema<ICategory>({
  categName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
}, {
  timestamps: true,  // ← Add timestamps for consistency
});

// 3. CREATE MODEL (with hot-reload fix)
const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

// 4. EXPORT
export default Category;
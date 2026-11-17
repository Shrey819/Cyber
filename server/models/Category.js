import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    icon_name: {
      type: String,
      default: 'Shield'
    },
    is_active: {
      type: Boolean,
      default: true
    },
    created_at: {
      type: Date,
      default: Date.now
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'categories',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
export default Category;

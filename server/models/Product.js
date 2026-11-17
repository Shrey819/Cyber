import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    category_id: {
      type: String,
      ref: 'Category',
      default: null,
      index: true
    },
    category_name: {
      type: String,
      default: ''
    },
    sku: {
      type: String,
      default: '',
      index: true
    },
    brand: {
      type: String,
      default: 'Vortex Cyber Defense'
    },
    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    tagline: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true
    },
    billing_cycle: {
      type: String,
      default: 'Monthly'
    },
    badge: {
      type: String,
      default: ''
    },
    max_seats: {
      type: Number,
      default: 10,
      min: 1
    },
    assets_included: {
      type: Number,
      default: 15,
      min: 0
    },
    features: {
      type: [String],
      default: []
    },
    keywords: {
      type: [String],
      default: []
    },
    feature_key: {
      type: String,
      default: null
    },
    in_stock: {
      type: Boolean,
      default: true
    },
    is_hidden: {
      type: Boolean,
      default: false,
      index: true
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
    collection: 'products',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

// Performance & search indexes
productSchema.index({ is_hidden: 1, name: 1, sku: 1, category_name: 1, price: 1 });
productSchema.index({
  name: 'text',
  description: 'text',
  tagline: 'text',
  sku: 'text',
  category_name: 'text',
  brand: 'text',
  keywords: 'text'
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;

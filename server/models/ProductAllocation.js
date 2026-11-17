import mongoose from 'mongoose';

const productAllocationSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => `alloc-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`
    },
    company_id: {
      type: String,
      ref: 'Company',
      required: true,
      index: true
    },
    product_id: {
      type: String,
      ref: 'Product',
      required: true,
      index: true
    },
    user_id: {
      type: String,
      ref: 'User',
      required: true,
      index: true
    },
    allocated_at: {
      type: Date,
      default: Date.now
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'product_allocations'
  }
);

// Compound unique index to prevent duplicate seat allocations
productAllocationSchema.index(
  { company_id: 1, product_id: 1, user_id: 1 },
  { unique: true, name: 'idx_unique_company_prod_user' }
);

export const ProductAllocation = mongoose.models.ProductAllocation || mongoose.model('ProductAllocation', productAllocationSchema);
export default ProductAllocation;

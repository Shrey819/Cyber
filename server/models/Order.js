import mongoose from 'mongoose';

const orderItemSubSchema = new mongoose.Schema(
  {
    id: { type: String },
    productId: { type: String },
    name: { type: String },
    price: { type: Number },
    quantity: { type: Number, default: 1 },
    maxSeats: { type: Number, default: 10 },
    billingCycle: { type: String }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    company_id: {
      type: String,
      ref: 'Company',
      default: null,
      index: true
    },
    company_name: {
      type: String,
      required: true
    },
    registration_number: {
      type: String,
      default: ''
    },
    customer_manager_name: {
      type: String,
      required: true
    },
    customer_manager_email: {
      type: String,
      required: true,
      lowercase: true,
      index: true
    },
    billing_address: {
      type: String,
      required: true
    },
    pin_code: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'India'
    },
    payment_method: {
      type: String,
      required: true
    },
    payment_status: {
      type: String,
      default: 'Pending',
      index: true
    },
    order_status: {
      type: String,
      default: 'Processing',
      index: true
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0
    },
    items: {
      type: mongoose.Schema.Types.Mixed,
      default: []
    },
    razorpay_order_id: {
      type: String,
      default: null
    },
    razorpay_payment_id: {
      type: String,
      default: null
    },
    razorpay_signature: {
      type: String,
      default: null
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true
    },
    updated_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'orders',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;

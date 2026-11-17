import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    order_id: {
      type: String,
      ref: 'Order',
      required: true,
      index: true
    },
    product_id: {
      type: String,
      ref: 'Product',
      required: true,
      index: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    unit_price: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    allocated_seats: {
      type: Number,
      required: true,
      default: 1,
      min: 1
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'order_items'
  }
);

export const OrderItem = mongoose.models.OrderItem || mongoose.model('OrderItem', orderItemSchema);
export default OrderItem;

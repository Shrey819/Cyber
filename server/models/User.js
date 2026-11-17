import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
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
    manager_id: {
      type: String,
      ref: 'User',
      default: null
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password_hash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      required: true,
      index: true
    },
    role_label: {
      type: String,
      default: ''
    },
    role_category: {
      type: String,
      default: ''
    },
    company_name: {
      type: String,
      default: ''
    },
    is_individual: {
      type: Boolean,
      default: false
    },
    status: {
      type: String,
      default: 'offline'
    },
    location: {
      type: String,
      default: null
    },
    pin_code: {
      type: String,
      default: null
    },
    security_clearance: {
      type: String,
      default: 'AUTHORIZED USER'
    },
    designation: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      default: null
    },
    is_active: {
      type: Boolean,
      default: true
    },
    last_login_at: {
      type: Date,
      default: null
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
    collection: 'users',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

// Enforce Singleton Platform Owner: Only 1 owner_manager allowed in MongoDB
userSchema.index(
  { role: 1 },
  { 
    unique: true, 
    partialFilterExpression: { role: 'owner_manager' },
    name: 'idx_single_owner_manager'
  }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;

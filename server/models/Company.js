import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
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
    domain: {
      type: String,
      trim: true,
      default: ''
    },
    registration_number: {
      type: String,
      trim: true,
      default: ''
    },
    pin_code: {
      type: String,
      trim: true,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    industry: {
      type: String,
      default: 'Enterprise Security Client'
    },
    tier: {
      type: String,
      default: 'Business Tier'
    },
    seats_total: {
      type: Number,
      default: 10,
      min: 1
    },
    active_seats: {
      type: Number,
      default: 1,
      min: 0
    },
    compliance_score: {
      type: Number,
      default: 88,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      default: 'Active',
      enum: ['Active', 'active', 'Suspended', 'suspended', 'Inactive', 'inactive']
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
    collection: 'companies',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

companySchema.index({ name: 1 });
companySchema.index({ status: 1 });

export const Company = mongoose.models.Company || mongoose.model('Company', companySchema);
export default Company;

import mongoose from 'mongoose';

const domainSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    user_id: {
      type: String,
      required: true,
      index: true
    },
    company_id: {
      type: String,
      default: null,
      index: true
    },
    normalized_domain: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    display_url: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
      index: true
    },
    latest_scan_id: {
      type: String,
      default: null
    },
    latest_score: {
      type: Number,
      default: null,
      min: 0,
      max: 100
    },
    last_scan_at: {
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
    collection: 'domains',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

// Compound index to prevent duplicate active domain entries for the same company or user
domainSchema.index({ company_id: 1, normalized_domain: 1, status: 1 });
domainSchema.index({ user_id: 1, normalized_domain: 1, status: 1 });

export const Domain = mongoose.models.Domain || mongoose.model('Domain', domainSchema);
export default Domain;

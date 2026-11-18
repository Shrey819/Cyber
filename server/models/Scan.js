import mongoose from 'mongoose';

const scanSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    domain_id: {
      type: String,
      ref: 'Domain',
      default: null,
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
    target_url: {
      type: String,
      required: true
    },
    normalized_domain: {
      type: String,
      required: true,
      index: true
    },
    scan_mode: {
      type: String,
      enum: ['quick', 'full'],
      default: 'quick',
      index: true
    },
    status: {
      type: String,
      enum: [
        'queued',
        'validating',
        'crawling',
        'scanning',
        'scoring',
        'generating_report',
        'completed',
        'completed_with_warnings',
        'failed',
        'cancelled'
      ],
      default: 'queued',
      index: true
    },
    progress: {
      stage: {
        type: String,
        default: 'queued'
      },
      percent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      currentStep: {
        type: String,
        default: 'Scan queued'
      },
      pagesDiscovered: {
        type: Number,
        default: 0
      },
      pagesAudited: {
        type: Number,
        default: 0
      },
      maxPages: {
        type: Number,
        default: 1
      },
      crawlCapped: {
        type: Boolean,
        default: false
      },
      completedCategories: {
        type: [String],
        default: []
      }
    },
    scores: {
      overall: { type: Number, default: null, min: 0, max: 100 },
      performance: { type: Number, default: null, min: 0, max: 100 },
      security: { type: Number, default: null, min: 0, max: 100 },
      seo: { type: Number, default: null, min: 0, max: 100 },
      accessibility: { type: Number, default: null, min: 0, max: 100 },
      mobile: { type: Number, default: null, min: 0, max: 100 },
      sslDns: { type: Number, default: null, min: 0, max: 100 }
    },
    summary: {
      totalFindings: { type: Number, default: 0 },
      critical: { type: Number, default: 0 },
      high: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      low: { type: Number, default: 0 },
      info: { type: Number, default: 0 },
      passedTests: { type: Number, default: 0 },
      skippedTests: { type: Number, default: 0 }
    },
    error_message: {
      type: String,
      default: null
    },
    started_at: {
      type: Date,
      default: null
    },
    completed_at: {
      type: Date,
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
    collection: 'scans',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
  }
);

scanSchema.index({ domain_id: 1, created_at: -1 });
scanSchema.index({ company_id: 1, created_at: -1 });

export const Scan = mongoose.models.Scan || mongoose.model('Scan', scanSchema);
export default Scan;

import mongoose from 'mongoose';

const findingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    scan_id: {
      type: String,
      ref: 'Scan',
      required: true,
      index: true
    },
    domain_id: {
      type: String,
      ref: 'Domain',
      default: null,
      index: true
    },
    rule_id: {
      type: String,
      required: true,
      index: true
    },
    category: {
      type: String,
      required: true,
      enum: ['security', 'performance', 'seo', 'accessibility', 'mobile', 'ssl_dns'],
      index: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['passed', 'failed', 'skipped', 'not_applicable'],
      default: 'failed',
      index: true
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low', 'info'],
      default: 'medium',
      index: true
    },
    confidence: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1
    },
    affected_urls: {
      type: [String],
      default: []
    },
    evidence: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    recommendation: {
      action: { type: String, default: '' },
      whyItMatters: { type: String, default: '' },
      stepByStep: { type: [String], default: [] },
      codeSnippet: { type: String, default: '' },
      effort: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
      docUrl: { type: String, default: '' },
      verificationSteps: { type: String, default: '' }
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'findings',
    timestamps: { createdAt: 'created_at', updatedAt: false }
  }
);

findingSchema.index({ scan_id: 1, category: 1, severity: 1 });
findingSchema.index({ scan_id: 1, status: 1 });

export const Finding = mongoose.models.Finding || mongoose.model('Finding', findingSchema);
export default Finding;

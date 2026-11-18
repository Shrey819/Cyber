import mongoose from 'mongoose';

const scannedPageSchema = new mongoose.Schema(
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
    url: {
      type: String,
      required: true
    },
    normalized_url: {
      type: String,
      required: true,
      index: true
    },
    status_code: {
      type: Number,
      default: 200
    },
    content_type: {
      type: String,
      default: 'text/html'
    },
    response_time_ms: {
      type: Number,
      default: 0
    },
    page_title: {
      type: String,
      default: ''
    },
    page_size_bytes: {
      type: Number,
      default: 0
    },
    links_discovered: {
      type: Number,
      default: 0
    },
    error: {
      type: String,
      default: null
    },
    created_at: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'scanned_pages',
    timestamps: { createdAt: 'created_at', updatedAt: false }
  }
);

scannedPageSchema.index({ scan_id: 1, normalized_url: 1 });

export const ScannedPage = mongoose.models.ScannedPage || mongoose.model('ScannedPage', scannedPageSchema);
export default ScannedPage;

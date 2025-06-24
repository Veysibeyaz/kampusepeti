// backend/models/Report.js
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reportedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  reportType: {
    type: String,
    required: true,
    enum: ['spam', 'fake', 'inappropriate', 'fraud', 'other']
  },
  category: {
    type: String,
    required: true,
    enum: ['product', 'user', 'message']
  },
  reason: {
    type: String,
    required: true,
    trim: true,
    maxLength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'rejected'],
    default: 'pending'
  },
  adminNote: {
    type: String,
    maxLength: 1000
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  evidence: [{
    type: String // Screenshot URL'leri
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// İndeksler
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reporter: 1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ reportedProduct: 1 });
reportSchema.index({ reviewedBy: 1 });

module.exports = mongoose.model('Report', reportSchema);
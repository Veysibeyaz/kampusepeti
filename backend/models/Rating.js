// backend/models/Rating.js
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  ratingUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// İndeksler
ratingSchema.index({ ratedUser: 1, createdAt: -1 });
ratingSchema.index({ ratingUser: 1, createdAt: -1 });
ratingSchema.index({ product: 1 });

// Aynı kullanıcının aynı ürün için birden fazla değerlendirme yapmasını engelle
ratingSchema.index({ ratingUser: 1, ratedUser: 1, product: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
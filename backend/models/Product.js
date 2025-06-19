// backend/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Ders Kitabı', 'Not', 'Kırtasiye', 'Diğer']
  },
  condition: {
    type: String,
    required: true,
    enum: ['Yeni', 'Az Kullanılmış', 'Orta', 'Eski']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  publishYear: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear()
  },
  university: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  images: [{
    type: String // Fotoğraf URL'leri
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['aktif', 'pasif', 'satildi'],
    default: 'aktif'
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// İndeksler (arama performansı için)
productSchema.index({ title: 'text', description: 'text', author: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ seller: 1 });

module.exports = mongoose.model('Product', productSchema);
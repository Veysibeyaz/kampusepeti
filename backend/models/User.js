// backend/models/User.js - Düzeltilmiş versiyon
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 15
  },
  // DÜZELTME: ObjectId yerine String kullan
  university: {
    type: String,  // ObjectId yerine String
    required: true,
    trim: true
  },
  department: {
    type: String,  // ObjectId yerine String
    required: true,
    trim: true
  },
  profilePhoto: {
    type: String,
    default: 'default-avatar.png'
  },
  bio: {
    type: String,
    maxlength: 300,
    trim: true
  },
  // Değerlendirme sistemi için alanlar
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  // Güvenilirlik skoru
  trustScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  // Kullanıcı durumu
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // İstatistikler
  totalSales: {
    type: Number,
    default: 0
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  // Hesap doğrulama
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true  // Varsayılan olarak aktif
  },
  emailVerificationToken: String,
  // Şifre sıfırlama
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  // Son aktivite
  lastActive: {
    type: Date,
    default: Date.now
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

// Şifre hashleme middleware'i
userSchema.pre('save', async function(next) {
  // Şifre değişmediyse atla
  if (!this.isModified('password')) return next();
  
  try {
    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Güven skoru hesaplama metodu
userSchema.methods.calculateTrustScore = function() {
  let score = 50; // Başlangıç skoru
  
  // Ortalama puana göre
  if (this.averageRating >= 4.5) score += 20;
  else if (this.averageRating >= 4.0) score += 15;
  else if (this.averageRating >= 3.5) score += 10;
  else if (this.averageRating >= 3.0) score += 5;
  else if (this.averageRating < 2.5) score -= 15;
  
  // Toplam değerlendirme sayısına göre
  if (this.totalRatings >= 50) score += 15;
  else if (this.totalRatings >= 20) score += 10;
  else if (this.totalRatings >= 10) score += 5;
  
  // Satış sayısına göre
  if (this.totalSales >= 20) score += 10;
  else if (this.totalSales >= 10) score += 5;
  
  // E-posta doğrulaması
  if (this.isEmailVerified) score += 5;
  
  // Hesap yaşına göre (6 aydan fazla)
  const accountAge = (Date.now() - this.createdAt) / (1000 * 60 * 60 * 24 * 30);
  if (accountAge >= 6) score += 5;
  
  // Skor limitlerini uygula
  this.trustScore = Math.max(0, Math.min(100, score));
  return this.trustScore;
};

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// JSON çıktısında şifreyi gizle
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  return userObject;
};

// İndeksler
userSchema.index({ email: 1 });
userSchema.index({ university: 1, department: 1 });
userSchema.index({ averageRating: -1 });
userSchema.index({ trustScore: -1 });

module.exports = mongoose.model('User', userSchema);
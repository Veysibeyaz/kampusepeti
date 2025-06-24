// backend/models/User.js - Final Sürüm
const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim gereklidir'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'E-posta gereklidir'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Şifre gereklidir'],
    minlength: 6
  },
  university: {
    type: String,
    required: [true, 'Üniversite gereklidir'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Bölüm gereklidir'],
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 15
  },
  
  // Profil resmi için alan (mevcut koddan)
  avatar: {
    type: String,
    default: null
  },
  
  // Alternatif profil resmi alanı (yeni koddan)
  profilePhoto: {
    type: String,
    default: 'default-avatar.png'
  },
  
  bio: {
    type: String,
    maxlength: 300,
    trim: true
  },
  
  // Profil görünürlük ayarları (mevcut koddan)
  profileVisibility: {
    type: String,
    enum: ['public', 'university', 'private'],
    default: 'public'
  },
  
  // Rating sistemi - iki farklı yaklaşım birleştirildi
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  
  // Alternatif rating alanları (yeni koddan)
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
  
  // Güvenilirlik skoru (yeni koddan)
  trustScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  
  // Kullanıcı rolleri ve durumu
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned'],
    default: 'active'
  },
  
  // Hesap durumu
  isActive: {
    type: Boolean,
    default: true
  },
  
  // İstatistikler (yeni koddan)
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
  emailVerificationToken: String,
  
  // Şifre sıfırlama
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  
  // Son aktivite zamanları
  lastSeen: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true  // createdAt ve updatedAt otomatik eklenir
});

// Şifre hashleme middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Şifre doğrulama methodu (mevcut koddan)
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Alternatif şifre doğrulama (yeni koddan)
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcryptjs.compare(candidatePassword, this.password);
};

// Avatar URL'sini getirme methodu (mevcut koddan)
userSchema.methods.getAvatarUrl = function() {
  if (this.avatar) {
    if (this.avatar.startsWith('http')) {
      return this.avatar;
    }
    return `${process.env.BACKEND_URL}/uploads/avatars/${this.avatar}`;
  }
  
  return `${process.env.BACKEND_URL}/uploads/avatars/default-avatar.png`;
};

// Güven skoru hesaplama metodu (yeni koddan)
userSchema.methods.calculateTrustScore = function() {
  let score = 50; // Başlangıç skoru
  
  // Ortalama puana göre
  const avgRating = this.averageRating || this.rating?.average || 0;
  if (avgRating >= 4.5) score += 20;
  else if (avgRating >= 4.0) score += 15;
  else if (avgRating >= 3.5) score += 10;
  else if (avgRating >= 3.0) score += 5;
  else if (avgRating < 2.5) score -= 15;
  
  // Toplam değerlendirme sayısına göre
  const totalRatings = this.totalRatings || this.rating?.count || 0;
  if (totalRatings >= 50) score += 15;
  else if (totalRatings >= 20) score += 10;
  else if (totalRatings >= 10) score += 5;
  
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

// Public profil bilgilerini getirme (mevcut koddan)
userSchema.methods.getPublicProfile = function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    university: this.university,
    department: this.department,
    avatar: this.getAvatarUrl(),
    rating: this.rating,
    averageRating: this.averageRating,
    totalRatings: this.totalRatings,
    trustScore: this.trustScore,
    totalSales: this.totalSales,
    createdAt: this.createdAt,
    lastSeen: this.lastSeen,
    isActive: this.isActive,
    isEmailVerified: this.isEmailVerified
  };
};

// ToJSON override - şifre ve hassas bilgileri gizle (her iki koddan)
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  
  // Avatar URL'ini ekle
  userObject.avatar = this.getAvatarUrl();
  return userObject;
};

// İlk admin kullanıcı oluşturma helper'ı (mevcut koddan)
userSchema.statics.createDefaultAdmin = async function() {
  const adminExists = await this.findOne({ role: 'admin' });
  
  if (!adminExists) {
    const defaultAdmin = new this({
      name: 'Admin',
      email: 'admin@kampusepeti.com',
      password: 'admin123',
      university: 'Sistem',
      department: 'Yönetim',
      role: 'admin',
      isActive: true,
      isEmailVerified: true
    });
    
    await defaultAdmin.save();
    console.log('Varsayılan admin kullanıcısı oluşturuldu');
    console.log('Email: admin@kampusepeti.com');
    console.log('Şifre: admin123');
  }
};

// Rating güncelleme helper metodu
userSchema.methods.updateRating = function(newRating) {
  const currentTotal = (this.rating?.average || 0) * (this.rating?.count || 0);
  const newCount = (this.rating?.count || 0) + 1;
  const newAverage = (currentTotal + newRating) / newCount;
  
  this.rating = {
    average: Math.round(newAverage * 10) / 10, // 1 ondalık basamak
    count: newCount
  };
  
  // Alternatif alanları da güncelle
  this.averageRating = this.rating.average;
  this.totalRatings = this.rating.count;
  
  // Güven skorunu yeniden hesapla
  this.calculateTrustScore();
  
  return this.rating;
};

// İndeksler (her iki koddan)
userSchema.index({ email: 1 });
userSchema.index({ university: 1, department: 1 });
userSchema.index({ averageRating: -1 });
userSchema.index({ trustScore: -1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);
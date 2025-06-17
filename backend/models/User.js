const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim gereklidir'],
    trim: true,
    maxLength: [50, 'İsim 50 karakterden uzun olamaz']
  },
  email: {
    type: String,
    required: [true, 'E-posta gereklidir'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Geçerli bir e-posta adresi giriniz'
    ]
  },
  password: {
    type: String,
    required: [true, 'Şifre gereklidir'],
    minLength: [6, 'Şifre en az 6 karakter olmalıdır'],
    select: false // Default olarak şifre getQuery'lerde gelmez
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
    trim: true
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true // createdAt, updatedAt otomatik ekler
});

// Şifre hashleme middleware
userSchema.pre('save', async function(next) {
  // Şifre değişmemişse devam et
  if (!this.isModified('password')) return next();
  
  // Şifreyi hashle
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// JSON'a çevirirken şifreyi gizle
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
// backend/routes/userRoutes.js - Final Version
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// ID validation helper
const isValidObjectId = (id) => {
  return id && id !== 'undefined' && id !== 'null' && mongoose.Types.ObjectId.isValid(id);
};

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'profiles');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir!'));
    }
  }
});

// GET /api/users/:id - Kullanıcı profili getir
router.get('/:id', async (req, res) => {
  try {
    console.log('User profile requested for ID:', req.params.id);
    
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ 
        message: 'Geçersiz kullanıcı ID formatı' 
      });
    }

    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const userProfile = {
      ...user.toObject(),
      averageRating: user.averageRating || 0,
      totalRatings: user.totalRatings || 0,
      activeProductsCount: 0, // Ürün sayısı hesaplanacak
      trustScore: user.trustScore || 50,
      isEmailVerified: user.isEmailVerified || false
    };

    res.json(userProfile);
  } catch (error) {
    console.error('Kullanıcı profili hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// PUT /api/users/profile - Profil güncelle
router.put('/profile', protect, async (req, res) => {
  try {
    console.log('Profile update requested by user:', req.user.id);
    
    if (!isValidObjectId(req.user.id)) {
      return res.status(400).json({ message: 'Geçersiz kullanıcı ID' });
    }

    const { name, phone, bio, university, department } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Güncelleme alanları
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (university) user.university = university;
    if (department) user.department = department;

    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password');

    res.json({
      message: 'Profil başarıyla güncellendi',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// POST /api/users/profile-photo - Profil fotoğrafı yükle
router.post('/profile-photo', protect, upload.single('profilePhoto'), async (req, res) => {
  try {
    console.log('Profile photo upload requested by user:', req.user.id);
    
    if (!req.file) {
      return res.status(400).json({ message: 'Profil fotoğrafı seçilmedi' });
    }

    if (!isValidObjectId(req.user.id)) {
      return res.status(400).json({ message: 'Geçersiz kullanıcı ID' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Eski fotoğrafı sil
    if (user.profilePhoto && user.profilePhoto !== 'default-avatar.png') {
      const oldPhotoPath = path.join(__dirname, '..', 'uploads', 'profiles', user.profilePhoto);
      if (fs.existsSync(oldPhotoPath)) {
        try {
          fs.unlinkSync(oldPhotoPath);
          console.log('✅ Eski profil fotoğrafı silindi:', user.profilePhoto);
        } catch (err) {
          console.error('❌ Eski fotoğraf silinirken hata:', err);
        }
      }
    }

    user.profilePhoto = req.file.filename;
    await user.save();

    console.log('✅ Profil fotoğrafı güncellendi:', req.file.filename);

    res.json({
      message: 'Profil fotoğrafı başarıyla güncellendi',
      profilePhoto: req.file.filename,
      url: `/uploads/profiles/${req.file.filename}`,
      fullUrl: `http://localhost:5000/uploads/profiles/${req.file.filename}`
    });
  } catch (error) {
    console.error('Fotoğraf yükleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// GET /api/users/:id/products - Kullanıcının ilanları
router.get('/:id/products', async (req, res) => {
  try {
    console.log('User products requested for ID:', req.params.id);
    
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Geçersiz kullanıcı ID' });
    }

    // Mock ürün verileri - gerçek projede Product model'den gelecek
    res.json({
      products: [],
      totalPages: 0,
      currentPage: 1,
      total: 0
    });
  } catch (error) {
    console.error('Kullanıcı ürünleri hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router;
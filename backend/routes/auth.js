const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// JWT Token oluşturma fonksiyonu
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Kullanıcı kaydı
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, university, department, phone } = req.body;

    // Gerekli alanları kontrol et
    if (!name || !email || !password || !university || !department) {
      return res.status(400).json({
        success: false,
        message: 'Lütfen tüm gerekli alanları doldurun'
      });
    }

    // E-posta zaten kayıtlı mı kontrol et
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Bu e-posta adresi zaten kayıtlı'
      });
    }

    // Kullanıcı oluştur
    const user = await User.create({
      name,
      email,
      password,
      university,
      department,
      phone
    });

    // Token oluştur
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      token,
      user
    });

  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // E-posta ve şifre gerekli
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'E-posta ve şifre gereklidir'
      });
    }

    // Kullanıcıyı bul (şifre dahil)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz giriş bilgileri'
      });
    }

    // Şifre kontrolü
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz giriş bilgileri'
      });
    }

    // Kullanıcı aktif mi kontrol et
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız deaktif edilmiş'
      });
    }

    // Token oluştur
    const token = generateToken(user._id);

    // Şifreyi response'dan çıkar
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      token,
      user
    });

  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

// @desc    Kullanıcı profili getir
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

// @desc    Profil güncelleme
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, university, department, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, university, department, phone },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profil güncellendi',
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

// @desc    Çıkış yap (client-side token silme)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Çıkış başarılı'
  });
});

module.exports = router;
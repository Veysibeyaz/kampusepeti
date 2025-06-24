const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Product = require('../models/Product');
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

// @desc    Kullanıcı profili getir (kendi profili)
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

// @desc    Kendi profil bilgilerini getir (alternatif endpoint)
// @route   GET /api/auth/me  
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profil getirme hatası:', error);
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
    const { name, university, department, phone, bio } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, university, department, phone, bio },
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

// @desc    Başka kullanıcının profil bilgilerini getir
// @route   GET /api/users/:id
// @access  Public (herkes görebilir)
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Kullanıcı istatistiklerini ekle
    let productCount = 0;
    try {
      productCount = await Product.countDocuments({ 
        seller: user._id, 
        status: 'active' 
      });
    } catch (productError) {
      console.log('Product count alınamadı:', productError.message);
    }

    const userWithStats = {
      ...user.toObject(),
      activeProductsCount: productCount,
      totalRatings: 0, // Rating sistemi henüz hazır değil
      averageRating: 0,
      trustScore: 75 // Default değer
    };

    res.status(200).json({
      success: true,
      user: userWithStats
    });
  } catch (error) {
    console.error('Kullanıcı profili getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
});

// @desc    Kullanıcının ürünlerini getir
// @route   GET /api/users/:id/products
// @access  Public
router.get('/users/:id/products', async (req, res) => {
  try {
    let products = [];
    try {
      products = await Product.find({ 
        seller: req.params.id, 
        status: 'active' 
      })
      .populate('category', 'name')
      .sort({ createdAt: -1 });
    } catch (productError) {
      console.log('User products alınamadı:', productError.message);
    }

    res.status(200).json({
      success: true,
      products
    });
  } catch (error) {
    console.error('Kullanıcı ürünleri getirme hatası:', error);
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
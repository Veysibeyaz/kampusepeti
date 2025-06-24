// backend/middleware/admin.js
const User = require('../models/User');

// Admin yetkisi kontrolü
const adminOnly = async (req, res, next) => {
  try {
    // Kullanıcının giriş yapıp yapmadığını kontrol et
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Giriş yapmanız gerekiyor'
      });
    }

    // Kullanıcının admin olup olmadığını kontrol et
    const user = await User.findById(req.user._id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için admin yetkisine sahip olmanız gerekiyor'
      });
    }

    next();
  } catch (error) {
    console.error('Admin yetki kontrolü hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Moderatör veya Admin yetkisi kontrolü
const moderatorOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Giriş yapmanız gerekiyor'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user || (user.role !== 'admin' && user.role !== 'moderator')) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için moderatör veya admin yetkisine sahip olmanız gerekiyor'
      });
    }

    req.userRole = user.role;
    next();
  } catch (error) {
    console.error('Moderatör yetki kontrolü hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

module.exports = {
  adminOnly,
  moderatorOrAdmin
};
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Token doğrulama middleware
const protect = async (req, res, next) => {
  try {
    let token;

    // Token'ı header'dan al
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Token yoksa hata ver
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Bu işlem için giriş yapmanız gerekiyor'
      });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kullanıcıyı bul
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'Bu token ile ilişkili kullanıcı bulunamadı'
      });
    }

    // Kullanıcı aktif mi kontrol et
    if (!currentUser.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Hesabınız deaktif edilmiş'
      });
    }

    // Kullanıcıyı req'e ekle
    req.user = currentUser;
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Geçersiz token'
    });
  }
};

// Admin kontrolü
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bu işlem için yetkiniz yok'
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
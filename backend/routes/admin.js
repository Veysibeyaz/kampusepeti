// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Report = require('../models/Report');
const Rating = require('../models/Rating');
const Message = require('../models/Message');
const { protect, authorize } = require('../middleware/auth');

// Tüm admin routes'larda admin yetkisi gerekli
router.use(protect);
router.use(authorize('admin'));

// @desc    Dashboard istatistikleri
// @route   GET /api/admin/dashboard
// @access  Admin
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalReports,
      activeUsers,
      pendingReports,
      recentUsers,
      recentProducts,
      topCategories
    ] = await Promise.all([
      // Toplam kullanıcı sayısı
      User.countDocuments(),
      
      // Toplam ilan sayısı
      Product.countDocuments(),
      
      // Toplam şikayet sayısı
      Report.countDocuments(),
      
      // Aktif kullanıcı sayısı (son 30 gün)
      User.countDocuments({
        isActive: true,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }),
      
      // Bekleyen şikayet sayısı
      Report.countDocuments({ status: 'pending' }),
      
      // Son kullanıcılar (5 adet)
      User.find()
        .select('name email university createdAt isActive')
        .sort({ createdAt: -1 })
        .limit(5),
      
      // Son ilanlar (5 adet)
      Product.find()
        .select('title price category status createdAt')
        .populate('seller', 'name')
        .sort({ createdAt: -1 })
        .limit(5),
      
      // Kategori istatistikleri
      Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalProducts,
          totalReports,
          activeUsers,
          pendingReports
        },
        recentUsers,
        recentProducts,
        topCategories
      }
    });

  } catch (error) {
    console.error('Dashboard hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Tüm kullanıcıları getir
// @route   GET /api/admin/users
// @access  Admin
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status; // 'active', 'inactive'
    const role = req.query.role; // 'user', 'admin'

    // Arama ve filtreleme koşulları
    const searchConditions = {};
    
    if (search) {
      searchConditions.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { university: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status === 'active') searchConditions.isActive = true;
    if (status === 'inactive') searchConditions.isActive = false;
    if (role) searchConditions.role = role;

    const users = await User.find(searchConditions)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(searchConditions);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Kullanıcı listesi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Kullanıcı durumunu güncelle
// @route   PUT /api/admin/users/:id/status
// @access  Admin
router.put('/users/:id/status', async (req, res) => {
  try {
    const { isActive, reason } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Admin kendisini deaktif edemez
    if (user.role === 'admin' && req.user.id === user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Kendi hesabınızı deaktif edemezsiniz'
      });
    }

    user.isActive = isActive;
    await user.save();

    // Log kaydı (opsiyonel)
    console.log(`Admin ${req.user.name} kullanıcı ${user.name} durumunu değiştirdi: ${isActive ? 'Aktif' : 'Pasif'}. Sebep: ${reason || 'Belirtilmedi'}`);

    res.json({
      success: true,
      message: `Kullanıcı ${isActive ? 'aktif' : 'pasif'} hale getirildi`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Kullanıcı durumu güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Tüm ilanları getir
// @route   GET /api/admin/products
// @access  Admin
router.get('/products', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status; // 'aktif', 'pasif', 'satildi'
    const category = req.query.category;

    const searchConditions = {};
    
    if (search) {
      searchConditions.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) searchConditions.status = status;
    if (category) searchConditions.category = category;

    const products = await Product.find(searchConditions)
      .populate('seller', 'name email university isActive')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(searchConditions);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('İlan listesi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    İlan sil
// @route   DELETE /api/admin/products/:id
// @access  Admin
router.delete('/products/:id', async (req, res) => {
  try {
    const { reason } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'İlan bulunamadı'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    // Log kaydı
    console.log(`Admin ${req.user.name} ilan sildi: ${product.title}. Sebep: ${reason || 'Belirtilmedi'}`);

    res.json({
      success: true,
      message: 'İlan başarıyla silindi'
    });

  } catch (error) {
    console.error('İlan silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Şikayetleri getir
// @route   GET /api/admin/reports
// @access  Admin
router.get('/reports', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status; // 'pending', 'under_review', 'resolved', 'rejected'
    const category = req.query.category; // 'product', 'user', 'message'
    const priority = req.query.priority;

    const searchConditions = {};
    
    if (status) searchConditions.status = status;
    if (category) searchConditions.category = category;
    if (priority) searchConditions.priority = priority;

    const reports = await Report.find(searchConditions)
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email university')
      .populate('reportedProduct', 'title category price')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Report.countDocuments(searchConditions);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Şikayet listesi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Şikayet durumunu güncelle
// @route   PUT /api/admin/reports/:id
// @access  Admin
router.put('/reports/:id', async (req, res) => {
  try {
    const { status, adminNote, priority } = req.body;
    
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Şikayet bulunamadı'
      });
    }

    // Güncelleme alanları
    if (status) {
      report.status = status;
      report.reviewedBy = req.user.id;
      report.reviewedAt = new Date();
    }
    
    if (adminNote) report.adminNote = adminNote;
    if (priority) report.priority = priority;

    await report.save();

    const updatedReport = await Report.findById(report._id)
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email')
      .populate('reportedProduct', 'title')
      .populate('reviewedBy', 'name');

    res.json({
      success: true,
      message: 'Şikayet güncellendi',
      data: updatedReport
    });

  } catch (error) {
    console.error('Şikayet güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Sistem raporları
// @route   GET /api/admin/reports/system
// @access  Admin
router.get('/reports/system', async (req, res) => {
  try {
    const [
      userStats,
      productStats,
      reportStats,
      ratingStats,
      messageStats
    ] = await Promise.all([
      // Kullanıcı istatistikleri
      User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
            inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
            admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } }
          }
        }
      ]),

      // İlan istatistikleri
      Product.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Şikayet istatistikleri
      Report.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),

      // Rating istatistikleri
      Rating.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            averageRating: { $avg: '$rating' }
          }
        }
      ]),

      // Mesaj istatistikleri (son 30 gün)
      Message.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    res.json({
      success: true,
      data: {
        users: userStats[0] || { total: 0, active: 0, inactive: 0, admins: 0 },
        products: productStats,
        reports: reportStats,
        ratings: ratingStats[0] || { total: 0, averageRating: 0 },
        messages: messageStats
      }
    });

  } catch (error) {
    console.error('Sistem raporları hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

module.exports = router;
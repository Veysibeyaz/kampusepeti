// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// @desc    Şikayet oluştur
// @route   POST /api/reports
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { 
      reportedUser, 
      reportedProduct, 
      reportType, 
      category, 
      reason 
    } = req.body;

    // Zorunlu alanları kontrol et
    if (!reportType || !category || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Şikayet türü, kategori ve sebep zorunludur'
      });
    }

    // Kategori kontrolü
    if (!['product', 'user', 'message'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz kategori'
      });
    }

    // Şikayet türü kontrolü
    const validReportTypes = ['spam', 'fake', 'inappropriate', 'fraud', 'other'];
    if (!validReportTypes.includes(reportType)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz şikayet türü'
      });
    }

    // Kendi kendini şikayet etme kontrolü
    if (reportedUser === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Kendinizi şikayet edemezsiniz'
      });
    }

    // Şikayetçi kullanıcı ve ürün kontrolü
    if (category === 'user' && reportedUser) {
      const userExists = await User.findById(reportedUser);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: 'Şikayet edilen kullanıcı bulunamadı'
        });
      }
    }

    if (category === 'product' && reportedProduct) {
      const productExists = await Product.findById(reportedProduct);
      if (!productExists) {
        return res.status(404).json({
          success: false,
          message: 'Şikayet edilen ilan bulunamadı'
        });
      }
    }

    // Daha önce aynı şikayet yapılmış mı kontrol et
    const existingReport = await Report.findOne({
      reporter: req.user.id,
      reportedUser: reportedUser || undefined,
      reportedProduct: reportedProduct || undefined,
      category
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'Bu konuda daha önce şikayet oluşturdunuz'
      });
    }

    // Şikayeti oluştur
    const report = await Report.create({
      reporter: req.user.id,
      reportedUser: reportedUser || undefined,
      reportedProduct: reportedProduct || undefined,
      reportType,
      category,
      reason: reason.trim(),
      priority: reportType === 'fraud' ? 'high' : 'medium'
    });

    // Populate ederek geri döndür
    const populatedReport = await Report.findById(report._id)
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email')
      .populate('reportedProduct', 'title category');

    res.status(201).json({
      success: true,
      message: 'Şikayetiniz başarıyla oluşturuldu. En kısa sürede incelenecektir.',
      data: populatedReport
    });

  } catch (error) {
    console.error('Şikayet oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Kullanıcının şikayetlerini getir
// @route   GET /api/reports/my-reports
// @access  Private
router.get('/my-reports', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    const searchConditions = { reporter: req.user.id };
    if (status) searchConditions.status = status;

    const reports = await Report.find(searchConditions)
      .populate('reportedUser', 'name')
      .populate('reportedProduct', 'title')
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
    console.error('Kullanıcı şikayetleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Şikayet detayı getir
// @route   GET /api/reports/:id
// @access  Private (sadece şikayetçi veya admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email university')
      .populate('reportedProduct', 'title category price images')
      .populate('reviewedBy', 'name');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Şikayet bulunamadı'
      });
    }

    // Sadece şikayetçi veya admin görebilir
    if (report.reporter._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bu şikayeti görüntüleme yetkiniz yok'
      });
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('Şikayet detay hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sunucu hatası'
    });
  }
});

// @desc    Şikayet türleri ve kategorileri getir
// @route   GET /api/reports/meta/types
// @access  Private
router.get('/meta/types', protect, (req, res) => {
  res.json({
    success: true,
    data: {
      reportTypes: [
        { value: 'spam', label: 'Spam/İstenmeyen İçerik' },
        { value: 'fake', label: 'Sahte/Yanıltıcı İlan' },
        { value: 'inappropriate', label: 'Uygunsuz İçerik' },
        { value: 'fraud', label: 'Dolandırıcılık' },
        { value: 'other', label: 'Diğer' }
      ],
      categories: [
        { value: 'product', label: 'İlan Şikayeti' },
        { value: 'user', label: 'Kullanıcı Şikayeti' },
        { value: 'message', label: 'Mesaj Şikayeti' }
      ],
      statusTypes: [
        { value: 'pending', label: 'Beklemede', color: 'orange' },
        { value: 'under_review', label: 'İnceleniyor', color: 'blue' },
        { value: 'resolved', label: 'Çözüldü', color: 'green' },
        { value: 'rejected', label: 'Reddedildi', color: 'red' }
      ]
    }
  });
});

module.exports = router;
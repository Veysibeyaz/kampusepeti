// backend/routes/ratingRoutes.js
const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth'); // DÜZELTME: protect import et

// POST /api/ratings - Değerlendirme ekle
router.post('/', protect, async (req, res) => {
  try {
    const { ratedUser, rating, comment, productId } = req.body;

    // Kendi kendini değerlendirme kontrolü
    if (req.user.id === ratedUser) {
      return res.status(400).json({ message: 'Kendinizi değerlendiremezsiniz' });
    }

    // Değerlendirilen kullanıcının var olup olmadığını kontrol et
    const userToRate = await User.findById(ratedUser);
    if (!userToRate) {
      return res.status(404).json({ message: 'Değerlendirilecek kullanıcı bulunamadı' });
    }

    // Daha önce değerlendirme yapılıp yapılmadığını kontrol et
    const existingRating = await Rating.findOne({
      ratingUser: req.user.id,
      ratedUser: ratedUser,
      product: productId
    });

    if (existingRating) {
      return res.status(400).json({ 
        message: 'Bu kullanıcıyı bu ürün için zaten değerlendirdiniz' 
      });
    }

    // Yeni değerlendirme oluştur
    const newRating = new Rating({
      ratingUser: req.user.id,
      ratedUser: ratedUser,
      rating: rating,
      comment: comment,
      product: productId
    });

    await newRating.save();

    // Populate ederek geri döndür
    const populatedRating = await Rating.findById(newRating._id)
      .populate('ratingUser', 'name profilePhoto')
      .populate('ratedUser', 'name')
      .populate('product', 'title');

    // Kullanıcının ortalama puanını güncelle
    await updateUserAverageRating(ratedUser);

    res.status(201).json({
      message: 'Değerlendirme başarıyla eklendi',
      rating: populatedRating
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// GET /api/ratings/:userId - Kullanıcının aldığı değerlendirmeler
router.get('/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const ratings = await Rating.find({ ratedUser: req.params.userId })
      .populate('ratingUser', 'name profilePhoto')
      .populate('product', 'title images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Rating.countDocuments({ ratedUser: req.params.userId });

    // İstatistikler
    const stats = await Rating.aggregate([
      { $match: { ratedUser: req.params.userId } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);

    const ratingStats = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0
    };

    stats.forEach(stat => {
      ratingStats[stat._id] = stat.count;
    });

    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
      : 0;

    res.json({
      ratings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// GET /api/ratings/given/:userId - Kullanıcının verdiği değerlendirmeler
router.get('/given/:userId', protect, async (req, res) => {
  try {
    // Sadece kendi verdiği değerlendirmeleri görebilir
    if (req.user.id !== req.params.userId) {
      return res.status(403).json({ message: 'Bu bilgilere erişim yetkiniz yok' });
    }

    const { page = 1, limit = 10 } = req.query;

    const ratings = await Rating.find({ ratingUser: req.params.userId })
      .populate('ratedUser', 'name profilePhoto')
      .populate('product', 'title images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Rating.countDocuments({ ratingUser: req.params.userId });

    res.json({
      ratings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// PUT /api/ratings/:id - Değerlendirme güncelle
router.put('/:id', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const existingRating = await Rating.findById(req.params.id);
    if (!existingRating) {
      return res.status(404).json({ message: 'Değerlendirme bulunamadı' });
    }

    // Sadece kendi değerlendirmesini güncelleyebilir
    if (existingRating.ratingUser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu değerlendirmeyi güncelleme yetkiniz yok' });
    }

    existingRating.rating = rating;
    existingRating.comment = comment;
    existingRating.updatedAt = Date.now();

    await existingRating.save();

    // Kullanıcının ortalama puanını güncelle
    await updateUserAverageRating(existingRating.ratedUser);

    const updatedRating = await Rating.findById(req.params.id)
      .populate('ratingUser', 'name profilePhoto')
      .populate('ratedUser', 'name')
      .populate('product', 'title');

    res.json({
      message: 'Değerlendirme başarıyla güncellendi',
      rating: updatedRating
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// DELETE /api/ratings/:id - Değerlendirme sil
router.delete('/:id', protect, async (req, res) => {
  try {
    const rating = await Rating.findById(req.params.id);
    if (!rating) {
      return res.status(404).json({ message: 'Değerlendirme bulunamadı' });
    }

    // Sadece kendi değerlendirmesini silebilir veya admin
    if (rating.ratingUser.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bu değerlendirmeyi silme yetkiniz yok' });
    }

    const ratedUserId = rating.ratedUser;
    await Rating.findByIdAndDelete(req.params.id);

    // Kullanıcının ortalama puanını güncelle
    await updateUserAverageRating(ratedUserId);

    res.json({ message: 'Değerlendirme başarıyla silindi' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Yardımcı fonksiyon: Kullanıcının ortalama puanını güncelle
async function updateUserAverageRating(userId) {
  try {
    const ratings = await Rating.find({ ratedUser: userId });
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
      : 0;

    await User.findByIdAndUpdate(userId, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length
    });
  } catch (error) {
    console.error('Ortalama puan güncelleme hatası:', error);
  }
}

module.exports = router;
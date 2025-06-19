// backend/routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth'); // Doğru import - destructuring
const multer = require('multer');
const path = require('path');

// Multer konfigürasyonu (fotoğraf yükleme)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/products/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları yüklenebilir!'), false);
    }
  }
});

// Tüm ürünleri getir (pagination ve filtreleme ile)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Filtreleme parametreleri
    const {
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      university
    } = req.query;

    // MongoDB query objesi oluştur
    let query = { status: 'aktif' };

    // Arama (başlık, açıklama, yazar)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    // Kategori filtresi
    if (category) {
      query.category = category;
    }

    // Durum filtresi
    if (condition) {
      query.condition = condition;
    }

    // Fiyat aralığı filtresi
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Üniversite filtresi
    if (university) {
      query.university = { $regex: university, $options: 'i' };
    }

    console.log('Search Query:', query); // Debug için

    const products = await Product.find(query)
      .populate('seller', 'name email university')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      appliedFilters: {
        search,
        category,
        condition,
        minPrice,
        maxPrice,
        university
      }
    });
  } catch (error) {
    console.error('Products fetch error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Tek ürün detayı getir
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email university phone createdAt');
    
    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    // Görüntülenme sayısını artır
    product.viewCount += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni ürün ekle
router.post('/', [protect, upload.array('images', 5)], async (req, res) => {
  try {
    const {
      title,
      description,
      author,
      category,
      condition,
      price,
      publishYear,
      university,
      department
    } = req.body;

    // Yüklenen fotoğrafların yollarını al
    const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];

    const product = new Product({
      title,
      description,
      author,
      category,
      condition,
      price: parseFloat(price),
      publishYear: publishYear ? parseInt(publishYear) : undefined,
      university,
      department,
      images,
      seller: req.user.id
    });

    const savedProduct = await product.save();
    await savedProduct.populate('seller', 'name email university');

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ürün güncelle
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    // Sadece ürün sahibi güncelleyebilir
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    const allowedUpdates = ['title', 'description', 'price', 'condition', 'status'];
    const updates = {};

    allowedUpdates.forEach(update => {
      if (req.body[update] !== undefined) {
        updates[update] = req.body[update];
      }
    });

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('seller', 'name email university');

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Ürün sil
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Ürün bulunamadı' });
    }

    // Sadece ürün sahibi silebilir
    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ürün başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Kullanıcının ürünlerini getir
router.get('/user/my-products', protect, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
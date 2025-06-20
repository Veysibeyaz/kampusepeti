// backend/routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Tüm route'lar korunmalı (giriş yapmış kullanıcılar için)
router.use(protect);

// @desc    Kullanıcının tüm konuşmalarını getir
// @route   GET /api/messages/conversations
// @access  Private
router.get('/conversations', async (req, res) => {
  try {
    const conversations = await Message.getUserConversations(req.user.id);
    
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Konuşmalar getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Konuşmalar getirilemedi'
    });
  }
});

// @desc    Belirli bir kullanıcıyla konuşmayı getir
// @route   GET /api/messages/conversation/:userId
// @access  Private
router.get('/conversation/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Hedef kullanıcının var olup olmadığını kontrol et
    const targetUser = await User.findById(userId).select('name email');
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Konuşmayı getir
    const messages = await Message.getConversation(
      req.user.id, 
      userId, 
      parseInt(limit)
    );

    // Okunmamış mesajları okundu olarak işaretle
    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user.id,
        isRead: false
      },
      {
        isRead: true
      }
    );

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Eski mesajlar üstte olsun
        targetUser
      }
    });
  } catch (error) {
    console.error('Konuşma getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Konuşma getirilemedi'
    });
  }
});

// @desc    Yeni mesaj gönder
// @route   POST /api/messages
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { receiverId, content, productId } = req.body;

    // Validasyon
    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Alıcı ve mesaj içeriği gerekli'
      });
    }

    if (content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Mesaj içeriği boş olamaz'
      });
    }

    if (receiverId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Kendinize mesaj gönderemezsiniz'
      });
    }

    // Alıcı kullanıcının var olup olmadığını kontrol et
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Alıcı kullanıcı bulunamadı'
      });
    }

    // Eğer ürün ID'si verilmişse, ürünün var olup olmadığını kontrol et
    let product = null;
    if (productId) {
      product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'İlan bulunamadı'
        });
      }
    }

    // Mesajı oluştur
    const message = await Message.create({
      sender: req.user.id,
      receiver: receiverId,
      content: content.trim(),
      product: productId || undefined,
      messageType: productId ? 'product_inquiry' : 'text'
    });

    // Oluşturulan mesajı populate ederek geri döndür
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .populate('product', 'title price images');

    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Mesaj gönderilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj gönderilemedi'
    });
  }
});

// @desc    Mesajı okundu olarak işaretle
// @route   PUT /api/messages/:messageId/read
// @access  Private
router.put('/:messageId/read', async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Mesaj bulunamadı'
      });
    }

    // Sadece alıcı mesajı okundu olarak işaretleyebilir
    if (message.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bu mesajı okundu olarak işaretleme yetkiniz yok'
      });
    }

    message.isRead = true;
    await message.save();

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    console.error('Mesaj okundu işaretlenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Mesaj okundu olarak işaretlenemedi'
    });
  }
});

// @desc    Okunmamış mesaj sayısını getir
// @route   GET /api/messages/unread-count
// @access  Private
router.get('/unread-count', async (req, res) => {
  try {
    const unreadCount = await Message.countDocuments({
      receiver: req.user.id,
      isRead: false
    });

    res.json({
      success: true,
      data: { unreadCount }
    });
  } catch (error) {
    console.error('Okunmamış mesaj sayısı getirilirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Okunmamış mesaj sayısı getirilemedi'
    });
  }
});

// @desc    Belirli bir konuşmadaki tüm mesajları okundu olarak işaretle
// @route   PUT /api/messages/conversation/:userId/read-all
// @access  Private
router.put('/conversation/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;

    await Message.updateMany(
      {
        sender: userId,
        receiver: req.user.id,
        isRead: false
      },
      {
        isRead: true
      }
    );

    res.json({
      success: true,
      message: 'Tüm mesajlar okundu olarak işaretlendi'
    });
  } catch (error) {
    console.error('Mesajlar okundu işaretlenirken hata:', error);
    res.status(500).json({
      success: false,
      message: 'Mesajlar okundu olarak işaretlenemedi'
    });
  }
});

module.exports = router;
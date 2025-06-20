// backend/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false // İlan ile ilgili mesaj değilse boş olabilir
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  isRead: {
    type: Boolean,
    default: false
  },
  messageType: {
    type: String,
    enum: ['text', 'product_inquiry'], // Gelecekte dosya, resim vs eklenebilir
    default: 'text'
  }
}, {
  timestamps: true
});

// Index'ler - performans için
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });
messageSchema.index({ createdAt: -1 });

// Conversation helper - iki kullanıcı arasındaki tüm mesajları getir
messageSchema.statics.getConversation = async function(userId1, userId2, limit = 50) {
  return this.find({
    $or: [
      { sender: userId1, receiver: userId2 },
      { sender: userId2, receiver: userId1 }
    ]
  })
  .populate('sender', 'name email')
  .populate('receiver', 'name email')
  .populate('product', 'title price images')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Kullanıcının tüm konuşmalarını getir (son mesajlarla) - BASİTLEŞTİRİLDİ
messageSchema.statics.getUserConversations = async function(userId) {
  try {
    // Kullanıcının dahil olduğu tüm mesajları getir
    const messages = await this.find({
      $or: [
        { sender: userId },
        { receiver: userId }
      ]
    })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .sort({ createdAt: -1 });

    // Manuel olarak konuşmaları grupla
    const conversationsMap = new Map();

    messages.forEach(message => {
      // Konuşma partnerini belirle
      const partnerId = message.sender._id.toString() === userId.toString() 
        ? message.receiver._id.toString() 
        : message.sender._id.toString();

      // Eğer bu partner için henüz konuşma yoksa ekle
      if (!conversationsMap.has(partnerId)) {
        const partner = message.sender._id.toString() === userId.toString() 
          ? message.receiver 
          : message.sender;

        // Okunmamış mesaj sayısını hesapla
        const unreadCount = messages.filter(msg => 
          msg.sender._id.toString() === partnerId && 
          msg.receiver._id.toString() === userId.toString() && 
          !msg.isRead
        ).length;

        conversationsMap.set(partnerId, {
          partnerId: partner._id,
          partnerName: partner.name,
          partnerEmail: partner.email,
          lastMessage: {
            _id: message._id,
            content: message.content,
            createdAt: message.createdAt,
            isRead: message.isRead,
            sender: message.sender._id
          },
          unreadCount
        });
      }
    });

    // Map'i array'e çevir ve tarihe göre sırala
    return Array.from(conversationsMap.values())
      .sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

  } catch (error) {
    console.error('getUserConversations error:', error);
    return [];
  }
};

module.exports = mongoose.model('Message', messageSchema);
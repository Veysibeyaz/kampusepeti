// frontend/src/services/messageService.js
const API_URL = 'http://localhost:5000/api';

// API istekleri için token'ı header'a ekle
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const messageService = {
  // Tüm konuşmaları getir
  getConversations: async () => {
    try {
      const response = await fetch(`${API_URL}/messages/conversations`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Konuşmalar getirilemedi');
      }

      return await response.json();
    } catch (error) {
      console.error('Konuşmalar getirilirken hata:', error);
      throw error;
    }
  },

  // Belirli bir kullanıcıyla konuşmayı getir
  getConversation: async (userId, page = 1, limit = 50) => {
    try {
      const response = await fetch(`${API_URL}/messages/conversation/${userId}?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Konuşma getirilemedi');
      }

      return await response.json();
    } catch (error) {
      console.error('Konuşma getirilirken hata:', error);
      throw error;
    }
  },

  // Mesaj gönder
  sendMessage: async (receiverId, content, productId = null) => {
    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          receiverId,
          content,
          productId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Mesaj gönderilemedi');
      }

      return await response.json();
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error);
      throw error;
    }
  },

  // Mesajı okundu olarak işaretle
  markAsRead: async (messageId) => {
    try {
      const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Mesaj okundu olarak işaretlenemedi');
      }

      return await response.json();
    } catch (error) {
      console.error('Mesaj okundu işaretlenirken hata:', error);
      throw error;
    }
  },

  // Konuşmadaki tüm mesajları okundu olarak işaretle
  markConversationAsRead: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/messages/conversation/${userId}/read-all`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Mesajlar okundu olarak işaretlenemedi');
      }

      return await response.json();
    } catch (error) {
      console.error('Mesajlar okundu işaretlenirken hata:', error);
      throw error;
    }
  },

  // Okunmamış mesaj sayısını getir
  getUnreadCount: async () => {
    try {
      const response = await fetch(`${API_URL}/messages/unread-count`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Okunmamış mesaj sayısı getirilemedi');
      }

      return await response.json();
    } catch (error) {
      console.error('Okunmamış mesaj sayısı alınırken hata:', error);
      throw error;
    }
  }
};

export default messageService;
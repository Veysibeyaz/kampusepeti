// frontend/src/hooks/useMessageNotification.js
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import messageService from '../services/messageService';

const useMessageNotification = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      
      // Her 30 saniyede bir kontrol et (gerçek zamanlı için)
      const interval = setInterval(fetchUnreadCount, 30000);
      
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await messageService.getUnreadCount();
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Okunmamış mesaj sayısı alınırken hata:', error);
      // Hata durumunda sayıyı sıfırla
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  const refreshUnreadCount = () => {
    fetchUnreadCount();
  };

  return {
    unreadCount,
    loading,
    refreshUnreadCount
  };
};

export default useMessageNotification;
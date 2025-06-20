// frontend/src/components/messages/MessageList.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import messageService from '../../services/messageService';
import './MessageList.css';

const MessageList = ({ onSelectConversation, selectedUserId }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageService.getConversations();
      setConversations(response.data || []);
      setError('');
    } catch (error) {
      setError(error.message || 'Konuşmalar yüklenemedi');
      console.error('Konuşmalar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInMs = now - messageDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes}dk`;
    if (diffInHours < 24) return `${diffInHours}sa`;
    if (diffInDays < 7) return `${diffInDays}g`;
    return messageDate.toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <div className="message-list">
        <div className="message-list-header">
          <h2>💬 Mesajlar</h2>
        </div>
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="message-list">
      <div className="message-list-header">
        <h2>💬 Mesajlar</h2>
        <button onClick={fetchConversations} className="refresh-btn">
          🔄
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="no-conversations">
          <p>Henüz hiç mesajınız yok</p>
          <small>İlan sahipleriyle iletişime geçerek mesajlaşmaya başlayın</small>
        </div>
      ) : (
        <div className="conversations">
          {conversations.map((conversation) => (
            <div
              key={conversation.partnerId}
              className={`conversation-item ${
                selectedUserId === conversation.partnerId ? 'active' : ''
              }`}
              onClick={() => onSelectConversation(conversation.partnerId, conversation.partnerName)}
            >
              <div className="conversation-avatar">
                <div className="avatar-circle">
                  {conversation.partnerName.charAt(0).toUpperCase()}
                </div>
                {conversation.unreadCount > 0 && (
                  <span className="unread-badge">{conversation.unreadCount}</span>
                )}
              </div>

              <div className="conversation-content">
                <div className="conversation-header">
                  <h4>{conversation.partnerName}</h4>
                  <span className="time">
                    {formatTime(conversation.lastMessage.createdAt)}
                  </span>
                </div>
                <div className="last-message">
                  <span className={conversation.unreadCount > 0 ? 'unread' : ''}>
                    {conversation.lastMessage.sender === user.id ? 'Sen: ' : ''}
                    {conversation.lastMessage.content}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageList;
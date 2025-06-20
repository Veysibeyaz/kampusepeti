// frontend/src/components/messages/ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import messageService from '../../services/messageService';
import MessageItem from './MessageItem';
import './ChatWindow.css';

const ChatWindow = ({ selectedUserId, selectedUserName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (selectedUserId) {
      fetchConversation();
      markConversationAsRead();
    }
  }, [selectedUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversation = async () => {
    if (!selectedUserId) return;

    try {
      setLoading(true);
      const response = await messageService.getConversation(selectedUserId);
      setMessages(response.data.messages || []);
      setError('');
    } catch (error) {
      setError(error.message || 'Konuşma yüklenemedi');
      console.error('Konuşma yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async () => {
    if (!selectedUserId) return;

    try {
      await messageService.markConversationAsRead(selectedUserId);
    } catch (error) {
      console.error('Mesajlar okundu işaretlenirken hata:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const response = await messageService.sendMessage(selectedUserId, newMessage.trim());
      
      // Yeni mesajı listeye ekle
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      setError('');
    } catch (error) {
      setError(error.message || 'Mesaj gönderilemedi');
      console.error('Mesaj gönderilirken hata:', error);
    } finally {
      setSending(false);
    }
  };

  // Helper function - mesajın benim olup olmadığını kontrol et
  const isOwnMessage = (message) => {
    if (!user || !message.sender) return false;
    
    // Farklı ID formatlarını kontrol et
    const userId = user._id || user.id;
    const senderId = message.sender._id || message.sender.id;
    
    return senderId?.toString() === userId?.toString();
  };

  if (!selectedUserId) {
    return (
      <div className="chat-window no-conversation">
        <div className="no-conversation-content">
          <h3>💬 Mesajlaşma</h3>
          <p>Mesajlaşmak için sol taraftaki bir konuşmayı seçin</p>
          <small>Henüz mesajınız yoksa, ilanlardan satıcılarla iletişime geçebilirsiniz</small>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-user-info">
          <div className="avatar-circle">
            {selectedUserName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3>{selectedUserName}</h3>
            <span className="status">Aktif</span>
          </div>
        </div>
        <button onClick={fetchConversation} className="refresh-btn">
          🔄
        </button>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {loading ? (
          <div className="loading">Mesajlar yükleniyor...</div>
        ) : error ? (
          <div className="error-message">
            {error}
            <button onClick={fetchConversation}>Tekrar Dene</button>
          </div>
        ) : messages.length === 0 ? (
          <div className="no-messages">
            <p>Henüz hiç mesajınız yok</p>
            <small>İlk mesajınızı göndererek konuşmayı başlatın</small>
          </div>
        ) : (
          <div className="messages-list">
            {messages.map((message) => (
              <MessageItem
                key={message._id}
                message={message}
                isOwn={isOwnMessage(message)}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="message-form">
        <div className="message-input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Mesajınızı yazın..."
            disabled={sending}
            maxLength={1000}
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim() || sending}
            className="send-btn"
          >
            {sending ? '⏳' : '📤'}
          </button>
        </div>
        {newMessage.length > 900 && (
          <small className="char-count">
            {newMessage.length}/1000 karakter
          </small>
        )}
      </form>
    </div>
  );
};

export default ChatWindow;
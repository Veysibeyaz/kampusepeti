// frontend/src/components/messages/MessageItem.js
import React from 'react';
import './MessageItem.css';

const MessageItem = ({ message, isOwn }) => {
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Dün';
    } else {
      return messageDate.toLocaleDateString('tr-TR');
    }
  };

  return (
    <div className={`message-item ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && (
        <div className="message-avatar">
          <div className="avatar-circle small">
            {message.sender.name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      
      <div className="message-content">
        {message.product && (
          <div className="message-product-info">
            <small>💼 İlan hakkında: {message.product.title}</small>
          </div>
        )}
        
        <div className="message-bubble">
          <p>{message.content}</p>
          <div className="message-meta">
            <span className="message-time">
              {formatTime(message.createdAt)}
            </span>
            {isOwn && (
              <span className={`message-status ${message.isRead ? 'read' : 'sent'}`}>
                {message.isRead ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
// frontend/src/pages/Messages.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MessageList from '../components/messages/MessageList';
import ChatWindow from '../components/messages/ChatWindow';
import './Messages.css';

const Messages = () => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const { user, isAuthenticated, loading, initialized } = useAuth();

  // Auth henüz initialize olmadıysa loading göster
  if (!initialized || loading) {
    return (
      <div className="messages-page">
        <div className="auth-loading">
          <h2>⏳ Yükleniyor...</h2>
          <p>Kullanıcı durumu kontrol ediliyor...</p>
        </div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa yönlendir
  if (!isAuthenticated || !user) {
    return (
      <div className="messages-page">
        <div className="auth-required">
          <h2>🔒 Giriş Gerekli</h2>
          <p>Mesajlarınızı görmek için giriş yapmanız gerekiyor.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="login-btn"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  const handleSelectConversation = (userId, userName) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
  };

  return (
    <div className="messages-page">
      <div className="messages-container">
        <div className="messages-sidebar">
          <MessageList 
            onSelectConversation={handleSelectConversation}
            selectedUserId={selectedUserId}
          />
        </div>
        
        <div className="messages-main">
          <ChatWindow 
            selectedUserId={selectedUserId}
            selectedUserName={selectedUserName}
          />
        </div>
      </div>
    </div>
  );
};

export default Messages;
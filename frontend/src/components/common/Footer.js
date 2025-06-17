import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>📚 KampüSepeti</h3>
            <p>Öğrenciler için ikinci el ders kitabı pazaryeri</p>
          </div>
          
          <div className="footer-section">
            <h4>Kategoriler</h4>
            <ul>
              <li>Ders Kitapları</li>
              <li>Notlar</li>
              <li>Kırtasiye</li>
              <li>Elektronik</li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Yardım</h4>
            <ul>
              <li>Nasıl Çalışır?</li>
              <li>Güvenli Alışveriş</li>
              <li>İletişim</li>
              <li>SSS</li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 KampüSepeti. Tüm hakları saklıdır.</p>
          <p>Bitirme Projesi - Veysi Beyaz</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
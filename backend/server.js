const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Database bağlantısı
const connectDB = require('./config/database');

// Express app oluştur
const app = express();

// Veritabanına bağlan
connectDB();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL'i
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files (upload edilen resimler için)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'KampüSepeti API çalışıyor!',
    version: '1.0.0',
    status: 'success'
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes (şimdilik boş, ileride ekleyeceğiz)
 app.use('/api/auth', require('./routes/auth'));
// app.use('/api/products', require('./routes/products'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/messages', require('./routes/messages'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Hata detayı:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler - bu satırı değiştirdik
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route bulunamadı: ${req.method} ${req.path}`,
    availableRoutes: [
      'GET /',
      'GET /health'
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
});
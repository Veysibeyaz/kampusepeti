// backend/server.js - Updated with Admin Routes
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/database');

const app = express();

// Veritabanı bağlantısı
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload klasörlerini oluştur
const uploadsDir = path.join(__dirname, 'uploads');
const profilesDir = path.join(uploadsDir, 'profiles');
const productsDir = path.join(uploadsDir, 'products');

[uploadsDir, profilesDir, productsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('✅ Klasör oluşturuldu:', dir);
  }
});

// ÖNEMLİ: Static files middleware - Routes'tan ÖNCE
console.log('📁 Static files path:', uploadsDir);
app.use('/uploads', express.static(uploadsDir));

// Manuel image serving route
app.get('/uploads/profiles/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(profilesDir, filename);
  
  console.log('🖼️ Image requested:', filename);
  console.log('📁 File exists:', fs.existsSync(filePath));
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ 
      message: 'Profil fotoğrafı bulunamadı',
      filename: filename
    });
  }
});

// Debug routes
app.get('/test-upload', (req, res) => {
  try {
    const profileFiles = fs.existsSync(profilesDir) ? fs.readdirSync(profilesDir) : [];
    res.json({
      message: 'Upload test',
      uploadsDir,
      profilesDir,
      profileFiles,
      sampleUrls: profileFiles.slice(0, 3).map(file => 
        `http://localhost:5000/uploads/profiles/${file}`
      )
    });
  } catch (error) {
    res.json({ error: error.message });
  }
});

// API Routes - Existing
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));

// NEW ADMIN ROUTES - Adım 9
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));

// Ana route
app.get('/', (req, res) => {
  res.json({ 
    message: 'KampüSepeti API çalışıyor!',
    version: '2.0.0 - Admin Panel Eklendi',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      messages: '/api/messages',
      users: '/api/users',
      ratings: '/api/ratings',
      // NEW ENDPOINTS
      admin: '/api/admin',
      reports: '/api/reports'
    },
    adminEndpoints: {
      dashboard: '/api/admin/dashboard',
      users: '/api/admin/users',
      products: '/api/admin/products',
      reports: '/api/admin/reports',
      systemReports: '/api/admin/reports/system'
    },
    uploads: {
      profiles: '/uploads/profiles',
      products: '/uploads/products',
      test: '/test-upload'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('❌ 404 - Route bulunamadı:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route bulunamadı'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server ${PORT} portunda çalışıyor`);
  console.log(`📱 API: http://localhost:${PORT}`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
  console.log(`📸 Profile Photos: http://localhost:${PORT}/uploads/profiles`);
  console.log(`🧪 Test Upload: http://localhost:${PORT}/test-upload`);
  console.log(`👑 Admin Panel: http://localhost:${PORT}/api/admin`);
  console.log(`⚠️ Reports: http://localhost:${PORT}/api/reports`);
});
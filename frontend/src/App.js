// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext'; // Mevcut klasör

// Components
import Navbar from './components/Navbar'; // Mevcut klasör yapısı
import Footer from './components/Footer'; // Mevcut klasör yapısı

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage'; // Tam dosya adı
import RegisterPage from './pages/RegisterPage'; // Tam dosya adı
import AddProduct from './pages/AddProduct';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import MyProducts from './pages/MyProducts';
import UserProfile from './pages/UserProfile';
import Messages from './pages/Messages';

// Styles
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/products" element={<ProductList />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/user/:id" element={<UserProfile />} />
              
              {/* Protected Routes */}
              <Route path="/add-product" element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              } />
              
              <Route path="/my-products" element={
                <ProtectedRoute>
                  <MyProducts />
                </ProtectedRoute>
              } />
              
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
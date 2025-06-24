// frontend/src/App.js - Fixed Imports
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages - Existing (use correct file names)
import HomePage from './pages/HomePage';
import Login from './pages/Login'; // Changed from LoginPage to Login
import Register from './pages/Register'; // Changed from RegisterPage to Register
import AddProduct from './pages/AddProduct';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import MyProducts from './pages/MyProducts';
import UserProfile from './pages/UserProfile';
import Messages from './pages/Messages';
import ProfileEdit from './pages/ProfileEdit';

// NEW PAGES - Admin Panel (Adım 9)
import AdminDashboard from './pages/AdminDashboard';
import UserManagement from './pages/UserManagement';
import ProductModeration from './pages/ProductModeration';
import Reports from './pages/Reports';

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

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
              
              <Route path="/profile/edit" element={
                <ProtectedRoute>
                  <ProfileEdit />
                </ProtectedRoute>
              } />
              
              {/* ADMIN ROUTES - NEW */}
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              
              <Route path="/admin/dashboard" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              
              <Route path="/admin/users" element={
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              } />
              
              <Route path="/admin/products" element={
                <AdminRoute>
                  <ProductModeration />
                </AdminRoute>
              } />
              
              <Route path="/admin/reports" element={
                <AdminRoute>
                  <Reports />
                </AdminRoute>
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
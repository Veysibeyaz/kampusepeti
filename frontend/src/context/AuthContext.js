// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  console.log('🔄 AuthReducer Action:', action.type, action.payload);
  
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
        initialized: true
      };
    case 'LOGIN_FAIL':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
        initialized: true
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
        initialized: true
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SET_INITIALIZED':
      return {
        ...state,
        initialized: true
      };
    case 'RESTORE_SESSION':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        initialized: true,
        loading: false
      };
    default:
      return state;
  }
};

// Initial state with localStorage check - HEMEN KONTROL ET
const getInitialState = () => {
  console.log('🏁 Initial state oluşturuluyor...');
  
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  console.log('📱 Initial localStorage token:', token ? 'VAR' : 'YOK');
  console.log('📱 Initial localStorage user:', userData ? 'VAR' : 'YOK');
  
  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      console.log('✅ Initial user data parse edildi:', user);
      
      // Axios header'ını hemen ayarla
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ Initial token axios header\'a eklendi');
      
      return {
        isAuthenticated: true,
        user: user,
        token: token,
        loading: false,
        error: null,
        initialized: true
      };
    } catch (error) {
      console.error('❌ Initial user data parse hatası:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  
  return {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: false,
    error: null,
    initialized: true
  };
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, getInitialState());

  console.log('🏗️ Auth State:', {
    isAuthenticated: state.isAuthenticated,
    hasUser: !!state.user,
    hasToken: !!state.token,
    initialized: state.initialized
  });

  // Axios default config
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      console.log('✅ Token axios header\'a eklendi (useEffect)');
    } else {
      delete axios.defaults.headers.common['Authorization'];
      console.log('❌ Token axios header\'dan silindi (useEffect)');
    }
  }, [state.token]);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('🔐 Login başlıyor...');
      dispatch({ type: 'LOGIN_START' });

      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;
      console.log('✅ Login başarılı, user:', user);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('💾 Token ve user localStorage\'a kaydedildi');

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user }
      });

      return { success: true };

    } catch (error) {
      console.error('❌ Login hatası:', error);
      const message = error.response?.data?.message || 'Giriş başarısız';
      dispatch({
        type: 'LOGIN_FAIL',
        payload: message
      });
      return { success: false, message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      console.log('📝 Register başlıyor...');
      dispatch({ type: 'LOGIN_START' });

      const response = await axios.post('http://localhost:5000/api/auth/register', userData);

      const { token, user } = response.data;
      console.log('✅ Register başarılı, user:', user);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      console.log('💾 Token ve user localStorage\'a kaydedildi');

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user }
      });

      return { success: true };

    } catch (error) {
      console.error('❌ Register hatası:', error);
      const message = error.response?.data?.message || 'Kayıt başarısız';
      dispatch({
        type: 'LOGIN_FAIL',
        payload: message
      });
      return { success: false, message };
    }
  };

  // Logout function
  const logout = () => {
    console.log('🚪 Logout yapılıyor...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
    console.log('✅ Logout tamamlandı');
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
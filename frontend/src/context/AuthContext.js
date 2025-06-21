// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// YENİ: User data transformer - _id'yi id'ye çevir
const transformUserData = (userData) => {
  if (!userData) return null;
  
  // Eğer _id varsa id'ye çevir
  if (userData._id && !userData.id) {
    userData.id = userData._id;
  }
  
  console.log('🔄 User data transformed:', {
    originalId: userData._id,
    newId: userData.id,
    name: userData.name
  });
  
  return userData;
};

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
        user: transformUserData(action.payload.user), // YENİ: Transform user data
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
        user: transformUserData(action.payload.user), // YENİ: Transform user data
        token: action.payload.token,
        initialized: true,
        loading: false
      };
    case 'UPDATE_USER': // YENİ: User data güncelleme
      return {
        ...state,
        user: transformUserData(action.payload)
      };
    default:
      return state;
  }
};

// Initial state with localStorage check
const getInitialState = () => {
  console.log('🏁 Initial state oluşturuluyor...');
  
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  console.log('📱 Initial localStorage token:', token ? 'VAR' : 'YOK');
  console.log('📱 Initial localStorage user:', userData ? 'VAR' : 'YOK');
  
  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      const transformedUser = transformUserData(user); // YENİ: Transform user data
      console.log('✅ Initial user data parse edildi:', transformedUser);
      
      // Axios header'ını hemen ayarla
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ Initial token axios header\'a eklendi');
      
      return {
        isAuthenticated: true,
        user: transformedUser,
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
    userId: state.user?.id, // YENİ: User ID'yi logla
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

      // YENİ: Transformed user'ı kaydet
      const transformedUser = transformUserData(user);
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(transformedUser));
      console.log('💾 Token ve user localStorage\'a kaydedildi');

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user: transformedUser }
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

      // YENİ: Transformed user'ı kaydet
      const transformedUser = transformUserData(user);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(transformedUser));
      console.log('💾 Token ve user localStorage\'a kaydedildi');

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user: transformedUser }
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

  // YENİ: Update user function
  const updateUser = (userData) => {
    console.log('🔄 User update:', userData);
    const transformedUser = transformUserData(userData);
    
    localStorage.setItem('user', JSON.stringify(transformedUser));
    
    dispatch({
      type: 'UPDATE_USER',
      payload: transformedUser
    });
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
    updateUser, // YENİ
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
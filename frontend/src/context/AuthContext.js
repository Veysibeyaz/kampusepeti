// frontend/src/context/AuthContext.js - Güncellenmiş Versiyon
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
    name: userData.name,
    role: userData.role // ADMIN: Role bilgisini logla
  });
  
  return userData;
};

// Auth reducer (GÜNCELLEME: Admin özellikleri eklendi)
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
      const transformedUser = transformUserData(action.payload.user);
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: transformedUser,
        token: action.payload.token,
        error: null,
        initialized: true,
        // ADMIN: Role-based properties
        isAdmin: transformedUser?.role === 'admin',
        isModerator: transformedUser?.role === 'moderator',
        isAdminOrModerator: transformedUser?.role === 'admin' || transformedUser?.role === 'moderator'
      };
    case 'LOGIN_FAIL':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
        initialized: true,
        // ADMIN: Reset admin properties
        isAdmin: false,
        isModerator: false,
        isAdminOrModerator: false
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
        initialized: true,
        // ADMIN: Reset admin properties
        isAdmin: false,
        isModerator: false,
        isAdminOrModerator: false
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
      const restoredUser = transformUserData(action.payload.user);
      return {
        ...state,
        isAuthenticated: true,
        user: restoredUser,
        token: action.payload.token,
        initialized: true,
        loading: false,
        // ADMIN: Restore admin properties
        isAdmin: restoredUser?.role === 'admin',
        isModerator: restoredUser?.role === 'moderator',
        isAdminOrModerator: restoredUser?.role === 'admin' || restoredUser?.role === 'moderator'
      };
    case 'UPDATE_USER':
      const updatedUser = transformUserData(action.payload);
      return {
        ...state,
        user: updatedUser,
        // ADMIN: Update admin properties
        isAdmin: updatedUser?.role === 'admin',
        isModerator: updatedUser?.role === 'moderator',
        isAdminOrModerator: updatedUser?.role === 'admin' || updatedUser?.role === 'moderator'
      };
    default:
      return state;
  }
};

// Initial state with localStorage check (GÜNCELLEME: Admin properties eklendi)
const getInitialState = () => {
  console.log('🏁 Initial state oluşturuluyor...');
  
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');
  
  console.log('📱 Initial localStorage token:', token ? 'VAR' : 'YOK');
  console.log('📱 Initial localStorage user:', userData ? 'VAR' : 'YOK');
  
  if (token && userData) {
    try {
      const user = JSON.parse(userData);
      const transformedUser = transformUserData(user);
      console.log('✅ Initial user data parse edildi:', transformedUser);
      console.log('🛡️ User role:', transformedUser?.role); // ADMIN: Role logla
      
      // Axios header'ını hemen ayarla
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ Initial token axios header\'a eklendi');
      
      return {
        isAuthenticated: true,
        user: transformedUser,
        token: token,
        loading: false,
        error: null,
        initialized: true,
        // ADMIN: Initial admin properties
        isAdmin: transformedUser?.role === 'admin',
        isModerator: transformedUser?.role === 'moderator',
        isAdminOrModerator: transformedUser?.role === 'admin' || transformedUser?.role === 'moderator'
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
    initialized: true,
    // ADMIN: Default admin properties
    isAdmin: false,
    isModerator: false,
    isAdminOrModerator: false
  };
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, getInitialState());

  console.log('🏗️ Auth State:', {
    isAuthenticated: state.isAuthenticated,
    hasUser: !!state.user,
    userId: state.user?.id,
    userRole: state.user?.role, // ADMIN: Role logla
    isAdmin: state.isAdmin, // ADMIN: Admin status logla
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

  // GÜNCELLEME: Login function - Direkt token ve user kabul etmek için overload
  const login = async (emailOrUser, password) => {
    try {
      console.log('🔐 Login başlıyor...');
      
      // ADMIN: Eğer emailOrUser bir obje ise (user data), direkt login yap
      if (typeof emailOrUser === 'object' && password && typeof password === 'string') {
        const user = emailOrUser;
        const token = password; // Bu durumda password aslında token
        
        console.log('✅ Direct login (Admin panel için):', user);
        
        const transformedUser = transformUserData(user);
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(transformedUser));
        console.log('💾 Token ve user localStorage\'a kaydedildi (Direct)');

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token, user: transformedUser }
        });

        return { success: true };
      }
      
      // Normal email/password login
      dispatch({ type: 'LOGIN_START' });

      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email: emailOrUser,
        password
      });

      const { token, user } = response.data;
      console.log('✅ Login başarılı, user:', user);

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

  // Register function (aynı kalıyor)
  const register = async (userData) => {
    try {
      console.log('📝 Register başlıyor...');
      dispatch({ type: 'LOGIN_START' });

      const response = await axios.post('http://localhost:5000/api/auth/register', userData);

      const { token, user } = response.data;
      console.log('✅ Register başarılı, user:', user);

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

  // Logout function (aynı kalıyor)
  const logout = () => {
    console.log('🚪 Logout yapılıyor...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    dispatch({ type: 'LOGOUT' });
    console.log('✅ Logout tamamlandı');
  };

  // Update user function (aynı kalıyor)
  const updateUser = (userData) => {
    console.log('🔄 User update:', userData);
    const transformedUser = transformUserData(userData);
    
    localStorage.setItem('user', JSON.stringify(transformedUser));
    
    dispatch({
      type: 'UPDATE_USER',
      payload: transformedUser
    });
  };

  // Clear error (aynı kalıyor)
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook (aynı kalıyor)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ADMIN: Named export eklendi (compatibility için)
export { AuthContext };
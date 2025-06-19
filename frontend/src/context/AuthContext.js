// frontend/src/context/AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
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
        error: null
      };
    case 'LOGIN_FAIL':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Axios default config
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, user } = response.data;

      localStorage.setItem('token', token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user }
      });

      return { success: true };

    } catch (error) {
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
      dispatch({ type: 'LOGIN_START' });

      const response = await axios.post('http://localhost:5000/api/auth/register', userData);

      const { token, user } = response.data;

      localStorage.setItem('token', token);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user }
      });

      return { success: true };

    } catch (error) {
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
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Check if user is logged in on app start
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Token varsa kullanıcı bilgilerini getir
      const getProfile = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/profile');
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { token, user: response.data.user }
          });
        } catch (error) {
          // Token geçersizse temizle
          localStorage.removeItem('token');
          dispatch({ type: 'LOGOUT' });
        }
      };
      getProfile();
    }
  }, []);

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
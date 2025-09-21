import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  requiresMfa: false,
  mfaUserId: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_REQUIRE_MFA: 'LOGIN_REQUIRE_MFA',
  LOGOUT: 'LOGOUT',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
  SET_USER: 'SET_USER',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        requiresMfa: false,
        mfaUserId: null,
      };

    case AUTH_ACTIONS.LOGIN_REQUIRE_MFA:
      return {
        ...state,
        requiresMfa: true,
        mfaUserId: action.payload.userId,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start - only if we have a token
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      // No token, user is not authenticated
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return;
    }

    const loadUser = async () => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
        const response = await authService.getProfile();
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.user });
      } catch (error) {
        // Check if we can refresh the token
        try {
          await authService.refreshToken();
          // If refresh succeeds, try to get profile again
          const response = await authService.getProfile();
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.user });
        } catch (refreshError) {
          // Both profile and refresh failed - clear invalid token
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: null });
        }
      }
    };

    loadUser();
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const response = await authService.register(userData);
      
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      toast.success('Registration successful! Please verify your email.');
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await authService.login(credentials);

      if (response.requiresMfa) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_REQUIRE_MFA,
          payload: { userId: response.userId }
        });
        return { requiresMfa: true };
      } else {
        dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: response.user });
        toast.success('Login successful!');
        return response;
      }
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Verify email function
  const verifyEmail = async (email, otp) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const response = await authService.verifyEmail(email, otp);
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: response.user });
      toast.success('Email verified successfully!');
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if logout fails on server, clear local state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      toast.error('Logout error, but you have been signed out locally');
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const response = await authService.updateProfile(profileData);
      dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: response.user });
      toast.success('Profile updated successfully!');
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Change password function
  const changePassword = async (passwordData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const response = await authService.changePassword(passwordData);
      toast.success('Password changed successfully!');
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Forgot password function
  const forgotPassword = async (email) => {
    try {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const response = await authService.forgotPassword(email);
      toast.success('Password reset link sent to your email!');
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (token, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const response = await authService.resetPassword(token, password);
      toast.success('Password reset successfully!');
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Resend OTP function
  const resendOTP = async (email) => {
    try {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const response = await authService.resendOTP(email);
      toast.success('OTP sent successfully!');
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // MFA setup function
  const setupMfa = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const response = await authService.setupMfa();
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // MFA verification function
  const verifyMfa = async (code) => {
    try {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const response = await authService.verifyMfa(code);
      dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: { isMfaEnabled: true } });
      toast.success('MFA enabled successfully!');
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // MFA disable function
  const disableMfa = async (password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
      
      const response = await authService.disableMfa(password);
      dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: { isMfaEnabled: false } });
      toast.success('MFA disabled successfully!');
      
      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    ...state,
    register,
    login,
    logout,
    verifyEmail,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    resendOTP,
    setupMfa,
    verifyMfa,
    disableMfa,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
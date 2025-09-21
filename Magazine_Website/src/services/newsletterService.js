import api from './api';

const newsletterService = {
  // Subscribe to newsletter
  subscribe: async (subscriptionData) => {
    try {
      const response = await api.post('/newsletter/subscribe', subscriptionData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to subscribe to newsletter');
    }
  },

  // Unsubscribe from newsletter
  unsubscribe: async (email) => {
    try {
      const response = await api.post('/newsletter/unsubscribe', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unsubscribe from newsletter');
    }
  },

  // Update subscription preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put('/newsletter/preferences', preferences);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update preferences');
    }
  },

  // Get subscription status
  getSubscriptionStatus: async () => {
    try {
      const response = await api.get('/newsletter/status');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get subscription status');
    }
  },

  // Confirm email subscription
  confirmSubscription: async (token) => {
    try {
      const response = await api.post('/newsletter/confirm', { token });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to confirm subscription');
    }
  },

  // Send email OTP
  sendEmailOtp: async (data) => {
    try {
      const response = await api.post('/newsletter/send-email-otp', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send email OTP');
    }
  },

  // Send phone OTP via WhatsApp
  sendPhoneOtp: async (data) => {
    try {
      const response = await api.post('/newsletter/send-phone-otp', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send phone OTP');
    }
  },

  // Verify email OTP
  verifyEmailOtp: async (data) => {
    try {
      const response = await api.post('/newsletter/verify-email-otp', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid email OTP');
    }
  },

  // Verify phone OTP
  verifyPhoneOtp: async (data) => {
    try {
      const response = await api.post('/newsletter/verify-phone-otp', data);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Invalid phone OTP');
    }
  },

  // Token-based unsubscribe (for email links)
  unsubscribeWithToken: async (token) => {
    try {
      const response = await api.post(`/newsletter/unsubscribe/${token}`, { token });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unsubscribe');
    }
  },

  // Token-based preferences update (for email links)
  updatePreferencesWithToken: async (token, preferences) => {
    try {
      const response = await api.put(`/newsletter/preferences/${token}`, { token, preferences });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update preferences');
    }
  }
};

export { newsletterService };
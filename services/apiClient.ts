


import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'https://f6255912a628.ngrok-free.app/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  withCredentials: false,
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearUserData();
    }
    return Promise.reject(error);
  }
);

// Storage helpers
export const persistUserData = async (token: string, user: any) => {
  await AsyncStorage.setItem('token', token);
  await AsyncStorage.setItem('user', JSON.stringify(user));
};

export const clearUserData = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user');
};

/**
 * Auth Service
 */
export const AuthService = {
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', {
        Email: email,
        Password: password,
      });

      const { Token, User } = response.data;
      if (!Token || !User) throw new Error('Invalid login response');

      await persistUserData(Token, User);
      return { token: Token, user: User };
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error?.response?.data?.message
        ? new Error(error.response.data.message)
        : error;
    }
  },
  resetPin: async (pin:string)=>{

  try {
      const response = await apiClient.post('/auth/reset-pin', {
        pin
        ,
      });

      const { Token, User } = response.data;
      if (!Token || !User) throw new Error('Invalid PIN login response');

      await persistUserData(Token, User);
      return { token: Token, user: User };
    } catch (error: any) {
      console.error('PIN login failed:', error);
      throw error?.response?.data?.message
        ? new Error(error.response.data.message)
        : error;
    }
  },

  logInWithPin: async (userId: string, pin: string) => {
    try {
      const response = await apiClient.post('/auth/pin-login', {
        userId,
        pin,
      });

      const { Token, User } = response.data;
      if (!Token || !User) throw new Error('Invalid PIN login response');

      await persistUserData(Token, User);
      return { token: Token, user: User };
    } catch (error: any) {
      console.error('PIN login failed:', error);
      throw error?.response?.data?.message
        ? new Error(error.response.data.message)
        : error;
    }
  },

  setupPin: async (pin: string) => {
    try {
      const response = await apiClient.post('/auth/setup-pin', {
        pin,
      });

      const { Token, User } = response.data;
      if (!Token || !User) throw new Error('Invalid PIN login response');

      await persistUserData(Token, User);
      return { token: Token, user: User };
    } catch (error: any) {
      console.error('PIN login failed:', error);
      throw error?.response?.data?.message
        ? new Error(error.response.data.message)
        : error;
    }
  },

  logout: async () => {
    await clearUserData();
  },

  getCurrentUser: async () => {
    const json = await AsyncStorage.getItem('user');
    return json ? JSON.parse(json) : null;
  },

  saveDeviceInfo: async (fingerprint: any) => {
    try {
      const result = await apiClient.post('/auth/register-device', {
        VisitorId: fingerprint.visitorId,
        IP: fingerprint.ip,
        Browser: fingerprint.browserName,
        Device: fingerprint.device,
        OperatingSystem: fingerprint.os,
        OSVersion: fingerprint.osVersion,
        Country: 'NO',
        IsVPN: false,
        IsIncognito: fingerprint.incognito,
        IsEmulator: false,
        FirstSeenAt: fingerprint.firstSeenAt.global,
        LastSeenAt: fingerprint.lastSeenAt.global,
      });

      return result.data;
    } catch (error) {
      console.error('Register device failed:', error);
      throw error;
    }
  },
};

/**
 * Location Service
 */
export const LocationService = {
  getUserCountry: async () => {
    try {
      const res = await axios.get('https://ipapi.co/json/');
      return res.data.country_name;
    } catch (error) {
      console.error('Location error:', error);
      return null;
    }
  },
};

/**
 * Transaction Service
 */
export const TransactionService = {
  fetchExchangeRate: async (fromCurrency: string, toCurrency: string) => {

    if (!fromCurrency || !toCurrency)
      throw new Error('Missing currencies');

    try {
      const res = await apiClient.post('/test/rate-exchange', {
        fromCurrency,
        toCurrency,
      });
      return res.data;
    } catch (error) {
      console.error('Exchange fetch failed:', error);
      return {
        EffectiveRate: 1.0621,
        FeeRateNokPerUsd: 0.05,
        ExchangeRate: 1,
        FixedFeeUsd: 2,
        MinimumFeeNok: 0,
        isFallback: true,
      };
    }
  },

  validateAmount: async (amount: number, currency: string) => {
    try {
      const res = await apiClient.post('/test/validate-amount', {
        sendAmount: amount,
        sendCurrency: currency,
      });
      return res.data;
    } catch (error) {
      return {
        isValid: false,
        message: error.response?.data?.error?.message || 'Validation failed',
      };
    }
  },

  initiateTransfer: async (transferData: any) => {
    try {
      const res = await apiClient.post('/test/create-transfer', transferData);
      return res.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.Error || error.message || 'Transfer failed'
      );
    }
  },

  fetchAllTransaction_by_admin: async (filters = {}) => {
    try {
      const res = await apiClient.get('/transfer/transactions/all', {
        params: filters,
      });
      return res.data?.Data ?? [];
    } catch (error) {
      console.error('Admin transaction fetch failed:', error);
      return [];
    }
  },

  fetchAllTransaction: async () => {
    try {
      const res = await apiClient.get('/transfer/transactions/user');
      console.log(res.data.Data);
      return res.data;
    } catch (error) {
      console.error('User transaction fetch failed:', error);
      return [];
    }
  },

  getTransaction: async (transactionId: string) => {
    const res = await apiClient.get(`/test/session/${transactionId}`);
    return res.data;
  },

  getRecentTransaction: async (transactionId: string) => {
    const res = await apiClient.get(`/transfer/recent`);
    return res.data;
  },

  isVPN: async (ip: string) => {
    const res = await apiClient.get('/test/is-vpn', { params: { ip } });
    return res.data;
  },

  transactionLimitTracker: async () => {
    const res = await apiClient.get('/test/transactionLimitTracker');
    return res.data;
  },
};

/**
 * Recipient Service
 */
export const RecipientService = {
  getAllRecipients: async () => {
    const res = await apiClient.get('/recipients/get-all-recipient');
    if (!res.data?.Success) {
      throw new Error(res.data?.Message || 'Request failed');
    }
    return res.data;
  },

  addRecipient: async (data: any) => {
    const res = await apiClient.post('/recipients/by-user', data);
    return res.data;
  },
};

export default apiClient;
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/apiClient';

type User = {
  id: string;
  email: string;
  firstName?: string;
  isKycVerified?: boolean;
  token?: string;
  customerId?: string;
  role?: string;
  visitorId?: string;
  ipAddress?: string;
  countryCode?: string;
  userId?: string;
  stepUpVerificationRequired?: boolean;
  isTrustedDevice?: boolean;
  [key: string]: any;
};

type UserRegistrationData = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  countrySendingFrom: string;
  nationality: string;
  nationalIdentiyNumber: string;
  streetAddress: string;
  postCode: string;
  city: string;
};

type UserContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUserData: (data: Partial<UserRegistrationData>) => void;
  userRegistrationData: UserRegistrationData;
  isKycVerified?: boolean;
  deviceInfo: (data: any) => Promise<void>;
  isLoading: boolean;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const initialRegistrationData: UserRegistrationData = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  email: '',
  password: '',
  countrySendingFrom: '',
  nationality: '',
  nationalIdentiyNumber: '',
  streetAddress: '',
  postCode: '',
  city: '',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRegistrationData, setUserRegistrationData] = useState<UserRegistrationData>(initialRegistrationData);

  const refreshUser = async () => {
    try {
      const userData = await AuthService.getCurrentUser();
      if (!userData) return;

      setUser((prev) => ({
        ...prev,
        ...userData,
        id: userData.Id || userData.id,
        isKycVerified: userData.IsKycVerified || userData.isKycVerified,
      }));
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (!token) {
        setUser(null);
        return;
      }

      const userData = await AuthService.getCurrentUser();
      if (userData) {
        setUser({
          id: userData.Id || userData.id,
          email: userData.Email || userData.email,
          firstName: userData.FirstName || userData.firstName,
          isKycVerified: userData.IsKycVerified || userData.isKycVerified,
          token,
          customerId: userData.CustomerId || userData.customerId,
          role: userData.Role || userData.role,
          ...userData,
        });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await SecureStore.deleteItemAsync('authToken');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void checkAuth();
  }, []);

  const updateUserData = (data: Partial<UserRegistrationData>) => {
    setUserRegistrationData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  const deviceInfo = async (data: any) => {
    try {
      await AuthService.saveDeviceInfo(data);
    } catch (error) {
      console.warn('Device info error:', error);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await AuthService.login(email, password);
      const authToken = response.token || response.Token;
      const userData = response.user || response.User;

      if (!response || !authToken || !userData) {
        throw new Error('Invalid server response');
      }

      const nextUser: User = {
        id: userData.Id || userData.id || response.UserId,
        userId: response.UserId || userData.Id || userData.id,
        email: userData.Email || userData.email || email,
        firstName: userData.FirstName || userData.firstName,
        isKycVerified: userData.IsKycVerified || userData.isKycVerified,
        token: authToken,
        customerId: response.CustomerId || response.customerId || '',
        role: response.Role || response.role || '',
        visitorId: response.VisitorId || response.visitorId || '',
        ipAddress: response.IpAddress || response.ipAddress || '',
        countryCode: response.CountryCode || response.countryCode || '',
        stepUpVerificationRequired: !!(response.StepUpVerificationRequired || response.stepUpVerificationRequired),
        isTrustedDevice: !!(response.IsTrustedDevice || response.isTrustedDevice),
      };

      if (!nextUser.id) {
        throw new Error('User ID not found in response');
      }

      setUser(nextUser);
      setUserRegistrationData((prev) => ({
        ...prev,
        email,
        password,
      }));
      await SecureStore.setItemAsync('authToken', authToken);

      return nextUser;
    } catch (error) {
      console.error('Login failed:', error);
      await SecureStore.deleteItemAsync('authToken');
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('pin');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        updateUserData,
        userRegistrationData,
        isKycVerified: user?.isKycVerified,
        deviceInfo,
        isLoading,
        checkAuth,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

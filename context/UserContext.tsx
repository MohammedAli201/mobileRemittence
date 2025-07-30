// import React, { createContext, ReactNode, useContext, useState } from 'react';
// import { AuthService } from '../services/apiClient'; // make sure this works in Expo

// // Define types for user and registration data
// type User = {
//   id: string;
//   email: string;
//   isKycVerified?: boolean;
//   [key: string]: any;
// };

// type UserRegistrationData = {
//   firstName: string;
//   lastName: string;
//   phoneNumber: string;
//   email: string;
//   password: string;
//   countrySendingFrom: string;
//   nationality: string;
//   nationalIdentiyNumber: string;
//   streetAddress: string;
//   postCode: string;
//   city: string;
// };

// type UserContextType = {
//   user: User | null;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
//   updateUserData: (data: Partial<UserRegistrationData>) => void;
//   userRegistrationData: UserRegistrationData;
//   isKycVerified?: boolean;
//   deviceInfo: (data: any) => Promise<void>;
// };

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export const UserProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);

//   const [userRegistrationData, setUserRegistrationData] = useState<UserRegistrationData>({
//     firstName: '',
//     lastName: '',
//     phoneNumber: '',
//     email: '',
//     password: '',
//     countrySendingFrom: '',
//     nationality: '',
//     nationalIdentiyNumber: '',
//     streetAddress: '',
//     postCode: '',
//     city: '',
//   });

//   const updateUserData = (data: Partial<UserRegistrationData>) => {
//     setUserRegistrationData((prev) => ({
//       ...prev,
//       ...data,
//     }));
//   };

//   const deviceInfo = async (data: any) => {
//     try {
//       await AuthService.saveDeviceInfo(data);
//     } catch (error) {
//       console.warn('Device info error:', error);
//     }
//   };

// // const login = async (email: string, password: string) => {
// //   try {
// //     const response = await AuthService.login(email, password);

// //     // Save token if needed for future requests (e.g. AsyncStorage or SecureStore)
// //     const { Token, User, CustomerId, Role, VisitorId, IpAddress } = response;

// //     // Optionally, store additional fields as needed
// //     setUser({
// //       ...User,
// //       token: Token,
// //       customerId: CustomerId,
// //       role: Role,
// //       visitorId: VisitorId,
// //       ipAddress: IpAddress,
// //     });

// //   } catch (error) {
// //     console.error('Login failed:', error);
// //   }
// // };
// const login = async (email: string, password: string) => {
//   try {
//     const response = await AuthService.login(email, password);

//     const { Token, User, CustomerId, Role, VisitorId, IpAddress } = response;

//     setUser({
//       ...User,
//       token: Token,
//       customerId: CustomerId,
//       role: Role,
//       visitorId: VisitorId,
//       ipAddress: IpAddress,
//     });
//   } catch (error) {
//     console.error('Login failed:', error);
//     throw error; // ✅ This makes sure the screen can catch and respond
//   }
// };

//   const logout = () => {
//     AuthService.logout();
//     setUser(null);
//   };

//   return (
//     <UserContext.Provider
//       value={{
//         user,
//         login,
//         logout,
//         updateUserData,
//         userRegistrationData,
//         isKycVerified: user?.isKycVerified,
//         deviceInfo,
//       }}
//     >
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = (): UserContextType => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error('useUser must be used within a UserProvider');
//   }
//   return context;
// };
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/apiClient';

// Define types for user and registration data
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

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRegistrationData, setUserRegistrationData] = useState<UserRegistrationData>({
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
  });

  // Refresh user data from API
  const refreshUser = async () => {
    try {
      const userData = await AuthService.getCurrentUser();
      if (userData) {
        setUser(prev => ({
          ...prev,
          ...userData,
          id: userData.Id || userData.id,
          isKycVerified: userData.IsKycVerified || userData.isKycVerified
        }));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  // Check authentication state on initial load
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
          ...userData
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
    checkAuth();
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
    console.log("Login response:", response); // Debug log
    
    // Handle both possible response structures (token/Token and user/User)
    const authToken = response.token || response.Token;
    const userData = response.user || response.User;

    if (!response || !authToken || !userData) {
      throw new Error('Invalid server response');
    }

    const user = {
      id: userData.Id || userData.id,
      email: email, // Using the email from login since it's not in the user object
      firstName: userData.FirstName || userData.firstName,
      isKycVerified: userData.IsKycVerified || userData.isKycVerified,
      token: authToken,
      // These fields might not be in your response, so we provide defaults
      customerId: response.CustomerId || response.customerId || '',
      role: response.Role || response.role || '',
      visitorId: response.VisitorId || response.visitorId || '',
      ipAddress: response.IpAddress || response.ipAddress || '',
    };

    if (!user.id) {
      throw new Error('User ID not found in response');
    }

    console.log("Processed user data:", user); // Debug log
    setUser(user);
    
    await SecureStore.setItemAsync('authToken', authToken);

    return user;
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
      // Clear secure storage
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
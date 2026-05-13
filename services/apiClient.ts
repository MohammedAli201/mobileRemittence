import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const normalizeApiBaseUrl = (rawUrl?: string) => {
  const normalized = rawUrl?.trim().replace(/\/+$/, "");

  if (normalized) {
    return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
  }

  throw new Error(
    "EXPO_PUBLIC_API_URL is required. Set it in .env — update the ngrok URL each session.\n" +
    "Example: EXPO_PUBLIC_API_URL=https://xxxx.ngrok-free.app/api\n" +
    "Then restart with: npx expo start --clear",
  );
};

// EXPO_PUBLIC_API_URL is baked into the bundle at build time by Metro.
// After changing the .env value you MUST restart with: npx expo start --clear
const API_BASE_URL = normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  },
  withCredentials: false,
});

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await clearUserData();
    }
    return Promise.reject(error);
  },
);

// Storage helpers
export const persistUserData = async (token: string, user: any) => {
  await Promise.all([
    SecureStore.setItemAsync("authToken", token),
    AsyncStorage.setItem("user", JSON.stringify(user)),
  ]);
};

export const clearUserData = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync("authToken"),
    AsyncStorage.removeItem("user"),
  ]);
};

/**
 * Auth Service
 */
export const AuthService = {
  register: async (payload: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    countrySendingFrom: string;
    nationalIdentityNumber: string;
    streetAddress: string;
    postCode: string;
    city: string;
    phoneNumber: string;
    baseCurrency: string;
    countryCode: string;
    pin: string;
    IpAddress?: string;
    VisitorId?: string;
    termsAccepted: boolean;
  }) => {
    const candidateEndpoints = ["/auth/register", "/auth/signup"];

    let lastError: Error | null = null;

    for (const endpoint of candidateEndpoints) {
      try {
        const response = await apiClient.post(endpoint, {
          email: payload.email.trim().toLowerCase(),
          password: payload.password,
          confirmPassword: payload.confirmPassword,
          firstName: payload.firstName.trim(),
          lastName: payload.lastName.trim(),
          dateOfBirth: payload.dateOfBirth,
          countrySendingFrom: payload.countrySendingFrom,
          nationalIdentityNumber: payload.nationalIdentityNumber,
          streetAddress: payload.streetAddress,
          postCode: payload.postCode,
          city: payload.city,
          phoneNumber: payload.phoneNumber,
          baseCurrency: payload.baseCurrency,
          countryCode: payload.countryCode,
          pin: payload.pin,
          IpAddress: payload.IpAddress || "",
          VisitorId: payload.VisitorId || "",
          termsAccepted: payload.termsAccepted,
        });

        const data = response.data ?? {};
        const nested = data.Data || data.data || data;
        const token = nested.Token || nested.token;
        const user = nested.User || nested.user;

        if (token && user) {
          await persistUserData(token, {
            ...nested,
            ...user,
          });
        }

        return nested;
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 404 || status === 405) {
          lastError = error;
          continue;
        }

        throw error?.response?.data?.message
          ? new Error(error.response.data.message)
          : error;
      }
    }

    throw new Error(lastError?.message || "Registration is not available right now.");
  },
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post("/auth/login", {
        Email: email,
        Password: password,
      });

      const data = response.data ?? {};
      const Token = data.Token || data.token;
      const User = data.User || data.user;
      if (!Token || !User) throw new Error("Invalid login response");

      await persistUserData(Token, {
        ...data,
        ...User,
      });
      return data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && !error.response) {
        throw new Error(`Cannot reach server at ${API_BASE_URL}/auth/login.`);
      }
      throw error?.response?.data?.message
        ? new Error(error.response.data.message)
        : error;
    }
  },
  resetPin: async (pin: string) => {
    try {
      const response = await apiClient.post("/auth/reset-pin", {
        pin,
      });

      const data = response.data ?? {};
      const Token = data.Token || data.token;
      const User = data.User || data.user;
      if (!Token || !User) throw new Error("Invalid PIN login response");

      await persistUserData(Token, User);
      return { token: Token, user: User };
    } catch (error: any) {
      throw error?.response?.data?.message
        ? new Error(error.response.data.message)
        : error;
    }
  },

  logInWithPin: async (email: string, pin: string) => {
    try {
      const response = await apiClient.post("/auth/pin-login", {
        email: email.trim().toLowerCase(),
        pin,
      });

      const data = response.data ?? {};
      const payload = data.Data || data.data || data;
      const token = payload.Token || payload.token;
      const user = payload.User || payload.user;

      if (!token || !user) throw new Error("Invalid PIN login response");

      await persistUserData(token, {
        ...payload,
        ...user,
      });
      return { token, user, ...payload };
    } catch (error: any) {
      throw error?.response?.data?.message
        ? new Error(error.response.data.message)
        : error;
    }
  },

  setupPin: async (pin: string, currentPassword: string) => {
    try {
      const response = await apiClient.post("/auth/setup-pin", {
        pin,
        currentPassword,
      });

      const { Token, User } = response.data ?? {};

      if (Token && User) {
        await persistUserData(Token, User);
        return { token: Token, user: User, ...response.data };
      }

      return response.data;
    } catch (error: any) {
      throw error?.response?.data?.message
        ? new Error(error.response.data.message)
        : error;
    }
  },

  logout: async () => {
    await clearUserData();
  },

  getCurrentUser: async () => {
    const json = await AsyncStorage.getItem("user");
    return json ? JSON.parse(json) : null;
  },

  saveDeviceInfo: async (fingerprint: any) => {
    try {
      const result = await apiClient.post("/auth/register-device", {
        VisitorId: fingerprint.visitorId,
        IP: fingerprint.ip,
        Browser: fingerprint.browserName,
        Device: fingerprint.device,
        OperatingSystem: fingerprint.os,
        OSVersion: fingerprint.osVersion,
        Country: "NO",
        IsVPN: false,
        IsIncognito: fingerprint.incognito,
        IsEmulator: false,
        FirstSeenAt: fingerprint.firstSeenAt.global,
        LastSeenAt: fingerprint.lastSeenAt.global,
      });

      return result.data;
    } catch (error) {
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
      const res = await axios.get("https://ipapi.co/json/");
      return res.data.country_name;
    } catch {
      return null;
    }
  },
};

/**
 * Transaction Service
 */
export const TransactionService = {
  fetchExchangeRate: async (fromCurrency: string, toCurrency: string) => {
    if (!fromCurrency || !toCurrency) throw new Error("Missing currencies");

    try {
      const res = await apiClient.post("/transfer/quote", {
        sendAmount: 1000,
        sendCurrency: fromCurrency,
        receiveCurrency: toCurrency,
      });
      return res.data?.Data ?? res.data;
    } catch {
      return {
        quoteId: "",
        sendAmount: 1000,
        sendCurrency: fromCurrency,
        receiveAmount: 1000,
        receiveCurrency: toCurrency,
        fee: 0,
        totalAmount: 1000,
        EffectiveRate: 1.0621,
        FeeRateNokPerUsd: 0.05,
        ExchangeRate: 1,
        FixedFeeUsd: 2,
        MinimumFeeNok: 0,
        isFallback: true,
      };
    }
  },

  createQuote: async (payload: {
    sendAmount: number;
    sendCurrency: string;
    receiveCurrency: string;
  }) => {
    const res = await apiClient.post("/transfer/quote", payload);
    return res.data?.Data ?? res.data;
  },

  validateAmount: async (amount: number, currency: string) => {
    try {
      const res = await apiClient.post("/test/validate-amount", {
        sendAmount: amount,
        sendCurrency: currency,
      });
      return res.data;
    } catch (error: any) {
      return {
        isValid: false,
        message: error.response?.data?.error?.message || "Validation failed",
      };
    }
  },

  initiateTransfer: async (transferData: any) => {
    try {
      const res = await apiClient.post("/test/create-transfer", transferData);
      return res.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.Error || error.message || "Transfer failed",
      );
    }
  },

  createPaymentSession: async (transferData: any) => {
    try {
      const idempotencyKey =
        transferData?.idempotencyKey ||
        transferData?.IdempotencyKey ||
        `mobile-${Date.now()}`;
      const payload = {
        ...transferData,
        idempotencyKey: idempotencyKey,
      };
      const requestHeaders = {
        "Idempotency-Key": idempotencyKey,
        "idempotency-key": idempotencyKey,
        "X-Idempotency-Key": idempotencyKey,
      };

      const res = await apiClient.request({
        url: "/transfers",
        method: "POST",
        data: payload,
        headers: requestHeaders,
      });

      return res.data?.Data ?? res.data;
    } catch (error: any) {
      const responseData = error?.response?.data;
      const validationMessage =
        responseData?.errors
          ? Object.values(responseData.errors)
              .flat()
              .filter(Boolean)
              .join(", ")
          : null;

      throw new Error(
        validationMessage ||
          responseData?.message ||
          responseData?.Message ||
          responseData?.error ||
          responseData?.title ||
          error?.message ||
          "Payment session setup failed",
      );
    }
  },

  confirmTransferAfterPayment: async (payload: any) => {
    const idempotencyKey =
      payload?.idempotencyKey ||
      payload?.IdempotencyKey ||
      `mobile-confirm-${Date.now()}`;
    const requestPayload = {
      ...payload,
      idempotencyKey,
    };
    const requestHeaders = {
      "Idempotency-Key": idempotencyKey,
      "idempotency-key": idempotencyKey,
      "X-Idempotency-Key": idempotencyKey,
    };
    const transactionId =
      requestPayload?.transactionId ||
      requestPayload?.TransactionId ||
      requestPayload?.transferId ||
      requestPayload?.TransferId ||
      null;

    if (!transactionId) {
      throw new Error("transactionId is required to check payment status");
    }

    const paymentStatusEndpoint = `/transfers/${transactionId}/payment`;
    console.log("[confirmTransferAfterPayment] Checking payment status", {
      endpoint: paymentStatusEndpoint,
      transactionId,
    });

    try {
      const paymentStatusRes = await apiClient.get(paymentStatusEndpoint, {
        headers: requestHeaders,
      });
      const paymentStatusData =
        paymentStatusRes?.data?.Data ?? paymentStatusRes?.data ?? {};
      const transferStatus = String(
        paymentStatusData?.status ?? paymentStatusData?.Status ?? "",
      )
        .trim()
        .toLowerCase();
      const workflowStage = String(
        paymentStatusData?.workflowStage ?? paymentStatusData?.WorkflowStage ?? "",
      )
        .trim()
        .toLowerCase();
      const isPaid =
        transferStatus === "paid" ||
        workflowStage === "paid";

      console.log("[confirmTransferAfterPayment] Payment status response", {
        endpoint: paymentStatusEndpoint,
        status: paymentStatusRes.status,
        data: paymentStatusData,
      });
      if (!isPaid) {
        throw new Error(
          `Transfer is pending payment (status: ${paymentStatusData?.status ?? "unknown"}, workflowStage: ${paymentStatusData?.workflowStage ?? "unknown"}).`,
        );
      }

      return paymentStatusData;
    } catch (error: any) {
      console.log("[confirmTransferAfterPayment] Payment status request failed", {
        endpoint: paymentStatusEndpoint,
        status: error?.response?.status,
        responseData: error?.response?.data,
        message: error?.message,
      });
      throw new Error(
        error?.response?.data?.message ||
          error?.response?.data?.Message ||
          error?.response?.data?.error ||
          error?.message ||
          "Payment status check failed",
      );
    }
  },

  fetchAllTransaction_by_admin: async (filters = {}) => {
    try {
      const res = await apiClient.get("/transfer/transactions/all", {
        params: filters,
      });
      return res.data?.Data ?? [];
    } catch {
      return [];
    }
  },

  fetchAllTransaction: async () => {
    try {
      const res = await apiClient.get("/transfer/transactions/user");
      return res.data;
    } catch {
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
    const res = await apiClient.get("/test/is-vpn", { params: { ip } });
    return res.data;
  },

  transactionLimitTracker: async () => {
    const res = await apiClient.get("/test/transactionLimitTracker");
    return res.data;
  },

  getSendingLimits: async () => {
    const res = await apiClient.get("/transfers/sending-limits");
    return res.data?.Data ?? res.data?.data ?? res.data;
  },
};

/**
 * Recipient Service
 */
export const RecipientService = {
  getAllRecipients: async () => {
    const res = await apiClient.get("/recipients/get-all-recipient");
    return res.data;
  },

  addRecipient: async (data: any) => {
    const res = await apiClient.post("/recipients", data);
    return res.data?.Data ?? res.data;
  },
};

export default apiClient;

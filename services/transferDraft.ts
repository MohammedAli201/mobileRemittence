import AsyncStorage from "@react-native-async-storage/async-storage";
import { RecipientProfile, TransferService } from "./remittance";

export type TransferRecipient = RecipientProfile & {
  avatarColor: string;
};

export type TransferDraft = {
  entryPoint: "direct_send" | "repeat_send";
  quoteId: string;
  sendAmount: number;
  useBonus: boolean;
  provider: string;
  sendCurrency: string;
  sendCountry: string;
  receiveAmount: number;
  receiveCurrency: string;
  exchangeRate: number;
  receivingMethod: string;
  receivingCountry: string;
  providerName: string;
  service: TransferService | "";
  paymentMethod: string;
  recipient: TransferRecipient;
  reason: string;
  fees: number;
  totalAmount: number;
};

const TRANSFER_DRAFT_KEY = "transfer_draft_v1";

export const defaultTransferDraft: TransferDraft = {
  entryPoint: "direct_send",
  quoteId: "",
  sendAmount: 0,
  useBonus: false,
  provider: "",
  sendCurrency: "NOK",
  sendCountry: "Norway",
  receiveAmount: 0,
  receiveCurrency: "",
  exchangeRate: 0,
  paymentMethod: "",
  receivingMethod: "",
  receivingCountry: "",
  providerName: "Frankfurter",
  service: "",
  recipient: {
    firstName: "",
    lastName: "",
    relationshipToSender: "",
    phoneNumber: "",
    avatarColor: "#CCCCCC",
    receivingCountry: "SO",
    countryOfCitizenship: "SO",
    address: "",
    city: "",
    provider: "",
    service: "MobileMoney",
  },
  reason: "",
  fees: 0,
  totalAmount: 0,
};

let currentTransferDraft: TransferDraft = defaultTransferDraft;

const persistDraft = async () => {
  try {
    await AsyncStorage.setItem(
      TRANSFER_DRAFT_KEY,
      JSON.stringify(currentTransferDraft),
    );
  } catch {
  }
};

export const hydrateTransferDraft = async () => {
  try {
    const raw = await AsyncStorage.getItem(TRANSFER_DRAFT_KEY);
    if (!raw) {
      currentTransferDraft = defaultTransferDraft;
      return currentTransferDraft;
    }

    const parsed = JSON.parse(raw) as Partial<TransferDraft>;
    currentTransferDraft = {
      ...defaultTransferDraft,
      ...parsed,
      recipient: {
        ...defaultTransferDraft.recipient,
        ...(parsed.recipient || {}),
      },
    };
    return currentTransferDraft;
  } catch {
    currentTransferDraft = defaultTransferDraft;
    return currentTransferDraft;
  }
};

export const getTransferDraft = () => currentTransferDraft;

export const mergeTransferDraft = (updates: Partial<TransferDraft>) => {
  currentTransferDraft = {
    ...currentTransferDraft,
    ...updates,
    recipient: {
      ...currentTransferDraft.recipient,
      ...(updates.recipient || {}),
    },
  };

  void persistDraft();
  return currentTransferDraft;
};

export const resetTransferDraft = () => {
  currentTransferDraft = defaultTransferDraft;
  void AsyncStorage.removeItem(TRANSFER_DRAFT_KEY);
  return currentTransferDraft;
};

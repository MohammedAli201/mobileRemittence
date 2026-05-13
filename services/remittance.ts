export type CountryCode = "NO" | "SO" | "KE" | "ET" | "UG" | "TZ";

export type TransferService = "MobileMoney" | "BankTransfer" | "CashCollection";
export type RecipientServiceType = "MobileWallet" | "BankDeposit" | "CashPickup";

export type RecipientProfile = {
  id?: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  relationshipToSender: string;
  receivingCountry: CountryCode;
  countryOfCitizenship: CountryCode;
  address: string;
  city: string;
  provider?: string;
  service: TransferService;
};

const countryNameToCodeMap: Record<string, CountryCode> = {
  NORWAY: "NO",
  NO: "NO",
  SOMALIA: "SO",
  SO: "SO",
  KENYA: "KE",
  KE: "KE",
  ETHIOPIA: "ET",
  ET: "ET",
  UGANDA: "UG",
  UG: "UG",
  TANZANIA: "TZ",
  TZ: "TZ",
};

const countryCodeToNameMap: Record<CountryCode, string> = {
  NO: "Norway",
  SO: "Somalia",
  KE: "Kenya",
  ET: "Ethiopia",
  UG: "Uganda",
  TZ: "Tanzania",
};

const countryCurrencyMap: Record<CountryCode, string> = {
  NO: "NOK",
  SO: "USD",
  KE: "KES",
  ET: "ETB",
  UG: "UGX",
  TZ: "TZS",
};

export const normalizeCountryCode = (value: string): CountryCode => {
  const normalized = value.trim().toUpperCase();
  return countryNameToCodeMap[normalized] || "SO";
};

export const getCountryNameFromCode = (code: string) =>
  countryCodeToNameMap[normalizeCountryCode(code)];

export const getCurrencyForCountry = (country: string) =>
  countryCurrencyMap[normalizeCountryCode(country)];

export const normalizePersonName = (value: string) => value.trim().toUpperCase();

export const normalizePhoneE164 = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const normalized = digits.startsWith("00") ? digits.slice(2) : digits;
  return `+${normalized}`;
};

export const mapTransferServiceToRecipientService = (
  service: TransferService | string,
): RecipientServiceType => {
  if (service === "BankTransfer") return "BankDeposit";
  if (service === "CashCollection") return "CashPickup";
  return "MobileWallet";
};

export const createRecipientApiPayload = (profile: RecipientProfile) => ({
  receivingCountry: normalizeCountryCode(profile.receivingCountry),
  countryOfCitizenship: normalizeCountryCode(profile.countryOfCitizenship),
  phoneNumber: normalizePhoneE164(profile.phoneNumber),
  firstName: normalizePersonName(profile.firstName),
  lastName: normalizePersonName(profile.lastName),
  address: profile.address.trim(),
  city: profile.city.trim(),
  provider: profile.provider?.trim() || "",
  service: mapTransferServiceToRecipientService(profile.service),
  relationshipToSender: profile.relationshipToSender.trim() || "Friend",
});

export const createTransferRecipientPayload = (profile: RecipientProfile) => ({
  receivingCountry: normalizeCountryCode(profile.receivingCountry),
  countryOfCitizenship: normalizeCountryCode(profile.countryOfCitizenship),
  phoneNumber: normalizePhoneE164(profile.phoneNumber),
  firstName: normalizePersonName(profile.firstName),
  lastName: normalizePersonName(profile.lastName),
  address: profile.address.trim(),
  city: profile.city.trim(),
  service: profile.service,
  relationshipToSender: profile.relationshipToSender.trim() || "Friend",
});

export const createRecipientProfile = (
  input: Partial<RecipientProfile>,
  fallbackService: TransferService = "MobileMoney",
): RecipientProfile => ({
  id: input.id,
  firstName: input.firstName?.trim() || "",
  lastName: input.lastName?.trim() || "",
  phoneNumber: normalizePhoneE164(input.phoneNumber || ""),
  relationshipToSender: input.relationshipToSender?.trim() || "",
  receivingCountry: normalizeCountryCode(input.receivingCountry || "SO"),
  countryOfCitizenship: normalizeCountryCode(
    input.countryOfCitizenship || input.receivingCountry || "SO",
  ),
  address: input.address?.trim() || "",
  city: input.city?.trim() || "",
  provider: input.provider?.trim() || "",
  service: (input.service as TransferService) || fallbackService,
});

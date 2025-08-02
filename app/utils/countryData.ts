// utils/countryData.ts
export const countryData = {
  somalia: {
    name: "Somalia",
    flag: "🇸🇴",
    code: "+252",
    currency: "SOS"
  },
  kenya: {
    name: "Kenya",
    flag: "🇰🇪",
    code: "+254",
    currency: "KES"
  },
  uganda: {
    name: "Uganda",
    flag: "🇺🇬",
    code: "+256",
    currency: "UGX"
  },
  ethiopia: {
    name: "Ethiopia",
    flag: "🇪🇹",
    code: "+251",
    currency: "ETB"
  }
};

export type CountryCode = keyof typeof countryData;
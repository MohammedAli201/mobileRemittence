// // utils/countryUtils.ts
// import flagMap from '../flagMap';

// // Map country names to ISO country codes
// export const countryCodeMap: Record<string, string> = {
//   'norway': 'no',
//   'somalia': 'so',
//   'kenya': 'ke',
//   'uganda': 'ug',
//   'tanzania': 'tz',
//   'ethiopia': 'et',
//   'djibouti': 'dj',
//   'united states': 'us',
//   // Add more mappings as needed
// };

// // Get flag image for a country name
// export const getFlagForCountry = (countryName: string) => {
//   if (!countryName) return flagMap.us; // Fallback to US flag
  
//   const lowerCaseCountry = countryName.toLowerCase();
//   const countryCode = countryCodeMap[lowerCaseCountry] || 'us';
//   return flagMap[countryCode] || flagMap.us;
// };

// utils/countryUtils.ts
import flagMap from '../flagMap';

// Map country names to country data
export const countryData: Record<string, {
  name: string;
  code: string;
  flag: any; // This will be your image from flagMap
  phoneCode: string;
}> = {
  'somalia': {
    name: 'Somalia',
    code: 'SO',
    flag: flagMap.so, // Assuming flagMap has 'so' for Somalia
    phoneCode: '+252'
  },
  'kenya': {
    name: 'Kenya',
    code: 'KE',
    flag: flagMap.ke,
    phoneCode: '+254'
  },
  'uganda': {
    name: 'Uganda',
    code: 'UG',
    flag: flagMap.ug,
    phoneCode: '+256'
  },
  'ethiopia': {
    name: 'Ethiopia',
    code: 'ET',
    flag: flagMap.et,
    phoneCode: '+251'
  },
  // Add more countries as needed
};

export const getCountryData = (countryName: string) => {
  if (!countryName) return countryData.somalia; // Default fallback
  return countryData[countryName.toLowerCase()] || countryData.somalia;
};
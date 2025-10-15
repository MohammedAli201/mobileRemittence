
// utils/countryUtils.ts
import flagMap from '../app/flagMap';

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
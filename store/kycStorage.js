// store/kycStorage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const KYC_KEY = "kyc_data";

export const saveKYC = async (data) => {
  try {
    await AsyncStorage.setItem(KYC_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Error saving KYC:", err);
  }
};

export const getKYC = async () => {
  try {
    const json = await AsyncStorage.getItem(KYC_KEY);
    return json ? JSON.parse(json) : null;
  } catch (err) {
    console.error("Error reading KYC:", err);
    return null;
  }
};

export const clearKYC = async () => {
  try {
    await AsyncStorage.removeItem(KYC_KEY);
  } catch (err) {
    console.error("Error clearing KYC:", err);
  }
};

// corret code............................................................................................................................
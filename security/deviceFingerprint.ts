import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as Network from 'expo-network';

export const getDeviceSignals = async () => {
  const isEmulator = !Device.isDevice;
  const isRooted = await checkJailbreak();

  let androidId = null;
  let iosVendorId = null;
  let ipAddress = null;

  try {
 androidId = await Application.getAndroidId?.(); // fallback-compatible

  } catch (e) {
    androidId = null;
  }

  try {
    iosVendorId = await Application.getIosIdForVendorAsync?.(); // avoid crashing on Android
  } catch (e) {
    iosVendorId = null;
  }

  try {
    ipAddress = await Network.getIpAddressAsync();
  } catch (e) {
    ipAddress = null;
  }

  return {
    os: {
      buildId: Device.osBuildId,
      version: Device.osVersion,
    },
    hardware: {
      model: Device.modelName,
      memory: Device.totalMemory,
      processorCores: Device.supportedCpuArchitectures?.length ?? null,
    },
    identifiers: {
      androidId,
      iosVendorId,
      ipAddress,
    },
    environment: {
      isEmulator,
      isRooted,
    },
    app: {
      applicationId: Application.applicationId,
      installTime: (await Application.getInstallationTimeAsync())?.getTime?.() ?? null,
    },
  };
};

export const generateFingerprint = async () => {
  const signals = await getDeviceSignals();
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    JSON.stringify(signals)
  );
  return hash.slice(0, 16); // Shortened fingerprint
};

// ❗ Fake jailbreak/root check – should be replaced for real detection
const checkJailbreak = async () => {
  return (
    (await Application.getIosIdForVendorAsync?.()) === null &&
    Device.isDevice
  );
};

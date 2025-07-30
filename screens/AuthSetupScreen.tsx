// // screens/AuthSetupScreen.tsx
// import React, { useState } from 'react';
// import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import AuthService from '../../services/AuthService';

// const AuthSetupScreen = ({ navigation }) => {
//   const [authMethod, setAuthMethod] = useState<'biometric' | 'pin' | null>(null);
//   const [pin, setPin] = useState('');
//   const [confirmPin, setConfirmPin] = useState('');
//   const [step, setStep] = useState<'method' | 'setup'>('method');

//   const handleSelectMethod = async (method: 'biometric' | 'pin') => {
//     if (method === 'biometric') {
//       const hasBiometric = await AuthService.hasBiometricAuth();
//       if (!hasBiometric) {
//         Alert.alert('Biometric not available', 'Your device does not support biometric authentication or you need to set it up in your device settings.');
//         return;
//       }
//       await AuthService.setupPin('biometric-auth');
//       navigation.replace('App');
//     } else {
//       setAuthMethod(method);
//       setStep('setup');
//     }
//   };

//   const handleSetupPin = async () => {
//     if (pin.length !== 4) {
//       Alert.alert('Invalid PIN', 'PIN must be 4 digits');
//       return;
//     }

//     if (pin !== confirmPin) {
//       Alert.alert('PINs do not match', 'Please enter matching PINs');
//       return;
//     }

//     const success = await AuthService.setupPin(pin);
//     if (success) {
//       navigation.replace('App');
//     } else {
//       Alert.alert('Error', 'Failed to setup PIN');
//     }
//   };

//   if (step === 'method') {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.title}>Secure Your Account</Text>
//         <Text style={styles.subtitle}>Choose how you want to authenticate:</Text>
        
//         <TouchableOpacity 
//           style={styles.button}
//           onPress={() => handleSelectMethod('biometric')}
//         >
//           <Text style={styles.buttonText}>Use Biometric (Fingerprint/Face ID)</Text>
//         </TouchableOpacity>
        
//         <TouchableOpacity 
//           style={styles.button}
//           onPress={() => handleSelectMethod('pin')}
//         >
//           <Text style={styles.buttonText}>Use 4-digit PIN</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Set Up Your PIN</Text>
//       <Text style={styles.subtitle}>Enter a 4-digit PIN you'll remember</Text>
      
//       <TextInput
//         style={styles.input}
//         placeholder="Enter 4-digit PIN"
//         keyboardType="numeric"
//         secureTextEntry
//         maxLength={4}
//         value={pin}
//         onChangeText={setPin}
//       />
      
//       <TextInput
//         style={styles.input}
//         placeholder="Confirm 4-digit PIN"
//         keyboardType="numeric"
//         secureTextEntry
//         maxLength={4}
//         value={confirmPin}
//         onChangeText={setConfirmPin}
//       />
      
//       <TouchableOpacity 
//         style={styles.button}
//         onPress={handleSetupPin}
//       >
//         <Text style={styles.buttonText}>Confirm PIN</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     padding: 20,
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 16,
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 16,
//     marginBottom: 32,
//     textAlign: 'center',
//     color: '#666',
//   },
//   input: {
//     height: 50,
//     borderColor: '#ddd',
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 15,
//     marginBottom: 16,
//     fontSize: 16,
//   },
//   button: {
//     backgroundColor: '#3182ce',
//     padding: 15,
//     borderRadius: 8,
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
// });

// export default AuthSetupScreen;
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { useTransaction } from '../../context/TransactionContext';

const VISA_LOGO = require('../../assets/visa_card.png');
const MASTERCARD_LOGO = require('../../assets/master_card.png');
const CREDIT_CARD_ICON = require('../../assets/master_card.png');

export default function PaymentMethodScreen() {
  const router = useRouter();
  const { transactionData, updateTransaction } = useTransaction();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    {
      id: 'visa',
      name: 'Visa',
      logo: VISA_LOGO,
      description: 'Pay with your Visa card',
    },
    {
      id: 'mastercard',
      name: 'Mastercard',
      logo: MASTERCARD_LOGO,
      description: 'Pay with your Mastercard',
    },
  ];

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    updateTransaction({ paymentMethod: methodId });
  };

const handleContinue = () => {
  if (!selectedMethod) {
    Alert.alert('Please select a payment method');
    return;
  }

  setLoading(true);
  router.push({
    pathname: '/transaction/StripePayment',
    params: { paymentMethod: selectedMethod }
  });
  setLoading(false);
};
  // const handleContinue = () => {
  //   if (!selectedMethod) {
  //     Alert.alert('Please select a payment method');
  //     return;
  //   }

  //   setLoading(true);
  //   setTimeout(() => {
  //     setLoading(false);
  //     router.push('/transaction/PaymentStripe');
  //   }, 1500);
  // };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Select Payment Method</Text>
          <Text style={styles.subtitle}>
            {/* Total: {transactionData.totalAmount?.toFixed(2)} {transactionData.sendCurrency} */}
          </Text>
        </View>

        <View style={styles.cardContainer}>
          <Image source={CREDIT_CARD_ICON} style={styles.cardIcon} />
          <Text style={styles.sectionTitle}>Credit/Debit Card</Text>

          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.selectedMethodCard,
              ]}
              onPress={() => handlePaymentMethodSelect(method.id)}
            >
              <Image source={method.logo} style={styles.methodLogo} />
              <View style={styles.methodInfo}>
                <Text style={styles.methodName}>{method.name}</Text>
                <Text style={styles.methodDescription}>{method.description}</Text>
              </View>
              <View
                style={[
                  styles.radioButton,
                  selectedMethod === method.id && styles.radioButtonSelected,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.securityInfo}>
          <Text style={styles.securityText}>
            🔒 Your payment information is encrypted and processed securely.
          </Text>
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!selectedMethod || loading) && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!selectedMethod || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueButtonText}>
                Continue to Payment Details
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
//   header: {
//     marginBottom: 30,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     color: '#2d3748',
//     textAlign: 'center',
//   },
  subtitle: {
    fontSize: 16,
    color: '#4a5568',
    textAlign: 'center',
    marginTop: 4,
  },
  cardContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIcon: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    marginBottom: 15,
    tintColor: '#4a5568',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 20,
    textAlign: 'center',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  selectedMethodCard: {
    borderColor: '#4299e1',
    backgroundColor: '#ebf8ff',
  },
  methodLogo: {
    width: 50,
    height: 30,
    resizeMode: 'contain',
    marginRight: 15,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 3,
  },
  methodDescription: {
    fontSize: 14,
    color: '#718096',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e0',
  },
  radioButtonSelected: {
    backgroundColor: '#4299e1',
    borderColor: '#4299e1',
  },
  securityInfo: {
    padding: 15,
    backgroundColor: '#f0fff4',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#48bb78',
    marginBottom: 30,
  },
  securityText: {
    color: '#2f855a',
    fontSize: 14,
  },
  buttonWrapper: {
    marginBottom: Platform.OS === 'ios' ? 40 : 20,
    alignItems: 'center',
  },
  header: {
  marginBottom: 30,
  marginTop: Platform.OS === 'android' ? StatusBar.currentHeight || 20 : 20,
  alignItems: 'center',
},
title: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#2d3748',
  textAlign: 'center',
  paddingTop: 10,
},

  continueButton: {
    backgroundColor: '#4299e1',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cbd5e0',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

import { CardField, useStripe } from '@stripe/stripe-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';

export default function StripePayment() {
  const { confirmPayment } = useStripe();
  const [loading, setLoading] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  const handlePayment = async () => {
    if (!cardComplete) {
      Alert.alert('Error', 'Please enter complete card details');
      return;
    }

    setLoading(true);
    
    try {
      // 1. Fetch clientSecret from backend
      const response = await fetch('https://68fd8382a329.ngrok-free.app/api/test/create-payment-intent', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Add any required auth headers here
        },
        body: JSON.stringify({ 
          amount: 1000, 
          currency: 'usd',
          description: 'Test payment' // Optional but recommended
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const { clientSecret, error: serverError } = await response.json();
      
      if (serverError) {
        throw new Error(serverError.message);
      }

      if (!clientSecret) {
        throw new Error('No client secret returned from server');
      }

      // 2. Confirm Payment
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card', // Updated parameter name
        paymentMethodData: {
          billingDetails: { 
            email: 'user@example.com',
            name: 'John Doe' // Recommended additional field
          },
        },
      });

      if (error) {
        Alert.alert('Payment Failed', error.message);
      } else if (paymentIntent) {
        Alert.alert('Success', 'Payment was successful!');
        // Here you could navigate to a success screen
      }
    } catch (err) {
      console.error('Payment error:', err);
      Alert.alert('Error', err.message || 'An error occurred during payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>We accept Visa, Mastercard and other major cards</Text>
      
      <CardField
        postalCodeEnabled={false}
        placeholders={{
          number: '4242 4242 4242 4242',
          expiration: 'MM/YY',
          cvc: 'CVC'
        }}
        onCardChange={(cardDetails) => {
          setCardComplete(cardDetails.complete);
        }}
        style={styles.cardField}
        cardStyle={styles.cardStyle}
      />
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button 
          title="Pay $10.00" 
          onPress={handlePayment}
          disabled={!cardComplete || loading}
        />
      )}

      <Text style={styles.testCardNote}>
        For testing use: 4242 4242 4242 4242
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  cardField: {
    width: '100%',
    height: 50,
    marginBottom: 20,
  },
  cardStyle: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
  },
  testCardNote: {
    marginTop: 20,
    fontSize: 12,
    color: 'gray',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
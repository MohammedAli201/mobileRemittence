// import { CardField, useStripe } from '@stripe/stripe-react-native';
// import { useRouter } from 'expo-router';
// import { useState } from 'react';
// import { ActivityIndicator, Alert, Button, StyleSheet, Text, View } from 'react-native';

// export default function StripePayment() {
//   const stripe = useStripe();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [cardComplete, setCardComplete] = useState(false);

//   if (!stripe) {
//     return <Text>Loading payment system...</Text>;
//   }

//   const handlePayment = async () => {
//     if (!cardComplete) {
//       Alert.alert('Error', 'Please enter complete card details');
//       return;
//     }

//     setLoading(true);
    
//     try {
//       const response = await fetch('https://68fd8382a329.ngrok-free.app/api/test/create-payment-intent', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json',
//           'Authorization': 'Bearer YOUR_AUTH_TOKEN' // If needed
//         },
//         body: JSON.stringify({ 
//           amount: 1000, 
//           currency: 'usd',
//           description: 'Test payment'
//         }),
//       });

//       const { clientSecret } = await response.json();
      
//       const { error, paymentIntent } = await stripe.confirmPayment(clientSecret, {
//         paymentMethodType: 'Card',
//         paymentMethodData: {
//           billingDetails: { 
//             email: 'user@example.com',
//             name: 'John Doe'
//           },
//         },
//       });

//       if (error) Alert.alert('Error', error.message);
//       if (paymentIntent) router.replace('/payment/success');
      
//     } catch (err) {
//       Alert.alert('Error', err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>We accept Visa, Mastercard and other major cards</Text>
      
//       <CardField
//         postalCodeEnabled={false}
//         placeholders={{
//           number: '4242 4242 4242 4242',
//           expiration: 'MM/YY',
//           cvc: 'CVC'
//         }}
//         onCardChange={(cardDetails) => {
//           setCardComplete(cardDetails.complete);
//         }}
//         style={styles.cardField}
//         cardStyle={styles.cardStyle}
//       />
      
//       {loading ? (
//         <ActivityIndicator size="large" color="#0000ff" />
//       ) : (
//         <Button 
//           title="Pay $10.00" 
//           onPress={handlePayment}
//           disabled={!cardComplete || loading}
//         />
//       )}

//       <Text style={styles.testCardNote}>
//         For testing use: 4242 4242 4242 4242
//       </Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'center',
//   },
//   title: {
//     fontSize: 16,
//     marginBottom: 20,
//     textAlign: 'center',
//   },
//   cardField: {
//     width: '100%',
//     height: 50,
//     marginBottom: 20,
//   },
//   cardStyle: {
//     backgroundColor: '#FFFFFF',
//     textColor: '#000000',
//   },
//   testCardNote: {
//     marginTop: 20,
//     fontSize: 12,
//     color: 'gray',
//     textAlign: 'center',
//     fontStyle: 'italic',
//   },
// });
// app/transaction/PaymentScreen.tsx
import { Text, View } from 'react-native';
export default function PaymentScreen() {
  return (
    <View style={{ flex: 1, justifyContent:'center', alignItems:'center' }}>
      <Text>PaymentScreen</Text>
    </View>
  );
}





// import { Ionicons } from '@expo/vector-icons';
// import { useNavigation } from '@react-navigation/native';
// import { useLocalSearchParams } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import {
//   FlatList,
//   Image,
//   Modal,
//   SafeAreaView,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import { useTransaction } from '../../context/TransactionContext';

// const reasons = [
//   'Family Support',
//   'Friends',
//   'Health',
//   'Education',
//   'Business',
//   'Gift',
//   'Other'
// ];

// const getRandomColor = () => {
//   const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#33FFF5'];
//   return colors[Math.floor(Math.random() * colors.length)];
// };

// const AgreeAndPayScreen = () => {
//   const navigation = useNavigation();
//   const { recipient: recipientRaw, trans: transRaw } = useLocalSearchParams();
//   const { transactionData, updateTransaction } = useTransaction();
// console.log("transaction data is",transactionData)
//   const recipient = recipientRaw ? JSON.parse(recipientRaw) : {};
//   const trans = transRaw ? JSON.parse(transRaw) : {};
  
//   const [showModal, setShowModal] = useState(false);
//   const [selectedReason, setSelectedReason] = useState(trans.reason || '');

//   const handleContinue = () => {
//     // Update transaction with selected reason before navigating
//     updateTransaction({
//       ...transactionData,
//       reason: selectedReason
//     });
//     navigation.navigate('PaymentProcessing');
//   };

//   const handleSelectReason = (reason) => {
//     setSelectedReason(reason);
//     setShowModal(false);
//   };

//   useEffect(() => {
//     if (!trans || !recipient) return;

//     const updatedTransaction = {
//       ...transactionData,
//       recipient: recipient,
//       reason: trans.reason || '',
//       // sendAmount: trans.sendAmount || 0,
//       // receiveAmount: trans.receiveAmount || 0,
//       // fee: trans.fee || 0,
//       // totalToPay: trans.totalToPay || 0,
//       // receivingMethod: trans.receivingMethod || 'Hormuud EVC'
//     };

//     updateTransaction(updatedTransaction);
//   }, []);

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         <Text style={styles.header}>Select Reason</Text>

//         <View style={styles.card}>
//           <View style={styles.rowCard}>
//             <Image source={{ uri: 'https://flagcdn.com/w80/no.png' }} style={styles.flag} />
//             <View>
//               <Text style={styles.currency}>NOK</Text>
//               <Text style={styles.country}>Norway</Text>
//             </View>
//             <View style={styles.flexEnd}>
//               <Text style={styles.label}>You Send</Text>
//               <Text style={styles.amount}>{transactionData.sendAmount?.toFixed(2) || '0.00'}</Text>
//             </View>
//           </View>

//           <View style={styles.rowCard}>
//             <Image source={{ uri: 'https://flagcdn.com/w80/so.png' }} style={styles.flag} />
//             <View>
//               <Text style={styles.currency}>USD</Text>
//               <Text style={styles.country}>Somalia</Text>
//             </View>
//             <View style={styles.flexEnd}>
//               <Text style={styles.label}>They Receive</Text>
//               <Text style={styles.amount}>{transactionData.receiveAmount?.toFixed(2) || '0.00'}</Text>
//             </View>
//           </View>

//           <View style={styles.infoBox}>
//             <Text style={styles.infoLabel}>Receiving Method</Text>
//             <Text style={styles.infoText}>{trans.receivingMethod || 'Hormuud EVC'}</Text>
//           </View>

//           <View style={styles.infoBox}>
//             <Text style={styles.infoLabel}>Selected Recipient</Text>
//             <Text style={styles.infoText}>
//               {recipient.name || 'No recipient selected'} - {recipient.phone || 'No phone number'}
//             </Text>
//           </View>

//           <TouchableOpacity style={styles.infoBox} onPress={() => setShowModal(true)}>
//             <Text style={styles.infoLabel}>Reason For Sending</Text>
//             <View style={styles.dropdownRow}>
//               <Text style={styles.infoText}>{selectedReason || 'Select a reason'}</Text>
//               <Ionicons name="chevron-down" size={18} color="#6B7280" />
//             </View>
//           </TouchableOpacity>
//         </View>

//         <View style={styles.paymentSection}>
//           <View style={styles.totalRow}>
//             <Text style={styles.totalLabel}>Total To Pay</Text>
//             <Ionicons name="chevron-up" size={18} color="#555" />
//             <Text style={styles.totalAmount}>NOK {transactionData.totalAmount?.toFixed(2) || '0.00'}</Text>
//           </View>
//           <TouchableOpacity
//             style={[styles.continueButton, !selectedReason && styles.disabledButton]}
//             onPress={handleContinue}
//             disabled={!selectedReason}
//           >
//             <Text style={styles.continueText}>Continue To Pay</Text>
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCard}>
//             <View style={styles.modalHeader}>
//               <Text style={styles.modalTitle}>Select Reason</Text>
//               <TouchableOpacity onPress={() => setShowModal(false)}>
//                 <Ionicons name="close" size={24} color="#6B7280" />
//               </TouchableOpacity>
//             </View>

//             <FlatList
//               data={reasons}
//               keyExtractor={(item) => item}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[styles.reasonItem, selectedReason === item && styles.selectedReasonItem]}
//                   onPress={() => handleSelectReason(item)}
//                 >
//                   <Text style={[styles.reasonText, selectedReason === item && styles.selectedReasonText]}>
//                     {item}
//                   </Text>
//                   {selectedReason === item && <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />}
//                 </TouchableOpacity>
//               )}
//               ItemSeparatorComponent={() => <View style={styles.separator} />}
//             />
//           </View>
//         </View>
//       </Modal>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#F9FAFB' },
//   scrollContent: { paddingBottom: 20 },
//   header: { fontSize: 22, fontWeight: '600', textAlign: 'center', padding: 16 },
//   card: { 
//     marginHorizontal: 16, 
//     backgroundColor: '#fff', 
//     borderRadius: 16, 
//     padding: 16,
//     marginBottom: 20
//   },
//   rowCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: '#eee'
//   },
//   flag: { width: 32, height: 24, marginRight: 10, borderRadius: 4 },
//   currency: { fontSize: 16, fontWeight: '700' },
//   country: { fontSize: 13, color: '#6B7280' },
//   flexEnd: { alignItems: 'flex-end' },
//   label: { fontSize: 13, color: '#6B7280' },
//   amount: { fontSize: 20, fontWeight: '700' },
//   infoBox: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 12,
//     marginBottom: 10,
//     borderWidth: 1,
//     borderColor: '#eee',
//   },
//   infoLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
//   infoText: { fontSize: 16, color: '#111827' },
//   dropdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   paymentSection: {
//     backgroundColor: '#fff',
//     padding: 16,
//     marginHorizontal: 16,
//     borderRadius: 16,
//     marginBottom: 20,
//   },
//   totalRow: {
//     backgroundColor: '#E0F2FE',
//     borderRadius: 12,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 14,
//     marginBottom: 12,
//     borderWidth: 1,
//     borderColor: '#7DD3FC'
//   },
//   totalLabel: { fontSize: 16, color: '#374151' },
//   totalAmount: { fontSize: 18, fontWeight: '700', color: '#2563EB' },
//   continueButton: {
//     backgroundColor: '#3B82F6',
//     paddingVertical: 16,
//     borderRadius: 30,
//     alignItems: 'center',
//   },
//   continueText: { color: '#fff', fontSize: 19, fontWeight: '900' },
//   disabledButton: { backgroundColor: '#9CA3AF' },
//   modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' },
//   modalCard: { backgroundColor: '#fff', borderRadius: 16, margin: 20, maxHeight: '60%' },
//   modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
//   modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
//   reasonItem: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
//   selectedReasonItem: { backgroundColor: '#EEF2FF' },
//   reasonText: { fontSize: 16, color: '#111827' },
//   selectedReasonText: { color: '#4F46E5', fontWeight: '600' },
//   separator: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16 },
// });

// export default AgreeAndPayScreen;



import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import flagMap from '../flagMap';


import {
  FlatList,
  Image,
  Modal,
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

const reasons = [
  'Family Support',
  'Friends',
  'Health',
  'Education',
  'Business',
  'Gift',
  'Other'
];

const getRandomColor = () => {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#33FFF5'];
  return colors[Math.floor(Math.random() * colors.length)];
};
// Country to flag mapping utility
const countryCodeMap: Record<string, string> = {
  'norway': 'no',
  'somalia': 'so',
  'kenya': 'ke',
  'uganda': 'ug',
  'tanzania': 'tz',
  'ethiopia': 'et',
  'djibouti': 'dj',
  'united states': 'us',
  'united kingdom': 'gb',
  'canada': 'ca',
  // Add more countries as needed
};

const getFlagForCountry = (countryName: string) => {
  if (!countryName) return flagMap.us;
  
  const lowerCaseCountry = countryName.toLowerCase();
  const countryCode = countryCodeMap[lowerCaseCountry] || 'us';
  return flagMap[countryCode] || flagMap.us;
};

const AgreeAndPayScreen = () => {
  const router = useRouter()
  const navigation = useNavigation();
  const { recipient: recipientRaw, trans: transRaw } = useLocalSearchParams();
  const { transactionData, updateTransaction } = useTransaction();
const fromFlag = getFlagForCountry(transactionData.sendCountry);
  const toFlag = getFlagForCountry(transactionData.receivingCountry);
  const recipient = recipientRaw ? JSON.parse(recipientRaw) : {};
  const trans = transRaw ? JSON.parse(transRaw) : {};
  
  const [showModal, setShowModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(trans.reason || '');

  const handleContinue = () => {
    updateTransaction({
      ...transactionData,
      reason: selectedReason
    });
    router.push('/transaction/PaymentMethodScreen');
  };

  const handleSelectReason = (reason) => {
    setSelectedReason(reason);
    setShowModal(false);
  };

  useEffect(() => {
    if (!trans || !recipient) return;

    const updatedTransaction = {
      ...transactionData,
      recipient: recipient,
      reason: trans.reason || '',
    };

    updateTransaction(updatedTransaction);
  }, []);

  return (
    <>
      <StatusBar 
        backgroundColor="transparent" 
        translucent 
        barStyle="dark-content" 
      />
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
        >
          <Text style={styles.header}>Select Reason</Text>

          <View style={styles.card}>
            <View style={styles.rowCard}>
              <Image source={fromFlag} style={styles.flag} />
              <View>
                <Text style={styles.currency}>{transactionData.sendCurrency}</Text>
                <Text style={styles.country}>{transactionData.sendCountry}</Text>
              </View>
              <View style={styles.flexEnd}>
                <Text style={styles.label}>You Send</Text>
                <Text style={styles.amount}>{transactionData.sendAmount?.toFixed(2) || '0.00'}</Text>
              </View>
            </View>

            <View style={styles.rowCard}>
              <Image source={ toFlag} style={styles.flag} />
              <View>
                <Text style={styles.currency}>{transactionData.receiveCurrency}</Text>
                <Text style={styles.country}>{transactionData.receivingCountry}</Text>
              </View>
              <View style={styles.flexEnd}>
                <Text style={styles.label}>They Receive</Text>
                <Text style={styles.amount}>{transactionData.receiveAmount?.toFixed(2) || '0.00'}</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Receiving Method</Text>
              <Text style={styles.infoText}>{transactionData.provider }</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Selected Recipient</Text>
              <Text style={styles.infoText}>
                {recipient.name || 'No recipient selected'} - {recipient.phone || 'No phone number'}
              </Text>
            </View>

            <TouchableOpacity style={styles.infoBox} onPress={() => setShowModal(true)}>
              <Text style={styles.infoLabel}>Reason For Sending</Text>
              <View style={styles.dropdownRow}>
                <Text style={styles.infoText}>{selectedReason || 'Select a reason'}</Text>
                <Ionicons name="chevron-down" size={18} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.paymentSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total To Pay</Text>
              <Ionicons name="chevron-up" size={18} color="#555" />
              <Text style={styles.totalAmount}>NOK {transactionData.totalAmount?.toFixed(2) || '0.00'}</Text>
            </View>
            <TouchableOpacity
              style={[styles.continueButton, !selectedReason && styles.disabledButton]}
              onPress={handleContinue}
              disabled={!selectedReason}
            >
              <Text style={styles.continueText}>Continue To Pay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
          <StatusBar backgroundColor="rgba(0,0,0,0.5)" />
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Reason</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <FlatList
                data={reasons}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.reasonItem, selectedReason === item && styles.selectedReasonItem]}
                    onPress={() => handleSelectReason(item)}
                  >
                    <Text style={[styles.reasonText, selectedReason === item && styles.selectedReasonText]}>
                      {item}
                    </Text>
                    {selectedReason === item && <Ionicons name="checkmark-circle" size={20} color="#7C3AED" />}
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  scrollContent: { 
    paddingBottom: 20,
    paddingTop: 10 
  },
  header: { 
    fontSize: 22, 
    fontWeight: '600', 
    textAlign: 'center', 
    padding: 16,
    marginTop: 10 
  },
  card: { 
    marginHorizontal: 16, 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 16,
    marginBottom: 20
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee'
  },
  flag: { width: 32, height: 24, marginRight: 10, borderRadius: 4 },
  currency: { fontSize: 16, fontWeight: '700' },
  country: { fontSize: 13, color: '#6B7280' },
  flexEnd: { alignItems: 'flex-end' },
  label: { fontSize: 13, color: '#6B7280' },
  amount: { fontSize: 20, fontWeight: '700' },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  infoLabel: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  infoText: { fontSize: 16, color: '#111827' },
  dropdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  totalRow: {
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#7DD3FC'
  },
  totalLabel: { fontSize: 16, color: '#374151' },
  totalAmount: { fontSize: 18, fontWeight: '700', color: '#2563EB' },
  continueButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  continueText: { color: '#fff', fontSize: 19, fontWeight: '900' },
  disabledButton: { backgroundColor: '#9CA3AF' },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, margin: 20, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  reasonItem: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectedReasonItem: { backgroundColor: '#EEF2FF' },
  reasonText: { fontSize: 16, color: '#111827' },
  selectedReasonText: { color: '#4F46E5', fontWeight: '600' },
  separator: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 16 },
});

export default AgreeAndPayScreen;
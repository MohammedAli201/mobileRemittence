import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { useTransaction } from '../../context/TransactionContext';

import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const remittanceOptions = [
  {
    id: 'mobile',
    title: 'Mobile Money',
    icon: <FontAwesome name="mobile" size={24} color="#fff" />,
  },
  {
    id: 'cash',
    title: 'Cash Collection',
    icon: <MaterialIcons name="attach-money" size={24} color="#fff" />,
  },
  {
    id: 'bank',
    title: 'Bank Transfer',
    icon: <Ionicons name="business" size={24} color="#fff" />,
  },
];

const RemittanceTypeScreen = () => {
    const { updateTransaction } = useTransaction();
  
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    // console.log("Select reciving method ",selected)
    let method = remittanceOptions.find(p=>p.id===selected)?.title
   const cleaned = method?.replace(/\s+/g, '');


     updateTransaction({
         service: cleaned,    
    });
    // console.log("updated state",transactionData)
    router.push("/remittance/MobileMoneyScreen")

    // if (selected === 'mobile') {
    //   router.push('/mobile-money'); // ✅ Make sure this file exists: app/mobile-money.tsx
    // } else if (selected === 'cash') {
    //   router.push('/cash-transfer'); // Replace with your actual file if needed
    // } else if (selected === 'bank') {
    //   router.push('/bank-transfer'); // Replace with your actual file if needed
    // }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Remittance Type</Text>
      <ScrollView contentContainerStyle={styles.optionsWrapper}>
        {remittanceOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.option,
              selected === option.id && styles.selectedOption
            ]}
            onPress={() => setSelected(option.id)}
          >
            <View style={styles.iconCircle}>{option.icon}</View>
            <Text style={styles.optionText}>{option.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[
          styles.continueButton,
          !selected && styles.disabledButton
        ]}
        disabled={!selected}
        onPress={handleContinue}
      >
        <Text style={styles.continueText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default RemittanceTypeScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    alignSelf: 'center'
  },
  optionsWrapper: {
    flexGrow: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedOption: {
    borderColor: '#2b6cb0',
    backgroundColor: '#e6f0fa',
  },
  iconCircle: {
    backgroundColor: '#2b6cb0',
    padding: 10,
    borderRadius: 25,
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  continueButton: {
    backgroundColor: '#2b6cb0',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#b0c4de',
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

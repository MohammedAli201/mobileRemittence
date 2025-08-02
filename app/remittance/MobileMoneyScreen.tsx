import { MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTransaction } from '../../context/TransactionContext';

import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// import { RootStackParamList } from './types'; // ✅ adjust path if needed

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'MobileMoney'>;

type MobileProvider = {
  id: string;
  name: string;
  countries: string[];
  currency: string;
};

const MobileMoneyScreen: React.FC<Props> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const router = useRouter();
  const { transactionData, updateTransaction } = useTransaction();

  const providers: MobileProvider[] = [
    { id: 'evc', name: 'EVC Plus', countries: ['Somalia'] ,currency:'USD'},
    { id: 'zaad', name: 'ZAAD', countries: ['Somaliland'],currency:'USD' },
    { id: 'sahal', name: 'SAHAL', countries: ['Somalia'],currency:'USD' },
    { id: 'mpesa', name: 'M-PESA', countries: ['Kenya', 'Tanzania'],currency:'TZS' },
    { id: 'mtn', name: 'MTN Mobile Money', countries: ['Uganda'],currency:'UGX' },
    { id: 'waqfi', name: 'Waqfi', countries: ['Somalia'] ,currency:'USD'},
    { id: 'tigo', name: 'Tigo Pesa', countries: ['Tanzania'] ,currency:'TZS'},
    { id: 'airtel-tz', name: 'Airtel Money', countries: ['Tanzania'],currency:'TZS' },
    { id: 'airtel-ug', name: 'Airtel Money', countries: ['Uganda'] ,currency:'UGX'},
    { id: 'salam', name: 'SALAM-PAY', countries: ['Somalia'],currency:'USD' },
  ];

  const filteredProviders = providers.filter(provider =>
    provider.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = () => {

    if (selectedProvider) {
    
      // let id:number = Number(providers)
      const country = providers.find(p => p.id === selectedProvider)?.countries[0] ||'' ;
      const currency = providers.find(p=>p.id===selectedProvider)?.currency || '';
      console.log("receiving currency")
  updateTransaction({
  
  receivingCountry:country,
  provider: selectedProvider,
  sendCountry: "Norway",
  receiveCurrency:currency
  }
  
);



      router.push("/transaction/SendMoneyScreen")    }
  };
  useEffect(() => {

  }, [transactionData]);

  return (
    <LinearGradient colors={['#f8f9fa', '#e9ecef']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mobile Money Providers</Text>
          <Text style={styles.headerSubtitle}>Select your mobile money service</Text>
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={24} color="#7f8c8d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search providers..."
            placeholderTextColor="#95a5a6"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.providersContainer}
          showsVerticalScrollIndicator={false}
        >
          {filteredProviders.map(provider => (
            <TouchableOpacity
              key={provider.id}
              style={[
                styles.providerCard,
                selectedProvider === provider.id && styles.selectedProvider,
              ]}
              onPress={() => setSelectedProvider(provider.id)}
              activeOpacity={0.7}
            >
              <View style={styles.providerLogoContainer}>
                <Text style={styles.providerInitials}>
                  {provider.name
                    .split(' ')
                    .map(word => word[0])
                    .join('')
                    .slice(0, 3)
                    .toUpperCase()}
                </Text>
              </View>
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <View style={styles.countryTags}>
                  {provider.countries.map(country => (
                    <View key={country} style={styles.countryTag}>
                      <Text style={styles.countryTagText}>{country}</Text>
                    </View>
                  ))}
                </View>
              </View>
              {selectedProvider === provider.id && (
                <View style={styles.selectedIndicator}>
                  <MaterialIcons name="check-circle" size={24} color="#27ae60" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedProvider && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedProvider}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              !selectedProvider
                ? ['#bdc3c7', '#bdc3c7']
                : ['#3498db', '#2980b9']
            }
            style={styles.gradient}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#2c3e50',
  },
  providersContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  selectedProvider: {
    borderColor: '#3498db',
    backgroundColor: '#f0f8ff',
  },
  providerLogoContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  providerInitials: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  countryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  countryTag: {
    backgroundColor: '#e8f4fc',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 2,
  },
  countryTagText: {
    fontSize: 12,
    color: '#3498db',
  },
  selectedIndicator: {
    marginLeft: 10,
  },
  continueButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.7,
  },
  gradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default MobileMoneyScreen;

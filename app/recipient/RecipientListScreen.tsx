import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTransaction } from '../../context/TransactionContext';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { RecipientService } from '../../services/apiClient';

interface Recipient {
  Id: string;
  PhoneNumber: string;
  FirstName: string;
  LastName: string;
  Service: string;
  Provider: string;
  RelationshipToSender: string;
  ReceivingCountry?: string;
  CountryOfCitizenship?: string;
  Address?: string;
  City?: string;
}

export default function RecipientListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { transactionData, updateTransaction } = useTransaction();

  useEffect(() => {
    fetchRecipients();
  }, []);
const fetchRecipients = async () => {
  try {
    setLoading(true);
    const response = await RecipientService.getAllRecipients();

    if (!response?.Success) {
      throw new Error('Failed to fetch recipients: Invalid response');
    }

    if (!Array.isArray(response.Data)) {
      throw new Error('Failed to fetch recipients: Invalid data format');
    }

    const selectedCountry = transactionData.receivingCountry;
    
    if (!selectedCountry) {
      throw new Error('No receiving country selected');
    }

    // Normalize country names for case-insensitive comparison
    const normalizeCountryName = (country: string) => country.trim().toLowerCase();

    // Filter recipients by country (case-insensitive) and validate required fields
    const filteredRecipients = response.Data
      .filter(recipient => {
        // Validate required fields exist
        if (!recipient?.Id || !recipient?.FirstName || !recipient?.PhoneNumber) {
          console.warn('Invalid recipient record skipped:', recipient);
          return false;
        }

        // Clean phone number if it contains "undefined"
        if (recipient.PhoneNumber.includes('undefined')) {
          recipient.PhoneNumber = recipient.PhoneNumber.replace('undefined', '');
        }

        return normalizeCountryName(recipient.ReceivingCountry) === 
               normalizeCountryName(selectedCountry);
      })
      .map(recipient => ({
        ...recipient,
        // Ensure consistent country name casing
        ReceivingCountry: selectedCountry,
        // Format phone number if needed
        PhoneNumber: formatPhoneNumber(recipient.PhoneNumber),
        // Create display name
        displayName: `${recipient.FirstName} ${recipient.LastName}`.trim(),
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName));

    setRecipients(filteredRecipients);

  } catch (error) {
    console.error('Error fetching recipients:', error);
    Alert.alert(
      'Error',
      error.message || 'Could not load recipient list. Please try again later.',
      [{ text: 'OK' }]
    );
    setRecipients([]);
  } finally {
    setLoading(false);
  }
};
const formatPhoneNumber = (phone: string) => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on country - this is a simple example
  if (cleaned.startsWith('252')) { // Somalia
    return `+${cleaned}`;
  } else if (cleaned.startsWith('254')) { // Kenya
    return `+${cleaned}`;
  }
  return cleaned.length > 0 ? `+${cleaned}` : 'Invalid number';
};
  // const fetchRecipients = async () => {
  //   try {
  //     setLoading(true);
  //     const response = await RecipientService.getAllRecipients();

  //     if (response.Success && response.Data) {
  //       // before using recipeint data, we need to filter based on country
  //       const selectCountry = transactionData.receivingCountry
  //       const recipeintFilter = response.Data.filter(data=>data.receivingCountry==selectCountry)
  //       setRecipients(response.Data);
  //     } else {
  //       setError('No recipients found');
  //     }
  //   } catch (err) {
  //     setError('Failed to load recipients');
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const filteredRecipients = recipients.filter(recipient =>
    `${recipient.FirstName} ${recipient.LastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipient.PhoneNumber.includes(searchQuery)
  );

  const renderItem = ({ item }: { item: Recipient }) => {
    const safeRecipient = {
      id: item?.Id || 'unknown-id',
      name: `${item?.FirstName || ''} ${item?.LastName || ''}`.trim() || 'Unknown Recipient',
      phone: item?.PhoneNumber || 'N/A',
      service: item?.Service || 'MobileWallet',
      provider: item?.Provider || 'Unknown Provider',
      relationship: item?.RelationshipToSender || 'Not specified'
    };

    return (
      <TouchableOpacity
        style={styles.recipientItem}
        onPress={() => {
          router.push({
            pathname: '/transaction/AgreeAndPayScreen',
            params: {
              recipient: JSON.stringify(safeRecipient),
            },
          });
        }}
      >
        <View style={[styles.avatar, { backgroundColor: generateAvatarColor(safeRecipient.id) }]}>
          <Text style={styles.avatarText}>
            {safeRecipient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </Text>
        </View>
        <View style={styles.recipientInfo}>
          <Text style={styles.name} numberOfLines={1}>
            {safeRecipient.name}
          </Text>
          <View style={styles.detailsRow}>
            <Text style={styles.phone} numberOfLines={1}>
              {safeRecipient.phone}
            </Text>
            <View style={styles.dotSeparator} />
            <Text style={styles.provider} numberOfLines={1}>
              {safeRecipient.provider}
            </Text>
          </View>
          <Text style={styles.relationship} numberOfLines={1}>
            {safeRecipient.relationship}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
      </TouchableOpacity>
    );
  };

  const generateAvatarColor = (id: string) => {
    const colors = [
      '#4CAF50', '#2196F3', '#FF5722', 
      '#9C27B0', '#607D8B', '#795548',
      '#E91E63', '#00BCD4'
    ];
    const hash = id.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2F80ED" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchRecipients} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header with safe area padding */}
        <View style={styles.header}>
          <Text style={styles.title}>Select Recipient</Text>
          <TouchableOpacity 
            onPress={() => router.push('/recipient/AddRecipientScreen')}
            style={styles.addButton}
            accessibilityLabel="Add new recipient"
          >
            <Ionicons name="person-add-outline" size={24} color="#2F80ED" />
          </TouchableOpacity>
        </View>

        {/* Search bar with consistent padding */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#718096" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipients..."
            placeholderTextColor="#A0AEC0"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
            accessibilityLabel="Search recipients"
          />
        </View>

        {/* Recipient list with proper safe area handling */}
        <FlatList
          data={filteredRecipients}
          keyExtractor={(item) => item.Id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color="#CBD5E0" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No matching recipients found' : 'No recipients available'}
              </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('AddRecipient')}
                style={styles.addNewButton}
                accessibilityLabel="Add new recipient"
              >
                <Text style={styles.addNewText}>Add New Recipient</Text>
              </TouchableOpacity>
            </View>
          }
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FB',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EDF2F7',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
    letterSpacing: 0.5,
  },
  addButton: {
    backgroundColor: '#EBF4FF',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 20,
    marginVertical: 12,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#2D3748',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 8,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  recipientInfo: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#718096',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E0',
    marginHorizontal: 8,
  },
  provider: {
    fontSize: 14,
    color: '#718096',
  },
  relationship: {
    fontSize: 12,
    color: '#A0AEC0',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  addNewButton: {
    backgroundColor: '#2F80ED',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  addNewText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#E53E3E',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#2F80ED',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
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

  useEffect(() => {
    fetchRecipients();
  }, []);

  const fetchRecipients = async () => {
    try {
      setLoading(true);
      const response = await RecipientService.getAllRecipients();
      if (response.Success && response.Data) {
        setRecipients(response.Data);
      } else {
        setError('No recipients found');
      }
    } catch (err) {
      setError('Failed to load recipients');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipients = recipients.filter(recipient =>
    `${recipient.FirstName} ${recipient.LastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recipient.PhoneNumber.includes(searchQuery)
  );

  const renderItem = ({ item }: { item: Recipient }) => {
  // Create a safe recipient object with fallbacks
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
      // onPress={() => {
      //   console.log('Navigating with recipient:', safeRecipient); // Debug log
      //   navigation.navigate('transaction/AgreeAndPayScreen', { 
      //     recipient: safeRecipient
      //   });
      // }}
      onPress={() => {
  console.log('Navigating with recipient:', safeRecipient);

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

// Helper function to generate consistent avatar colors
const generateAvatarColor = (id: string) => {
  const colors = [
    '#4CAF50', '#2196F3', '#FF5722', 
    '#9C27B0', '#607D8B', '#795548',
    '#E91E63', '#00BCD4'
  ];
  const hash = id.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  return colors[hash % colors.length];
};

  // const renderItem = ({ item }: { item: Recipient }) => (
  //   <TouchableOpacity
    
  //     style={styles.recipientItem}
  //   onPress={() => navigation.navigate('transaction/AgreeAndPayScreen', { 
  //     recipient: {
  //       id: item.Id,
  //       name: `${item.FirstName} ${item.LastName}`,
  //       phone: item.PhoneNumber,
  //       service: item.Service,
  //       provider: item.Provider,
  //     }
  //   })}
  //   >
  //     <View style={styles.avatar}>
  //       <Text style={styles.avatarText}>
  //         {item.FirstName.charAt(0)}{item.LastName.charAt(0)}
  //       </Text>
  //     </View>
  //     <View style={styles.recipientInfo}>
  //       <Text style={styles.name}>
  //         {item.FirstName} {item.LastName}
  //       </Text>
  //       <View style={styles.detailsRow}>
  //         <Text style={styles.phone}>{item.PhoneNumber}</Text>
  //         <View style={styles.dotSeparator} />
  //         <Text style={styles.provider}>{item.Provider}</Text>
  //       </View>
  //       <Text style={styles.relationship}>{item.RelationshipToSender}</Text>
  //     </View>
  //     <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
  //   </TouchableOpacity>
  // );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#2F80ED" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchRecipients} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Recipient</Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('AddRecipient')}
          style={styles.addButton}
        >
          <Ionicons name="person-add-outline" size={24} color="#2F80ED" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#718096" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipients..."
          placeholderTextColor="#A0AEC0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredRecipients}
        keyExtractor={(item) => item.Id} // Now using the unique Id from API
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
            >
              <Text style={styles.addNewText}>Add New Recipient</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3748',
  },
  addButton: {
    backgroundColor: '#EBF4FF',
    borderRadius: 20,
    padding: 10,
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
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#2D3748',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4299E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recipientInfo: {
    flex: 1,
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
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    marginTop: 16,
    marginBottom: 8,
  },
  addNewButton: {
    backgroundColor: '#2F80ED',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addNewText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#E53E3E',
    textAlign: 'center',
    marginBottom: 20,
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
  },
});
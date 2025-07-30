import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TransactionService } from '../../services/apiClient';

type ApiTransaction = {
  id: string;
  name: string;
  country: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Failed' | 'Pending';
  method: string;
};

const statusConfig = {
  Paid: { backgroundColor: '#d1fae5', color: '#065f46' },
  Failed: { backgroundColor: '#fee2e2', color: '#991b1b' },
  Pending: { backgroundColor: '#fef3c7', color: '#92400e' },
};

export default function TransactionList() {
  const router = useRouter();
  const [transfers, setTransfers] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      
      const response = await TransactionService.fetchAllTransaction();
      const data = response || [];

      const mapped = data.map((item: any) => ({
        id: item.Id,
        name: item.RecipientName || 'Unknown',
        country: item.ReceiveCurrency || '',
        date: new Date(item.CreatedAt).toLocaleString(),
        amount: `${item.SendCurrency} ${item.TotalAmount?.toFixed(2) || '0.00'}`,
        status: item.Status || 'Pending',
        method: item.Service || 'Transfer',
      }));

      // Sort by newest first
      const sorted = mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransfers(sorted);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setError('Failed to load transactions. Please try again.');
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleRefresh = () => {
    fetchTransactions(true);
  };

  const renderTransferItem = ({ item }: { item: ApiTransaction }) => (
    <TouchableOpacity 
      style={styles.transferCard}
      onPress={() => router.push(`/transaction/${item.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.transferInfo}>
        <View style={styles.transferHeader}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.amount}>{item.amount}</Text>
        </View>
        <Text style={styles.metaText}>{item.country} • {item.date}</Text>
        <View style={styles.badges}>
          <Text style={styles.methodBadge}>{item.method}</Text>
          <Text
            style={[
              styles.statusBadge,
              statusConfig[item.status]
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        {error ? (
          <>
            <Ionicons name="warning-outline" size={48} color="#dc2626" />
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={fetchTransactions}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Ionicons name="list-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No transactions found</Text>
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* <View style={styles.header}>
          <Text style={styles.welcome}>Welcome back,</Text>
          <Text style={styles.username}>Mohamed 👋</Text>
        </View> */}

        <View style={styles.content}>
          {/* <Text style={styles.sectionTitle}>Recent Transfers</Text> */}

          {loading && transfers.length === 0 ? (
            <ActivityIndicator size="large" color="#2b6cb0" style={styles.loader} />
          ) : (
            <FlatList
              data={transfers}
              keyExtractor={(item) => item.id}
              renderItem={renderTransferItem}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#2b6cb0"
                />
              }
              ListEmptyComponent={renderEmptyComponent()}
              contentContainerStyle={transfers.length === 0 ? styles.emptyList : undefined}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* <View style={styles.announcement}>
          <Text style={styles.announcementText}>
            <Text style={styles.announcementBold}>Important:</Text> We are regulated by the{' '}
            <Text style={styles.announcementBold}>Swedish Financial Supervisory Authority</Text> with institution number{' '}
            <Text style={styles.announcementBold}>45577</Text>.
          </Text>
        </View>

        <View style={styles.navBar}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="call-outline" size={24} color="#6b7280" />
            <Text style={styles.navText}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push('/RemittanceTypeScreen')}
          >
            <View style={styles.navActive}>
              <Ionicons name="send" size={24} color="#2b6cb0" />
            </View>
            <Text style={[styles.navText, styles.navActiveText]}>Send Money</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.navItem}
            onPress={() => router.push('/RecentTransactions')}
          >
            <MaterialIcons name="list" size={24} color="#6b7280" />
            <Text style={styles.navText}>Transfers</Text>
          </TouchableOpacity>
        </View> */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 16,
  },
  welcome: {
    fontSize: 16,
    color: '#4b5563',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  content: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  transferCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontWeight: 'bold',
    color: '#1e40af',
    fontSize: 18,
  },
  transferInfo: {
    flex: 1,
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontWeight: '600',
    fontSize: 16,
    color: '#111827',
    maxWidth: '60%',
  },
  metaText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  amount: {
    fontWeight: 'bold',
    color: '#1e40af',
    fontSize: 15,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  methodBadge: {
    backgroundColor: '#f3f4f6',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    color: '#4b5563',
    overflow: 'hidden',
  },
  statusBadge: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
    fontWeight: '500',
  },
  announcement: {
    backgroundColor: '#e0f2fe',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
  },
  announcementText: {
    color: '#1e3a8a',
    fontSize: 13,
    lineHeight: 20,
  },
  announcementBold: {
    fontWeight: '600',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  navActive: {
    backgroundColor: '#dbeafe',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  navActiveText: {
    color: '#1e40af',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#1e40af',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
});
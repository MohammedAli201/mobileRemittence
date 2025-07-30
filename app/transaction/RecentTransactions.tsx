// import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import React, { useEffect, useState } from 'react';

// import {
//   ActivityIndicator,
//   FlatList,
//   Image,
//   RefreshControl,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View
// } from 'react-native';
// import { TransactionService } from '../services/apiClient';

// const RecentTransactions = () => {
//     const router = useRouter();
  
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   const fetchRecentTransactions = async () => {
//     try {
//       const response = await TransactionService.getRecentTransaction();
//       const formattedTransactions = response.map(tx => ({
//         id: tx.Id,
//         name: tx.RecipientName || 'Unknown Recipient',
//         date: new Date(tx.CreatedAt).toLocaleDateString('en-US', {
//           day: '2-digit',
//           month: 'short',
//           year: 'numeric',
//           hour: '2-digit',
//           minute: '2-digit'
//         }),
//         type: tx.Service || 'Transfer',
//         status: tx.Status,
//         amount: tx.TotalAmount.toFixed(2),
//         currency: tx.SendCurrency,
//         avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(tx.RecipientName || 'U')}&background=random`
//       }));
//       setTransactions(formattedTransactions);
//     } catch (error) {
//       console.error('Failed to fetch transactions:', error);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     fetchRecentTransactions();
//   }, []);

//   const handleRefresh = () => {
//     setRefreshing(true);
//     fetchRecentTransactions();
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'Completed':
//       case 'Paid':
//         return '#27ae60';
//       case 'Failed':
//         return '#e74c3c';
//       case 'Pending':
//         return '#f39c12';
//       default:
//         return '#7f8c8d';
//     }
//   };

//   const getServiceIcon = (serviceType) => {
//     switch (serviceType) {
//       case 'MobileWallet':
//       case 'Mobile Money':
//         return <FontAwesome name="mobile" size={22} color="#3498db" style={styles.typeIcon} />;
//       case 'Cash Collection':
//         return <MaterialIcons name="attach-money" size={20} color="#27ae60" style={styles.typeIcon} />;
//       default:
//         return <Ionicons name="send" size={20} color="#9b59b6" style={styles.typeIcon} />;
//     }
//   };

//   const renderItem = ({ item }) => (
//     <TouchableOpacity style={styles.transferItem}>
//       <View style={styles.avatarContainer}>
//         <Image source={{ uri: item.avatar }} style={styles.avatar} />
//         {getServiceIcon(item.type)}
//       </View>
      
//       <View style={styles.transferDetails}>
//         <View style={styles.transferHeader}>
//           <Text style={styles.name}>{item.name}</Text>
//           <Text style={styles.amount}>{`${item.amount} ${item.currency}`}</Text>
//         </View>
        
//         <View style={styles.transferMeta}>
//           <Text style={styles.date}>{item.date}</Text>
//           <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
//             <Text style={styles.statusText}>{item.status}</Text>
//           </View>
//         </View>
        
//         <Text style={styles.typeText}>{item.type}</Text>
//       </View>
      
//       {item.status === 'Pending' && (
//         <TouchableOpacity style={styles.collectButton}>
//           <Ionicons name="refresh" size={18} color="#fff" />
//         </TouchableOpacity>
//       )}
//     </TouchableOpacity>
//   );

//   if (loading && transactions.length === 0) {
//     return (
//       <View style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color="#3498db" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.headerTitle}>Recent Transfers</Text>
//         <TouchableOpacity>
//           <Text style={styles.headerAction}>Filter</Text>
//         </TouchableOpacity>
//       </View>

//       <FlatList
//         data={transactions}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             tintColor="#3498db"
//           />
//         }
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Text style={styles.emptyText}>No recent transactions found</Text>
//           </View>
//         }
//       />
//          <View style={styles.announcement}>
//                 <Text style={styles.announcementText}>
//                   <Text style={styles.announcementBold}>Important:</Text> We are regulated by the{' '}
//                   <Text style={styles.announcementBold}>Swedish Financial Supervisory Authority</Text> with institution number{' '}
//                   <Text style={styles.announcementBold}>45577</Text>.
//                 </Text>
//               </View>
      
//               <View style={styles.navBar}>
//                 <TouchableOpacity style={styles.navItem}>
//                   <Ionicons name="call-outline" size={24} color="#6b7280" />
//                   <Text style={styles.navText}>Contact Us</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity 
//                   style={styles.navItem}
//                   onPress={() => router.push('/RemittanceTypeScreen')}
//                 >
//                   <View style={styles.navActive}>
//                     <Ionicons name="send" size={24} color="#2b6cb0" />
//                   </View>
//                   <Text style={[styles.navText, styles.navActiveText]}>Send Money</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity 
//                   style={styles.navItem}
//                   onPress={() => router.push('/transactionList')}
//                 >
//                   <MaterialIcons name="list" size={24} color="#6b7280" />
//                   <Text style={styles.navText}>Transfers</Text>
//                 </TouchableOpacity>
//               </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//     paddingTop: 16,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   emptyText: {
//     fontSize: 16,
//     color: '#7f8c8d',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     marginBottom: 16,
//   },
//    announcement: {
//     backgroundColor: '#e0f2fe',
//     padding: 16,
//     borderRadius: 12,
//     marginTop: 16,
//     marginBottom: 8,
//   },
//   announcementText: {
//     color: '#1e3a8a',
//     fontSize: 13,
//     lineHeight: 20,
//   },
//   announcementBold: {
//     fontWeight: '600',
//   },
//   navBar: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingVertical: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#e5e7eb',
//     backgroundColor: '#fff',
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     paddingHorizontal: 20,
//   },
//   navItem: {
//     alignItems: 'center',
//     paddingHorizontal: 12,
//   },
//   navActive: {
//     backgroundColor: '#dbeafe',
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 4,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: '700',
//     color: '#2c3e50',
//   },
//   headerAction: {
//     fontSize: 16,
//     color: '#3498db',
//     fontWeight: '500',
//   },
//   listContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 20,
//   },
//   transferItem: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   avatarContainer: {
//     position: 'relative',
//     marginRight: 16,
//   },
//   avatar: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//   },
//   typeIcon: {
//     position: 'absolute',
//     bottom: -4,
//     right: -4,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 4,
//   },
//   transferDetails: {
//     flex: 1,
//   },
//   transferHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 6,
//   },
//   name: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#2c3e50',
//   },
//   amount: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#2c3e50',
//   },
//   transferMeta: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 8,
//   },
//   date: {
//     fontSize: 13,
//     color: '#7f8c8d',
//   },
//   statusBadge: {
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   statusText: {
//     fontSize: 12,
//     color: '#fff',
//     fontWeight: '500',
//   },
//   typeText: {
//     fontSize: 13,
//     color: '#7f8c8d',
//   },
//   collectButton: {
//     backgroundColor: '#3498db',
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginLeft: 12,
//   },
// });

// export default RecentTransactions;

import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { TransactionService } from '../../services/apiClient';

const RecentTransactions = () => {
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecentTransactions = async () => {
    try {
      const response = await TransactionService.getRecentTransaction();
      const formattedTransactions = response.map(tx => ({
        id: tx.Id,
        name: tx.RecipientName || 'Unknown Recipient',
        date: new Date(tx.CreatedAt).toLocaleDateString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        type: tx.Service || 'Transfer',
        status: tx.Status,
        amount: tx.TotalAmount.toFixed(2),
        currency: tx.SendCurrency,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(tx.RecipientName || 'U')}&background=random`
      }));
      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecentTransactions();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecentTransactions();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'Paid':
        return '#27ae60';
      case 'Failed':
        return '#e74c3c';
      case 'Pending':
        return '#f39c12';
      default:
        return '#7f8c8d';
    }
  };

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'MobileWallet':
      case 'Mobile Money':
        return <FontAwesome name="mobile" size={18} color="#3498db" />;
      case 'Cash Collection':
        return <MaterialIcons name="attach-money" size={18} color="#27ae60" />;
      default:
        return <Ionicons name="send" size={18} color="#9b59b6" />;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.transferItem}>
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      </View>
      
      <View style={styles.transferDetails}>
        <View style={styles.transferHeader}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.amount}>{`${item.amount} ${item.currency}`}</Text>
        </View>
        
        <View style={styles.transferMeta}>
          <View style={styles.serviceContainer}>
            {getServiceIcon(item.type)}
            <Text style={styles.typeText}>{item.type}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <Text style={styles.date}>{item.date}</Text>
      </View>
      
      {item.status === 'Pending' && (
        <TouchableOpacity 
          style={styles.collectButton}
          onPress={() => router.push(`/transaction/${item.id}`)}
        >
          <Ionicons name="refresh" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (loading && transactions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Recent Transfers</Text>
          <TouchableOpacity>
            <Text style={styles.headerAction}>Filter</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#3498db"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recent transactions found</Text>
            </View>
          }
        />
        
        <View style={styles.announcement}>
          <Text style={styles.announcementText}>
            <Text style={styles.announcementBold}>Important:</Text> We are regulated by the{' '}
            <Text style={styles.announcementBold}>Swedish Financial Supervisory Authority</Text> with institution number{' '}
            <Text style={styles.announcementBold}>45577</Text>.
          </Text>
        </View>
      </View>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="call-outline" size={24} color="#6b7280" />
          <Text style={styles.navText}>Contact Us</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/remittance/RemittanceTypeScreen')}
        >
          <View style={styles.navActive}>
            <Ionicons name="send" size={24} color="#2b6cb0" />
          </View>
          <Text style={[styles.navText, styles.navActiveText]}>Send Money</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/transaction/transactionList')}
        >
          <MaterialIcons name="list" size={24} color="#6b7280" />
          <Text style={styles.navText}>Transfers</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 80, // Space for navbar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a365d',
  },
  headerAction: {
    fontSize: 16,
    color: '#3182ce',
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 16,
  },
  transferItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#edf2f7',
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e2e8f0',
  },
  transferDetails: {
    flex: 1,
  },
  transferHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3748',
  },
  transferMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  serviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 14,
    color: '#4a5568',
    marginLeft: 6,
  },
  date: {
    fontSize: 13,
    color: '#718096',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  collectButton: {
    backgroundColor: '#3182ce',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  announcement: {
    backgroundColor: '#ebf8ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#bee3f8',
  },
  announcementText: {
    color: '#2b6cb0',
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
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  navActive: {
    backgroundColor: '#ebf8ff',
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
  navActiveText: {
    color: '#3182ce',
    fontWeight: '500',
  },
});

export default RecentTransactions;
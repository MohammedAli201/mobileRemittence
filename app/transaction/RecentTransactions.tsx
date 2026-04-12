import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '../../context/UserContext';
import { TransactionService } from '../../services/apiClient';

export default function RecentTransactions() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const warmRecentTransactions = async () => {
      try {
        await TransactionService.getRecentTransaction('');
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    warmRecentTransactions();
  }, []);

  const userName = user?.firstName || 'Ali';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.profileBlock}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>
                {String(userName).slice(0, 1).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.welcomeText}>Morning,</Text>
              <Text style={styles.nameText}>{userName}</Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.brandText}>JubaPay</Text>
            <TouchableOpacity style={styles.notifyButton} activeOpacity={0.9}>
              <Ionicons name="notifications-outline" size={18} color="#FFF8E1" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.content, { paddingBottom: 110 + Math.max(insets.bottom, 8) }]}>
          <View style={styles.balanceCard}>
            <View style={styles.balanceCardTop}>
              <Text style={styles.balanceCardLabel}>JubaPay balance</Text>
              <Ionicons name="eye-outline" size={18} color="#2F2B23" />
            </View>
            <Text style={styles.balanceAmount}>NOK 5,013.00</Text>
          </View>

          <View style={styles.quickRow}>
            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => router.push('/remittance/RemittanceTypeScreen')}
              activeOpacity={0.9}
            >
              <Ionicons name="arrow-up-outline" size={16} color="#2F2B23" />
              <Text style={styles.quickCardText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickCard}
              onPress={() => router.push('/recipient/RecipientListScreen')}
              activeOpacity={0.9}
            >
              <Ionicons name="arrow-down-outline" size={16} color="#2F2B23" />
              <Text style={styles.quickCardText}>Recipients</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Transfer</Text>
              <TouchableOpacity activeOpacity={0.8}>
                <Text style={styles.sectionLink}>See more</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.transferRow}>
              <TouchableOpacity
                style={styles.addRecipientCircle}
                onPress={() => router.push('/recipient/AddRecipientScreen')}
                activeOpacity={0.9}
              >
                <Ionicons name="add" size={20} color="#2F2B23" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.recipientChip} activeOpacity={0.9}>
                <View style={styles.recipientChipAvatar}>
                  <Text style={styles.recipientChipAvatarText}>A</Text>
                </View>
                <Text style={styles.recipientChipText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.recipientChip}
                onPress={() => router.push('/recipient/RecipientListScreen')}
                activeOpacity={0.9}
              >
                <View style={styles.recipientChipAvatarDark}>
                  <Text style={styles.recipientChipAvatarText}>R</Text>
                </View>
                <Text style={styles.recipientChipText}>Recipients</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.sectionCardLarge}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>History Transaction</Text>
              <TouchableOpacity
                onPress={() => router.push('/transaction/transactionList')}
                activeOpacity={0.8}
              >
                <Text style={styles.sectionLink}>See more</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.historyList}>
              <TouchableOpacity style={styles.historyRow} activeOpacity={0.9}>
                <View style={styles.historyLeft}>
                  <View style={styles.historyIconWrap}>
                    <Ionicons name="paper-plane-outline" size={18} color="#2F2B23" />
                  </View>
                  <View>
                    <Text style={styles.historyTitle}>Send Money</Text>
                    <Text style={styles.historyMeta}>Today, 08:00 PM</Text>
                  </View>
                </View>
                <Text style={styles.historyNegative}>-NOK 300</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.historyRow} activeOpacity={0.9}>
                <View style={styles.historyLeft}>
                  <View style={styles.historyIconWrap}>
                    <Ionicons name="people-outline" size={18} color="#2F2B23" />
                  </View>
                  <View>
                    <Text style={styles.historyTitle}>Recipient Added</Text>
                    <Text style={styles.historyMeta}>Yesterday, 09:00 PM</Text>
                  </View>
                </View>
                <Text style={styles.historyPositive}>+1</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.bottomDock, { paddingBottom: Math.max(insets.bottom, 8) + 8 }]}>
          <TouchableOpacity style={styles.dockItem} activeOpacity={0.9}>
            <Ionicons name="headset-outline" size={18} color="#F4DF78" />
            <Text style={styles.dockLabelActive}>Contact Us</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dockItemActive}
            onPress={() => router.push('/remittance/RemittanceTypeScreen')}
            activeOpacity={0.9}
          >
            <View style={styles.dockItemIconActive}>
              <Ionicons name="paper-plane" size={18} color="#2F2B23" />
            </View>
            <Text style={styles.dockLabelActive}>Send Money</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dockItem}
            onPress={() => router.push('/transaction/transactionList')}
            activeOpacity={0.9}
          >
            <Ionicons name="list-outline" size={18} color="#F4DF78" />
            <Text style={styles.dockLabelActive}>Transfer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2F2B23',
  },
  container: {
    flex: 1,
    backgroundColor: '#2F2B23',
  },
  headerRow: {
    minHeight: 74,
    paddingHorizontal: 18,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1D768',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2F2B23',
  },
  welcomeText: {
    fontSize: 11,
    color: '#C9C1B2',
    lineHeight: 14,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F3DE78',
    letterSpacing: -0.3,
  },
  notifyButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#3A362E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 12,
  },
  balanceCard: {
    borderRadius: 20,
    backgroundColor: '#F4DF78',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  balanceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceCardLabel: {
    fontSize: 13,
    color: '#5B5030',
    fontWeight: '600',
  },
  balanceAmount: {
    marginTop: 10,
    fontSize: 39,
    fontWeight: '800',
    color: '#2F2B23',
    letterSpacing: -1,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickCard: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F8EDC1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  quickCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2F2B23',
  },
  sectionCard: {
    borderRadius: 22,
    backgroundColor: '#3A362B',
    padding: 16,
    gap: 14,
  },
  sectionCardLarge: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: '#3A362B',
    padding: 16,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8F6F0',
  },
  sectionLink: {
    fontSize: 12,
    color: '#D3C6A0',
  },
  transferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addRecipientCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4DF78',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientChip: {
    alignItems: 'center',
    gap: 6,
  },
  recipientChipAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F4DF78',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientChipAvatarDark: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#514A3B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientChipAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2F2B23',
  },
  recipientChipText: {
    fontSize: 12,
    color: '#F8F6F0',
  },
  historyList: {
    gap: 14,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  historyIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8EDC1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F8F6F0',
  },
  historyMeta: {
    fontSize: 11,
    color: '#B9B09D',
    marginTop: 2,
  },
  historyNegative: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B57',
  },
  historyPositive: {
    fontSize: 16,
    fontWeight: '700',
    color: '#49C980',
  },
  bottomDock: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    minHeight: 74,
    borderRadius: 22,
    backgroundColor: '#3A362B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  dockItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 72,
  },
  dockItemActive: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 88,
  },
  dockItemIconActive: {
    width: 38,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F4DF78',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockLabel: {
    fontSize: 11,
    color: '#8D8D8D',
    fontWeight: '600',
  },
  dockLabelActive: {
    fontSize: 11,
    color: '#F8F6F0',
    fontWeight: '700',
  },
});

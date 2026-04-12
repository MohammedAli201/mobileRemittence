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
import { useUser } from '../../context/UserContext';
import { TransactionService } from '../../services/apiClient';

export default function RecentTransactions() {
  const router = useRouter();
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
            <View style={styles.profileIconWrap}>
              <Ionicons name="person-outline" size={16} color="#7E8794" />
            </View>
            <View>
              <Text style={styles.welcomeText}>Welcome</Text>
              <Text style={styles.nameText}>{userName}!!</Text>
            </View>
          </View>

          <Text style={styles.brandText}>
            <Text style={styles.brandBlue}>Pay</Text>
            <Text style={styles.brandGold}>Sii</Text>
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.content}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recent Transfers</Text>
            <Ionicons name="airplane-outline" size={18} color="#C6C6C6" />
          </View>

          <View style={styles.emptySpace}>
            {loading ? <ActivityIndicator color="#2F86D6" /> : null}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.smallActionCard} activeOpacity={0.9}>
              <Ionicons name="headset-outline" size={22} color="#818A95" />
              <Text style={styles.smallActionText}>Contact Us</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryActionCard}
              onPress={() => router.push('/remittance/RemittanceTypeScreen')}
              activeOpacity={0.9}
            >
              <Ionicons name="paper-plane" size={20} color="#52626D" />
              <Text style={styles.primaryActionText}>Send Money</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallActionCard}
              onPress={() => router.push('/transaction/transactionList')}
              activeOpacity={0.9}
            >
              <Ionicons name="list-outline" size={22} color="#818A95" />
              <Text style={styles.smallActionText}>Transfers</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomDock}>
          <TouchableOpacity style={[styles.dockButton, styles.dockButtonActive]} activeOpacity={0.9}>
            <Ionicons name="home-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dockButton}
            onPress={() => router.push('/remittance/RemittanceTypeScreen')}
            activeOpacity={0.9}
          >
            <Ionicons name="airplane-outline" size={20} color="#7F8792" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerRow: {
    minHeight: 60,
    paddingHorizontal: 12,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8DCE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 10,
    color: '#7C7F86',
    lineHeight: 12,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    lineHeight: 18,
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  brandBlue: {
    color: '#1677C9',
  },
  brandGold: {
    color: '#E2B13C',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F1F1',
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 13,
    color: '#2B2B2B',
    fontWeight: '500',
  },
  emptySpace: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  smallActionCard: {
    width: 78,
    height: 78,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  primaryActionCard: {
    width: 72,
    height: 82,
    borderRadius: 14,
    backgroundColor: '#C9F0F4',
    borderWidth: 1.5,
    borderColor: '#3A8FD5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  smallActionText: {
    fontSize: 10,
    color: '#4D5560',
  },
  primaryActionText: {
    fontSize: 9,
    color: '#4D5560',
  },
  bottomDock: {
    height: 72,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#F7F7F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 58,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 4,
  },
  dockButton: {
    width: 52,
    height: 28,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ECECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockButtonActive: {
    backgroundColor: '#2D8ADD',
  },
});

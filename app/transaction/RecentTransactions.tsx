import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FintechPrimaryButton, fintechColors, fintechSpacing } from '../../components/ui/fintech';
import { ScrollScreen, useScreenInsets } from '../../components/ui/layout';
import { useUser } from '../../context/UserContext';
import { TransactionService } from '../../services/apiClient';

export default function RecentTransactions() {
  const router = useRouter();
  const { user } = useUser();
  const { top, bottom } = useScreenInsets();

  useEffect(() => {
    const warmRecentTransactions = async () => {
      try {
        await TransactionService.getRecentTransaction('');
      } catch (error) {
      }
    };

    warmRecentTransactions();
  }, []);

  const userName =
    user?.firstName ||
    user?.FirstName ||
    (user?.email ? String(user.email).split('@')[0] : '') ||
    'Account';

  return (
    <ScrollScreen contentStyle={[styles.container, { paddingTop: top }]}>
      <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.headerIconButton}
              onPress={() => router.push('/profile/ProfileScreen')}
              activeOpacity={0.85}
            >
              <Ionicons name="person-outline" size={16} color={fintechColors.text} />
            </TouchableOpacity>
            <View style={styles.profileBlock}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {String(userName).slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={styles.welcomeText}>Welcome</Text>
                <Text style={styles.nameText}>{userName}</Text>
              </View>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.brandText}>JubaPay</Text>
          </View>
        </View>

      <View style={styles.balanceCard}>
        <View style={styles.balanceCardTop}>
          <Text style={styles.balanceCardLabel}>Available balance</Text>
          <Ionicons name="eye-outline" size={18} color={fintechColors.textMuted} />
        </View>
        <Text style={styles.balanceAmount}>NOK 5,013.00</Text>
        <Text style={styles.balanceSub}>Ready to send anytime.</Text>
        <FintechPrimaryButton
          label="Send money"
          onPress={() => router.push('/remittance/RemittanceTypeScreen')}
          style={styles.primaryCta}
        />
      </View>

      <View style={styles.quickRow}>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push('/recipient/RecipientListScreen')}
          activeOpacity={0.9}
        >
          <Ionicons name="people-outline" size={16} color={fintechColors.text} />
          <Text style={styles.quickCardText}>Recipients</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickCard}
          onPress={() => router.push('/transaction/transactionList')}
          activeOpacity={0.9}
        >
          <Ionicons name="time-outline" size={16} color={fintechColors.text} />
          <Text style={styles.quickCardText}>History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick recipients</Text>
          <TouchableOpacity
            onPress={() => router.push('/recipient/RecipientListScreen')}
            activeOpacity={0.8}
          >
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transferRow}>
          <TouchableOpacity
            style={styles.addRecipientCircle}
            onPress={() => router.push('/recipient/AddRecipientScreen')}
            activeOpacity={0.9}
          >
            <Ionicons name="add" size={18} color={fintechColors.text} />
          </TouchableOpacity>
          <View style={styles.recipientChip}>
            <View style={styles.recipientChipAvatar}>
              <Text style={styles.recipientChipAvatarText}>AH</Text>
            </View>
            <Text style={styles.recipientChipText}>Ayaan</Text>
          </View>
          <View style={styles.recipientChip}>
            <View style={styles.recipientChipAvatar}>
              <Text style={styles.recipientChipAvatarText}>MO</Text>
            </View>
            <Text style={styles.recipientChipText}>Mohamed</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCardLarge}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent transfers</Text>
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
                <Ionicons name="paper-plane-outline" size={18} color={fintechColors.text} />
              </View>
              <View>
                <Text style={styles.historyTitle}>Ayaan H.</Text>
                <Text style={styles.historyMeta}>Somalia • Today 08:20</Text>
              </View>
            </View>
            <Text style={styles.historyNegative}>- NOK 300</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.historyRow} activeOpacity={0.9}>
            <View style={styles.historyLeft}>
              <View style={styles.historyIconWrap}>
                <Ionicons name="paper-plane-outline" size={18} color={fintechColors.text} />
              </View>
              <View>
                <Text style={styles.historyTitle}>Mohamed A.</Text>
                <Text style={styles.historyMeta}>Kenya • Yesterday 17:10</Text>
              </View>
            </View>
            <Text style={styles.historyNegative}>- NOK 1,200</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.historyRow} activeOpacity={0.9}>
            <View style={styles.historyLeft}>
              <View style={styles.historyIconWrap}>
                <Ionicons name="paper-plane-outline" size={18} color={fintechColors.text} />
              </View>
              <View>
                <Text style={styles.historyTitle}>Yusuf M.</Text>
                <Text style={styles.historyMeta}>Ethiopia • Mar 12</Text>
              </View>
            </View>
            <Text style={styles.historyNegative}>- NOK 540</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.bottomDock, { marginBottom: bottom }]}>
          <TouchableOpacity
            style={styles.dockItem}
            onPress={() => router.push('/support/contact')}
            activeOpacity={0.9}
          >
            <Ionicons name="headset-outline" size={18} color={fintechColors.text} />
            <Text style={styles.dockLabel}>Contact Us</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dockItemActive}
            onPress={() => router.push('/remittance/RemittanceTypeScreen')}
            activeOpacity={0.9}
          >
            <View style={styles.dockItemIconActive}>
              <Ionicons name="paper-plane" size={18} color={fintechColors.background} />
            </View>
            <Text style={styles.dockLabelActive}>Send Money</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.dockItem}
            onPress={() => router.push('/transaction/transactionList')}
            activeOpacity={0.9}
          >
            <Ionicons name="list-outline" size={18} color={fintechColors.text} />
            <Text style={styles.dockLabel}>Transfer</Text>
          </TouchableOpacity>
        </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: fintechSpacing.md,
  },
  headerRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.sm,
    flex: 1,
  },
  headerIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: fintechColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fintechColors.surface,
  },
  profileBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.sm,
  },
  profileAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: fintechColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarText: {
    fontSize: 12,
    fontWeight: '800',
    color: fintechColors.primary,
  },
  welcomeText: {
    fontSize: 10,
    color: fintechColors.textMuted,
    lineHeight: 12,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '700',
    color: fintechColors.text,
    lineHeight: 18,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.sm,
  },
  brandText: {
    fontSize: 13,
    fontWeight: '800',
    color: fintechColors.primary,
    letterSpacing: -0.1,
  },
  notifyButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: fintechColors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    borderRadius: 20,
    backgroundColor: fintechColors.surfaceStrong,
    borderWidth: 1,
    borderColor: fintechColors.border,
    paddingHorizontal: fintechSpacing.md,
    paddingVertical: fintechSpacing.md,
    gap: fintechSpacing.xs,
  },
  balanceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceCardLabel: {
    fontSize: 13,
    color: fintechColors.textMuted,
    fontWeight: '600',
  },
  balanceAmount: {
    marginTop: fintechSpacing.xs,
    fontSize: 26,
    fontWeight: '800',
    color: fintechColors.text,
    letterSpacing: -0.6,
  },
  balanceSub: {
    fontSize: 12,
    color: fintechColors.textMuted,
  },
  primaryCta: {
    marginTop: fintechSpacing.xs,
  },
  quickRow: {
    flexDirection: 'row',
    gap: fintechSpacing.sm,
  },
  quickCard: {
    flex: 1,
    height: 44,
    borderRadius: 18,
    backgroundColor: fintechColors.surface,
    borderWidth: 1,
    borderColor: fintechColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: fintechSpacing.xs,
  },
  quickCardText: {
    fontSize: 15,
    fontWeight: '600',
    color: fintechColors.text,
  },
  sectionCard: {
    borderRadius: 22,
    backgroundColor: fintechColors.surface,
    borderWidth: 1,
    borderColor: fintechColors.border,
    padding: fintechSpacing.md,
    gap: fintechSpacing.md,
  },
  sectionCardLarge: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: fintechColors.surface,
    borderWidth: 1,
    borderColor: fintechColors.border,
    padding: fintechSpacing.md,
    gap: fintechSpacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: fintechColors.text,
  },
  sectionLink: {
    fontSize: 12,
    color: fintechColors.textMuted,
  },
  transferRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.md,
  },
  addRecipientCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: fintechColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientChip: {
    alignItems: 'center',
    gap: fintechSpacing.xs,
  },
  recipientChipAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: fintechColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientChipAvatarDark: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: fintechColors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientChipAvatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: fintechColors.text,
  },
  recipientChipText: {
    fontSize: 12,
    color: fintechColors.text,
  },
  historyList: {
    gap: fintechSpacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.sm,
    flex: 1,
  },
  historyIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: fintechColors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: fintechColors.text,
  },
  historyMeta: {
    fontSize: 11,
    color: fintechColors.textMuted,
    marginTop: 2,
  },
  historyNegative: {
    fontSize: 14,
    fontWeight: '700',
    color: fintechColors.text,
  },
  historyPositive: {
    fontSize: 16,
    fontWeight: '700',
    color: '#49C980',
  },
  bottomDock: {
    marginHorizontal: 0,
    minHeight: 64,
    borderRadius: 0,
    backgroundColor: fintechColors.surface,
    borderTopWidth: 1,
    borderColor: fintechColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: fintechSpacing.lg,
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
    backgroundColor: fintechColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dockLabel: {
    fontSize: 11,
    color: fintechColors.textMuted,
    fontWeight: '600',
  },
  dockLabelActive: {
    fontSize: 11,
    color: fintechColors.text,
    fontWeight: '700',
  },
});

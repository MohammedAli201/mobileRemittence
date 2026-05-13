import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  FintechPrimaryButton,
  FintechReviewList,
  FintechReviewSectionCard,
  FintechScreenHeader,
  FintechStatusPill,
  fintechColors,
  fintechSpacing,
  formatMoney,
} from '../../components/ui/fintech';
import { FixedFooterScreen, useResponsiveMetrics } from '../../components/ui/layout';
import { getCountryNameFromCode, normalizeCountryCode, TransferService } from '../../services/remittance';
import { getTransferDraft, mergeTransferDraft } from '../../services/transferDraft';

const reasons = ['Family support', 'Friends', 'Education', 'Medical', 'Business', 'Gift', 'Other'];
const getParamValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const parseJsonParam = <T,>(value: string | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

type RouteRecipient = {
  id?: string;
  name?: string;
  phone?: string;
  relationship?: string;
  provider?: string;
  countryOfCitizenship?: string;
  address?: string;
  city?: string;
  service?: string;
};

type RouteTransaction = { reason?: string };

const splitRecipientName = (name?: string) => {
  const trimmedName = name?.trim() ?? '';
  if (!trimmedName) return { firstName: '', lastName: '' };
  const [firstName, ...rest] = trimmedName.split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
};

const flagAssets: Record<string, number> = {
  no: require('../../assets/flags/no.png'),
  so: require('../../assets/flags/so.png'),
  ke: require('../../assets/flags/ke.png'),
  et: require('../../assets/flags/et.png'),
  ug: require('../../assets/flags/ug.png'),
  tz: require('../../assets/flags/tz.png'),
  xx: require('../../assets/flags/xx.png'),
};

const flagMap: Record<string, { asset: number }> = {
  Norway: { asset: flagAssets.no },
  Somalia: { asset: flagAssets.so },
  Kenya: { asset: flagAssets.ke },
  Ethiopia: { asset: flagAssets.et },
  Uganda: { asset: flagAssets.ug },
  Tanzania: { asset: flagAssets.tz },
};

export default function AgreeAndPayScreen() {
  const router = useRouter();
  const { isSmallPhone } = useResponsiveMetrics();
  const { recipient: recipientRaw, trans: transRaw } = useLocalSearchParams();
  const transactionData = getTransferDraft();

  const recipientParam = getParamValue(recipientRaw);
  const transParam = getParamValue(transRaw);
  const recipient = parseJsonParam<RouteRecipient>(recipientParam, {});
  const trans = parseJsonParam<RouteTransaction>(transParam, {});
  const [selectedReason, setSelectedReason] = useState(
    trans.reason || transactionData.reason || 'Family support',
  );

  useEffect(() => {
    if (!recipientParam) return;

    const { firstName, lastName } = splitRecipientName(recipient.name);
    mergeTransferDraft({
      recipient: {
        id: recipient.id,
        firstName,
        lastName,
        phoneNumber: recipient.phone || '',
        relationshipToSender: recipient.relationship || '',
        avatarColor: transactionData.recipient.avatarColor || '#2B6CB0',
        receivingCountry: normalizeCountryCode(transactionData.receivingCountry || 'SO'),
        countryOfCitizenship: normalizeCountryCode(
          recipient.countryOfCitizenship || transactionData.recipient.countryOfCitizenship || 'SO',
        ),
        address: recipient.address || transactionData.recipient.address || '',
        city: recipient.city || transactionData.recipient.city || '',
        service: ((recipient.service as TransferService) || transactionData.recipient.service || 'MobileMoney') as TransferService,
      },
      reason: trans.reason || transactionData.reason || 'Family support',
      provider: recipient.provider || transactionData.provider || '',
    });
  }, [
    recipient.address,
    recipient.city,
    recipient.countryOfCitizenship,
    recipient.id,
    recipient.name,
    recipient.phone,
    recipient.provider,
    recipient.relationship,
    recipient.service,
    recipientParam,
    trans.reason,
    transactionData.provider,
    transactionData.reason,
    transactionData.receivingCountry,
    transactionData.recipient.address,
    transactionData.recipient.avatarColor,
    transactionData.recipient.city,
    transactionData.recipient.countryOfCitizenship,
    transactionData.recipient.service,
  ]);

  const recipientName = useMemo(
    () =>
      recipient.name ||
      [transactionData.recipient.firstName, transactionData.recipient.lastName]
        .filter(Boolean)
        .join(' '),
    [recipient.name, transactionData.recipient.firstName, transactionData.recipient.lastName],
  );

  const sendCountry = getCountryNameFromCode(transactionData.sendCountry || 'NO');
  const receiveCountry = getCountryNameFromCode(transactionData.receivingCountry || 'SO');
  const sendCurrency = transactionData.sendCurrency || 'NOK';
  const receiveCurrency = transactionData.receiveCurrency || 'USD';
  const receivingMethod =
    transactionData.provider || transactionData.service || recipient.provider || 'Premier Wallet';
  const recipientPhone = recipient.phone || transactionData.recipient.phoneNumber || '';
  const recipientDetailLine = [
    recipient.relationship || transactionData.recipient.relationshipToSender,
    recipient.city || transactionData.recipient.city,
  ]
    .filter(Boolean)
    .join(' • ');
  const fromFlag = flagMap[sendCountry]?.asset || flagAssets.xx;
  const recipientInitials = (recipientName || 'R')
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleContinue = () => {
    mergeTransferDraft({ reason: selectedReason });
    router.push(
      transactionData.entryPoint === 'repeat_send' && transactionData.paymentMethod
        ? '/transaction/MoneyTransferScreen'
        : '/transaction/PaymentMethodScreen',
    );
  };

  return (
    <FixedFooterScreen
      contentStyle={styles.container}
      footer={
        <View style={styles.footer}>
          <FintechPrimaryButton
            label="Review transfer"
            onPress={handleContinue}
            style={styles.footerButton}
            textStyle={styles.footerButtonText}
          />
        </View>
      }
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.85}
      >
        <Ionicons name="chevron-back" size={18} color={fintechColors.text} />
      </TouchableOpacity>

      <FintechScreenHeader
        title="Transfer confirmation"
        titleStyle={styles.headerTitle}
        subtitle={isSmallPhone ? 'Check before payment.' : 'Check the transfer essentials before payment.'}
        subtitleStyle={styles.headerSubtitle}
      />

      <View style={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <FintechStatusPill
              icon="swap-horizontal-outline"
              label={`${sendCountry} to ${receiveCountry}`}
              tone="info"
              style={styles.corridorPill}
            />
            <Text style={styles.heroMeta}>{receivingMethod}</Text>
          </View>

          <View style={styles.heroAmountsRow}>
            <View style={styles.amountPanel}>
              <Text style={styles.amountPanelLabel}>Recipient gets</Text>
              <Text style={styles.amountPanelValue}>
                {formatMoney(transactionData.receiveAmount, receiveCurrency)}
              </Text>
            </View>

            <View style={styles.amountPanel}>
              <View style={styles.amountPanelHead}>
                <Image source={fromFlag} style={styles.flagImage} />
                <Text style={styles.amountPanelLabel}>You send</Text>
              </View>
              <Text style={[styles.amountPanelValue, styles.amountPanelValueRight]}>
                {formatMoney(transactionData.sendAmount, sendCurrency)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.recipientCard}>
          <View
            style={[
              styles.heroRecipientAvatar,
              { backgroundColor: transactionData.recipient.avatarColor || fintechColors.primaryStrong },
            ]}
          >
            <Text style={styles.heroRecipientInitials}>{recipientInitials}</Text>
          </View>
          <View style={styles.heroRecipientCopy}>
            <Text style={styles.heroRecipientName}>{recipientName || 'No recipient selected'}</Text>
            <Text style={styles.heroRecipientMeta}>
              {[recipientPhone || 'Phone not available', recipientDetailLine]
                .filter(Boolean)
                .join(' • ')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.heroRecipientAction}
            onPress={() => router.back()}
            activeOpacity={0.88}
          >
            <Ionicons name="chevron-forward" size={17} color={fintechColors.surface} />
          </TouchableOpacity>
        </View>

        <FintechReviewSectionCard style={styles.sectionCard}>
          <FintechReviewList
            items={[
              { label: 'Fee', value: formatMoney(transactionData.fees, sendCurrency) },
              { label: 'Total to pay', value: formatMoney(transactionData.totalAmount, sendCurrency) },
            ]}
            style={styles.reviewList}
          />

          <View style={styles.reasonSection}>
            <Text style={styles.reasonLabel}>Transfer purpose</Text>
            <View style={styles.reasonChips}>
              {reasons.map((reason) => {
                const active = reason === selectedReason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonChip, active && styles.reasonChipActive]}
                    onPress={() => setSelectedReason(reason)}
                    activeOpacity={0.75}
                  >
                    <Text style={[styles.reasonChipText, active && styles.reasonChipTextActive]}>
                      {reason}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </FintechReviewSectionCard>
      </View>
    </FixedFooterScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: fintechSpacing.xs,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 20, lineHeight: 24, fontWeight: '800' },
  headerSubtitle: {
    maxWidth: 300,
    color: fintechColors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    gap: fintechSpacing.sm,
    marginTop: 2,
  },
  heroCard: {
    borderRadius: 24,
    backgroundColor: '#0E1A2B',
    padding: 16,
    gap: 14,
    shadowColor: '#08111D',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 6,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: fintechSpacing.sm,
  },
  corridorPill: {
    borderColor: 'rgba(147,183,255,0.28)',
    backgroundColor: 'rgba(229,239,255,0.1)',
  },
  heroMeta: {
    flex: 1,
    textAlign: 'right',
    fontSize: 11,
    fontWeight: '700',
    color: '#C9D6E6',
  },
  heroAmountsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: fintechSpacing.md,
  },
  amountPanel: {
    flex: 1,
    gap: 6,
    minHeight: 74,
    justifyContent: 'space-between',
  },
  amountPanelHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
  },
  amountPanelLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8FA5BD',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  amountPanelValue: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    color: fintechColors.surface,
  },
  amountPanelValueRight: {
    textAlign: 'right',
  },
  flagImage: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  recipientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: fintechColors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E1E9F1',
    paddingHorizontal: 13,
    paddingVertical: 11,
    shadowColor: '#10243E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  heroRecipientAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRecipientInitials: {
    fontSize: 13,
    fontWeight: '800',
    color: fintechColors.surface,
  },
  heroRecipientCopy: {
    flex: 1,
    gap: 2,
  },
  heroRecipientName: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '800',
    color: fintechColors.text,
  },
  heroRecipientMeta: {
    fontSize: 11,
    lineHeight: 15,
    color: fintechColors.textMuted,
  },
  heroRecipientAction: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fintechColors.primaryStrong,
  },
  sectionCard: {
    gap: 12,
    borderRadius: 22,
    borderColor: '#E0E8F0',
    backgroundColor: '#FCFDFE',
    shadowColor: '#10243E',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    paddingTop: 15,
    paddingBottom: 16,
  },
  reviewList: { gap: 6 },
  reasonSection: {
    gap: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E7EDF3',
  },
  reasonLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: fintechColors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    paddingHorizontal: fintechSpacing.md,
  },
  reasonChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: fintechSpacing.md,
  },
  reasonChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: fintechColors.surfaceStrong,
  },
  reasonChipActive: {
    backgroundColor: fintechColors.primaryStrong,
  },
  reasonChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: fintechColors.text,
  },
  reasonChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  footer: { paddingTop: 4 },
  footerButton: {
    minHeight: 52,
    borderRadius: 18,
    shadowColor: '#056B47',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 4,
  },
  footerButtonText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

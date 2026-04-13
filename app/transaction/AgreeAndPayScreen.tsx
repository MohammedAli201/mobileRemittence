import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  FintechPrimaryButton,
  FintechScreenHeader,
  FintechSectionCard,
  FintechStickyActionArea,
  fintechColors,
  fintechSpacing,
} from '../../components/ui/fintech';
import { Screen } from '../../components/ui/layout';
import { normalizeCountryCode, TransferService } from '../../services/remittance';
import { getTransferDraft, mergeTransferDraft } from '../../services/transferDraft';

const reasons = ['Family support', 'Friends', 'Education', 'Medical', 'Business', 'Gift', 'Other'];
const getParamValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
const parseJsonParam = <T,>(value: string | undefined, fallback: T): T => {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
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

const formatAmount = (amount: number, currency: string) => `${Number(amount || 0).toFixed(2)} ${currency}`;
const flagAssets: Record<string, number> = {
  no: require('../../assets/flags/no.png'),
  so: require('../../assets/flags/so.png'),
  ke: require('../../assets/flags/ke.png'),
  et: require('../../assets/flags/et.png'),
  ug: require('../../assets/flags/ug.png'),
  tz: require('../../assets/flags/tz.png'),
  xx: require('../../assets/flags/xx.png'),
};
const flagMap: Record<string, { label: string; asset: number }> = {
  Norway: { label: 'NO', asset: flagAssets.no },
  Somalia: { label: 'SO', asset: flagAssets.so },
  Kenya: { label: 'KE', asset: flagAssets.ke },
  Ethiopia: { label: 'ET', asset: flagAssets.et },
  Uganda: { label: 'UG', asset: flagAssets.ug },
  Tanzania: { label: 'TZ', asset: flagAssets.tz },
};

export default function AgreeAndPayScreen() {
  const router = useRouter();
  const { recipient: recipientRaw, trans: transRaw } = useLocalSearchParams();
  const transactionData = getTransferDraft();

  const recipientParam = getParamValue(recipientRaw);
  const transParam = getParamValue(transRaw);
  const recipient = parseJsonParam<RouteRecipient>(recipientParam, {});
  const trans = parseJsonParam<RouteTransaction>(transParam, {});
  const [selectedReason, setSelectedReason] = useState(trans.reason || transactionData.reason || 'Family support');
  const [reasonMenuOpen, setReasonMenuOpen] = useState(false);

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
        countryOfCitizenship: normalizeCountryCode(recipient.countryOfCitizenship || transactionData.recipient.countryOfCitizenship || 'SO'),
        address: recipient.address || transactionData.recipient.address || '',
        city: recipient.city || transactionData.recipient.city || '',
        service: ((recipient.service as TransferService) || transactionData.recipient.service || 'MobileMoney') as TransferService,
      },
      reason: trans.reason || transactionData.reason || 'Family support',
      provider: recipient.provider || transactionData.provider || '',
    });
  }, [recipient.id, recipient.name, recipient.phone, recipient.provider, recipient.relationship, recipientParam, trans.reason, transactionData.provider, transactionData.reason, transactionData.recipient.address, transactionData.recipient.avatarColor, transactionData.recipient.city, transactionData.recipient.countryOfCitizenship, transactionData.recipient.service]);

  const recipientName = useMemo(
    () => recipient.name || [transactionData.recipient.firstName, transactionData.recipient.lastName].filter(Boolean).join(' '),
    [recipient.name, transactionData.recipient.firstName, transactionData.recipient.lastName],
  );

  const sendCountry = transactionData.sendCountry || 'Norway';
  const receiveCountry = transactionData.receivingCountry || 'Somalia';
  const sendCurrency = transactionData.sendCurrency || 'NOK';
  const receiveCurrency = transactionData.receiveCurrency || 'USD';
  const receivingMethod = transactionData.provider || transactionData.service || recipient.provider || 'Premier Wallet';
  const recipientPhone = recipient.phone || transactionData.recipient.phoneNumber || '';
  const fromFlag = flagMap[sendCountry] || { label: sendCountry.slice(0, 2).toUpperCase(), asset: flagAssets.xx };
  const toFlag = flagMap[receiveCountry] || { label: receiveCountry.slice(0, 2).toUpperCase(), asset: flagAssets.xx };

  const handleContinue = () => {
    mergeTransferDraft({ reason: selectedReason });
    router.push('/transaction/PaymentMethodScreen');
  };

  return (
    <Screen contentStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
        <Ionicons name="chevron-back" size={18} color={fintechColors.text} />
      </TouchableOpacity>

      <FintechScreenHeader
        title="Agree & Pay"
        titleStyle={styles.headerTitle}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
          <FintechSectionCard style={styles.amountCard}>
            <View style={styles.amountHeader}>
              <View style={styles.amountHeaderLeft}>
                <View style={styles.flagBadge}>
                  <Image source={fromFlag.asset} style={styles.flagImage} />
                </View>
                <View style={styles.amountHeaderCopy}>
                  <Text style={styles.currencyCode}>{sendCurrency}</Text>
                  <Text style={styles.countryName}>{sendCountry}</Text>
                </View>
              </View>
              <View style={styles.amountHeaderRight}>
                <Text style={styles.amountLabel}>You send</Text>
                <Text style={styles.amountValue}>
                  {formatAmount(transactionData.sendAmount, sendCurrency)}
                </Text>
              </View>
            </View>
          </FintechSectionCard>

          <FintechSectionCard style={styles.amountCard}>
            <View style={styles.amountHeader}>
              <View style={styles.amountHeaderLeft}>
                <View style={styles.flagBadge}>
                  <Image source={toFlag.asset} style={styles.flagImage} />
                </View>
                <View style={styles.amountHeaderCopy}>
                  <Text style={styles.currencyCode}>{receiveCurrency}</Text>
                  <Text style={styles.countryName}>{receiveCountry}</Text>
                </View>
              </View>
              <View style={styles.amountHeaderRight}>
                <Text style={styles.amountLabel}>They receive</Text>
                <Text style={styles.amountValue}>
                  {formatAmount(transactionData.receiveAmount, receiveCurrency)}
                </Text>
              </View>
            </View>
          </FintechSectionCard>

          <FintechSectionCard>
            <Text style={styles.infoLabel}>Receiving method</Text>
            <Text style={styles.infoValue}>{receivingMethod}</Text>
          </FintechSectionCard>

          <FintechSectionCard>
            <Text style={styles.infoLabel}>Selected recipient</Text>
            <Text style={styles.infoValue}>
              {recipientName || 'No recipient selected'}
              {recipientPhone ? `  -  ${recipientPhone}` : ''}
            </Text>
          </FintechSectionCard>

          <FintechSectionCard style={styles.reasonBlock}>
            <Text style={styles.infoLabel}>Reason</Text>
            <TouchableOpacity style={styles.reasonCard} onPress={() => setReasonMenuOpen((current) => !current)} activeOpacity={0.9}>
              <View style={styles.reasonRow}>
                <View style={styles.reasonValueWrap}>
                  <Text style={styles.reasonValue}>{selectedReason}</Text>
                  <Ionicons name={reasonMenuOpen ? 'chevron-up' : 'chevron-down'} size={18} color={fintechColors.textSubtle} />
                </View>
              </View>
            </TouchableOpacity>

            {reasonMenuOpen ? (
              <View style={styles.reasonMenu}>
                {reasons.map((reason) => {
                  const active = reason === selectedReason;
                  return (
                    <Pressable
                      key={reason}
                      style={[styles.reasonItem, active && styles.reasonItemActive]}
                      onPress={() => {
                        setSelectedReason(reason);
                        setReasonMenuOpen(false);
                      }}
                    >
                      <Text style={[styles.reasonItemText, active && styles.reasonItemTextActive]}>{reason}</Text>
                      {active ? <Ionicons name="checkmark" size={18} color={fintechColors.primary} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </FintechSectionCard>

      </ScrollView>

      <FintechStickyActionArea style={styles.footer}>
        <FintechPrimaryButton label="Continue" onPress={handleContinue} />
      </FintechStickyActionArea>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: fintechSpacing.sm },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: fintechColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fintechColors.surface,
  },
  headerTitle: { fontSize: 22, lineHeight: 26 },
  content: { flex: 1, marginTop: fintechSpacing.sm },
  contentContainer: { gap: fintechSpacing.sm, paddingBottom: fintechSpacing.md },
  amountCard: { gap: fintechSpacing.xs, padding: fintechSpacing.md },
  amountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: fintechSpacing.sm,
  },
  amountHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: fintechSpacing.sm },
  amountHeaderCopy: { gap: 2 },
  amountHeaderRight: { alignItems: 'flex-end' },
  amountLabel: { fontSize: 11, fontWeight: '700', color: fintechColors.textMuted },
  amountValue: { fontSize: 16, fontWeight: '800', color: fintechColors.text },
  currencyCode: { fontSize: 14, fontWeight: '800', color: fintechColors.text },
  countryName: { fontSize: 11, color: fintechColors.textMuted },
  flagBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: fintechColors.border,
  },
  flagImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  infoLabel: { fontSize: 11, fontWeight: '700', color: fintechColors.textSubtle, textTransform: 'uppercase', letterSpacing: 0.6 },
  infoValue: { fontSize: 13, fontWeight: '700', color: fintechColors.text },
  reasonBlock: { padding: fintechSpacing.md },
  reasonCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: fintechColors.border,
    backgroundColor: fintechColors.surfaceAlt,
    paddingHorizontal: fintechSpacing.md,
    paddingVertical: fintechSpacing.sm,
  },
  reasonRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: fintechSpacing.sm },
  reasonValueWrap: { flexDirection: 'row', alignItems: 'center', gap: fintechSpacing.xs },
  reasonValue: { fontSize: 13, fontWeight: '700', color: fintechColors.text },
  reasonMenu: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: fintechColors.border,
    overflow: 'hidden',
    backgroundColor: fintechColors.surfaceAlt,
  },
  reasonItem: {
    minHeight: 40,
    paddingHorizontal: fintechSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: fintechColors.border,
  },
  reasonItemActive: { backgroundColor: fintechColors.primarySoft },
  reasonItemText: { fontSize: 13, color: fintechColors.text },
  reasonItemTextActive: { fontWeight: '800', color: fintechColors.text },
  footer: { paddingTop: fintechSpacing.md },
});

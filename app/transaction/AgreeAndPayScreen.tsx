import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTransferDraft, mergeTransferDraft } from '../../services/transferDraft';

const reasons = ['Family support', 'Friends', 'Education', 'Medical', 'Business', 'Gift', 'Other'];

const getParamValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

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

type RouteTransaction = {
  reason?: string;
};

const splitRecipientName = (name?: string) => {
  const trimmedName = name?.trim() ?? '';
  if (!trimmedName) {
    return { firstName: '', lastName: '' };
  }

  const [firstName, ...rest] = trimmedName.split(/\s+/);
  return {
    firstName,
    lastName: rest.join(' '),
  };
};

const formatAmount = (amount: number) => Number(amount || 0).toFixed(2).replace('.', ',');

export default function AgreeAndPayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
        countryOfCitizenship: recipient.countryOfCitizenship || transactionData.recipient.countryOfCitizenship || '',
        address: recipient.address || transactionData.recipient.address || '',
        city: recipient.city || transactionData.recipient.city || '',
        service: recipient.service || transactionData.recipient.service || '',
      },
      reason: trans.reason || transactionData.reason || 'Family support',
      provider: recipient.provider || transactionData.provider || '',
    });
  }, [
    recipient.id,
    recipient.name,
    recipient.phone,
    recipient.provider,
    recipient.relationship,
    recipientParam,
    trans.reason,
    transactionData.provider,
    transactionData.reason,
    transactionData.recipient.avatarColor,
  ]);

  const recipientName = useMemo(
    () => recipient.name || [transactionData.recipient.firstName, transactionData.recipient.lastName].filter(Boolean).join(' '),
    [recipient.name, transactionData.recipient.firstName, transactionData.recipient.lastName]
  );

  const sendCountry = transactionData.sendCountry || 'Norway';
  const receiveCountry = transactionData.receivingCountry || 'Somalia';
  const sendCurrency = transactionData.sendCurrency || 'NOK';
  const receiveCurrency = transactionData.receiveCurrency || 'USD';
  const receivingMethod = transactionData.provider || transactionData.service || recipient.provider || 'Premier Wallet';
  const recipientPhone = recipient.phone || transactionData.recipient.phoneNumber || '';

  const handleContinue = () => {
    mergeTransferDraft({
      reason: selectedReason,
    });

    router.push('/transaction/PaymentMethodScreen');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="close" size={20} color="#2B2B2B" />
        </TouchableOpacity>

        <Text style={styles.screenLabel}>Sending to {receiveCountry}</Text>
        <Text style={styles.screenTitle}>Agree & Pay</Text>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: reasonMenuOpen ? 16 : 8 }]}
          showsVerticalScrollIndicator={reasonMenuOpen}
          scrollEnabled={reasonMenuOpen}
        >
          <View style={styles.primaryReceiveCard}>
            <View style={styles.primaryReceiveContent}>
              <Text style={styles.primaryReceiveLabel}>They get</Text>
              <View style={styles.primaryReceiveAmountRow}>
                <Text style={styles.primaryReceiveValue}>{formatAmount(transactionData.receiveAmount)}</Text>
                <View style={styles.primaryReceiveCurrencyBadge}>
                  <CountryBadge country={receiveCountry} />
                  <Text style={styles.primaryReceiveCurrency}>{receiveCurrency}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.amountStack}>
            <AmountCard
              country={sendCountry}
              currency={sendCurrency}
              label="You send"
              amount={formatAmount(transactionData.sendAmount)}
            />
          </View>

          <View style={styles.reviewCard}>
            <View style={styles.reviewBlock}>
              <Text style={styles.reviewBlockLabel}>Recipient</Text>
              <View style={styles.reviewValueWrap}>
                <View style={styles.personBadge}>
                  <Text style={styles.personBadgeText}>
                    {(recipientName || 'R').slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.reviewValueStrong}>{recipientName || 'No recipient selected'}</Text>
              </View>
            </View>

            <View style={styles.reviewDivider} />

            <View style={styles.reviewBlock}>
              <Text style={styles.reviewBlockLabel}>Delivery method</Text>
              <View style={styles.reviewValueWrap}>
                <Ionicons name="card-outline" size={14} color="#8F8F8F" />
                <Text style={styles.reviewValueStrong}>{receivingMethod}</Text>
              </View>
            </View>

            <View style={styles.reviewDivider} />

            <View style={styles.reviewGrid}>
              <View style={styles.reviewBlock}>
                <Text style={styles.reviewBlockLabel}>Phone</Text>
                <Text style={styles.reviewValuePlain}>{recipientPhone || 'No phone number'}</Text>
              </View>

              <TouchableOpacity
                style={[styles.reasonCard, reasonMenuOpen && styles.reasonCardOpen]}
                onPress={() => setReasonMenuOpen((current) => !current)}
                activeOpacity={0.9}
              >
                <View style={styles.reasonCardTop}>
                  <Text style={styles.reviewBlockLabel}>Reason</Text>
                  <Ionicons name={reasonMenuOpen ? 'chevron-up' : 'chevron-down'} size={16} color="#94A3B8" />
                </View>
                <Text style={styles.reviewValueStrong}>{selectedReason}</Text>
              </TouchableOpacity>
            </View>

            {reasonMenuOpen ? (
              <View style={styles.dropdownCard}>
                {reasons.map((reason) => {
                  const active = reason === selectedReason;
                  return (
                    <Pressable
                      key={reason}
                      style={[styles.dropdownItem, active && styles.dropdownItemActive]}
                      onPress={() => {
                        setSelectedReason(reason);
                        setReasonMenuOpen(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, active && styles.dropdownItemTextActive]}>{reason}</Text>
                      {active ? <Ionicons name="checkmark" size={18} color="#BF8451" /> : null}
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 8) + 6 }]}>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatAmount(transactionData.totalAmount)} {sendCurrency}
            </Text>
          </View>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.9}>
            <Text style={styles.continueText}>Confirm & Pay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function AmountCard({
  country,
  currency,
  label,
  amount,
}: {
  country: string;
  currency: string;
  label: string;
  amount: string;
}) {
  return (
    <View style={styles.amountCard}>
      <Text style={styles.amountCardLabel}>{label}</Text>
      <View style={styles.amountCardRow}>
        <Text style={styles.amountCardValue}>{amount}</Text>
        <View style={styles.currencyWrap}>
          <CountryBadge country={country} />
          <Text style={styles.currencyWrapText}>{currency}</Text>
        </View>
      </View>
    </View>
  );
}

function CountryBadge({ country }: { country: string }) {
  if (country === 'Norway' || country === 'NO') {
    return (
      <View style={[styles.flagBox, styles.flagNorway]}>
        <View style={styles.flagNorwayVertical} />
        <View style={styles.flagNorwayHorizontal} />
      </View>
    );
  }

  if (country === 'Somalia' || country === 'SO') {
    return (
      <View style={[styles.flagBox, styles.flagSomalia]}>
        <Ionicons name="star" size={9} color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={[styles.flagBox, styles.flagDefault]}>
      <Text style={styles.flagText}>{country.slice(0, 2).toUpperCase()}</Text>
    </View>
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
    paddingHorizontal: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#F7F8FA',
    marginBottom: 12,
  },
  screenLabel: {
    fontSize: 15,
    color: '#C9C1B2',
    marginBottom: 4,
  },
  screenTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: '#F8F6F0',
    marginBottom: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: 10,
  },
  amountStack: {
    gap: 10,
  },
  primaryReceiveCard: {
    borderRadius: 28,
    backgroundColor: '#3A362B',
    paddingHorizontal: 18,
    paddingVertical: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryReceiveContent: {
    width: '100%',
  },
  primaryReceiveLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F3E7C2',
    marginBottom: 4,
  },
  primaryReceiveAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  primaryReceiveValue: {
    flex: 1,
    fontSize: 29,
    lineHeight: 33,
    fontWeight: '800',
    color: '#F8F6F0',
  },
  primaryReceiveCurrencyBadge: {
    minWidth: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#E8F7EE',
  },
  primaryReceiveCurrency: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2F2B23',
  },
  amountCard: {
    backgroundColor: '#3A362B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4B453A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  amountCardLabel: {
    fontSize: 12,
    color: '#F3E7C2',
    fontWeight: '600',
    marginBottom: 6,
  },
  amountCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  amountCardValue: {
    fontSize: 27,
    fontWeight: '800',
    color: '#F8F6F0',
  },
  currencyWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyWrapText: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '700',
  },
  flagBox: {
    width: 24,
    height: 18,
    borderRadius: 4,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagNorway: {
    backgroundColor: '#ED3943',
  },
  flagNorwayVertical: {
    position: 'absolute',
    left: 6,
    width: 5,
    height: '100%',
    backgroundColor: '#1E4D99',
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  flagNorwayHorizontal: {
    position: 'absolute',
    top: 6,
    width: '100%',
    height: 4,
    backgroundColor: '#1E4D99',
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  flagSomalia: {
    backgroundColor: '#3B86DA',
  },
  flagDefault: {
    backgroundColor: '#D7E7F8',
  },
  flagText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#21507C',
  },
  reviewCard: {
    backgroundColor: '#3A362B',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#4B453A',
    padding: 16,
    gap: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  reviewBlock: {
    gap: 6,
  },
  reviewBlockLabel: {
    fontSize: 12,
    color: '#D8CEB5',
    fontWeight: '600',
  },
  reviewValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewValueStrong: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8F6F0',
    flexShrink: 1,
  },
  reviewValuePlain: {
    fontSize: 14,
    color: '#F8F6F0',
  },
  personBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F4DF78',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personBadgeText: {
    fontSize: 12,
    color: '#2F2B23',
    fontWeight: '600',
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#4B453A',
  },
  reviewGrid: {
    gap: 8,
  },
  reasonCard: {
    borderRadius: 16,
    backgroundColor: '#343026',
    borderWidth: 1,
    borderColor: '#4B453A',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  reasonCardOpen: {
    borderColor: '#F4DF78',
  },
  reasonCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownCard: {
    borderRadius: 16,
    backgroundColor: '#343026',
    borderWidth: 1,
    borderColor: '#4B453A',
    overflow: 'hidden',
  },
  dropdownItem: {
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#4B453A',
  },
  dropdownItemActive: {
    backgroundColor: '#4A4436',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#F8F6F0',
  },
  dropdownItemTextActive: {
    color: '#F4DF78',
    fontWeight: '600',
  },
  footer: {
    paddingTop: 8,
    gap: 8,
    backgroundColor: '#2F2B23',
  },
  totalCard: {
    minHeight: 52,
    borderRadius: 20,
    backgroundColor: '#3A362B',
    borderWidth: 1,
    borderColor: '#4B453A',
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 15,
    color: '#D8CEB5',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8F6F0',
  },
  continueButton: {
    height: 48,
    borderRadius: 28,
    backgroundColor: '#F4DF78',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.24,
    shadowRadius: 12,
    elevation: 4,
  },
  continueText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2F2B23',
  },
});

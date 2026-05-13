import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import {
  FintechFooterCard,
  FintechInfoRow,
  FintechPrimaryButton,
  FintechReceiptCard,
  FintechScreenHeader,
  FintechSecondaryButton,
  FintechStatusPill,
  FintechSummaryTile,
  fintechSpacing,
} from '../../components/ui/fintech';
import { ScrollScreen, useResponsiveMetrics } from '../../components/ui/layout';
import { getTransferDraft } from '../../services/transferDraft';

const getParamValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

const formatMoney = (amount: number, currency: string) =>
  `${Number(amount || 0).toFixed(2)} ${currency}`.trim();

const formatReceiptDate = (value?: string) => {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function ReceiptScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const transactionData = getTransferDraft();
  const { isSmallPhone } = useResponsiveMetrics();

  const transactionId = getParamValue(params.transactionId) || `TX-${Date.now()}`;
  const sender = getParamValue(params.sender) || 'Account holder';
  const recipient = getParamValue(params.recipient) ||
    [transactionData.recipient.firstName, transactionData.recipient.lastName].filter(Boolean).join(' ') ||
    'Recipient';
  const createdAt = getParamValue(params.createdAt);
  const status = getParamValue(params.status) || 'Success';

  const receiptData = useMemo(() => ({
    transactionId,
    sender,
    recipient,
    amountSent: formatMoney(transactionData.sendAmount, transactionData.sendCurrency),
    fees: formatMoney(transactionData.fees, transactionData.sendCurrency),
    exchangeRate: `1 ${transactionData.sendCurrency} = ${transactionData.exchangeRate.toFixed(4)} ${transactionData.receiveCurrency}`,
    recipientGets: formatMoney(transactionData.receiveAmount, transactionData.receiveCurrency),
    total: formatMoney(transactionData.totalAmount, transactionData.sendCurrency),
    date: formatReceiptDate(createdAt),
    status,
  }), [
    createdAt,
    recipient,
    sender,
    status,
    transactionData.exchangeRate,
    transactionData.fees,
    transactionData.receiveAmount,
    transactionData.receiveCurrency,
    transactionData.sendAmount,
    transactionData.sendCurrency,
    transactionData.totalAmount,
    transactionId,
  ]);

  const handleDownload = () => {
    Alert.alert('PDF export', 'PDF export can be connected to your native share or print flow next.');
  };

  const handleShare = () => {
    Alert.alert('Share receipt', 'Receipt sharing can be connected to the native share sheet next.');
  };

  return (
    <ScrollScreen contentStyle={styles.container}>
      <FintechScreenHeader
        eyebrow="Receipt"
        title="Transfer receipt"
        subtitle="Official proof of payment and payout details."
        right={<FintechStatusPill icon="checkmark-circle-outline" label={receiptData.status} tone="success" />}
      />

        <FintechReceiptCard title="Transfer complete">
          <View style={[styles.summaryRow, isSmallPhone && styles.summaryRowStack]}>
            <FintechSummaryTile label="Total paid" value={receiptData.total} />
            <FintechSummaryTile label="Recipient gets" value={receiptData.recipientGets} emphasis />
          </View>
        </FintechReceiptCard>

        <FintechReceiptCard title="Receipt details">
          <FintechInfoRow label="Transaction ID" value={receiptData.transactionId} />
          <FintechInfoRow label="Sender" value={receiptData.sender} />
          <FintechInfoRow label="Recipient" value={receiptData.recipient} />
          <FintechInfoRow label="Amount sent" value={receiptData.amountSent} />
          <FintechInfoRow label="Fees" value={receiptData.fees} />
          <FintechInfoRow label="Exchange rate" value={receiptData.exchangeRate} />
          <FintechInfoRow label="Date" value={receiptData.date} />
        </FintechReceiptCard>

      <FintechFooterCard style={styles.footer}>
        <FintechPrimaryButton label="Download PDF" onPress={handleDownload} />
        <FintechSecondaryButton label="Share receipt" onPress={handleShare} />
        <FintechSecondaryButton label="Done" onPress={() => router.replace('/transaction/RecentTransactions')} />
      </FintechFooterCard>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: fintechSpacing.sm,
    gap: fintechSpacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: fintechSpacing.sm,
  },
  summaryRowStack: {
    flexDirection: 'column',
  },
  footer: {
    gap: fintechSpacing.sm,
  },
});

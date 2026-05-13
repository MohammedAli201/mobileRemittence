import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
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

const getParamValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const getStatusTone = (status: string) => {
  const normalized = status?.toLowerCase();
  if (normalized.includes('paid') || normalized.includes('complete') || normalized.includes('success')) {
    return 'success';
  }
  if (normalized.includes('fail') || normalized.includes('cancel')) {
    return 'danger';
  }
  return 'warning';
};

export default function TransactionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { isSmallPhone } = useResponsiveMetrics();

  const transactionId = getParamValue(params.transactionId) || 'N/A';
  const recipient = getParamValue(params.recipient) || 'Unknown';
  const country = getParamValue(params.country) || 'Destination not set';
  const date = getParamValue(params.date) || 'N/A';
  const amount = getParamValue(params.amount) || 'NOK 0.00';
  const status = getParamValue(params.status) || 'Pending';
  const method = getParamValue(params.method) || 'Transfer';

  return (
    <ScrollScreen contentStyle={styles.container}>
      <FintechScreenHeader
        eyebrow="Transaction"
        title="Transfer details"
        subtitle="Review the recipient, amount, status, and routing details."
        right={
          <FintechStatusPill
            icon="information-circle-outline"
            label={status}
            tone={getStatusTone(status)}
          />
        }
      />

      <FintechReceiptCard title="Transaction summary">
        <View style={[styles.summaryRow, isSmallPhone && styles.summaryRowStack]}>
          <FintechSummaryTile label="Amount" value={amount} emphasis />
          <FintechSummaryTile label="Method" value={method} />
        </View>
      </FintechReceiptCard>

      <FintechReceiptCard title="Transaction details">
        <FintechInfoRow label="Transaction ID" value={transactionId} />
        <FintechInfoRow label="Recipient" value={recipient} />
        <FintechInfoRow label="Destination" value={country} />
        <FintechInfoRow label="Date" value={date} />
        <FintechInfoRow label="Status" value={status} />
        <FintechInfoRow label="Payment method" value={method} />
      </FintechReceiptCard>

      <FintechFooterCard style={styles.footer}>
        <FintechPrimaryButton
          label="Back to history"
          onPress={() => router.replace('/transaction/transactionList')}
        />
        <FintechSecondaryButton
          label="Back home"
          onPress={() => router.replace('/transaction/RecentTransactions')}
        />
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

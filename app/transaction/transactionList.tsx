import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  FintechEmptyState,
  FintechScreenHeader,
  FintechSectionCard,
  FintechStatusPill,
  fintechColors,
  fintechSpacing,
} from '../../components/ui/fintech';
import { ScrollScreen } from '../../components/ui/layout';
import { TransactionService } from '../../services/apiClient';

type ApiTransaction = {
  id: string;
  name: string;
  country: string;
  date: string;
  amount: string;
  status: string;
  method: string;
  createdAtMs?: number;
};

const getStatusTone = (status: string) => {
  const normalized = status?.toLowerCase();
  if (normalized.includes('paid') || normalized.includes('complete')) return 'success';
  if (normalized.includes('fail') || normalized.includes('cancel')) return 'danger';
  return 'warning';
};

export default function TransactionList() {
  const router = useRouter();
  const [transfers, setTransfers] = useState<ApiTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await TransactionService.fetchAllTransaction();
        const data = response?.Data || [];

        const mapped: ApiTransaction[] = data.map((item: any) => {
          const created = item?.CreatedAt ? new Date(item.CreatedAt) : new Date();
          return {
            id: String(item.Id || item.id),
            name: item.RecipientName || 'Unknown',
            country: item.destinationCountry || item.ReceiveCurrency || '',
            date: created.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
            amount: `${item.SendCurrency ?? 'NOK'} ${Number(item.TotalAmount ?? 0).toFixed(2)}`,
            status: item.Status || 'Pending',
            method: item.Service || 'Transfer',
            createdAtMs: created.getTime(),
          };
        });

        mapped.sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0));
        setTransfers(mapped);
      } catch (e) {
        setError('Failed to load transactions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <ScrollScreen contentStyle={styles.content}>
      <View style={styles.header}>
        <FintechScreenHeader
          eyebrow="History"
          title="All transfers"
          subtitle="A compact view of recent remittance activity and statuses."
        />
      </View>

        <View style={styles.listArea}>
          {loading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={fintechColors.primary} />
            </View>
          ) : transfers.length ? (
            transfers.map((item) => (
              <TouchableOpacity key={item.id} style={styles.transferCard} activeOpacity={0.9} onPress={() => router.back()}>
                <View style={styles.transferTop}>
                  <View style={styles.transferCopy}>
                    <Text style={styles.transferName}>{item.name}</Text>
                    <Text style={styles.transferMeta}>{item.date} - {item.method}</Text>
                  </View>
                  <FintechStatusPill label={item.status} tone={getStatusTone(item.status)} />
                </View>
                <View style={styles.transferBottom}>
                  <Text style={styles.transferCountry}>{item.country || 'Destination not set'}</Text>
                  <Text style={styles.transferAmount}>{item.amount}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <FintechSectionCard>
              <FintechEmptyState
                icon={error ? 'alert-circle-outline' : 'swap-horizontal-outline'}
                title={error ? 'Could not load transfers' : 'No transfers yet'}
                text={error || 'Transfers will appear here once you send money.'}
              />
            </FintechSectionCard>
          )}
      </View>
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: fintechSpacing.sm,
    gap: fintechSpacing.md,
  },
  header: {
    marginBottom: fintechSpacing.xs,
  },
  listArea: {
    gap: fintechSpacing.md,
    flex: 1,
  },
  transferCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: fintechColors.border,
    backgroundColor: fintechColors.surface,
    padding: fintechSpacing.md,
    gap: fintechSpacing.md,
  },
  transferTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: fintechSpacing.md,
  },
  transferCopy: {
    flex: 1,
    gap: fintechSpacing.xs,
  },
  transferName: {
    fontSize: 15,
    fontWeight: '700',
    color: fintechColors.text,
  },
  transferMeta: {
    fontSize: 13,
    color: fintechColors.textMuted,
  },
  transferBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: fintechSpacing.md,
  },
  transferCountry: {
    fontSize: 13,
    color: fintechColors.textMuted,
  },
  transferAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: fintechColors.text,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: fintechSpacing.xl,
  },
});

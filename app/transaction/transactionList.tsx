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
import {
  FintechEmptyState,
  FintechScreenHeader,
  FintechSectionCard,
  FintechStatusPill,
  fintechColors,
} from '../../components/ui/fintech';
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
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
            transfers.slice(0, 4).map((item) => (
              <TouchableOpacity key={item.id} style={styles.transferCard} activeOpacity={0.9} onPress={() => router.back()}>
                <View style={styles.transferTop}>
                  <View style={styles.transferCopy}>
                    <Text style={styles.transferName}>{item.name}</Text>
                    <Text style={styles.transferMeta}>{item.date} · {item.method}</Text>
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: fintechColors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  header: {
    marginBottom: 8,
  },
  listArea: {
    gap: 12,
    flex: 1,
  },
  transferCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: fintechColors.border,
    backgroundColor: fintechColors.surface,
    padding: 16,
    gap: 12,
  },
  transferTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  transferCopy: {
    flex: 1,
    gap: 4,
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
    gap: 12,
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
    paddingVertical: 32,
  },
});

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  FintechEmptyState,
  FintechScreenHeader,
  FintechStatusPill,
  fintechColors,
  fintechSpacing,
} from '../../components/ui/fintech';
import { ScrollScreen } from '../../components/ui/layout';
import flagMap from '../flagMap';
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
  const s = status?.toLowerCase();
  if (s.includes('paid') || s.includes('complete')) return 'success';
  if (s.includes('fail') || s.includes('cancel')) return 'danger';
  return 'warning';
};

const countryCodeLookup: Record<string, string> = {
  norway: 'no', no: 'no', nok: 'no',
  somalia: 'so', so: 'so', sos: 'so',
  kenya: 'ke', ke: 'ke', kes: 'ke',
  uganda: 'ug', ug: 'ug', ugx: 'ug',
  tanzania: 'tz', tz: 'tz', tzs: 'tz',
  ethiopia: 'et', et: 'et', etb: 'et',
  djibouti: 'dj', dj: 'dj',
  usd: 'us', us: 'us',
};

const getFlagAsset = (country: string) => {
  const key = (country?.trim().toLowerCase() ?? '');
  const code = countryCodeLookup[key] || key.slice(0, 2);
  return flagMap[code] || flagMap.xx || flagMap.us;
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
      } catch {
        setError('Failed to load transactions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <ScrollScreen contentStyle={styles.content}>
      <FintechScreenHeader
        eyebrow="History"
        title="All transfers"
        subtitle="Your recent remittance activity."
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={fintechColors.primary} />
        </View>
      ) : transfers.length ? (
        <View>
          {transfers.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.row, index > 0 && styles.rowDivider]}
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname: '/transaction/TransactionDetailScreen',
                  params: {
                    transactionId: item.id,
                    recipient: item.name,
                    country: item.country || 'Destination not set',
                    date: item.date,
                    amount: item.amount,
                    status: item.status,
                    method: item.method,
                  },
                })
              }
            >
              <View style={styles.flagWrap}>
                <Image source={getFlagAsset(item.country)} style={styles.flag} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowName}>{item.name}</Text>
                <Text style={styles.rowMeta}>{item.date} · {item.method}</Text>
              </View>
              <View style={styles.rowRight}>
                <Text style={styles.rowAmount}>{item.amount}</Text>
                <FintechStatusPill label={item.status} tone={getStatusTone(item.status)} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <FintechEmptyState
          icon={error ? 'alert-circle-outline' : 'swap-horizontal-outline'}
          title={error ? 'Could not load transfers' : 'No transfers yet'}
          text={error || 'Transfers will appear here once you send money.'}
        />
      )}
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: fintechSpacing.sm,
    gap: fintechSpacing.lg,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: fintechSpacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.md,
    paddingVertical: fintechSpacing.md,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: fintechColors.border,
  },
  flagWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: fintechColors.surfaceStrong,
  },
  flag: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  rowBody: {
    flex: 1,
    gap: 3,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '700',
    color: fintechColors.text,
  },
  rowMeta: {
    fontSize: 12,
    color: fintechColors.textMuted,
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  rowAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: fintechColors.text,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SkeletonDashboard } from '../../components/ui/states';
import {
  FintechTransferRow,
  formatMoney,
  FintechPrimaryButton,
  fintechColors,
  fintechRadius,
  fintechSpacing,
} from '../../components/ui/fintech';
import flagMap from '../flagMap';
import { Screen, useScreenInsets } from '../../components/ui/layout';
import { useUser } from '../../context/UserContext';
import { RecipientService, TransactionService } from '../../services/apiClient';
import {
  createRecipientProfile,
  getCountryNameFromCode,
  getCurrencyForCountry,
  normalizeCountryCode,
  RecipientProfile,
  TransferService,
} from '../../services/remittance';
import { defaultTransferDraft, mergeTransferDraft } from '../../services/transferDraft';


type RecentTransfer = {
  id: string;
  name: string;
  meta: string;
  amount: string;
  corridorCountry: string;
  sendCurrency: string;
  receiveCurrency: string;
  sendAmount: number;
  service: TransferService;
  provider: string;
  recipient: RecipientProfile | null;
  createdAtMs: number;
};

const countryCurrencyMap: Record<string, string> = {
  Norway: 'NOK',
  Somalia: 'USD',
  Kenya: 'KES',
  Ethiopia: 'ETB',
  Uganda: 'UGX',
  Tanzania: 'TZS',
};

const COUNTRY_FLAG_CODE: Record<string, string> = {
  Norway: 'no', Somalia: 'so', Kenya: 'ke',
  Ethiopia: 'et', Uganda: 'ug', Tanzania: 'tz', Djibouti: 'dj',
};

const SERVICE_LABEL: Record<string, string> = {
  MobileMoney: 'Mobile Money',
  BankTransfer: 'Bank Transfer',
  CashCollection: 'Cash Pickup',
};

const AVATAR_PALETTE = [
  '#0A7A56', '#1555C0', '#7B2D8B', '#B5451B',
  '#1A7A6E', '#5C6D20', '#854D0E', '#3730A3',
];
const getAvatarColor = (name: string) =>
  AVATAR_PALETTE[(name.charCodeAt(0) || 65) % AVATAR_PALETTE.length];

const getInitials = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('');


const formatSignedAmount = (amount: number, currency: string) =>
  `- ${formatMoney(amount, currency)}`;

const mapService = (value?: string): TransferService => {
  if (value === 'BankTransfer' || value === 'BankDeposit') return 'BankTransfer';
  if (value === 'CashCollection' || value === 'CashPickup') return 'CashCollection';
  return 'MobileMoney';
};

const normalizeResponseRows = (response: any) =>
  Array.isArray(response)
    ? response
    : Array.isArray(response?.Data)
      ? response.Data
      : Array.isArray(response?.data)
        ? response.data
        : [];

const normalizeLookupValue = (value: string) =>
  value.trim().replace(/\s+/g, ' ').toLowerCase();

const mergeRecipientProfiles = (
  primary: RecipientProfile,
  fallback: RecipientProfile,
): RecipientProfile => ({
  ...fallback,
  ...primary,
  id: primary.id || fallback.id,
  firstName: primary.firstName || fallback.firstName,
  lastName: primary.lastName || fallback.lastName,
  phoneNumber: primary.phoneNumber || fallback.phoneNumber,
  relationshipToSender: primary.relationshipToSender || fallback.relationshipToSender,
  receivingCountry: primary.receivingCountry || fallback.receivingCountry,
  countryOfCitizenship: primary.countryOfCitizenship || fallback.countryOfCitizenship,
  address: primary.address || fallback.address,
  city: primary.city || fallback.city,
  provider: primary.provider || fallback.provider,
  service: primary.service || fallback.service,
});

export default function RecentTransactions() {
  const router = useRouter();
  const { user } = useUser();
  const { bottom } = useScreenInsets();
  const [recentTransfers, setRecentTransfers] = useState<RecentTransfer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const warmDashboard = async () => {
      try {
        const [recipientsResponse, recentResponse] = await Promise.all([
          RecipientService.getAllRecipients(),
          TransactionService.getRecentTransaction(''),
        ]);

        const recipientRows = normalizeResponseRows(recipientsResponse);
        const savedRecipientLookup = new Map<string, RecipientProfile>();

        recipientRows.forEach((item: any) => {
          const firstName = String(item?.FirstName || item?.firstName || '').trim();
          const lastName = String(item?.LastName || item?.lastName || '').trim();
          const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
          const country = String(
            item?.ReceivingCountry ||
              item?.receivingCountry ||
              item?.CountryOfCitizenship ||
              item?.countryOfCitizenship ||
              'SO',
          );
          const provider = String(item?.Provider || item?.provider || '').trim();
          const service = mapService(String(item?.Service || item?.service || 'MobileMoney'));
          const recipientProfile = createRecipientProfile({
            id: String(item?.Id || item?.id || ''),
            firstName,
            lastName,
            phoneNumber: String(item?.PhoneNumber || item?.phoneNumber || ''),
            receivingCountry: normalizeCountryCode(country),
            countryOfCitizenship: normalizeCountryCode(
              item?.CountryOfCitizenship || item?.countryOfCitizenship || country,
            ),
            address: String(item?.Address || item?.address || ''),
            city: String(item?.City || item?.city || ''),
            provider,
            service,
            relationshipToSender: String(
              item?.RelationshipToSender || item?.relationshipToSender || '',
            ),
          });

          const lookupKey = [
            normalizeLookupValue(fullName),
            getCountryNameFromCode(country),
            normalizeLookupValue(provider),
            service,
          ].join('|');

          if (fullName) {
            savedRecipientLookup.set(lookupKey, recipientProfile);
          }
        });

        const recentRows = normalizeResponseRows(recentResponse);
        const mappedTransfers = recentRows
          .map((item: any) => {
            const createdAt = item?.CreatedAt || item?.createdAt;
            const created = createdAt ? new Date(createdAt) : null;
            const createdAtMs = created && !Number.isNaN(created.getTime()) ? created.getTime() : 0;
            const corridorCountryRaw =
              String(
                item?.destinationCountry ||
                  item?.DestinationCountry ||
                  item?.ReceivingCountry ||
                  item?.receivingCountry ||
                  item?.Country ||
                  'SO',
              );
            const corridorCountry = getCountryNameFromCode(corridorCountryRaw);
            const recipientName = String(
              item?.RecipientName || item?.recipientName || item?.BeneficiaryName || 'Recipient',
            ).trim();
            const sendCurrency = String(item?.SendCurrency || item?.sendCurrency || 'NOK');
            const receiveCurrency = String(
              item?.ReceiveCurrency ||
                item?.receiveCurrency ||
                countryCurrencyMap[corridorCountry] ||
                'USD',
            );
            const sendAmount = Number(item?.TotalAmount ?? item?.totalAmount ?? item?.SendAmount ?? 0);
            const service = mapService(String(item?.Service || item?.service || 'MobileMoney'));
            const provider = String(item?.Provider || item?.provider || item?.ProviderName || '');
            const firstName = String(item?.FirstName || item?.firstName || '').trim();
            const lastName = String(item?.LastName || item?.lastName || '').trim();
            const [fallbackFirstName, ...fallbackLastName] = recipientName
              .split(/\s+/)
              .filter(Boolean);
            const inlineRecipient = createRecipientProfile({
              id: String(item?.RecipientId || item?.recipientId || item?.Id || item?.id || ''),
              firstName: firstName || fallbackFirstName || '',
              lastName: lastName || fallbackLastName.join(' '),
              phoneNumber: String(item?.PhoneNumber || item?.phoneNumber || item?.RecipientPhoneNumber || ''),
              receivingCountry: normalizeCountryCode(corridorCountryRaw),
              countryOfCitizenship: normalizeCountryCode(
                item?.CountryOfCitizenship ||
                  item?.countryOfCitizenship ||
                  corridorCountryRaw,
              ),
              address: String(item?.Address || item?.address || ''),
              city: String(item?.City || item?.city || ''),
              provider,
              service,
              relationshipToSender: String(
                item?.RelationshipToSender || item?.relationshipToSender || '',
              ),
            });
            const matchedRecipient = savedRecipientLookup.get(
              [
                normalizeLookupValue(recipientName),
                corridorCountry,
                normalizeLookupValue(provider),
                service,
              ].join('|'),
            );
            const resolvedRecipient = matchedRecipient
              ? mergeRecipientProfiles(matchedRecipient, inlineRecipient)
              : inlineRecipient;
            const dateLabel =
              createdAtMs > 0
                ? new Date(createdAtMs).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                  })
                : 'Recent';
            const timeLabel =
              createdAtMs > 0
                ? new Date(createdAtMs).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '';

            return {
              id: String(item?.Id || item?.id || `${recipientName}-${createdAtMs}`),
              name: recipientName,
              meta: `${corridorCountry} - ${dateLabel}${timeLabel ? ` ${timeLabel}` : ''}`,
              amount: formatSignedAmount(sendAmount, sendCurrency),
              corridorCountry,
              sendCurrency,
              receiveCurrency,
              sendAmount,
              service,
              provider,
              recipient:
                resolvedRecipient.firstName ||
                resolvedRecipient.lastName ||
                resolvedRecipient.phoneNumber
                  ? resolvedRecipient
                  : inlineRecipient.firstName || inlineRecipient.lastName || inlineRecipient.phoneNumber
                    ? inlineRecipient
                    : null,
              createdAtMs,
            } satisfies RecentTransfer;
          })
          .sort((a: RecentTransfer, b: RecentTransfer) => b.createdAtMs - a.createdAtMs);

        setRecentTransfers(mappedTransfers.slice(0, 3));
      } catch {
        setRecentTransfers([]);
      } finally {
        setIsLoading(false);
      }
    };

    void warmDashboard();
  }, []);

  const userName =
    user?.firstName ||
    user?.FirstName ||
    (user?.email ? String(user.email).split('@')[0] : '') ||
    'Account';

  const visibleRecentTransfers = useMemo(
    () => recentTransfers.slice(0, 5),
    [recentTransfers],
  );
  const handleStartSend = () => {
    mergeTransferDraft({
      ...defaultTransferDraft,
      entryPoint: 'direct_send',
      sendCountry: 'Norway',
      sendCurrency: getCurrencyForCountry('NO'),
    });
    router.push('/remittance/RemittanceTypeScreen');
  };

  const startRepeatTransfer = ({
    recipient,
    sendAmount,
    sendCurrency,
    receiveCurrency,
    corridorCountry,
    provider,
    service,
  }: {
    recipient: RecipientProfile;
    sendAmount?: number;
    sendCurrency?: string;
    receiveCurrency?: string;
    corridorCountry: string;
    provider?: string;
    service?: TransferService;
  }) => {
    mergeTransferDraft({
      entryPoint: 'repeat_send',
      quoteId: '',
      fees: 0,
      totalAmount: 0,
      receiveAmount: 0,
      exchangeRate: 0,
      sendAmount: Number(sendAmount || 0),
      sendCountry: 'Norway',
      sendCurrency: sendCurrency || 'NOK',
      receivingCountry: corridorCountry,
      receiveCurrency: receiveCurrency || countryCurrencyMap[corridorCountry] || 'USD',
      provider: provider || recipient.provider || '',
      providerName: provider || recipient.provider || '',
      service: service || recipient.service,
      recipient: {
        ...recipient,
        provider: provider || recipient.provider || '',
        avatarColor: fintechColors.primaryStrong,
      },
    });

    router.push('/transaction/SendMoneyScreen');
  };

  const handleRecentTransferPress = (item: RecentTransfer) => {
    if (item.recipient) {
      startRepeatTransfer({
        recipient: item.recipient,
        sendAmount: item.sendAmount,
        sendCurrency: item.sendCurrency,
        receiveCurrency: item.receiveCurrency,
        corridorCountry: item.corridorCountry,
        provider: item.provider,
        service: item.service,
      });
      return;
    }

    mergeTransferDraft({
      entryPoint: 'repeat_send',
      quoteId: '',
      fees: 0,
      totalAmount: 0,
      receiveAmount: 0,
      exchangeRate: 0,
      sendAmount: item.sendAmount,
      sendCountry: 'Norway',
      sendCurrency: item.sendCurrency,
      receivingCountry: item.corridorCountry,
      receiveCurrency: item.receiveCurrency,
      provider: item.provider,
      providerName: item.provider,
      service: item.service,
    });

    router.push('/recipient/RecipientListScreen');
  };

    return (
    <Screen contentStyle={styles.root}>
      <View style={[styles.scroll, styles.scrollContent]}>
        {isLoading ? (
          <SkeletonDashboard />
        ) : (
          <>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => router.push('/profile/ProfileScreen')}
                activeOpacity={0.88}
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarLetter}>
                    {String(userName).slice(0, 1).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.greeting}>Good to see you</Text>
                  <Text style={styles.userName} numberOfLines={1}>{userName}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.settingsBtn}
                onPress={() => router.push('/support/settings')}
                activeOpacity={0.88}
              >
                <Ionicons name="settings-outline" size={22} color={fintechColors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Hero card */}
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                <View style={styles.heroIconWrap}>
                  <Ionicons name="paper-plane" size={22} color={fintechColors.primary} />
                </View>
                <View style={styles.heroCopy}>
                  <Text style={styles.heroTitle}>Send money abroad</Text>
                  <Text style={styles.heroSubtitle}>
                    Competitive rate · Transparent fees · Fast delivery
                  </Text>
                </View>
              </View>
              <FintechPrimaryButton label="Send money" onPress={handleStartSend} />
            </View>

            {/* Recent transfers */}
            <View style={styles.recentCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent transfers</Text>
                <TouchableOpacity
                  onPress={() => router.push('/transaction/transactionList')}
                  activeOpacity={0.8}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.sectionLink}>View all</Text>
                </TouchableOpacity>
              </View>

              {visibleRecentTransfers.length ? (
                visibleRecentTransfers.map((item, index) => {
                  const flagCode = COUNTRY_FLAG_CODE[item.corridorCountry];
                  const flagSource = flagCode ? flagMap[flagCode] : undefined;
                  const dateLabel =
                    item.createdAtMs > 0
                      ? new Date(item.createdAtMs).toLocaleDateString('en-US', {
                          day: '2-digit',
                          month: 'short',
                        })
                      : 'Recent';
                  return (
                    <FintechTransferRow
                      key={item.id}
                      name={item.name}
                      meta={`${item.corridorCountry} · ${dateLabel}`}
                      service={SERVICE_LABEL[item.service] ?? item.service}
                      amount={item.amount}
                      initials={getInitials(item.name) || '??'}
                      accentColor={getAvatarColor(item.name)}
                      flagSource={flagSource}
                      divider={index > 0}
                      onPress={() => handleRecentTransferPress(item)}
                      onRepeat={() => handleRecentTransferPress(item)}
                    />
                  );
                })
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconWrap}>
                    <Ionicons name="paper-plane-outline" size={28} color={fintechColors.primary} />
                  </View>
                  <Text style={styles.emptyTitle}>No transfers yet</Text>
                  <Text style={styles.emptyText}>
                    Your completed transfers will appear here.
                  </Text>
                  <TouchableOpacity
                    style={styles.emptyAction}
                    onPress={handleStartSend}
                    activeOpacity={0.88}
                  >
                    <Text style={styles.emptyActionText}>Send your first transfer</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}
      </View>

      {/* ── Bottom tab bar ── */}
      <View style={[styles.tabBar, { paddingBottom: Math.max(bottom - fintechSpacing.sm, fintechSpacing.sm) }]}>
        <TouchableOpacity style={styles.tabItem} activeOpacity={0.88}>
          <Ionicons name="home" size={22} color={fintechColors.primary} />
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabCenter} onPress={handleStartSend} activeOpacity={0.9}>
          <View style={styles.tabCenterIcon}>
            <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.tabCenterLabel}>Send</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/transaction/transactionList')}
          activeOpacity={0.88}
        >
          <Ionicons name="receipt-outline" size={22} color={fintechColors.textMuted} />
          <Text style={styles.tabLabel}>History</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // ── Shell ──────────────────────────────────────────────────────────────────
  root: {
    flex: 1,
    paddingBottom: 0,
    paddingHorizontal: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: fintechSpacing.lg,
    paddingTop: fintechSpacing.md,
    paddingBottom: fintechSpacing.xl,
    gap: fintechSpacing.md,
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: fintechSpacing.xs,
  },
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.sm,
    flex: 1,
    minWidth: 0,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: fintechColors.primaryStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  greeting: {
    fontSize: 12,
    color: fintechColors.textSubtle,
    lineHeight: 16,
  },
  userName: {
    fontSize: 12,
    fontWeight: '500',
    color: fintechColors.text,
    lineHeight: 16,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Hero card ──────────────────────────────────────────────────────────────
  heroCard: {
    gap: fintechSpacing.md,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.md,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: fintechColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: 3,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: fintechColors.text,
    lineHeight: 22,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: fintechColors.textMuted,
  },

  // ── Quick actions ──────────────────────────────────────────────────────────
  quickRow: {
    flexDirection: 'row',
    gap: fintechSpacing.sm,
  },
  quickTile: {
    flex: 1,
    alignItems: 'center',
    gap: fintechSpacing.xs,
    paddingVertical: fintechSpacing.sm,
  },
  quickTileIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: fintechColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTileLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: fintechColors.textMuted,
  },

  // ── Monthly limit ──────────────────────────────────────────────────────────
  limitCard: {
    gap: fintechSpacing.sm,
  },
  limitCardWarning: {},
  limitCardDanger:  {},
  limitHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  limitLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: fintechColors.textMuted,
  },
  limitLabelWarning: { color: fintechColors.warning },
  limitLabelDanger:  { color: fintechColors.danger },
  limitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: fintechRadius.pill,
    backgroundColor: fintechColors.neutralSurface,
  },
  limitBadgeWarning: { backgroundColor: '#FFF4D9' },
  limitBadgeDanger:  { backgroundColor: fintechColors.dangerSoft },
  limitBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: fintechColors.textMuted,
  },
  limitBadgeTextWarning: { color: fintechColors.warning },
  limitBadgeTextDanger:  { color: fintechColors.danger },
  limitAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: fintechSpacing.xs,
  },
  limitUsed: {
    fontSize: 20,
    fontWeight: '800',
    color: fintechColors.text,
  },
  limitSep: {
    fontSize: 14,
    color: fintechColors.textSubtle,
  },
  limitTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: fintechColors.textSubtle,
  },
  limitTrack: {
    height: 6,
    borderRadius: fintechRadius.pill,
    backgroundColor: fintechColors.surfaceStrong,
    overflow: 'hidden',
  },
  limitTrackWarning: { backgroundColor: 'rgba(251,191,36,0.2)' },
  limitTrackDanger:  { backgroundColor: 'rgba(254,202,202,0.3)' },
  limitFill: {
    height: '100%',
    borderRadius: fintechRadius.pill,
    backgroundColor: fintechColors.primary,
  },
  limitFillWarning: { backgroundColor: '#F59E0B' },
  limitFillDanger:  { backgroundColor: '#EF4444' },
  limitExceededRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.xs,
  },
  limitExceededText: {
    flex: 1,
    fontSize: 13,
    color: fintechColors.danger,
    fontWeight: '600',
  },
  limitFooter: {
    fontSize: 12,
    lineHeight: 17,
    color: fintechColors.textSubtle,
  },
  limitFooterWarning: { color: fintechColors.warning },
  limitFooterDanger:  { color: fintechColors.danger },

  // ── Repeat card ────────────────────────────────────────────────────────────
  repeatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.md,
  },
  repeatIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: fintechColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repeatBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  repeatEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: fintechColors.primaryStrong,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  repeatName: {
    fontSize: 14,
    fontWeight: '800',
    color: fintechColors.text,
    lineHeight: 18,
  },
  repeatRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  repeatAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: fintechColors.text,
  },

  // ── Recent transfers card ──────────────────────────────────────────────────
  recentCard: {
    gap: fintechSpacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: fintechColors.text,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '700',
    color: fintechColors.primaryStrong,
  },

  // ── Empty state ────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    gap: fintechSpacing.sm,
    paddingVertical: fintechSpacing.xl,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: fintechColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: fintechColors.text,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 19,
    color: fintechColors.textMuted,
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: fintechSpacing.xs,
    paddingHorizontal: fintechSpacing.lg,
    paddingVertical: fintechSpacing.sm + 2,
    borderRadius: fintechRadius.pill,
    borderWidth: 1.5,
    borderColor: fintechColors.primary,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '700',
    color: fintechColors.primary,
  },

  // ── Bottom tab bar ─────────────────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: fintechColors.surface,
    borderTopWidth: 1,
    borderTopColor: fintechColors.border,
    paddingTop: fintechSpacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: fintechSpacing.xs,
    minHeight: 44,
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: fintechColors.textMuted,
  },
  tabLabelActive: {
    color: fintechColors.primary,
    fontWeight: '800',
  },
  tabCenter: {
    alignItems: 'center',
    gap: 3,
    paddingVertical: fintechSpacing.xs,
    minWidth: 80,
    justifyContent: 'center',
  },
  tabCenterIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: fintechColors.primaryStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    shadowColor: fintechColors.primaryStrong,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  tabCenterLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: fintechColors.primaryStrong,
  },
});

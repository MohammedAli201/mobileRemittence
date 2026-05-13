import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  fintechColors,
  FintechEmptyState,
  FintechPrimaryButton,
  fintechRadius,
  fintechSpacing,
} from "../../components/ui/fintech";
import { Screen } from "../../components/ui/layout";
import { RecipientService } from "../../services/apiClient";
import {
  createRecipientProfile,
  normalizeCountryCode,
  RecipientProfile,
} from "../../services/remittance";
import {
  getTransferDraft,
  mergeTransferDraft,
} from "../../services/transferDraft";

type RecipientResponse = {
  Id: string;
  PhoneNumber: string;
  FirstName: string;
  LastName: string;
  Service: string;
  Provider?: string;
  RelationshipToSender?: string;
  ReceivingCountry?: string;
  CountryOfCitizenship?: string;
  Address?: string;
  City?: string;
};

type RecipientListResponse = {
  Success?: boolean;
  Data?: RecipientResponse[];
  Error?: string | null;
};

const AVATAR_PALETTE = [
  "#0F766E", "#1D4ED8", "#B45309", "#7C3AED", "#BE185D",
];

const getAvatarColor = (id: string) => {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
};

const getInitials = (first: string, last: string) =>
  `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();

const mapApiRecipientToProfile = (item: RecipientResponse): RecipientProfile =>
  createRecipientProfile({
    id: item.Id,
    firstName: item.FirstName,
    lastName: item.LastName,
    phoneNumber: item.PhoneNumber,
    receivingCountry: item.ReceivingCountry || "SO",
    countryOfCitizenship:
      item.CountryOfCitizenship || item.ReceivingCountry || "SO",
    address: item.Address || "",
    city: item.City || "",
    provider: item.Provider || "",
    service:
      item.Service === "MobileWallet"
        ? "MobileMoney"
        : (item.Service as RecipientProfile["service"]),
    relationshipToSender: item.RelationshipToSender || "",
  });

export default function RecipientListScreen() {
  const router = useRouter();
  const transactionData = getTransferDraft();
  const [recipients, setRecipients] = useState<RecipientProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedCountry = normalizeCountryCode(
    transactionData.receivingCountry || "SO",
  );

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        setLoading(true);
        setError("");
        const response = (await RecipientService.getAllRecipients()) as
          | RecipientListResponse
          | RecipientResponse[];
        const rows = Array.isArray(response)
          ? response
          : Array.isArray(response?.Data)
            ? response.Data
            : Array.isArray((response as any)?.data)
              ? (response as any).data
              : null;

        if (!rows) {
          throw new Error(
            (!Array.isArray(response) &&
              (response?.Error || "Could not load recipients.")) ||
              "Could not load recipients.",
          );
        }

        const nextRecipients = rows
          .map(mapApiRecipientToProfile)
          .filter((r: RecipientProfile) => r.receivingCountry === selectedCountry)
          .sort((a: RecipientProfile, b: RecipientProfile) =>
            `${a.firstName} ${a.lastName}`.localeCompare(
              `${b.firstName} ${b.lastName}`,
            ),
          );

        setRecipients(nextRecipients);
      } catch (err: any) {
        setRecipients([]);
        setError(err?.message || "Could not load recipient list.");
      } finally {
        setLoading(false);
      }
    };

    void fetchRecipients();
  }, [selectedCountry]);

  const filteredRecipients = useMemo(
    () =>
      recipients.filter((r) => {
        const name = `${r.firstName} ${r.lastName}`.toLowerCase();
        return (
          name.includes(searchQuery.toLowerCase()) ||
          r.phoneNumber.includes(searchQuery)
        );
      }),
    [recipients, searchQuery],
  );

  const emptyState = searchQuery.trim().length
    ? { title: "No matches", text: "Try a different name or phone number." }
    : { title: "No recipients yet", text: "Add someone to get started." };

  const handleSelectRecipient = (recipient: RecipientProfile) => {
    mergeTransferDraft({
      receivingCountry: recipient.receivingCountry,
      provider: recipient.provider || transactionData.provider || "",
      service: recipient.service,
      recipient: {
        ...recipient,
        provider: recipient.provider || transactionData.provider || "",
        avatarColor: getAvatarColor(recipient.id || recipient.phoneNumber),
      },
    });

    router.push({
      pathname: "/transaction/PaymentMethodScreen",
      params: {
        recipient: JSON.stringify({
          id: recipient.id,
          name: `${recipient.firstName} ${recipient.lastName}`,
          phone: recipient.phoneNumber,
          relationship: recipient.relationshipToSender,
          provider: recipient.provider,
          service: recipient.service,
          countryOfCitizenship: recipient.countryOfCitizenship,
          address: recipient.address,
          city: recipient.city,
        }),
      },
    });
  };

  if (loading) {
    return (
      <Screen contentStyle={styles.centered}>
        <ActivityIndicator size="large" color={fintechColors.primary} />
      </Screen>
    );
  }

  if (error) {
    return (
      <Screen contentStyle={styles.centered}>
        <FintechEmptyState
          icon="alert-circle-outline"
          title="Recipients unavailable"
          text={error}
          action={
            <FintechPrimaryButton
              label="Back to amount"
              onPress={() => router.replace("/transaction/SendMoneyScreen")}
            />
          }
        />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.content}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color={fintechColors.text} />
        </TouchableOpacity>

        <View style={styles.titleBlock}>
          <Text style={styles.screenTitle}>Choose recipient</Text>
          <Text style={styles.screenSub}>Sending to {selectedCountry}</Text>
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/recipient/AddRecipientScreen")}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={18} color={fintechColors.textMuted} />
        <TextInput
          placeholder="Search by name or phone"
          placeholderTextColor={fintechColors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={fintechColors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        data={filteredRecipients}
        keyExtractor={(r) => r.id || r.phoneNumber}
        renderItem={({ item: r, index }) => (
          <TouchableOpacity
            style={[styles.row, index > 0 && styles.rowDivider]}
            onPress={() => handleSelectRecipient(r)}
            activeOpacity={0.7}
          >
            <View style={[styles.avatar, { backgroundColor: getAvatarColor(r.id || r.phoneNumber) }]}>
              <Text style={styles.avatarText}>{getInitials(r.firstName, r.lastName)}</Text>
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowName} numberOfLines={1}>
                {r.firstName} {r.lastName}
              </Text>
              <Text style={styles.rowMeta}>{r.phoneNumber}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={fintechColors.textSubtle} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <FintechEmptyState
            icon="people-outline"
            title={emptyState.title}
            text={emptyState.text}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingTop: fintechSpacing.sm,
    gap: fintechSpacing.md,
    paddingHorizontal: 0,
  },

  // ── Top bar ───────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: fintechSpacing.sm,
    paddingHorizontal: fintechSpacing.lg,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: {
    flex: 1,
    gap: 1,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: fintechColors.text,
    lineHeight: 22,
  },
  screenSub: {
    fontSize: 12,
    color: fintechColors.textMuted,
    fontWeight: "500",
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: fintechColors.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Search ────────────────────────────────────────────────────────────────
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: fintechSpacing.xs,
    backgroundColor: fintechColors.surfaceStrong,
    borderRadius: fintechRadius.pill,
    paddingHorizontal: fintechSpacing.md,
    minHeight: 46,
    marginHorizontal: fintechSpacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: fintechColors.text,
    paddingVertical: 0,
  },

  // ── List ──────────────────────────────────────────────────────────────────
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: fintechSpacing.xl,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: fintechSpacing.md,
    paddingVertical: fintechSpacing.md,
    paddingHorizontal: fintechSpacing.lg,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: fintechColors.border,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 15,
    fontWeight: "700",
    color: fintechColors.text,
  },
  rowMeta: {
    fontSize: 13,
    color: fintechColors.textMuted,
  },
});

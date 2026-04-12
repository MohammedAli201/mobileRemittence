import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  FintechEmptyState,
  FintechPrimaryButton,
  FintechProgress,
  FintechSecondaryButton,
  FintechStatusPill,
  FintechTextField,
  fintechColors,
} from "../../components/ui/fintech";
import { RecipientService } from "../../services/apiClient";
import {
  createRecipientProfile,
  getCountryNameFromCode,
  normalizeCountryCode,
  RecipientProfile,
} from "../../services/remittance";
import { getTransferDraft, mergeTransferDraft } from "../../services/transferDraft";

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

const getAvatarColor = (id: string) => {
  const colors = ["#0F766E", "#1D4ED8", "#B45309", "#7C3AED", "#BE185D"];
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const mapApiRecipientToProfile = (item: RecipientResponse): RecipientProfile =>
  createRecipientProfile({
    id: item.Id,
    firstName: item.FirstName,
    lastName: item.LastName,
    phoneNumber: item.PhoneNumber,
    receivingCountry: item.ReceivingCountry || "SO",
    countryOfCitizenship: item.CountryOfCitizenship || item.ReceivingCountry || "SO",
    address: item.Address || "",
    city: item.City || "",
    provider: item.Provider || "",
    service: item.Service === "MobileWallet" ? "MobileMoney" : (item.Service as RecipientProfile["service"]),
    relationshipToSender: item.RelationshipToSender || "",
  });

export default function RecipientListScreen() {
  const router = useRouter();
  const transactionData = getTransferDraft();
  const [recipients, setRecipients] = useState<RecipientProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const selectedCountry = normalizeCountryCode(transactionData.receivingCountry || "SO");

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        setLoading(true);
        setError("");
        const response = (await RecipientService.getAllRecipients()) as RecipientListResponse | RecipientResponse[];
        const rows = Array.isArray(response)
          ? response
          : Array.isArray(response?.Data)
            ? response.Data
            : Array.isArray(response?.data)
              ? response.data
              : null;

        if (!rows) {
          throw new Error(
            (!Array.isArray(response) && (response?.Error || "Could not load recipients.")) ||
              "Could not load recipients.",
          );
        }

        const nextRecipients = rows
          .map(mapApiRecipientToProfile)
          .filter((recipient: RecipientProfile) => recipient.receivingCountry === selectedCountry)
          .sort((a: RecipientProfile, b: RecipientProfile) =>
            `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
          );

        setRecipients(nextRecipients);
      } catch (fetchError: any) {
        setRecipients([]);
        setError(fetchError?.message || "Could not load recipient list.");
      } finally {
        setLoading(false);
      }
    };

    void fetchRecipients();
  }, [selectedCountry]);

  const filteredRecipients = useMemo(
    () =>
      recipients.filter((recipient) => {
        const fullName = `${recipient.firstName} ${recipient.lastName}`.toLowerCase();
        return (
          fullName.includes(searchQuery.toLowerCase()) ||
          recipient.phoneNumber.includes(searchQuery)
        );
      }),
    [recipients, searchQuery],
  );

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
      pathname: "/transaction/AgreeAndPayScreen",
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
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={fintechColors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorWrap}>
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
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.header}>
          <FintechProgress step={3} total={5} label="Step 3: Recipient" />
          <Text style={styles.screenLabel}>Recipients</Text>
          <View style={styles.headerRow}>
            <Text style={styles.screenTitle}>Choose recipient</Text>
            <FintechStatusPill label={`${filteredRecipients.length} saved`} tone="info" />
          </View>
          <Text style={styles.screenSubtitle}>
            Saved recipients for {getCountryNameFromCode(selectedCountry)}.
          </Text>
          <FintechTextField
            icon="search-outline"
            placeholder="Search name or phone"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          style={styles.listArea}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredRecipients.length ? (
            filteredRecipients.map((recipient) => (
              <TouchableOpacity
                key={recipient.id || recipient.phoneNumber}
                style={styles.recipientCard}
                onPress={() => handleSelectRecipient(recipient)}
                activeOpacity={0.92}
              >
                <View
                  style={[
                    styles.avatarCircle,
                    { backgroundColor: getAvatarColor(recipient.id || recipient.phoneNumber) },
                  ]}
                >
                  <Text style={styles.avatarText}>
                    {`${recipient.firstName} ${recipient.lastName}`
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </Text>
                </View>

                <View style={styles.recipientInfo}>
                  <Text style={styles.recipientName} numberOfLines={1}>
                    {recipient.firstName} {recipient.lastName}
                  </Text>
                  <Text style={styles.recipientMeta}>{recipient.phoneNumber}</Text>
                  <Text style={styles.recipientMeta}>{recipient.relationshipToSender}</Text>
                </View>

                <View style={styles.recipientActions}>
                  <FintechStatusPill label={recipient.provider || "Provider"} tone="neutral" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <FintechEmptyState
              icon="people-outline"
              title="No saved recipients"
              text="Add a recipient for this destination to continue."
            />
          )}
        </ScrollView>

        <View style={styles.footer}>
          <FintechPrimaryButton
            label="Add new recipient"
            onPress={() => router.push("/recipient/AddRecipientScreen")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  header: {
    gap: 10,
    marginBottom: 8,
  },
  screenLabel: {
    marginTop: 18,
    fontSize: 15,
    color: '#6B7280',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  screenTitle: {
    flex: 1,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#111827',
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  listArea: {
    flex: 1,
  },
  listContent: {
    gap: 12,
    paddingBottom: 16,
  },
  recipientCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  recipientInfo: {
    flex: 1,
    gap: 2,
  },
  recipientName: {
    fontSize: 15,
    fontWeight: "700",
    color: '#111827',
  },
  recipientMeta: {
    fontSize: 13,
    color: '#6B7280',
  },
  recipientActions: {
    alignItems: "flex-end",
    gap: 10,
  },
  footer: {
    paddingTop: 4,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
  },
  errorWrap: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
});

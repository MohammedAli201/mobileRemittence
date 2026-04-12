import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  FintechEmptyState,
  FintechPrimaryButton,
  fintechColors,
} from "../../components/ui/fintech";
import { RecipientService } from "../../services/apiClient";
import {
  createRecipientProfile,
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
  const insets = useSafeAreaInsets();
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
      <View style={[styles.content, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
        <View style={styles.header}>
          <View style={styles.topBar}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.85}>
              <Ionicons name="chevron-back" size={18} color="#A0A7B4" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Select Recipient</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/recipient/AddRecipientScreen")}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={16} color="#2F2B23" />
            </TouchableOpacity>
          </View>
          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>Sending to</Text>
            <Text style={styles.contextValue}>{selectedCountry}</Text>
          </View>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={18} color="#A0A7B4" />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>
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

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2F2B23',
  },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: '#2F2B23',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 0,
    gap: 8,
    backgroundColor: '#2F2B23',
  },
  header: {
    gap: 10,
    marginBottom: 2,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4B453A',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A362B',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4DF78',
  },
  screenTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: '#F8F6F0',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  contextCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#4B453A',
    backgroundColor: '#3A362B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 2,
  },
  contextLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D8CEB5',
  },
  contextValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  searchWrap: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#4B453A',
    backgroundColor: '#3A362B',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  listArea: {
    flex: 1,
  },
  listContent: {
    gap: 10,
    paddingBottom: 12,
  },
  recipientCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#4B453A',
    backgroundColor: '#3A362B',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  recipientInfo: {
    flex: 1,
    gap: 1,
  },
  recipientName: {
    fontSize: 14,
    fontWeight: "700",
    color: '#FFFFFF',
  },
  recipientMeta: {
    fontSize: 12,
    color: '#D8CEB5',
  },
  errorWrap: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
});

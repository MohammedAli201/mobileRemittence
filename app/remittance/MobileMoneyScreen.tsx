import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  getTransferDraft,
  mergeTransferDraft,
} from "../../services/transferDraft";

type DeliveryProvider = {
  id: string;
  name: string;
  service: "MobileMoney" | "BankTransfer" | "CashCollection";
  description?: string;
  available: boolean;
};

type CountryCatalog = {
  currency: string;
  mobile: DeliveryProvider[];
  bank: DeliveryProvider[];
  cash: DeliveryProvider[];
};

const catalogs: Record<string, CountryCatalog> = {
  Somalia: {
    currency: "USD",
    mobile: [
      {
        id: "premier-wallet",
        name: "Premier Wallet",
        service: "MobileMoney",
        available: true,
      },
      {
        id: "e-dahab",
        name: "e-Dahab",
        service: "MobileMoney",
        available: true,
      },
      {
        id: "hormuud-evc",
        name: "Hormuud EVC Plus",
        service: "MobileMoney",
        available: true,
      },
    ],
    bank: [
      {
        id: "salam-bank",
        name: "Salam Bank",
        service: "BankTransfer",
        available: true,
      },
    ],
    cash: [
      {
        id: "juba-express",
        name: "Juba Express",
        service: "CashCollection",
        description: "Partner agents: Premier Bank",
        available: true,
      },
    ],
  },
  Kenya: {
    currency: "KES",
    mobile: [
      { id: "mpesa", name: "M-PESA", service: "MobileMoney", available: true },
      {
        id: "airtel-kenya",
        name: "Airtel Money",
        service: "MobileMoney",
        available: true,
      },
    ],
    bank: [
      {
        id: "equity-bank",
        name: "Equity Bank",
        service: "BankTransfer",
        available: true,
      },
    ],
    cash: [
      {
        id: "juba-express-kenya",
        name: "Juba Express",
        service: "CashCollection",
        available: true,
      },
    ],
  },
  Ethiopia: {
    currency: "ETB",
    mobile: [
      {
        id: "telebirr",
        name: "telebirr",
        service: "MobileMoney",
        available: true,
      },
    ],
    bank: [
      {
        id: "salam-bank-ethiopia",
        name: "Salam Bank",
        service: "BankTransfer",
        available: true,
      },
    ],
    cash: [
      {
        id: "juba-express-ethiopia",
        name: "Juba Express",
        service: "CashCollection",
        available: true,
      },
    ],
  },
  Uganda: {
    currency: "UGX",
    mobile: [
      {
        id: "airtel-uganda",
        name: "Airtel Money",
        service: "MobileMoney",
        available: true,
      },
      {
        id: "mtn-momo",
        name: "MTN MoMo",
        service: "MobileMoney",
        available: true,
      },
    ],
    bank: [
      {
        id: "salam-bank-uganda",
        name: "Salam Bank",
        service: "BankTransfer",
        available: true,
      },
    ],
    cash: [
      {
        id: "juba-express-uganda",
        name: "Juba Express",
        service: "CashCollection",
        available: true,
      },
    ],
  },
};

export default function MobileMoneyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const transactionData = getTransferDraft();
  const receivingCountry = transactionData.receivingCountry || "Somalia";
  const countryCatalog = catalogs[receivingCountry] || catalogs.Somalia;
  const [selectedProviderId, setSelectedProviderId] = useState(
    transactionData.provider || "",
  );

  const selectedProvider =
    [
      ...countryCatalog.mobile,
      ...countryCatalog.bank,
      ...countryCatalog.cash,
    ].find((item) => item.id === selectedProviderId) || null;

  const handleContinue = () => {
    if (!selectedProvider) return;

    mergeTransferDraft({
      provider: selectedProvider.name,
      providerName: selectedProvider.name,
      receivingCountry,
      receiveCurrency: countryCatalog.currency,
      service: selectedProvider.service,
      sendCountry: transactionData.sendCountry || "Norway",
      sendCurrency: transactionData.sendCurrency || "NOK",
    });

    router.push("/transaction/SendMoneyScreen");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View
        style={[styles.container, { paddingTop: Math.max(insets.top, 12) + 8 }]}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color="#F8F6F0" />
          </TouchableOpacity>
          <Text style={styles.title}>Delivery Methods</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 110 + Math.max(insets.bottom, 8) }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.sectionBlock}>
            {countryCatalog.mobile.map((item) => (
              <ProviderRow
                key={item.id}
                item={item}
                active={selectedProviderId === item.id}
                onPress={() => item.available && setSelectedProviderId(item.id)}
              />
            ))}
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Cash pickup</Text>
            <Text style={styles.sectionSubtitle}>
              Pick up cash at one of the following agents.
            </Text>
            {countryCatalog.cash.map((item) => (
              <ProviderRow
                key={item.id}
                item={item}
                active={selectedProviderId === item.id}
                onPress={() => item.available && setSelectedProviderId(item.id)}
              />
            ))}
          </View>

          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Bank deposit</Text>
            <Text style={styles.sectionSubtitle}>
              Deposit directly to the recipient's bank account.
            </Text>
            {countryCatalog.bank.map((item) => (
              <ProviderRow
                key={item.id}
                item={item}
                active={selectedProviderId === item.id}
                onPress={() => item.available && setSelectedProviderId(item.id)}
              />
            ))}
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 8) + 12 },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.nextButton,
              !selectedProvider && styles.nextButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedProvider}
            activeOpacity={0.9}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function ProviderRow({
  item,
  active,
  onPress,
}: {
  item: DeliveryProvider;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.providerRow,
        active && styles.providerRowActive,
        !item.available && styles.providerRowDisabled,
      ]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.providerCopy}>
        <Text
          style={[styles.providerName, active && styles.providerNameActive]}
        >
          {item.name}
        </Text>
        {item.description ? (
          <Text style={styles.providerDescription}>{item.description}</Text>
        ) : null}
      </View>
      {active ? (
        <Ionicons name="checkmark-circle" size={18} color="#D6A66E" />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#2F2B23",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#2F2B23",
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#3A362B",
    marginTop: 2,
    marginBottom: 0,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
    color: "#F8F6F0",
    textAlign: "center",
    marginBottom: 0,
  },
  topBarSpacer: {
    width: 36,
    height: 36,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#D8CEB5",
    marginBottom: 10,
  },
  providerRow: {
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#4B453A",
    backgroundColor: "#3A362B",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  providerRowActive: {
    borderColor: "#F4DF78",
    backgroundColor: "#4A4436",
  },
  providerRowDisabled: {
    opacity: 0.58,
  },
  providerCopy: {
    flex: 1,
    paddingVertical: 10,
  },
  providerName: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  providerNameActive: {
    color: "#F4DF78",
  },
  providerDescription: {
    fontSize: 13,
    color: "#D8CEB5",
    marginTop: 4,
    lineHeight: 18,
  },
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    paddingTop: 12,
    backgroundColor: "#2F2B23",
  },
  nextButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F4DF78",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F4DF78",
    shadowOpacity: 0.22,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  nextButtonDisabled: {
    backgroundColor: "#8C7A3A",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2F2B23",
  },
});

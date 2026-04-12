import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  FintechPrimaryButton,
  FintechTextField,
  fintechColors,
} from "../../components/ui/fintech";
import { RecipientService } from "../../services/apiClient";
import {
  createRecipientApiPayload,
  createRecipientProfile,
  getCountryNameFromCode,
} from "../../services/remittance";
import { getTransferDraft, mergeTransferDraft } from "../../services/transferDraft";

export default function AddRecipientScreen() {
  const router = useRouter();
  const transactionData = getTransferDraft();
  const initialCountryName = useMemo(
    () => getCountryNameFromCode(transactionData.receivingCountry || "SO").toUpperCase(),
    [transactionData.receivingCountry],
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [receivingCountry, setReceivingCountry] = useState(initialCountryName);
  const [countryOfCitizenship, setCountryOfCitizenship] = useState(initialCountryName);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [relationship, setRelationship] = useState(
    transactionData.recipient.relationshipToSender || "",
  );
  const [loading, setLoading] = useState(false);

  const handleSaveRecipient = async () => {
    if (
      !transactionData.provider ||
      !firstName.trim() ||
      !lastName.trim() ||
      !phoneNumber.trim() ||
      !receivingCountry.trim() ||
      !countryOfCitizenship.trim() ||
      !address.trim() ||
      !city.trim() ||
      !relationship.trim()
    ) {
      Alert.alert("Missing details", "Complete all recipient fields.");
      return;
    }

    const recipientProfile = createRecipientProfile({
      firstName,
      lastName,
      phoneNumber,
      receivingCountry,
      countryOfCitizenship,
      address,
      city,
      relationshipToSender: relationship,
      provider: transactionData.provider,
      service: transactionData.service || "MobileMoney",
    });

    setLoading(true);
    try {
      await RecipientService.addRecipient(createRecipientApiPayload(recipientProfile));

      mergeTransferDraft({
        receivingCountry: recipientProfile.receivingCountry,
        recipient: {
          ...recipientProfile,
          avatarColor: "#2B6CB0",
        },
      });

      router.replace({
        pathname: "/transaction/AgreeAndPayScreen",
        params: {
          recipient: JSON.stringify({
            id: `${Date.now()}`,
            name: `${recipientProfile.firstName} ${recipientProfile.lastName}`,
            phone: recipientProfile.phoneNumber,
            relationship: recipientProfile.relationshipToSender,
            provider: recipientProfile.provider,
            service: recipientProfile.service,
            countryOfCitizenship: recipientProfile.countryOfCitizenship,
            address: recipientProfile.address,
            city: recipientProfile.city,
          }),
        },
      });
    } catch (error: any) {
      Alert.alert(
        "Could not save recipient",
        error?.response?.data?.title ||
          error?.response?.data?.errors?.Provider?.[0] ||
          error?.response?.data?.message ||
          error?.message ||
          "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()} activeOpacity={0.85}>
              <Ionicons name="chevron-back" size={18} color="#A0A7B4" />
            </TouchableOpacity>
            <Text style={styles.screenTitle}>Add Recipient</Text>
            <View style={styles.iconButtonPlaceholder} />
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contextCard}>
              <Text style={styles.contextLabel}>Sending to</Text>
              <Text style={styles.contextValue}>
                {getCountryNameFromCode(transactionData.receivingCountry || "SO")}
              </Text>
              <Text style={styles.contextMeta}>{transactionData.provider || "Provider selected earlier"}</Text>
            </View>

            <View style={styles.formCard}>
              <View style={styles.form}>
                <FintechTextField
                  label="First name"
                  icon="person-outline"
                  placeholder="SHUKRI"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="characters"
                />
                <FintechTextField
                  label="Last name"
                  icon="person-outline"
                  placeholder="AHMED"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="characters"
                />
                <FintechTextField
                  label="Phone number"
                  icon="call-outline"
                  placeholder="+252615738865"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                />
                <FintechTextField
                  label="Receiving country"
                  icon="flag-outline"
                  placeholder="SOMALIA"
                  value={receivingCountry}
                  onChangeText={setReceivingCountry}
                  autoCapitalize="characters"
                />
                <FintechTextField
                  label="Country of citizenship"
                  icon="globe-outline"
                  placeholder="SOMALIA"
                  value={countryOfCitizenship}
                  onChangeText={setCountryOfCitizenship}
                  autoCapitalize="characters"
                />
                <FintechTextField
                  label="Address"
                  icon="home-outline"
                  placeholder="Tonstadgrenda 113A"
                  value={address}
                  onChangeText={setAddress}
                />
                <FintechTextField
                  label="City"
                  icon="business-outline"
                  placeholder="Trondheim"
                  value={city}
                  onChangeText={setCity}
                />
                <FintechTextField
                  label="Relationship"
                  icon="people-outline"
                  placeholder="Spouse"
                  value={relationship}
                  onChangeText={setRelationship}
                />
              </View>
            </View>

            <View style={styles.actions}>
              <FintechPrimaryButton onPress={handleSaveRecipient} loading={loading} disabled={loading}>
                Save and continue
              </FintechPrimaryButton>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#2F2B23',
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    gap: 8,
    backgroundColor: '#2F2B23',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 2,
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
  iconButtonPlaceholder: {
    width: 32,
    height: 32,
  },
  screenTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: '#F8F6F0',
    textAlign: 'center',
  },
  scrollContent: {
    gap: 10,
    paddingBottom: 12,
  },
  contextCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4B453A',
    backgroundColor: '#3A362B',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 3,
  },
  contextLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D8CEB5',
  },
  contextValue: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  contextMeta: {
    fontSize: 13,
    color: '#F1E8CF',
  },
  formCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#4B453A',
    backgroundColor: '#3A362B',
    padding: 12,
  },
  form: {
    gap: 8,
  },
  actions: {
    gap: 8,
  },
});

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
  View,
} from "react-native";
import {
  FintechHeroCard,
  FintechInlineMessage,
  FintechPrimaryButton,
  FintechProgress,
  FintechSecondaryButton,
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
          <FintechProgress step={3} total={5} label="Step 3: Recipient" />
          <View style={styles.header}>
            <Text style={styles.screenLabel}>Recipient</Text>
            <Text style={styles.screenTitle}>Add recipient</Text>
            <Text style={styles.screenSubtitle}>
              Enter the payout profile exactly as it should be saved.
            </Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <FintechHeroCard
              title="Recipient profile"
              subtitle={`${getCountryNameFromCode(transactionData.receivingCountry || "SO")} - ${transactionData.provider || "Provider selected earlier"}`}
            >
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
            </FintechHeroCard>

            <FintechInlineMessage text="This profile is saved once and then reused in the transfer request." />

            <View style={styles.actions}>
              <FintechPrimaryButton onPress={handleSaveRecipient} loading={loading} disabled={loading}>
                Save and continue
              </FintechPrimaryButton>
              <FintechSecondaryButton label="Back" onPress={() => router.back()} />
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
    backgroundColor: fintechColors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
    gap: 14,
  },
  header: {
    gap: 6,
  },
  screenLabel: {
    marginTop: 18,
    fontSize: 15,
    color: '#6B7280',
  },
  screenTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: '#111827',
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 24,
  },
  form: {
    gap: 14,
  },
  actions: {
    gap: 10,
  },
});

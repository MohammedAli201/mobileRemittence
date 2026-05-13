import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  FintechPrimaryButton,
  FintechProgress,
  FintechScreenHeader,
  FintechSectionCard,
  FintechStatusPill,
  FintechStickyActionArea,
  FintechTextField,
  fintechColors,
  fintechSpacing,
} from "../../components/ui/fintech";
import { KeyboardScrollScreen } from "../../components/ui/layout";
import { RecipientService } from "../../services/apiClient";
import {
  createRecipientApiPayload,
  createRecipientProfile,
  getCountryNameFromCode,
  normalizeCountryCode,
} from "../../services/remittance";
import {
  getTransferDraft,
  mergeTransferDraft,
} from "../../services/transferDraft";

export default function AddRecipientScreen() {
  const router = useRouter();
  const transactionData = getTransferDraft();
  const initialCountryName = useMemo(
    () =>
      getCountryNameFromCode(
        transactionData.receivingCountry || "SO",
      ).toUpperCase(),
    [transactionData.receivingCountry],
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [receivingCountry, setReceivingCountry] = useState(initialCountryName);
  const [countryOfCitizenship, setCountryOfCitizenship] =
    useState(initialCountryName);
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
      receivingCountry: normalizeCountryCode(receivingCountry),
      countryOfCitizenship: normalizeCountryCode(countryOfCitizenship),
      address,
      city,
      relationshipToSender: relationship,
      provider: transactionData.provider,
      service: transactionData.service || "MobileMoney",
    });

    setLoading(true);
    try {
      await RecipientService.addRecipient(
        createRecipientApiPayload(recipientProfile),
      );
      mergeTransferDraft({
        receivingCountry: recipientProfile.receivingCountry,
        recipient: { ...recipientProfile, avatarColor: "#2B6CB0" },
      });
      router.replace({
        pathname: "/transaction/PaymentMethodScreen",
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
    <KeyboardScrollScreen contentStyle={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.85}
      >
        <Ionicons
          name="chevron-back"
          size={18}
          color={fintechColors.text}
        />
      </TouchableOpacity>

      <FintechProgress
        step={4}
        total={6}
        label="Add recipient"
        style={styles.progress}
      />
      <FintechScreenHeader
        eyebrow="New recipient"
        title="Add recipient details"
        subtitle="Use the recipient details exactly as provided."
      />

      <FintechSectionCard style={styles.contextCard}>
        <View style={styles.contextTop}>
          <FintechStatusPill
            icon="shield-checkmark-outline"
            label="Secure recipient storage"
            tone="info"
          />
        </View>
        <Text style={styles.contextValue}>
          {getCountryNameFromCode(
            transactionData.receivingCountry || "SO",
          )}
        </Text>
        <Text style={styles.contextMeta}>
          {transactionData.provider || "Provider selected earlier"}
        </Text>
      </FintechSectionCard>

      <FintechSectionCard>
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
      </FintechSectionCard>

      <FintechStickyActionArea style={styles.footer}>
        <FintechPrimaryButton
          onPress={handleSaveRecipient}
          loading={loading}
          disabled={loading}
        >
          Save and continue
        </FintechPrimaryButton>
      </FintechStickyActionArea>
    </KeyboardScrollScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: fintechSpacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: fintechColors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: fintechColors.surface,
  },
  progress: { marginTop: fintechSpacing.md, marginBottom: fintechSpacing.md },
  contextCard: { gap: fintechSpacing.sm },
  contextTop: { flexDirection: "row", justifyContent: "flex-start" },
  contextValue: { fontSize: 22, fontWeight: "800", color: fintechColors.text },
  contextMeta: { fontSize: 14, color: fintechColors.textMuted },
  form: { gap: fintechSpacing.sm },
  footer: {
    paddingTop: fintechSpacing.md,
    borderTopWidth: 1,
    borderTopColor: fintechColors.border,
  },
});

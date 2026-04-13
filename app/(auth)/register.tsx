import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardScrollScreen } from '../../components/ui/layout';
import {
  FintechPrimaryButton,
  FintechScreenHeader,
  FintechTextField,
  FintechSectionCard,
  fintechColors,
  fintechSpacing,
} from '../../components/ui/fintech';
import { AuthService } from '../../services/apiClient';

const emailRegex = /^\S+@\S+\.\S+$/;

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [countrySendingFrom, setCountrySendingFrom] = useState('Norway');
  const [nationalIdentityNumber, setNationalIdentityNumber] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [postCode, setPostCode] = useState('');
  const [city, setCity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [baseCurrency, setBaseCurrency] = useState('NOK');
  const [countryCode, setCountryCode] = useState('NO');
  const [pin, setPin] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [visitorId, setVisitorId] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailError = useMemo(() => {
    if (!email) return '';
    return emailRegex.test(email.trim()) ? '' : 'Enter a valid email address.';
  }, [email]);

  const passwordError = useMemo(() => {
    if (!password) return '';
    return password.length >= 8 ? '' : 'Use at least 8 characters.';
  }, [password]);

  const passwordsMatch = password === confirmPassword;
  const isValid =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    emailRegex.test(email.trim()) &&
    password.length >= 8 &&
    passwordsMatch &&
    dateOfBirth.trim().length >= 8 &&
    countrySendingFrom.trim().length >= 2 &&
    nationalIdentityNumber.trim().length >= 6 &&
    streetAddress.trim().length >= 3 &&
    postCode.trim().length >= 3 &&
    city.trim().length >= 2 &&
    phoneNumber.trim().length >= 6 &&
    baseCurrency.trim().length >= 3 &&
    countryCode.trim().length >= 2 &&
    pin.trim().length >= 4 &&
    termsAccepted;

  const handleRegister = async () => {
    if (!isValid) {
      Alert.alert('Check your details', 'Complete all fields and accept the terms.');
      return;
    }

    setLoading(true);
    try {
      await AuthService.register({
        email: email.trim(),
        password,
        confirmPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth.trim(),
        countrySendingFrom: countrySendingFrom.trim(),
        nationalIdentityNumber: nationalIdentityNumber.trim(),
        streetAddress: streetAddress.trim(),
        postCode: postCode.trim(),
        city: city.trim(),
        phoneNumber: phoneNumber.trim(),
        baseCurrency: baseCurrency.trim(),
        countryCode: countryCode.trim(),
        pin: pin.trim(),
        IpAddress: ipAddress.trim(),
        VisitorId: visitorId.trim(),
        termsAccepted,
      });

      Alert.alert(
        'Account created',
        'Your account is ready. Sign in to continue with secure transfers.',
        [{ text: 'Continue', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      Alert.alert('Could not create account', error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardScrollScreen contentStyle={styles.scrollContainer}>
        <FintechScreenHeader
          eyebrow="Create Account"
          title="Create your account"
          subtitle="Complete the details below to get started."
          titleStyle={styles.headerTitle}
          subtitleStyle={styles.headerSubtitle}
        />

        <FintechSectionCard>
          <View style={styles.form}>
            <FintechTextField
              label="First name"
              icon="person-outline"
              placeholder="Hussein"
              value={firstName}
              onChangeText={setFirstName}
            />
            <FintechTextField
              label="Last name"
              icon="person-outline"
              placeholder="Warsame"
              value={lastName}
              onChangeText={setLastName}
            />
            <FintechTextField
              label="Email"
              icon="mail-outline"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={emailError || undefined}
            />
            <FintechTextField
              label="Password"
              icon="lock-closed-outline"
              placeholder="At least 8 characters"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={passwordError || undefined}
            />
            <FintechTextField
              label="Confirm password"
              icon="lock-closed-outline"
              placeholder="Re-enter password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={passwordsMatch || !confirmPassword ? undefined : 'Passwords do not match.'}
            />
            <FintechTextField
              label="Date of birth"
              icon="calendar-outline"
              placeholder="YYYY-MM-DD"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />
            <FintechTextField
              label="Country sending from"
              icon="flag-outline"
              placeholder="Norway"
              value={countrySendingFrom}
              onChangeText={setCountrySendingFrom}
            />
            <FintechTextField
              label="National ID number"
              icon="card-outline"
              placeholder="12345678888"
              value={nationalIdentityNumber}
              onChangeText={setNationalIdentityNumber}
            />
            <FintechTextField
              label="Street address"
              icon="home-outline"
              placeholder="Grønland 83"
              value={streetAddress}
              onChangeText={setStreetAddress}
            />
            <FintechTextField
              label="Post code"
              icon="location-outline"
              placeholder="0190"
              value={postCode}
              onChangeText={setPostCode}
            />
            <FintechTextField
              label="City"
              icon="business-outline"
              placeholder="Oslo"
              value={city}
              onChangeText={setCity}
            />
            <FintechTextField
              label="Phone number"
              icon="call-outline"
              placeholder="+4798765432"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <FintechTextField
              label="Base currency"
              icon="cash-outline"
              placeholder="NOK"
              value={baseCurrency}
              onChangeText={setBaseCurrency}
            />
            <FintechTextField
              label="Country code"
              icon="globe-outline"
              placeholder="NO"
              value={countryCode}
              onChangeText={setCountryCode}
              autoCapitalize="characters"
            />
            <FintechTextField
              label="6-digit PIN"
              icon="keypad-outline"
              placeholder="123456"
              secureTextEntry
              keyboardType="number-pad"
              value={pin}
              onChangeText={setPin}
            />
            <FintechTextField
              label="IP address"
              icon="navigate-outline"
              placeholder="123.243.3332"
              value={ipAddress}
              onChangeText={setIpAddress}
            />
            <FintechTextField
              label="Visitor ID"
              icon="finger-print-outline"
              placeholder="125255"
              value={visitorId}
              onChangeText={setVisitorId}
            />
          </View>
        </FintechSectionCard>

          <View style={styles.footer}>
            <View style={styles.termsRow}>
              <TouchableOpacity
                style={[styles.checkbox, termsAccepted && styles.checkboxChecked]}
                onPress={() => setTermsAccepted((current) => !current)}
                activeOpacity={0.8}
              >
                {termsAccepted ? (
                  <Ionicons name="checkmark" size={14} color={fintechColors.background} />
                ) : null}
              </TouchableOpacity>
              <Text style={styles.termsText}>I accept the terms and conditions.</Text>
            </View>

            <FintechPrimaryButton onPress={handleRegister} loading={loading} disabled={!isValid || loading}>
              Create account
            </FintechPrimaryButton>

            <TouchableOpacity style={styles.loginRow} onPress={() => router.replace('/(auth)/login')} activeOpacity={0.8}>
              <Text style={styles.loginLabel}>Already have an account?</Text>
              <Text style={styles.loginLink}>Sign in</Text>
            </TouchableOpacity>

          </View>
    </KeyboardScrollScreen>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    justifyContent: 'space-between',
    gap: fintechSpacing.lg,
  },
  headerTitle: {
    fontSize: 20,
    lineHeight: 24,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  form: {
    gap: fintechSpacing.md,
  },
  footer: {
    gap: fintechSpacing.md,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: fintechColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: fintechColors.surface,
  },
  checkboxChecked: {
    backgroundColor: fintechColors.primary,
    borderColor: fintechColors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: fintechColors.textMuted,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: fintechSpacing.xs,
  },
  loginLabel: {
    fontSize: 14,
    color: fintechColors.textMuted,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: fintechColors.primary,
  },
});

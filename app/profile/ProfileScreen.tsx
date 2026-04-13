import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  FintechInfoRow,
  FintechPrimaryButton,
  FintechScreenHeader,
  FintechSectionBlock,
  FintechStatusPill,
  fintechColors,
  fintechSpacing,
} from '../../components/ui/fintech';
import { ScrollScreen } from '../../components/ui/layout';
import { useUser } from '../../context/UserContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useUser();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  const menuSections = [
    {
      title: 'Accounts',
      subtitle: 'Upload document, My details, My recipients, My number',
      icon: 'person-circle-outline' as const,
      route: '/profile/ProfileScreen',
    },
    {
      title: 'PaySii',
      subtitle: 'About us, Settings',
      icon: 'information-circle-outline' as const,
      route: '/support/about',
    },
    {
      title: 'Legal',
      subtitle: 'Terms and conditions, Privacy policy, Complaints policy',
      icon: 'document-text-outline' as const,
      route: '/support/legal',
    },
    {
      title: 'Help and Support',
      subtitle: 'Contact us, App version v2.8.1 (91)',
      icon: 'help-circle-outline' as const,
      route: '/support/help-center',
    },
  ];

  return (
    <ScrollScreen contentStyle={styles.container}>
      <FintechScreenHeader
        eyebrow="Profile"
        title="Account"
        subtitle="Your details, settings, and support."
        right={(
          <FintechStatusPill
            icon="shield-checkmark-outline"
            label={user?.isKycVerified ? 'Verified' : 'KYC pending'}
            tone={user?.isKycVerified ? 'success' : 'warning'}
          />
        )}
      />

        <FintechSectionBlock>
          <FintechInfoRow label="Name" value={user?.firstName || 'Account holder'} />
          <FintechInfoRow label="Email" value={user?.email || 'No email'} />
        </FintechSectionBlock>

        <View style={styles.menuList}>
          {menuSections.map((item) => (
            <TouchableOpacity
              key={item.title}
              style={styles.menuRow}
              onPress={() => item.route && router.push(item.route)}
              activeOpacity={0.85}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={18} color={fintechColors.primary} />
              </View>
              <View style={styles.menuCopy}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      <FintechPrimaryButton style={styles.logoutButton} label="Log out" onPress={handleLogout} />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: fintechSpacing.lg,
    paddingTop: fintechSpacing.sm,
  },
  menuList: {
    gap: fintechSpacing.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.sm,
    padding: fintechSpacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: fintechColors.border,
    backgroundColor: fintechColors.surface,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: fintechColors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCopy: { flex: 1, gap: 2 },
  menuTitle: { fontSize: 14, fontWeight: '700', color: fintechColors.text },
  menuSubtitle: { fontSize: 12, color: fintechColors.textMuted },
  logoutButton: {
    marginTop: fintechSpacing.xs,
  },
});

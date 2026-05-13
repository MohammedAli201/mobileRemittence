import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  FintechPrimaryButton,
  FintechStatusPill,
  fintechColors,
  fintechSpacing,
} from '../../components/ui/fintech';
import { ScrollScreen } from '../../components/ui/layout';
import { useUser } from '../../context/UserContext';

const menuSections = [
  {
    title: 'Accounts',
    subtitle: 'Upload document, My details, My recipients',
    icon: 'person-circle-outline' as const,
    route: '/profile/ProfileScreen',
  },
  {
    title: 'JubaPay',
    subtitle: 'About us, Settings',
    icon: 'information-circle-outline' as const,
    route: '/support/about',
  },
  {
    title: 'Legal',
    subtitle: 'Terms and conditions, Privacy policy',
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

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useUser();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/welcome');
  };

  const name = user?.firstName || user?.FirstName || 'Account holder';
  const email = user?.email || 'No email';
  const initials = name.trim().split(/\s+/).map((p: string) => p[0]).join('').slice(0, 2).toUpperCase();

  return (
    <ScrollScreen contentStyle={styles.container}>
      {/* Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileEmail}>{email}</Text>
        </View>
        <FintechStatusPill
          icon="shield-checkmark-outline"
          label={user?.isKycVerified ? 'Verified' : 'Pending'}
          tone={user?.isKycVerified ? 'success' : 'warning'}
        />
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {menuSections.map((item, index) => (
          <TouchableOpacity
            key={item.title}
            style={[styles.menuRow, index > 0 && styles.menuRowDivider]}
            onPress={() => item.route && router.push(item.route)}
            activeOpacity={0.7}
          >
            <View style={styles.menuIcon}>
              <Ionicons name={item.icon} size={20} color={fintechColors.primary} />
            </View>
            <View style={styles.menuCopy}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={fintechColors.textSubtle} />
          </TouchableOpacity>
        ))}
      </View>

      <FintechPrimaryButton style={styles.logoutBtn} label="Log out" onPress={handleLogout} />
    </ScrollScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: fintechSpacing.xl,
    paddingTop: fintechSpacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: fintechColors.primaryStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: fintechColors.text,
  },
  profileEmail: {
    fontSize: 13,
    color: fintechColors.textMuted,
  },
  menu: {},
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.md,
    paddingVertical: fintechSpacing.md,
  },
  menuRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: fintechColors.border,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: fintechColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCopy: { flex: 1, gap: 2 },
  menuTitle: { fontSize: 15, fontWeight: '700', color: fintechColors.text },
  menuSubtitle: { fontSize: 12, color: fintechColors.textMuted },
  logoutBtn: { marginTop: fintechSpacing.xs },
});

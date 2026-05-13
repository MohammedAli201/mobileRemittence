import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fintechColors, fintechSpacing } from './fintech';

type ScreenProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export const useScreenInsets = () => {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const shortestSide = Math.min(width, height);
  const isTablet = shortestSide >= 768;
  const top = Math.max(insets.top, isTablet ? fintechSpacing.xl : fintechSpacing.lg);
  const bottom = Math.max(
    insets.bottom + (isTablet ? fintechSpacing.xl : fintechSpacing.lg),
    isTablet ? fintechSpacing.xl : fintechSpacing.lg,
  );
  return { insets, top, bottom };
};

export const useResponsiveMetrics = () => {
  const { width, height } = useWindowDimensions();
  const shortestSide = Math.min(width, height);
  const isTablet = shortestSide >= 768;
  const isLargePhone = shortestSide >= 430;
  const isSmallPhone = shortestSide < 380;

  return {
    width,
    height,
    isTablet,
    isLargePhone,
    isSmallPhone,
    horizontalPadding: isTablet ? fintechSpacing.xxl : isLargePhone ? fintechSpacing.lg : fintechSpacing.md,
    contentMaxWidth: isTablet ? 820 : 640,
  };
};

export function Screen({ children, style, contentStyle }: ScreenProps) {
  const { top, bottom } = useScreenInsets();
  const { horizontalPadding, contentMaxWidth } = useResponsiveMetrics();
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <View
        style={[
          styles.content,
          {
            paddingTop: top,
            paddingBottom: bottom,
            paddingHorizontal: horizontalPadding,
            maxWidth: contentMaxWidth,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

export function ScrollScreen({ children, style, contentStyle }: ScreenProps) {
  const { top, bottom } = useScreenInsets();
  const { horizontalPadding, contentMaxWidth } = useResponsiveMetrics();
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: top,
            paddingBottom: bottom,
            paddingHorizontal: horizontalPadding,
            maxWidth: contentMaxWidth,
          },
          contentStyle,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function KeyboardScrollScreen({ children, style, contentStyle }: ScreenProps) {
  const { top, bottom } = useScreenInsets();
  const { horizontalPadding, contentMaxWidth } = useResponsiveMetrics();
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? Math.max(top - fintechSpacing.sm, 0) : 0}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: top,
              paddingBottom: bottom,
              paddingHorizontal: horizontalPadding,
              maxWidth: contentMaxWidth,
            },
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/**
 * Screen with scrollable content and a sticky footer that stays pinned
 * above the keyboard and safe area. Use this for any screen where the
 * primary CTA should always be visible.
 */
export function StickyFooterScreen({
  children,
  footer,
  style,
  contentStyle,
}: ScreenProps & { footer: ReactNode }) {
  const { top, bottom } = useScreenInsets();
  const { horizontalPadding, contentMaxWidth } = useResponsiveMetrics();
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: top,
              paddingBottom: fintechSpacing.md,
              paddingHorizontal: horizontalPadding,
              maxWidth: contentMaxWidth,
            },
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {children}
        </ScrollView>
        <View
          style={[
            styles.stickyFooter,
            {
              paddingBottom: Math.max(bottom - fintechSpacing.lg, fintechSpacing.md),
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          {footer}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function FixedFooterScreen({
  children,
  footer,
  style,
  contentStyle,
}: ScreenProps & { footer: ReactNode }) {
  const { top, bottom } = useScreenInsets();
  const { horizontalPadding, contentMaxWidth } = useResponsiveMetrics();
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View
          style={[
            styles.content,
            {
              flex: 1,
              paddingTop: top,
              paddingBottom: fintechSpacing.md,
              paddingHorizontal: horizontalPadding,
              maxWidth: contentMaxWidth,
            },
            contentStyle,
          ]}
        >
          {children}
        </View>
        <View
          style={[
            styles.stickyFooter,
            {
              paddingBottom: Math.max(bottom - fintechSpacing.lg, fintechSpacing.md),
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          {footer}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: fintechColors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    gap: fintechSpacing.lg,
    backgroundColor: fintechColors.background,
    width: '100%',
    alignSelf: 'center',
  },
  stickyFooter: {
    backgroundColor: fintechColors.surface,
    borderTopWidth: 1,
    borderTopColor: fintechColors.border,
    paddingTop: fintechSpacing.md,
    gap: fintechSpacing.sm,
  },
});

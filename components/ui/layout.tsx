import React, { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
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
  const top = Math.max(insets.top, fintechSpacing.lg);
  const bottom = Math.max(insets.bottom + fintechSpacing.lg, fintechSpacing.lg);
  return { insets, top, bottom };
};

export function Screen({ children, style, contentStyle }: ScreenProps) {
  const { top, bottom } = useScreenInsets();
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <View
        style={[
          styles.content,
          { paddingTop: top, paddingBottom: bottom },
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
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: top, paddingBottom: bottom },
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
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? top : 0}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: top, paddingBottom: bottom },
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: fintechColors.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: fintechSpacing.lg,
    gap: fintechSpacing.lg,
    backgroundColor: fintechColors.background,
  },
});

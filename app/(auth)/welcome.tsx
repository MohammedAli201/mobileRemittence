import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Screen, useScreenInsets } from '../../components/ui/layout';
import { FintechPrimaryButton, fintechSpacing } from '../../components/ui/fintech';
import { useUser } from '../../context/UserContext';
import AuthHelpers from '../../services/AuthHelpers';

const SLIDES = [
  {
    title: 'Fast transfers, clear rates',
    subtitle: 'Send in minutes with upfront pricing and live tracking.',
    gradient: ['#0B1D2B', '#0B3A4A', '#0B1D2B'],
  },
  {
    title: 'Send anywhere, anytime',
    subtitle: 'Wallets, banks, and cash pickup with one flow.',
    gradient: ['#1A1430', '#1A2B4C', '#101526'],
  },
  {
    title: 'Secure by design',
    subtitle: 'Trusted protection and privacy-first controls.',
    gradient: ['#0B1C1A', '#12363A', '#0B1C1A'],
  },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { top, bottom } = useScreenInsets();
  const { width, height } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const { user, isLoading } = useUser();
  const [ready, setReady] = useState(false);
  const isCompact = height < 700;

  useEffect(() => {
    if (isLoading) return;
    const routeUser = async () => {
      const pinExists = await AuthHelpers.pinExists();
      if (user?.id && pinExists) {
        router.replace('/(auth)/pin-entry');
        return;
      }
      if (user?.id) {
        router.replace('/(auth)/login');
        return;
      }
      setReady(true);
    };
    routeUser();
  }, [isLoading, router, user?.id]);

  if (!ready) {
    return (
      <Screen contentStyle={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#6ED6FF" />
      </Screen>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.ScrollView
        horizontal
        pagingEnabled
        snapToInterval={width}
        decelerationRate="fast"
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true },
        )}
      >
        {SLIDES.map((slide, index) => {
          const translateX = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [-20, 0, 20],
          });
          const fade = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [0.6, 1, 0.6],
          });
          const lift = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [10, 0, 10],
          });
          const scale = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [1.03, 1, 1.03],
          });

          return (
            <View
              key={slide.title}
              style={[
                styles.slide,
                {
                  width,
                  paddingTop: Math.max(top + 8, 20),
                  paddingBottom: Math.max(bottom + (isCompact ? 8 : 16), 24),
                },
              ]}
            >
              <Animated.View style={[styles.imageWrap, { transform: [{ translateX }, { scale }] }]}>
                <LinearGradient colors={slide.gradient} style={styles.image} />
                <LinearGradient
                  colors={['rgba(6,10,18,0.78)', 'rgba(6,10,18,0.35)', 'rgba(6,10,18,0.88)']}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.glow} />
                <View style={styles.glowSecondary} />
              </Animated.View>

              <View style={styles.topRow}>
                <TouchableOpacity style={styles.localePill} activeOpacity={0.85}>
                  <Text style={styles.localeText}>EN</Text>
                  <View style={styles.localeDivider} />
                  <Text style={styles.localeRegion}>NO</Text>
                  <Ionicons name="chevron-down" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Animated.View
                style={[
                  styles.copyWrap,
                  isCompact && styles.copyWrapCompact,
                  { opacity: fade, transform: [{ translateY: lift }] },
                ]}
              >
                <Text style={[styles.title, isCompact && styles.titleCompact]}>{slide.title}</Text>
                <Text style={[styles.subtitle, isCompact && styles.subtitleCompact]}>{slide.subtitle}</Text>
              </Animated.View>

              <View style={[styles.controls, isCompact && styles.controlsCompact]}>
                <View style={styles.dots}>
                  {SLIDES.map((_, dotIndex) => {
                    const scaleAnim = scrollX.interpolate({
                      inputRange: [
                        (dotIndex - 1) * width,
                        dotIndex * width,
                        (dotIndex + 1) * width,
                      ],
                      outputRange: [1, 1.9, 1],
                    });
                    const opacityAnim = scrollX.interpolate({
                      inputRange: [
                        (dotIndex - 1) * width,
                        dotIndex * width,
                        (dotIndex + 1) * width,
                      ],
                      outputRange: [0.35, 1, 0.35],
                    });
                    return (
                      <Animated.View
                        key={`${dotIndex}-dot`}
                        style={[
                          styles.dot,
                          { opacity: opacityAnim, transform: [{ scaleX: scaleAnim }] },
                        ]}
                      />
                    );
                  })}
                </View>

                <FintechPrimaryButton
                  onPress={() => router.push('/(auth)/register')}
                  style={[styles.primaryButton, isCompact && styles.primaryButtonCompact]}
                  textStyle={[styles.primaryButtonText, isCompact && styles.primaryButtonTextCompact]}
                >
                  Create account
                </FintechPrimaryButton>
                <FintechPrimaryButton
                  onPress={() => router.push('/(auth)/login')}
                  style={[styles.secondaryButton, isCompact && styles.secondaryButtonCompact]}
                  textStyle={[styles.secondaryButtonText, isCompact && styles.secondaryButtonTextCompact]}
                >
                  Try it out
                </FintechPrimaryButton>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')} activeOpacity={0.8}>
                  <Text style={styles.loginHint}>Already have an account?</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0B111A' },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B111A',
  },
  slide: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: fintechSpacing.lg,
  },
  imageWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  glow: {
    position: 'absolute',
    right: -70,
    top: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(208,106,82,0.16)',
  },
  glowSecondary: {
    position: 'absolute',
    left: -60,
    bottom: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(110,214,255,0.14)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  localePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.sm,
    paddingHorizontal: fintechSpacing.sm,
    paddingVertical: fintechSpacing.xs,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  localeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  localeDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  localeRegion: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  copyWrap: {
    marginTop: fintechSpacing.xxxl,
    gap: fintechSpacing.md,
    paddingRight: fintechSpacing.md,
  },
  copyWrapCompact: {
    marginTop: fintechSpacing.xl,
    gap: fintechSpacing.sm,
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  titleCompact: {
    fontSize: 22,
    lineHeight: 26,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.88)',
  },
  subtitleCompact: {
    fontSize: 12,
    lineHeight: 17,
  },
  controls: {
    gap: fintechSpacing.md,
    paddingBottom: fintechSpacing.xxs,
  },
  controlsCompact: {
    gap: fintechSpacing.sm,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: fintechSpacing.xs,
  },
  dot: {
    height: 6,
    width: 12,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#D06A52',
    borderRadius: 28,
    minHeight: 56,
    shadowColor: '#D06A52',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  primaryButtonCompact: {
    minHeight: 52,
    borderRadius: 24,
  },
  primaryButtonTextCompact: {
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    minHeight: 56,
  },
  secondaryButtonText: { color: '#1B2A41', fontSize: 15, fontWeight: '700' },
  secondaryButtonCompact: {
    minHeight: 52,
    borderRadius: 24,
  },
  secondaryButtonTextCompact: {
    fontSize: 14,
  },
  loginHint: {
    textAlign: 'center',
    color: '#E6EEF7',
    fontSize: 13,
    fontWeight: '600',
    paddingTop: fintechSpacing.xs,
  },
});

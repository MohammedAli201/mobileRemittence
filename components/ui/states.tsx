/**
 * Reusable UX state components.
 *
 * Exports:
 *   Skeletons  — SkeletonBox, SkeletonText, SkeletonCard, SkeletonTransferRow, SkeletonDashboard
 *   Errors     — FullScreenError, InlineRetry
 *   Network    — OfflineBanner, useNetworkStatus
 *   Success    — SuccessCard
 *   Navigation — StepDots
 */

import { Ionicons } from '@expo/vector-icons';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import {
  fintechColors,
  fintechRadius,
  fintechSpacing,
} from './fintech';

// ─── Shimmer hook ────────────────────────────────────────────────────────────

function useShimmer() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [anim]);
  return anim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.65] });
}

// ─── Skeleton primitives ─────────────────────────────────────────────────────

export function SkeletonBox({
  width,
  height = 16,
  borderRadius = fintechRadius.sm,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = useShimmer();
  return (
    <Animated.View
      style={[
        sk.box,
        { width: width ?? '100%', height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonText({
  lines = 2,
  style,
}: {
  lines?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[sk.textBlock, style]}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          height={13}
          width={i === lines - 1 && lines > 1 ? '60%' : '100%'}
        />
      ))}
    </View>
  );
}

export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[sk.card, style]}>
      <SkeletonBox height={18} width="45%" />
      <SkeletonText lines={2} />
      <SkeletonBox height={52} />
    </View>
  );
}

export function SkeletonTransferRow({
  divider,
  style,
}: {
  divider?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[sk.row, divider && sk.rowDivider, style]}>
      <SkeletonBox width={46} height={46} borderRadius={23} />
      <View style={sk.rowBody}>
        <SkeletonBox height={14} width="50%" />
        <SkeletonBox height={12} width="33%" />
      </View>
      <SkeletonBox height={14} width={56} />
    </View>
  );
}

export function SkeletonDashboard({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[sk.dashboard, style]}>
      <SkeletonBox height={26} width="55%" />
      <SkeletonBox height={14} width="38%" />
      <SkeletonCard />
      <SkeletonCard />
      {[0, 1, 2].map((i) => (
        <SkeletonTransferRow key={i} divider={i > 0} />
      ))}
    </View>
  );
}

const sk = StyleSheet.create({
  box: { backgroundColor: fintechColors.surfaceStrong },
  textBlock: { gap: fintechSpacing.xs },
  card: {
    backgroundColor: fintechColors.surface,
    borderRadius: fintechRadius.lg,
    borderWidth: 1,
    borderColor: fintechColors.border,
    padding: fintechSpacing.md,
    gap: fintechSpacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: fintechSpacing.md,
  },
  rowDivider: { borderTopWidth: 1, borderTopColor: fintechColors.border },
  rowBody: { flex: 1, gap: fintechSpacing.xs },
  dashboard: { gap: fintechSpacing.md },
});

// ─── Error states ─────────────────────────────────────────────────────────────

export function FullScreenError({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  style,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[err.screen, style]}>
      <View style={err.iconWrap}>
        <Ionicons name="alert-circle-outline" size={32} color={fintechColors.danger} />
      </View>
      <Text style={err.title}>{title}</Text>
      <Text style={err.message}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity style={err.retryBtn} onPress={onRetry} activeOpacity={0.88}>
          <Ionicons name="refresh-outline" size={16} color={fintechColors.primary} />
          <Text style={err.retryText}>{retryLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function InlineRetry({
  message,
  onRetry,
  retryLabel = 'Retry',
  style,
}: {
  message: string;
  onRetry: () => void;
  retryLabel?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[err.inline, style]}>
      <Ionicons name="alert-circle-outline" size={16} color={fintechColors.danger} />
      <Text style={err.inlineText}>{message}</Text>
      <TouchableOpacity
        onPress={onRetry}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={err.inlineAction}>{retryLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}

const err = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: fintechSpacing.md,
    paddingHorizontal: fintechSpacing.xl,
    paddingVertical: fintechSpacing.xxl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: fintechColors.dangerSoft,
    borderWidth: 1,
    borderColor: '#F3C5BF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: fintechColors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: fintechColors.textMuted,
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.xs,
    paddingHorizontal: fintechSpacing.md,
    paddingVertical: fintechSpacing.sm + 2,
    borderRadius: fintechRadius.pill,
    borderWidth: 1.5,
    borderColor: fintechColors.primary,
    marginTop: fintechSpacing.xs,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: fintechColors.primary,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.xs,
    backgroundColor: fintechColors.dangerSoft,
    borderRadius: fintechRadius.md,
    borderWidth: 1,
    borderColor: '#F3C5BF',
    padding: fintechSpacing.md,
  },
  inlineText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: fintechColors.text,
  },
  inlineAction: {
    fontSize: 13,
    fontWeight: '800',
    color: fintechColors.primary,
  },
});

// ─── Offline banner + network hook ───────────────────────────────────────────

/**
 * Minimal network-status hook.
 * Polls with a lightweight fetch to a known-reliable endpoint every 8 s.
 * No native module required — works in Expo Go.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const res = await fetch('https://1.1.1.1', {
          method: 'HEAD',
          cache: 'no-store',
        });
        if (!cancelled) setIsOnline(res.ok || res.status > 0);
      } catch {
        if (!cancelled) setIsOnline(false);
      }
    };

    void check();
    const id = setInterval(check, 8000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return isOnline;
}

export function OfflineBanner({ style }: { style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[off.banner, style]}>
      <Ionicons name="cloud-offline-outline" size={16} color={fintechColors.warning} />
      <Text style={off.text}>
        No internet connection. Check your network and try again.
      </Text>
    </View>
  );
}

const off = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.sm,
    backgroundColor: fintechColors.warningSoft,
    borderBottomWidth: 1,
    borderBottomColor: '#F4D9A3',
    paddingHorizontal: fintechSpacing.md,
    paddingVertical: fintechSpacing.sm + 2,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: fintechColors.warning,
    fontWeight: '600',
  },
});

// ─── Success card ─────────────────────────────────────────────────────────────

export function SuccessCard({
  title,
  message,
  children,
  style,
}: {
  title: string;
  message?: string;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <Animated.View
      style={[suc.card, { transform: [{ scale }], opacity }, style]}
    >
      <View style={suc.iconWrap}>
        <Ionicons name="checkmark-circle" size={44} color={fintechColors.success} />
      </View>
      <Text style={suc.title}>{title}</Text>
      {message ? <Text style={suc.message}>{message}</Text> : null}
      {children}
    </Animated.View>
  );
}

const suc = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: fintechSpacing.md,
    backgroundColor: fintechColors.surface,
    borderRadius: fintechRadius.xl,
    borderWidth: 1,
    borderColor: fintechColors.border,
    padding: fintechSpacing.xl,
  },
  iconWrap: {
    width: 76,
    height: 76,
    borderRadius: 26,
    backgroundColor: fintechColors.successSoft,
    borderWidth: 1,
    borderColor: '#C7EBDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: fintechColors.text,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: fintechColors.textMuted,
    textAlign: 'center',
  },
});

// ─── Step progress dots ───────────────────────────────────────────────────────

/**
 * Pill-style step progress: completed steps are small filled dots,
 * the active step is an elongated pill, future steps are unfilled.
 */
export function StepDots({
  current,
  total,
  style,
}: {
  current: number;
  total: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[dot.row, style]}>
      {Array.from({ length: total }).map((_, i) => {
        const isDone = i + 1 < current;
        const isActive = i + 1 === current;
        return (
          <View
            key={i}
            style={[
              dot.base,
              isActive && dot.active,
              isDone && dot.done,
            ]}
          />
        );
      })}
    </View>
  );
}

const dot = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  base: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: fintechColors.border,
  },
  active: {
    width: 24,
    borderRadius: 4,
    backgroundColor: fintechColors.primary,
  },
  done: {
    backgroundColor: fintechColors.primaryStrong,
    opacity: 0.45,
  },
});

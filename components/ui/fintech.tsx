import { Ionicons } from '@expo/vector-icons';
import React, { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

type IconName = ComponentProps<typeof Ionicons>['name'];
type PillTone = 'success' | 'info' | 'warning' | 'neutral' | 'danger';
type NoticeTone = 'info' | 'success' | 'warning' | 'danger';

export const fintechColors = {
  primary: '#2F2B23',
  primaryStrong: '#1F1B15',
  primarySoft: '#FFF1B8',
  background: '#F6F1E7',
  surface: '#FFFFFF',
  surfaceAlt: '#FBF7EC',
  text: '#0F172A',
  textMuted: '#64748B',
  textSubtle: '#94A3B8',
  border: '#E7DDC3',
  borderStrong: '#D6C598',
  success: '#15803D',
  successSoft: '#DCFCE7',
  warning: '#9A6700',
  warningSoft: '#FFF3CD',
  danger: '#B91C1C',
  dangerSoft: '#FEE2E2',
  infoSoft: '#FFF7D9',
  shadow: '#0F172A',
};

export const fintechSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const fintechRadius = {
  sm: 12,
  md: 16,
  lg: 20,
  pill: 999,
};

type FintechScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FintechScreenHeader({
  eyebrow,
  title,
  subtitle,
  right,
  style,
}: FintechScreenHeaderProps) {
  return (
    <View style={[styles.screenHeader, style]}>
      <View style={styles.screenHeaderCopy}>
        {eyebrow ? <Text style={styles.screenEyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.screenTitle}>{title}</Text>
        {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
      </View>
      {right ? <View style={styles.screenHeaderRight}>{right}</View> : null}
    </View>
  );
}

type FintechProgressProps = {
  step: number;
  total: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

export function FintechProgress({ step, total, label, style }: FintechProgressProps) {
  const safeTotal = Math.max(total, 1);
  const fillStyle: ViewStyle = {
    width: `${Math.min(step / safeTotal, 1) * 100}%`,
  };

  return (
    <View style={[styles.progressWrap, style]}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressLabel}>{label ?? `Step ${step} of ${total}`}</Text>
        <Text style={styles.progressCount}>{step}/{total}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, fillStyle]} />
      </View>
    </View>
  );
}

type FintechHeroCardProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  status?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FintechHeroCard({
  eyebrow,
  title,
  subtitle,
  status,
  children,
  style,
}: FintechHeroCardProps) {
  return (
    <View style={[styles.heroCard, style]}>
      <View style={styles.heroHeader}>
        <View style={styles.heroCopy}>
          {eyebrow ? <Text style={styles.heroEyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.heroTitle}>{title}</Text>
          {subtitle ? <Text style={styles.heroSubtitle}>{subtitle}</Text> : null}
        </View>
        {status ? <View style={styles.heroStatus}>{status}</View> : null}
      </View>
      {children}
    </View>
  );
}

type FintechStatusPillProps = {
  icon?: IconName;
  label: string;
  tone?: PillTone;
  style?: StyleProp<ViewStyle>;
};

const pillStyles: Record<PillTone, { backgroundColor: string; color: string }> = {
  success: { backgroundColor: fintechColors.successSoft, color: fintechColors.success },
  info: { backgroundColor: fintechColors.infoSoft, color: fintechColors.primary },
  warning: { backgroundColor: fintechColors.warningSoft, color: fintechColors.warning },
  neutral: { backgroundColor: '#EEF2F6', color: '#475569' },
  danger: { backgroundColor: fintechColors.dangerSoft, color: fintechColors.danger },
};

export function FintechStatusPill({
  icon,
  label,
  tone = 'neutral',
  style,
}: FintechStatusPillProps) {
  const theme = pillStyles[tone];

  return (
    <View style={[styles.statusPill, { backgroundColor: theme.backgroundColor }, style]}>
      {icon ? <Ionicons name={icon} size={14} color={theme.color} /> : null}
      <Text style={[styles.statusPillText, { color: theme.color }]}>{label}</Text>
    </View>
  );
}

type FintechSectionCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FintechSectionCard({ children, style }: FintechSectionCardProps) {
  return <View style={[styles.sectionCard, style]}>{children}</View>;
}

export function FintechSectionBlock({ children, style }: FintechSectionCardProps) {
  return <FintechSectionCard style={style}>{children}</FintechSectionCard>;
}

type FintechSectionHeaderProps = {
  title: string;
  note?: string;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FintechSectionHeader({
  title,
  note,
  right,
  style,
}: FintechSectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionHeaderCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {note ? <Text style={styles.sectionNote}>{note}</Text> : null}
      </View>
      {right}
    </View>
  );
}

type FintechSummaryTileProps = {
  label: string;
  value: string;
  emphasis?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function FintechSummaryTile({
  label,
  value,
  emphasis,
  style,
}: FintechSummaryTileProps) {
  return (
    <View style={[styles.summaryTile, emphasis && styles.summaryTilePrimary, style]}>
      <Text style={[styles.summaryLabel, emphasis && styles.summaryLabelPrimary]}>{label}</Text>
      <Text style={[styles.summaryValue, emphasis && styles.summaryValuePrimary]}>{value}</Text>
    </View>
  );
}

type FintechKeyValueRowProps = {
  label: string;
  value: string;
  valueTone?: 'default' | 'muted' | 'primary';
  style?: StyleProp<ViewStyle>;
};

export function FintechKeyValueRow({
  label,
  value,
  valueTone = 'default',
  style,
}: FintechKeyValueRowProps) {
  return (
    <View style={[styles.keyValueRow, style]}>
      <Text style={styles.keyValueLabel}>{label}</Text>
      <Text
        style={[
          styles.keyValueValue,
          valueTone === 'muted' && styles.keyValueValueMuted,
          valueTone === 'primary' && styles.keyValueValuePrimary,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function FintechInfoRow(props: FintechKeyValueRowProps) {
  return <FintechKeyValueRow {...props} />;
}

type FintechButtonProps = {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: ReactNode;
};

export function FintechPrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  style,
  textStyle,
  children,
}: FintechButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.primaryButton, disabled && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.9}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : typeof children === 'string' ? (
        <Text style={[styles.primaryButtonText, textStyle]}>{children}</Text>
      ) : children ? (
        children
      ) : (
        <Text style={[styles.primaryButtonText, textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

export function FintechSecondaryButton({
  label,
  onPress,
  disabled,
  style,
  textStyle,
  children,
}: Omit<FintechButtonProps, 'loading'>) {
  return (
    <TouchableOpacity
      style={[styles.secondaryButton, disabled && styles.secondaryDisabled, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.secondaryButtonText, textStyle]}>{children}</Text>
      ) : children ? (
        children
      ) : (
        <Text style={[styles.secondaryButtonText, textStyle]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

type FintechChoiceCardProps = {
  title: string;
  subtitle?: string;
  icon?: IconName;
  selected?: boolean;
  trailing?: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function FintechChoiceCard({
  title,
  subtitle,
  icon,
  selected,
  trailing,
  onPress,
  style,
}: FintechChoiceCardProps) {
  return (
    <TouchableOpacity
      style={[styles.choiceCard, selected && styles.choiceCardSelected, style]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <View style={styles.choiceLeft}>
        {icon ? (
          <View style={[styles.choiceIconWrap, selected && styles.choiceIconWrapSelected]}>
            <Ionicons name={icon} size={20} color={selected ? fintechColors.primary : '#64748B'} />
          </View>
        ) : null}
        <View style={styles.choiceCopy}>
          <Text style={styles.choiceTitle}>{title}</Text>
          {subtitle ? <Text style={styles.choiceSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      {trailing ?? (
        <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
          {selected ? <View style={styles.radioInner} /> : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

type FintechTextFieldProps = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  icon?: IconName;
  right?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export function FintechTextField({
  label,
  hint,
  error,
  icon,
  right,
  containerStyle,
  ...inputProps
}: FintechTextFieldProps) {
  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={[styles.fieldShell, error && styles.fieldShellError]}>
        {icon ? <Ionicons name={icon} size={18} color="#64748B" /> : null}
        <TextInput
          {...inputProps}
          placeholderTextColor={fintechColors.textSubtle}
          style={[styles.fieldInput, inputProps.style]}
        />
        {right}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

type FintechInlineMessageProps = {
  tone?: NoticeTone;
  title?: string;
  text: string;
  style?: StyleProp<ViewStyle>;
};

const noticeMap: Record<NoticeTone, { backgroundColor: string; color: string; icon: IconName }> = {
  info: { backgroundColor: fintechColors.infoSoft, color: fintechColors.primary, icon: 'information-circle-outline' },
  success: { backgroundColor: fintechColors.successSoft, color: fintechColors.success, icon: 'checkmark-circle-outline' },
  warning: { backgroundColor: fintechColors.warningSoft, color: fintechColors.warning, icon: 'alert-circle-outline' },
  danger: { backgroundColor: fintechColors.dangerSoft, color: fintechColors.danger, icon: 'close-circle-outline' },
};

export function FintechInlineMessage({
  tone = 'info',
  title,
  text,
  style,
}: FintechInlineMessageProps) {
  const theme = noticeMap[tone];

  return (
    <View style={[styles.noticeCard, { backgroundColor: theme.backgroundColor }, style]}>
      <Ionicons name={theme.icon} size={18} color={theme.color} />
      <View style={styles.noticeCopy}>
        {title ? <Text style={[styles.noticeTitle, { color: theme.color }]}>{title}</Text> : null}
        <Text style={styles.noticeText}>{text}</Text>
      </View>
    </View>
  );
}

type FintechTrustRowProps = {
  icon: IconName;
  title: string;
  text: string;
  style?: StyleProp<ViewStyle>;
};

export function FintechTrustRow({ icon, title, text, style }: FintechTrustRowProps) {
  return (
    <View style={[styles.trustRow, style]}>
      <View style={styles.trustIconWrap}>
        <Ionicons name={icon} size={18} color={fintechColors.primary} />
      </View>
      <View style={styles.trustCopy}>
        <Text style={styles.trustTitle}>{title}</Text>
        <Text style={styles.trustText}>{text}</Text>
      </View>
    </View>
  );
}

type FintechFooterCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FintechFooterCard({ children, style }: FintechFooterCardProps) {
  return <View style={[styles.footerCard, style]}>{children}</View>;
}

type FintechReceiptCardProps = {
  title?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FintechReceiptCard({
  title,
  children,
  style,
}: FintechReceiptCardProps) {
  return (
    <View style={[styles.receiptCard, style]}>
      {title ? <Text style={styles.receiptTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

type FintechEmptyStateProps = {
  icon: IconName;
  title: string;
  text: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function FintechEmptyState({
  icon,
  title,
  text,
  action,
  style,
}: FintechEmptyStateProps) {
  return (
    <View style={[styles.emptyState, style]}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name={icon} size={24} color={fintechColors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: fintechSpacing.md,
  },
  screenHeaderCopy: {
    flex: 1,
    gap: fintechSpacing.xs,
  },
  screenHeaderRight: {
    paddingTop: 2,
  },
  screenEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: fintechColors.primary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: fintechColors.text,
  },
  screenSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: fintechColors.textMuted,
  },
  progressWrap: {
    gap: fintechSpacing.sm,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: fintechColors.textMuted,
  },
  progressCount: {
    fontSize: 13,
    fontWeight: '600',
    color: fintechColors.textMuted,
  },
  progressTrack: {
    height: 8,
    borderRadius: fintechRadius.pill,
    backgroundColor: '#E6EDF5',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: fintechRadius.pill,
    backgroundColor: fintechColors.primary,
  },
  heroCard: {
    backgroundColor: fintechColors.surface,
    borderWidth: 1,
    borderColor: fintechColors.border,
    borderRadius: fintechRadius.lg,
    padding: fintechSpacing.lg,
    gap: fintechSpacing.lg,
    shadowColor: fintechColors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 2,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: fintechSpacing.md,
  },
  heroCopy: {
    flex: 1,
    gap: fintechSpacing.xs,
  },
  heroStatus: {
    alignItems: 'flex-end',
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: fintechColors.primary,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: fintechColors.text,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: fintechColors.textMuted,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: fintechRadius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: fintechColors.surface,
    borderWidth: 1,
    borderColor: fintechColors.border,
    borderRadius: fintechRadius.md,
    padding: fintechSpacing.lg,
    gap: fintechSpacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: fintechSpacing.sm,
  },
  sectionHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: fintechColors.text,
  },
  sectionNote: {
    fontSize: 13,
    color: fintechColors.textMuted,
  },
  summaryTile: {
    flex: 1,
    gap: 4,
    padding: fintechSpacing.md,
    backgroundColor: fintechColors.surfaceAlt,
    borderRadius: fintechRadius.sm,
    borderWidth: 1,
    borderColor: fintechColors.border,
  },
  summaryTilePrimary: {
    backgroundColor: fintechColors.primarySoft,
    borderColor: '#C9DCF2',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: fintechColors.textMuted,
  },
  summaryLabelPrimary: {
    color: fintechColors.primary,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: fintechColors.text,
  },
  summaryValuePrimary: {
    color: fintechColors.primaryStrong,
  },
  keyValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: fintechSpacing.sm,
  },
  keyValueLabel: {
    flex: 1,
    fontSize: 14,
    color: fintechColors.textMuted,
  },
  keyValueValue: {
    fontSize: 14,
    fontWeight: '600',
    color: fintechColors.text,
    textAlign: 'right',
  },
  keyValueValueMuted: {
    color: fintechColors.textMuted,
  },
  keyValueValuePrimary: {
    color: fintechColors.primaryStrong,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: fintechRadius.md,
    backgroundColor: fintechColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: fintechSpacing.lg,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: fintechRadius.md,
    backgroundColor: fintechColors.surface,
    borderWidth: 1,
    borderColor: fintechColors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: fintechSpacing.lg,
  },
  secondaryButtonText: {
    color: fintechColors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  secondaryDisabled: {
    opacity: 0.55,
  },
  choiceCard: {
    minHeight: 72,
    borderRadius: fintechRadius.md,
    borderWidth: 1,
    borderColor: fintechColors.border,
    backgroundColor: fintechColors.surface,
    padding: fintechSpacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: fintechSpacing.md,
  },
  choiceCardSelected: {
    borderColor: fintechColors.primary,
    backgroundColor: fintechColors.primarySoft,
  },
  choiceLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: fintechSpacing.md,
  },
  choiceIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: fintechColors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceIconWrapSelected: {
    backgroundColor: '#DCEAF8',
  },
  choiceCopy: {
    flex: 1,
    gap: 2,
  },
  choiceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: fintechColors.text,
  },
  choiceSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: fintechColors.textMuted,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: fintechColors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: fintechColors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: fintechColors.primary,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: fintechColors.text,
    marginBottom: 8,
  },
  fieldShell: {
    minHeight: 54,
    borderRadius: fintechRadius.md,
    borderWidth: 1,
    borderColor: fintechColors.borderStrong,
    backgroundColor: fintechColors.surface,
    paddingHorizontal: fintechSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldShellError: {
    borderColor: fintechColors.danger,
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    color: fintechColors.text,
    paddingVertical: 0,
  },
  fieldHint: {
    marginTop: 6,
    fontSize: 12,
    color: fintechColors.textMuted,
  },
  fieldError: {
    marginTop: 6,
    fontSize: 12,
    color: fintechColors.danger,
  },
  noticeCard: {
    borderRadius: fintechRadius.sm,
    padding: fintechSpacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: fintechSpacing.sm,
  },
  noticeCopy: {
    flex: 1,
    gap: 2,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 18,
    color: fintechColors.text,
  },
  trustRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: fintechSpacing.md,
  },
  trustIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: fintechColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustCopy: {
    flex: 1,
    gap: 2,
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: fintechColors.text,
  },
  trustText: {
    fontSize: 13,
    lineHeight: 18,
    color: fintechColors.textMuted,
  },
  footerCard: {
    backgroundColor: fintechColors.surface,
    borderWidth: 1,
    borderColor: fintechColors.border,
    borderRadius: fintechRadius.lg,
    padding: fintechSpacing.lg,
    gap: fintechSpacing.md,
    shadowColor: fintechColors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  receiptCard: {
    backgroundColor: fintechColors.surface,
    borderWidth: 1,
    borderColor: fintechColors.border,
    borderRadius: fintechRadius.md,
    padding: fintechSpacing.lg,
    gap: fintechSpacing.md,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: fintechColors.text,
  },
  emptyState: {
    alignItems: 'center',
    gap: fintechSpacing.sm,
    paddingVertical: fintechSpacing.lg,
  },
  emptyIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: fintechColors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: fintechColors.text,
  },
  emptyText: {
    fontSize: 13,
    lineHeight: 18,
    color: fintechColors.textMuted,
    textAlign: 'center',
  },
});

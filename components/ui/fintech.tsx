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
  primary: '#10B981',
  primaryStrong: '#064E3B',
  primarySoft: 'rgba(52,211,153,0.22)',
  background: '#ECFDF5',
  backgroundMuted: '#ECFDF5',
  surface: '#FFFFFF',
  surfaceAlt: '#FFFFFF',
  surfaceStrong: '#ECFDF5',
  text: '#022C22',
  textMuted: '#064E3B',
  textSubtle: '#34D399',
  border: 'rgba(6,78,59,0.16)',
  borderStrong: 'rgba(6,78,59,0.32)',
  success: '#10B981',
  successSoft: 'rgba(16,185,129,0.18)',
  warning: '#34D399',
  warningSoft: 'rgba(52,211,153,0.2)',
  danger: '#064E3B',
  dangerSoft: 'rgba(6,78,59,0.12)',
  infoSoft: 'rgba(236,253,245,0.9)',
  shadow: '#022C22',
};

export const fintechSpacing = { xxs: 4, xs: 6, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40, xxxl: 48 };
export const fintechRadius = { sm: 12, md: 16, lg: 20, xl: 28, pill: 999 };
export const fintechTypography = { eyebrow: 10, label: 11, body: 13, title: 15, hero: 22 };

const pillMap: Record<PillTone, { bg: string; fg: string; border: string }> = {
  success: { bg: fintechColors.successSoft, fg: fintechColors.success, border: 'rgba(55,199,135,0.28)' },
  info: { bg: fintechColors.infoSoft, fg: fintechColors.primary, border: 'rgba(110,214,255,0.28)' },
  warning: { bg: fintechColors.warningSoft, fg: fintechColors.warning, border: 'rgba(244,190,98,0.28)' },
  neutral: { bg: 'rgba(157,174,196,0.12)', fg: fintechColors.textMuted, border: 'rgba(157,174,196,0.18)' },
  danger: { bg: fintechColors.dangerSoft, fg: fintechColors.danger, border: 'rgba(255,122,122,0.28)' },
};

const noticeMap: Record<NoticeTone, { bg: string; fg: string; border: string; icon: IconName }> = {
  info: { bg: fintechColors.infoSoft, fg: fintechColors.primary, border: 'rgba(110,214,255,0.2)', icon: 'information-circle-outline' },
  success: { bg: fintechColors.successSoft, fg: fintechColors.success, border: 'rgba(55,199,135,0.2)', icon: 'checkmark-circle-outline' },
  warning: { bg: fintechColors.warningSoft, fg: fintechColors.warning, border: 'rgba(244,190,98,0.2)', icon: 'alert-circle-outline' },
  danger: { bg: fintechColors.dangerSoft, fg: fintechColors.danger, border: 'rgba(255,122,122,0.2)', icon: 'close-circle-outline' },
};

export function FintechScreenHeader({
  eyebrow,
  title,
  subtitle,
  right,
  style,
  titleStyle,
  subtitleStyle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerCopy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={[styles.title, titleStyle]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

export function FintechProgress({ step, total, label, style }: { step: number; total: number; label?: string; style?: StyleProp<ViewStyle> }) {
  const ratio = `${Math.min(step / Math.max(total, 1), 1) * 100}%`;
  return (
    <View style={style}>
      <View style={styles.progressTop}>
        <Text style={styles.progressText}>{label ?? `Step ${step} of ${total}`}</Text>
        <Text style={styles.progressText}>{step}/{total}</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: ratio as `${number}%` }]} />
      </View>
    </View>
  );
}

export function FintechHeroCard({ eyebrow, title, subtitle, status, children, style }: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  status?: ReactNode;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, styles.heroCard, style]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.heroTitle}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {status ? <View>{status}</View> : null}
      </View>
      {children}
    </View>
  );
}

export function FintechStatusPill({ icon, label, tone = 'neutral', style }: { icon?: IconName; label: string; tone?: PillTone; style?: StyleProp<ViewStyle> }) {
  const theme = pillMap[tone];
  return (
    <View style={[styles.pill, { backgroundColor: theme.bg, borderColor: theme.border }, style]}>
      {icon ? <Ionicons name={icon} size={14} color={theme.fg} /> : null}
      <Text style={[styles.pillText, { color: theme.fg }]}>{label}</Text>
    </View>
  );
}

export function FintechSectionCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function FintechSectionBlock({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <FintechSectionCard style={style}>{children}</FintechSectionCard>;
}

export function FintechSectionHeader({
  title,
  note,
  right,
  style,
  titleStyle,
  noteStyle,
}: {
  title: string;
  note?: string;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  noteStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.sectionTitle, titleStyle]}>{title}</Text>
        {note ? <Text style={[styles.sectionNote, noteStyle]}>{note}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function FintechSummaryTile({ label, value, emphasis, style }: { label: string; value: string; emphasis?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.tile, emphasis && styles.tileEmphasis, style]}>
      <Text style={[styles.tileLabel, emphasis && styles.tileLabelEmphasis]}>{label}</Text>
      <Text style={styles.tileValue}>{value}</Text>
    </View>
  );
}

export function FintechKeyValueRow({ label, value, valueTone = 'default', style }: { label: string; value: string; valueTone?: 'default' | 'muted' | 'primary' | 'success'; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.keyValueRow, style]}>
      <Text style={styles.keyValueLabel}>{label}</Text>
      <Text
        style={[
          styles.keyValueValue,
          valueTone === 'muted' && { color: fintechColors.textMuted },
          valueTone === 'primary' && { color: fintechColors.primary },
          valueTone === 'success' && { color: fintechColors.success },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export function FintechInfoRow(props: { label: string; value: string; valueTone?: 'default' | 'muted' | 'primary' | 'success'; style?: StyleProp<ViewStyle> }) {
  return <FintechKeyValueRow {...props} />;
}

type ButtonProps = {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  children?: ReactNode;
};

export function FintechPrimaryButton({ label, onPress, disabled, loading, style, textStyle, children }: ButtonProps) {
  return (
    <TouchableOpacity style={[styles.primaryButton, disabled && styles.disabled, style]} onPress={onPress} disabled={disabled || loading} activeOpacity={0.92}>
      {loading ? (
        <ActivityIndicator color={fintechColors.background} />
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

export function FintechSecondaryButton({ label, onPress, disabled, style, textStyle, children }: Omit<ButtonProps, 'loading'>) {
  return (
    <TouchableOpacity style={[styles.secondaryButton, disabled && styles.disabled, style]} onPress={onPress} disabled={disabled} activeOpacity={0.9}>
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

export function FintechChoiceCard({
  title,
  subtitle,
  icon,
  selected,
  trailing,
  onPress,
  style,
  titleStyle,
  subtitleStyle,
}: {
  title: string;
  subtitle?: string;
  icon?: IconName;
  selected?: boolean;
  trailing?: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
}) {
  return (
    <TouchableOpacity style={[styles.choiceCard, selected && styles.choiceCardSelected, style]} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.choiceLeft}>
        {icon ? (
          <View style={[styles.choiceIcon, selected && styles.choiceIconSelected]}>
            <Ionicons name={icon} size={20} color={selected ? fintechColors.primary : fintechColors.textMuted} />
          </View>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={[styles.choiceTitle, titleStyle]}>{title}</Text>
          {subtitle ? <Text style={[styles.choiceSubtitle, subtitleStyle]}>{subtitle}</Text> : null}
        </View>
      </View>
      {trailing ?? <View style={[styles.radio, selected && styles.radioSelected]}>{selected ? <View style={styles.radioDot} /> : null}</View>}
    </TouchableOpacity>
  );
}

export function FintechTextField({ label, hint, error, icon, right, containerStyle, ...inputProps }: TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
  icon?: IconName;
  right?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      <View style={[styles.field, error && { borderColor: fintechColors.danger }]}>
        {icon ? <Ionicons name={icon} size={18} color={fintechColors.textSubtle} /> : null}
        <TextInput {...inputProps} placeholderTextColor={fintechColors.textSubtle} style={[styles.fieldInput, inputProps.style]} />
        {right}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export function FintechInlineMessage({ tone = 'info', title, text, style }: { tone?: NoticeTone; title?: string; text: string; style?: StyleProp<ViewStyle> }) {
  const theme = noticeMap[tone];
  return (
    <View style={[styles.notice, { backgroundColor: theme.bg, borderColor: theme.border }, style]}>
      <Ionicons name={theme.icon} size={18} color={theme.fg} />
      <View style={{ flex: 1 }}>
        {title ? <Text style={[styles.noticeTitle, { color: theme.fg }]}>{title}</Text> : null}
        <Text style={styles.noticeText}>{text}</Text>
      </View>
    </View>
  );
}

export function FintechTrustRow({ icon, title, text, style }: { icon: IconName; title: string; text: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.trustRow, style]}>
      <View style={styles.trustIcon}><Ionicons name={icon} size={18} color={fintechColors.primary} /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.trustTitle}>{title}</Text>
        <Text style={styles.trustText}>{text}</Text>
      </View>
    </View>
  );
}

export function FintechFooterCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.footerCard, style]}>{children}</View>;
}

export function FintechStickyActionArea({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.stickyArea, style]}>{children}</View>;
}

export function FintechReceiptCard({ title, children, style }: { title?: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

export function FintechEmptyState({ icon, title, text, action, style }: { icon: IconName; title: string; text: string; action?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.empty, style]}>
      <View style={styles.emptyIcon}><Ionicons name={icon} size={24} color={fintechColors.primary} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
      {action}
    </View>
  );
}

export function FintechAmountHeroCard({
  label,
  amount,
  currency,
  helper,
  accent = 'primary',
  style,
  labelStyle,
  valueStyle,
  currencyStyle,
  helperStyle,
}: {
  label: string;
  amount: string;
  currency: string;
  helper?: string;
  accent?: 'primary' | 'success';
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
  currencyStyle?: StyleProp<TextStyle>;
  helperStyle?: StyleProp<TextStyle>;
}) {
  return (
    <View style={[styles.amountHero, accent === 'success' ? styles.amountHeroSuccess : styles.amountHeroPrimary, style]}>
      <Text style={[styles.amountHeroLabel, labelStyle]}>{label}</Text>
      <View style={styles.amountHeroRow}>
        <Text style={[styles.amountHeroValue, valueStyle]}>{amount}</Text>
        <View style={styles.amountHeroCurrency}>
          <Text style={[styles.amountHeroCurrencyText, currencyStyle]}>
            {currency}
          </Text>
        </View>
      </View>
      {helper ? (
        <Text style={[styles.amountHeroHelper, helperStyle]}>{helper}</Text>
      ) : null}
    </View>
  );
}

export function FintechPricingSummaryCard({ title, items, totalLabel, totalValue, footerNote, style }: {
  title?: string;
  items: Array<{ label: string; value: string; tone?: 'default' | 'muted' | 'primary' | 'success' }>;
  totalLabel?: string;
  totalValue?: string;
  footerNote?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={{ gap: 10 }}>
        {items.map((item) => (
          <FintechKeyValueRow key={`${item.label}-${item.value}`} label={item.label} value={item.value} valueTone={item.tone || 'default'} />
        ))}
      </View>
      {totalLabel && totalValue ? (
        <>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{totalLabel}</Text>
            <Text style={styles.totalValue}>{totalValue}</Text>
          </View>
        </>
      ) : null}
      {footerNote ? <Text style={styles.footerNote}>{footerNote}</Text> : null}
    </View>
  );
}

export function FintechRecipientRow({ title, subtitle, detail, provider, initials = 'RP', accentColor = fintechColors.primaryStrong, selected, onPress, style }: {
  title: string;
  subtitle: string;
  detail?: string;
  provider?: string;
  initials?: string;
  accentColor?: string;
  selected?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity style={[styles.recipientRow, selected && styles.choiceCardSelected, style]} onPress={onPress} activeOpacity={0.92}>
      <View style={[styles.avatar, { backgroundColor: accentColor }]}><Text style={styles.avatarText}>{initials}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.choiceTitle}>{title}</Text>
        <Text style={styles.choiceSubtitle}>{subtitle}</Text>
        {detail || provider ? <Text style={styles.recipientDetail}>{[detail, provider].filter(Boolean).join('  -  ')}</Text> : null}
      </View>
      <Ionicons name={selected ? 'checkmark-circle' : 'chevron-forward'} size={selected ? 20 : 18} color={selected ? fintechColors.primary : fintechColors.textSubtle} />
    </TouchableOpacity>
  );
}

export function FintechPinDots({ value, style }: { value: string[]; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.pinRow, style]}>
      {value.map((digit, index) => (
        <View key={index} style={[styles.pinBox, digit && styles.pinBoxFilled]}>{digit ? <View style={styles.pinDot} /> : null}</View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: fintechSpacing.sm },
  headerCopy: { flex: 1, gap: fintechSpacing.xs },
  eyebrow: { fontSize: fintechTypography.eyebrow, fontWeight: '700', color: fintechColors.primary, textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { fontSize: fintechTypography.hero, lineHeight: 26, fontWeight: '800', color: fintechColors.text },
  heroTitle: { fontSize: 18, lineHeight: 24, fontWeight: '800', color: fintechColors.text },
  subtitle: { fontSize: fintechTypography.body, lineHeight: 18, color: fintechColors.textMuted },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: 13, fontWeight: '600', color: fintechColors.textMuted },
  progressTrack: { height: 8, borderRadius: fintechRadius.pill, backgroundColor: fintechColors.surfaceAlt, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: fintechRadius.pill, backgroundColor: fintechColors.primary },
  card: { backgroundColor: fintechColors.surface, borderWidth: 1, borderColor: fintechColors.border, borderRadius: fintechRadius.lg, padding: fintechSpacing.md, gap: fintechSpacing.sm },
  heroCard: { padding: fintechSpacing.lg, shadowColor: fintechColors.shadow, shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.22, shadowRadius: 24, elevation: 6 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: fintechRadius.pill, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  pillText: { fontSize: 12, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: fintechSpacing.sm },
  sectionTitle: { fontSize: fintechTypography.title, fontWeight: '700', color: fintechColors.text },
  sectionNote: { fontSize: 12, lineHeight: 16, color: fintechColors.textMuted },
  tile: { flex: 1, padding: fintechSpacing.md, borderRadius: fintechRadius.md, borderWidth: 1, borderColor: fintechColors.border, backgroundColor: fintechColors.surfaceAlt, gap: 4 },
  tileEmphasis: { backgroundColor: fintechColors.primarySoft, borderColor: 'rgba(110,214,255,0.22)' },
  tileLabel: { fontSize: 11, fontWeight: '600', color: fintechColors.textMuted },
  tileLabelEmphasis: { color: '#C9F2FF' },
  tileValue: { fontSize: 16, fontWeight: '800', color: fintechColors.text },
  keyValueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: fintechSpacing.sm },
  keyValueLabel: { flex: 1, fontSize: 13, lineHeight: 18, color: fintechColors.textMuted },
  keyValueValue: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '700', color: fintechColors.text, textAlign: 'right' },
  primaryButton: { minHeight: 52, borderRadius: fintechRadius.md, backgroundColor: fintechColors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: fintechSpacing.lg, shadowColor: fintechColors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.22, shadowRadius: 16, elevation: 5 },
  primaryButtonText: { color: fintechColors.background, fontSize: 14, fontWeight: '800' },
  secondaryButton: { minHeight: 52, borderRadius: fintechRadius.md, backgroundColor: fintechColors.surfaceAlt, borderWidth: 1, borderColor: fintechColors.border, alignItems: 'center', justifyContent: 'center', paddingHorizontal: fintechSpacing.lg },
  secondaryButtonText: { color: fintechColors.text, fontSize: 13, fontWeight: '700' },
  disabled: { opacity: 1 },
  choiceCard: { minHeight: 72, borderRadius: fintechRadius.md, borderWidth: 1, borderColor: fintechColors.border, backgroundColor: fintechColors.surfaceAlt, padding: fintechSpacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: fintechSpacing.md },
  choiceCardSelected: { borderColor: fintechColors.primary, backgroundColor: fintechColors.primarySoft },
  choiceLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: fintechSpacing.md },
  choiceIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: fintechColors.surfaceStrong, alignItems: 'center', justifyContent: 'center' },
  choiceIconSelected: { backgroundColor: 'rgba(110,214,255,0.18)' },
  choiceTitle: { fontSize: 13, fontWeight: '800', color: fintechColors.text },
  choiceSubtitle: { fontSize: 11, lineHeight: 15, color: fintechColors.textMuted },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: fintechColors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: fintechColors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: fintechColors.primary },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: fintechColors.text, marginBottom: 6 },
  field: { minHeight: 52, borderRadius: fintechRadius.md, borderWidth: 1, borderColor: fintechColors.border, backgroundColor: fintechColors.surfaceAlt, paddingHorizontal: fintechSpacing.md, flexDirection: 'row', alignItems: 'center', gap: 10 },
  fieldInput: { flex: 1, fontSize: 14, color: fintechColors.text, paddingVertical: 0 },
  fieldHint: { marginTop: 6, fontSize: 11, color: fintechColors.textMuted },
  fieldError: { marginTop: 6, fontSize: 11, color: fintechColors.danger },
  notice: { borderRadius: fintechRadius.md, padding: fintechSpacing.md, flexDirection: 'row', gap: fintechSpacing.sm, borderWidth: 1 },
  noticeTitle: { fontSize: 11, fontWeight: '700' },
  noticeText: { fontSize: 11, lineHeight: 16, color: fintechColors.text },
  trustRow: { flexDirection: 'row', alignItems: 'flex-start', gap: fintechSpacing.md },
  trustIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: fintechColors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  trustTitle: { fontSize: 12, fontWeight: '700', color: fintechColors.text },
  trustText: { fontSize: 11, lineHeight: 16, color: fintechColors.textMuted },
  footerCard: { backgroundColor: fintechColors.surface, borderWidth: 1, borderColor: fintechColors.border, borderRadius: fintechRadius.lg, padding: fintechSpacing.md, gap: fintechSpacing.md, shadowColor: fintechColors.shadow, shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 2 },
  stickyArea: { backgroundColor: fintechColors.surface, borderTopWidth: 1, borderTopColor: fintechColors.border, paddingTop: fintechSpacing.md, gap: fintechSpacing.sm },
  empty: { alignItems: 'center', gap: fintechSpacing.sm, paddingVertical: fintechSpacing.xxl },
  emptyIcon: { width: 56, height: 56, borderRadius: 20, backgroundColor: fintechColors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: fintechColors.text },
  emptyText: { fontSize: 12, lineHeight: 16, color: fintechColors.textMuted, textAlign: 'center' },
  amountHero: { borderRadius: fintechRadius.xl, padding: fintechSpacing.lg, gap: fintechSpacing.sm, borderWidth: 1 },
  amountHeroPrimary: { backgroundColor: fintechColors.surfaceStrong, borderColor: 'rgba(110,214,255,0.24)' },
  amountHeroSuccess: { backgroundColor: 'rgba(55,199,135,0.12)', borderColor: 'rgba(55,199,135,0.24)' },
  amountHeroLabel: { fontSize: 12, fontWeight: '700', color: fintechColors.textMuted },
  amountHeroRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: fintechSpacing.md },
  amountHeroValue: { flex: 1, fontSize: 24, lineHeight: 28, fontWeight: '800', color: fintechColors.text },
  amountHeroCurrency: { minHeight: 42, borderRadius: 16, paddingHorizontal: fintechSpacing.md, alignItems: 'center', justifyContent: 'center', backgroundColor: fintechColors.background, borderWidth: 1, borderColor: fintechColors.border },
  amountHeroCurrencyText: { fontSize: 13, fontWeight: '800', color: fintechColors.text },
  amountHeroHelper: { fontSize: 12, lineHeight: 18, color: fintechColors.textMuted },
  divider: { height: 1, backgroundColor: fintechColors.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: fintechSpacing.md },
  totalLabel: { fontSize: 13, fontWeight: '700', color: fintechColors.text },
  totalValue: { fontSize: 18, fontWeight: '800', color: fintechColors.text },
  footerNote: { fontSize: 11, lineHeight: 16, color: fintechColors.textSubtle },
  recipientRow: { minHeight: 76, borderRadius: fintechRadius.md, borderWidth: 1, borderColor: fintechColors.border, backgroundColor: fintechColors.surface, padding: fintechSpacing.md, flexDirection: 'row', alignItems: 'center', gap: fintechSpacing.md },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  recipientDetail: { fontSize: 10, color: fintechColors.textSubtle },
  pinRow: { flexDirection: 'row', gap: 10 },
  pinBox: { width: 44, height: 52, borderRadius: 16, backgroundColor: fintechColors.surfaceAlt, borderWidth: 1, borderColor: fintechColors.border, alignItems: 'center', justifyContent: 'center' },
  pinBoxFilled: { borderColor: fintechColors.primary, backgroundColor: fintechColors.primarySoft },
  pinDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: fintechColors.primary },
});

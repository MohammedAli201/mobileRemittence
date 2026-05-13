import { Ionicons } from '@expo/vector-icons';
import React, { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
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
type ValueTone = 'default' | 'muted' | 'primary' | 'success' | 'danger';

export const fintechColors = {
  brand: '#0DAF78',
  primary: '#0DAF78',
  primaryStrong: '#0A7A56',
  primarySoft: '#E4F8F1',
  background: '#F2F6FA',
  backgroundMuted: '#EBF0F6',
  neutralBg: '#F7F9FC',
  surface: '#FFFFFF',
  neutralSurface: '#F8FAFC',
  surfaceAlt: '#F8FAFC',
  surfaceStrong: '#ECF1F7',
  text: '#0D1B2A',
  textMuted: '#2D4059',
  textSubtle: '#5C7A99',
  border: '#D4DFE9',
  borderStrong: '#B0C4D8',
  success: '#0DAF78',
  successSoft: '#E4F8F1',
  info: '#1D5BD8',
  infoSoft: '#E6EFFF',
  warning: '#C07D0A',
  warningSoft: '#FFF4D9',
  danger: '#C0392B',
  dangerSoft: '#FDECEC',
  shadow: '#0D1B2A',
};

export const fintechSpacing = { xxs: 4, xs: 6, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40, xxxl: 48 };
export const fintechRadius = { sm: 12, md: 16, lg: 20, xl: 28, pill: 999 };
export const fintechTypography = { eyebrow: 11, label: 12, body: 14, title: 17, hero: 28 };

const pillMap: Record<PillTone, { bg: string; fg: string; border: string }> = {
  success: { bg: fintechColors.successSoft, fg: fintechColors.success, border: '#BDE6D6' },
  info: { bg: fintechColors.infoSoft, fg: fintechColors.info, border: '#CFE0FF' },
  warning: { bg: fintechColors.warningSoft, fg: fintechColors.warning, border: '#F4D9A3' },
  neutral: { bg: fintechColors.neutralSurface, fg: fintechColors.textMuted, border: fintechColors.border },
  danger: { bg: fintechColors.dangerSoft, fg: fintechColors.danger, border: '#F3C5BF' },
};

const noticeMap: Record<NoticeTone, { bg: string; fg: string; border: string; icon: IconName }> = {
  info: { bg: fintechColors.infoSoft, fg: fintechColors.info, border: '#D7E6FF', icon: 'information-circle-outline' },
  success: { bg: fintechColors.successSoft, fg: fintechColors.success, border: '#C7EBDD', icon: 'checkmark-circle-outline' },
  warning: { bg: fintechColors.warningSoft, fg: fintechColors.warning, border: '#F0D6A7', icon: 'alert-circle-outline' },
  danger: { bg: fintechColors.dangerSoft, fg: fintechColors.danger, border: '#F2C7C2', icon: 'close-circle-outline' },
};

const valueToneMap: Record<ValueTone, string> = {
  default: fintechColors.text,
  muted: fintechColors.textMuted,
  primary: fintechColors.primaryStrong,
  success: fintechColors.success,
  danger: fintechColors.danger,
};

export function formatMoney(amount: number, currency: string, locale = 'en-US') {
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount);
  } catch {
    return `${safeAmount.toFixed(2)} ${currency || 'USD'}`;
  }
}

export function formatMoneyParts(amount: number, currency: string, locale = 'en-US') {
  const formatted = formatMoney(amount, currency, locale);

  try {
    const parts = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).formatToParts(Number.isFinite(Number(amount)) ? Number(amount) : 0);

    const symbol = parts.filter((part) => part.type === 'currency').map((part) => part.value).join('') || currency;
    const value = parts.filter((part) => part.type !== 'currency').map((part) => part.value).join('').trim();

    return { formatted, symbol, value };
  } catch {
    return { formatted, symbol: currency || 'USD', value: `${Number(amount || 0).toFixed(2)}` };
  }
}

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
        {subtitle ? <Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Text> : null}
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

export function FintechTrustBadge(props: { icon?: IconName; label: string; tone?: PillTone; style?: StyleProp<ViewStyle> }) {
  return <FintechStatusPill {...props} />;
}

export function FintechSectionCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function FintechSectionBlock({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <FintechSectionCard style={style}>{children}</FintechSectionCard>;
}

export function FintechReviewSectionCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <FintechSectionCard style={[styles.reviewSectionCard, style]}>{children}</FintechSectionCard>;
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

export function FintechKeyValueRow({ label, value, valueTone = 'default', style }: { label: string; value: string; valueTone?: ValueTone; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.keyValueRow, style]}>
      <Text style={styles.keyValueLabel}>{label}</Text>
      <Text style={[styles.keyValueValue, { color: valueToneMap[valueTone] }]}>
        {value}
      </Text>
    </View>
  );
}

export function FintechInfoRow(props: { label: string; value: string; valueTone?: ValueTone; style?: StyleProp<ViewStyle> }) {
  return <FintechKeyValueRow {...props} />;
}

export function FintechDetailList({
  items,
  style,
}: {
  items: Array<{ label: string; value: string; valueTone?: ValueTone }>;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.detailList, style]}>
      {items.map((item, index) => (
        <View key={`${item.label}-${item.value}-${index}`}>
          {index > 0 ? <View style={styles.divider} /> : null}
          <FintechKeyValueRow label={item.label} value={item.value} valueTone={item.valueTone || 'default'} style={index > 0 ? styles.detailListRow : undefined} />
        </View>
      ))}
    </View>
  );
}

export function FintechEditRow({
  label,
  value,
  onPress,
  style,
}: {
  label: string;
  value: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity style={[styles.editRow, style]} onPress={onPress} disabled={!onPress} activeOpacity={0.88}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.editRowLabel}>{label}</Text>
        <Text style={styles.editRowValue}>{value}</Text>
      </View>
      {onPress ? (
        <View style={styles.editAction}>
          <Text style={styles.editActionText}>Edit</Text>
          <Ionicons name="chevron-forward" size={16} color={fintechColors.textSubtle} />
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export function FintechMetaRow({
  items,
  style,
}: {
  items: Array<{ icon?: IconName; label: string }>;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.metaRow, style]}>
      {items.map((item) => (
        <View key={`${item.icon ?? 'label'}-${item.label}`} style={styles.metaItem}>
          {item.icon ? <Ionicons name={item.icon} size={14} color={fintechColors.textSubtle} /> : null}
          <Text style={styles.metaItemText}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function FintechExchangeRateRow({
  label,
  value,
  helper,
  style,
}: {
  label: string;
  value: string;
  helper?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.exchangeRow, style]}>
      <View style={styles.exchangeBadge}>
        <Ionicons name="swap-horizontal-outline" size={16} color={fintechColors.info} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.exchangeLabel}>{label}</Text>
        <Text style={styles.exchangeValue}>{value}</Text>
        {helper ? <Text style={styles.exchangeHelper}>{helper}</Text> : null}
      </View>
    </View>
  );
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
        <ActivityIndicator color={fintechColors.surface} />
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
            <Ionicons name={icon} size={20} color={selected ? fintechColors.primaryStrong : fintechColors.textMuted} />
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

export function FintechPaymentMethodCard(props: Parameters<typeof FintechChoiceCard>[0]) {
  return <FintechChoiceCard {...props} style={[styles.paymentMethodCard, props.style]} />;
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

export function FintechTrustNotice(props: { tone?: NoticeTone; title?: string; text: string; style?: StyleProp<ViewStyle> }) {
  return <FintechInlineMessage {...props} />;
}

export function FintechPricingConfidenceCard({
  title,
  text,
  style,
}: {
  title: string;
  text: string;
  style?: StyleProp<ViewStyle>;
}) {
  return <FintechTrustNotice tone="info" title={title} text={text} style={style} />;
}

export function FintechTrustRow({ icon, title, text, style }: { icon: IconName; title: string; text: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.trustRow, style]}>
      <View style={styles.trustIcon}><Ionicons name={icon} size={18} color={fintechColors.primaryStrong} /></View>
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
      <View style={styles.emptyIcon}><Ionicons name={icon} size={24} color={fintechColors.primaryStrong} /></View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{text}</Text>
      {action}
    </View>
  );
}

export function FintechAmount({
  amount,
  currency,
  locale,
  size = 'body',
  tone = 'default',
  align = 'left',
  style,
}: {
  amount: number;
  currency: string;
  locale?: string;
  size?: 'body' | 'title' | 'hero';
  tone?: ValueTone;
  align?: 'left' | 'center' | 'right';
  style?: StyleProp<ViewStyle>;
}) {
  const { symbol, value } = formatMoneyParts(amount, currency, locale);
  return (
    <View style={[styles.amountWrap, align === 'center' && styles.amountWrapCenter, align === 'right' && styles.amountWrapRight, style]}>
      <Text style={[
        styles.amountSymbol,
        size === 'title' && styles.amountSymbolTitle,
        size === 'hero' && styles.amountSymbolHero,
        { color: valueToneMap[tone] },
      ]}>
        {symbol}
      </Text>
      <Text style={[
        styles.amountValueText,
        size === 'title' && styles.amountValueTitle,
        size === 'hero' && styles.amountValueHero,
        { color: valueToneMap[tone] },
      ]}>
        {value}
      </Text>
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
  helperStyle,
}: {
  label: string;
  amount: string;
  currency: string;
  helper?: string;
  accent?: 'primary' | 'success';
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  helperStyle?: StyleProp<TextStyle>;
}) {
  const numericAmount = Number(amount || 0);
  return (
    <View style={[styles.amountHero, accent === 'success' ? styles.amountHeroSuccess : styles.amountHeroPrimary, style]}>
      <Text style={[styles.amountHeroLabel, labelStyle]}>{label}</Text>
      <FintechAmount amount={numericAmount} currency={currency} size="hero" />
      {helper ? <Text style={[styles.amountHeroHelper, helperStyle]}>{helper}</Text> : null}
    </View>
  );
}

export function FintechPricingSummaryCard({ title, items, totalLabel, totalValue, footerNote, style }: {
  title?: string;
  items: Array<{ label: string; value: string; tone?: ValueTone }>;
  totalLabel?: string;
  totalValue?: string;
  footerNote?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.card, style]}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      <View style={styles.detailList}>
        {items.map((item, index) => (
          <View key={`${item.label}-${item.value}-${index}`}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <FintechKeyValueRow label={item.label} value={item.value} valueTone={item.tone || 'default'} style={index > 0 ? styles.detailListRow : undefined} />
          </View>
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

export function FintechTransactionSummaryCard({
  title,
  items,
  totalLabel,
  totalValue,
  footerNote,
  style,
}: {
  title?: string;
  items: Array<{ label: string; value: string; valueTone?: ValueTone }>;
  totalLabel?: string;
  totalValue?: string;
  footerNote?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <FintechPricingSummaryCard
      title={title}
      items={items.map((item) => ({ label: item.label, value: item.value, tone: item.valueTone || 'default' }))}
      totalLabel={totalLabel}
      totalValue={totalValue}
      footerNote={footerNote}
      style={[styles.transactionSummaryCard, style]}
    />
  );
}

export function FintechPaymentRecapCard(props: Parameters<typeof FintechTransactionSummaryCard>[0]) {
  return <FintechTransactionSummaryCard {...props} style={[styles.paymentRecapCard, props.style]} />;
}

export function FintechReviewList(props: Parameters<typeof FintechDetailList>[0]) {
  return <FintechDetailList {...props} />;
}

export function FintechProcessorBadge({ label, style }: { label: string; style?: StyleProp<ViewStyle> }) {
  return <FintechTrustBadge icon="lock-closed-outline" label={label} tone="info" style={style} />;
}

export function FintechPaymentDisclosure({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.paymentDisclosure, style]}>{text}</Text>;
}

export function FintechComplianceField({
  label,
  value,
  helper,
  onPress,
  style,
}: {
  label: string;
  value: string;
  helper?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.complianceField, style]}>
      <View style={styles.complianceHeader}>
        <Text style={styles.complianceLabel}>{label}</Text>
        {helper ? <Text style={styles.complianceHelper}>{helper}</Text> : null}
      </View>
      <TouchableOpacity style={styles.complianceAction} onPress={onPress} disabled={!onPress} activeOpacity={0.88}>
        <Text style={styles.complianceValue}>{value}</Text>
        <Ionicons name="chevron-down" size={18} color={fintechColors.textSubtle} />
      </TouchableOpacity>
    </View>
  );
}

export function FintechRecipientRow({ title, subtitle, detail, provider, initials = 'RP', accentColor = fintechColors.primaryStrong, selected, onPress, style, titleStyle, subtitleStyle, detailStyle }: {
  title: string;
  subtitle: string;
  detail?: string;
  provider?: string;
  initials?: string;
  accentColor?: string;
  selected?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  detailStyle?: StyleProp<TextStyle>;
}) {
  return (
    <TouchableOpacity style={[styles.recipientRow, selected && styles.choiceCardSelected, style]} onPress={onPress} activeOpacity={0.92}>
      <View style={[styles.avatar, { backgroundColor: accentColor }]}><Text style={styles.avatarText}>{initials}</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.choiceTitle, titleStyle]}>{title}</Text>
        <Text style={[styles.choiceSubtitle, subtitleStyle]}>{subtitle}</Text>
        {detail || provider ? <Text style={[styles.recipientDetail, detailStyle]}>{[detail, provider].filter(Boolean).join(' • ')}</Text> : null}
      </View>
      <Ionicons name={selected ? 'checkmark-circle' : 'chevron-forward'} size={selected ? 20 : 18} color={selected ? fintechColors.primaryStrong : fintechColors.textSubtle} />
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

export function FintechAuthStatusBadge({ label, style }: { label: string; style?: StyleProp<ViewStyle> }) {
  return <FintechTrustBadge icon="shield-checkmark-outline" label={label} tone="neutral" style={style} />;
}

/**
 * Transfer history row — matches the rich competitor pattern:
 * [flag avatar] [name / service · date] [amount / repeat button]
 */
export function FintechTransferRow({
  name,
  meta,
  service,
  amount,
  initials,
  accentColor,
  flagSource,
  onPress,
  onRepeat,
  divider,
  style,
}: {
  name: string;
  meta?: string;
  service?: string;
  amount: string;
  initials: string;
  accentColor?: string;
  flagSource?: number;
  onPress: () => void;
  onRepeat?: () => void;
  divider?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <TouchableOpacity
      style={[trStyles.row, divider && trStyles.rowDivider, style]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={[trStyles.avatar, { backgroundColor: accentColor ?? fintechColors.primaryStrong }]}>
        {flagSource !== undefined ? (
          <Image source={flagSource} style={trStyles.flagImg} />
        ) : (
          <Text style={trStyles.avatarText}>{initials}</Text>
        )}
      </View>

      <View style={trStyles.body}>
        <Text style={trStyles.name} numberOfLines={1}>{name}</Text>
        <View style={trStyles.metaRow}>
          {service ? (
            <View style={trStyles.serviceBadge}>
              <Text style={trStyles.serviceText}>{service}</Text>
            </View>
          ) : null}
          {meta ? (
            <Text style={trStyles.meta} numberOfLines={1}>{meta}</Text>
          ) : null}
        </View>
      </View>

      <View style={trStyles.right}>
        <Text style={trStyles.amount}>{amount}</Text>
        {onRepeat ? (
          <TouchableOpacity
            style={trStyles.repeatBtn}
            onPress={onRepeat}
            activeOpacity={0.82}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="refresh-outline" size={12} color={fintechColors.primaryStrong} />
            <Text style={trStyles.repeatText}>Repeat</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const trStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: fintechSpacing.md,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: fintechColors.border,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  flagImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  body: {
    flex: 1,
    gap: 5,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: fintechColors.text,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  serviceBadge: {
    borderRadius: fintechRadius.pill,
    backgroundColor: fintechColors.neutralSurface,
    borderWidth: 1,
    borderColor: fintechColors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  serviceText: {
    fontSize: 11,
    fontWeight: '700',
    color: fintechColors.textMuted,
  },
  meta: {
    fontSize: 12,
    color: fintechColors.textSubtle,
    flexShrink: 1,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
    flexShrink: 0,
  },
  amount: {
    fontSize: 15,
    fontWeight: '800',
    color: fintechColors.text,
  },
  repeatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: fintechRadius.pill,
    backgroundColor: fintechColors.primarySoft,
    borderWidth: 1,
    borderColor: '#C7EBDD',
  },
  repeatText: {
    fontSize: 11,
    fontWeight: '700',
    color: fintechColors.primaryStrong,
  },
});

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: fintechSpacing.sm },
  headerCopy: { flex: 1, gap: fintechSpacing.xs },
  eyebrow: { fontSize: fintechTypography.eyebrow, fontWeight: '800', color: fintechColors.primaryStrong, textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { fontSize: fintechTypography.hero, lineHeight: 34, fontWeight: '800', color: fintechColors.text },
  heroTitle: { fontSize: 22, lineHeight: 28, fontWeight: '800', color: fintechColors.text },
  subtitle: { fontSize: fintechTypography.body, lineHeight: 21, color: fintechColors.textMuted },
  progressTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: 13, fontWeight: '700', color: fintechColors.textMuted },
  progressTrack: { height: 8, borderRadius: fintechRadius.pill, backgroundColor: fintechColors.surfaceStrong, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: fintechRadius.pill, backgroundColor: fintechColors.primary },
  card: { backgroundColor: fintechColors.surface, borderWidth: 1, borderColor: fintechColors.border, borderRadius: fintechRadius.lg, padding: fintechSpacing.md, gap: fintechSpacing.sm, shadowColor: fintechColors.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 1 },
  reviewSectionCard: { backgroundColor: fintechColors.neutralSurface },
  heroCard: { padding: fintechSpacing.lg, shadowColor: '#0A1525', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: fintechRadius.pill, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1 },
  pillText: { fontSize: 12, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: fintechSpacing.sm },
  sectionTitle: { fontSize: fintechTypography.title, lineHeight: 22, fontWeight: '800', color: fintechColors.text },
  sectionNote: { fontSize: 13, lineHeight: 18, color: fintechColors.textMuted },
  tile: { flex: 1, padding: fintechSpacing.md, borderRadius: fintechRadius.md, borderWidth: 1, borderColor: fintechColors.border, backgroundColor: fintechColors.surfaceAlt, gap: 4 },
  tileEmphasis: { backgroundColor: fintechColors.primarySoft, borderColor: '#C7EBDD' },
  tileLabel: { fontSize: 12, fontWeight: '700', color: fintechColors.textMuted },
  tileLabelEmphasis: { color: fintechColors.primaryStrong },
  tileValue: { fontSize: 18, fontWeight: '800', color: fintechColors.text },
  keyValueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: fintechSpacing.md },
  keyValueLabel: { flex: 1, fontSize: 14, lineHeight: 20, color: fintechColors.textMuted },
  keyValueValue: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '700', textAlign: 'right' },
  detailList: { gap: fintechSpacing.sm },
  detailListRow: { paddingTop: fintechSpacing.sm },
  editRow: { minHeight: 64, borderRadius: fintechRadius.md, borderWidth: 1, borderColor: fintechColors.border, backgroundColor: fintechColors.surfaceAlt, paddingHorizontal: fintechSpacing.md, paddingVertical: fintechSpacing.sm, flexDirection: 'row', alignItems: 'center', gap: fintechSpacing.md },
  editRowLabel: { fontSize: 12, fontWeight: '700', color: fintechColors.textSubtle, textTransform: 'uppercase', letterSpacing: 0.5 },
  editRowValue: { fontSize: 15, lineHeight: 21, fontWeight: '700', color: fintechColors.text },
  editAction: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  editActionText: { fontSize: 13, fontWeight: '700', color: fintechColors.textMuted },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: fintechSpacing.sm },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: fintechSpacing.xs, paddingHorizontal: fintechSpacing.sm, paddingVertical: fintechSpacing.xs, borderRadius: fintechRadius.pill, backgroundColor: fintechColors.neutralSurface, borderWidth: 1, borderColor: fintechColors.border },
  metaItemText: { fontSize: 12, fontWeight: '700', color: fintechColors.textMuted },
  exchangeRow: { flexDirection: 'row', alignItems: 'center', gap: fintechSpacing.md, borderRadius: fintechRadius.md, borderWidth: 1, borderColor: fintechColors.border, backgroundColor: fintechColors.neutralSurface, padding: fintechSpacing.md },
  exchangeBadge: { width: 38, height: 38, borderRadius: 12, backgroundColor: fintechColors.infoSoft, borderWidth: 1, borderColor: '#D7E6FF', alignItems: 'center', justifyContent: 'center' },
  exchangeLabel: { fontSize: 12, fontWeight: '800', color: fintechColors.textSubtle, textTransform: 'uppercase', letterSpacing: 0.5 },
  exchangeValue: { fontSize: 15, lineHeight: 21, fontWeight: '800', color: fintechColors.text },
  exchangeHelper: { fontSize: 12, lineHeight: 17, color: fintechColors.textMuted, marginTop: 2 },
  primaryButton: { minHeight: 56, borderRadius: fintechRadius.lg, backgroundColor: fintechColors.primary, alignItems: 'center', justifyContent: 'center', paddingHorizontal: fintechSpacing.lg, shadowColor: '#056B47', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.28, shadowRadius: 14, elevation: 6 },
  primaryButtonText: { color: fintechColors.surface, fontSize: 15, fontWeight: '800', letterSpacing: 0.2 },
  secondaryButton: { minHeight: 54, borderRadius: fintechRadius.lg, backgroundColor: fintechColors.surfaceAlt, borderWidth: 1.5, borderColor: fintechColors.border, alignItems: 'center', justifyContent: 'center', paddingHorizontal: fintechSpacing.lg },
  secondaryButtonText: { color: fintechColors.text, fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.55 },
  choiceCard: { minHeight: 78, borderRadius: fintechRadius.md, borderWidth: 1, borderColor: fintechColors.border, backgroundColor: fintechColors.surfaceAlt, padding: fintechSpacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: fintechSpacing.md },
  paymentMethodCard: { minHeight: 84 },
  choiceCardSelected: { borderColor: fintechColors.primary, backgroundColor: fintechColors.primarySoft },
  choiceLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: fintechSpacing.md },
  choiceIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: fintechColors.surfaceStrong, alignItems: 'center', justifyContent: 'center' },
  choiceIconSelected: { backgroundColor: fintechColors.surface },
  choiceTitle: { fontSize: 15, fontWeight: '800', color: fintechColors.text },
  choiceSubtitle: { fontSize: 13, lineHeight: 18, color: fintechColors.textMuted },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: fintechColors.borderStrong, alignItems: 'center', justifyContent: 'center' },
  radioSelected: { borderColor: fintechColors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: fintechColors.primary },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: fintechColors.text, marginBottom: 6 },
  field: { minHeight: 54, borderRadius: fintechRadius.md, borderWidth: 1, borderColor: fintechColors.border, backgroundColor: fintechColors.surfaceAlt, paddingHorizontal: fintechSpacing.md, flexDirection: 'row', alignItems: 'center', gap: 10 },
  fieldInput: { flex: 1, fontSize: 15, color: fintechColors.text, paddingVertical: 0 },
  fieldHint: { marginTop: 6, fontSize: 12, color: fintechColors.textMuted },
  fieldError: { marginTop: 6, fontSize: 12, color: fintechColors.danger },
  notice: { borderRadius: fintechRadius.md, padding: fintechSpacing.md, flexDirection: 'row', gap: fintechSpacing.sm, borderWidth: 1 },
  noticeTitle: { fontSize: 12, fontWeight: '800' },
  noticeText: { fontSize: 13, lineHeight: 19, color: fintechColors.textMuted },
  trustRow: { flexDirection: 'row', alignItems: 'flex-start', gap: fintechSpacing.md },
  trustIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: fintechColors.infoSoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#CFE0FF' },
  trustTitle: { fontSize: 13, fontWeight: '800', color: fintechColors.text },
  trustText: { fontSize: 12, lineHeight: 18, color: fintechColors.textMuted },
  footerCard: { backgroundColor: fintechColors.surface, borderWidth: 1, borderColor: fintechColors.border, borderRadius: fintechRadius.lg, padding: fintechSpacing.md, gap: fintechSpacing.md, shadowColor: fintechColors.shadow, shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  stickyArea: { backgroundColor: fintechColors.surface, borderTopWidth: 1, borderTopColor: fintechColors.border, paddingTop: fintechSpacing.md, gap: fintechSpacing.sm },
  empty: { alignItems: 'center', gap: fintechSpacing.sm, paddingVertical: fintechSpacing.xxl },
  emptyIcon: { width: 56, height: 56, borderRadius: 20, backgroundColor: fintechColors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: fintechColors.text },
  emptyText: { fontSize: 13, lineHeight: 19, color: fintechColors.textMuted, textAlign: 'center' },
  amountWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },
  amountWrapCenter: { justifyContent: 'center' },
  amountWrapRight: { justifyContent: 'flex-end' },
  amountSymbol: { fontSize: 14, lineHeight: 18, fontWeight: '800' },
  amountSymbolTitle: { fontSize: 16, lineHeight: 20 },
  amountSymbolHero: { fontSize: 18, lineHeight: 24 },
  amountValueText: { fontSize: 18, lineHeight: 22, fontWeight: '800' },
  amountValueTitle: { fontSize: 24, lineHeight: 28 },
  amountValueHero: { fontSize: 32, lineHeight: 38 },
  amountHero: { borderRadius: fintechRadius.xl, padding: fintechSpacing.lg, gap: fintechSpacing.sm, borderWidth: 1 },
  amountHeroPrimary: { backgroundColor: fintechColors.neutralSurface, borderColor: fintechColors.border },
  amountHeroSuccess: { backgroundColor: fintechColors.successSoft, borderColor: '#C7EBDD' },
  amountHeroLabel: { fontSize: 12, fontWeight: '800', color: fintechColors.textSubtle, textTransform: 'uppercase', letterSpacing: 0.6 },
  amountHeroHelper: { fontSize: 13, lineHeight: 18, color: fintechColors.textMuted },
  divider: { height: 1, backgroundColor: fintechColors.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: fintechSpacing.md },
  totalLabel: { fontSize: 14, fontWeight: '800', color: fintechColors.text },
  totalValue: { fontSize: 20, fontWeight: '800', color: fintechColors.text },
  footerNote: { fontSize: 12, lineHeight: 18, color: fintechColors.textMuted },
  transactionSummaryCard: { backgroundColor: fintechColors.surface },
  paymentRecapCard: { backgroundColor: fintechColors.neutralSurface },
  paymentDisclosure: { fontSize: 12, lineHeight: 18, color: fintechColors.textMuted, textAlign: 'center' },
  complianceField: { gap: fintechSpacing.sm },
  complianceHeader: { gap: 2 },
  complianceLabel: { fontSize: 12, fontWeight: '800', color: fintechColors.textSubtle, textTransform: 'uppercase', letterSpacing: 0.5 },
  complianceHelper: { fontSize: 12, lineHeight: 17, color: fintechColors.textMuted },
  complianceAction: { minHeight: 52, borderRadius: fintechRadius.md, borderWidth: 1, borderColor: fintechColors.border, backgroundColor: fintechColors.surfaceAlt, paddingHorizontal: fintechSpacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: fintechSpacing.sm },
  complianceValue: { flex: 1, fontSize: 15, lineHeight: 21, fontWeight: '700', color: fintechColors.text },
  recipientRow: { minHeight: 76, borderRadius: fintechRadius.md, borderWidth: 1, borderColor: fintechColors.border, backgroundColor: fintechColors.surface, padding: fintechSpacing.md, flexDirection: 'row', alignItems: 'center', gap: fintechSpacing.md },
  avatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  recipientDetail: { fontSize: 12, lineHeight: 17, color: fintechColors.textSubtle },
  pinRow: { flexDirection: 'row', gap: 10 },
  pinBox: { width: 44, height: 52, borderRadius: 16, backgroundColor: fintechColors.surfaceAlt, borderWidth: 1, borderColor: fintechColors.border, alignItems: 'center', justifyContent: 'center' },
  pinBoxFilled: { borderColor: fintechColors.primary, backgroundColor: fintechColors.primarySoft },
  pinDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: fintechColors.primaryStrong },
});

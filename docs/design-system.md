# Fintech Design System

This app uses a small, strict UI system to keep spacing, typography, and layout consistent across every screen.

## Tokens

**Spacing** (`fintechSpacing`)
- `xxs: 4`
- `xs: 6`
- `sm: 8`
- `md: 16`
- `lg: 24`
- `xl: 32`
- `xxl: 40`
- `xxxl: 48`

**Radius** (`fintechRadius`)
- `sm: 12`
- `md: 16`
- `lg: 20`
- `xl: 28`
- `pill: 999`

**Typography** (`fintechTypography`)
- `eyebrow: 11`
- `label: 12`
- `body: 14`
- `title: 16`
- `hero: 26`

**Colors** (`fintechColors`)
- Defined in `components/ui/fintech.tsx`. Use only these values for UI surfaces, text, borders, and semantic states.

## Layout Wrappers (Required)

Use these helpers from `components/ui/layout.tsx`:

- `Screen`  
  For fixed-height screens with no keyboard inputs.

- `ScrollScreen`  
  For long content that should scroll.

- `KeyboardScrollScreen`  
  For any screen with inputs.

These wrappers apply consistent:
- Safe area insets
- Horizontal padding
- Vertical rhythm
- Keyboard handling

Do not nest additional `SafeAreaView` or `KeyboardAvoidingView` inside screens unless a component has a unique requirement (e.g., onboarding carousel).

## Core UI Primitives

Use the fintech UI primitives from `components/ui/fintech.tsx`:

- Buttons: `FintechPrimaryButton`, `FintechSecondaryButton`
- Cards: `FintechSectionCard`, `FintechFooterCard`, `FintechReceiptCard`
- Inputs: `FintechTextField`
- Status: `FintechStatusPill`, `FintechInlineMessage`
- Summaries: `FintechPricingSummaryCard`, `FintechKeyValueRow`
- Headers: `FintechScreenHeader`, `FintechSectionHeader`

## Required Layout Rules

1. **No arbitrary spacing values**
   - Use `fintechSpacing` for `gap`, `padding`, and margins.

2. **No absolute positioning for critical CTAs**
   - CTAs must be part of normal layout flow.

3. **Safe area compliance**
   - Bottom content must sit above the home indicator via `Screen` padding.

4. **Forms must scroll**
   - Use `KeyboardScrollScreen` for all input flows.

5. **Consistent rhythm**
   - Use `fintechSpacing` for section gaps.
   - Use `FintechScreenHeader` for titles and subtitles.

## Example

```tsx
import { ScrollScreen } from '../components/ui/layout';
import { FintechScreenHeader, FintechPrimaryButton, fintechSpacing } from '../components/ui/fintech';

export default function Example() {
  return (
    <ScrollScreen contentStyle={{ paddingTop: fintechSpacing.sm }}>
      <FintechScreenHeader title="Screen title" subtitle="Short helper text." />
      <FintechPrimaryButton label="Continue" onPress={() => {}} />
    </ScrollScreen>
  );
}
```

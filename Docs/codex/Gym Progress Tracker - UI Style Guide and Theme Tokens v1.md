# Gym Progress Tracker — UI Style Guide and Theme Tokens v1

**Document Status:** Draft v1  
**Source Documents:** Requirement Document, System Design, UI Flow and Screen Design, Component Design  
**Target Version:** Version 1 MVP  
**Target Platform:** Android standalone APK  
**Theme Name:** Warm Iron Light  
**Date:** 2026-07-06

---

## 1. Purpose

This document defines the visual style guide and theme tokens for **Gym Progress Tracker v1**.

The goal is to keep the app clean, focused, and comfortable to use during real gym sessions without becoming visually noisy.

This document defines:

- Color tokens.
- Typography rules.
- Spacing rules.
- Border radius rules.
- Button styles.
- Input styles.
- Card styles.
- Dialog styles.
- Navigation styling.
- Status colors.
- Accessibility rules.
- Codex implementation guardrails.

This document does not replace the UI Flow or Component Design. It gives the implementation a consistent visual system.

---

## 2. Visual Direction

## 2.1 Theme identity

```text
Theme name: Warm Iron Light
```

The visual identity should feel:

- Light.
- Warm.
- Minimal.
- Practical.
- Gym-adjacent without looking aggressive.
- Focused on utility, not social-media fitness branding.

## 2.2 Design goals

1. **Fast readability during workouts**  
   Text, inputs, and buttons must be easy to read quickly while training.

2. **Low visual noise**  
   The app should not use many decorative colors.

3. **Clear action hierarchy**  
   Primary actions such as **Start Workout**, **Continue Workout**, **Add Set**, and **Save** should be obvious.

4. **Safe destructive states**  
   Delete, discard, and import-replace actions must be visually distinct.

5. **Android-friendly layout**  
   Buttons and inputs should have comfortable touch targets.

---

## 3. Color System

## 3.1 Core palette

The core palette uses four main colors.

| Token | Hex | Usage |
|---|---:|---|
| `background` | `#FAF7F2` | Main app background. |
| `surface` | `#FFFCF7` | Cards, inputs, dialogs, panels. |
| `textPrimary` | `#1C1917` | Main text and high-emphasis labels. |
| `primary` | `#B45309` | Main actions such as Start, Continue, Add Set, Save. |

### Core palette rules

```text
Do not use pure white #FFFFFF for surfaces.
Do not use pure black #000000 for text.
Do not use blue as the primary color.
Do not add decorative accent colors.
```

Reason:

- Pure white can feel harsh on phone screens.
- Pure black creates overly sharp contrast on warm light backgrounds.
- Blue primary can make the app feel like a default template.
- A limited palette keeps the workout screen focused.

---

## 3.2 Supporting neutral tokens

Supporting neutrals are allowed because they are part of the UI structure, not additional brand colors.

| Token | Hex | Usage |
|---|---:|---|
| `surfaceMuted` | `#F3EDE4` | Disabled backgrounds, subtle grouped sections. |
| `border` | `#E7DED3` | Input borders, card borders, dividers. |
| `textSecondary` | `#57534E` | Helper text, subtitles, secondary labels. |
| `textMuted` | `#78716C` | Metadata, timestamps, less important information. |

---

## 3.3 Status colors

Status colors should be used only when the UI state requires them.

| Token | Hex | Usage |
|---|---:|---|
| `success` | `#16A34A` | Saved, export success, completed action feedback. |
| `danger` | `#DC2626` | Delete, discard, destructive import. |
| `warning` | `#D97706` | Stale workout, caution, import warning. |

### Status color rules

```text
Use success only for success feedback.
Use danger only for destructive actions and errors.
Use warning only for caution states.
Do not use status colors as decoration.
```

---

## 3.4 Derived color usage

| UI Element | Recommended Color |
|---|---|
| App background | `background` |
| Cards | `surface` |
| Elevated card sections | `surface` with border |
| Muted sections | `surfaceMuted` |
| Main text | `textPrimary` |
| Helper text | `textSecondary` |
| Metadata | `textMuted` |
| Borders/dividers | `border` |
| Primary button background | `primary` |
| Primary button text | `#FFFCF7` |
| Danger button background | `danger` |
| Warning badge text/background | `warning` with light warm background |
| Success text/badge | `success` |

Note: `#FFFCF7` may be used as text on dark/filled buttons because it is already the approved surface color, not pure white.

---

## 4. Theme Token Structure

Codex should implement theme tokens in a centralized file.

Recommended path:

```text
src/shared/theme/theme.ts
```

Recommended structure:

```ts
export const colors = {
  background: '#FAF7F2',
  surface: '#FFFCF7',
  surfaceMuted: '#F3EDE4',
  border: '#E7DED3',

  textPrimary: '#1C1917',
  textSecondary: '#57534E',
  textMuted: '#78716C',

  primary: '#B45309',
  success: '#16A34A',
  danger: '#DC2626',
  warning: '#D97706',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '700',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
  },
} as const;

export const theme = {
  colors,
  spacing,
  radii,
  typography,
} as const;

export type AppTheme = typeof theme;
```

---

## 5. Typography

## 5.1 Font choice

Use the default system font for v1.

Reason:

- Faster implementation.
- Better Android compatibility.
- No custom font loading complexity.
- Lower risk of layout shift.

Future versions may add custom fonts, but v1 should prioritize reliability.

## 5.2 Typography scale

| Role | Size | Line Height | Weight | Usage |
|---|---:|---:|---:|---|
| `title` | 24 | 32 | 700 | Screen titles, app title. |
| `sectionTitle` | 18 | 26 | 700 | Card titles, section headers. |
| `body` | 16 | 24 | 400 | Normal text and form labels. |
| `bodyStrong` | 16 | 24 | 600 | Important values, set rows. |
| `caption` | 13 | 18 | 400 | Helper text, metadata, timestamps. |

## 5.3 Typography rules

```text
Use textPrimary for main readable text.
Use textSecondary for helper text.
Use textMuted for timestamps and metadata.
Avoid tiny text during workout logging.
Do not use many font sizes.
```

---

## 6. Spacing

## 6.1 Spacing scale

| Token | Value | Usage |
|---|---:|---|
| `xs` | 4 | Tight gaps, icon/text gap. |
| `sm` | 8 | Small internal spacing. |
| `md` | 12 | Input padding, compact card spacing. |
| `lg` | 16 | Main screen/card padding. |
| `xl` | 24 | Section spacing. |
| `2xl` | 32 | Large screen separation. |

## 6.2 Screen padding

Default screen horizontal padding:

```text
16px
```

Use larger spacing only when it improves readability.

---

## 7. Border Radius and Elevation

## 7.1 Radius scale

| Token | Value | Usage |
|---|---:|---|
| `sm` | 8 | Small chips, compact tags. |
| `md` | 12 | Inputs and small cards. |
| `lg` | 16 | Main cards and dialogs. |
| `pill` | 999 | Pills and rounded chips. |

## 7.2 Elevation rule

Prefer borders over heavy shadows.

Reason:

- The app should feel clean and practical.
- Heavy shadows can look noisy on light warm backgrounds.
- Borders are easier to keep consistent across Android devices.

Recommended card style:

```ts
{
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: radii.lg,
  padding: spacing.lg,
}
```

Use subtle shadow only for dialogs or floating elements if needed.

---

## 8. Buttons

## 8.1 Button variants

| Variant | Background | Text | Usage |
|---|---|---|---|
| `primary` | `primary` | `surface` | Start, Continue, Add Set, Save. |
| `secondary` | `surfaceMuted` | `textPrimary` | Add Exercise, Export, secondary actions. |
| `danger` | `danger` | `surface` | Delete, Discard, Import Replace. |
| `ghost` | transparent | `primary` or `textPrimary` | Cancel, text actions, menus. |

## 8.2 Button rules

```text
Primary actions should be visually obvious.
Danger actions must not look like normal primary actions.
Disabled buttons should reduce opacity and avoid strong color.
Buttons must not call onPress while disabled.
Loading buttons should show loading state and ignore repeated taps.
```

## 8.3 Touch target

Minimum button height:

```text
44px
```

Recommended main action height:

```text
48px
```

---

## 9. Inputs

## 9.1 Text input style

Recommended default style:

```ts
{
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: radii.md,
  color: colors.textPrimary,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  minHeight: 44,
}
```

## 9.2 Input states

| State | Style |
|---|---|
| Default | Border `border`, background `surface`. |
| Focused | Border `primary`. |
| Error | Border `danger`, helper text `danger`. |
| Disabled | Background `surfaceMuted`, text `textMuted`. |

## 9.3 Workout set inputs

Set input fields must be optimized for fast numeric entry.

Rules:

```text
Weight input uses numeric keyboard.
Reps input uses numeric keyboard.
Reps field should stay empty after successful Add Set.
Weight field may hydrate from autofill rules.
Do not update global state on every keystroke.
```

---

## 10. Cards

## 10.1 Main card style

Use cards for:

- Active workout summary.
- Stale workout warning.
- Exercise blocks.
- Bodyweight summary.
- Backup action panels.

Recommended card style:

```ts
{
  backgroundColor: colors.surface,
  borderColor: colors.border,
  borderWidth: 1,
  borderRadius: radii.lg,
  padding: spacing.lg,
}
```

## 10.2 Stale workout card

Stale workout cards should use warning color sparingly.

Recommended:

```text
Card background: surface
Border: warning or border
Warning text/icon: warning
Primary action: Finish Workout if sets exist
Danger action: Discard Workout
```

Do not make the whole card bright yellow.

---

## 11. Dialogs

## 11.1 Confirm dialog style

Use dialogs for destructive or important confirmations.

Style:

```text
Background: surface
Title: textPrimary
Message: textSecondary
Confirm destructive button: danger
Normal confirm button: primary
Cancel button: ghost or secondary
```

Required dialog use cases:

- Discard workout.
- Delete workout.
- Delete exercise block.
- Delete set.
- Delete body record.
- Replace body record date collision.
- Import backup replace confirmation.

---

## 12. Navigation Styling

## 12.1 Bottom tabs

Recommended style:

```text
Tab bar background: surface
Active icon/text: primary
Inactive icon/text: textMuted
Top border: border
```

## 12.2 Headers

Recommended style:

```text
Header background: background
Title: textPrimary
Back/menu icons: textPrimary
```

Avoid large colored headers in v1.

---

## 13. Status and Feedback Components

## 13.1 Success state

Use `success` for:

- Backup exported successfully.
- Backup imported successfully.
- Saved confirmation if shown.

Do not use success color for normal primary buttons.

## 13.2 Danger state

Use `danger` for:

- Delete.
- Discard.
- Import and Replace.
- Error messages when an action fails.

## 13.3 Warning state

Use `warning` for:

- Stale workout.
- Import caution.
- Long-running write recovery.

Warning should guide the user, not alarm them unnecessarily.

---

## 14. Workout Screen Styling Rules

The active workout screen is the most important screen.

Rules:

```text
Keep the screen visually calm.
Use primary color mainly for Add Set and Finish/Continue actions.
Use borders and spacing to separate exercise blocks.
Do not color every set row.
Do not use large decorative gradients.
Keep numeric inputs clear and large enough to tap.
```

Set rows should prioritize readability:

```text
Set number: textMuted or textSecondary
Weight/reps value: textPrimary or bodyStrong
Edit/Delete actions: subtle, with danger only for delete confirmation/action
```

---

## 15. Accessibility Rules

## 15.1 Contrast

The theme should aim for readable contrast:

```text
Normal body text should be clearly readable on background and surface.
Primary button text should be clearly readable on primary background.
Danger button text should be clearly readable on danger background.
```

## 15.2 Touch targets

Important controls should be comfortable to tap during workouts.

Recommended minimum:

```text
44px height or touch area
```

## 15.3 Color meaning

Do not rely only on color to communicate state.

Example:

```text
Bad:
Only show red border.

Good:
Show red border plus message: "Enter reps."
```

---

## 16. Codex Implementation Guardrails

Codex must follow these rules when implementing the theme.

```text
Do not hardcode colors inside feature components.
Use src/shared/theme/theme.ts tokens.
Do not introduce blue primary.
Do not use pure white #FFFFFF for surfaces.
Do not use pure black #000000 for text.
Do not add extra decorative colors.
Do not replace status colors with primary color.
Do not implement dark mode in v1 unless explicitly requested later.
Do not add custom fonts in v1 unless explicitly requested later.
```

When a component needs color, it should import from the theme.

Example:

```ts
import { theme } from '@/shared/theme/theme';

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
});
```

---

## 17. Suggested File Structure

```text
src/
  shared/
    theme/
      theme.ts
      colors.ts        optional
      spacing.ts       optional
      typography.ts    optional
    components/
      AppButton.tsx
      AppTextInput.tsx
      AppCard.tsx
      ConfirmDialog.tsx
```

For v1, a single `theme.ts` file is enough. Split files only if the theme grows.

---

## 18. Component Styling Checklist

When implementing a component, check:

```text
Does it use theme tokens instead of hardcoded colors?
Does it avoid pure white and pure black?
Does it use primary only for main actions?
Does it reserve danger for destructive actions?
Does it reserve warning for caution states?
Does it keep status colors out of normal decoration?
Is the touch target large enough?
Is the text readable on the chosen background?
Does it avoid unnecessary shadows and gradients?
```

---

## 19. Known Style Tradeoffs

### 19.1 Warm theme may feel less neutral than blue

Accepted because blue can make the app feel like a default mobile template.

### 19.2 Limited colors reduce visual variety

Accepted because the app prioritizes fast workout logging over decorative UI.

### 19.3 No pure white surface

Accepted because warm off-white surfaces are softer and more consistent with the selected visual identity.

### 19.4 No custom font in v1

Accepted because the app should stay reliable and easy to implement first.

---

## 20. Style Guide Summary

Gym Progress Tracker v1 uses the **Warm Iron Light** theme.

The most important style decisions are:

- Light theme only for v1.
- Four core colors.
- Warm off-white background and surface.
- Off-black text.
- Amber/brown primary action color.
- Green, red, and amber only for status states.
- No blue primary.
- No pure white or pure black.
- Minimal borders and soft rounded cards.
- System font for reliability.
- Theme tokens centralized in `src/shared/theme/theme.ts`.

This style system should make the app feel clean, focused, and practical for real gym usage without looking like a generic template app.

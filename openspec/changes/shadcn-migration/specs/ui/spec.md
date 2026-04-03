# UI Component System Specification

## Purpose

Defines requirements for the frontend UI system: component library, theming, and dark mode support.

---

## Requirements

### Requirement: Unified Component Source

The system MUST use shadcn/ui as the sole source for all primitive UI components (button, card, input, label, dialog, form, command, popover, sonner, chart).

No custom component subdirectories SHALL exist alongside shadcn-generated files.

#### Scenario: Component import resolves to shadcn

- GIVEN the app is compiled
- WHEN a page imports `Button` from `@/components/ui/button`
- THEN the resolved file MUST be the shadcn-generated `button.tsx`
- AND it MUST NOT reference any file under `components/ui/Button/`

#### Scenario: No custom subdirectory components remain

- GIVEN the migration is complete
- WHEN `src/components/ui/` is listed
- THEN no subdirectory (`Button/`, `Card/`, `Input/`, `Header/`, `BackButton/`, `Form/`, `FloatingButton/`, `Spacer/`) SHALL exist

---

### Requirement: shadcn CLI Configuration

The project MUST have a valid `components.json` at `app/frontend/components.json` that configures shadcn CLI for Vite + TailwindCSS v4.

#### Scenario: CLI resolves component paths correctly

- GIVEN `components.json` exists with correct aliases
- WHEN `npx shadcn@latest add button` is run in `app/frontend/`
- THEN the component is written to `src/components/ui/button.tsx`
- AND imports use the `@/` alias

---

### Requirement: Preset Theme Applied

The system MUST apply the CSS custom properties from preset `b1Z6B4qTT` to `global.css`.

All semantic color tokens (--background, --foreground, --primary, --card, --border, etc.) SHALL reflect the preset's values.

#### Scenario: Theme vars present at runtime

- GIVEN the app is running
- WHEN the `:root` CSS is inspected
- THEN all shadcn semantic tokens MUST be present with the preset's values

#### Scenario: Dark mode vars present

- GIVEN the app is running with `.dark` class on `<html>`
- WHEN CSS custom properties are inspected
- THEN all tokens MUST resolve to the preset's dark mode values

---

### Requirement: Dark Mode via next-themes

The system MUST wrap the React tree in `ThemeProvider` from `next-themes`.

The `ThemeProvider` MUST use `attribute="class"` so Tailwind's `.dark` class variant works.

#### Scenario: ThemeProvider present in tree

- GIVEN `main.tsx` is the app entry
- WHEN the React tree is rendered
- THEN `ThemeProvider` from `next-themes` MUST be an ancestor of all page components

#### Scenario: Dark mode class applied

- GIVEN `ThemeProvider` with `attribute="class"`
- WHEN the theme is set to `"dark"`
- THEN the `dark` class MUST be present on `<html>`
- AND dark mode CSS vars MUST take effect

---

### Requirement: Button Variant Compatibility

The shadcn `Button` component MUST support at minimum: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link` variants.

The `ghost` variant SHOULD use `bg-amber-50` on hover to match prior behavior.

#### Scenario: All prior variants compile

- GIVEN pages using `variant="ghost"`, `variant="outline"`, `variant="destructive"`
- WHEN TypeScript compiles
- THEN all variant props MUST resolve without type errors

---

### Requirement: Mobile-First Layout Preserved

All pages MUST remain usable at 375px viewport width after migration.

No layout regressions SHALL be introduced by component replacements.

#### Scenario: Home page renders on mobile

- GIVEN a 375px viewport
- WHEN the home page loads
- THEN all dashboard cards MUST be visible without horizontal scroll
- AND tap targets MUST be at minimum 44px

---

### Requirement: TypeScript Integrity

The migration MUST NOT introduce TypeScript errors.

After all component replacements and import updates, `tsc --noEmit` MUST pass with zero errors.

#### Scenario: Clean typecheck after migration

- GIVEN all custom components deleted and imports updated
- WHEN `npm run typecheck` is run in `app/frontend/`
- THEN exit code MUST be 0

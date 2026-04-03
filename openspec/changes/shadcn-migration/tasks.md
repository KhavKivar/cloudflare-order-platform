# Tasks: shadcn Migration

## Phase 1: Setup
- [ ] Install dependencies in `app/frontend`:
  - `pnpm add next-themes lucide-react @fontsource-variable/geist tw-animate-css clsx tailwind-merge`
- [ ] Create `app/frontend/components.json` with the configuration defined in `spec.md`.
- [ ] Initialize shadcn/ui:
  - `pnpm dlx shadcn@latest init` (Select "Skip" when it asks to overwrite CSS if possible, or manually restore from `spec.md`).

## Phase 2: Core Foundation
- [ ] Implement/Update `app/frontend/src/lib/utils.ts`:
  ```typescript
  import { clsx, type ClassValue } from "clsx"
  import { twMerge } from "tailwind-merge"

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
  }
  ```
- [ ] Update `app/frontend/src/app/global.css` with the OKLCH theme variables from `spec.md`.
- [ ] Create `app/frontend/src/components/theme-provider.tsx` using `next-themes`.
- [ ] Wrap the application root in `app/frontend/src/main.tsx` with `ThemeProvider`.

## Phase 3: Component Installation
- [ ] Install base components:
  - `pnpm dlx shadcn@latest add button card input label badge dialog form sheet popover sonner chart`

## Phase 4: Atomic Refactoring
- [ ] Replace all occurrences of legacy `Button` with `@/components/ui/button`.
- [ ] Replace all occurrences of legacy `Input` and `Label` with shadcn equivalents.
- [ ] Replace all occurrences of legacy `Card` components.
- [ ] Migrate form implementations to use shadcn/ui `Form` primitives where complex validation exists.

## Phase 5: Layout & Global UI
- [ ] Refactor `Navbar` and `Header` using shadcn components.
- [ ] Implement a mobile-friendly menu using `Sheet` for small screens.
- [ ] Add a `ThemeToggle` component to the navbar.

## Phase 6: Final Polish & Cleanup
- [ ] Move any remaining legacy custom components to a temporary `legacy` folder or delete them.
- [ ] Run type checking: `pnpm --prefix app/frontend tsc --noEmit`.
- [ ] Verify visual consistency across light and dark modes.
- [ ] Test mobile responsiveness on 375px viewport.
- [ ] Remove unused dependencies (e.g., `@base-ui/react` if present).

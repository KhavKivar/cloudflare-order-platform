# Design: shadcn Migration

## 1. File Reorganization Plan
- **Components**:
  - Move current custom components to `app/frontend/src/components/ui/legacy` (temporary) or delete as replaced.
  - New shadcn components will live in `app/frontend/src/components/ui`.
- **Hooks**:
  - Shadcn-specific hooks (e.g., `use-mobile`) go to `app/frontend/src/hooks`.
- **Lib**:
  - Utils (`cn` helper) go to `app/frontend/src/lib/utils.ts`.

## 2. Elimination of Custom Components
The following custom components will be replaced by shadcn equivalents:
- `Button/` -> `ui/button`
- `Card/` -> `ui/card`
- `Input/` -> `ui/input`
- `Label/` -> `ui/label`
- `Dialog/` -> `ui/dialog`
- `Form/` -> `ui/form`
- `Header/`, `Navbar/` -> Refactored using shadcn primitives.

## 3. Theme Implementation
- Install `next-themes`.
- Create `app/frontend/src/components/theme-provider.tsx`.
- Wrap the application in `app/frontend/src/App.tsx` (or `main.tsx`) with the `ThemeProvider`.
- Configuration: `defaultTheme="system"`, `enableSystem={true}`, `attribute="class"`.

## 4. Mobile-First Principles
- **Responsive Layout**: Use Tailwind's `sm:`, `md:`, `lg:` prefixes.
- **Navigation**: Use `Sheet` (Drawer) for the sidebar/menu on mobile viewports.
- **Charts**: shadcn/charts for the revenue dashboard, optimized for small screens.

## 5. Transition Strategy
- **Phase 1: Init**: Run `pnpm dlx shadcn@latest init`.
- **Phase 2: Base**: Setup `global.css` and `ThemeProvider`.
- **Phase 3: Atoms**: Install and replace foundational components (`Button`, `Input`, `Badge`).
- **Phase 4: Molecules**: Replace `Card`, `Dialog`, `Popover`.
- **Phase 5: Layout**: Refactor `Sidebar` and `Navbar`.
- **Phase 6: Cleanup**: Delete legacy custom components and unused dependencies.

# Proposal: shadcn Migration

## Intent

Replace the mixed custom/shadcn UI system in `app/frontend/` with a fully unified shadcn/ui component set, applying preset `b1Z6B4qTT`, enabling dark mode via `next-themes`, and keeping the app mobile-first throughout.

## Scope

### In Scope
- Create `components.json` for shadcn CLI (Vite + TailwindCSS v4)
- Fetch and apply preset `b1Z6B4qTT` CSS variables to `global.css`
- Install `next-themes`, wire `ThemeProvider` in `main.tsx`
- Add shadcn components via CLI: `button`, `card`, `input`, `label`, `dialog`, `form`, `command`, `popover`, `sonner`, `chart`
- Delete custom components: `Button/`, `Card/` (custom), `Input/` (custom), `BackButton/`, `FloatingButton/`, `Header/`, `Spacer/`, `Form/`, `spinner.tsx`
- Update all import paths across pages and features
- Remove `@base-ui/react` dependency

### Out of Scope
- Backend changes
- Routing or state management changes
- New pages or features
- Design system documentation

## Approach

1. Fetch preset `b1Z6B4qTT` CSS vars from `https://ui.shadcn.com/create?template=vite&preset=b1Z6B4qTT`
2. Create `app/frontend/components.json` manually (skip `shadcn init` to avoid overwriting `global.css`)
3. Install `next-themes` + run `npx shadcn@latest add` for each component
4. Apply preset CSS vars to `global.css`, preserve dark mode block
5. Wire `ThemeProvider` in `main.tsx`
6. Delete custom subdirectory components, keep flat shadcn files
7. Update all import paths in pages and features

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/frontend/components.json` | New | shadcn CLI config |
| `app/frontend/src/app/global.css` | Modified | CSS vars replaced with preset theme |
| `app/frontend/src/app/main.tsx` | Modified | ThemeProvider wrapper added |
| `app/frontend/src/components/ui/` | Modified | Remove custom subdirs, consolidate flat shadcn files |
| `app/frontend/src/components/navbar/` | Modified | Update Button imports |
| `app/frontend/src/app/**/page.tsx` | Modified | Update component imports |
| `app/frontend/package.json` | Modified | Add next-themes, remove @base-ui/react |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Preset URL requires parsing HTML | Med | Inspect page source; fallback to manual extraction |
| shadcn CLI overwrites global.css | Med | Write components.json manually, use `add` only |
| TailwindCSS v4 compat issues | Low | Set `"tailwind": { "version": "4" }` in components.json |
| Custom button variants (ghost/amber) lost | Low | Extend shadcn Button post-migration with same variant names |
| Import regressions across 10+ pages | Med | Grep systematically before and after |

## Rollback Plan

All changes are in `app/frontend/`. `git revert` to pre-migration commit restores full prior state. No backend or DB changes.

## Dependencies

- `next-themes` (npm)
- `npx shadcn@latest` (CLI via npx)
- Preset CSS vars from `https://ui.shadcn.com/create?template=vite&preset=b1Z6B4qTT`

## Success Criteria

- [ ] `components.json` exists and shadcn CLI resolves paths correctly
- [ ] All `src/components/ui/` entries are shadcn-generated (no custom subdirs)
- [ ] `next-themes` ThemeProvider wraps the app; dark mode toggle works
- [ ] Preset CSS vars applied — visual theme matches preset preview
- [ ] `tsc --noEmit` passes with zero errors
- [ ] No references to deleted custom components remain
- [ ] App is usable on 375px viewport (mobile)

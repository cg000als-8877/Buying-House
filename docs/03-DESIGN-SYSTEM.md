# XYZ Buying House — Design System

## 1. Design Direction

The visual identity should communicate:

- International
- Premium
- Reliable
- Modern
- Technical
- Human
- Transparent
- Apparel-industry expertise

Avoid generic corporate templates and excessive visual effects.

## 2. Design Principles

1. Strong typography.
2. Generous whitespace.
3. High-quality apparel/factory imagery.
4. Restrained color palette.
5. Clear information hierarchy.
6. Consistent spacing.
7. Subtle glass/surface effects only where useful.
8. Accessibility before decoration.
9. Motion should support storytelling, not distract.
10. Buyer/admin interfaces should remain practical.

## 3. Typography

Use a modern sans-serif system with a maximum of two font families.

Potential primary choices:
- Inter
- Manrope
- DM Sans
- Plus Jakarta Sans
- Instrument Sans

Final font selection must be made once and used consistently.

Avoid unnecessary font mixing.

## 4. Color System

Do not hard-code colors throughout components.

Use semantic tokens such as:

```text
--background
--foreground
--surface
--surface-muted
--surface-elevated
--border
--primary
--primary-foreground
--secondary
--muted
--success
--warning
--error
--info
```

The exact brand palette must be approved from the client's logo/brand materials.

## 5. Public Website Components

- Header
- Navigation
- Mobile menu
- Hero
- Section heading
- Stat block
- Service card
- Product category card
- Factory card
- Certification card
- Timeline
- CTA
- Inquiry form
- Footer

## 6. Portal Components

- Sidebar
- Top bar
- Breadcrumbs
- Cards
- Data table
- Filters
- Search
- Tabs
- Status badges
- Progress bars
- Timeline
- Document list
- Image gallery
- Modal
- Confirmation dialog
- Empty state
- Loading state
- Error state
- Toast/notification

## 7. Status Colors

Status colors must be semantic, not decorative.

Example:

```text
success = completed/approved
warning = attention/pending
error = failed/delayed/rejected
info = informational
neutral = not started
```

Do not use color as the only way to communicate status.

## 8. Accessibility

Target WCAG 2.2 AA where practical.

Required:
- keyboard navigation
- visible focus states
- adequate contrast
- semantic HTML
- accessible form labels
- alt text
- reduced motion support
- meaningful error messages

## 9. Images

Use high-quality real company imagery whenever available.

Do not invent certifications, factory photos, buyer logos, or company history.

Use responsive image loading and optimized formats.

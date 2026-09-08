# XYZ Buying House — Animation Guidelines

## 1. Animation Philosophy

Animation should communicate quality and guide attention.

It must never reduce usability, performance, accessibility, or trust.

## 2. Libraries

### GSAP
Use for:
- hero timelines
- scroll storytelling
- pinned sections
- complex sequencing
- advanced image/text reveals

### Motion
Use for:
- UI transitions
- modals
- dropdowns
- cards
- layout transitions
- dashboard micro-interactions

### Lenis
Use for:
- smooth scrolling on the public marketing website

Do not make operational dashboards dependent on smooth-scroll effects.

## 3. Library Boundaries

```text
GSAP
→ complex marketing motion

Motion
→ interface motion

Lenis
→ public page scrolling

CSS
→ simple hover/focus/transitions
```

Do not implement the same animation with multiple libraries.

## 4. Public Website

Potential effects:
- subtle hero reveal
- image clipping/reveal
- text entrance
- section transitions
- factory/process storytelling
- subtle parallax

Avoid:
- constant floating objects
- excessive blur
- unnecessary cursor effects
- long loading animations
- animation on every element

## 5. Buyer/Admin Portal

Keep animations minimal.

Use:
- 150–300ms UI transitions
- loading skeletons
- subtle status changes
- drawer/modal transitions
- progress animation only when useful

## 6. Reduced Motion

Respect `prefers-reduced-motion`.

Users who request reduced motion should receive a simplified experience.

## 7. Performance

Animations must:
- prefer transform/opacity
- avoid expensive layout thrashing
- clean up GSAP/Motion subscriptions
- avoid large animated DOM trees
- avoid unnecessary scroll listeners

## 8. Mobile

Reduce complexity on mobile where necessary.

## 9. Animation Quality

Motion should feel:
- calm
- premium
- intentional
- precise

The design must not look like a template overloaded with effects.

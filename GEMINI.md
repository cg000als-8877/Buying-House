# Project Guidelines & Rules

## Animation & Motion Architecture Rules

When implementing animations across this project, always adhere strictly to the following division of responsibility:

- **GSAP**: Use exclusively for **complex marketing animations**, multi-stage timelines, SVG path morphing, complex pinned scroll triggers, and high-impact hero stage sequences.
- **Motion (Framer Motion)**: Use for **UI/component transitions**, modal entries/exits, layout animations, presence toggles, interactive tabs, filter shifts, and micro-interactions.
- **Lenis**: Use for **smooth page scrolling**, momentum scrolling, and viewport scroll synchronization.
- **CSS**: Use for **simple hover/fade/transition effects**, basic opacity/transform changes on hover, color transitions, and standard utility states.

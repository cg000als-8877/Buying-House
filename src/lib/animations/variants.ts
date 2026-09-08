import { Variants, Transition } from 'framer-motion';

/**
 * Standard transition curves and durations for UI/Component transitions.
 * Operational interfaces (Buyer/Admin) use fast/snappy 150-250ms curves.
 * Public UI interactions use refined 250-350ms easing.
 */
export const transitions = {
  fast: { duration: 0.15, ease: [0.16, 1, 0.3, 1] } as Transition,
  normal: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } as Transition,
  slow: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } as Transition,
  springSnappy: { type: 'spring', damping: 25, stiffness: 350 } as Transition,
  springGentle: { type: 'spring', damping: 30, stiffness: 200 } as Transition,
};

/**
 * Accessible, restrained Framer Motion UI variants
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.normal },
  exit: { opacity: 0, transition: transitions.fast },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: transitions.normal },
  exit: { opacity: 0, y: 8, transition: transitions.fast },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transitions.springSnappy },
  exit: { opacity: 0, scale: 0.96, transition: transitions.fast },
};

export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.normal },
  exit: { opacity: 0, transition: transitions.fast },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitions.springSnappy,
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 8,
    transition: transitions.fast,
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

export const drawerSlideRight: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: transitions.springGentle },
  exit: { x: '100%', transition: transitions.fast },
};

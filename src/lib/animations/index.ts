export * from './variants';

/**
 * Safe GSAP helper for marketing sequences.
 * GSAP is exclusively reserved for complex marketing animations and scroll storytelling.
 */
export async function initGsapMarketing() {
  if (typeof window === 'undefined') return null;
  const { gsap } = await import('gsap');
  const { ScrollTrigger } = await import('gsap/ScrollTrigger');
  gsap.registerPlugin(ScrollTrigger);
  return { gsap, ScrollTrigger };
}

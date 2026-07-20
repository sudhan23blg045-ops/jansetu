import { Variants, TargetAndTransition } from "framer-motion";

export const FADE_IN_UP: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } 
  },
};

export const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Extremely subtle hover for cards
export const CARD_HOVER: TargetAndTransition = {
  y: -2,
  boxShadow: "0px 8px 24px rgba(0,0,0,0.06)",
  transition: { duration: 0.2, ease: "easeOut" }
};

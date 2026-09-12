export const motionConfig = {
  page: {
    initial: {
      opacity: 0,
      scale: 1.015,
    },
    animate: {
      opacity: 1,
      scale: 1,
    },
    exit: {
      opacity: 0,
      scale: 0.985,
    },
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  fadeUp: {
    initial: {
      opacity: 0,
      y: 24,
    },
    animate: {
      opacity: 1,
      y: 0,
    },
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  cinematic: {
    duration: 0.9,
    ease: [0.16, 1, 0.3, 1],
  },
} as const;

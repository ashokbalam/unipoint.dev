import React, { ReactNode } from 'react';
import { motion, AnimatePresence, Variants, MotionProps } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// Animation variants for different transition types
const fadeVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
  exit: {
    opacity: 0,
  },
};

const slideUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

const slideRightVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: 20,
  },
};

const scaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
  },
};

// 3D perspective variants for a premium feel
const perspectiveVariants: Variants = {
  initial: {
    opacity: 0,
    rotateX: 5,
    y: 20,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    rotateX: 0,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    rotateX: -5,
    y: -20,
    scale: 0.98,
  },
};

// Glass-like effect variants
const glassVariants: Variants = {
  initial: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    y: 20,
  },
  animate: {
    opacity: 1,
    backdropFilter: 'blur(10px)',
    y: 0,
  },
  exit: {
    opacity: 0,
    backdropFilter: 'blur(0px)',
    y: -20,
  },
};

// Transition presets
const transitions = {
  smooth: {
    type: 'spring',
    stiffness: 80,
    damping: 20,
    mass: 1,
  },
  smoothSlow: {
    type: 'spring',
    stiffness: 50,
    damping: 25,
    mass: 1.2,
  },
  smoothFast: {
    type: 'spring',
    stiffness: 100,
    damping: 15,
    mass: 0.8,
  },
  easeOut: {
    type: 'tween',
    ease: [0.16, 1, 0.3, 1], // cubic-bezier curve for a smooth ease-out
    duration: 0.6,
  },
};

// Props for the PageTransition component
export interface PageTransitionProps {
  children: ReactNode;
  type?: 'fade' | 'slideUp' | 'slideRight' | 'scale' | 'perspective' | 'glass';
  transition?: 'smooth' | 'smoothSlow' | 'smoothFast' | 'easeOut';
  duration?: number;
  delay?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
  className?: string;
  style?: React.CSSProperties;
  motionProps?: MotionProps;
  mode?: 'wait' | 'sync' | 'popLayout';
}

// Props for the child item wrapper
export interface ChildAnimationProps {
  children: ReactNode;
  index?: number;
  className?: string;
  style?: React.CSSProperties;
  motionProps?: MotionProps;
}

// Child component for staggered animations
export const AnimatedChild: React.FC<ChildAnimationProps> = ({
  children,
  index = 0,
  className,
  style,
  motionProps,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 20,
        delay: index * 0.1, // Stagger based on index
      }}
      className={className}
      style={style}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

// Main PageTransition component
const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  transition = 'smooth',
  duration,
  delay = 0,
  staggerChildren = false,
  staggerDelay = 0.1,
  className,
  style,
  motionProps,
  mode = 'wait',
}) => {
  const location = useLocation();
  
  // Select the appropriate variant based on type
  let variants: Variants;
  switch (type) {
    case 'slideUp':
      variants = slideUpVariants;
      break;
    case 'slideRight':
      variants = slideRightVariants;
      break;
    case 'scale':
      variants = scaleVariants;
      break;
    case 'perspective':
      variants = perspectiveVariants;
      break;
    case 'glass':
      variants = glassVariants;
      break;
    case 'fade':
    default:
      variants = fadeVariants;
      break;
  }

  // Select the transition preset
  let transitionPreset = transitions.smooth;
  switch (transition) {
    case 'smoothSlow':
      transitionPreset = transitions.smoothSlow;
      break;
    case 'smoothFast':
      transitionPreset = transitions.smoothFast;
      break;
    case 'easeOut':
      transitionPreset = transitions.easeOut;
      break;
    case 'smooth':
    default:
      transitionPreset = transitions.smooth;
      break;
  }

  // Create a custom transition object with optional duration and delay
  const customTransition = {
    ...transitionPreset,
    ...(duration !== undefined && { duration }),
    delay,
  };

  // Create staggered transition for children if needed
  const childrenTransition = staggerChildren
    ? {
        ...customTransition,
        staggerChildren: staggerDelay,
        delayChildren: delay,
      }
    : customTransition;

  return (
    <AnimatePresence mode={mode} initial={false}>
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={customTransition}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          ...style,
        }}
        {...motionProps}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Container component for creating coordinated group animations
export const AnimationContainer: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  transition = 'smooth',
  duration,
  delay = 0,
  staggerChildren = true,
  staggerDelay = 0.1,
  className,
  style,
  motionProps,
}) => {
  // Select the appropriate variant based on type
  let variants: Variants;
  switch (type) {
    case 'slideUp':
      variants = slideUpVariants;
      break;
    case 'slideRight':
      variants = slideRightVariants;
      break;
    case 'scale':
      variants = scaleVariants;
      break;
    case 'perspective':
      variants = perspectiveVariants;
      break;
    case 'glass':
      variants = glassVariants;
      break;
    case 'fade':
    default:
      variants = fadeVariants;
      break;
  }

  // Select the transition preset
  let transitionPreset = transitions.smooth;
  switch (transition) {
    case 'smoothSlow':
      transitionPreset = transitions.smoothSlow;
      break;
    case 'smoothFast':
      transitionPreset = transitions.smoothFast;
      break;
    case 'easeOut':
      transitionPreset = transitions.easeOut;
      break;
    case 'smooth':
    default:
      transitionPreset = transitions.smooth;
      break;
  }

  // Create a custom transition object with optional duration and delay
  const customTransition = {
    ...transitionPreset,
    ...(duration !== undefined && { duration }),
    delay,
  };

  // Create staggered transition for children if needed
  const childrenTransition = staggerChildren
    ? {
        ...customTransition,
        staggerChildren: staggerDelay,
        delayChildren: delay,
      }
    : customTransition;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      transition={childrenTransition}
      className={className}
      style={style}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;

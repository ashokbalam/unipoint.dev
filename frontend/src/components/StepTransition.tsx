import React, { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

// Define the props interface for the StepTransition component
interface StepTransitionProps<T> {
  step: T;                        // Current step identifier
  children: ReactNode;            // Content to be rendered
  direction?: 'forward' | 'backward' | 'none'; // Optional explicit direction
  duration?: number;              // Optional custom duration
  className?: string;             // Optional CSS class
  style?: React.CSSProperties;    // Optional inline styles
  onAnimationComplete?: () => void; // Optional callback when animation completes
}

// Define variants for forward transitions (slide from right)
const forwardVariants: Variants = {
  initial: {
    x: 50,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 20,
      mass: 1,
    },
  },
  exit: {
    x: -50,
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      mass: 0.8,
    },
  },
};

// Define variants for backward transitions (slide from left)
const backwardVariants: Variants = {
  initial: {
    x: -50,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 20,
      mass: 1,
    },
  },
  exit: {
    x: 50,
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
      mass: 0.8,
    },
  },
};

// Define variants for no direction (fade only)
const noDirectionVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
};

/**
 * StepTransition component for smooth transitions between steps in multi-step flows
 * 
 * @template T - The type of the step identifier (string, number, enum, etc.)
 */
function StepTransition<T>({
  step,
  children,
  direction,
  duration,
  className,
  style,
  onAnimationComplete,
}: StepTransitionProps<T>) {
  // Keep track of previous step to determine direction
  const [prevStep, setPrevStep] = useState<T | null>(null);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward' | 'none'>(
    direction || 'none'
  );

  // Update direction when step changes
  useEffect(() => {
    if (prevStep !== null && prevStep !== step) {
      // If direction is explicitly provided, use that
      if (direction) {
        setTransitionDirection(direction);
      } else {
        // Otherwise try to determine direction based on step progression
        // This works if steps are numbers or can be compared
        if (typeof prevStep === 'number' && typeof step === 'number') {
          setTransitionDirection(step > prevStep ? 'forward' : 'backward');
        } else if (
          typeof prevStep === 'string' && 
          typeof step === 'string' && 
          ['team', 'category', 'questions', 'results'].includes(prevStep as string) &&
          ['team', 'category', 'questions', 'results'].includes(step as string)
        ) {
          // Special handling for TeamSelectionPage steps
          const stepOrder = ['team', 'category', 'questions', 'results'];
          const prevIndex = stepOrder.indexOf(prevStep as string);
          const currentIndex = stepOrder.indexOf(step as string);
          setTransitionDirection(currentIndex > prevIndex ? 'forward' : 'backward');
        } else {
          // Default to 'none' if we can't determine direction
          setTransitionDirection('none');
        }
      }
    }
    setPrevStep(step);
  }, [step, prevStep, direction]);

  // Select the appropriate variants based on direction
  const getVariants = () => {
    switch (transitionDirection) {
      case 'forward':
        return forwardVariants;
      case 'backward':
        return backwardVariants;
      case 'none':
      default:
        return noDirectionVariants;
    }
  };

  // Custom transition with optional duration
  const customTransition = {
    ...(duration !== undefined && { duration }),
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={String(step)} // Convert step to string for key
        initial="initial"
        animate="animate"
        exit="exit"
        variants={getVariants()}
        transition={customTransition}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          ...style,
        }}
        onAnimationComplete={onAnimationComplete}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Component for animating individual items within a step
 */
export const StepItem: React.FC<{
  children: ReactNode;
  index?: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, index = 0, className, style }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 20,
        delay: index * 0.08, // Stagger based on index
      }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
};

export default StepTransition;

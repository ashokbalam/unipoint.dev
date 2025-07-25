import { zIndex } from './styles/zIndex';

export const appContainer = {
  minHeight: '100vh',
  minWidth: '100vw',
  width: '100vw',
  height: '100vh',
  background: 'var(--color-background)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

export const cardWrapper = {
  width: '420px',
  height: '700px',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '1.5rem',
  backgroundColor: '#ffffff',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e0e7ff',
  padding: '2rem'
};

export const header = {
  position: 'fixed' as const,
  top: '0',
  left: '0',
  width: '100%',
  zIndex: zIndex.header,
  backgroundColor: 'rgba(249, 250, 251, 0.85)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: '5rem', // increased height to accommodate button
  paddingLeft: '1rem',
  paddingRight: '1rem'
};

export const headerTitle = {
  fontWeight: '800',
  fontSize: '1.5rem',
  letterSpacing: '0.1em',
  color: 'var(--color-text)',
  textAlign: 'center' as const,
  userSelect: 'none' as const,
  flex: '1',
  fontFamily: 'var(--font-heading)',
};

export const headerSpacer = {
  height: '5rem'
};

export const mainContent = {
  flex: '1',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '100%',
  paddingLeft: '0.5rem',
  paddingRight: '0.5rem',
  paddingTop: '1.5rem',
  paddingBottom: '1.5rem'
};

export const contentWrapper = {
  width: '100%',
  maxWidth: '80rem',
  paddingLeft: '0.5rem',
  paddingRight: '0.5rem'
};

/* ------------------------------------------------------------------
 * Right-side Navigation (Home / Teams / Category / Questions)
 * ----------------------------------------------------------------- */

// Wrapper that pins the navigation to the right edge and centres it vertically
export const rightNavigation = {
  position: 'fixed' as const,
  top: '50%',
  right: '1.25rem', // ~20px
  /* base: centred vertically, no extra scale */
  transform: 'translateY(-50%) scale(1)',
  transformOrigin: 'center',
  transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: zIndex.header, // same layer as header so it's always visible
  pointerEvents: 'auto' as const,
};

/* Hover state for the entire navigation container (12% larger) */
export const rightNavigationHover = {
  ...rightNavigation,
  transform: 'translateY(-50%) scale(1.12)',
};

// Unordered list that stacks items vertically with equal spacing
export const navigationList = {
  listStyle: 'none',
  margin: 0,
  padding: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.75rem', // vertical spacing between links
  alignItems: 'flex-end',
};

// Wrapper for each individual nav entry (for potential future badges)
export const navigationItem = {
  display: 'block',
};

// Base link style – small caps, primary colour hover
export const navigationLink = {
  textDecoration: 'none',
  /* slightly larger for better prominence */
  fontSize: '1.375rem',             // 22px
  fontWeight: 600,
  letterSpacing: '0.05em',
  /* Default to secondary (orange) so links are orange even before hover */
  color: 'var(--color-secondary)',
  fontFamily: 'var(--font-heading)',
  // Provide subtle default scale for smooth transform animation start
  transform: 'scale(1)',
  // Ensure transforms affect the element (required for scaling)
  display: 'inline-block',
  transformOrigin: 'center',
  borderBottom: '2px solid transparent', // placeholder for active underline
  transition: 'color 0.2s ease, transform 0.2s ease, border-bottom 0.2s ease',
  cursor: 'pointer',
};

// Navigation link hover state (for JavaScript event handling)
export const navigationLinkHover = {
  color: 'var(--color-secondary)',         // switch to secondary colour
  transform: 'scale(1.15)',                // 15% scale-up on hover
};

// Active route styling (e.g., via NavLink "isActive")
export const navigationLinkActive = {
  color: 'var(--color-secondary)',         // active colour matches hover
  borderBottom: '2px solid var(--color-secondary)', // underline for active page
};

// Disabled / God-Mode-locked link styling
export const navigationLinkDisabled = {
  ...navigationLink,
  textDecoration: 'line-through',
};

// God Mode Button Styles
export const godModeButton = {
  border: '1px solid var(--color-primary)',
  color: 'var(--color-primary)',
  fontWeight: '500',
  borderRadius: '0.375rem',
  paddingLeft: '0.75rem',
  paddingRight: '0.75rem',
  paddingTop: '0.375rem',
  paddingBottom: '0.375rem',
  backgroundColor: 'white',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  cursor: 'pointer',
  fontSize: '0.875rem',
  transition: 'all 0.2s ease',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
  userSelect: 'none' as const,
  touchAction: 'manipulation',
  whiteSpace: 'nowrap',
  verticalAlign: 'middle',
  lineHeight: '1.25',
};

// God Mode Button hover state (for JavaScript event handling)
export const godModeButtonHover = {
  backgroundColor: 'var(--color-primary)',
  color: 'white',
  borderColor: 'var(--color-primary)'
};

// God Mode Button focus state (for JavaScript event handling)
export const godModeButtonFocus = {
  boxShadow: '0 0 0 2px white, 0 0 0 4px var(--color-primary)',
  outline: 'none'
};

export const godModeButtonContainer = {
  position: 'absolute' as const,
  top: '1rem',
  right: '1rem',
  zIndex: zIndex.header, // Same as header to be safe
  pointerEvents: 'auto' as const
};

/* Renaming godModeDialog to godModeOverlay and adjusting styles */
export const godModeOverlay = {
  position: 'fixed' as const,
  /* Translucent dark layer that sits below the slider but above page */
  inset: '0',
  zIndex: zIndex.godModeOverlay,
  backgroundColor: 'rgba(0, 0, 0, 0.35)',
  transition: 'opacity 0.3s ease',
};

/* Frosted-glass backdrop (optional, can be used instead of simple overlay) */
export const godModeBackdrop = {};
export const godModeBackdropOpen = {};
export const godModeContainer = {};

/* New styles for the slider */
export const godModeSlider = {
  position: 'fixed' as const,
  top: '0',
  right: '0',
  bottom: '0',
  width: '320px',
  backgroundColor: '#ffffff',
  boxShadow: '-10px 0 20px -10px rgba(0, 0, 0, 0.1)',
  zIndex: zIndex.godModeSlider,
  /* Hidden state: off-screen to the right, slightly scaled down & fully transparent */
  transform: 'translateX(100%)',
  opacity: 0,
  transition: 'transform 0.3s ease, opacity 0.3s ease',
  display: 'flex',
  flexDirection: 'column' as const,
};

export const godModeSliderOpen = {
  /* Visible state: slides in & fades in */
  transform: 'translateX(0)',
  opacity: 1,
};

/* Renaming godModeDialogContent to godModeSliderContent */
export const godModeSliderContent = {
  padding: '2rem',
  overflowY: 'auto' as const,
  flexGrow: 1,
};

/* Renaming title and text for clarity */
export const godModeSliderTitle = {
  marginBottom: '0.5rem',
  fontWeight: '600',
  fontSize: '1.25rem',
  fontFamily: 'var(--font-heading)',
  color: 'var(--color-text)',
};

export const godModeSliderText = {
  marginBottom: '1.5rem',
  fontFamily: 'var(--font-body)',
  color: 'var(--color-text)',
};


export const godModeInput = {
  width: '100%',
  padding: '0.5rem',
  border: '1px solid #d1d5db',
  borderRadius: '0.375rem',
  outline: 'none',
  marginBottom: '0.5rem'
};

export const godModeError = {
  color: '#ef4444',
  fontSize: '0.875rem',
  marginBottom: '0.5rem'
};

export const godModeButtonGroup = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '0.5rem'
};

export const godModeCancelButton = {
  paddingLeft: '0.75rem',
  paddingRight: '0.75rem',
  paddingTop: '0.25rem',
  paddingBottom: '0.25rem',
  borderRadius: '0.25rem',
  backgroundColor: '#e5e7eb',
  cursor: 'pointer'
};

export const godModeSubmitButton = {
  paddingLeft: '0.75rem',
  paddingRight: '0.75rem',
  paddingTop: '0.25rem',
  paddingBottom: '0.25rem',
  borderRadius: '0.25rem',
  backgroundColor: '#6366f1',
  color: 'white',
  cursor: 'pointer'
};

export const godModeMenu = {
  position: 'absolute' as const,
  right: '0',
  marginTop: '0.5rem',
  width: '12rem',
  backgroundColor: 'white',
  borderRadius: '0.375rem',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  zIndex: zIndex.godModeSlider // Same as slider
};

export const godModeMenuItem = {
  width: '100%',
  textAlign: 'left' as const,
  padding: '0.75rem',
  borderRadius: '0.375rem',
  border: '1px solid var(--color-border)',
  backgroundColor: 'white',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  fontSize: '0.875rem',
  fontWeight: '500',
};

// God Mode Menu Item hover state (for JavaScript event handling)
export const godModeMenuItemHover = {
  backgroundColor: 'var(--color-background)',
  borderColor: 'var(--color-primary)'
};

export const godModeOptionsContainer = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.75rem',
  marginTop: '1rem'
};

export const godModeCloseContainer = {
  marginTop: '1.5rem',
  paddingTop: '1rem',
  borderTop: '1px solid var(--color-border)'
};

export const godModeCloseButton = {
  ...godModeCancelButton,
  width: '100%',
  padding: '0.5rem'
};

export const headerCenteredContent = {
  position: 'absolute' as const,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  justifyContent: 'center',
  pointerEvents: 'none' as const,
  zIndex: zIndex.headerContent
};

export const fadeMessageText = {
  fontSize: '1.1rem',
  fontWeight: 500,
  color: '#000000',
  lineHeight: '1.4',
  maxWidth: '400px',
  letterSpacing: '0.01em',
  opacity: 1,
  transition: 'opacity 1s',
  fontFamily: 'var(--font-body)'
};

/* ------------------------------------------------------------------
 * Common Boxed Container for Non-Home Pages
 * ----------------------------------------------------------------- */

// Outer wrapper to center the boxed container and fill viewport
export const pageWrapper = {
  width: '100%',
  minHeight: '100vh',
  background: 'var(--color-background)',
  display: 'flex',
  justifyContent: 'center',  // horizontal centering
  alignItems: 'center',      // vertical centering
};

// Main boxed container used by admin/secondary pages
export const boxedContainer = {
  width: '60%',      // 60% of viewport width
  height: '85vh',    // fixed 85% of viewport height
  backgroundColor: '#ffffff',
  borderRadius: '1.5rem',
  border: '1px solid #e0e7ff',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  padding: '2rem',
  display: 'flex',
  flexDirection: 'column' as const,
};

// Optional header section inside boxed container
export const containerHeader = {
  marginBottom: '1.5rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

// Scrollable / flexible content area inside boxed container
export const containerContent = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as const,
  overflowY: 'auto' as const,
};


/* ------------------------------------------------------------------
 * GLOBAL DESIGN-TOKEN BASED STYLE SYSTEM
 * ----------------------------------------------------------------- */

/* -------------------------------------------------
 * Typography System
 * ------------------------------------------------- */
export const typeScale = {
  xs: '0.75rem',   // 12px
  sm: '0.875rem',  // 14px
  md: '1rem',      // 16px (base)
  lg: '1.125rem',  // 18px
  xl: '1.375rem',  // 22px  (navigation link / large input)
  '2xl': '1.75rem',// 28px
  '3xl': '2rem',   // 32px
  '4xl': '2.5rem', // 40px
};

export const fontWeights = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
};

// Heading styles (h1-h4)
export const headingBase = {
  fontFamily: 'var(--font-heading)',
  color: 'var(--color-text)',
  lineHeight: 1.2,
  margin: 0,
};

export const h1 = { ...headingBase, fontSize: typeScale['4xl'], fontWeight: fontWeights.black };
export const h2 = { ...headingBase, fontSize: typeScale['3xl'], fontWeight: fontWeights.extrabold };
export const h3 = { ...headingBase, fontSize: typeScale['2xl'], fontWeight: fontWeights.bold };
export const h4 = { ...headingBase, fontSize: typeScale.xl,    fontWeight: fontWeights.bold };

// Body / small text
export const bodyText = {
  fontFamily: 'var(--font-body)',
  fontSize: typeScale.md,
  color: 'var(--color-text)',
  lineHeight: 1.6,
};

export const smallText = {
  ...bodyText,
  fontSize: typeScale.sm,
};

/* -------------------------------------------------
 * Button System
 * ------------------------------------------------- */

const baseButton = {
  fontFamily: 'var(--font-body)',
  fontWeight: fontWeights.semibold,
  borderRadius: '0.375rem',
  padding: '0.625rem 1.25rem',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  border: '1px solid transparent',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none' as const,
  lineHeight: 1.25,
};

export const primaryButton = {
  ...baseButton,
  backgroundColor: 'var(--color-primary)',
  color: '#ffffff',
};

export const primaryButtonHover = {
  backgroundColor: '#4338ca',
};

export const secondaryButton = {
  ...baseButton,
  backgroundColor: 'var(--color-secondary)',
  color: '#ffffff',
};

export const secondaryButtonHover = {
  backgroundColor: '#ea580c',
};

export const buttonDisabled = {
  ...baseButton,
  backgroundColor: '#9ca3af',
  cursor: 'not-allowed',
  color: '#ffffff',
};

// Button size modifiers
export const buttonSmall  = { padding: '0.375rem 0.75rem', fontSize: typeScale.sm  };
export const buttonMedium = { padding: '0.625rem 1.25rem', fontSize: typeScale.md  };
export const buttonLarge  = { padding: '0.75rem 1.5rem',   fontSize: typeScale.lg  };

/* -------------------------------------------------
 * Input System
 * ------------------------------------------------- */

export const inputBase = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1px solid var(--color-border)',
  borderRadius: '0.5rem',
  fontFamily: 'var(--font-heading)',
  fontWeight: fontWeights.semibold,
  fontSize: typeScale.xl,          // Matches navigation link size (1.375rem)
  outline: 'none',
  color: 'var(--color-primary)',
  backgroundColor: 'transparent',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  boxSizing: 'border-box' as const,
  lineHeight: 1.5,
};

export const inputFocus = {
  borderColor: 'var(--color-primary)',
  boxShadow: '0 0 0 3px rgba(99,102,241,0.2)',
};

export const inputError = {
  borderColor: '#ef4444',
};

/* -------------------------------------------------
 * Header / Section System
 * ------------------------------------------------- */

export const pageHeader = {
  ...h2,
  marginBottom: '1.5rem',
};

export const sectionHeader = {
  ...h3,
  marginBottom: '1rem',
};

/* -------------------------------------------------
 * Common Interactive Elements
 * ------------------------------------------------- */

// Generic card
export const cardBase = {
  border: '1px solid #e5e7eb',
  borderRadius: '0.75rem',
  backgroundColor: '#ffffff',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
  padding: '1rem',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
};

export const cardHover = {
  transform: 'translateY(-2px)',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  borderColor: 'var(--color-primary)',
};

// Back button (icon + text)
export const backButtonBase = {
  ...baseButton,
  backgroundColor: 'transparent',
  border: 'none',
  color: 'var(--color-primary)',
  padding: 0,
};

export const backButtonHover = {
  color: '#4338ca',
};

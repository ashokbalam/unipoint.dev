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
  ':hover': {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    borderColor: 'var(--color-primary)'
  },
  ':focus': {
    boxShadow: '0 0 0 2px white, 0 0 0 4px var(--color-primary)',
    outline: 'none'
  }
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
  inset: '0',
  zIndex: zIndex.godModeOverlay,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  transition: 'opacity 0.3s ease-in-out',
};

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
  transform: 'translateX(100%)', // Initially hidden
  transition: 'transform 0.3s ease-in-out',
  display: 'flex',
  flexDirection: 'column' as const,
};

export const godModeSliderOpen = {
  transform: 'translateX(0)',
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
  ':hover': {
    backgroundColor: 'var(--color-background)',
    borderColor: 'var(--color-primary)'
  }
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
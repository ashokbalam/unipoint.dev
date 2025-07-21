import { zIndex } from '../styles/zIndex';

// Styles specific to the TeamSelectionPage

export const teamBox = {
  maxWidth: 400,
  mx: 'auto',
  mt: 12,
};

export const teamCard = {
  p: 3,
};

export const teamTitle = {
  marginBottom: '1rem',
  textAlign: 'center' as const,
  color: 'var(--color-text)',
  fontSize: '2.5rem',
  fontWeight: '900',
  letterSpacing: '-0.025em',
  lineHeight: '1.2',
  fontFamily: 'var(--font-heading)',
};

export const searchInput = {
  width: '100%',
  paddingLeft: '1rem',
  paddingRight: '15%',
  paddingTop: '0.75rem',
  paddingBottom: '0.75rem',
  border: '1px solid var(--color-text)',
  borderRight: 'none',
  borderRadius: '0.5rem',
  outline: 'none',
  fontSize: '1.25rem',
  fontWeight: '600',
  backgroundColor: 'transparent',
  color: 'var(--color-primary)',
  caretColor: 'var(--color-primary)',
  position: 'relative' as const,
  zIndex: zIndex.searchInput,
  fontFamily: 'var(--font-heading)',
  lineHeight: '1.5',
  boxSizing: 'border-box' as const,
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
};

export const suggestionText = {
  paddingLeft: '1rem',
  paddingRight: '15%',
  paddingTop: '0.75rem',
  paddingBottom: '0.75rem',
  color: '#9ca3af',
  fontSize: '1.25rem',
  fontWeight: '600',
  position: 'absolute' as const,
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  pointerEvents: 'none' as const,
  display: 'flex',
  alignItems: 'center',
  zIndex: zIndex.suggestionText,
  boxSizing: 'border-box' as const,
  fontFamily: 'var(--font-heading)',
  lineHeight: '1.5'
};

export const arrowButton = {
  backgroundColor: 'var(--color-primary)',
  color: '#ffffff',
  paddingLeft: '1rem',
  paddingRight: '1rem',
  paddingTop: '0.75rem',
  paddingBottom: '0.75rem',
  borderRadius: '0 0.5rem 0.5rem 0',
  borderTop: '1px solid var(--color-text)',
  borderRight: '1px solid var(--color-text)',
  borderBottom: '1px solid var(--color-text)',
  borderLeft: 'none',
  outline: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '15%',
  height: '100%',
  position: 'absolute' as const,
  right: '0',
  top: '0',
  zIndex: zIndex.arrowButton,
  transition: 'background-color 0.2s ease, transform 0.1s ease'
};

export const arrowButtonDisabled = {
  backgroundColor: '#9ca3af',
  color: '#6b7280',
  paddingLeft: '1rem',
  paddingRight: '1rem',
  paddingTop: '0.75rem',
  paddingBottom: '0.75rem',
  borderRadius: '0 0.5rem 0.5rem 0',
  border: 'none',
  outline: 'none',
  cursor: 'not-allowed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '15%',
  height: '100%',
  position: 'absolute' as const,
  right: '0',
  top: '0',
  zIndex: zIndex.arrowButton,
  transition: 'background-color 0.2s ease, transform 0.1s ease'
};

export const suggestionSpan = {
  color: '#9ca3af'
};

export const pageContainer = {
  width: '100%',
  maxWidth: '500px',
  height: 'auto',
  minHeight: '400px',
  borderRadius: '1.5rem',
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem',
  margin: '0 auto'
};

export const contentWrapper = {
  width: '100%',
};

export const searchContainer = {
  width: '100%',
  position: 'relative' as const
};

export const selectedTeamMessage = {
  marginTop: '2rem',
  textAlign: 'center' as const,
  color: '#059669',
  fontWeight: '600'
};

export const arrowButtonHover = {
  backgroundColor: '#374151',
  transition: 'background-color 0.2s'
};

export const arrowButtonFocus = {
  outline: 'none',
  boxShadow: '0 0 0 2px #9ca3af'
};

export const typewriterContainer = {
  marginTop: '2rem',
  textAlign: 'center' as const,
  minHeight: '2rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

export const typewriterText = {
  fontSize: '1.125rem',
  fontWeight: '500',
  color: '#6b7280',
  fontStyle: 'italic'
};

export const typewriterCursor = {
  opacity: 1
};

export const fadeMessageContainer = {
  marginTop: '0', // reduced for tighter spacing
  marginBottom: '1.5rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

export const heroText = {
  fontSize: '3.5rem',
  fontWeight: 900,
  textAlign: 'center' as const,
  letterSpacing: '0.35em',
  color: 'var(--color-primary) !important',
  marginBottom: '0.5rem',
  fontFamily: 'var(--font-heading)',
  marginLeft: 'auto',
  marginRight: 'auto',
  width: 'fit-content',
};

export const headerSvgWrapper = {
  ...heroText,
  marginBottom: 0,
  paddingTop: '2.5rem',
};

export const headerSvg = {
  width: '100%',
  height: 'auto',
  maxWidth: '400px', // reduced from 600px
  display: 'block',
};

export const headerCenterRow = {
  display: 'flex',
  flexDirection: 'row' as const,
  alignItems: 'flex-end',
  flex: 1,
  gap: '2rem',
};

export const fadeMessageBelowSvg = {
  marginTop: '0.25rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-start',
}; 
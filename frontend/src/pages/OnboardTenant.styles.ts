// Styles specific to the OnboardTenant page
import { zIndex } from '../styles/zIndex';

// Main container for the entire page
export const pageContainer = {
  width: '100%',
  maxWidth: '700px',
  margin: '0 auto',
  padding: '2rem 1.5rem',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
};

// Header section with title and subtitle
export const titleSection = {
  marginBottom: '2rem',
  textAlign: 'center' as const,
  width: '100%',
};

// Main page title
export const pageTitle = {
  fontSize: '2.5rem',
  fontWeight: '800',
  color: 'var(--color-primary)',
  marginBottom: '0.75rem',
  letterSpacing: '-0.025em',
  fontFamily: 'var(--font-heading)',
  lineHeight: '1.2',
};

// Descriptive subtitle
export const pageSubtitle = {
  fontSize: '1.125rem',
  color: 'var(--color-text)',
  maxWidth: '600px',
  margin: '0 auto',
  lineHeight: '1.6',
  fontFamily: 'var(--font-body)',
};

// Card-like container for the form
export const formContainer = {
  width: '100%',
  backgroundColor: '#ffffff',
  borderRadius: '1rem',
  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e5e7eb',
  overflow: 'hidden',
};

// Inner form styling
export const formSection = {
  padding: '2rem',
};

// Wrapper for each form field
export const inputGroup = {
  marginBottom: '1.5rem',
  width: '100%',
};

// Form field labels
export const inputLabel = {
  display: 'block',
  marginBottom: '0.5rem',
  fontSize: '0.875rem',
  fontWeight: '600',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
};

// Text input styling
export const textInput = {
  width: '100%',
  /* Reduced padding & font size for a more compact field */
  padding: '0.5rem 0.75rem',
  fontSize: '0.9rem',
  lineHeight: '1.5',
  borderRadius: '0.5rem',
  border: '1px solid #d1d5db',
  backgroundColor: '#ffffff',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  outline: 'none',
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
};

// Error message styling
export const errorMessage = {
  color: '#ef4444',
  fontSize: '0.875rem',
  marginTop: '0.5rem',
  fontFamily: 'var(--font-body)',
};

// Success message styling
export const successMessage = {
  color: '#10b981',
  fontSize: '0.875rem',
  marginTop: '0.5rem',
  fontFamily: 'var(--font-body)',
};

// Primary action button
export const submitButton = {
  width: '100%',
  /* Reduced padding & font size for a sleeker appearance */
  padding: '0.5rem 1rem',
  backgroundColor: 'var(--color-primary)',
  color: '#ffffff',
  fontWeight: '600',
  borderRadius: '0.5rem',
  border: 'none',
  fontSize: '0.9rem',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease, transform 0.1s ease',
  fontFamily: 'var(--font-body)',
  marginTop: '0.5rem',
};

// Disabled state for submit button
export const submitButtonDisabled = {
  backgroundColor: '#9ca3af',
  cursor: 'not-allowed',
};

// God mode indicator styling
export const godModeIndicator = {
  marginTop: '1.5rem',
  padding: '1rem',
  backgroundColor: 'rgba(99, 102, 241, 0.1)',
  borderRadius: '0.5rem',
  borderLeft: '4px solid var(--color-primary)',
  color: 'var(--color-text)',
  fontSize: '0.875rem',
  width: '100%',
};

// Keep existing styles for backward compatibility
export const onboardBox = {
  maxWidth: 500,
  mx: 'auto',
  mt: 8,
};

export const onboardCard = {
  p: 4,
};

export const onboardTitle = {
  mb: 4,
  textAlign: 'center' as const,
};
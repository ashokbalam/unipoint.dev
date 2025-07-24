// Styles specific to the Questions page

export const questionsPageWrapper = {
  width: '100%',
  maxWidth: '500px', // Match the container to align contents
  margin: '0 auto',   // Center the wrapper
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start', // Align button to the left
};

export const backButton = {
  background: 'none',
  backgroundColor: 'transparent', // Explicitly override global button background
  border: 'none',
  color: 'var(--color-primary)',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 700,
  fontFamily: 'var(--font-heading)',
  display: 'inline',
  alignItems: 'center',
  marginBottom: '0.5rem',
  padding: 0,
  borderRadius: 0,
  transition: 'color 0.2s, text-decoration 0.2s',
  textDecoration: 'none',
};

export const backButtonHover = {
  color: 'var(--color-primary)',
  textDecoration: 'underline',
};

export const pageContainer = {
  width: '100%',
  minHeight: '400px',
  borderRadius: '1.5rem',
  border: '1px solid #e0e7ff',
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem',
  background: '#fff',
};

export const heading = {
  marginTop: '0.5rem',
  marginBottom: '1.25rem',
  textAlign: 'center' as const,
  color: 'var(--color-text)',
  fontSize: '2.2rem',
  fontWeight: '900',
  letterSpacing: '-0.025em',
  lineHeight: '1.2',
  fontFamily: 'var(--font-heading)',
};

export const loadingText = {
  textAlign: 'center' as const,
  color: 'var(--color-text)',
  fontFamily: 'var(--font-body)',
};

export const errorText = {
  textAlign: 'center' as const,
  color: '#ef4444', /* Keeping a distinct error color */
  fontFamily: 'var(--font-body)',
};

export const successText = {
  textAlign: 'center' as const,
  color: 'var(--color-cta)',
  fontFamily: 'var(--font-body)',
};

export const form = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
};

export const questionBlock = {
  marginBottom: '1.5rem',
};

export const questionText = {
  marginBottom: '0.5rem',
  fontWeight: 500,
  color: 'var(--color-text)',
  fontSize: '1.1rem',
  fontFamily: 'var(--font-heading)',
};

export const optionLabel = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  cursor: 'pointer',
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
};

export const radioInput = {
  marginRight: '0.5rem',
};

export const submitButton = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: '0.5rem',
  border: 'none',
  backgroundColor: 'var(--color-primary)',
  color: 'white',
  fontSize: '1rem',
  fontWeight: '600',
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  marginTop: '1rem',
};

export const submitButtonDisabled = {
  ...submitButton,
  backgroundColor: '#9ca3af', // Gray color from arrowButtonDisabled
  color: '#e5e7eb',
  cursor: 'not-allowed',
};

export const addForm = {
  marginTop: '1.5rem',
  width: '100%',
};

export const addLabel = {
  fontSize: '0.95rem',
  fontWeight: 500,
  color: '#374151',
  marginBottom: '0.25rem',
  fontFamily: 'var(--font-body)',
};

export const addInput = {
  width: '100%',
  border: '1px solid #d1d5db',
  borderRadius: '0.5rem',
  padding: '0.5rem 0.75rem',
  fontSize: '1.1rem',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  transition: 'border-color 0.2s',
};

export const addInputFocus = {
  borderColor: 'var(--color-primary)',
};

export const addError = {
  color: '#ef4444',
  fontSize: '0.95rem',
  fontFamily: 'var(--font-body)',
};

export const addSuccess = {
  color: '#059669',
  fontSize: '0.95rem',
  fontFamily: 'var(--font-body)',
};

export const addButton = {
  width: '100%',
  background: 'var(--color-cta)',
  color: '#ffffff',
  padding: '0.75rem 0',
  borderRadius: '0.75rem',
  fontWeight: 600,
  fontSize: '1.1rem',
  fontFamily: 'var(--font-body)',
  border: 'none',
  cursor: 'pointer',
  /* enable smooth scaling */
  transform: 'scale(1)',
  display: 'inline-block',
  transition: 'background 0.2s, transform 0.2s',
};

export const addButtonHover = {
  background: '#4b1fd1',
  transform: 'scale(1.08)',  // 8% enlargement on hover
};

export const questionsScrollArea = {
  maxHeight: '350px',
  overflowY: 'auto' as const,
  width: '100%',
  marginBottom: '1.5rem',
};

export const thankYou = {
  color: '#16a34a', // text-green-600
  fontSize: '1.125rem', // text-lg
  fontWeight: 600, // font-semibold
  textAlign: 'center' as const,
  padding: '3rem 0', // py-12
};

export const totalScore = {
  marginTop: '1rem', // mt-4
};

export const storyPoints = {
  marginTop: '1rem', // mt-4
};

export const boldText = {
  fontWeight: 700, // font-bold
}; 
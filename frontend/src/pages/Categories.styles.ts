// Styles specific to the Categories page

export const categoriesPageWrapper = {
  width: '100%',
  maxWidth: '500px',
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start',
};

export const pageContainer = {
  width: '100%',
  maxWidth: '500px',
  minHeight: '400px',
  borderRadius: '1.5rem',
  border: '1px solid #e0e7ff',
  display: 'flex',
  flexDirection: 'column' as const,
  justifyContent: 'center',
  alignItems: 'center',
  padding: '2rem',
  margin: '0 auto',
  background: '#ffffff',
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

export const contentWrapper = {
  width: '100%',
};

export const categoryList = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  width: '100%',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '0.75rem',
};

export const categoryButton = {
  width: '100%',
  textAlign: 'left' as const,
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  border: '1px solid #e5e7eb',
  background: '#ffffff',
  color: 'var(--color-text)',
  fontWeight: 600,
  fontSize: '1.125rem',
  fontFamily: 'var(--font-body)',
  boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)',
  cursor: 'pointer',
  /* enable smooth scaling */
  transform: 'scale(1)',
  display: 'inline-block',
  transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
};

export const categoryButtonHover = {
  background: '#f9fafb',
  boxShadow: '0 1px 3px 0 rgba(0,0,0,0.05)',
  transform: 'scale(1.08)',   // 8% enlargement on hover
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
  boxShadow: '0 0 0 2px rgba(94, 43, 255, 0.1)',
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
  transition: 'background 0.2s',
};

export const addButtonHover = {
  background: '#4b1fd1',
};

export const backButton = {
  background: 'none',
  backgroundColor: 'transparent',
  border: 'none',
  color: 'var(--color-primary)',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 700,
  fontFamily: 'var(--font-heading)',
  display: 'inline-flex',
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
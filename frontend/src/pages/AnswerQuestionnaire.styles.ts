// Styles for AnswerQuestionnaire page

export const container = {
  maxWidth: '42rem', // max-w-2xl
  margin: '2rem auto 0 auto', // mx-auto mt-8
  background: '#ffffff', // bg-white
  borderRadius: '0.5rem', // rounded-lg
  boxShadow: '0 4px 24px rgba(0,0,0,0.08)', // shadow
  padding: '2rem', // p-8
};

export const title = {
  fontSize: '2rem', // text-2xl
  fontWeight: 700, // font-bold
  marginBottom: '1rem', // mb-4
  color: 'var(--color-primary)', // text-indigo-700
};

export const thankYou = {
  color: 'var(--color-cta)', // text-green-600
  fontSize: '1.125rem', // text-lg
  fontWeight: 600, // font-semibold
};

export const form = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '1.5rem', // space-y-6
};

export const label = {
  display: 'block', // block
  color: 'var(--color-text)', // text-gray-800
  fontWeight: 500, // font-medium
  marginBottom: '0.25rem', // mb-1
};

export const input = {
  width: '100%', // w-full
  border: '1px solid #d1d5db', // border border-gray-300
  borderRadius: '0.375rem', // rounded
  padding: '0.5rem 0.75rem', // px-3 py-2
  outline: 'none',
  fontSize: '1rem',
  transition: 'box-shadow 0.2s, border-color 0.2s',
};

export const inputFocus = {
  boxShadow: '0 0 0 2px var(--color-accent)',
  borderColor: 'var(--color-primary)',
};

export const submitButton = {
  width: '100%', // w-full
  background: 'var(--color-cta)', // bg-indigo-600
  color: '#ffffff', // text-white
  padding: '0.5rem 0', // py-2
  borderRadius: '0.375rem', // rounded
  fontWeight: 600, // font-semibold
  border: 'none',
  cursor: 'pointer',
  transition: 'background 0.2s',
};

export const submitButtonHover = {
  background: '#3730a3', // hover:bg-indigo-700
}; 
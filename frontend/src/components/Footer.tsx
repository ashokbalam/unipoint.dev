import React from 'react';
import { zIndex } from '../styles/zIndex';

const Footer: React.FC = () => {
  return (
    <footer
      style={{
        position: 'fixed',
        bottom: '1rem',
        right: '1rem',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.875rem',
        zIndex: zIndex.footer,
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem'
      }}
    >
      built with <span style={{ color: '#EF4444' }}>🔥</span> by ab
    </footer>
  );
};

export default Footer; 
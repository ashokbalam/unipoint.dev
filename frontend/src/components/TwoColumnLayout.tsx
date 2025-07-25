import React, { type ReactNode } from 'react';
import { pageWrapper } from '../App.styles';

interface TwoColumnLayoutProps {
  title: ReactNode;
  children: ReactNode;
  titleWidth?: string;
  contentWidth?: string;
  gap?: string;
  titleAlign?: 'top' | 'center' | 'bottom';
  customTitleStyles?: React.CSSProperties;
  customContentStyles?: React.CSSProperties;
}

const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  title,
  children,
  titleWidth = '30%',
  contentWidth = '70%',
  gap = '2rem',
  titleAlign = 'top',
  customTitleStyles = {},
  customContentStyles = {},
}) => {
  // Base container style
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    width: '100%',
    minHeight: '100vh',
    background: 'var(--color-background)',
    padding: '2rem',
  };

  // Title column style
  const titleColumnStyle: React.CSSProperties = {
    width: titleWidth,
    paddingRight: gap,
    display: 'flex',
    flexDirection: 'column',
    ...(titleAlign === 'center' && { justifyContent: 'center' }),
    ...(titleAlign === 'bottom' && { justifyContent: 'flex-end' }),
    ...customTitleStyles,
  };

  // Title text style
  const titleStyle: React.CSSProperties = {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    fontFamily: 'var(--font-heading)',
    marginBottom: '1rem',
  };

  // Content column style
  const contentColumnStyle: React.CSSProperties = {
    width: contentWidth,
    backgroundColor: '#ffffff',
    borderRadius: '1.5rem',
    border: '1px solid #e0e7ff',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    ...customContentStyles,
  };

  // Responsive styles for smaller screens
  const mediaQuery = window.matchMedia('(max-width: 768px)');
  const isMobile = mediaQuery.matches;

  const responsiveContainerStyle: React.CSSProperties = isMobile
    ? {
        ...containerStyle,
        flexDirection: 'column',
      }
    : containerStyle;

  const responsiveTitleColumnStyle: React.CSSProperties = isMobile
    ? {
        ...titleColumnStyle,
        width: '100%',
        paddingRight: 0,
        paddingBottom: gap,
      }
    : titleColumnStyle;

  const responsiveContentColumnStyle: React.CSSProperties = isMobile
    ? {
        ...contentColumnStyle,
        width: '100%',
      }
    : contentColumnStyle;

  return (
    <div style={pageWrapper}>
      <div style={responsiveContainerStyle}>
        <div style={responsiveTitleColumnStyle}>
          {typeof title === 'string' ? <h1 style={titleStyle}>{title}</h1> : title}
        </div>
        <div style={responsiveContentColumnStyle}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default TwoColumnLayout;

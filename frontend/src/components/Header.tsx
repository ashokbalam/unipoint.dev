import React from 'react';
import { Link } from 'react-router-dom';
import {
  header,
  headerCenteredContent,
  fadeMessageText
} from '../App.styles';
import { headerSvgWrapper, headerSvg, fadeMessageBelowSvg } from '../pages/TeamSelectionPage.styles';

const fadeMessages = [
  '"let estimation no longer be subjective"',
  '"ask the right questions before you estimate"',
  '"get your team on the same page, every time"',
  '"from guesswork to grounded decisions"'
];

const Header: React.FC = () => {
  // Fade message state
  const [fadeIndex, setFadeIndex] = React.useState(0);
  const [fade, setFade] = React.useState(true);
  React.useEffect(() => {
    const fadeOut = setTimeout(() => setFade(false), 8000); // 8s visible
    const fadeIn = setTimeout(() => {
      setFadeIndex((prev) => (prev + 1) % fadeMessages.length);
      setFade(true);
    }, 10000); // 2s fade out, 8s visible
    return () => {
      clearTimeout(fadeOut);
      clearTimeout(fadeIn);
    };
  }, [fadeIndex]);
  // Remove isHome logic, always show SVG
  return (
    <header style={header}>
      {/* Centered SVG + fade message */}
      <div style={headerCenteredContent}>
        <Link to="/" style={{ textDecoration: 'none', display: 'block' }}>
          <div style={headerSvgWrapper}>
            <svg
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              x="0px"
              y="0px"
              viewBox="0 0 600 100"
              style={{ ...headerSvg, fill: 'var(--color-primary)' }}
              xmlSpace="preserve"
            >
              <g>
                <path d="M11.27,62.93V18.21c0-3.55,2.89-6.44,6.44-6.44s6.44,2.89,6.44,6.44v44.72c0,6.77,2.55,14.65,15.09,14.65
              s15.09-7.88,15.09-14.65V18.21c0-3.55,2.89-6.44,6.44-6.44c3.55,0,6.44,2.89,6.44,6.44v44.72c0,12.65-5.55,25.97-27.97,25.97
              S11.27,75.58,11.27,62.93z"/>
              <path d="M156.53,18.1V81.9c0,3.44-2.89,6.33-6.33,6.33c-2.11,0-4.11-1.11-5.22-2.77l-32.74-47.27V81.9c0,3.44-2.89,6.33-6.33,6.33
              s-6.33-2.89-6.33-6.33V18.1c0-3.44,2.89-6.33,6.33-6.33c2.22,0,3.99,1,5.11,2.66l32.85,47.61V18.1c0-3.44,2.89-6.33,6.33-6.33
              S156.53,14.66,156.53,18.1z"/>
              <path d="M202.36,81.79c0,3.55-2.89,6.44-6.44,6.44c-3.55,0-6.44-2.89-6.44-6.44V18.21c0-3.55,2.88-6.44,6.44-6.44
              c3.55,0,6.44,2.89,6.44,6.44V81.79z"/>
              <path d="M248.75,58.27v23.53c0,3.55-2.89,6.44-6.44,6.44c-3.55,0-6.44-2.89-6.44-6.44v-62.7c0-3.55,2.88-6.44,6.44-6.44h21.2
              c12.98,0,23.3,7.21,23.3,22.75c0,15.31-10.1,22.86-23.3,22.86H248.75z M248.75,24.2v22.53h13.76c6.88,0,10.99-4.11,10.99-11.32
              c0-7.32-4.22-11.21-10.99-11.21H248.75z"/>
              <path d="M307.95,50.06c0-26.3,12.76-38.95,35.18-38.95s35.18,12.65,35.18,38.95c0,25.97-12.76,38.84-35.18,38.84
              S307.95,76.02,307.95,50.06z M321.26,50.06c0,18.31,7.21,27.3,21.86,27.3s21.86-8.99,21.86-27.3c0-18.42-7.21-27.41-21.86-27.41
              S321.26,31.63,321.26,50.06z"/>
              <path d="M417.47,81.79c0,3.55-2.89,6.44-6.44,6.44c-3.55,0-6.44-2.89-6.44-6.44V18.21c0-3.55,2.89-6.44,6.44-6.44
              c3.55,0,6.44,2.89,6.44,6.44V81.79z"/>
              <path d="M507.36,18.1V81.9c0,3.44-2.89,6.33-6.33,6.33c-2.11,0-4.11-1.11-5.22-2.77l-32.74-47.27V81.9c0,3.44-2.89,6.33-6.33,6.33
              c-3.44,0-6.32-2.89-6.32-6.33V18.1c0-3.44,2.89-6.33,6.32-6.33c2.22,0,4,1,5.11,2.66l32.85,47.61V18.1c0-3.44,2.89-6.33,6.33-6.33
              C504.47,11.77,507.36,14.66,507.36,18.1z"/>
              <path d="M566.09,23.98v57.82c0,3.55-2.89,6.44-6.44,6.44c-3.55,0-6.44-2.89-6.44-6.44V23.98h-16.98c-3.11,0-5.66-2.55-5.66-5.66
              s2.55-5.66,5.66-5.66h46.83c3.11,0,5.66,2.55,5.66,5.66s-2.55,5.66-5.66,5.66H566.09z"/>
              </g>
            </svg>
          </div>
        </Link>
        <div style={fadeMessageBelowSvg}>
          <div style={{ ...fadeMessageText, opacity: fade ? 1 : 0 }}>
            {fadeMessages[fadeIndex]}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 
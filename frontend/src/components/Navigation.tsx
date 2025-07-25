import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  rightNavigation,
  rightNavigationHover,
  navigationList,
  navigationItem,
  navigationLink,
  navigationLinkHover,
  navigationLinkActive,
} from '../App.styles';

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */
interface NavigationProps {
  isGodModeEnabled: boolean;
  toggleGodMode: () => void;
}

const Navigation: React.FC<NavigationProps> = ({
  isGodModeEnabled,
  toggleGodMode,
}) => {
  // Track which link is being hovered
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  // Track whether the entire navigation area is hovered
  const [navHovered, setNavHovered] = useState<boolean>(false);

  // Navigation items configuration
  const navItems = [
    { path: '/', label: 'Estimate', id: 'home', adminOnly: false },
    // Single consolidated admin link
    { path: '/manage', label: 'Manage', id: 'manage', adminOnly: true },
  ];

  // Style for the active bullet indicator
  const bulletStyle: React.CSSProperties = {
    display: 'inline-block',
    marginRight: '0.35rem',
    /* Use primary color so active link stands out */
    color: 'var(--color-primary)',
    fontSize: '1.5rem',
    /* Align bullet with the baseline of the text for perfect centering */
    lineHeight: 1,
    verticalAlign: 'baseline',
  };

  return (
    <nav
      style={navHovered ? rightNavigationHover : rightNavigation}
      aria-label="Main navigation"
      onMouseEnter={() => setNavHovered(true)}
      onMouseLeave={() => setNavHovered(false)}
    >
      <ul style={navigationList}>
        {navItems.map((item, idx) => (
          <React.Fragment key={item.id}>
            {/* Navigation Link */}
            <li style={navigationItem}>
              <NavLink
              to={item.path}
              style={({ isActive }) => {
                // base style applied to every link
                const baseStyle = {
                  ...navigationLink,
                  ...(isActive ? navigationLinkActive : {}),
                  ...(hoveredLink === item.id ? navigationLinkHover : {}),
                };

                return baseStyle;
              }}
              onMouseEnter={() => setHoveredLink(item.id)}
              onMouseLeave={() => setHoveredLink(null)}
              /* Allow navigation; ManagePage will request pass-code if needed */
            >
              {({ isActive }) => (
                <>
                  {isActive && <span style={bulletStyle}>•</span>}
                  {item.label}
                </>
              )}
              </NavLink>
            </li>

          </React.Fragment>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;

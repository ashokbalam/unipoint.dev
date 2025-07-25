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
  navigationLinkDisabled,
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
    color: 'var(--color-secondary)',
    fontSize: '1.5rem',
    lineHeight: 0,
    verticalAlign: 'middle',
  };

  return (
    <nav
      style={navHovered ? rightNavigationHover : rightNavigation}
      aria-label="Main navigation"
      onMouseEnter={() => setNavHovered(true)}
      onMouseLeave={() => setNavHovered(false)}
    >
      <ul style={navigationList}>
        {navItems.map((item) => (
          <li key={item.id} style={navigationItem}>
            <NavLink
              to={item.path}
              style={({ isActive }) => {
                // base style applied to every link
                const baseStyle = {
                  ...navigationLink,
                  ...(isActive ? navigationLinkActive : {}),
                  ...(hoveredLink === item.id ? navigationLinkHover : {}),
                };

                // if link requires God Mode and it's not enabled, add strikethrough
                if (item.adminOnly && !isGodModeEnabled) {
                  return {
                    ...baseStyle,
                    textDecoration: 'line-through',
                  };
                }

                return baseStyle;
              }}
              onMouseEnter={() => setHoveredLink(item.id)}
              onMouseLeave={() => setHoveredLink(null)}
              onClick={(e) => {
                if (item.adminOnly && !isGodModeEnabled) {
                  e.preventDefault();
                  toggleGodMode();
                }
              }}
            >
              {({ isActive }) => (
                <>
                  {isActive && <span style={bulletStyle}>•</span>}
                  {item.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;

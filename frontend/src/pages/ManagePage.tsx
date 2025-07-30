import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TwoColumnLayout from '../components/TwoColumnLayout';
import {
  containerContent,
  bodyText,
  cardBase,
  cardHover,
} from '../App.styles';

const PASSCODE = 'admin123';

const ManagePage: React.FC = () => {
  const navigate = useNavigate();
  
  // Track which card is being hovered
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  // God-mode auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  /* -----------------------------------------------------------
   * Check sessionStorage once on mount to persist auth per tab
   * --------------------------------------------------------- */
  useEffect(() => {
    const stored = sessionStorage.getItem('managementAuthenticated');
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  
  // Card data with titles, descriptions, and routes (icons removed)
  const managementCards = [
    {
      id: 'teams',
      title: 'Teams',
      description: 'Create and manage teams for your organization. Add new teams and configure team settings.',
      route: '/onboard',
    },
    {
      id: 'categories',
      title: 'Categories',
      description: 'Organize questions into categories. Set up rubrics for scoring and estimation.',
      route: '/categories',
    },
    {
      id: 'questions',
      title: 'Questions',
      description: 'Create and manage assessment questions. Configure options and point values.',
      route: '/questions',
    },
    {
      id: 'upload',
      title: 'Bulk Upload',
      description: 'Import multiple categories and questions at once using CSV or JSON files.',
      route: '/bulk-upload',
    },
  ];
  
  // Card container using flexbox for even distribution
  // Wrapper flex styles will now vertically + horizontally centre the grid,
  // so cardGrid no longer needs its own auto-margin centring.
  // Card container: 2-column CSS Grid (two cards on top row, two on bottom)
  const cardGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)', // exactly 2 columns
    /* Bigger gap for clearer visual separation */
    gap: '2rem',
    /* Keep grid compact so parent container shows clear margins */
    maxWidth: '700px',
    /* Extra padding so the grid never touches the white box edges */
    padding: '1rem 0',
    /* Make each cell stretch and use all available height */
    gridAutoRows: '1fr',
    /* Center the grid inside the white container */
    placeItems: 'stretch',
    /* Align the overall 2×2 grid block in the middle of its parent */
    justifyContent: 'center',
  };

  // Parent container of the grid: centre its children both vertically & horizontally
  const containerCentered = {
    ...containerContent,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  };
  
  // Enhanced card styles with fixed width for even distribution
  const cardStyle = {
    ...cardBase,
    padding: '1.5rem',
    // Width now controlled by grid; let it fill the grid cell
    /* -----------------------------------------------------------
     * Explicit border + borderColor so the element’s dimensions
     * never change between normal and hover states.  Matches
     * non-hover border used for category cards (#e5e7eb).
     * --------------------------------------------------------- */
    border: '1px solid #e5e7eb',
    borderColor: '#e5e7eb',
    display: 'flex',
    flexDirection: 'column' as const,
    /* Only animate the properties that actually change on hover
       to avoid any subtle re-painting or font-shift effects. */
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  };
  
  /* -------------------------------------------------
   * Hover style – matches category selection cards
   * Light-purple background with primary-colour border
   * ------------------------------------------------- */
  const cardHoverStyle = {
    ...cardHover,
    backgroundColor: '#faf5ff',          // light purple background
    borderColor: 'var(--color-primary)', // primary brand colour border
  };
  
  const cardTitle = {
    /* Enlarged for better prominence */
    fontSize: '1.75rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '0.75rem',
    fontFamily: 'var(--font-heading)',
  };
  
  const cardDescription = {
    ...bodyText,
    color: 'var(--color-text-light, #4b5563)',
  };
  
  // Handle card click to navigate
  const handleCardClick = (route: string) => {
    navigate(route);
  };
  /* ------------------------------------------------------------------
   * Simple auth gate – ask for pass-code before showing cards
   * ----------------------------------------------------------------- */
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === PASSCODE) {
      setIsAuthenticated(true);
      setError(null);
      // Persist flag for the remainder of the tab's session
      sessionStorage.setItem('managementAuthenticated', 'true');
    } else {
      setError('Incorrect passcode');
    }
  };
  
  return (
    <TwoColumnLayout title="Manage">
      
      <div style={containerContent}>
        {/* If not authenticated show passcode form */}
        {!isAuthenticated ? (
          <form
            onSubmit={handleAuthSubmit}
            style={{
              maxWidth: '400px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <label htmlFor="passcode" style={{ fontWeight: 600 }}>
              Enter Admin Passcode
            </label>
            <input
              id="passcode"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '1rem',
              }}
            />
            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>
            )}
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Continue
            </button>
          </form>
        ) : (
        <div style={containerCentered}>
          <div style={cardGrid}>
            {managementCards.map((card) => (
              <div
              key={card.id}
              style={
                hoveredCard === card.id
                  ? { ...cardStyle, ...cardHoverStyle }
                  : cardStyle
              }
              onClick={() => handleCardClick(card.route)}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
              role="button"
              tabIndex={0}
              aria-label={`Manage ${card.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(card.route);
                }
              }}
            >
              <div style={cardTitle}>{card.title}</div>
              <div style={cardDescription}>{card.description}</div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </TwoColumnLayout>
  );
};

export default ManagePage;

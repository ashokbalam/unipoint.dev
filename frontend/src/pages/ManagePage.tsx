import React, { useState } from 'react';
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
  
  // Card data with icons, titles, descriptions, and routes
  const managementCards = [
    {
      id: 'teams',
      icon: '👥',
      title: 'Teams',
      description: 'Create and manage teams for your organization. Add new teams and configure team settings.',
      route: '/onboard',
    },
    {
      id: 'categories',
      icon: '📋',
      title: 'Categories',
      description: 'Organize questions into categories. Set up rubrics for scoring and estimation.',
      route: '/categories',
    },
    {
      id: 'questions',
      icon: '❓',
      title: 'Questions',
      description: 'Create and manage assessment questions. Configure options and point values.',
      route: '/questions',
    },
    {
      id: 'upload',
      icon: '📤',
      title: 'Bulk Upload',
      description: 'Import multiple categories and questions at once using CSV or JSON files.',
      route: '/bulk-upload',
    },
  ];
  
  // Card container grid layout
  const cardGrid = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    width: '100%',
  };
  
  // Enhanced card styles
  const cardStyle = {
    ...cardBase,
    padding: '1.5rem',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    transition: 'all 0.2s ease',
  };
  
  const cardHoverStyle = {
    ...cardHover,
    transform: 'translateY(-4px)',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  };
  
  const cardIcon = {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  };
  
  const cardTitle = {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '0.75rem',
    fontFamily: 'var(--font-heading)',
  };
  
  const cardDescription = {
    ...bodyText,
    color: 'var(--color-text-light, #4b5563)',
    // Description now sits directly below title; no need for extra push
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
              <div style={cardIcon} aria-hidden="true">
                {card.icon}
              </div>
              <div style={cardTitle}>{card.title}</div>
              <div style={cardDescription}>{card.description}</div>
            </div>
          ))}
        </div>
        )}
      </div>
    </TwoColumnLayout>
  );
};

export default ManagePage;

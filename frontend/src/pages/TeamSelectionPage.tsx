import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  searchInput,
  arrowButton,
  arrowButtonDisabled,
  teamTitle,
  pageContainer,
  contentWrapper,
  searchContainer,
  suggestionText,
  suggestionSpan,
} from './TeamSelectionPage.styles';

interface Team {
  id: string;
  name: string;
}

const TeamSelectionPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Team[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [arrowBtnHover, setArrowBtnHover] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Clear selection if search is cleared
    if (!search.trim()) {
      setSuggestions([]);
      setSelectedTenantId(null);
      return;
    }

    // Debounce the search
    const debounceTimer = setTimeout(() => {
      axios.get(`http://localhost:4000/tenants?search=${search}`)
        .then(res => {
          setSuggestions(res.data);
        })
        .catch(() => setSuggestions([]));
    }, 300); // 300ms delay

    return () => clearTimeout(debounceTimer);
  }, [search]);

  useEffect(() => {
    // Check for an exact match from the suggestions to enable the arrow button
    const exactMatch = suggestions.find(
      team => team.name.toLowerCase() === search.toLowerCase()
    );
    if (exactMatch) {
      setSelectedTenantId(exactMatch.id);
    } else {
      setSelectedTenantId(null);
    }
  }, [search, suggestions]);
  
  const suggestedText =
    suggestions.find(s => s.name.toLowerCase().startsWith(search.toLowerCase()))
      ?.name || '';

  return (
    <div style={pageContainer}>
      <div style={contentWrapper}>
        <h2 style={teamTitle}>Pick Your Squad</h2>
        <div style={searchContainer}>
          <input
            ref={inputRef}
            type="text"
            style={{
              ...searchInput,
              borderColor: selectedTenantId ? 'var(--color-primary)' : 'black',
              boxShadow: selectedTenantId ? '0 0 0 3px rgba(94, 43, 255, 0.1)' : 'none',
              fontWeight: '300', // placeholder:font-thin
              ...(document.activeElement === inputRef?.current ? {
                borderColor: 'var(--color-primary)',
                boxShadow: '0 0 0 3px rgba(94,43,255,0.1)'
              } : {})
            }}
            placeholder="start typing your squad name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Tab' && suggestedText) {
                e.preventDefault();
                const match = suggestions.find(s => s.name === suggestedText);
                if (match) {
                  setSearch(match.name);
                  setSelectedTenantId(match.id);
                }
              }
              if (e.key === 'Enter' && selectedTenantId) {
                e.preventDefault();
                navigate('/categories', { state: { tenantId: selectedTenantId } });
              }
            }}
          />
          {suggestedText && search && (
            <div style={suggestionText}>
              <span>{search}</span>
              <span style={suggestionSpan}>
                {suggestedText.substring(search.length)}
              </span>
            </div>
          )}
          <button
            onClick={() => {
              if (selectedTenantId) {
                navigate('/categories', { state: { tenantId: selectedTenantId } });
              }
            }}
            disabled={!selectedTenantId}
            style={selectedTenantId ? (arrowBtnHover ? { ...arrowButton, background: 'var(--color-primary)' } : arrowButton) : arrowButtonDisabled}
            onMouseEnter={() => setArrowBtnHover(true)}
            onMouseLeave={() => setArrowBtnHover(false)}
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'right', width: '100%', minHeight: '1.25rem' }}>
        {(() => {
          if (selectedTenantId) {
            return 'hit enter to continue';
          }
          if (search.trim().length > 2 && suggestions.length === 0) {
            return "couldn't find your squad";
          }
          if (suggestedText) {
            return 'hit tab to autofill';
          }
          return '';
        })()}
      </div>
    </div>
  );
};

export default TeamSelectionPage; 
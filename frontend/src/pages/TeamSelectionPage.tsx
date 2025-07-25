import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  searchContainer,
  suggestionText,
  suggestionSpan,
  pageContainer,
  contentWrapper,
  searchInput,
  arrowButton,
  arrowButtonDisabled,
} from './TeamSelectionPage.styles';

// Import common container styles and design system
import {
  pageWrapper,
  boxedContainer,
  containerHeader,
  containerContent,
  h2,
  primaryButton,
  primaryButtonHover,
  buttonDisabled,
  backButtonBase,
  backButtonHover,
  smallText,
} from '../App.styles';

// Interfaces for the multi-step flow
// Two-column layout used across admin pages
import TwoColumnLayout from '../components/TwoColumnLayout';
interface Team {
  id: string;
  name: string;
}

interface RubricRange {
  min: number;
  max: number;
  storyPoints: number;
}

interface Category {
  id: string;
  name: string;
  rubric: RubricRange[];
}

interface Option {
  id: string;
  label: string;
  points: number;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  categoryId: string;
}

// Type for the current step in the flow
type Step = 'team' | 'category' | 'questions' | 'results';

// Reusable loading spinner component
const LoadingSpinner = () => (
  <div
    style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    {/* Secondary-coloured spinning circle */}
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        color: 'var(--color-secondary)',
        animation: 'spin 1s linear infinite',
      }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="62.83"
        strokeDashoffset="15.71"
        strokeLinecap="round"
      />
    </svg>
    {/* Keyframes injected locally to scope animation */}
    <style>
      {`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}
    </style>
  </div>
);

const TeamSelectionPage: React.FC = () => {
  // Navigation
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Step management
  const [currentStep, setCurrentStep] = useState<Step>('team');
  
  // Team selection state
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [arrowBtnHover, setArrowBtnHover] = useState(false);
  
  // Category selection state
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryHover, setCategoryHover] = useState<string | null>(null);
  
  // Question answering state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{[questionId: string]: number}>({});
  
  // Results state
  const [totalScore, setTotalScore] = useState<number>(0);
  const [storyPoints, setStoryPoints] = useState<number | null>(null);
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [backBtnHover, setBackBtnHover] = useState(false);
  const [submitBtnHover, setSubmitBtnHover] = useState(false);
  // Track whether the search input currently has focus
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  
  /*
   * ------------------------------------------------------------------
   * Click-outside detection for the search input
   * Ensures helper text disappears when user clicks anywhere else
   * ------------------------------------------------------------------
   */
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      // If ref is set and the click target is outside the input element
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsInputFocused(false);
      }
    };

    // Use mousedown so the blur happens immediately on click
    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  // Team search and selection
  useEffect(() => {
    // Clear selection if search is cleared
    if (!search.trim()) {
      setSuggestions([]);
      setSelectedTeam(null);
      return;
    }

    // Debounce the search
    const debounceTimer = setTimeout(() => {
      setLoading(true);
      axios.get(`http://localhost:4000/tenants?search=${search}`)
        .then(res => {
          setSuggestions(res.data);
          setLoading(false);
        })
        .catch(() => {
          setSuggestions([]);
          setError('Failed to load teams');
          setLoading(false);
        });
    }, 300); // 300ms delay

    return () => clearTimeout(debounceTimer);
  }, [search]);

  useEffect(() => {
    // Check for an exact match from the suggestions
    const exactMatch = suggestions.find(
      team => team.name.toLowerCase() === search.toLowerCase()
    );
    if (exactMatch) {
      setSelectedTeam(exactMatch);
    } else {
      setSelectedTeam(null);
    }
  }, [search, suggestions]);
  
  // Load categories when a team is selected
  useEffect(() => {
    if (currentStep === 'category' && selectedTeam) {
      setLoading(true);
      axios.get(`http://localhost:4000/categories?tenantId=${selectedTeam.id}`)
        .then(res => {
          setCategories(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading categories:', err);
          setError('Failed to load categories');
          setLoading(false);
        });
    }
  }, [currentStep, selectedTeam]);
  
  // Load questions when a category is selected
  useEffect(() => {
    if (currentStep === 'questions' && selectedCategory) {
      setLoading(true);
      axios.get(`http://localhost:4000/questions?categoryId=${selectedCategory.id}`)
        .then(res => {
          setQuestions(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading questions:', err);
          setError('Failed to load questions');
          setLoading(false);
        });
    }
  }, [currentStep, selectedCategory]);
  
  // Auto-suggestion text for team search
  const suggestedText =
    suggestions.find(s => s.name.toLowerCase().startsWith(search.toLowerCase()))
      ?.name || '';
  
  // Handle team selection and move to next step
  const handleTeamSelect = () => {
    if (selectedTeam) {
      setCurrentStep('category');
    }
  };
  
  // Handle category selection and move to next step
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setCurrentStep('questions');
  };
  
  // Handle answer selection
  const handleAnswerSelect = (questionId: string, points: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: points
    }));
  };
  
  // Check if all questions have been answered
  const allQuestionsAnswered = questions.length > 0 && 
    questions.every(q => answers[q.id] !== undefined);
  
  // Submit answers and calculate results
  const handleSubmitAnswers = () => {
    if (!allQuestionsAnswered || !selectedCategory) return;
    
    // Calculate total score
    const total = Object.values(answers).reduce((sum, points) => sum + points, 0);
    setTotalScore(total);
    
    // Calculate story points based on rubric
    const { rubric } = selectedCategory;
    const matchingRange = rubric.find(r => total >= r.min && total <= r.max);
    
    if (matchingRange) {
      setStoryPoints(matchingRange.storyPoints);
    } else {
      setStoryPoints(null);
    }
    
    setCurrentStep('results');
  };
  
  
  const handleBack = () => {
    if (currentStep === 'category') {
      setCurrentStep('team');
      setSelectedCategory(null);
    } else if (currentStep === 'questions') {
      setCurrentStep('category');
      setQuestions([]);
      setAnswers({});
    } else if (currentStep === 'results') {
      setCurrentStep('questions');
      setTotalScore(0);
      setStoryPoints(null);
    }
  };
  
  // Reset the whole flow
  const handleReset = () => {
    setCurrentStep('team');
    setSelectedTeam(null);
    setSelectedCategory(null);
    setQuestions([]);
    setAnswers({});
    setTotalScore(0);
    setStoryPoints(null);
    setSearch('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Custom styles for components
  const enhancedContentWrapper = {
    ...contentWrapper,
    padding: '2rem 3rem',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  };
  
  const enhancedTitle = {
    ...h2,
    marginTop: '1.5rem',
    marginBottom: '1.5rem',
    textAlign: 'center' as const,
  };
  
  const categoryName = {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '0.25rem',
  };
  
  /* -------------------------------------------------
   * Category Card (consistent border + subtle hover)
   * ------------------------------------------------- */
  const categoryCardBase = {
    // Darker grey for better initial visibility while still subtle
    border: '1px solid #d1d5db',               // always-visible border
    borderRadius: '0.75rem',
    backgroundColor: '#ffffff',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'background 0.2s, border-color 0.2s',
    marginBottom: '0.75rem',
    display: 'flex',
    alignItems: 'center',
  };

  const categoryCardHover = {
    backgroundColor: 'rgba(251, 146, 60, 0.08)', // light secondary tint
    borderColor: 'var(--color-secondary)',       // highlight border
  };

  const questionContainer = {
    marginBottom: '1.5rem',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
  };
  
  const questionText = {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '0.75rem',
    color: 'var(--color-text)',
  };
  
  const optionContainer = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    cursor: 'pointer',
    borderRadius: '0.25rem',
    transition: 'background-color 0.2s',
  };
  
  const optionLabel = {
    fontSize: '0.875rem',
    color: 'var(--color-text)',
  };
  
  const optionPoints = {
    fontSize: '0.75rem',
    color: '#6b7280',
    marginLeft: 'auto',
  };
  
  const resultContainer = {
    textAlign: 'center' as const,
    padding: '2rem',
  };
  
  const resultScore = {
    fontSize: '3rem',
    fontWeight: 800,
    color: 'var(--color-primary)',
    marginBottom: '0.5rem',
  };
  
  const resultLabel = {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '2rem',
  };
  
  const resultStoryPoints = {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--color-secondary)',
    marginBottom: '0.5rem',
  };
  
  // Modified searchInput with updated font size
  const customSearchInput = {
    ...searchInput,
    fontSize: '1.375rem', // Match navigation link size
    fontFamily: 'var(--font-heading)',
  };
  
  // Modified suggestionText with updated font size
  const customSuggestionText = {
    ...suggestionText,
    fontSize: '1.375rem', // Match input size exactly
    fontFamily: 'var(--font-heading)',
  };
  
  // Three-column header layout for true centering
  const threeColumnHeader = {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    marginBottom: '1rem',
  };
  
  const headerColumn = {
    flex: '1 0 33.333%', // Each column takes exactly 1/3 of the space
    display: 'flex',
    alignItems: 'center',
  };
  
  const leftColumn = {
    ...headerColumn,
    justifyContent: 'flex-start', // Align back button to the left
  };
  
  const centerColumn = {
    ...headerColumn,
    justifyContent: 'center', // Center the team name
  };
  
  const rightColumn = {
    ...headerColumn,
    // Empty column for balance
  };
  
  // Render different content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 'team':
        return (
          <div style={enhancedContentWrapper}>
            <h2 style={enhancedTitle}>Pick Your Squad</h2>
            <div style={searchContainer}>
              <input
                ref={inputRef}
                type="text"
                style={{
                  ...customSearchInput,
                  ...(document.activeElement === inputRef?.current ? {
                    borderColor: 'var(--color-primary)',
                    boxShadow: '0 0 0 3px rgba(94, 43, 255, 0.1)'
                  } : {}),
                  ...(selectedTeam ? {
                    borderColor: 'var(--color-primary)',
                    boxShadow: '0 0 0 3px rgba(94, 43, 255, 0.1)'
                  } : {})
                }}
                placeholder="start typing your squad name"
                value={search}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Tab' && suggestedText) {
                    e.preventDefault();
                    const match = suggestions.find(s => s.name === suggestedText);
                    if (match) {
                      setSearch(match.name);
                      setSelectedTeam(match);
                    }
                  }
                  if (e.key === 'Enter' && selectedTeam) {
                    e.preventDefault();
                    handleTeamSelect();
                  }
                }}
              />
              {suggestedText && search && (
                <div style={customSuggestionText}>
                  <span>{search}</span>
                  <span style={suggestionSpan}>
                    {suggestedText.substring(search.length)}
                  </span>
                </div>
              )}
              <button
                onClick={handleTeamSelect}
                disabled={!selectedTeam}
                style={selectedTeam ? 
                  (arrowBtnHover ? 
                    { ...arrowButton, background: 'var(--color-primary)', ...primaryButtonHover } : 
                    arrowButton) : 
                  arrowButtonDisabled}
                onMouseEnter={() => setArrowBtnHover(true)}
                onMouseLeave={() => setArrowBtnHover(false)}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            {/* Fixed height to prevent layout shift when helper text changes */}
            <div style={{ ...smallText, marginTop: '0.5rem', textAlign: 'right', width: '100%', height: '1.25rem' }}>
              {(() => {
                if (loading) {
                  return 'searching';
                }
                if (selectedTeam && isInputFocused) {
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
        
      case 'category':
        return (
          <>
            {/* Three-column header layout for true centering */}
            <div style={threeColumnHeader}>
              {/* Left column: Back button */}
              <div style={leftColumn}>
                <button
                  style={backBtnHover ? { ...backButtonBase, ...backButtonHover } : backButtonBase}
                  onClick={handleBack}
                  onMouseEnter={() => setBackBtnHover(true)}
                  onMouseLeave={() => setBackBtnHover(false)}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight: '0.25rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Change Squad
                </button>
              </div>
              
              {/* Center column: Team name */}
              <div style={centerColumn}>
                {selectedTeam && (
                  <div style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                    fontWeight: 500,
                  }}>
                    Squad: {selectedTeam.name}
                  </div>
                )}
              </div>
              
              {/* Right column: Empty space for balance */}
              <div style={rightColumn}></div>
            </div>
            
            <div style={containerContent}>
              {loading ? (
                <div style={{ position: 'relative', flex: 1 }}>
                  <LoadingSpinner />
                </div>
              ) : categories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  No categories found for this team.
                </div>
              ) : (
                <div>
                  {categories.map(category => (
                    <div
                      key={category.id}
                      style={
                        categoryHover === category.id
                          ? { ...categoryCardBase, ...categoryCardHover }
                          : categoryCardBase
                      }
                      onClick={() => handleCategorySelect(category)}
                      onMouseEnter={() => setCategoryHover(category.id)}
                      onMouseLeave={() => setCategoryHover(null)}
                    >
                      <div style={categoryName}>{category.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        );
        
      case 'questions':
        return (
          <>
            {/* Three-column header layout for true centering */}
            <div style={threeColumnHeader}>
              {/* Left column: Back button */}
              <div style={leftColumn}>
                <button
                  style={backBtnHover ? { ...backButtonBase, ...backButtonHover } : backButtonBase}
                  onClick={handleBack}
                  onMouseEnter={() => setBackBtnHover(true)}
                  onMouseLeave={() => setBackBtnHover(false)}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight: '0.25rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Categories
                </button>
              </div>
              
              {/* Center column: Team and Category info */}
              <div style={centerColumn}>
                {selectedTeam && selectedCategory && (
                  <div style={{
                    fontSize: '1rem',
                    color: '#6b7280',
                    fontWeight: 500,
                  }}>
                    Squad: {selectedTeam.name} | Category: {selectedCategory.name}
                  </div>
                )}
              </div>
              
              {/* Right column: Empty space for balance */}
              <div style={rightColumn}></div>
            </div>
            
            <div style={containerContent}>
              {loading ? (
                <div style={{ position: 'relative', flex: 1 }}>
                  <LoadingSpinner />
                </div>
              ) : questions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  No questions found for this category.
                </div>
              ) : (
                <div>
                  {questions.map((question, index) => (
                    <div key={question.id} style={questionContainer}>
                      <div style={questionText}>{index + 1}. {question.text}</div>
                      {question.options.map(option => (
                        <label
                          key={option.id}
                          style={{
                            ...optionContainer,
                            ...(answers[question.id] === option.points ? { backgroundColor: '#f0f9ff', borderColor: '#3b82f6' } : {})
                          }}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            checked={answers[question.id] === option.points}
                            onChange={() => handleAnswerSelect(question.id, option.points)}
                            style={{
                              marginRight: '0.5rem',
                              /* Use primary brand colour for checked state (modern browsers) */
                              accentColor: 'var(--color-primary)',
                            }}
                          />
                          <span style={optionLabel}>{option.label}</span>
                          <span style={optionPoints}>{option.points} points</span>
                        </label>
                      ))}
                    </div>
                  ))}
                  
                  <button
                    onClick={handleSubmitAnswers}
                    disabled={!allQuestionsAnswered}
                    style={
                      !allQuestionsAnswered
                        ? { ...buttonDisabled, width: '100%', marginTop: '1.5rem' }
                        : submitBtnHover
                        ? { ...primaryButton, ...primaryButtonHover, width: '100%', marginTop: '1.5rem' }
                        : { ...primaryButton, width: '100%', marginTop: '1.5rem' }
                    }
                    onMouseEnter={() => setSubmitBtnHover(true)}
                    onMouseLeave={() => setSubmitBtnHover(false)}
                  >
                    Submit Answers
                  </button>
                </div>
              )}
            </div>
          </>
        );
        
      case 'results':
        return (
          <>
            <div style={containerHeader}>
              <button
                style={backBtnHover ? { ...backButtonBase, ...backButtonHover } : backButtonBase}
                onClick={handleBack}
                onMouseEnter={() => setBackBtnHover(true)}
                onMouseLeave={() => setBackBtnHover(false)}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight: '0.25rem' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Questions
              </button>
              
              <h2 style={h2}>Estimation Results</h2>
            </div>
            
            <div style={containerContent}>
              <div style={resultContainer}>
                <div style={resultScore}>{totalScore}</div>
                <div style={resultLabel}>Total Points</div>
                
                <div style={resultStoryPoints}>
                  {storyPoints !== null ? storyPoints : '?'}
                </div>
                <div style={resultLabel}>Story Points</div>
                
                <button
                  onClick={handleReset}
                  style={submitBtnHover 
                    ? { ...primaryButton, ...primaryButtonHover, width: '100%', marginTop: '1.5rem' } 
                    : { ...primaryButton, width: '100%', marginTop: '1.5rem' }
                  }
                  onMouseEnter={() => setSubmitBtnHover(true)}
                  onMouseLeave={() => setSubmitBtnHover(false)}
                >
                  Start New Estimation
                </button>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <>
      {currentStep === 'team' ? (
        <div style={pageContainer}>
          {renderStepContent()}
          {error && (
            <div style={{ color: '#ef4444', marginTop: '1rem', textAlign: 'center' }}>
              {error}
            </div>
          )}
        </div>
      ) : (
        /* Use shared TwoColumnLayout for the remaining steps */
        <TwoColumnLayout
          title={
            currentStep === 'category'
              ? 'Category Selection'
              : currentStep === 'questions'
              ? 'Questions'
              : 'Estimation Results'
          }
        >
          <>
            {renderStepContent()}
            {error && (
              <div style={{ color: '#ef4444', marginTop: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}
          </>
        </TwoColumnLayout>
      )}
    </>
  );
};

export default TeamSelectionPage;

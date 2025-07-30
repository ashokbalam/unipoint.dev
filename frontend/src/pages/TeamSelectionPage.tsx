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

/* ------------------------------------------------------------------
 * Global styles used across this page (always present)
 * ------------------------------------------------------------------ */
const globalRadioStyles = `
  /* ---------- Custom Radio Button (always available) ---------- */
  .custom-radio {
    /* Remove default styling */
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
    width: 1.25rem;          /* Bigger touch-friendly size */
    height: 1.25rem;
    border: 2px solid #d1d5db;
    border-radius: 50%;
    position: relative;
    display: inline-grid;
    place-content: center;
    transition: border-color 0.2s ease;
    margin-right: 0.5rem;
  }

  .custom-radio:hover {
    border-color: var(--color-primary);
  }

  .custom-radio:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* Checked state – inner circle */
  .custom-radio::before {
    content: '';
    width: 0.55rem;          /* Inner filled circle */
    height: 0.55rem;
    border-radius: 50%;
    transform: scale(0);
    background: var(--color-primary);
    transition: transform 0.2s ease;
  }

  .custom-radio:checked {
    border-color: var(--color-primary);
  }

  .custom-radio:checked::before {
    transform: scale(1);
  }
`;

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
  // Track if questions are loaded for the current category to prevent duplicate loading
  const [questionsLoaded, setQuestionsLoaded] = useState<string | null>(null);
  
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
      setError(''); // Clear any previous errors
      axios.get(`http://localhost:4000/categories?tenantId=${selectedTeam.id}`)
        .then(res => {
          setCategories(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading categories:', err);
          // Only set error if we're still on the category step
          if (currentStep === 'category') {
            setError('Failed to load categories');
          }
          setLoading(false);
        });
    }
  }, [currentStep, selectedTeam]);
  
  // Load questions when a category is selected - with improved error handling
  useEffect(() => {
    // Only load questions when:
    // 1. We're on the questions step
    // 2. We have a selected category
    // 3. We haven't already loaded questions for this category
    if (currentStep === 'questions' && 
        selectedCategory && 
        questionsLoaded !== selectedCategory.id) {
      
      setLoading(true);
      setError(''); // Clear any previous errors
      
      axios.get(`http://localhost:4000/questions?categoryId=${selectedCategory.id}`)
        .then(res => {
          setQuestions(res.data);
          setQuestionsLoaded(selectedCategory.id); // Mark these questions as loaded
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading questions:', err);
          // Only set error if we're still on the questions step
          if (currentStep === 'questions') {
            setError('Failed to load questions');
          }
          setLoading(false);
        });
    }
  }, [currentStep, selectedCategory, questionsLoaded]);
  
  // Auto-suggestion text for team search
  const suggestedText =
    suggestions.find(s => s.name.toLowerCase().startsWith(search.toLowerCase()))
      ?.name || '';
  
  // Handle team selection and move to next step
  const handleTeamSelect = () => {
    if (selectedTeam) {
      setCurrentStep('category');
      setError(''); // Clear any errors when changing steps
    }
  };
  
  // Handle category selection and move to next step
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setCurrentStep('questions');
    setError(''); // Clear any errors when changing steps
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
    setError(''); // Clear any errors when changing steps
  };
  
  
  const handleBack = () => {
    setError(''); // Clear any errors when navigating back
    
    if (currentStep === 'category') {
      setCurrentStep('team');
      setSelectedCategory(null);
    } else if (currentStep === 'questions') {
      setCurrentStep('category');
      // Don't clear questions - we might come back to them
      // But do clear answers if navigating away from questions
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
    setQuestionsLoaded(null); // Reset loaded questions tracking
    setAnswers({});
    setTotalScore(0);
    setStoryPoints(null);
    setSearch('');
    setError(''); // Clear any errors when resetting
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
    // Consistent light-gray border (explicit borderColor to reset hover)
    border: '1px solid #e5e7eb',
    borderColor: '#e5e7eb',
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
    /* Match the light-purple theme used for selected radio buttons */
    backgroundColor: '#faf5ff',            // very light purple background
    borderColor: 'var(--color-primary)',   // primary brand colour border
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
    fontSize: '5rem',                // match page title size
    fontWeight: 'bold',              // use bold Inter
    color: 'var(--color-background)',      // text colour inside the box
    backgroundColor: 'var(--color-secondary)',    // boxed background
    padding: '2rem',
    borderRadius: '1rem',
    display: 'inline-block',
    minWidth: '8rem',                // keep roughly square
    fontFamily: 'Inter',
    marginBottom: '0.5rem',
  };
  
  const resultLabel = {
    fontSize: '1rem',
    color: 'var(--color-text)',  // use standard text colour
    marginBottom: '2rem',
  };
  
  const resultStoryPoints = {
    fontSize: '5rem',                 // match page title size
    fontWeight: 'bold',               // use bold Inter
    color: 'var(--color-background)',       // text colour inside the box
    backgroundColor: 'var(--color-secondary)',    // boxed background
    padding: '2rem',
    borderRadius: '1rem',
    display: 'inline-block',
    minWidth: '8rem',                 // keep roughly square
    fontFamily: 'Inter',
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
  
  // Change Squad link style
  const changeSquadLink = {
    ...backButtonBase,
    marginBottom: '1rem',
    color: 'var(--color-primary)',
    fontWeight: 500,
    outline: 'none', // remove default focus outline
    border: 'none',  // remove default button border
  };
  
  // Squad info style
  const squadInfo = {
    fontSize: '1rem',
    color: '#6b7280',
    fontWeight: 500,
    textAlign: 'left' as const,
    marginBottom: '1rem', // keep consistent spacing across Category & Questions steps
  };

  /* -------------------------
   * Questions page constants
   * -------------------------*/
  const backToCategoriesLink = {
    ...backButtonBase,
    marginBottom: '1rem',
    color: 'var(--color-primary)',
    fontWeight: 500,
    outline: 'none',
    border: 'none',
  };

  /* -------------------------
   * Results page constants
   * -------------------------*/
  // Back to Questions link style (matches other nav links)
  const backToQuestionsLink = {
    ...backButtonBase,
    marginBottom: '1rem',
    color: 'var(--color-primary)',
    fontWeight: 500,
    outline: 'none',
    border: 'none',
  };

  // Custom title for Questions step (link + title, right-aligned)
  const questionsTitleContent = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <button
        style={backBtnHover ? { ...backToCategoriesLink, ...backButtonHover } : backToCategoriesLink}
        onClick={handleBack}
        onMouseEnter={() => setBackBtnHover(true)}
        onMouseLeave={() => setBackBtnHover(false)}
      >
        <svg
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ marginRight: '0.25rem' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Change Story Type
      </button>
      <h1
        style={{
          fontSize: '5rem',
          fontWeight: 700,
          marginTop: '0.5rem',
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-text)',
          textAlign: 'right',
        }}
      >
        Answer These Questions
      </h1>
    </div>
  );
  
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
            {/* Improved helper text logic with better conditions */}
            {(() => {
              let helperText = '';
              // Only show helper text when input is focused to reduce visual clutter
              if (isInputFocused) {
                // First check if there's any input
                if (search.trim()) {
                  if (loading) {
                    // Show "searching" when loading and there's input
                    helperText = 'searching';
                  } else if (selectedTeam) {
                    // Show "hit enter to continue" when a team is selected and input is focused
                    helperText = 'hit enter to continue';
                  } else if (search.trim().length > 2 && suggestions.length === 0) {
                    // Show "couldn't find your squad" when search is long enough but no results
                    helperText = "couldn't find your squad";
                  } else if (suggestedText && search.trim().length > 0) {
                    // Show "hit tab to autofill" when there's a suggestion available and input is focused
                    helperText = 'hit tab to autofill';
                  } else if (search.trim().length < 3) {
                    // Show "keep typing" for short searches that aren't long enough yet
                    helperText = 'keep typing';
                  }
                }
              }
              
                /* -------------------------------------------------
                 * Always reserve space for helper text to prevent
                 * layout shifts.  We use a fixed/min height and
                 * toggle visibility so the content area doesn't
                 * disappear & re-appear, which was causing the
                 * input/title to move vertically.
                 * ------------------------------------------------- */
                return (
                  <div
                    style={{
                      ...smallText,
                      marginTop: '0.5rem',
                      textAlign: 'right',
                      width: '100%',
                      minHeight: '1.25rem',            // Reserve space (≈ line-height)
                      visibility: helperText ? 'visible' : 'hidden',
                    }}
                  >
                    {helperText}
                  </div>
                );
            })()}
          </div>
        );
        
      case 'category':
        return (
          <div style={{ width: '100%' }}>
            {/* Squad info at top right of content area */}
            {selectedTeam && (
              <div style={squadInfo}>
                Squad: {selectedTeam.name}
              </div>
            )}
            
            {loading ? (
              <div
                /* Center the loading spinner perfectly inside the white box */
                style={{
                  /* -----------------------------------------------------
                   * Make the container tall enough so the spinner can
                   * truly appear centred inside the white box even before
                   * the category list renders.  We mimic the height that
                   * the scrollable questions container uses so that the
                   * spinner sits visually in the middle of the box.
                   * --------------------------------------------------- */
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  width: '100%',
                  /* 80 vh (box height) − 4 rem (vertical padding)  */
                  minHeight: 'calc(80vh - 4rem)',
                }}
              >
                <LoadingSpinner />
              </div>
            ) : categories.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                No categories found for this team.
              </div>
            ) : (
              <div>
                {categories.map((category, index) => (
                  <div key={category.id}>
                    <div
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
                  </div>
                ))}
              </div>
            )}
          </div>
        );
        
      case 'questions':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Squad & Category info aligned horizontally with Change Story Type link */}
            {selectedTeam && selectedCategory && (
              <div
                style={{
                  ...squadInfo,
                  /* offset so it lines up with the link in the left column */
                  marginBottom: '1rem',
                }}
              >
                Squad: {selectedTeam.name} | Category: {selectedCategory.name}
              </div>
            )}

            {/* Scrollable questions area with fixed height calculation */}
            <div
              style={{
                ...containerContent,
                display: 'flex',
                flexDirection: 'column',
                height: 'calc(80vh - 7rem)', /* 80vh (content box) - 4rem (padding) - 3rem (squad info + margins) */
                maxHeight: 'calc(80vh - 7rem)',
                overflowY: 'auto',
                padding: '0.5rem',
                /* Removed outer border to keep only individual question borders */
              }}
            >
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
                      {question.options.map((option) => (
                        <label
                          key={option.id}
                          style={{
                            ...optionContainer,
                            // Highlight the selected option with a light-purple theme
                            ...(answers[question.id] === option.points
                              ? {
                                  backgroundColor: '#faf5ff', // light purple background
                                  borderColor: '#8b5cf6',     // purple border
                                }
                              : {}),
                          }}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            className="custom-radio"
                            checked={answers[question.id] === option.points}
                            onChange={() => handleAnswerSelect(question.id, option.points)}
                          />
                          <span style={optionLabel}>{option.label}</span>
                          <span style={optionPoints}>{option.points} points</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit button – fixed outside scrollable area so it's always visible */}
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
              Get the Points
            </button>
          </div>
        );
        
      case 'results':
        return (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Squad & Category info at top */}
            {selectedTeam && selectedCategory && (
              <div style={squadInfo}>
                Squad: {selectedTeam.name} | Category: {selectedCategory.name}
              </div>
            )}
            
            <div style={containerContent}>
              <div style={resultContainer}>
                <div>
                  <div style={resultScore}>{totalScore}</div>
                  <div style={resultLabel}>Total Points</div>
                </div>
                
                <div>
                  <div style={resultStoryPoints}>
                    {storyPoints !== null ? storyPoints : '?'}
                  </div>
                  <div style={resultLabel}>Story Points</div>
                </div>
              </div>

              {/* Action button – always visible at bottom like "Get the Points" */}
              <div>
                <button
                  onClick={handleReset}
                  style={
                    submitBtnHover
                      ? {
                          ...primaryButton,
                          ...primaryButtonHover,
                          width: '100%',
                          marginTop: '1.5rem',
                        }
                      : {
                          ...primaryButton,
                          width: '100%',
                          marginTop: '1.5rem',
                        }
                  }
                  onMouseEnter={() => setSubmitBtnHover(true)}
                  onMouseLeave={() => setSubmitBtnHover(false)}
                >
                  Start New Estimation
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  // Custom title for Category step with Change Squad link above Category Selection title
  const categoryTitleContent = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <button
        style={backBtnHover ? { ...changeSquadLink, ...backButtonHover } : changeSquadLink}
        onClick={handleBack}
        onMouseEnter={() => setBackBtnHover(true)}
        onMouseLeave={() => setBackBtnHover(false)}
      >
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ marginRight: '0.25rem' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Change Squad
      </button>
      <h1
        style={{
          fontSize: '5rem',
          fontWeight: 700,
          marginTop: '0.5rem',
          fontFamily: 'var(--font-heading)',          // use primary heading font
          color: 'var(--color-text)',
          textAlign: 'right',
        }}
      >
        Select a Story Type
      </h1>
    </div>
  );

  
  /* -------------------------
   * Results page title content
   * -------------------------*/
  const resultsTitleContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}
    >
      <button
        style={backBtnHover ? { ...backToQuestionsLink, ...backButtonHover } : backToQuestionsLink}
        onClick={handleBack}
        onMouseEnter={() => setBackBtnHover(true)}
        onMouseLeave={() => setBackBtnHover(false)}
      >
        <svg
          width="16"
          height="16"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ marginRight: '0.25rem' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Assess Again
      </button>
      <h1
        style={{
          fontSize: '5rem',
          fontWeight: 700,
          marginTop: '0.5rem',
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-text)',
          textAlign: 'right',
        }}
      >
        Estimation Results
      </h1>
    </div>
  );
  
  return (
    <>
      {/* Global radio-button styles injected once */}
      <style>{globalRadioStyles}</style>
      
      {currentStep === 'team' ? (
        <div style={pageContainer}>
          {renderStepContent()}
          {error && (
            <div
              style={{
                color: '#ef4444',
                marginTop: '1rem',
                textAlign: 'center',
              }}
            >
              {error}
            </div>
          )}
        </div>
      ) : currentStep === 'category' ? (
        // Special handling for category step with custom title that includes the Change Squad link
        <TwoColumnLayout title={categoryTitleContent}>
          <>
            {renderStepContent()}
            {error && (
              <div style={{ color: '#ef4444', marginTop: '1rem', textAlign: 'center' }}>
                {error}
              </div>
            )}
          </>
        </TwoColumnLayout>
      ) : (
        /* Use shared TwoColumnLayout for the remaining steps */
        <TwoColumnLayout
          title={
            currentStep === 'questions'
              ? questionsTitleContent
              : resultsTitleContent
          }
        >
          <>
            {renderStepContent()}
            {error && (
              <div
                style={{
                  color: '#ef4444',
                  marginTop: '1rem',
                  textAlign: 'center',
                }}
              >
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

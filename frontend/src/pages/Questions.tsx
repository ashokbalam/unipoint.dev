import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { containerHeader, containerContent } from '../App.styles';
import TwoColumnLayout from '../components/TwoColumnLayout';
import { AnimationContainer, AnimatedChild } from '../components/PageTransition';
import {
  backButton,
  backButtonHover,
  pageContainer,
  heading,
  loadingText,
  errorText,
  successText,
  form,
  questionBlock,
  questionText,
  optionLabel,
  radioInput,
  submitButton,
  submitButtonDisabled,
  addForm,
  addLabel,
  addInput,
  addInputFocus,
  addError,
  addSuccess,
  addButton,
  addButtonHover,
  questionsScrollArea,
  thankYou,
  storyPoints,
  boldText
} from './Questions.styles';

// Interfaces
interface Team {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  tenantId: string;
}

interface Option {
  id?: string;
  label: string;
  points: number;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
  categoryId: string;
}

interface RubricRange {
  min: number;
  max: number;
  storyPoints: number;
}

const Questions: React.FC = () => {
  
  // State for team selection
  const [teamSearch, setTeamSearch] = useState('');
  const [teamSuggestions, setTeamSuggestions] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamSearchFocused, setTeamSearchFocused] = useState(false);
  
  // State for category selection
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categorySelectFocused, setCategorySelectFocused] = useState(false);
  
  // State for questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for new question
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState<Option[]>([{ label: 'Option 1', points: 1 }]);
  
  // View mode state
  const [viewMode, setViewMode] = useState<'existing' | 'create'>('existing');
  
  // State for editing questions
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editQuestionText, setEditQuestionText] = useState('');
  const [editOptions, setEditOptions] = useState<Option[]>([]);
  
  // UI interaction states
  const [questionTextFocused, setQuestionTextFocused] = useState(false);
  const [editQuestionTextFocused, setEditQuestionTextFocused] = useState(false);
  const [questionHover, setQuestionHover] = useState<string | null>(null);
  const [backBtnHover, setBackBtnHover] = useState(false);
  const [addQuestionBtnHover, setAddQuestionBtnHover] = useState(false);
  const [addOptionBtnHover, setAddOptionBtnHover] = useState(false);
  const [editOptionBtnHover, setEditOptionBtnHover] = useState(false);
  const [existingBtnHover, setExistingBtnHover] = useState(false);
  const [createBtnHover, setCreateBtnHover] = useState(false);
  const [changeTeamBtnHover, setChangeTeamBtnHover] = useState(false);
  const [editBtnHover, setEditBtnHover] = useState<string | null>(null);
  const [deleteBtnHover, setDeleteBtnHover] = useState<string | null>(null);
  const [saveBtnHover, setSaveBtnHover] = useState(false);
  const [cancelBtnHover, setCancelBtnHover] = useState(false);
  
  // Refs
  const teamSearchRef = useRef<HTMLInputElement>(null);
  
  // Fetch team suggestions based on search
  useEffect(() => {
    if (teamSearch.length > 1) {
      axios.get(`http://localhost:4000/tenants?search=${teamSearch}`)
        .then(res => {
          setTeamSuggestions(res.data);
        })
        .catch(err => {
          console.error('Error fetching teams:', err);
          setError('Failed to load team suggestions.');
        });
    } else {
      setTeamSuggestions([]);
    }
  }, [teamSearch]);
  
  // Fetch categories when a team is selected
  useEffect(() => {
    if (selectedTeam) {
      setLoading(true);
      axios.get(`http://localhost:4000/categories?tenantId=${selectedTeam.id}`)
        .then(res => {
          setCategories(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching categories:', err);
          setError('Failed to load categories.');
          setLoading(false);
        });
    }
  }, [selectedTeam]);
  
  // Fetch questions when a category is selected
  useEffect(() => {
    if (selectedCategory) {
      setLoading(true);
      axios.get(`http://localhost:4000/questions?categoryId=${selectedCategory.id}`)
        .then(res => {
          setQuestions(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching questions:', err);
          setError('Failed to load questions.');
          setLoading(false);
        });
    }
  }, [selectedCategory]);
  
  // Handle team selection
  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setTeamSearch('');
    setTeamSuggestions([]);
    setSelectedCategory(null);
    setQuestions([]);
  };
  
  // Reset team selection
  const resetTeamSelection = () => {
    setSelectedTeam(null);
    setSelectedCategory(null);
    setQuestions([]);
    setTeamSearch('');
    if (teamSearchRef.current) {
      teamSearchRef.current.focus();
    }
  };
  
  // Handle category selection
  const handleCategorySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      setSelectedCategory(category);
    }
  };
  
  // Start editing a question
  const startEditing = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditQuestionText(question.text);
    setEditOptions([...question.options]);
    setError('');
    setSuccess('');
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingQuestionId(null);
    setEditQuestionText('');
    setEditOptions([]);
    setError('');
  };
  
  // Update option for new question
  const updateOption = (index: number, field: 'label' | 'points', value: string | number) => {
    const updatedOptions = [...newOptions];
    if (field === 'label') {
      updatedOptions[index].label = value as string;
    } else {
      updatedOptions[index].points = value as number;
    }
    setNewOptions(updatedOptions);
  };
  
  // Update option for editing
  const updateEditOption = (index: number, field: 'label' | 'points', value: string | number) => {
    const updatedOptions = [...editOptions];
    if (field === 'label') {
      updatedOptions[index].label = value as string;
    } else {
      updatedOptions[index].points = value as number;
    }
    setEditOptions(updatedOptions);
  };
  
  // Add new option for new question
  const addOption = () => {
    setNewOptions([...newOptions, { label: `Option ${newOptions.length + 1}`, points: 1 }]);
  };
  
  // Add new option for editing
  const addEditOption = () => {
    setEditOptions([...editOptions, { label: `Option ${editOptions.length + 1}`, points: 1 }]);
  };
  
  // Remove option for new question
  const removeOption = (index: number) => {
    if (newOptions.length > 1) {
      const updatedOptions = [...newOptions];
      updatedOptions.splice(index, 1);
      setNewOptions(updatedOptions);
    }
  };
  
  // Remove option for editing
  const removeEditOption = (index: number) => {
    if (editOptions.length > 1) {
      const updatedOptions = [...editOptions];
      updatedOptions.splice(index, 1);
      setEditOptions(updatedOptions);
    }
  };
  
  // Validate question
  const validateQuestion = (text: string, options: Option[]) => {
    if (!text.trim()) {
      return 'Question text cannot be empty.';
    }
    
    if (options.length < 1) {
      return 'At least one option is required.';
    }
    
    for (const option of options) {
      if (!option.label.trim()) {
        return 'Option labels cannot be empty.';
      }
    }
    
    return null;
  };
  
  // Save edited question
  const saveEditedQuestion = async () => {
    if (!selectedCategory) {
      setError('No category selected.');
      return;
    }
    
    const validationError = validateQuestion(editQuestionText, editOptions);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setLoading(true);
      const res = await axios.put(`http://localhost:4000/questions/${editingQuestionId}`, {
        text: editQuestionText.trim(),
        options: editOptions,
        categoryId: selectedCategory.id
      });
      
      // Update the questions list
      setQuestions(questions.map(q => 
        q.id === editingQuestionId ? res.data : q
      ));
      
      setSuccess('Question updated successfully!');
      // Exit edit mode
      setEditingQuestionId(null);
    } catch (err) {
      setError('Failed to update question. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Add new question
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!selectedCategory) {
      setError('Please select a category first.');
      return;
    }
    
    const validationError = validateQuestion(newQuestionText, newOptions);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:4000/questions', {
        text: newQuestionText.trim(),
        options: newOptions,
        categoryId: selectedCategory.id
      });
      
      setQuestions([...questions, res.data]);
      setSuccess('Question created successfully!');
      setNewQuestionText('');
      setNewOptions([{ label: 'Option 1', points: 1 }]);
      // Return to list to see the newly created question
      setViewMode('existing');
    } catch (err) {
      setError('Failed to create question. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete question
  const deleteQuestion = async (questionId: string) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:4000/questions/${questionId}`);
        
        // Update the questions list
        setQuestions(questions.filter(q => q.id !== questionId));
        setSuccess('Question deleted successfully!');
      } catch (err) {
        setError('Failed to delete question. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Styling objects
  const columnStyle = {
    flex: 1,
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column' as const,
  };
  
  const sectionHeader = {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '1rem',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-heading)',
  };
  
  const formContainer = {
    width: '100%',
  };
  
  const formGroup = {
    marginBottom: '1rem',
  };
  
  const formLabel = {
    display: 'block',
    marginBottom: '0.25rem',
    fontSize: '0.95rem',
    fontWeight: 500,
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body)',
  };
  
  const formInput = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  
  const formInputFocus = {
    borderColor: 'var(--color-primary)',
    boxShadow: '0 0 0 2px rgba(94, 43, 255, 0.1)',
  };
  
  const formSelect = {
    ...formInput,
    appearance: 'none' as any,
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\' stroke=\'%236b7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.5rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem',
  };
  
  const optionsContainer = {
    marginTop: '1rem',
    marginBottom: '1rem',
  };
  
  const optionGrid = {
    display: 'grid',
    gridTemplateColumns: '1fr 100px 40px',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  };
  
  const optionHeader = {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    marginBottom: '0.25rem',
    fontFamily: 'var(--font-body)',
  };
  
  const optionInput = {
    ...formInput,
    padding: '0.25rem 0.5rem',
    fontSize: '0.875rem',
  };
  
  const removeButton = {
    background: 'none',
    border: 'none',
    color: '#ef4444',
    fontSize: '1.25rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  };
  
  const removeButtonHover = {
    backgroundColor: '#fee2e2',
  };
  
  const buttonPrimary = {
    width: '100%',
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontFamily: 'var(--font-body)',
  };
  
  const buttonPrimaryHover = {
    backgroundColor: '#4338ca',
  };
  
  const buttonSecondary = {
    backgroundColor: '#f3f4f6',
    color: 'var(--color-text)',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #d1d5db',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontFamily: 'var(--font-body)',
  };
  
  const buttonSecondaryHover = {
    backgroundColor: '#e5e7eb',
  };
  
  const actionButton = {
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.375rem',
    border: '1px solid var(--color-primary)',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
    marginRight: '0.5rem',
    fontFamily: 'var(--font-body)',
  };
  
  const actionButtonHover = {
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
  };
  
  const deleteButton = {
    backgroundColor: 'transparent',
    color: '#ef4444',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.375rem',
    border: '1px solid #ef4444',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
    fontFamily: 'var(--font-body)',
  };
  
  const deleteButtonHover = {
    backgroundColor: '#ef4444',
    color: '#ffffff',
  };
  
  const errorMessage = {
    color: '#ef4444',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
    fontFamily: 'var(--font-body)',
  };
  
  const successMessage = {
    color: '#10b981',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
    fontFamily: 'var(--font-body)',
  };
  
  const questionListContainer = {
    width: '100%',
    marginTop: '1rem',
  };
  
  const questionList = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
  };
  
  const questionCard = {
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    transition: 'background-color 0.2s, box-shadow 0.2s',
  };
  
  const questionCardHover = {
    backgroundColor: '#f9fafb',
    boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
  };
  
  const loadingMessage = {
    textAlign: 'center' as const,
    padding: '2rem',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body)',
  };
  
  const mainContent = {
    display: 'flex',
    width: '100%',
    gap: '1rem',
  };
  
  const teamSelectionContainer = {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    textAlign: 'center' as const,
  };
  
  const teamSelectionTitle = {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '1rem',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-heading)',
  };
  
  const teamSearchContainer = {
    width: '100%',
    maxWidth: '400px',
    position: 'relative' as const,
  };
  
  const teamSearchInput = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontFamily: 'var(--font-body)',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };
  
  const teamSearchInputFocus = {
    borderColor: 'var(--color-primary)',
    boxShadow: '0 0 0 2px rgba(94, 43, 255, 0.1)',
  };
  
  const suggestionsList = {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    marginTop: '0.25rem',
    maxHeight: '200px',
    overflowY: 'auto' as const,
    zIndex: 10,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  };
  
  const suggestionItem = {
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontFamily: 'var(--font-body)',
  };
  
  const suggestionItemHover = {
    backgroundColor: '#f3f4f6',
  };
  
  const selectedTeamContainer = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#f3f4f6',
    borderRadius: '0.5rem',
    width: '100%',
  };
  
  const selectedTeamText = {
    fontWeight: 600,
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body)',
  };
  
  const changeTeamButton = {
    backgroundColor: 'transparent',
    color: 'var(--color-primary)',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.375rem',
    border: '1px solid var(--color-primary)',
    fontSize: '0.75rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s, color 0.2s',
    fontFamily: 'var(--font-body)',
  };
  
  const changeTeamButtonHover = {
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
  };
  
  const viewModeBtn = {
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    color: 'var(--color-text)',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    fontFamily: 'var(--font-body)',
  };
  
  const viewModeBtnActive = {
    ...viewModeBtn,
    backgroundColor: 'var(--color-primary)',
    color: '#ffffff',
    borderColor: 'var(--color-primary)',
  };
  
  const headerContainer = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    width: '100%',
  };
  
  const categorySelectContainer = {
    marginBottom: '1.5rem',
  };
  
  const optionPoints = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-body)',
  };
  
  return (
    <TwoColumnLayout title="Questions">
        <div style={containerHeader}>
          <AnimationContainer type="slideUp" transition="smooth">
            {selectedTeam && (
              <div style={selectedTeamContainer}>
                <span style={selectedTeamText}>Team: {selectedTeam.name}</span>
                <button
                  style={changeTeamBtnHover ? { ...changeTeamButton, ...changeTeamButtonHover } : changeTeamButton}
                  onMouseEnter={() => setChangeTeamBtnHover(true)}
                  onMouseLeave={() => setChangeTeamBtnHover(false)}
                  onClick={resetTeamSelection}
                >
                  Change
                </button>
              </div>
            )}
            
            {selectedCategory && (
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                <button
                  style={
                    viewMode === 'existing'
                      ? { ...viewModeBtnActive }
                      : existingBtnHover
                      ? { ...viewModeBtn, backgroundColor: 'var(--color-background)' }
                      : viewModeBtn
                  }
                  onMouseEnter={() => setExistingBtnHover(true)}
                  onMouseLeave={() => setExistingBtnHover(false)}
                  onClick={() => setViewMode('existing')}
                >
                  View Questions
                </button>
                <button
                  style={
                    viewMode === 'create'
                      ? { ...viewModeBtnActive }
                      : createBtnHover
                      ? { ...viewModeBtn, backgroundColor: 'var(--color-background)' }
                      : viewModeBtn
                  }
                  onMouseEnter={() => setCreateBtnHover(true)}
                  onMouseLeave={() => setCreateBtnHover(false)}
                  onClick={() => {
                    setViewMode('create');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Create New
                </button>
              </div>
            )}
          </AnimationContainer>
        </div>
        
        <div style={containerContent}>
          {!selectedTeam ? (
            <AnimationContainer type="perspective" transition="smooth">
              <div style={teamSelectionContainer}>
                <h2 style={teamSelectionTitle}>Select a Team</h2>
                <div style={teamSearchContainer}>
                  <input
                    ref={teamSearchRef}
                    type="text"
                    placeholder="Search for a team..."
                    style={teamSearchFocused ? { ...teamSearchInput, ...teamSearchInputFocus } : teamSearchInput}
                    value={teamSearch}
                    onChange={(e) => setTeamSearch(e.target.value)}
                    onFocus={() => setTeamSearchFocused(true)}
                    onBlur={() => setTeamSearchFocused(false)}
                  />
                  {teamSuggestions.length > 0 && (
                    <AnimationContainer type="slideUp" staggerChildren={true} staggerDelay={0.05}>
                      <div style={suggestionsList}>
                        {teamSuggestions.map((team, index) => (
                          <AnimatedChild key={team.id} index={index}>
                            <div
                              style={suggestionItem}
                              onClick={() => handleTeamSelect(team)}
                            >
                              {team.name}
                            </div>
                          </AnimatedChild>
                        ))}
                      </div>
                    </AnimationContainer>
                  )}
                </div>
              </div>
            </AnimationContainer>
          ) : (
            <AnimationContainer type="perspective" transition="smooth">
              <div style={categorySelectContainer}>
                <label style={formLabel}>Select Category</label>
                <select
                  style={categorySelectFocused ? { ...formSelect, ...formInputFocus } : formSelect}
                  value={selectedCategory?.id || ''}
                  onChange={handleCategorySelect}
                  onFocus={() => setCategorySelectFocused(true)}
                  onBlur={() => setCategorySelectFocused(false)}
                >
                  <option value="">-- Select a Category --</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedCategory && (
                <div style={mainContent}>
                  {viewMode === 'existing' && (
                    <AnimationContainer type="slideUp" transition="smooth">
                      <div style={columnStyle}>
                        <h2 style={sectionHeader}>Existing Questions</h2>
                        <div style={questionListContainer}>
                          {loading && questions.length === 0 ? (
                            <div style={loadingMessage}>Loading questions...</div>
                          ) : questions.length > 0 ? (
                            <AnimationContainer type="slideUp" staggerChildren={true} staggerDelay={0.08}>
                              <div style={questionList}>
                                {questions.map((question, index) => (
                                  <AnimatedChild key={question.id} index={index}>
                                    <div
                                      style={questionHover === question.id ? { ...questionCard, ...questionCardHover } : questionCard}
                                      onMouseEnter={() => setQuestionHover(question.id)}
                                      onMouseLeave={() => setQuestionHover(null)}
                                    >
                                      {/* Edit Mode */}
                                      {editingQuestionId === question.id ? (
                                        <AnimationContainer type="perspective" transition="smoothFast">
                                          <div style={formGroup}>
                                            <label style={formLabel}>Question Text</label>
                                            <input
                                              type="text"
                                              style={editQuestionTextFocused ? { ...formInput, ...formInputFocus } : formInput}
                                              value={editQuestionText}
                                              onChange={(e) => setEditQuestionText(e.target.value)}
                                              onFocus={() => setEditQuestionTextFocused(true)}
                                              onBlur={() => setEditQuestionTextFocused(false)}
                                            />
                                          </div>
                                          
                                          <div style={optionsContainer}>
                                            <div style={optionHeader}>Options</div>
                                            <div style={optionGrid}>
                                              <div style={optionHeader}>Label</div>
                                              <div style={optionHeader}>Points</div>
                                              <div></div>
                                              
                                              <AnimationContainer type="slideUp" staggerChildren={true} staggerDelay={0.05}>
                                                {editOptions.map((option, optIndex) => (
                                                  <React.Fragment key={optIndex}>
                                                    <AnimatedChild index={optIndex}>
                                                      <div>
                                                        <input
                                                          type="text"
                                                          style={optionInput}
                                                          value={option.label}
                                                          onChange={(e) => updateEditOption(optIndex, 'label', e.target.value)}
                                                        />
                                                      </div>
                                                      <div>
                                                        <input
                                                          type="number"
                                                          style={optionInput}
                                                          value={option.points}
                                                          onChange={(e) => updateEditOption(optIndex, 'points', parseInt(e.target.value) || 0)}
                                                        />
                                                      </div>
                                                      <div>
                                                        {editOptions.length > 1 && (
                                                          <button
                                                            type="button"
                                                            style={removeButton}
                                                            onClick={() => removeEditOption(optIndex)}
                                                          >
                                                            ×
                                                          </button>
                                                        )}
                                                      </div>
                                                    </AnimatedChild>
                                                  </React.Fragment>
                                                ))}
                                              </AnimationContainer>
                                            </div>
                                            
                                            <button
                                              type="button"
                                              style={editOptionBtnHover ? { ...buttonSecondary, ...buttonSecondaryHover } : buttonSecondary}
                                              onMouseEnter={() => setEditOptionBtnHover(true)}
                                              onMouseLeave={() => setEditOptionBtnHover(false)}
                                              onClick={addEditOption}
                                            >
                                              + Add Option
                                            </button>
                                          </div>
                                          
                                          {error && editingQuestionId === question.id && <div style={errorMessage}>{error}</div>}
                                          
                                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                            <button
                                              type="button"
                                              style={saveBtnHover ? { ...buttonPrimary, ...buttonPrimaryHover } : buttonPrimary}
                                              onMouseEnter={() => setSaveBtnHover(true)}
                                              onMouseLeave={() => setSaveBtnHover(false)}
                                              onClick={saveEditedQuestion}
                                            >
                                              {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                              type="button"
                                              style={cancelBtnHover ? { ...buttonSecondary, ...buttonSecondaryHover } : buttonSecondary}
                                              onMouseEnter={() => setCancelBtnHover(true)}
                                              onMouseLeave={() => setCancelBtnHover(false)}
                                              onClick={cancelEditing}
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </AnimationContainer>
                                      ) : (
                                        /* View Mode */
                                        <>
                                          <div style={{ marginBottom: '0.5rem' }}>
                                            <strong>{question.text}</strong>
                                          </div>
                                          <AnimationContainer type="slideUp" staggerChildren={true} staggerDelay={0.03}>
                                            <div style={{ marginBottom: '0.75rem' }}>
                                              {question.options.map((option, optIndex) => (
                                                <AnimatedChild key={optIndex} index={optIndex}>
                                                  <div style={optionPoints}>
                                                    <span>{option.label}:</span>
                                                    <span>{option.points} points</span>
                                                  </div>
                                                </AnimatedChild>
                                              ))}
                                            </div>
                                          </AnimationContainer>
                                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <button
                                              style={editBtnHover === question.id ? { ...actionButton, ...actionButtonHover } : actionButton}
                                              onMouseEnter={() => setEditBtnHover(question.id)}
                                              onMouseLeave={() => setEditBtnHover(null)}
                                              onClick={() => startEditing(question)}
                                            >
                                              Edit
                                            </button>
                                            <button
                                              style={deleteBtnHover === question.id ? { ...deleteButton, ...deleteButtonHover } : deleteButton}
                                              onMouseEnter={() => setDeleteBtnHover(question.id)}
                                              onMouseLeave={() => setDeleteBtnHover(null)}
                                              onClick={() => deleteQuestion(question.id)}
                                            >
                                              Delete
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </AnimatedChild>
                                ))}
                              </div>
                            </AnimationContainer>
                          ) : (
                            <div>No questions found. Create a new question to get started.</div>
                          )}
                        </div>
                      </div>
                    </AnimationContainer>
                  )}
                  
                  {viewMode === 'create' && (
                    <AnimationContainer type="perspective" transition="smooth">
                      <div style={columnStyle}>
                        <h2 style={sectionHeader}>Create New Question</h2>
                        <div style={formContainer}>
                          <form onSubmit={handleAddQuestion}>
                            <div style={formGroup}>
                              <label style={formLabel}>Question Text</label>
                              <input
                                placeholder="Enter question text"
                                style={questionTextFocused ? { ...formInput, ...formInputFocus } : formInput}
                                value={newQuestionText}
                                onChange={(e) => setNewQuestionText(e.target.value)}
                                onFocus={() => setQuestionTextFocused(true)}
                                onBlur={() => setQuestionTextFocused(false)}
                              />
                            </div>
                            
                            <div style={optionsContainer}>
                              <div style={optionHeader}>Options</div>
                              <div style={optionGrid}>
                                <div style={optionHeader}>Label</div>
                                <div style={optionHeader}>Points</div>
                                <div></div>
                                
                                <AnimationContainer type="slideUp" staggerChildren={true} staggerDelay={0.05}>
                                  {newOptions.map((option, index) => (
                                    <React.Fragment key={index}>
                                      <AnimatedChild index={index}>
                                        <div>
                                          <input
                                            type="text"
                                            style={optionInput}
                                            value={option.label}
                                            onChange={(e) => updateOption(index, 'label', e.target.value)}
                                          />
                                        </div>
                                        <div>
                                          <input
                                            type="number"
                                            style={optionInput}
                                            value={option.points}
                                            onChange={(e) => updateOption(index, 'points', parseInt(e.target.value) || 0)}
                                          />
                                        </div>
                                        <div>
                                          {newOptions.length > 1 && (
                                            <button
                                              type="button"
                                              style={removeButton}
                                              onClick={() => removeOption(index)}
                                            >
                                              ×
                                            </button>
                                          )}
                                        </div>
                                      </AnimatedChild>
                                    </React.Fragment>
                                  ))}
                                </AnimationContainer>
                              </div>
                              
                              <button
                                type="button"
                                style={addOptionBtnHover ? { ...buttonSecondary, ...buttonSecondaryHover } : buttonSecondary}
                                onMouseEnter={() => setAddOptionBtnHover(true)}
                                onMouseLeave={() => setAddOptionBtnHover(false)}
                                onClick={addOption}
                              >
                                + Add Option
                              </button>
                            </div>
                            
                            {error && !editingQuestionId && <div style={errorMessage}>{error}</div>}
                            {success && !editingQuestionId && <div style={successMessage}>{success}</div>}
                            
                            <div style={{ marginTop: '0.75rem' }}>
                              <button
                                type="submit"
                                style={addQuestionBtnHover ? { ...buttonPrimary, ...buttonPrimaryHover } : buttonPrimary}
                                onMouseEnter={() => setAddQuestionBtnHover(true)}
                                onMouseLeave={() => setAddQuestionBtnHover(false)}
                                disabled={loading}
                              >
                                {loading && !editingQuestionId ? 'Creating...' : 'Create Question'}
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    </AnimationContainer>
                  )}
                </div>
              )}
            </AnimationContainer>
          )}
        </div>
    </TwoColumnLayout>
  );
};

export default Questions;

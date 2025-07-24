import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Interfaces
interface Team {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  rubric?: RubricRange[];
}

interface RubricRange {
  min: number;
  max: number;
  storyPoints: number;
}

const Categories: React.FC = () => {
  // State for team selection
  const [teamSearch, setTeamSearch] = useState('');
  const [teamSuggestions, setTeamSuggestions] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamSearchFocused, setTeamSearchFocused] = useState(false);
  
  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // State for new category
  const [newCategoryName, setNewCategoryName] = useState('');
  const [rubric, setRubric] = useState<RubricRange[]>([{ min: 0, max: 10, storyPoints: 1 }]);
  const [showRubricBuilder, setShowRubricBuilder] = useState(true);
  /* ------------------------------------------------------------------
   * View mode state – toggles between list + create screens
   * ----------------------------------------------------------------- */
  const [viewMode, setViewMode] = useState<'existing' | 'create'>('existing');
  
  // State for editing categories
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editRubric, setEditRubric] = useState<RubricRange[]>([]);
  
  // UI interaction states
  const [categoryNameFocused, setCategoryNameFocused] = useState(false);
  const [editCategoryNameFocused, setEditCategoryNameFocused] = useState(false);
  const [addCategoryBtnHover, setAddCategoryBtnHover] = useState(false);
  const [categoryHover, setCategoryHover] = useState<string | null>(null);
  const [editBtnHover, setEditBtnHover] = useState<string | null>(null);
  /* Questions button removed -> hover state no longer required */
  const [saveBtnHover, setSaveBtnHover] = useState(false);
  const [cancelBtnHover, setCancelBtnHover] = useState(false);
  const [changeTeamBtnHover, setChangeTeamBtnHover] = useState(false);
  const [addRangeBtnHover, setAddRangeBtnHover] = useState(false);
  const [addEditRangeBtnHover, setAddEditRangeBtnHover] = useState(false);
  /* Hover for view-mode buttons */
  const [existingBtnHover, setExistingBtnHover] = useState(false);
  const [createBtnHover, setCreateBtnHover] = useState(false);
  
  const teamSearchInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch team suggestions
  useEffect(() => {
    if (!teamSearch.trim()) {
      setTeamSuggestions([]);
      return;
    }
    
    const debounceTimer = setTimeout(() => {
      setLoading(true);
      axios.get(`http://localhost:4000/tenants?search=${teamSearch}`)
        .then(res => {
          setTeamSuggestions(res.data);
          setError('');
        })
        .catch(() => {
          setError('Failed to load teams. Please try again.');
          setTeamSuggestions([]);
        })
        .finally(() => setLoading(false));
    }, 300);
    
    return () => clearTimeout(debounceTimer);
  }, [teamSearch]);
  
  // Fetch categories when team is selected
  useEffect(() => {
    if (!selectedTeam) return;
    
    setLoading(true);
    axios.get(`http://localhost:4000/categories?tenantId=${selectedTeam.id}`)
      .then(res => {
        setCategories(res.data);
        setError('');
      })
      .catch(() => {
        setError('Failed to load categories. Please try again.');
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, [selectedTeam]);
  
  // Handle team selection
  const handleTeamSelect = (team: Team) => {
    setSelectedTeam(team);
    setTeamSearch(team.name);
    setTeamSuggestions([]);
    // Reset any editing state when changing teams
    setEditingCategoryId(null);
  };
  
  /* Questions navigation removed */
  
  // Start editing a category
  const startEditing = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditCategoryName(category.name);
    setEditRubric(category.rubric ? [...category.rubric] : [{ min: 0, max: 10, storyPoints: 1 }]);
    // Clear any previous messages
    setError('');
    setSuccess('');
  };
  
  // Cancel editing
  const cancelEditing = () => {
    setEditingCategoryId(null);
    setEditCategoryName('');
    setEditRubric([]);
  };
  
  // Validate rubric (can be used for both new and edit)
  const validateRubric = (rubricToValidate: RubricRange[]): string => {
    // Check for empty rubric
    if (rubricToValidate.length === 0) {
      return 'At least one rubric range is required.';
    }
    
    // Check for invalid ranges (min > max)
    for (const range of rubricToValidate) {
      if (range.min >= range.max) {
        return 'Minimum value must be less than maximum value.';
      }
      if (range.min < 0) {
        return 'Minimum value cannot be negative.';
      }
      if (range.storyPoints <= 0) {
        return 'Story points must be positive.';
      }
    }
    
    // Check for overlapping ranges
    for (let i = 0; i < rubricToValidate.length; i++) {
      for (let j = i + 1; j < rubricToValidate.length; j++) {
        if (
          rubricToValidate[i].min <= rubricToValidate[j].max &&
          rubricToValidate[i].max >= rubricToValidate[j].min
        ) {
          return 'Rubric ranges cannot overlap.';
        }
      }
    }
    
    // Check for duplicate story points
    const storyPoints = rubricToValidate.map(r => r.storyPoints);
    if (new Set(storyPoints).size !== storyPoints.length) {
      return 'Each rubric range must have a unique story point value.';
    }
    
    return '';
  };
  
  // Save edited category
  const saveEditing = async () => {
    if (!editingCategoryId || !selectedTeam) return;
    
    setError('');
    setSuccess('');
    
    if (!editCategoryName.trim()) {
      setError('Category name cannot be empty.');
      return;
    }
    
    // Check if name already exists (excluding the current category)
    const nameExists = categories.some(
      cat => cat.id !== editingCategoryId && 
      cat.name.toLowerCase() === editCategoryName.trim().toLowerCase()
    );
    
    if (nameExists) {
      setError('A category with this name already exists.');
      return;
    }
    
    // Always validate rubric
    const rubricError = validateRubric(editRubric);
    if (rubricError) {
      setError(rubricError);
      return;
    }
    
    try {
      setLoading(true);
      const res = await axios.put(`http://localhost:4000/categories/${editingCategoryId}`, {
        name: editCategoryName.trim(),
        rubric: editRubric,
      });
      
      // Update the categories list
      setCategories(categories.map(cat => 
        cat.id === editingCategoryId ? res.data : cat
      ));
      
      setSuccess('Category updated successfully!');
      // Exit edit mode
      setEditingCategoryId(null);
    } catch (err) {
      setError('Failed to update category. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Add new category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!selectedTeam) {
      setError('Please select a team first.');
      return;
    }
    
    if (!newCategoryName.trim()) {
      setError('Category name cannot be empty.');
      return;
    }
    
    if (categories.some(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      setError('A category with this name already exists.');
      return;
    }
    
    // Validate rubric if shown
    if (showRubricBuilder) {
      const rubricError = validateRubric(rubric);
      if (rubricError) {
        setError(rubricError);
        return;
      }
    }
    
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:4000/categories', {
        name: newCategoryName.trim(),
        tenantId: selectedTeam.id,
        rubric: showRubricBuilder ? rubric : [],
      });
      
      setCategories([...categories, res.data]);
      setSuccess('Category created successfully!');
      setNewCategoryName('');
      setRubric([{ min: 0, max: 10, storyPoints: 1 }]);
      setShowRubricBuilder(true);
      /* Return to list to see the newly created category */
      setViewMode('existing');
    } catch (err) {
      setError('Failed to create category. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Add new rubric range (for new category)
  const addRubricRange = () => {
    const lastRange = rubric[rubric.length - 1];
    const newMin = lastRange ? lastRange.max + 1 : 0;
    const newMax = newMin + 10;
    const newStoryPoints = lastRange ? lastRange.storyPoints + 1 : 1;
    
    setRubric([...rubric, { min: newMin, max: newMax, storyPoints: newStoryPoints }]);
  };
  
  // Add new rubric range (for edit category)
  const addEditRubricRange = () => {
    const lastRange = editRubric[editRubric.length - 1];
    const newMin = lastRange ? lastRange.max + 1 : 0;
    const newMax = newMin + 10;
    const newStoryPoints = lastRange ? lastRange.storyPoints + 1 : 1;
    
    setEditRubric([...editRubric, { min: newMin, max: newMax, storyPoints: newStoryPoints }]);
  };
  
  // Remove rubric range (for new category)
  const removeRubricRange = (index: number) => {
    setRubric(rubric.filter((_, i) => i !== index));
  };
  
  // Remove rubric range (for edit category)
  const removeEditRubricRange = (index: number) => {
    setEditRubric(editRubric.filter((_, i) => i !== index));
  };
  
  // Update rubric range (for new category)
  const updateRubricRange = (index: number, field: keyof RubricRange, value: number) => {
    const updatedRubric = [...rubric];
    updatedRubric[index][field] = value;
    setRubric(updatedRubric);
  };
  
  // Update rubric range (for edit category)
  const updateEditRubricRange = (index: number, field: keyof RubricRange, value: number) => {
    const updatedRubric = [...editRubric];
    updatedRubric[index][field] = value;
    setEditRubric(updatedRubric);
  };
  
  // Reset team selection
  const resetTeamSelection = () => {
    setSelectedTeam(null);
    setTeamSearch('');
    setCategories([]);
    setNewCategoryName('');
    setRubric([{ min: 0, max: 10, storyPoints: 1 }]);
    setShowRubricBuilder(true);
    setEditingCategoryId(null);
    setError('');
    setSuccess('');
  };
  
  // Styles for the centered white box layout
  const pageContainer = {
    height: '100vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--color-background)',
  };
  
  const whiteBoxContainer = {
    width: '50%',
    height: '85vh',
    backgroundColor: '#fff',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    padding: '1.25rem',
  };
  
  const headerSection = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  };
  
  const heading = {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--color-text)',
    fontFamily: 'var(--font-heading)',
    margin: 0,
  };
  
  const teamSelectionWrapper = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
    maxWidth: '50%',
  };
  
  const searchContainer = {
    position: 'relative' as const,
    flex: 1,
  };
  
  const searchInput = {
    width: '100%',
    padding: '0.4rem 0.6rem',
    fontSize: '0.875rem',
    borderRadius: '0.25rem',
    border: '1px solid var(--color-border)',
    backgroundColor: '#fff',
    outline: 'none',
    transition: 'all 0.2s ease',
    ...(teamSearchFocused ? {
      borderColor: 'var(--color-primary)',
      boxShadow: '0 0 0 2px rgba(31, 58, 147, 0.1)',
    } : {}),
  };
  
  const suggestionsList = {
    position: 'absolute' as const,
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: '0.25rem',
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    zIndex: 10,
    maxHeight: '150px',
    overflowY: 'auto' as const,
    marginTop: '0.25rem',
  };
  
  const suggestionItem = {
    padding: '0.4rem 0.6rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    borderBottom: '1px solid var(--color-border)',
    fontSize: '0.875rem',
  };
  
  const suggestionItemHover = {
    backgroundColor: 'var(--color-background)',
  };
  
  const selectedTeamContainer = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--color-background)',
    padding: '0.4rem 0.6rem',
    borderRadius: '0.25rem',
    border: '1px solid var(--color-border)',
    fontSize: '0.875rem',
  };
  
  const selectedTeamName = {
    fontWeight: 600,
    color: 'var(--color-text)',
  };
  
  const changeTeamButton = {
    padding: '0.25rem 0.5rem',
    backgroundColor: '#fff',
    border: '1px solid var(--color-border)',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.75rem',
  };
  
  const changeTeamButtonHover = {
    backgroundColor: 'var(--color-background)',
    borderColor: 'var(--color-primary)',
  };
  
  // Main content – single column with conditional rendering
  const mainContent = {
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    height: '100%',
  };
  
  const columnStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
    height: '100%',
  };
  
  const sectionHeader = {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-heading)',
  };
  
  /* View-mode toggle button styles */
  const viewModeBtn = {
    padding: '0.3rem 0.6rem',
    fontSize: '0.8rem',
    borderRadius: '0.25rem',
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    backgroundColor: '#fff',
  };
  const viewModeBtnActive = {
    ...viewModeBtn,
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    borderColor: 'var(--color-primary)',
  };

  const categoryListContainer = {
    overflowY: 'auto' as const,
    flex: 1,
    padding: '0.25rem',
    backgroundColor: 'var(--color-background)',
    borderRadius: '0.25rem',
  };
  
  const categoryList = {
    display: 'flex',
    flexDirection: 'column' as const,
  };
  
  const categoryCard = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    borderBottom: '1px solid var(--color-border)',
    transition: 'background-color 0.15s ease',
  };
  
  const categoryCardHover = {
    backgroundColor: 'var(--color-background)',
  };
  
  const categoryName = {
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '0.25rem',
    color: 'var(--color-secondary)',
  };
  
  const categoryRubricInfo = {
    fontSize: '0.75rem',
    color: 'var(--color-text-light)',
    marginBottom: '0.5rem',
  };
  
  const categoryActions = {
    display: 'flex',
    gap: '0.25rem',
    marginLeft: 'auto',
  };
  
  const actionButton = {
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };
  
  const editButton = {
    ...actionButton,
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  };
  
  const editButtonHover = {
    backgroundColor: '#f3f4f6',
    borderColor: 'var(--color-primary)',
  };
  
  /* Questions button styles removed */
  
  const saveButton = {
    ...actionButton,
    backgroundColor: '#10b981', // Green
    border: '1px solid #10b981',
    color: '#fff',
  };
  
  const saveButtonHover = {
    backgroundColor: '#059669',
  };
  
  const cancelButton = {
    ...actionButton,
    backgroundColor: '#f3f4f6',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text)',
  };
  
  const cancelButtonHover = {
    backgroundColor: '#e5e7eb',
  };
  
  const formContainer = {
    backgroundColor: '#fff',
    borderRadius: '0.25rem',
    border: '1px solid var(--color-border)',
    padding: '0.75rem',
    flex: 1,
    overflowY: 'auto' as const,
  };
  
  const formGroup = {
    marginBottom: '0.75rem',
  };
  
  const formLabel = {
    display: 'block',
    marginBottom: '0.25rem',
    fontWeight: 600,
    color: 'var(--color-text)',
    fontSize: '0.875rem',
  };
  
  const formInput = {
    width: '100%',
    padding: '0.4rem 0.6rem',
    fontSize: '0.875rem',
    borderRadius: '0.25rem',
    border: '1px solid var(--color-border)',
    outline: 'none',
    transition: 'all 0.2s ease',
  };
  
  const formInputFocus = {
    borderColor: 'var(--color-primary)',
    boxShadow: '0 0 0 2px rgba(31, 58, 147, 0.1)',
  };
  
  const buttonPrimary = {
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.75rem',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };
  
  const buttonPrimaryHover = {
    backgroundColor: '#152a6e', // Darker shade of primary
  };
  
  const buttonSecondary = {
    backgroundColor: '#fff',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
    padding: '0.4rem 0.75rem',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };
  
  const buttonSecondaryHover = {
    backgroundColor: 'var(--color-background)',
    borderColor: 'var(--color-primary)',
  };
  
  const rubricContainer = {
    backgroundColor: 'var(--color-background)',
    borderRadius: '0.25rem',
    padding: '0.75rem',
    marginTop: '0.5rem',
    marginBottom: '0.75rem',
  };
  
  const rubricGrid = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr auto',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  };
  
  const rubricHeader = {
    fontWeight: 600,
    marginBottom: '0.25rem',
    fontSize: '0.75rem',
    color: 'var(--color-text)',
  };
  
  const rubricInput = {
    width: '100%',
    padding: '0.25rem 0.5rem',
    fontSize: '0.75rem',
    borderRadius: '0.25rem',
    border: '1px solid var(--color-border)',
    outline: 'none',
  };
  
  const removeButton = {
    backgroundColor: '#fee2e2',
    color: '#ef4444',
    border: 'none',
    width: '24px',
    height: '24px',
    borderRadius: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '0.75rem',
  };
  
  const removeButtonHover = {
    backgroundColor: '#fecaca',
  };
  
  const errorMessage = {
    color: 'var(--color-error)',
    marginTop: '0.25rem',
    fontSize: '0.75rem',
  };
  
  const successMessage = {
    color: '#10b981', // Green
    marginTop: '0.25rem',
    fontSize: '0.75rem',
  };
  
  const loadingMessage = {
    color: 'var(--color-text-light)',
    fontSize: '0.875rem',
    marginBottom: '0.5rem',
  };
  
  const emptyState = {
    textAlign: 'center' as const,
    padding: '1rem',
    color: 'var(--color-text-light)',
    backgroundColor: 'var(--color-background)',
    borderRadius: '0.25rem',
    fontSize: '0.875rem',
  };
  
  return (
    <div style={pageContainer}>
      <div style={whiteBoxContainer}>
        {/* Header Section with Inline Team Selection */}
        <div style={headerSection}>
          <h1 style={heading}>Categories</h1>
          {/* Only show compact team info when a team is already selected */}
          {selectedTeam && (
            <div style={teamSelectionWrapper}>
              <div style={selectedTeamContainer}>
                <div style={selectedTeamName}>Team: {selectedTeam.name}</div>
                <button
                  style={changeTeamBtnHover ? { ...changeTeamButton, ...changeTeamButtonHover } : changeTeamButton}
                  onMouseEnter={() => setChangeTeamBtnHover(true)}
                  onMouseLeave={() => setChangeTeamBtnHover(false)}
                  onClick={resetTeamSelection}
                >
                  Change
                </button>
              </div>
              {/* View-mode toggle */}
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
                  View Categories
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
                    /* reset messages */
                    setError('');
                    setSuccess('');
                  }}
                >
                  Create New
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Main Content - Single Column */}
        {selectedTeam ? (
          <div style={mainContent}>
            {viewMode === 'existing' && (
              <div style={columnStyle}>
              <h2 style={sectionHeader}>Existing Categories</h2>
              <div style={categoryListContainer}>
                {loading && categories.length === 0 ? (
                  <div style={loadingMessage}>Loading categories...</div>
                ) : categories.length > 0 ? (
                  <div style={categoryList}>
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        style={categoryHover === category.id ? { ...categoryCard, ...categoryCardHover } : categoryCard}
                        onMouseEnter={() => setCategoryHover(category.id)}
                        onMouseLeave={() => setCategoryHover(null)}
                      >
                        {/* Edit Mode */}
                        {editingCategoryId === category.id ? (
                          <>
                            <div style={formGroup}>
                              <label style={formLabel}>Category Name</label>
                              <input
                                type="text"
                                style={editCategoryNameFocused ? { ...formInput, ...formInputFocus } : formInput}
                                value={editCategoryName}
                                onChange={(e) => setEditCategoryName(e.target.value)}
                                onFocus={() => setEditCategoryNameFocused(true)}
                                onBlur={() => setEditCategoryNameFocused(false)}
                              />
                            </div>

                              <div style={rubricContainer}>
                                <div style={rubricGrid}>
                                  <div style={rubricHeader}>Min</div>
                                  <div style={rubricHeader}>Max</div>
                                  <div style={rubricHeader}>Points</div>
                                  <div></div>
                                  
                                  {editRubric.map((range, index) => (
                                    <React.Fragment key={index}>
                                      <div>
                                        <input
                                          type="number"
                                          style={rubricInput}
                                          value={range.min}
                                          onChange={(e) => updateEditRubricRange(index, 'min', parseInt(e.target.value) || 0)}
                                        />
                                      </div>
                                      <div>
                                        <input
                                          type="number"
                                          style={rubricInput}
                                          value={range.max}
                                          onChange={(e) => updateEditRubricRange(index, 'max', parseInt(e.target.value) || 0)}
                                        />
                                      </div>
                                      <div>
                                        <input
                                          type="number"
                                          style={rubricInput}
                                          value={range.storyPoints}
                                          onChange={(e) => updateEditRubricRange(index, 'storyPoints', parseInt(e.target.value) || 0)}
                                        />
                                      </div>
                                      <div>
                                        {editRubric.length > 1 && (
                                          <button
                                            type="button"
                                            style={removeButton}
                                            onClick={() => removeEditRubricRange(index)}
                                          >
                                            ×
                                          </button>
                                        )}
                                      </div>
                                    </React.Fragment>
                                  ))}
                                </div>
                                
                                <button
                                  type="button"
                                  style={addEditRangeBtnHover ? { ...buttonSecondary, ...buttonSecondaryHover } : buttonSecondary}
                                  onMouseEnter={() => setAddEditRangeBtnHover(true)}
                                  onMouseLeave={() => setAddEditRangeBtnHover(false)}
                                  onClick={addEditRubricRange}
                                >
                                  + Add Range
                                </button>
                              </div>
                            {/* Feedback messages for this edit form */}
                            {error && editingCategoryId === category.id && (
                              <div style={errorMessage}>{error}</div>
                            )}
                            {success && editingCategoryId === category.id && (
                              <div style={successMessage}>{success}</div>
                            )}

                            {/* Action buttons */}
                            <div style={categoryActions}>
                              <button
                                type="button"
                                style={saveBtnHover ? { ...saveButton, ...saveButtonHover } : saveButton}
                                onMouseEnter={() => setSaveBtnHover(true)}
                                onMouseLeave={() => setSaveBtnHover(false)}
                                onClick={saveEditing}
                                disabled={loading}
                              >
                                {loading ? 'Saving...' : 'Save'}
                              </button>

                              <button
                                type="button"
                                style={cancelBtnHover ? { ...cancelButton, ...cancelButtonHover } : cancelButton}
                                onMouseEnter={() => setCancelBtnHover(true)}
                                onMouseLeave={() => setCancelBtnHover(false)}
                                onClick={cancelEditing}
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          /* View Mode */
                          <>
                            <div style={categoryName}>{category.name}</div>
                            <div style={categoryRubricInfo}>
                              {category.rubric && category.rubric.length > 0
                                ? `${category.rubric.length} rubric ranges`
                                : 'No rubric defined'}
                            </div>
                            <div style={categoryActions}>
                              <button
                                type="button"
                                style={editBtnHover === category.id ? { ...editButton, ...editButtonHover } : editButton}
                                onMouseEnter={() => setEditBtnHover(category.id)}
                                onMouseLeave={() => setEditBtnHover(null)}
                                onClick={() => startEditing(category)}
                              >
                                Edit
                              </button>
                              {/* Questions button removed */}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={emptyState}>
                    No categories found for this team. Create your first category.
                  </div>
                )}
              </div>
            </div>
            )}

            {viewMode === 'create' && (
              <div style={columnStyle}>
              <h2 style={sectionHeader}>Create New Category</h2>
              <div style={formContainer}>
                <form onSubmit={handleAddCategory}>
                  <div style={formGroup}>
                    <label style={formLabel}>Category Name</label>
                    <input
                      type="text"
                      placeholder="Enter category name"
                      style={categoryNameFocused ? { ...formInput, ...formInputFocus } : formInput}
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onFocus={() => setCategoryNameFocused(true)}
                      onBlur={() => setCategoryNameFocused(false)}
                    />
                  </div>
                  
                  <div style={rubricContainer}>
                    <div style={rubricGrid}>
                      <div style={rubricHeader}>Min</div>
                      <div style={rubricHeader}>Max</div>
                      <div style={rubricHeader}>Points</div>
                      <div></div>
                      
                      {rubric.map((range, index) => (
                        <React.Fragment key={index}>
                          <div>
                            <input
                              type="number"
                              style={rubricInput}
                              value={range.min}
                              onChange={(e) => updateRubricRange(index, 'min', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              style={rubricInput}
                              value={range.max}
                              onChange={(e) => updateRubricRange(index, 'max', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              style={rubricInput}
                              value={range.storyPoints}
                              onChange={(e) => updateRubricRange(index, 'storyPoints', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            {rubric.length > 1 && (
                              <button
                                type="button"
                                style={removeButton}
                                onClick={() => removeRubricRange(index)}
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                    
                    <button
                      type="button"
                      style={addRangeBtnHover ? { ...buttonSecondary, ...buttonSecondaryHover } : buttonSecondary}
                      onMouseEnter={() => setAddRangeBtnHover(true)}
                      onMouseLeave={() => setAddRangeBtnHover(false)}
                      onClick={addRubricRange}
                    >
                      + Add Range
                    </button>
                  </div>
                  
                  {error && !editingCategoryId && <div style={errorMessage}>{error}</div>}
                  {success && !editingCategoryId && <div style={successMessage}>{success}</div>}
                  
                  <div style={{ marginTop: '0.75rem' }}>
                    <button
                      type="submit"
                      style={addCategoryBtnHover ? { ...buttonPrimary, ...buttonPrimaryHover } : buttonPrimary}
                      onMouseEnter={() => setAddCategoryBtnHover(true)}
                      onMouseLeave={() => setAddCategoryBtnHover(false)}
                      disabled={loading}
                    >
                      {loading && !editingCategoryId ? 'Creating...' : 'Create Category'}
                    </button>
                  </div>
                </form>
              </div>
              </div>
            )}
          </div>
        ) : (
          /* -------- PROMINENT TEAM SELECTION UI (no team selected) ---------- */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <h2 style={{ ...sectionHeader, fontSize: '1.25rem', marginBottom: '1rem' }}>
              Select a Team to Manage Categories
            </h2>
            <div style={{ width: '80%', maxWidth: '400px' }}>
              <div style={searchContainer}>
                <input
                  ref={teamSearchInputRef}
                  type="text"
                  placeholder="Start typing team name..."
                  style={{ ...searchInput, fontSize: '1rem' }}
                  value={teamSearch}
                  onChange={(e) => setTeamSearch(e.target.value)}
                  onFocus={() => setTeamSearchFocused(true)}
                  onBlur={() => setTeamSearchFocused(false)}
                />

                {teamSuggestions.length > 0 && (
                  <div style={suggestionsList}>
                    {teamSuggestions.map((team) => (
                      <div
                        key={team.id}
                        style={{
                          ...suggestionItem,
                          ...(teamSearch.toLowerCase() === team.name.toLowerCase() ? suggestionItemHover : {})
                        }}
                        onMouseDown={() => handleTeamSelect(team)}
                      >
                        {team.name}
                      </div>
                    ))}
                  </div>
                )}

                {loading && teamSuggestions.length === 0 && (
                  <div style={{ ...loadingMessage, textAlign: 'center' }}>Searching...</div>
                )}

                {teamSearch && !loading && teamSuggestions.length === 0 && (
                  <div style={{ ...errorMessage, textAlign: 'center' }}>No teams found</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;

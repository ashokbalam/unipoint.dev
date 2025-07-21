import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  categoriesPageWrapper,
  pageContainer,
  heading,
  categoryList,
  categoryButton,
  categoryButtonHover,
  loadingText,
  errorText,
  addForm,
  addLabel,
  addInput,
  addInputFocus,
  addError,
  addSuccess,
  addButton,
  addButtonHover,
  backButton,
  backButtonHover,
  contentWrapper
} from './Categories.styles';

interface Category {
  id: string;
  name: string;
}

interface CategoriesProps {
  godMode: boolean;
  tenantId: string;
}

const Categories: React.FC<CategoriesProps> = ({ godMode, tenantId }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [catBtnHover, setCatBtnHover] = useState<string | null>(null);
  const [addBtnHover, setAddBtnHover] = useState(false);
  const [inputFocus, setInputFocus] = useState(false);
  const [backBtnHover, setBackBtnHover] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!tenantId) {
      setError('No tenant selected.');
      setLoading(false);
      return;
    }
    setLoading(true);
    axios.get(`http://localhost:4000/categories?tenantId=${tenantId}`)
      .then(res => setCategories(res.data))
      .catch(() => setError('Failed to load categories.'))
      .finally(() => setLoading(false));
  }, [tenantId]);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newCategory.trim()) {
      setError('Category name cannot be empty.');
      return;
    }
    if (categories.some(cat => cat.name.toLowerCase() === newCategory.trim().toLowerCase())) {
      setError('Category already exists.');
      return;
    }
    try {
      const res = await axios.post('http://localhost:4000/categories', {
        name: newCategory.trim(),
        tenantId,
        rubric: [],
      });
      setCategories([...categories, res.data]);
      setSuccess('Category added!');
      setNewCategory('');
    } catch {
      setError('Failed to add category.');
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    navigate('/questions', { state: { tenantId, categoryId } });
  };

  return (
    <div style={categoriesPageWrapper}>
      <button
        style={backBtnHover ? { ...backButton, ...backButtonHover } : backButton}
        onMouseEnter={() => setBackBtnHover(true)}
        onMouseLeave={() => setBackBtnHover(false)}
        onClick={() => navigate('/')}
      >
        &larr; Back to Squad Selection
      </button>
      <div style={pageContainer}>
        <h2 style={heading}>Categories</h2>
        <div style={contentWrapper}>
          {loading ? (
            <div style={loadingText}>Loading categories...</div>
          ) : error ? (
            <div style={errorText}>{error}</div>
          ) : (
            <ul style={categoryList}>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    style={catBtnHover === cat.id ? { ...categoryButton, ...categoryButtonHover } : categoryButton}
                    onMouseEnter={() => setCatBtnHover(cat.id)}
                    onMouseLeave={() => setCatBtnHover(null)}
                    onClick={() => handleCategoryClick(cat.id)}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {godMode && (
          <form onSubmit={handleAddCategory} style={addForm}>
            <div>
              <label style={addLabel}>Add New Category</label>
              <input
                type="text"
                style={inputFocus ? { ...addInput, ...addInputFocus } : addInput}
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onFocus={() => setInputFocus(true)}
                onBlur={() => setInputFocus(false)}
                placeholder="Category name"
              />
            </div>
            {error && <div style={addError}>{error}</div>}
            {success && <div style={addSuccess}>{success}</div>}
            <button
              type="submit"
              style={addBtnHover ? { ...addButton, ...addButtonHover } : addButton}
              onMouseEnter={() => setAddBtnHover(true)}
              onMouseLeave={() => setAddBtnHover(false)}
            >
              Add Category
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Categories; 
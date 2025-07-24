import React, { useState } from 'react';
import axios from 'axios';

/* ------------------------------------------------------------------
 * Styles
 * ----------------------------------------------------------------- */
import {
  pageContainer,
  titleSection,
  pageTitle,
  pageSubtitle,
  formContainer,
  formSection,
  inputGroup,
  inputLabel,
  textInput,
  errorMessage,
  successMessage,
  submitButton,
  submitButtonDisabled,
} from './OnboardTenant.styles';

const OnboardTenant: React.FC = () => {
  const [teamName, setTeamName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  /* ------------------------------------------------------------------
   * UI interaction states
   * ----------------------------------------------------------------- */
  const [inputFocused, setInputFocused] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (isSubmitting) return;
    if (!teamName) {
      setError('Please fill in a team name.');
      return;
    }
    try {
      setIsSubmitting(true);
      await axios.post('http://localhost:4000/tenants', { name: teamName.trim() });
      setSuccess(`Team '${teamName.trim()}' onboarded successfully!`);
      setTeamName('');
    } catch (err) {
      const axiosError = err as import('axios').AxiosError;
      if (axiosError.response && axiosError.response.status === 409) {
        setError('A team with this name already exists.');
      } else {
        setError('Failed to onboard team. Please try again.');
      }
      console.error('Onboarding error:', err);
    }
    setIsSubmitting(false);
  };

  return (
    <div style={pageContainer}>
      {/* Header */}
      <section style={titleSection}>
        <h1 style={pageTitle}>Create New Team</h1>
        <p style={pageSubtitle}>
          Add a new tenant (squad) to your workspace. Give it a memorable name so your team can easily
          find it later.
        </p>
      </section>

      {/* Form Card */}
      <div style={formContainer}>
        <form style={formSection} onSubmit={handleSubmit} noValidate>
          <div style={inputGroup}>
            <label htmlFor="teamName" style={inputLabel}>
              Team Name
            </label>
            <input
              id="teamName"
              type="text"
              style={{
                ...textInput,
                ...(inputFocused
                  ? {
                      borderColor: 'var(--color-primary)',
                      boxShadow: '0 0 0 3px rgba(99,102,241,0.2)',
                    }
                  : {}),
              }}
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Enter team name"
              aria-invalid={!!error}
              aria-describedby="teamName-error"
            />
            {error && (
              <div id="teamName-error" style={errorMessage}>
                {error}
              </div>
            )}
            {success && <div style={successMessage}>{success}</div>}
          </div>

          <button
            type="submit"
            style={{
              ...submitButton,
              ...(isSubmitting || !teamName.trim() ? submitButtonDisabled : {}),
              ...(buttonHovered && !isSubmitting && teamName.trim()
                ? { backgroundColor: '#4f46e5', transform: 'translateY(-1px)' }
                : {}),
            }}
            disabled={isSubmitting || !teamName.trim()}
            aria-disabled={isSubmitting || !teamName.trim()}
            aria-busy={isSubmitting}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
          >
            {isSubmitting ? 'Creating…' : 'Create Team'}
          </button>
        </form>
      </div>

    </div>
  );
};

export default OnboardTenant; 
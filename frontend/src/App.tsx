import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import OnboardTenant from './pages/OnboardTenant';
import Categories from './pages/Categories';
import Questions from './pages/Questions';
import AnswerQuestionnaire from './pages/AnswerQuestionnaire';
import TeamSelectionPage from './pages/TeamSelectionPage';
import Footer from './components/Footer';
import Header from './components/Header';
import {
  appContainer,
  headerSpacer,
  mainContent,
  contentWrapper,
  godModeButton,
  godModeOverlay,
  godModeSlider,
  godModeSliderOpen,
  godModeSliderContent,
  godModeSliderTitle,
  godModeSliderText,
  godModeInput,
  godModeError,
  godModeButtonGroup,
  godModeCancelButton,
  godModeSubmitButton,
  godModeOptionsContainer,
  godModeMenuItem,
  godModeCloseContainer,
  godModeCloseButton,
  godModeButtonContainer
} from './App.styles';

function GodModeButton({ setGodMode, godMode }: { setGodMode: (v: boolean) => void, godMode: boolean }) {
  const [sliderOpen, setSliderOpen] = React.useState(false);
  const [answer, setAnswer] = React.useState('');
  const [error, setError] = React.useState('');
  const navigate = useNavigate();

  const handleGodModeClick = () => {
    setSliderOpen(true);
    // Always clear previous state when opening
    setAnswer('');
    setError('');
  };

  const handleSliderClose = () => {
    setSliderOpen(false);
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(e.target.value);
    setError('');
  };

  const handleGodModeSubmit = () => {
    if (answer.trim() === 'unipoints2024') {
      setGodMode(true);
      setError('');
    } else {
      setError('Incorrect answer. Try again.');
    }
  };

  const handleMenuSelect = (path: string) => {
    navigate(path);
    setSliderOpen(false);
  };

  return (
    <div style={godModeButtonContainer}>
      <button
        onClick={handleGodModeClick}
        aria-haspopup="true"
        aria-expanded={sliderOpen ? 'true' : undefined}
        style={godModeButton}
      >
        God Mode
      </button>
      
      {sliderOpen && (
        <>
          <div 
            style={{ ...godModeOverlay, opacity: sliderOpen ? 1 : 0 }} 
            onClick={handleSliderClose} 
          />
          <div style={{ ...godModeSlider, ...(sliderOpen && godModeSliderOpen) }}>
            <div style={godModeSliderContent}>
              {!godMode ? (
                // Use !godMode as the single source of truth
                // Password input view
                <>
                  <h3 style={godModeSliderTitle}>God Mode Access</h3>
                  <p style={godModeSliderText}>What is the secret code?</p>
                  <input
                    type="password"
                    style={godModeInput}
                    value={answer}
                    onChange={handleAnswerChange}
                    placeholder="Secret Code"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleGodModeSubmit();
                      }
                    }}
                  />
                  {error && <div style={godModeError}>{error}</div>}
                  <div style={godModeButtonGroup}>
                    <button onClick={handleSliderClose} style={godModeCancelButton}>Cancel</button>
                    <button onClick={handleGodModeSubmit} style={godModeSubmitButton}>Submit</button>
                  </div>
                </>
              ) : (
                // Admin options view
                <>
                  <h3 style={godModeSliderTitle}>Admin Panel</h3>
                  <p style={godModeSliderText}>Select an option to manage:</p>
                  <div style={godModeOptionsContainer}>
                    <button
                      onClick={() => handleMenuSelect('/onboard')}
                      style={godModeMenuItem}
                    >
                      Team Management
                    </button>
                    <button
                      onClick={() => handleMenuSelect('/categories')}
                      style={godModeMenuItem}
                    >
                      Category Management
                    </button>
                    <button
                      onClick={() => handleMenuSelect('/questions')}
                      style={godModeMenuItem}
                    >
                      Question Management
                    </button>
                  </div>
                  <div style={godModeCloseContainer}>
                    <button 
                      onClick={handleSliderClose}
                      style={godModeCloseButton}
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Helper wrappers for state-based routing
function CategoriesWithState(props: { godMode: boolean }) {
  const location = useLocation();
  const tenantId = location.state?.tenantId || '';
  return <Categories {...props} tenantId={tenantId} />;
}
function QuestionsWithState(props: { godMode: boolean }) {
  const location = useLocation();
  const tenantId = location.state?.tenantId || '';
  const categoryId = location.state?.categoryId || '';
  return <Questions {...props} tenantId={tenantId} categoryId={categoryId} />;
}

function App() {
  const [godMode, setGodMode] = React.useState(false);

  return (
    <div style={appContainer}>
      <Router>
        {/* Header */}
        <Header />
        <GodModeButton godMode={godMode} setGodMode={setGodMode} />
        {/* Spacer for fixed header */}
        <div style={headerSpacer} />
        {/* Main Content */}
        <main style={mainContent}>
          <div style={contentWrapper}>
            <Routes>
              <Route path="/onboard" element={<OnboardTenant godMode={godMode} />} />
              <Route path="/categories" element={<CategoriesWithState godMode={godMode} />} />
              <Route path="/questions" element={<QuestionsWithState godMode={godMode} />} />
              <Route path="/questionnaire/:teamId" element={<AnswerQuestionnaire />} />
              <Route path="/" element={<TeamSelectionPage />} />
              <Route path="*" element={<TeamSelectionPage />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;

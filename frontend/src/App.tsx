import React, { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import OnboardTenant from './pages/OnboardTenant';
import Categories from './pages/Categories';
import Questions from './pages/Questions';
import AnswerQuestionnaire from './pages/AnswerQuestionnaire';
import TeamSelectionPage from './pages/TeamSelectionPage';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import {
  appContainer,
  mainContent,
  contentWrapper,
} from './App.styles';

// Helper wrappers for state-based routing
function CategoriesWithState() {
  // Team can now be selected inside the Categories page itself
  return <Categories />;
}

function QuestionsWithState() {
  const location = useLocation();
  const tenantId = location.state?.tenantId || '';
  const categoryId = location.state?.categoryId || '';
  return <Questions tenantId={tenantId} categoryId={categoryId} />;
}

function App() {
  /* ------------------------------------------------------------------
   * God Mode state & toggle
   * ----------------------------------------------------------------- */
  const [isGodModeEnabled, setIsGodModeEnabled] = useState(false);

  const toggleGodMode = useCallback(() => {
    if (isGodModeEnabled) {
      setIsGodModeEnabled(false);
      return;
    }
    const entered = window.prompt('Enter God Mode passcode');
    if (entered === 'admin123') {
      setIsGodModeEnabled(true);
    } else if (entered !== null) {
      window.alert('Incorrect passcode');
    }
  }, [isGodModeEnabled]);

  return (
    <div style={appContainer}>
      <Router>
        {/* New Navigation Component */}
        <Navigation
          isGodModeEnabled={isGodModeEnabled}
          toggleGodMode={toggleGodMode}
        />
        {/* Main Content */}
        <main style={mainContent}>
          <div style={contentWrapper}>
            <Routes>
              <Route path="/onboard" element={<OnboardTenant />} />
              <Route path="/categories" element={<CategoriesWithState />} />
              <Route path="/questions" element={<QuestionsWithState />} />
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

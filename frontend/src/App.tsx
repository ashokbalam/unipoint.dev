import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageTransition from './components/PageTransition';
import OnboardTenant from './pages/OnboardTenant';
import Categories from './pages/Categories';
import Questions from './pages/Questions';
import AnswerQuestionnaire from './pages/AnswerQuestionnaire';
import TeamSelectionPage from './pages/TeamSelectionPage';
import BulkUploadPage from './pages/BulkUploadPage';
import ManagePage from './pages/ManagePage';
import Footer from './components/Footer';
import Navigation from './components/Navigation';
import {
  appContainer,
  mainContent,
} from './App.styles';

// Helper wrappers for state-based routing
function CategoriesWithState() {
  // Team can now be selected inside the Categories page itself
  return <Categories />;
}

function QuestionsWithState() {
  // The Questions page handles its own routing/state internally
  return <Questions />;
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
        {/* ------------------------------------------------------------
         * Top-level Navigation (always visible)
         * ---------------------------------------------------------- */}
        {/* New Navigation Component */}
        <Navigation
          isGodModeEnabled={isGodModeEnabled}
          toggleGodMode={toggleGodMode}
        />
        {/* ------------------------------------------------------------
         * Main Content Area
         * ---------------------------------------------------------- */}
        {/* Main Content */}
        <main style={mainContent}>
          {/* Page / Route transitions */}
          <RoutesWithTransitions />
        </main>
        <Footer />
      </Router>
    </div>
  );
}
/* ------------------------------------------------------------------
 * RoutesWithTransitions
 *  - Separate component so hooks stay inside <Router>
 *  - Handles smooth animated transitions between pages
 * ----------------------------------------------------------------- */
function RoutesWithTransitions() {
  return (
    <PageTransition type="perspective" transition="smooth">
      <Routes>
        <Route path="/onboard" element={<OnboardTenant />} />
        <Route path="/categories" element={<CategoriesWithState />} />
        <Route path="/questions" element={<QuestionsWithState />} />
        <Route path="/bulk-upload" element={<BulkUploadPage />} />
        {/* Consolidated admin dashboard */}
        <Route path="/manage" element={<ManagePage />} />
        <Route path="/questionnaire/:teamId" element={<AnswerQuestionnaire />} />
        <Route path="/" element={<TeamSelectionPage />} />
        <Route path="*" element={<TeamSelectionPage />} />
      </Routes>
    </PageTransition>
  );
}


export default App;

import { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Navbar, type View } from './components/layout/Navbar';
import { OnboardingProfile } from './components/profile/OnboardingProfile';
import { OpportunitiesFeed } from './components/opportunities/OpportunitiesFeed';
import { DemandDashboard } from './components/dashboard/DemandDashboard';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('onboarding');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--rjb-bg)' }}>
      <Navbar currentView={currentView} onNavigate={setCurrentView} />
      <main>
        {currentView === 'onboarding' && (
          <OnboardingProfile onComplete={() => setCurrentView('feed')} />
        )}
        {currentView === 'feed' && (
          <OpportunitiesFeed onGoToProfile={() => setCurrentView('onboarding')} />
        )}
        {currentView === 'dashboard' && <DemandDashboard />}
      </main>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;

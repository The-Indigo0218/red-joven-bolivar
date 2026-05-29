import { useState } from 'react';
import { Navbar, type View } from './components/layout/Navbar';
import { OnboardingProfile } from './components/profile/OnboardingProfile';
import { OpportunitiesFeed } from './components/opportunities/OpportunitiesFeed';
import { DemandDashboard } from './components/dashboard/DemandDashboard';

function App() {
  const [currentView, setCurrentView] = useState<View>('onboarding');

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--rjb-bg)' }}>
      <Navbar currentView={currentView} onNavigate={setCurrentView} />
      <main>
        {currentView === 'onboarding' && <OnboardingProfile />}
        {currentView === 'feed' && <OpportunitiesFeed />}
        {currentView === 'dashboard' && <DemandDashboard />}
      </main>
    </div>
  );
}

export default App;

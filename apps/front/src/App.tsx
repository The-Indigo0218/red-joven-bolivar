import { useState } from 'react';

import { AppProvider } from './context/AppContext';

import { useApp } from './hooks/useApp';

import { Navbar, type View } from './components/layout/Navbar';

import { OnboardingProfile } from './components/profile/OnboardingProfile';

import { OpportunitiesFeed } from './components/opportunities/OpportunitiesFeed';

import { DemandDashboard } from './components/dashboard/DemandDashboard';

import { RutaPersonal } from './components/route/RutaPersonal';

import { CivicCoinsScreen } from './components/civiccoins/CivicCoinsScreen';



function AppContent() {

  const { profile, cvSkillsRevision } = useApp();

  const [currentView, setCurrentView] = useState<View>('onboarding');

  const [routeOpportunityId, setRouteOpportunityId] = useState<string | null>(null);



  function navigate(view: View) {

    if (view !== 'route') {

      setRouteOpportunityId(null);

    }

    setCurrentView(view);

  }



  function openRoute(opportunityId: string) {

    setRouteOpportunityId(opportunityId);

    setCurrentView('route');

  }



  return (

    <div className="min-h-screen" style={{ backgroundColor: 'var(--rjb-bg)' }}>

      <Navbar

        currentView={currentView === 'route' ? 'feed' : currentView}

        onNavigate={navigate}

      />

      <main>

        {currentView === 'onboarding' && (

          <OnboardingProfile onComplete={() => setCurrentView('feed')} />

        )}

        {currentView === 'feed' && (

          <OpportunitiesFeed

            onGoToProfile={() => setCurrentView('onboarding')}

            onViewRoute={openRoute}

          />

        )}

        {currentView === 'route' && routeOpportunityId && (

          <RutaPersonal

            key={`${routeOpportunityId}-${profile?.id ?? 'none'}-${cvSkillsRevision}`}

            opportunityId={routeOpportunityId}

            onBack={() => setCurrentView('feed')}

            onRouteStarted={() => setCurrentView('civiccoins')}

          />

        )}

        {currentView === 'civiccoins' && (

          <CivicCoinsScreen

            key={profile?.id ?? 'no-profile'}

            onGoToProfile={() => setCurrentView('onboarding')}

          />

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


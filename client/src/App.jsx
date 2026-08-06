import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Topbar } from './components/layout/Topbar';
import { Sidebar } from './components/layout/Sidebar';

import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DemoLoginPage } from './pages/DemoLoginPage';
import { WasteStreamsPage } from './pages/WasteStreamsPage';
import { MatchesPage } from './pages/MatchesPage';
import { ForecastsPage } from './pages/ForecastsPage';
import { LogisticsPage } from './pages/LogisticsPage';
import { ImpactPage } from './pages/ImpactPage';
import { CommunityNetworkPage } from './pages/CommunityNetworkPage';

// Protected Route Guard Wrapper
const ProtectedLayout = () => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-parchment text-loam selection:bg-kraft selection:text-loam transition-colors">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          <Routes>
            <Route path="/" element={<Navigate to="/waste" replace />} />
            <Route path="/waste" element={<WasteStreamsPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/forecasts" element={<ForecastsPage />} />
            <Route path="/logistics/*" element={<LogisticsPage />} />
            <Route path="/impact" element={<ImpactPage />} />
            <Route path="/network" element={<CommunityNetworkPage />} />
            <Route path="*" element={<Navigate to="/waste" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/demo-login" element={<DemoLoginPage />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}

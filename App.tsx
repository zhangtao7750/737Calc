
import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import VrefCalculator from './components/VrefCalculator.tsx';
import HistoryView from './components/History.tsx';
import SettingsView from './components/Settings.tsx';
import MetarView from './components/MetarView.tsx';

const AppContent: React.FC = () => {
  const location = useLocation();

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/': return 'AeroCalc';
      case '/vref': return 'VREF Tool';
      case '/history': return 'History';
      case '/settings': return 'Settings';
      case '/wb': return 'Weight & Balance';
      case '/takeoff': return 'Take-off Perf';
      case '/metar': return 'Weather';
      default: return 'AeroCalc';
    }
  };

  const showBack = location.pathname !== '/' && location.pathname !== '/history' && location.pathname !== '/settings';

  return (
    <Layout title={getPageTitle(location.pathname)} showBack={showBack}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vref" element={<VrefCalculator />} />
        <Route path="/history" element={<HistoryView />} />
        <Route path="/settings" element={<SettingsView />} />
        <Route path="/wb" element={<PlaceholderComponent name="Weight & Balance" />} />
        <Route path="/takeoff" element={<PlaceholderComponent name="Take-off Perf" />} />
        <Route path="/metar" element={<MetarView />} />
      </Routes>
    </Layout>
  );
};

const PlaceholderComponent: React.FC<{ name: string }> = ({ name }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
    <h3 className="text-xl font-semibold mb-2">{name} Module</h3>
    <p className="text-sm px-10">This module is currently in development.</p>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;

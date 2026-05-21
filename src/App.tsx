import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/auth/AuthPage';
import AppLayout from './pages/app/AppLayout';
import Dashboard from './pages/app/Dashboard';
import AgentsList from './pages/app/agents/AgentsList';
import AgentDetail from './pages/app/agents/AgentDetail';
import TestSetsList from './pages/app/testsets/TestSetsList';
import TestSetDetail from './pages/app/testsets/TestSetDetail';
import RunsList from './pages/app/runs/RunsList';
import RunDetail from './pages/app/runs/RunDetail';
import Metrics from './pages/app/Metrics';
import Users from './pages/app/Users';
import RequireAuth from './components/RequireAuth';
import { registerTokenGetter, useAuth } from './contexts/AuthContext';

function TokenBridge() {
  const { getToken } = useAuth();
  useEffect(() => {
    registerTokenGetter(getToken);
  }, [getToken]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <TokenBridge />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />

        <Route
          path="/app"
          element={<RequireAuth><AppLayout /></RequireAuth>}
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard"       element={<Dashboard />} />
          <Route path="agents"          element={<AgentsList />} />
          <Route path="agents/:id"      element={<AgentDetail />} />
          <Route path="test-sets"       element={<TestSetsList />} />
          <Route path="test-sets/:id"   element={<TestSetDetail />} />
          <Route path="runs"            element={<RunsList />} />
          <Route path="runs/:id"        element={<RunDetail />} />
          <Route path="metrics"         element={<Metrics />} />
          <Route path="users"           element={<Users />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

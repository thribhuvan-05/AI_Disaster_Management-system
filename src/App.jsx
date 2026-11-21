import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/CitizenDashboard';
import CitizenReportPage from './pages/CitizenReportPage';
import AdminDashboard from './pages/AdminDashboard';
import RescueTeamDashboard from './pages/RescueTeamDashboard';
import CoordinatorDashboard from './pages/CoordinatorDashboard';
import SheltersPage from './pages/SheltersPage';
import HospitalsPage from './pages/HospitalsPage';
import AlertsPage from './pages/AlertsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AIAssistantPage from './pages/AIAssistantPage';

const ProtectedLayout = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-bold">
        Initializing AI Disaster System...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

const RoleBasedRootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'rescue') return <Navigate to="/rescue" replace />;
  if (user.role === 'coordinator') return <Navigate to="/coordinator" replace />;
  return <Navigate to="/citizen" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main Protected Portal Routes */}
      <Route
        path="/"
        element={
          <ProtectedLayout>
            <RoleBasedRootRedirect />
          </ProtectedLayout>
        }
      />
      <Route
        path="/citizen"
        element={
          <ProtectedLayout>
            <CitizenDashboard />
          </ProtectedLayout>
        }
      />
      <Route
        path="/citizen/report"
        element={
          <ProtectedLayout>
            <CitizenReportPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/citizen/shelters"
        element={
          <ProtectedLayout>
            <SheltersPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedLayout>
            <AdminDashboard />
          </ProtectedLayout>
        }
      />
      <Route
        path="/admin/incidents"
        element={
          <ProtectedLayout>
            <AdminDashboard />
          </ProtectedLayout>
        }
      />
      <Route
        path="/admin/dispatch"
        element={
          <ProtectedLayout>
            <AdminDashboard />
          </ProtectedLayout>
        }
      />
      <Route
        path="/admin/shelters"
        element={
          <ProtectedLayout>
            <SheltersPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/admin/hospitals"
        element={
          <ProtectedLayout>
            <HospitalsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/admin/alerts"
        element={
          <ProtectedLayout>
            <AlertsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedLayout>
            <AnalyticsPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/rescue"
        element={
          <ProtectedLayout>
            <RescueTeamDashboard />
          </ProtectedLayout>
        }
      />

      <Route
        path="/coordinator"
        element={
          <ProtectedLayout>
            <CoordinatorDashboard />
          </ProtectedLayout>
        }
      />

      <Route
        path="/assistant"
        element={
          <ProtectedLayout>
            <AIAssistantPage />
          </ProtectedLayout>
        }
      />

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

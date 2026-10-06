// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoginPage from './pages/LoginPage';
import CustomerMenuPage from './pages/customer/CustomerMenuPage';
import WaiterDashboard from './pages/waiter/WaiterDashboard';
import KDSDashboard from './pages/kitchen/KDSDashboard';
import ManagerDashboard from './pages/manager/ManagerDashboard';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Customer Route (Scanned via QR Code) */}
          <Route path="/menu/:tableId" element={<CustomerMenuPage />} />

          {/* Unified Staff Login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Role-Based Dashboards */}
          <Route
            path="/waiter"
            element={
              <ProtectedRoute allowedRoles={['Waiter', 'Manager', 'Admin']}>
                <WaiterDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/kitchen"
            element={
              <ProtectedRoute allowedRoles={['Kitchen', 'Manager', 'Admin']}>
                <KDSDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={['Manager', 'Admin']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import ClientRoute from '../components/ClientRoute';
import CashierRoute from '../components/CashierRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Inventory from '../pages/Inventory';
import Request from '../pages/Request';
import FrontRequest from '../pages/FrontRequest';
import Reports from '../pages/Reports';
import ClientRegistration from '../pages/ClientRegistration';
import Calibration from '../pages/Calibration';
import UncertaintyCalculation from '../pages/weighing_scaleCalculation';
import ThermometerUncertaintyCalculator from '../pages/ThermometerUncertaintyCalculator';
import ThermohygrometerUncertaintyCalculator from '../pages/ThermohygrometerUncertaintyCalculator';
import TestWeightsCalibration from '../pages/TestWeightsCalibration';
import SphygmomanometerCalibration from '../pages/SphygmomanometerCalibration';
import Transaction from '../pages/Transaction';
import AdminOrCalibrationRoute from '../components/AdminOrCalibrationRoute';
import AdminOrITProgrammerRoute from '../components/AdminOrITProgrammerRoute';
import LogsPage from '../pages/Logs';
import UserManual from '../pages/UserManual';
import EmailSettingsPage from '../pages/EmailSettingsPage';
import SignatoryManagement from '../components/SignatoryManagement';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register-client" element={<ClientRegistration />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <AdminOrCalibrationRoute>
            <Users />
          </AdminOrCalibrationRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservations"
        element={
          <ProtectedRoute>
            <Request />
          </ProtectedRoute>
        }
      />
      <Route
        path="/front-reservation"
        element={
          <ClientRoute>
            <FrontRequest />
          </ClientRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calibration"
        element={
          <AdminOrCalibrationRoute>
            <Calibration />
          </AdminOrCalibrationRoute>
        }
      />
      <Route
        path="/uncertainty-calculation"
        element={
          <AdminOrCalibrationRoute>
            <UncertaintyCalculation />
          </AdminOrCalibrationRoute>
        }
      />
      <Route
        path="/thermometer-uncertainty-calculator"
        element={
          <AdminOrCalibrationRoute>
            <ThermometerUncertaintyCalculator />
          </AdminOrCalibrationRoute>
        }
      />
      <Route
        path="/thermohygrometer-uncertainty-calculator"
        element={
          <AdminOrCalibrationRoute>
            <ThermohygrometerUncertaintyCalculator />
          </AdminOrCalibrationRoute>
        }
      />
      <Route
        path="/test-weights-calibration"
        element={
          <AdminOrCalibrationRoute>
            <TestWeightsCalibration />
          </AdminOrCalibrationRoute>
        }
      />
      <Route
        path="/sphygmomanometer-calibration"
        element={
          <AdminOrCalibrationRoute>
            <SphygmomanometerCalibration />
          </AdminOrCalibrationRoute>
        }
      />
      <Route
        path="/transaction"
        element={
          <CashierRoute>
            <Transaction />
          </CashierRoute>
        }
      />
      <Route
        path="/logs"
        element={
          <ProtectedRoute>
            <LogsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user-manual"
        element={
          <ProtectedRoute>
            <UserManual />
          </ProtectedRoute>
        }
      />
      <Route
        path="/email-settings"
        element={
          <ProtectedRoute>
            <EmailSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/signatory-management"
        element={
          <AdminOrITProgrammerRoute>
            <SignatoryManagement />
          </AdminOrITProgrammerRoute>
        }
      />
      {/*
      <Route
        path="/thermometer-calibration"
        element={
          <AdminRoute>
            <ThermometerCalibration />
          </AdminRoute>
        }
      />
      */}
      {/* Route alias for backward compatibility */}
      <Route path="/requests" element={<Navigate to="/reservations" replace />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes; 
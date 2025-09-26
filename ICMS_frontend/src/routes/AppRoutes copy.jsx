import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import ClientRoute from '../components/ClientRoute';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Inventory from '../pages/Inventory';
import Reservations from '../pages/Reservations';
import FrontReservation from '../pages/FrontReservation';
import Reports from '../pages/Reports';
import ClientRegistration from '../pages/ClientRegistration';
import Calibration from '../pages/Calibration';
import UncertaintyCalculation from '../pages/weighing_scaleCalculation';
import ThermometerUncertaintyCalculator from '../pages/ThermometerUncertaintyCalculator';
import ThermohygrometerUncertaintyCalculator from '../pages/ThermohygrometerUncertaintyCalculator';
import Transaction from '../pages/Transaction';

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
          <AdminRoute>
            <Users />
          </AdminRoute>
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
            <Reservations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/front-reservation"
        element={
          <ClientRoute>
            <FrontReservation />
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
          <AdminRoute>
            <Calibration />
          </AdminRoute>
        }
      />
      <Route
        path="/uncertainty-calculation"
        element={
          <AdminRoute>
            <UncertaintyCalculation />
          </AdminRoute>
        }
      />
      <Route
        path="/thermometer-uncertainty-calculator"
        element={
          <AdminRoute>
            <ThermometerUncertaintyCalculator />
          </AdminRoute>
        }
      />
      <Route
        path="/thermohygrometer-uncertainty-calculator"
        element={
          <AdminRoute>
            <ThermohygrometerUncertaintyCalculator />
          </AdminRoute>
        }
      />
      <Route
        path="/transaction"
        element={
          <AdminRoute>
            <Transaction />
          </AdminRoute>
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
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes; 
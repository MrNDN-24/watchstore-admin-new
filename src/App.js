import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminLoginPage from './pages/AdminLoginPage';
import Dashboard from './components/Dashboard';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/forgotPassword" element={<ForgotPasswordPage />} />
        <Route path="/login" element={<AdminLoginPage />} />
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="/change-password/:id/:token" element={<ResetPasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;

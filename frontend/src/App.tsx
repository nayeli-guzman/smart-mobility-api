import { Navigate, Route, Routes } from 'react-router-dom'

import RoutePlannerPage from './pages/RoutePlannerPage'

import LoginPage from './pages/LoginPage'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/route/ProtectedRoute'
import AdminRoute from './components/route/AdminRoute'
import SignUpPage from './pages/SignUpPage'
import ConfirmSignUpPage from './pages/ConfirmSignUpPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/confirm-signup" element={<ConfirmSignUpPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/route-planner" element={<RoutePlannerPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
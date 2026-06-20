import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ReferralDetailPage from './pages/ReferralDetailPage'
import NotFoundPage from './pages/NotFoundPage'

function ProtectedRoute({ children }) {
  const token = Cookies.get('jwt_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function PublicOnlyRoute({ children }) {
  const token = Cookies.get('jwt_token')
  if (token) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/referral/:id"
          element={
            <ProtectedRoute>
              <ReferralDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard/referrals" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import LeagueDetail from './pages/LeagueDetail';
import JoinLeague from './pages/JoinLeague';
import GpPredict from './pages/GpPredict';
import GpResults from './pages/GpResults';
import AdminLeagues from './pages/admin/AdminLeagues';
import AdminGrandsPrix from './pages/admin/AdminGrandsPrix';
import AdminGpResults from './pages/admin/AdminGpResults';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join/:inviteCode" element={<ProtectedRoute><JoinLeague /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/leagues/:id" element={<ProtectedRoute><LeagueDetail /></ProtectedRoute>} />
          <Route path="/gp/:gpId/predict" element={<ProtectedRoute><GpPredict /></ProtectedRoute>} />
          <Route path="/gp/:gpId/results" element={<ProtectedRoute><GpResults /></ProtectedRoute>} />
          <Route path="/admin/leagues" element={<AdminRoute><AdminLeagues /></AdminRoute>} />
          <Route path="/admin/grands-prix" element={<AdminRoute><AdminGrandsPrix /></AdminRoute>} />
          <Route path="/admin/gp/:gpId/results" element={<AdminRoute><AdminGpResults /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

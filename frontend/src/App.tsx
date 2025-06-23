import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import InvoicesPage from './pages/InvoicesPage';
import ProtectedRoute from './components/ProtectedRoute';
import ReportsPage from './pages/ReportsPage';
import PartnersPage from './pages/PartnersPage';
import AuditLogPage from './pages/AuditLogPage';
import TasksCalendarPage from './pages/TasksCalendarPage';
import SettingsPage from './pages/SettingsPage';
import MainLayout from './components/MainLayout';
import UserManagementPage from './pages/UserManagementPage';

function App() {
  return (
      <Routes>
        {/* Các route không dùng layout chung */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Các route được bảo vệ và sử dụng layout chung */}
        <Route 
          path="/" 
          element={<ProtectedRoute><MainLayout /></ProtectedRoute>}
        >
          {/* Dùng index route để trang mặc định khi vào "/" là dashboard */}
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="partners" element={<PartnersPage />} />
          <Route path="tasks" element={<TasksCalendarPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="audit-log" element={<AuditLogPage />} />
          <Route path="users" element={<UserManagementPage />} />
        </Route>
      </Routes>
  );
}

export default App;

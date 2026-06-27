import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminLayout } from '@/admin/layout/AdminLayout'
import { EmployeesPage } from '@/admin/pages/EmployeesPage'
import { ChantiersPage } from '@/admin/pages/ChantiersPage'
import { TimeEntriesPage } from '@/admin/pages/TimeEntriesPage'
import { ReportsPage } from '@/admin/pages/ReportsPage'
import { LoginPage } from '@/app/pages/LoginPage'
import { HomePage } from '@/app/pages/HomePage'
import { NewEntryPage } from '@/app/pages/NewEntryPage'
import { HistoryPage } from '@/app/pages/HistoryPage'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter basename="/pointage">
          <Routes>
            <Route path="/" element={<Navigate to="/app/login" replace />} />
            <Route path="/app/login" element={<LoginPage />} />
            <Route path="/app" element={<ProtectedRoute role="EMPLOYEE"><HomePage /></ProtectedRoute>} />
            <Route path="/app/new" element={<ProtectedRoute role="EMPLOYEE"><NewEntryPage /></ProtectedRoute>} />
            <Route path="/app/history" element={<ProtectedRoute role="EMPLOYEE"><HistoryPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/admin/employees" replace />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="chantiers" element={<ChantiersPage />} />
              <Route path="time-entries" element={<TimeEntriesPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

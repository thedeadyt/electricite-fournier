import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

type ReportRow = { id: number; name: string; totalHours: number }
type Report = { month: number; year: number; byEmployee: ReportRow[]; byChantier: ReportRow[] }

export function useMonthlyReport(month: number, year: number) {
  return useQuery<Report>({
    queryKey: ['reports', 'monthly', month, year],
    queryFn: () => api.get('/reports/monthly', { params: { month, year } }).then(r => r.data),
  })
}

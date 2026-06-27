import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export type TimeEntry = {
  id: number
  userId: number
  chantierId: number
  date: string
  startTime: string
  endTime: string
  user: { firstName: string; lastName: string }
  chantier: { name: string }
}

type Filters = { month?: number; year?: number; employeeId?: number; chantierId?: number }

export function useTimeEntries(filters: Filters = {}) {
  return useQuery<TimeEntry[]>({
    queryKey: ['time-entries', filters],
    queryFn: () => api.get('/time-entries', { params: filters }).then(r => r.data),
  })
}

export function useDeleteTimeEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/time-entries/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['time-entries'] }),
  })
}

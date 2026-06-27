import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export type MyEntry = {
  id: number
  date: string
  startTime: string
  endTime: string
  chantier: { name: string }
}

export function useMyTimeEntries() {
  return useQuery<MyEntry[]>({
    queryKey: ['my-time-entries'],
    queryFn: () => api.get('/time-entries').then(r => r.data),
  })
}

export function useCreateMyEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { chantierId: number; date: string; startTime: string; endTime: string }) =>
      api.post('/time-entries', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-time-entries'] }),
  })
}

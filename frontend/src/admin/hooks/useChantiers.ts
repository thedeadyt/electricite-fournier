import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export type Chantier = { id: number; name: string; address?: string; isActive: boolean }

export function useChantiers() {
  return useQuery<Chantier[]>({
    queryKey: ['chantiers'],
    queryFn: () => api.get('/chantiers').then(r => r.data),
  })
}

export function useCreateChantier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; address?: string }) =>
      api.post('/chantiers', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chantiers'] }),
  })
}

export function useArchiveChantier() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.put(`/chantiers/${id}`, { isActive: false }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['chantiers'] }),
  })
}

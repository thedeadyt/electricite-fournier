import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

export type EmployeeProfile = {
  email: string | null
  phone: string | null
  address: string | null
  hireDate: string | null
  activity: string | null
  category: string | null
  hourlyRate: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  nir: string | null
  dateOfBirth: string | null
  placeOfBirth: string | null
  nationality: string | null
  residencePermitType: string | null
  residencePermitExpiry: string | null
  lastMedicalVisit: string | null
  consentGivenAt: string | null
  informedAt: string | null
  dataRetentionUntil: string | null
}

export function useEmployeeProfile(userId: number | null) {
  return useQuery<EmployeeProfile>({
    queryKey: ['employee-profile', userId],
    queryFn: () => api.get(`/users/${userId}/profile`).then(r => r.data),
    enabled: userId !== null,
  })
}

export function useSaveEmployeeProfile(userId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<EmployeeProfile> & { consentGiven?: boolean }) =>
      api.put(`/users/${userId}/profile`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employee-profile', userId] }),
  })
}

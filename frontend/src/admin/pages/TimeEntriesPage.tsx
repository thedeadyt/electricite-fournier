import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useTimeEntries, useDeleteTimeEntry } from '../hooks/useTimeEntries'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

function hoursFromEntry(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const total = (eh * 60 + em - (sh * 60 + sm)) / 60
  return `${total}h`
}

export function TimeEntriesPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())

  const { data: entries, isLoading } = useTimeEntries({ month, year })
  const deleteEntry = useDeleteTimeEntry()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Pointages</h2>
        <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                {format(new Date(year, i, 1), 'MMMM yyyy', { locale: fr })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Chargement...</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employé</TableHead>
                <TableHead>Chantier</TableHead>
                <TableHead>Heures</TableHead>
                <TableHead>Durée</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                    Aucun pointage ce mois
                  </TableCell>
                </TableRow>
              )}
              {entries?.map(e => (
                <TableRow key={e.id}>
                  <TableCell>{format(new Date(e.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{e.user.firstName} {e.user.lastName}</TableCell>
                  <TableCell>{e.chantier.name}</TableCell>
                  <TableCell className="text-slate-500">{e.startTime} – {e.endTime}</TableCell>
                  <TableCell className="font-medium">{hoursFromEntry(e.startTime, e.endTime)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => deleteEntry.mutate(e.id)}
                    >
                      Supprimer
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

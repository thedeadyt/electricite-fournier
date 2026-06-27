import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useMonthlyReport } from '../hooks/useReports'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function ReportsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year] = useState(now.getFullYear())
  const { data, isLoading } = useMonthlyReport(month, year)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Récapitulatif mensuel</h2>
        <Select value={String(month)} onValueChange={v => setMonth(Number(v))}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                {format(new Date(year, i, 1), 'MMMM yyyy', { locale: fr })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <p className="text-slate-500">Chargement...</p> : (
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Par employé</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employé</TableHead>
                    <TableHead className="text-right">Heures</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.byEmployee.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell className="text-right font-medium">{row.totalHours}h</TableCell>
                    </TableRow>
                  ))}
                  {data?.byEmployee.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-slate-400">Aucune donnée</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Par chantier</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chantier</TableHead>
                    <TableHead className="text-right">Heures</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.byChantier.map(row => (
                    <TableRow key={row.id}>
                      <TableCell>{row.name}</TableCell>
                      <TableCell className="text-right font-medium">{row.totalHours}h</TableCell>
                    </TableRow>
                  ))}
                  {data?.byChantier.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-slate-400">Aucune donnée</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChantiers } from '@/admin/hooks/useChantiers'
import { useCreateMyEntry } from '../hooks/useMyTimeEntries'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { format } from 'date-fns'

export function NewEntryPage() {
  const navigate = useNavigate()
  const { data: chantiers } = useChantiers()
  const createEntry = useCreateMyEntry()

  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [startTime, setStartTime] = useState('08:00')
  const [endTime, setEndTime] = useState('17:00')
  const [chantierId, setChantierId] = useState<number | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!chantierId) { setError('Sélectionnez un chantier'); return }
    if (endTime <= startTime) { setError("L'heure de fin doit être après le début"); return }
    setError('')
    try {
      await createEntry.mutateAsync({ chantierId, date, startTime, endTime })
      navigate('/app')
    } catch {
      setError('Erreur lors de la saisie')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/app')}>
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="font-bold text-slate-800">Nouveau pointage</h1>
      </header>

      <div className="p-4 space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Date</label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 mb-1 block">Chantier</label>
          <Select onValueChange={v => setChantierId(Number(v))}>
            <SelectTrigger><SelectValue placeholder="Sélectionner un chantier" /></SelectTrigger>
            <SelectContent>
              {chantiers?.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Début</label>
            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Fin</label>
            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
        </div>

        <Button className="w-full h-12" onClick={handleSubmit} disabled={createEntry.isPending}>
          {createEntry.isPending ? 'Enregistrement...' : 'Valider'}
        </Button>
      </div>
    </div>
  )
}

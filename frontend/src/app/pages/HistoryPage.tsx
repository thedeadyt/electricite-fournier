import { useNavigate } from 'react-router-dom'
import { useMyTimeEntries, type MyEntry } from '../hooks/useMyTimeEntries'
import { ArrowLeft } from 'lucide-react'
import { format, startOfWeek } from 'date-fns'
import { fr } from 'date-fns/locale'

function hoursFromEntry(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em - (sh * 60 + sm)) / 60
}

function groupByWeek(entries: MyEntry[]) {
  const weeks = new Map<string, MyEntry[]>()
  for (const e of entries) {
    const d = new Date(e.date)
    const key = format(startOfWeek(d, { locale: fr }), 'yyyy-MM-dd')
    if (!weeks.has(key)) weeks.set(key, [])
    weeks.get(key)!.push(e)
  }
  return [...weeks.entries()].sort((a, b) => b[0].localeCompare(a[0]))
}

export function HistoryPage() {
  const navigate = useNavigate()
  const { data: entries, isLoading } = useMyTimeEntries()
  const weeks = groupByWeek(entries ?? [])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/app')}>
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="font-bold text-slate-800">Historique</h1>
      </header>

      <div className="p-4 space-y-6">
        {isLoading && <p className="text-slate-500">Chargement...</p>}
        {weeks.length === 0 && !isLoading && (
          <p className="text-slate-400 text-center mt-12">Aucun pointage enregistré</p>
        )}
        {weeks.map(([weekKey, weekEntries]) => {
          const weekStart = new Date(weekKey)
          const total = weekEntries.reduce((sum, e) => sum + hoursFromEntry(e.startTime, e.endTime), 0)
          return (
            <div key={weekKey}>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-semibold text-slate-600">
                  Semaine du {format(weekStart, 'd MMM', { locale: fr })}
                </h2>
                <span className="text-sm font-bold text-blue-600">{total}h</span>
              </div>
              <div className="space-y-2">
                {weekEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(e => (
                    <div key={e.id} className="bg-white rounded-lg border border-slate-200 p-3 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm text-slate-800">{e.chantier.name}</p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(e.date), 'EEEE dd MMM', { locale: fr })} · {e.startTime}–{e.endTime}
                        </p>
                      </div>
                      <span className="font-bold text-slate-700">{hoursFromEntry(e.startTime, e.endTime)}h</span>
                    </div>
                  ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

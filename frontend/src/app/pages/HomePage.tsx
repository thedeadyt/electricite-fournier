import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useMyTimeEntries } from '../hooks/useMyTimeEntries'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Plus, History, LogOut } from 'lucide-react'

function hoursFromEntry(start: string, end: string): string {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return `${(eh * 60 + em - (sh * 60 + sm)) / 60}h`
}

export function HomePage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { data: entries } = useMyTimeEntries()
  const recent = entries?.slice(0, 5) ?? []

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-slate-800">Bonjour, {user?.firstName}</h1>
          <p className="text-xs text-slate-500">Électricité Fournier</p>
        </div>
        <button onClick={async () => { await logout(); navigate('/app/login') }}>
          <LogOut size={20} className="text-slate-400" />
        </button>
      </header>

      <div className="p-4 space-y-4">
        <Button className="w-full h-16 text-lg gap-3" onClick={() => navigate('/app/new')}>
          <Plus size={24} />
          Ajouter un pointage
        </Button>

        <Button variant="outline" className="w-full h-12 gap-3" onClick={() => navigate('/app/history')}>
          <History size={20} />
          Voir l'historique
        </Button>

        {recent.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-slate-500 mb-2">Derniers pointages</h2>
            <div className="space-y-2">
              {recent.map(e => (
                <div key={e.id} className="bg-white rounded-lg border border-slate-200 p-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-slate-800 text-sm">{e.chantier.name}</p>
                    <p className="text-xs text-slate-500">{format(new Date(e.date), 'dd MMM', { locale: fr })}</p>
                  </div>
                  <span className="font-bold text-blue-600">{hoursFromEntry(e.startTime, e.endTime)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

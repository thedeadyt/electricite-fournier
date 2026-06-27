import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Step = 'identifier' | 'pin' | 'first-login'

export function LoginPage() {
  const { login, firstLogin } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('identifier')
  const [identifier, setIdentifier] = useState('')
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    setLoading(true)
    try {
      const result = await login(identifier, pin)
      if (result.firstLogin) {
        setPin('')
        setStep('first-login')
      } else if (result.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/app')
      }
    } catch {
      setError('Identifiant ou code incorrect')
    } finally {
      setLoading(false)
    }
  }

  async function handleFirstLogin() {
    if (pin !== pinConfirm) { setError('Les codes ne correspondent pas'); return }
    if (pin.length !== 4) { setError('Le code doit contenir 4 chiffres'); return }
    setError('')
    setLoading(true)
    try {
      await firstLogin(identifier, pin)
      navigate('/app')
    } catch {
      setError('Erreur lors de la création du code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Pointage</h1>
        <p className="text-slate-500 mb-6 text-sm">Électricité Fournier</p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {step === 'identifier' && (
          <>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Prénom.Nom</label>
            <Input
              placeholder="ex: Jean.Dupont"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && identifier && setStep('pin')}
              className="mb-4"
              autoFocus
            />
            <Button className="w-full" onClick={() => identifier && setStep('pin')} disabled={!identifier}>
              Continuer
            </Button>
          </>
        )}

        {step === 'pin' && (
          <>
            <p className="text-sm text-slate-600 mb-4">Bonjour <strong>{identifier}</strong></p>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Code PIN (4 chiffres)</label>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="••••"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && pin.length === 4 && handleLogin()}
              className="mb-4 text-center text-2xl tracking-widest"
              autoFocus
            />
            <Button className="w-full" onClick={handleLogin} disabled={pin.length !== 4 || loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
            <button
              className="text-sm text-slate-400 mt-3 w-full hover:text-slate-600 transition-colors"
              onClick={() => { setStep('identifier'); setPin(''); setError('') }}
            >
              Changer de nom
            </button>
          </>
        )}

        {step === 'first-login' && (
          <>
            <p className="text-sm text-slate-600 mb-4">
              Première connexion — choisissez votre code PIN à 4 chiffres
            </p>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Nouveau code (4 chiffres)"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              className="mb-3 text-center text-2xl tracking-widest"
              autoFocus
            />
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="Confirmer le code"
              value={pinConfirm}
              onChange={e => setPinConfirm(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && pin.length === 4 && pinConfirm.length === 4 && handleFirstLogin()}
              className="mb-4 text-center text-2xl tracking-widest"
            />
            <Button
              className="w-full"
              onClick={handleFirstLogin}
              disabled={pin.length !== 4 || pinConfirm.length !== 4 || loading}
            >
              {loading ? 'Enregistrement...' : 'Valider'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

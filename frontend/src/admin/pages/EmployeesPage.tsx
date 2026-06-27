import { useState } from 'react'
import { useEmployees, useCreateEmployee, useToggleEmployee } from '../hooks/useEmployees'
import { useSaveEmployeeProfile, useEmployeeProfile } from '../hooks/useEmployeeProfile'
import type { EmployeeProfile } from '../hooks/useEmployeeProfile'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

// ─── Types ───────────────────────────────────────────────────────────────────

type ProfileForm = Partial<EmployeeProfile> & { consentGiven?: boolean }

function emptyProfileForm(): ProfileForm {
  return {
    email: '', phone: '', address: '', hireDate: '', activity: '', category: '',
    hourlyRate: '', emergencyContactName: '', emergencyContactPhone: '',
    nir: '', dateOfBirth: '', placeOfBirth: '', nationality: '',
    residencePermitType: '', residencePermitExpiry: '', lastMedicalVisit: '',
    consentGiven: false,
  }
}

function profileFromData(p: EmployeeProfile): ProfileForm {
  return {
    email: p.email ?? '',
    phone: p.phone ?? '',
    address: p.address ?? '',
    hireDate: p.hireDate ? p.hireDate.slice(0, 10) : '',
    activity: p.activity ?? '',
    category: p.category ?? '',
    hourlyRate: p.hourlyRate ?? '',
    emergencyContactName: p.emergencyContactName ?? '',
    emergencyContactPhone: p.emergencyContactPhone ?? '',
    nir: p.nir ?? '',
    dateOfBirth: p.dateOfBirth ?? '',
    placeOfBirth: p.placeOfBirth ?? '',
    nationality: p.nationality ?? '',
    residencePermitType: p.residencePermitType ?? '',
    residencePermitExpiry: p.residencePermitExpiry ?? '',
    lastMedicalVisit: p.lastMedicalVisit ?? '',
    consentGiven: !!p.consentGivenAt,
  }
}

// ─── Sous-composants ─────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function Section({ title, children, encrypted }: { title: string; children: React.ReactNode; encrypted?: boolean }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</h3>
        {encrypted && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            🔒 Chiffrées en base
          </span>
        )}
      </div>
      {children}
    </section>
  )
}

// ─── Corps du formulaire (partagé création + édition) ────────────────────────

function EmployeeFormBody({
  form,
  setForm,
  employeeName,
  consentGivenAt,
  dataRetentionUntil,
}: {
  form: ProfileForm
  setForm: React.Dispatch<React.SetStateAction<ProfileForm>>
  employeeName: string
  consentGivenAt?: string | null
  dataRetentionUntil?: string | null
}) {
  function field(key: keyof ProfileForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  return (
    <div className="space-y-6">
      {/* Bandeau RGPD */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">Information RGPD — art. 13 du Règlement UE 2016/679</p>
        <p>Données utilisées exclusivement pour la gestion du contrat de travail. Les données sensibles sont <strong>chiffrées en base de données</strong>. Conservation : 5 ans après fin de contrat. Accès réservé au responsable. Droits d'accès, rectification et suppression sur demande écrite.</p>
      </div>

      {/* Identité */}
      <Section title="Identité">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date de naissance">
            <Input type="date" value={form.dateOfBirth ?? ''} onChange={field('dateOfBirth')} />
          </Field>
          <Field label="Lieu de naissance">
            <Input value={form.placeOfBirth ?? ''} onChange={field('placeOfBirth')} placeholder="Ville, pays" />
          </Field>
        </div>
      </Section>

      {/* Coordonnées */}
      <Section title="Coordonnées">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Email">
            <Input type="email" value={form.email ?? ''} onChange={field('email')} />
          </Field>
          <Field label="Téléphone">
            <Input type="tel" value={form.phone ?? ''} onChange={field('phone')} placeholder="06 xx xx xx xx" />
          </Field>
        </div>
        <div className="mt-3">
          <Field label="Adresse">
            <Textarea value={form.address ?? ''} onChange={field('address')} rows={2} placeholder="Numéro, rue, code postal, ville" />
          </Field>
        </div>
      </Section>

      {/* Contrat & RH */}
      <Section title="Contrat & RH">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Date d'entrée">
            <Input type="date" value={form.hireDate ?? ''} onChange={field('hireDate')} />
          </Field>
          <Field label="Taux horaire (€)">
            <Input type="number" step="0.01" value={form.hourlyRate ?? ''} onChange={field('hourlyRate')} placeholder="12.50" />
          </Field>
          <Field label="Activité">
            <Input value={form.activity ?? ''} onChange={field('activity')} placeholder="Électricien, Chef de chantier..." />
          </Field>
          <Field label="Catégorie">
            <Input value={form.category ?? ''} onChange={field('category')} placeholder="Ouvrier, ETAM..." />
          </Field>
        </div>
      </Section>

      {/* Données sensibles */}
      <Section title="Données sensibles" encrypted>
        <div className="grid grid-cols-2 gap-3">
          <Field label="N° de sécurité sociale">
            <Input value={form.nir ?? ''} onChange={field('nir')} placeholder="1 85 07 75 123 456 78" maxLength={21} />
          </Field>
          <Field label="Nationalité">
            <Input value={form.nationality ?? ''} onChange={field('nationality')} placeholder="Française" />
          </Field>
          <Field label="Type de titre de séjour">
            <Input value={form.residencePermitType ?? ''} onChange={field('residencePermitType')} placeholder="Carte de résident, VLS-T..." />
          </Field>
          <Field label="Validité du titre">
            <Input type="date" value={form.residencePermitExpiry ?? ''} onChange={field('residencePermitExpiry')} />
          </Field>
          <Field label="Dernière visite médicale">
            <Input type="date" value={form.lastMedicalVisit ?? ''} onChange={field('lastMedicalVisit')} />
          </Field>
        </div>
      </Section>

      {/* Contact d'urgence */}
      <Section title="Contact d'urgence">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nom et prénom">
            <Input value={form.emergencyContactName ?? ''} onChange={field('emergencyContactName')} />
          </Field>
          <Field label="Téléphone">
            <Input type="tel" value={form.emergencyContactPhone ?? ''} onChange={field('emergencyContactPhone')} placeholder="06 xx xx xx xx" />
          </Field>
        </div>
      </Section>

      {/* Consentement RGPD */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Consentement RGPD</h3>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300"
            checked={!!form.consentGiven}
            onChange={e => setForm(f => ({ ...f, consentGiven: e.target.checked }))}
          />
          <span className="text-sm text-slate-600">
            <strong>{employeeName || 'Cet employé'}</strong> a été informé(e) du traitement de ses données personnelles et a donné son accord pour la collecte des données sensibles.
          </span>
        </label>
        {consentGivenAt && (
          <p className="mt-2 text-xs text-slate-500">
            Consentement enregistré le {new Date(consentGivenAt).toLocaleDateString('fr-FR')}
          </p>
        )}
        {dataRetentionUntil && (
          <p className="mt-1 text-xs text-slate-500">
            Données conservées jusqu'au {new Date(dataRetentionUntil).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Dialog création (nom + prénom + toute la fiche) ─────────────────────────

function CreateEmployeeDialog({ onClose }: { onClose: () => void }) {
  const createEmployee = useCreateEmployee()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfileForm)
  const [saving, setSaving] = useState(false)

  async function handleCreate() {
    if (!firstName || !lastName) return
    setSaving(true)
    try {
      const created = await createEmployee.mutateAsync({ firstName, lastName })
      await api.put(`/users/${created.id}/profile`, profileForm)
    } finally {
      setSaving(false)
      onClose()
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nouvel employé</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Nom & Prénom */}
          <Section title="Identification">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Prénom *">
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jean" />
              </Field>
              <Field label="Nom *">
                <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="DUPONT" />
              </Field>
            </div>
          </Section>

          <EmployeeFormBody
            form={profileForm}
            setForm={setProfileForm}
            employeeName={firstName && lastName ? `${firstName} ${lastName}` : ''}
          />
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleCreate} disabled={!firstName || !lastName || saving}>
            {saving ? 'Création...' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Dialog édition fiche employé ────────────────────────────────────────────

function EditProfileDialog({ userId, employeeName, onClose }: { userId: number; employeeName: string; onClose: () => void }) {
  const { data: profile, isLoading } = useEmployeeProfile(userId)
  const save = useSaveEmployeeProfile(userId)
  const [form, setForm] = useState<ProfileForm | null>(null)

  if (!isLoading && !form) {
    setForm(profile ? profileFromData(profile) : emptyProfileForm())
  }

  async function handleSave() {
    if (!form) return
    await save.mutateAsync(form)
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fiche employé — {employeeName}</DialogTitle>
        </DialogHeader>

        {isLoading || !form ? (
          <div className="py-8 text-center text-slate-500">Chargement...</div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <EmployeeFormBody
              form={form}
              setForm={setForm as React.Dispatch<React.SetStateAction<ProfileForm>>}
              employeeName={employeeName}
              consentGivenAt={profile?.consentGivenAt}
              dataRetentionUntil={profile?.dataRetentionUntil}
            />
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={handleSave} disabled={save.isPending || !form}>
            {save.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page principale ─────────────────────────────────────────────────────────

export function EmployeesPage() {
  const { data: employees, isLoading } = useEmployees()
  const toggleEmployee = useToggleEmployee()

  const [createOpen, setCreateOpen] = useState(false)
  const [profileTarget, setProfileTarget] = useState<{ id: number; name: string } | null>(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Employés</h2>
        <Button onClick={() => setCreateOpen(true)}>+ Ajouter un employé</Button>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Chargement...</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Premier login</TableHead>
                <TableHead className="w-48">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees?.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.firstName} {emp.lastName}</TableCell>
                  <TableCell>
                    <Badge variant={emp.isActive ? 'default' : 'secondary'}>
                      {emp.isActive ? 'Actif' : 'Désactivé'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {emp.isFirstLogin ? <Badge variant="outline">En attente</Badge> : '—'}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setProfileTarget({ id: emp.id, name: `${emp.firstName} ${emp.lastName}` })}
                    >
                      Fiche
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleEmployee.mutate({ id: emp.id, isActive: !emp.isActive })}
                    >
                      {emp.isActive ? 'Désactiver' : 'Réactiver'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {createOpen && (
        <CreateEmployeeDialog onClose={() => setCreateOpen(false)} />
      )}

      {profileTarget && (
        <EditProfileDialog
          userId={profileTarget.id}
          employeeName={profileTarget.name}
          onClose={() => setProfileTarget(null)}
        />
      )}
    </div>
  )
}

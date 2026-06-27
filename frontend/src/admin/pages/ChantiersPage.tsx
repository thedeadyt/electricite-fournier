import { useState } from 'react'
import { useChantiers, useCreateChantier, useArchiveChantier } from '../hooks/useChantiers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export function ChantiersPage() {
  const { data: chantiers, isLoading } = useChantiers()
  const createChantier = useCreateChantier()
  const archiveChantier = useArchiveChantier()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  async function handleCreate() {
    await createChantier.mutateAsync({ name, address: address || undefined })
    setName(''); setAddress(''); setOpen(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Chantiers</h2>
        <Button onClick={() => setOpen(true)}>+ Ajouter un chantier</Button>
      </div>

      {isLoading ? (
        <p className="text-slate-500">Chargement...</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Adresse</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {chantiers?.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-slate-500">{c.address ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={c.isActive ? 'default' : 'secondary'}>
                      {c.isActive ? 'Actif' : 'Archivé'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {c.isActive && (
                      <Button variant="ghost" size="sm" onClick={() => archiveChantier.mutate(c.id)}>
                        Archiver
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau chantier</DialogTitle></DialogHeader>
          <div className="space-y-3 py-4">
            <Input placeholder="Nom du chantier" value={name} onChange={e => setName(e.target.value)} />
            <Input placeholder="Adresse (optionnel)" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={handleCreate} disabled={!name || createChantier.isPending}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

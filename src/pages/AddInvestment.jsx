import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Loader2, Bell, FileText, Palette } from 'lucide-react'

const CATEGORIES = [
  { key: 'actions', label: 'Actions', emoji: '📈' },
  { key: 'crypto', label: 'Crypto', emoji: '₿' },
  { key: 'immobilier', label: 'Immobilier', emoji: '🏠' },
  { key: 'epargne', label: 'Épargne', emoji: '💰' },
  { key: 'obligation', label: 'Obligations', emoji: '📄' },
  { key: 'autre', label: 'Autre', emoji: '📦' },
]
const COLORS = ['#00D9A5', '#F7B928', '#FF6B6B', '#8B5CF6', '#3B82F6', '#EC4899', '#10B981']
const RECURRENCE = [{ key: 'none', label: 'Aucun' }, { key: 'weekly', label: 'Hebdo' }, { key: 'monthly', label: 'Mensuel' }, { key: 'yearly', label: 'Annuel' }]

export default function AddInvestment() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [recurrence, setRecurrence] = useState('none')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) { setError('Nom requis'); return }
    if (!amount || parseInt(amount) <= 0) { setError('Montant invalide'); return }
    if (!category) { setError('Catégorie requise'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))
    setLoading(false)
    navigate(-1)
  }

  return (
    <div className="min-h-screen bg-seka-dark">
      <header className="sticky top-0 z-10 bg-seka-dark/95 backdrop-blur-xl border-b border-seka-border px-4 py-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-seka-card flex items-center justify-center"><ArrowLeft className="w-5 h-5 text-seka-text"/></button>
          <h1 className="text-xl font-bold text-seka-text">Nouvel investissement</h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-5">
        <div><label className="block text-sm font-medium text-seka-text-secondary mb-2">Nom</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: ETF World, Bitcoin..." className="input-seka"/></div>
        <div><label className="block text-sm font-medium text-seka-text-secondary mb-2">Montant (FCFA)</label><input type="number" inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" className="input-seka text-2xl font-mono text-center py-5"/></div>
        <div>
          <label className="block text-sm font-medium text-seka-text-secondary mb-2">Catégorie</label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map(c => (
              <button key={c.key} type="button" onClick={() => setCategory(c.key)} className={`p-3 rounded-xl border text-center ${category === c.key ? 'bg-seka-green/15 border-seka-green' : 'bg-seka-card border-seka-border'}`}>
                <span className="text-2xl block mb-1">{c.emoji}</span><span className="text-xs text-seka-text">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div><label className="block text-sm font-medium text-seka-text-secondary mb-2 flex items-center gap-2"><Palette className="w-4 h-4"/>Couleur</label><div className="flex gap-3">{COLORS.map(c => <button key={c} type="button" onClick={() => setColor(c)} className={`w-10 h-10 rounded-full ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-seka-dark' : ''}`} style={{ backgroundColor: c }}/>)}</div></div>
        <div><label className="block text-sm font-medium text-seka-text-secondary mb-2 flex items-center gap-2"><Bell className="w-4 h-4"/>Rappel</label><div className="flex gap-2 flex-wrap">{RECURRENCE.map(r => <button key={r.key} type="button" onClick={() => setRecurrence(r.key)} className={`px-4 py-2 rounded-lg text-sm ${recurrence === r.key ? 'bg-seka-gold/15 border border-seka-gold text-seka-gold' : 'bg-seka-card border border-seka-border text-seka-text-secondary'}`}>{r.label}</button>)}</div></div>
        <div><label className="block text-sm font-medium text-seka-text-secondary mb-2 flex items-center gap-2"><FileText className="w-4 h-4"/>Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes optionnelles..." className="input-seka min-h-[80px] resize-none"/></div>
        {error && <div className="text-seka-red text-sm text-center bg-seka-red/10 py-3 rounded-xl">{error}</div>}
        <button type="submit" disabled={loading} className="w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-seka-gradient text-seka-darker disabled:opacity-50">{loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Check className="w-5 h-5"/>Enregistrer</>}</button>
      </form>
    </div>
  )
}

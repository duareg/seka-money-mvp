import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Target, Users, TrendingUp, X, Calendar, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { useTheme } from '../App'
import { formatMoney, objectivesApi } from '../utils/api'

export default function Objectives() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const [tab, setTab] = useState('epargne')
  const [objectives, setObjectives] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [showModal, setShowModal] = useState(null) // 'new-objective' | 'versement'
  const [selectedObjective, setSelectedObjective] = useState(null)

  // Form fields
  const [objectiveName, setObjectiveName] = useState('')
  const [objectiveTarget, setObjectiveTarget] = useState('')
  const [objectiveDeadline, setObjectiveDeadline] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Charger les objectifs
  useEffect(() => {
    loadObjectives()
  }, [])

  const loadObjectives = async () => {
    setLoading(true)
    try {
      const data = await objectivesApi.getAll()
      setObjectives(data || [])
    } catch (e) {
      console.error('Erreur chargement objectifs:', e)
      setObjectives([])
    } finally {
      setLoading(false)
    }
  }

  const totalSaved = objectives.reduce((s, o) => s + (o.saved || 0), 0)

  const resetModal = () => {
    setShowModal(null)
    setSelectedObjective(null)
    setObjectiveName('')
    setObjectiveTarget('')
    setObjectiveDeadline('')
    setPaymentAmount('')
    setError('')
    setSaving(false)
  }

  // Créer un nouvel objectif
  const handleCreateObjective = async () => {
    if (!objectiveName.trim()) {
      setError('Nom requis')
      return
    }
    if (!objectiveTarget || parseInt(objectiveTarget) <= 0) {
      setError('Montant cible invalide')
      return
    }

    setSaving(true)
    setError('')

    try {
      const newObjective = await objectivesApi.create({
        name: objectiveName.trim(),
        target: parseInt(objectiveTarget),
        saved: 0,
        deadline: objectiveDeadline || null
      })
      setObjectives(prev => [newObjective, ...prev])
      resetModal()
    } catch (e) {
      console.error('Erreur création objectif:', e)
      setError('Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  // Ajouter un versement
  const handleAddToObjective = async () => {
    if (!paymentAmount || parseInt(paymentAmount) <= 0) {
      setError('Montant invalide')
      return
    }

    const amount = parseInt(paymentAmount)
    const newSaved = Math.min((selectedObjective.saved || 0) + amount, selectedObjective.target)

    setSaving(true)
    setError('')

    try {
      const updated = await objectivesApi.update(selectedObjective.id, { saved: newSaved })
      setObjectives(prev => prev.map(o => (o.id === selectedObjective.id ? updated : o)))
      resetModal()
    } catch (e) {
      console.error('Erreur update objective:', e)
      setError("Erreur lors de la mise à jour")
    } finally {
      setSaving(false)
    }
  }

  // Supprimer un objectif
  const handleDeleteObjective = async (id) => {
    if (!confirm('Supprimer cet objectif ?')) return

    try {
      await objectivesApi.delete(id)
      setObjectives(prev => prev.filter(o => o.id !== id))
    } catch (e) {
      console.error('Erreur suppression:', e)
    }
  }

  return (
    <div className={`min-h-screen pb-24 ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-seka-dark/95 border-seka-border' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}>
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-800'}`} />
          </button>
          <h1 className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>Objectifs</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}>
          {[
            { key: 'epargne', label: 'Épargne', icon: Target },
            { key: 'prets', label: 'Prêts', icon: Users },
            { key: 'invest', label: 'Invest.', icon: TrendingUp }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 ${tab === t.key ? 'bg-seka-green text-seka-darker' : isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Tab Épargne */}
        {tab === 'epargne' && (
          <>
            {/* Total */}
            <div className={`p-4 flex items-center justify-between rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
              <div>
                <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Total épargné</p>
                <p className="text-xl font-bold text-seka-green font-mono">{formatMoney(totalSaved)}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Objectifs</p>
                <p className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>{objectives.length}</p>
              </div>
            </div>

            {/* Bouton Nouvel objectif */}
            <button
              onClick={() => setShowModal('new-objective')}
              className="w-full py-3 rounded-xl bg-seka-green text-seka-darker font-semibold flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nouvel objectif
            </button>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-seka-green animate-spin" />
              </div>
            )}

            {/* Liste des objectifs */}
            {!loading && objectives.length === 0 && (
              <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
                <Target className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Aucun objectif pour l'instant</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`}>Créez votre premier objectif d'épargne</p>
              </div>
            )}

            {!loading && objectives.map(obj => {
              const saved = obj.saved || 0
              const pct = obj.target > 0 ? (saved / obj.target) * 100 : 0
              return (
                <div key={obj.id} className={`p-4 rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>{obj.name}</h3>
                      {obj.deadline && (
                        <p className={`text-xs flex items-center gap-1 mt-1 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                          <Calendar className="w-3 h-3" />
                          Échéance: {new Date(obj.deadline).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                    <button onClick={() => handleDeleteObjective(obj.id)} className="text-seka-red">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-seka-green font-mono">{formatMoney(saved)}</span>
                      <span className={isDark ? 'text-seka-text-muted' : 'text-gray-500'}>{formatMoney(obj.target)}</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-seka-darker' : 'bg-gray-200'}`}>
                      <div className="h-full rounded-full bg-seka-green transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <p className={`text-xs mt-1 text-right ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>{Math.round(pct)}%</p>
                  </div>

                  {pct < 100 && (
                    <button
                      onClick={() => { setSelectedObjective(obj); setShowModal('versement') }}
                      className="w-full py-2 rounded-lg bg-seka-green/20 text-seka-green text-sm font-medium"
                    >
                      + Ajouter un versement
                    </button>
                  )}

                  {pct >= 100 && (
                    <div className="text-center py-2 text-seka-green text-sm font-medium">
                      🎉 Objectif atteint !
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {/* Tab Prêts */}
        {tab === 'prets' && (
          <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
            <Users className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
            <p className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Fonctionnalité prêts à venir</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`}>Gérez vos prêts et emprunts</p>
          </div>
        )}

        {/* Tab Investissements */}
        {tab === 'invest' && (
          <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
            <TrendingUp className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
            <p className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Fonctionnalité investissements à venir</p>
            <p className={`text-xs mt-1 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`}>Suivez vos investissements</p>
          </div>
        )}
      </div>

      {/* Modal Nouvel objectif */}
      {showModal === 'new-objective' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={resetModal}>
          <div className={`rounded-2xl p-6 w-full max-w-sm ${isDark ? 'bg-seka-card' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>Nouvel objectif</h3>

            <div className="space-y-4">
              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Nom de l'objectif *</label>
                <input
                  type="text"
                  value={objectiveName}
                  onChange={e => setObjectiveName(e.target.value)}
                  placeholder="Ex: iPhone, Voyage, Voiture..."
                  className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-seka-darker border-seka-border text-seka-text placeholder:text-seka-text-muted' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                />
              </div>

              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Montant cible (FCFA) *</label>
                <input
                  type="number"
                  value={objectiveTarget}
                  onChange={e => setObjectiveTarget(e.target.value)}
                  placeholder="500000"
                  className={`w-full px-4 py-3 rounded-xl border text-lg font-mono ${isDark ? 'bg-seka-darker border-seka-border text-seka-text' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </div>

              <div>
                <label className={`block text-xs mb-1 flex items-center gap-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                  <Calendar className="w-3 h-3" /> Échéance (optionnel)
                </label>
                <input
                  type="date"
                  value={objectiveDeadline}
                  onChange={e => setObjectiveDeadline(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-seka-darker border-seka-border text-seka-text' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-seka-red text-xs bg-seka-red/10 p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={resetModal} className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-seka-darker text-seka-text-secondary' : 'bg-gray-100 text-gray-600'}`}>
                Annuler
              </button>
              <button onClick={handleCreateObjective} disabled={saving} className="flex-1 py-3 rounded-xl bg-seka-green text-seka-darker font-semibold flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Versement */}
      {showModal === 'versement' && selectedObjective && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={resetModal}>
          <div className={`rounded-2xl p-6 w-full max-w-sm ${isDark ? 'bg-seka-card' : 'bg-white'}`} onClick={e => e.stopPropagation()}>
            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>Ajouter un versement</h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>{selectedObjective.name}</p>

            <div>
              <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Montant (FCFA)</label>
              <input
                type="number"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                placeholder="10000"
                className={`w-full px-4 py-3 rounded-xl border text-xl font-mono text-center ${isDark ? 'bg-seka-darker border-seka-border text-seka-text' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-seka-red text-xs bg-seka-red/10 p-2 rounded-lg mt-4">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={resetModal} className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-seka-darker text-seka-text-secondary' : 'bg-gray-100 text-gray-600'}`}>
                Annuler
              </button>
              <button onClick={handleAddToObjective} disabled={saving} className="flex-1 py-3 rounded-xl bg-seka-green text-seka-darker font-semibold flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Target, Users, TrendingUp, X, Calendar, AlertCircle, Loader2 } from 'lucide-react'
import { useTheme } from '../App'
import { formatMoney, objectivesApi } from '../utils/api'

// Formater le montant avec des points comme séparateurs de milliers
const formatDisplayAmount = (value) => {
  if (!value) return ''
  const num = parseInt(value.toString().replace(/\D/g, '')) || 0
  if (num === 0) return ''
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

// Parser le montant affiché vers un nombre
const parseDisplayAmount = (displayValue) => {
  return parseInt(displayValue.replace(/\./g, '')) || 0
}

export default function Objectives() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const [tab, setTab] = useState('epargne')
  const [objectives, setObjectives] = useState([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(null)
  const [selectedObjective, setSelectedObjective] = useState(null)

  const [objectiveName, setObjectiveName] = useState('')
  const [displayTarget, setDisplayTarget] = useState('')
  const [objectiveDeadline, setObjectiveDeadline] = useState('')
  const [displayPayment, setDisplayPayment] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

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

  const totalSaved = objectives.reduce((s, o) => s + (o.saved || o.current_amount || 0), 0)

  const resetModal = () => {
    setShowModal(null)
    setSelectedObjective(null)
    setObjectiveName('')
    setDisplayTarget('')
    setObjectiveDeadline('')
    setDisplayPayment('')
    setError('')
    setSaving(false)
  }

  const handleCreateObjective = async () => {
    if (!objectiveName.trim()) {
      setError('Nom requis')
      return
    }

    const targetAmount = parseDisplayAmount(displayTarget)
    if (!targetAmount || targetAmount <= 0) {
      setError('Montant cible invalide')
      return
    }

    setSaving(true)
    setError('')

    try {
      const newObjective = await objectivesApi.create({
        name: objectiveName.trim(),
        target_amount: targetAmount,
        current_amount: 0,
        deadline: objectiveDeadline || null
      })
      setObjectives(prev => [newObjective, ...prev])
      resetModal()
    } catch (e) {
      console.error('Erreur création objectif:', e)
      setError('Erreur: ' + (e.message || 'Vérifiez la table objectives dans Supabase'))
    } finally {
      setSaving(false)
    }
  }

  const handleAddToObjective = async () => {
    const amount = parseDisplayAmount(displayPayment)
    if (!amount || amount <= 0) {
      setError('Montant invalide')
      return
    }

    const currentSaved = selectedObjective.saved || selectedObjective.current_amount || 0
    const targetAmount = selectedObjective.target || selectedObjective.target_amount || 0
    const newSaved = Math.min(currentSaved + amount, targetAmount)

    setSaving(true)
    setError('')

    try {
      const updateData = selectedObjective.current_amount !== undefined
        ? { current_amount: newSaved }
        : { saved: newSaved }

      const updated = await objectivesApi.update(selectedObjective.id, updateData)
      setObjectives(prev => prev.map(o => (o.id === selectedObjective.id ? updated : o)))
      resetModal()
    } catch (e) {
      console.error('Erreur update objective:', e)
      setError("Erreur lors de la mise à jour")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteObjective = async (id) => {
    if (!confirm('Supprimer cet objectif ?')) return

    try {
      await objectivesApi.delete(id)
      setObjectives(prev => prev.filter(o => o.id !== id))
    } catch (e) {
      console.error('Erreur suppression:', e)
    }
  }

  const getSaved = (obj) => obj.saved ?? obj.current_amount ?? 0
  const getTarget = (obj) => obj.target ?? obj.target_amount ?? 0

  return (
    <div className={`min-h-screen pb-24 ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
      <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-seka-dark/95 border-seka-border' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}>
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-800'}`} />
          </button>
          <h1 className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>Objectifs</h1>
        </div>
      </header>

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
        {tab === 'epargne' && (
          <>
            <div className={`p-4 flex items-center justify-between rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
              <div>
                <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Total épargné</p>
                <p className="text-xl font-bold text-seka-green">{formatMoney(totalSaved)}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Objectifs</p>
                <p className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>{objectives.length}</p>
              </div>
            </div>

            <button onClick={() => setShowModal('new-objective')} className="w-full py-3 rounded-xl bg-seka-green text-seka-darker font-semibold flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" /> Nouvel objectif
            </button>

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-seka-green animate-spin" />
              </div>
            )}

            {!loading && objectives.length === 0 && (
              <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
                <Target className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Aucun objectif pour l'instant</p>
              </div>
            )}

            {!loading && objectives.map(obj => {
              const saved = getSaved(obj)
              const target = getTarget(obj)
              const pct = target > 0 ? (saved / target) * 100 : 0
              return (
                <div key={obj.id} className={`p-4 rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>{obj.name}</h3>
                      {obj.deadline && (
                        <p className={`text-xs flex items-center gap-1 mt-1 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                          <Calendar className="w-3 h-3" />
                          {new Date(obj.deadline).toLocaleDateString('fr-FR')}
                        </p>
                      )}
                    </div>
                    <button onClick={() => handleDeleteObjective(obj.id)} className="text-seka-red p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-seka-green">{formatMoney(saved)}</span>
                      <span className={isDark ? 'text-seka-text-muted' : 'text-gray-500'}>{formatMoney(target)}</span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-seka-darker' : 'bg-gray-200'}`}>
                      <div className="h-full rounded-full bg-seka-green transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <p className={`text-xs mt-1 text-right ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>{Math.round(pct)}%</p>
                  </div>

                  {pct < 100 ? (
                    <button onClick={() => { setSelectedObjective(obj); setShowModal('versement') }} className="w-full py-2 rounded-lg bg-seka-green/20 text-seka-green text-sm font-medium">
                      + Ajouter un versement
                    </button>
                  ) : (
                    <div className="text-center py-2 text-seka-green text-sm font-medium">🎉 Objectif atteint !</div>
                  )}
                </div>
              )
            })}
          </>
        )}

        {tab === 'prets' && (
          <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
            <Users className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
            <p className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Fonctionnalité prêts à venir</p>
          </div>
        )}

        {tab === 'invest' && (
          <div className={`p-6 rounded-xl text-center ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white shadow-sm border border-gray-100'}`}>
            <TrendingUp className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
            <p className={`text-sm ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Fonctionnalité investissements à venir</p>
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
                  placeholder="Ex: iPhone, Voyage..."
                  className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'bg-seka-darker border-seka-border text-seka-text placeholder:text-seka-text-muted' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                />
              </div>

              <div>
                <label className={`block text-xs mb-1 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>Montant cible (FCFA) *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayTarget}
                  onChange={e => setDisplayTarget(formatDisplayAmount(e.target.value))}
                  placeholder="500.000"
                  className={`w-full px-4 py-3 rounded-xl border text-lg font-bold text-center ${isDark ? 'bg-seka-darker border-seka-border text-seka-text' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                />
                {displayTarget && (
                  <p className={`text-center mt-1 text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                    {parseDisplayAmount(displayTarget).toLocaleString('fr-FR')} FCFA
                  </p>
                )}
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
                <div className="flex items-center gap-2 text-seka-red text-xs bg-seka-red/10 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> <span>{error}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={resetModal} className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-seka-darker text-seka-text-secondary' : 'bg-gray-100 text-gray-600'}`}>Annuler</button>
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
                type="text"
                inputMode="numeric"
                value={displayPayment}
                onChange={e => setDisplayPayment(formatDisplayAmount(e.target.value))}
                placeholder="10.000"
                className={`w-full px-4 py-3 rounded-xl border text-xl font-bold text-center ${isDark ? 'bg-seka-darker border-seka-border text-seka-text' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-seka-red text-xs bg-seka-red/10 p-2 rounded-lg mt-4">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={resetModal} className={`flex-1 py-3 rounded-xl font-medium ${isDark ? 'bg-seka-darker text-seka-text-secondary' : 'bg-gray-100 text-gray-600'}`}>Annuler</button>
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

import { supabase } from '../lib/supabase'

// ========== HELPERS ==========
// Formater un montant avec séparateurs de milliers
export const formatMoney = (amount) => {
  const num = Number(amount) || 0
  // Utiliser des espaces comme séparateurs de milliers (style français)
  return num.toLocaleString('fr-FR').replace(/\s/g, ' ') + ' F'
}

// Formater un montant pour l'affichage dans l'input (avec points comme séparateurs)
export const formatInputMoney = (value) => {
  const num = parseInt(value.replace(/\D/g, '')) || 0
  if (num === 0) return ''
  return num.toLocaleString('fr-FR').replace(/\s/g, '.')
}

// Parser un montant formaté vers un nombre
export const parseInputMoney = (formattedValue) => {
  return parseInt(formattedValue.replace(/\D/g, '')) || 0
}

export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ========== CATÉGORIES AFRICAINES ==========
export const EXPENSE_CATEGORIES = {
  alimentation: { label: 'Alimentation', emoji: '🍽️' },
  transport: { label: 'Transport', emoji: '🚗' },
  zemidjan: { label: 'Zémidjan', emoji: '🏍️' },
  logement: { label: 'Logement', emoji: '🏠' },
  sante: { label: 'Santé', emoji: '💊' },
  education: { label: 'Éducation', emoji: '📚' },
  loisirs: { label: 'Loisirs', emoji: '🎮' },
  vie_nocturne: { label: 'Vie nocturne', emoji: '🌙' },
  shopping: { label: 'Shopping', emoji: '🛍️' },
  telecom: { label: 'Télécom', emoji: '📱' },
  credit_internet: { label: 'Crédit internet', emoji: '📶' },
  forfait_mobile: { label: 'Forfait mobile', emoji: '📞' },
  restaurant: { label: 'Restaurant', emoji: '🍔' },
  factures: { label: 'Factures', emoji: '📄' },
  tontine: { label: 'Tontine', emoji: '🤝' },
  famille: { label: 'Famille', emoji: '👨‍👩‍👧‍👦' },
  autre: { label: 'Autre', emoji: '📦' }
}

export const INCOME_CATEGORIES = {
  salaire: { label: 'Salaire', emoji: '💰' },
  freelance: { label: 'Freelance', emoji: '💻' },
  investissement: { label: 'Investissement', emoji: '📈' },
  tontine: { label: 'Tontine', emoji: '🤝' },
  cadeau: { label: 'Cadeau', emoji: '🎁' },
  remboursement: { label: 'Remboursement', emoji: '🔄' },
  commerce: { label: 'Commerce', emoji: '🏪' },
  autre: { label: 'Autre', emoji: '📦' }
}

// ========== HELPER : Récupérer user_id ==========
const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

// ========== TRANSACTIONS ==========
export const transactionsApi = {
  async getAll() {
    const userId = await getUserId()

    let query = supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur getAll transactions:', error.message)
      return []
    }
    return data || []
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erreur getById transaction:', error.message)
      return null
    }
    return data
  },

  async create(transaction) {
    const userId = await getUserId()

    const insertData = {
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      description: transaction.description || '',
      payment_method: transaction.payment_method || 'cash',
      date: transaction.date
    }

    if (userId) {
      insertData.user_id = userId
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Erreur create transaction:', error.message)
      throw error
    }
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur delete transaction:', error.message)
      throw error
    }
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur update transaction:', error.message)
      throw error
    }
    return data
  }
}

// ========== OBJECTIVES ==========
export const objectivesApi = {
  async getAll() {
    const userId = await getUserId()

    let query = supabase
      .from('objectives')
      .select('*')
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur getAll objectives:', error.message)
      return []
    }
    return data || []
  },

  async create(objective) {
    const userId = await getUserId()

    const insertData = {
      name: objective.name,
      target_amount: objective.target_amount || objective.target,
      current_amount: objective.current_amount || objective.saved || 0,
      deadline: objective.deadline || null
    }

    if (userId) {
      insertData.user_id = userId
    }

    const { data, error } = await supabase
      .from('objectives')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Erreur create objective:', error.message)
      throw error
    }
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('objectives')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erreur update objective:', error.message)
      throw error
    }
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('objectives')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erreur delete objective:', error.message)
      throw error
    }
  }
}

// ========== DONNÉES DÉMO ==========
export const DEMO_TRANSACTIONS = []
export const DEMO_OBJECTIVES = []
export const DEMO_LOANS = []
export const DEMO_INVESTMENTS = []

// ========== API LEGACY ==========
const api = {
  get: async (url) => {
    if (url.includes('/transactions')) {
      const items = await transactionsApi.getAll()
      return { data: { items } }
    }
    if (url.includes('/objectives')) {
      const items = await objectivesApi.getAll()
      return { data: { items } }
    }
    return { data: { items: [] } }
  },

  post: async (url, data) => {
    if (url.includes('/transactions')) {
      const result = await transactionsApi.create(data)
      return { data: result }
    }
    if (url.includes('/objectives')) {
      const result = await objectivesApi.create(data)
      return { data: result }
    }
    return { data: null }
  },

  delete: async (url) => {
    const id = url.split('/').pop()
    if (url.includes('/transactions')) {
      await transactionsApi.delete(id)
    }
    if (url.includes('/objectives')) {
      await objectivesApi.delete(id)
    }
    return { data: null }
  }
}

export default api

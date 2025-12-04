import { supabase } from '../lib/supabase'

// ========== HELPERS ==========
export const formatMoney = (amount) => {
  const num = Number(amount) || 0
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    maximumFractionDigits: 0
  }).format(num) + ' F'
}

export const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

// ========== CATÉGORIES ==========
export const EXPENSE_CATEGORIES = {
  alimentation: { label: 'Alimentation', emoji: '🍽️' },
  transport: { label: 'Transport', emoji: '🚗' },
  logement: { label: 'Logement', emoji: '🏠' },
  sante: { label: 'Santé', emoji: '💊' },
  education: { label: 'Éducation', emoji: '📚' },
  loisirs: { label: 'Loisirs', emoji: '🎮' },
  shopping: { label: 'Shopping', emoji: '🛍️' },
  telecom: { label: 'Télécom', emoji: '📱' },
  restaurant: { label: 'Restaurant', emoji: '🍔' },
  factures: { label: 'Factures', emoji: '📄' },
  autre: { label: 'Autre', emoji: '📦' }
}

export const INCOME_CATEGORIES = {
  salaire: { label: 'Salaire', emoji: '💰' },
  freelance: { label: 'Freelance', emoji: '💻' },
  investissement: { label: 'Investissement', emoji: '📈' },
  cadeau: { label: 'Cadeau', emoji: '🎁' },
  remboursement: { label: 'Remboursement', emoji: '🔄' },
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

    // Si user connecté, filtrer par user_id
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Erreur getAll transactions:', error.message)
      // Si erreur RLS, retourner tableau vide
      return []
    }
    return data || []
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

    // Ajouter user_id si connecté
    if (userId) {
      insertData.user_id = userId
    }

    console.log('Création transaction:', insertData) // Debug

    const { data, error } = await supabase
      .from('transactions')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Erreur create transaction:', error.message, error.details, error.hint)
      throw error
    }

    console.log('Transaction créée:', data) // Debug
    return data
  },

  async delete(id) {
    console.log('Suppression transaction:', id) // Debug

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
      target: objective.target,
      saved: objective.saved || 0,
      deadline: objective.deadline
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

// ========== DONNÉES DÉMO (fallback si base vide) ==========
const generateDate = (daysAgo) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

export const DEMO_TRANSACTIONS = [
  { id: 'demo-1', type: 'expense', category: 'alimentation', amount: 25000, description: 'Marché Dantokpa', date: generateDate(1), payment_method: 'cash' },
  { id: 'demo-2', type: 'expense', category: 'transport', amount: 15000, description: 'Essence moto', date: generateDate(2), payment_method: 'cash' },
  { id: 'demo-3', type: 'income', category: 'salaire', amount: 450000, description: 'Salaire Décembre', date: generateDate(5), payment_method: 'bank' },
]

export const DEMO_OBJECTIVES = []
export const DEMO_LOANS = []
export const DEMO_INVESTMENTS = []

// ========== API LEGACY (compatibilité) ==========
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
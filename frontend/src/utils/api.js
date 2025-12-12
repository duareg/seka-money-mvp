import { supabase } from '../lib/supabase'

// ========== HELPERS ==========
export const formatMoney = (amount) => {
  const num = Number(amount) || 0
  return num.toLocaleString('fr-FR').replace(/\s/g, ' ') + ' F'
}

export const formatInputMoney = (value) => {
  const num = parseInt(value.replace(/\D/g, '')) || 0
  if (num === 0) return ''
  return num.toLocaleString('fr-FR').replace(/\s/g, '.')
}

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

// ========== TRANSACTIONS API ==========
export const transactionsApi = {
  async getAll() {
    const userId = await getUserId()
    let query = supabase.from('transactions').select('*').order('date', { ascending: false })
    if (userId) query = query.eq('user_id', userId)
    const { data, error } = await query
    if (error) { console.error('Erreur getAll transactions:', error.message); return [] }
    return data || []
  },

  async getById(id) {
    const { data, error } = await supabase.from('transactions').select('*').eq('id', id).single()
    if (error) { console.error('Erreur getById transaction:', error.message); return null }
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
    if (userId) insertData.user_id = userId
    const { data, error } = await supabase.from('transactions').insert(insertData).select().single()
    if (error) { console.error('Erreur create transaction:', error.message); throw error }
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase.from('transactions').update(updates).eq('id', id).select().single()
    if (error) { console.error('Erreur update transaction:', error.message); throw error }
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) { console.error('Erreur delete transaction:', error.message); throw error }
  }
}

// ========== OBJECTIVES API ==========
export const objectivesApi = {
  async getAll() {
    const userId = await getUserId()
    let query = supabase.from('objectives').select('*').order('created_at', { ascending: false })
    if (userId) query = query.eq('user_id', userId)
    const { data, error } = await query
    if (error) { console.error('Erreur getAll objectives:', error.message); return [] }
    return data || []
  },

  async create(objective) {
    const userId = await getUserId()
    const insertData = {
      name: objective.name,
      target_amount: objective.target_amount || objective.target,
      current_amount: objective.current_amount || objective.saved || 0,
      deadline: objective.deadline || null,
      icon: objective.icon || 'other',
      color: objective.color || 'green'
    }
    if (userId) insertData.user_id = userId
    const { data, error } = await supabase.from('objectives').insert(insertData).select().single()
    if (error) { console.error('Erreur create objective:', error.message); throw error }
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase.from('objectives').update(updates).eq('id', id).select().single()
    if (error) { console.error('Erreur update objective:', error.message); throw error }
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('objectives').delete().eq('id', id)
    if (error) { console.error('Erreur delete objective:', error.message); throw error }
  }
}

// ========== DEPOSITS API (Versements objectifs) ==========
export const depositsApi = {
  async getByObjective(objectiveId) {
    const { data, error } = await supabase
      .from('objective_deposits')
      .select('*')
      .eq('objective_id', objectiveId)
      .order('date', { ascending: false })
    if (error) { console.error('Erreur get deposits:', error.message); return [] }
    return data || []
  },

  async create(deposit) {
    const userId = await getUserId()
    const insertData = {
      objective_id: deposit.objective_id,
      amount: deposit.amount,
      date: deposit.date,
      note: deposit.note || null
    }
    if (userId) insertData.user_id = userId
    const { data, error } = await supabase.from('objective_deposits').insert(insertData).select().single()
    if (error) { console.error('Erreur create deposit:', error.message); throw error }
    return data
  }
}

// ========== LOANS API (Prêts) ==========
export const loansApi = {
  async getAll() {
    const userId = await getUserId()
    let query = supabase.from('loans').select('*').order('created_at', { ascending: false })
    if (userId) query = query.eq('user_id', userId)
    const { data, error } = await query
    if (error) { console.error('Erreur getAll loans:', error.message); return [] }
    return data || []
  },

  async create(loan) {
    const userId = await getUserId()
    const insertData = {
      type: loan.type,
      contact_name: loan.contact_name,
      contact_phone: loan.contact_phone || null,
      amount: loan.amount,
      amount_remaining: loan.amount,
      date: loan.date,
      due_date: loan.due_date || null,
      note: loan.note || null,
      status: 'pending'
    }
    if (userId) insertData.user_id = userId
    const { data, error } = await supabase.from('loans').insert(insertData).select().single()
    if (error) { console.error('Erreur create loan:', error.message); throw error }
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase.from('loans').update(updates).eq('id', id).select().single()
    if (error) { console.error('Erreur update loan:', error.message); throw error }
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('loans').delete().eq('id', id)
    if (error) { console.error('Erreur delete loan:', error.message); throw error }
  },

  async addPayment(loanId, payment) {
    const { data, error } = await supabase
      .from('loan_payments')
      .insert({
        loan_id: loanId,
        amount: payment.amount,
        date: payment.date,
        note: payment.note || null
      })
      .select()
      .single()
    if (error) { console.error('Erreur add loan payment:', error.message); throw error }
    return data
  },

  async getPayments(loanId) {
    const { data, error } = await supabase
      .from('loan_payments')
      .select('*')
      .eq('loan_id', loanId)
      .order('date', { ascending: false })
    if (error) { console.error('Erreur get loan payments:', error.message); return [] }
    return data || []
  }
}

// ========== INVESTMENTS API ==========
export const investmentsApi = {
  async getAll() {
    const userId = await getUserId()
    let query = supabase.from('investments').select('*').order('created_at', { ascending: false })
    if (userId) query = query.eq('user_id', userId)
    const { data, error } = await query
    if (error) { console.error('Erreur getAll investments:', error.message); return [] }
    return data || []
  },

  async create(investment) {
    const userId = await getUserId()
    const insertData = {
      name: investment.name,
      type: investment.type,
      amount: investment.amount,
      date: investment.date,
      note: investment.note || null
    }
    if (userId) insertData.user_id = userId
    const { data, error } = await supabase.from('investments').insert(insertData).select().single()
    if (error) { console.error('Erreur create investment:', error.message); throw error }
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('investments').delete().eq('id', id)
    if (error) { console.error('Erreur delete investment:', error.message); throw error }
  }
}

// ========== API LEGACY (pour Dashboard) ==========
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
    if (url.includes('/transactions')) await transactionsApi.delete(id)
    if (url.includes('/objectives')) await objectivesApi.delete(id)
    return { data: null }
  }
}

export default api

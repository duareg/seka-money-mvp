import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// ============================================
// HOOK: useNotifications
// Gère les notifications de l'utilisateur
// ============================================

export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Charger les notifications
  const loadNotifications = useCallback(async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setNotifications(data || [])
      setUnreadCount(data?.filter(n => !n.is_read).length || 0)
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Marquer comme lu
  const markAsRead = async (notificationId) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Erreur markAsRead:', error)
    }
  }

  // Marquer tout comme lu
  const markAllAsRead = async () => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Erreur markAllAsRead:', error)
    }
  }

  // Supprimer une notification
  const deleteNotification = async (notificationId) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      const notif = notifications.find(n => n.id === notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      if (notif && !notif.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Erreur deleteNotification:', error)
    }
  }

  // Écouter les nouvelles notifications en temps réel
  useEffect(() => {
    if (!userId) return

    loadNotifications()

    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev])
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId, loadNotifications])

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: loadNotifications
  }
}

// ============================================
// HOOK: useNotificationPreferences
// Gère les préférences de notification
// ============================================

export function useNotificationPreferences(userId) {
  const [preferences, setPreferences] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadPreferences = useCallback(async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      setPreferences(data || {
        budget_alerts: true,
        recurring_reminders: true,
        goal_progress: true,
        weekly_summary: true,
        daily_reminder: false
      })
    } catch (error) {
      console.error('Erreur chargement préférences:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const updatePreferences = async (updates) => {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          ...updates,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setPreferences(prev => ({ ...prev, ...updates }))
      return true
    } catch (error) {
      console.error('Erreur updatePreferences:', error)
      return false
    }
  }

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  return {
    preferences,
    loading,
    updatePreferences,
    refresh: loadPreferences
  }
}

// ============================================
// HOOK: useRecurringTransactions
// Gère les transactions récurrentes
// ============================================

export function useRecurringTransactions(userId) {
  const [recurring, setRecurring] = useState([])
  const [loading, setLoading] = useState(true)

  const loadRecurring = useCallback(async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('next_date', { ascending: true })

      if (error) throw error

      setRecurring(data || [])
    } catch (error) {
      console.error('Erreur chargement récurrentes:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const createRecurring = async (data) => {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .insert({
          user_id: userId,
          ...data,
          next_date: data.next_date || new Date().toISOString().split('T')[0]
        })

      if (error) throw error

      await loadRecurring()
      return true
    } catch (error) {
      console.error('Erreur createRecurring:', error)
      return false
    }
  }

  const updateRecurring = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      setRecurring(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r))
      return true
    } catch (error) {
      console.error('Erreur updateRecurring:', error)
      return false
    }
  }

  const toggleRecurring = async (id, isActive) => {
    return updateRecurring(id, { is_active: isActive })
  }

  const deleteRecurring = async (id) => {
    try {
      const { error } = await supabase
        .from('recurring_transactions')
        .delete()
        .eq('id', id)

      if (error) throw error

      setRecurring(prev => prev.filter(r => r.id !== id))
      return true
    } catch (error) {
      console.error('Erreur deleteRecurring:', error)
      return false
    }
  }

  useEffect(() => {
    loadRecurring()
  }, [loadRecurring])

  return {
    recurring,
    loading,
    createRecurring,
    updateRecurring,
    toggleRecurring,
    deleteRecurring,
    refresh: loadRecurring
  }
}

export default useNotifications

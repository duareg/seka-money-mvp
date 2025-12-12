import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { type } = await req.json()
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Récupérer tous les utilisateurs avec leurs préférences
    const { data: users } = await supabase
      .from('profiles')
      .select('id')

    let sent = 0

    for (const user of users || []) {
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      // Vérifier les préférences
      if (type === 'daily_reminder' && !prefs?.daily_reminder) continue
      if (type === 'budget_alert' && !prefs?.budget_alerts) continue
      if (type === 'weekly_summary' && !prefs?.weekly_summary) continue
      if (type === 'goal_progress' && !prefs?.goal_progress) continue

      let title = ''
      let body = ''

      if (type === 'daily_reminder') {
        const { count } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('date', today.toISOString().split('T')[0])

        if (count === 0) {
          title = '📝 Rappel'
          body = "N'oublie pas de noter tes dépenses aujourd'hui !"
        } else continue

      } else if (type === 'budget_alert') {
        const { data: expenses } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('type', 'expense')
          .gte('date', startOfMonth.toISOString())

        const totalExpenses = expenses?.reduce((s, t) => s + Number(t.amount), 0) || 0
        const dayOfMonth = today.getDate()
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
        const progressPercent = (dayOfMonth / daysInMonth) * 100

        const { data: lastMonthExp } = await supabase
          .from('transactions')
          .select('amount')
          .eq('user_id', user.id)
          .eq('type', 'expense')
          .gte('date', new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString())
          .lt('date', startOfMonth.toISOString())

        const lastTotal = lastMonthExp?.reduce((s, t) => s + Number(t.amount), 0) || 0
        
        if (lastTotal > 0) {
          const spentPercent = (totalExpenses / lastTotal) * 100
          if (spentPercent > progressPercent + 20) {
            title = '⚠️ Alerte Budget'
            body = `Tu as déjà dépensé ${Math.round(spentPercent)}% du mois dernier alors qu'on est qu'à ${Math.round(progressPercent)}% du mois.`
          } else continue
        } else continue

      } else if (type === 'weekly_summary') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        
        const { data: weekTrans } = await supabase
          .from('transactions')
          .select('type, amount')
          .eq('user_id', user.id)
          .gte('date', weekAgo.toISOString())

        const income = weekTrans?.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0) || 0
        const expenses = weekTrans?.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0) || 0

        title = '📊 Résumé de la semaine'
        body = `Revenus: ${income.toLocaleString()} F | Dépenses: ${expenses.toLocaleString()} F | Solde: ${(income - expenses).toLocaleString()} F`

      } else if (type === 'goal_progress') {
        const { data: objectives } = await supabase
          .from('objectives')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')

        for (const obj of objectives || []) {
          const progress = (obj.current_amount / obj.target_amount) * 100
          
          if (progress >= 100) {
            title = '🎉 Objectif atteint !'
            body = `Félicitations ! Tu as atteint ton objectif "${obj.name}" !`
            
            await supabase
              .from('objectives')
              .update({ status: 'completed' })
              .eq('id', obj.id)
          } else if (progress >= 80) {
            title = '🔥 Presque là !'
            body = `Tu es à ${Math.round(progress)}% de ton objectif "${obj.name}" !`
          } else continue

          await supabase
            .from('notifications')
            .insert({ user_id: user.id, title, body, type: 'goal_progress', data: { objective_id: obj.id } })
          sent++
        }
        continue
      }

      if (title && body) {
        await supabase
          .from('notifications')
          .insert({ user_id: user.id, title, body, type, data: {} })
        sent++
      }
    }

    return new Response(
      JSON.stringify({ success: true, type, sent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

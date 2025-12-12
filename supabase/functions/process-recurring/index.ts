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

    const today = new Date().toISOString().split('T')[0]

    // Récupérer les transactions récurrentes dues
    const { data: recurring, error: fetchError } = await supabase
      .from('recurring_transactions')
      .select('*')
      .eq('is_active', true)
      .lte('next_date', today)

    if (fetchError) throw fetchError

    let processed = 0
    let created = 0

    for (const rec of recurring || []) {
      // Créer la transaction
      const { error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: rec.user_id,
          type: rec.type,
          amount: rec.amount,
          category: rec.category,
          description: rec.description,
          payment_method: rec.payment_method,
          date: today,
          is_recurring: true,
          recurring_id: rec.id
        })

      if (!insertError) {
        created++

        // Calculer la prochaine date
        const currentDate = new Date(rec.next_date)
        let nextDate: Date

        switch (rec.frequency) {
          case 'weekly':
            nextDate = new Date(currentDate.setDate(currentDate.getDate() + 7))
            break
          case 'monthly':
            nextDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1))
            break
          case 'yearly':
            nextDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1))
            break
          default:
            nextDate = currentDate
        }

        // Mettre à jour la récurrence
        await supabase
          .from('recurring_transactions')
          .update({
            next_date: nextDate.toISOString().split('T')[0],
            last_executed: today,
            updated_at: new Date().toISOString()
          })
          .eq('id', rec.id)

        // Créer une notification
        await supabase
          .from('notifications')
          .insert({
            user_id: rec.user_id,
            title: rec.type === 'income' ? '💰 Revenu ajouté' : '💸 Dépense ajoutée',
            body: `${rec.description || rec.category}: ${rec.amount} FCFA`,
            type: 'recurring_added',
            data: { transaction_id: rec.id, amount: rec.amount }
          })
      }

      processed++
    }

    return new Response(
      JSON.stringify({ success: true, processed, created }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, securityQuestion, securityAnswer, newPassword } = await req.json()

    // Validation
    if (!email || !securityQuestion || !securityAnswer || !newPassword) {
      return new Response(
        JSON.stringify({ success: false, message: 'Tous les champs sont requis' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return new Response(
        JSON.stringify({ success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Créer le client Supabase avec la clé service (admin)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Chercher l'utilisateur par email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (listError) {
      console.error('List users error:', listError)
      return new Response(
        JSON.stringify({ success: false, message: 'Erreur serveur' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Trouver l'utilisateur avec cet email
    const user = users.users.find(u => u.email === email || u.email === `${email.replace(/\D/g, '')}@phone.seka.app`)

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Aucun compte trouvé avec cet email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Vérifier la question et la réponse de sécurité
    const userMetadata = user.user_metadata || {}
    const storedQuestion = userMetadata.securityQuestion
    const storedAnswer = userMetadata.securityAnswer

    if (!storedQuestion || !storedAnswer) {
      return new Response(
        JSON.stringify({ success: false, message: 'Aucune question de sécurité configurée pour ce compte' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Vérifier que la question correspond
    if (storedQuestion !== securityQuestion) {
      return new Response(
        JSON.stringify({ success: false, message: 'Question de sécurité incorrecte' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Vérifier que la réponse correspond (en lowercase et trimmed)
    if (storedAnswer.toLowerCase().trim() !== securityAnswer.toLowerCase().trim()) {
      return new Response(
        JSON.stringify({ success: false, message: 'Réponse incorrecte à la question de sécurité' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Tout est correct, changer le mot de passe
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Update password error:', updateError)
      return new Response(
        JSON.stringify({ success: false, message: 'Erreur lors du changement de mot de passe' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Succès !
    return new Response(
      JSON.stringify({ success: true, message: 'Mot de passe modifié avec succès' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Une erreur est survenue' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

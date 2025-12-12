import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Search, ChevronDown, ChevronUp, 
  HelpCircle, CreditCard, Target, PieChart, 
  Bell, Shield, Download, Settings, MessageCircle,
  Mail, Phone, Clock
} from 'lucide-react'
import { useTheme } from '../App'

const FAQ_CATEGORIES = [
  {
    id: 'general',
    title: 'Questions générales',
    icon: HelpCircle,
    questions: [
      {
        q: "Qu'est-ce que SEKA Money ?",
        a: "SEKA Money est une application de gestion financière personnelle conçue pour les utilisateurs africains. Elle vous permet de suivre vos revenus et dépenses, définir des objectifs d'épargne, et analyser vos habitudes financières pour mieux gérer votre argent au quotidien."
      },
      {
        q: "SEKA Money est-il gratuit ?",
        a: "Oui, SEKA Money propose une version gratuite avec les fonctionnalités essentielles : transactions illimitées, 1 objectif d'épargne, historique de 3 mois, et export PDF. La version Premium à 4 900F/an débloque toutes les fonctionnalités avancées."
      },
      {
        q: "Mes données sont-elles sécurisées ?",
        a: "Absolument. Vos données sont chiffrées et stockées de manière sécurisée. Nous utilisons les mêmes standards de sécurité que les banques. Vous seul avez accès à vos informations financières. Nous ne partageons jamais vos données avec des tiers."
      },
      {
        q: "Puis-je utiliser SEKA Money hors connexion ?",
        a: "Actuellement, une connexion internet est nécessaire pour utiliser l'application. Nous travaillons sur un mode hors-ligne pour une prochaine mise à jour qui permettra d'ajouter des transactions sans internet."
      }
    ]
  },
  {
    id: 'transactions',
    title: 'Transactions',
    icon: CreditCard,
    questions: [
      {
        q: "Comment ajouter une transaction ?",
        a: "Depuis le Dashboard, appuyez sur 'Revenu' ou 'Dépense'. Remplissez le montant, choisissez une catégorie, sélectionnez le moyen de paiement et ajoutez une description si vous le souhaitez. Appuyez sur 'Enregistrer' pour valider."
      },
      {
        q: "Comment modifier ou supprimer une transaction ?",
        a: "Allez dans 'Historique', trouvez la transaction concernée et appuyez dessus. Deux boutons apparaîtront : 'Modifier' pour changer les détails, ou 'Supprimer' pour l'effacer définitivement."
      },
      {
        q: "Quelles sont les catégories disponibles ?",
        a: "SEKA Money propose plus de 25 catégories adaptées au contexte africain : Alimentation, Transport, Zémidjan, Mobile Money, Tontine, Loyer, Santé, Éducation, Divertissement, et bien d'autres. Chaque catégorie a une icône distinctive."
      },
      {
        q: "Qu'est-ce qu'une transaction récurrente ?",
        a: "C'est une transaction qui se répète automatiquement (loyer mensuel, salaire, abonnement...). Configurez-la une fois avec la fréquence souhaitée (quotidienne, hebdomadaire, mensuelle) et SEKA Money l'ajoutera automatiquement. Disponible en version Premium."
      },
      {
        q: "Comment filtrer mes transactions ?",
        a: "Dans 'Historique', utilisez les filtres en haut : par période (aujourd'hui, semaine, mois), par type (revenus/dépenses), par catégorie, ou par moyen de paiement. Vous pouvez aussi utiliser la barre de recherche."
      }
    ]
  },
  {
    id: 'objectives',
    title: 'Objectifs d\'épargne',
    icon: Target,
    questions: [
      {
        q: "Comment créer un objectif d'épargne ?",
        a: "Allez dans 'Objectifs' depuis le menu, puis appuyez sur 'Nouvel objectif'. Donnez-lui un nom (ex: Voyage, Téléphone, Mariage), définissez le montant cible et optionnellement une date limite. Appuyez sur 'Créer'."
      },
      {
        q: "Comment ajouter de l'argent à un objectif ?",
        a: "Sur la page Objectifs, appuyez sur l'objectif concerné, puis sur 'Ajouter'. Entrez le montant que vous souhaitez épargner et validez. Votre progression sera mise à jour automatiquement."
      },
      {
        q: "Puis-je avoir plusieurs objectifs ?",
        a: "En version gratuite, vous pouvez avoir 1 objectif actif. Avec Premium (4 900F/an), créez autant d'objectifs que vous le souhaitez et suivez-les tous simultanément."
      },
      {
        q: "Que se passe-t-il quand j'atteins mon objectif ?",
        a: "Félicitations ! 🎉 Vous recevrez une notification de succès. L'objectif sera marqué comme 'Atteint' et vous pourrez le supprimer ou le garder comme souvenir de votre réussite."
      }
    ]
  },
  {
    id: 'analyses',
    title: 'Analyses & Statistiques',
    icon: PieChart,
    questions: [
      {
        q: "Comment fonctionne le Score Financier ?",
        a: "Le Score Financier (0-100) évalue votre santé financière selon 5 critères : taux d'épargne (30pts), tendance des dépenses (25pts), régularité des revenus (20pts), diversification des dépenses (15pts), et activité financière (10pts). Plus le score est élevé, mieux c'est !"
      },
      {
        q: "Où voir mes statistiques détaillées ?",
        a: "Allez dans 'Analyses' depuis le menu. Vous y trouverez : répartition des dépenses par catégorie, évolution mensuelle, comparaisons avec le mois précédent, et votre score financier détaillé."
      },
      {
        q: "Comment améliorer mon score financier ?",
        a: "Pour améliorer votre score : 1) Épargnez au moins 15-30% de vos revenus, 2) Réduisez vos dépenses par rapport au mois précédent, 3) Maintenez des revenus réguliers, 4) Diversifiez vos dépenses (évitez qu'une catégorie dépasse 50%), 5) Utilisez l'app régulièrement."
      }
    ]
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    questions: [
      {
        q: "Comment activer/désactiver les notifications ?",
        a: "Allez dans 'Profil' > 'Notifications'. Vous pouvez activer ou désactiver chaque type de notification : rappels de transactions, alertes d'objectifs, conseils financiers, et résumés hebdomadaires."
      },
      {
        q: "Quels types de notifications vais-je recevoir ?",
        a: "SEKA Money peut vous envoyer : des rappels pour vos transactions récurrentes, des alertes quand vous approchez d'un objectif, des conseils personnalisés basés sur vos habitudes, et des résumés de vos finances."
      }
    ]
  },
  {
    id: 'export',
    title: 'Export & Rapports',
    icon: Download,
    questions: [
      {
        q: "Comment exporter mes données ?",
        a: "Allez dans 'Profil' > 'Exporter mes données'. Choisissez la période souhaitée et le format (PDF gratuit, Excel en Premium). Le fichier sera téléchargé sur votre appareil."
      },
      {
        q: "Puis-je exporter les mois précédents ?",
        a: "En version gratuite, vous pouvez exporter le mois en cours. Avec Premium, exportez n'importe quelle période depuis la création de votre compte."
      },
      {
        q: "Que contient le rapport PDF ?",
        a: "Le rapport PDF inclut : résumé de la période (revenus, dépenses, solde), liste détaillée des transactions, répartition par catégorie avec graphique, et votre score financier."
      }
    ]
  },
  {
    id: 'premium',
    title: 'Premium',
    icon: Settings,
    questions: [
      {
        q: "Quels sont les avantages Premium ?",
        a: "Premium (4 900F/an) débloque : historique illimité, objectifs illimités, export Excel, export des mois passés, transactions récurrentes, multi-devises, tous les thèmes, budgets par catégorie (bientôt), analyses IA (bientôt), et support prioritaire."
      },
      {
        q: "Comment passer à Premium ?",
        a: "Allez dans 'Profil' > 'Passer à Premium'. Choisissez votre moyen de paiement (Mobile Money, Carte bancaire) et suivez les instructions. Votre compte sera activé immédiatement après le paiement."
      },
      {
        q: "Puis-je annuler mon abonnement ?",
        a: "Oui, vous pouvez annuler à tout moment depuis 'Profil' > 'Gérer l'abonnement'. Vous conserverez les avantages Premium jusqu'à la fin de la période payée."
      },
      {
        q: "Y a-t-il une période d'essai ?",
        a: "Les nouveaux utilisateurs bénéficient de 7 jours d'essai Premium gratuit pour découvrir toutes les fonctionnalités. Aucune carte bancaire requise."
      }
    ]
  },
  {
    id: 'account',
    title: 'Compte & Sécurité',
    icon: Shield,
    questions: [
      {
        q: "Comment changer mon mot de passe ?",
        a: "Allez dans 'Profil' > 'Sécurité' > 'Changer le mot de passe'. Entrez votre mot de passe actuel, puis le nouveau mot de passe deux fois pour confirmer."
      },
      {
        q: "J'ai oublié mon mot de passe, que faire ?",
        a: "Sur l'écran de connexion, appuyez sur 'Mot de passe oublié'. Entrez votre email, puis répondez à votre question de sécurité. Vous pourrez ensuite créer un nouveau mot de passe."
      },
      {
        q: "Comment modifier ma question de sécurité ?",
        a: "Allez dans 'Profil' > 'Sécurité' > 'Question de sécurité'. Vous devrez d'abord répondre à votre question actuelle avant de pouvoir en choisir une nouvelle."
      },
      {
        q: "Comment supprimer mon compte ?",
        a: "Allez dans 'Profil' > 'Paramètres' > 'Supprimer mon compte'. Attention : cette action est irréversible et toutes vos données seront définitivement effacées."
      }
    ]
  }
]

export default function HelpCenter() {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const [search, setSearch] = useState('')
  const [expandedCategory, setExpandedCategory] = useState('general')
  const [expandedQuestions, setExpandedQuestions] = useState({})

  const toggleQuestion = (categoryId, questionIndex) => {
    const key = `${categoryId}-${questionIndex}`
    setExpandedQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const filteredCategories = FAQ_CATEGORIES.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(search.toLowerCase()) ||
      q.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0)

  return (
    <div className={`min-h-screen pb-24 ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-seka-dark/95 border-seka-border' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => navigate(-1)} 
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}
          >
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-800'}`} />
          </button>
          <div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
              Centre d'aide
            </h1>
            <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
              Trouvez des réponses à vos questions
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une question..."
            className={`w-full pl-10 pr-4 py-3 rounded-xl border ${isDark ? 'bg-seka-darker border-seka-border text-seka-text placeholder:text-seka-text-muted' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
          />
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4 space-y-4">
        {/* Contact Card */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-seka-card/50 border-seka-border' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-seka-green/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-seka-green" />
            </div>
            <div>
              <h3 className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                Besoin d'aide personnalisée ?
              </h3>
              <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                Notre équipe répond sous 24h
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <a 
              href="mailto:support@sekamoney.com"
              className="flex-1 py-2.5 rounded-lg bg-seka-green/10 text-seka-green text-sm font-medium flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              Email
            </a>
            <a 
              href="https://wa.me/22900000000"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 rounded-lg bg-seka-green text-seka-darker text-sm font-medium flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* FAQ Categories */}
        {filteredCategories.map(category => {
          const IconComponent = category.icon
          const isExpanded = expandedCategory === category.id

          return (
            <div 
              key={category.id}
              className={`rounded-xl border overflow-hidden ${isDark ? 'bg-seka-card/50 border-seka-border' : 'bg-white border-gray-200'}`}
            >
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className={`w-full p-4 flex items-center gap-3 ${isDark ? 'hover:bg-seka-darker/50' : 'hover:bg-gray-50'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-darker' : 'bg-gray-100'}`}>
                  <IconComponent className={`w-5 h-5 ${isDark ? 'text-seka-green' : 'text-green-600'}`} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                    {category.title}
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                    {category.questions.length} question{category.questions.length > 1 ? 's' : ''}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronUp className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                ) : (
                  <ChevronDown className={`w-5 h-5 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                )}
              </button>

              {/* Questions */}
              {isExpanded && (
                <div className={`border-t ${isDark ? 'border-seka-border' : 'border-gray-200'}`}>
                  {category.questions.map((item, index) => {
                    const questionKey = `${category.id}-${index}`
                    const isQuestionExpanded = expandedQuestions[questionKey]

                    return (
                      <div 
                        key={index}
                        className={`border-b last:border-b-0 ${isDark ? 'border-seka-border' : 'border-gray-100'}`}
                      >
                        <button
                          onClick={() => toggleQuestion(category.id, index)}
                          className={`w-full p-4 flex items-start gap-3 text-left ${isDark ? 'hover:bg-seka-darker/30' : 'hover:bg-gray-50'}`}
                        >
                          <HelpCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-seka-green' : 'text-green-600'}`} />
                          <span className={`flex-1 text-sm font-medium ${isDark ? 'text-seka-text' : 'text-gray-800'}`}>
                            {item.q}
                          </span>
                          {isQuestionExpanded ? (
                            <ChevronUp className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                          ) : (
                            <ChevronDown className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
                          )}
                        </button>
                        
                        {isQuestionExpanded && (
                          <div className={`px-4 pb-4 pl-11 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                            <p className="text-sm leading-relaxed">
                              {item.a}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* No results */}
        {filteredCategories.length === 0 && (
          <div className={`p-8 text-center rounded-xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white border border-gray-200'}`}>
            <Search className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
            <p className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-700'}`}>
              Aucun résultat trouvé
            </p>
            <p className={`text-sm mt-1 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
              Essayez avec d'autres mots-clés ou contactez-nous
            </p>
          </div>
        )}

        {/* App version */}
        <div className="text-center pt-4">
          <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`}>
            SEKA Money v1.0.0
          </p>
        </div>
      </div>
    </div>
  )
}

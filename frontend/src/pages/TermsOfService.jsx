import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Calendar } from 'lucide-react'
import { useTheme } from '../App'

export default function TermsOfService() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  return (
    <div className={`min-h-screen pb-24 ${isDark ? 'bg-seka-dark' : 'bg-gray-50'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-xl border-b px-4 py-4 ${isDark ? 'bg-seka-dark/95 border-seka-border' : 'bg-white/95 border-gray-200'}`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-card' : 'bg-gray-100'}`}
          >
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-seka-text' : 'text-gray-800'}`} />
          </button>
          <div className="flex-1">
            <h1 className={`text-xl font-bold ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
              Conditions d'utilisation
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Calendar className={`w-3 h-3 ${isDark ? 'text-seka-text-muted' : 'text-gray-400'}`} />
              <p className={`text-xs ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>
                Dernière mise à jour : Décembre 2025
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6">
        <div className={`p-5 rounded-2xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white border border-gray-200'}`}>
          <div className="prose prose-sm max-w-none">
            
            <section className="mb-6">
              <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                <span className="w-6 h-6 rounded-full bg-seka-green/20 flex items-center justify-center text-xs text-seka-green font-bold">1</span>
                Acceptation des conditions
              </h2>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                En utilisant l'application SEKA Money, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
              </p>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                <span className="w-6 h-6 rounded-full bg-seka-green/20 flex items-center justify-center text-xs text-seka-green font-bold">2</span>
                Description du service
              </h2>
              <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                SEKA Money est une application de gestion financière personnelle qui permet aux utilisateurs de :
              </p>
              <ul className={`text-sm space-y-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  Enregistrer et suivre leurs transactions financières
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  Définir et suivre des objectifs d'épargne
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  Analyser leurs habitudes de dépenses
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  Exporter leurs données financières
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                <span className="w-6 h-6 rounded-full bg-seka-green/20 flex items-center justify-center text-xs text-seka-green font-bold">3</span>
                Compte utilisateur
              </h2>
              <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                Pour utiliser SEKA Money, vous devez créer un compte. Vous êtes responsable de :
              </p>
              <ul className={`text-sm space-y-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  Maintenir la confidentialité de votre mot de passe
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  Fournir des informations exactes et à jour
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  Toutes les activités qui se produisent sous votre compte
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                <span className="w-6 h-6 rounded-full bg-seka-green/20 flex items-center justify-center text-xs text-seka-green font-bold">4</span>
                Abonnement Premium
              </h2>
              <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                SEKA Money propose un abonnement Premium à 4 900 FCFA par an. En souscrivant :
              </p>
              <ul className={`text-sm space-y-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  Le paiement est effectué en une seule fois pour une année
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  L'abonnement ne se renouvelle pas automatiquement
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  Aucun remboursement n'est possible après l'achat
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  Les fonctionnalités Premium sont accessibles immédiatement après le paiement
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                <span className="w-6 h-6 rounded-full bg-seka-green/20 flex items-center justify-center text-xs text-seka-green font-bold">5</span>
                Utilisation acceptable
              </h2>
              <p className={`text-sm leading-relaxed mb-3 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                Vous vous engagez à ne pas :
              </p>
              <ul className={`text-sm space-y-2 ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                <li className="flex items-start gap-2">
                  <span className="text-seka-red mt-1">•</span>
                  Utiliser le service à des fins illégales
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-seka-red mt-1">•</span>
                  Tenter d'accéder aux comptes d'autres utilisateurs
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-seka-red mt-1">•</span>
                  Interférer avec le fonctionnement du service
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-seka-red mt-1">•</span>
                  Reproduire ou redistribuer le service sans autorisation
                </li>
              </ul>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                <span className="w-6 h-6 rounded-full bg-seka-green/20 flex items-center justify-center text-xs text-seka-green font-bold">6</span>
                Limitation de responsabilité
              </h2>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                SEKA Money est un outil de suivi financier personnel et ne constitue pas un conseil financier professionnel. Nous ne sommes pas responsables des décisions financières que vous prenez sur la base des informations affichées dans l'application. Les données sont fournies "telles quelles" sans garantie d'exactitude.
              </p>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                <span className="w-6 h-6 rounded-full bg-seka-green/20 flex items-center justify-center text-xs text-seka-green font-bold">7</span>
                Propriété intellectuelle
              </h2>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                SEKA Money, son logo, ses fonctionnalités et son contenu sont la propriété exclusive de SEKA Money et sont protégés par les lois sur la propriété intellectuelle. Toute reproduction non autorisée est interdite.
              </p>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                <span className="w-6 h-6 rounded-full bg-seka-green/20 flex items-center justify-center text-xs text-seka-green font-bold">8</span>
                Modifications des conditions
              </h2>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                Nous nous réservons le droit de modifier ces conditions à tout moment. Les utilisateurs seront informés des changements importants par notification dans l'application. L'utilisation continue du service après modification constitue une acceptation des nouvelles conditions.
              </p>
            </section>

            <section className="mb-6">
              <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                <span className="w-6 h-6 rounded-full bg-seka-green/20 flex items-center justify-center text-xs text-seka-green font-bold">9</span>
                Résiliation
              </h2>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                Vous pouvez supprimer votre compte à tout moment depuis les paramètres de l'application. Nous nous réservons le droit de suspendre ou résilier votre compte en cas de violation de ces conditions.
              </p>
            </section>

            <section>
              <h2 className={`text-lg font-bold mb-3 flex items-center gap-2 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                <span className="w-6 h-6 rounded-full bg-seka-green/20 flex items-center justify-center text-xs text-seka-green font-bold">10</span>
                Contact
              </h2>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                Pour toute question concernant ces conditions d'utilisation, contactez-nous à :
              </p>
              <div className={`mt-3 p-3 rounded-xl ${isDark ? 'bg-seka-darker' : 'bg-gray-100'}`}>
                <p className={`text-sm font-medium ${isDark ? 'text-seka-green' : 'text-green-600'}`}>
                  support@sekamoney.com
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}

import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Calendar, Lock, Eye, Database, Trash2, Globe } from 'lucide-react'
import { useTheme } from '../App'

export default function PrivacyPolicy() {
  const navigate = useNavigate()
  const { isDark } = useTheme()

  const Section = ({ number, icon: Icon, title, children }) => (
    <section className="mb-6">
      <h2 className={`text-lg font-bold mb-3 flex items-center gap-3 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-green/20' : 'bg-green-100'}`}>
          <Icon className={`w-4 h-4 ${isDark ? 'text-seka-green' : 'text-green-600'}`} />
        </span>
        {title}
      </h2>
      <div className={`text-sm leading-relaxed ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
        {children}
      </div>
    </section>
  )

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
              Politique de confidentialité
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
        {/* Intro Card */}
        <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-seka-green/10 border border-seka-green/20' : 'bg-green-50 border border-green-200'}`}>
          <div className="flex items-start gap-3">
            <Shield className={`w-6 h-6 flex-shrink-0 ${isDark ? 'text-seka-green' : 'text-green-600'}`} />
            <div>
              <h3 className={`font-medium mb-1 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
                Votre vie privée est notre priorité
              </h3>
              <p className={`text-sm ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
                Nous nous engageons à protéger vos données personnelles et à être transparents sur la façon dont nous les utilisons.
              </p>
            </div>
          </div>
        </div>

        <div className={`p-5 rounded-2xl ${isDark ? 'bg-seka-card/50 border border-seka-border' : 'bg-white border border-gray-200'}`}>
          
          <Section icon={Database} title="Données collectées">
            <p className="mb-3">Nous collectons les informations suivantes :</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                <span><strong>Informations de compte :</strong> Nom, prénom, email ou téléphone, mot de passe chiffré</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                <span><strong>Données financières :</strong> Transactions, catégories, montants, dates, objectifs d'épargne</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                <span><strong>Préférences :</strong> Langue, devise, thème, paramètres de notification</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                <span><strong>Données techniques :</strong> Type d'appareil, version de l'application</span>
              </li>
            </ul>
          </Section>

          <Section icon={Eye} title="Utilisation des données">
            <p className="mb-3">Vos données sont utilisées pour :</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                Fournir et améliorer nos services de gestion financière
              </li>
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                Calculer vos statistiques et votre score financier
              </li>
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                Envoyer des notifications pertinentes (si activées)
              </li>
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                Générer des rapports et exports à votre demande
              </li>
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                Assurer la sécurité de votre compte
              </li>
            </ul>
          </Section>

          <Section icon={Lock} title="Protection des données">
            <p className="mb-3">Nous mettons en œuvre des mesures de sécurité strictes :</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                <span><strong>Chiffrement :</strong> Toutes les données sont chiffrées en transit (HTTPS/TLS) et au repos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                <span><strong>Mots de passe :</strong> Stockés avec un hachage sécurisé (bcrypt)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                <span><strong>Accès restreint :</strong> Seuls les systèmes autorisés peuvent accéder aux données</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                <span><strong>Hébergement sécurisé :</strong> Serveurs conformes aux normes de sécurité internationales</span>
              </li>
            </ul>
          </Section>

          <Section icon={Globe} title="Partage des données">
            <div className={`p-3 rounded-xl mb-3 ${isDark ? 'bg-seka-green/10' : 'bg-green-50'}`}>
              <p className={`font-medium ${isDark ? 'text-seka-green' : 'text-green-700'}`}>
                ✓ Nous ne vendons JAMAIS vos données personnelles
              </p>
            </div>
            <p className="mb-3">Vos données peuvent être partagées uniquement dans les cas suivants :</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                <span><strong>Prestataires de paiement :</strong> Pour traiter les abonnements Premium (Kkiapay)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                <span><strong>Obligations légales :</strong> Si requis par la loi ou une autorité compétente</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                <span><strong>Avec votre consentement :</strong> Si vous acceptez explicitement</span>
              </li>
            </ul>
          </Section>

          <Section icon={Trash2} title="Vos droits">
            <p className="mb-3">Vous disposez des droits suivants sur vos données :</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                <span><strong>Accès :</strong> Consulter toutes vos données dans l'application</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                <span><strong>Export :</strong> Télécharger vos données en PDF ou Excel</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                <span><strong>Modification :</strong> Corriger vos informations personnelles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                <span><strong>Suppression :</strong> Supprimer votre compte et toutes vos données</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-seka-green mt-1">•</span>
                <span><strong>Portabilité :</strong> Récupérer vos données dans un format standard</span>
              </li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, accédez aux paramètres de votre compte ou contactez-nous.
            </p>
          </Section>

          <section className="mb-6">
            <h2 className={`text-lg font-bold mb-3 flex items-center gap-3 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
              <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-seka-green/20' : 'bg-green-100'}`}>
                <span className={`text-xs font-bold ${isDark ? 'text-seka-green' : 'text-green-600'}`}>🍪</span>
              </span>
              Cookies et stockage local
            </h2>
            <div className={`text-sm leading-relaxed ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
              <p className="mb-3">SEKA Money utilise le stockage local de votre navigateur pour :</p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  Mémoriser vos préférences (thème, langue, devise)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  Maintenir votre session de connexion
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  Améliorer les performances de l'application
                </li>
              </ul>
              <p className="mt-3">
                Nous n'utilisons pas de cookies de tracking ou de publicité.
              </p>
            </div>
          </section>

          <section className="mb-6">
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
              Conservation des données
            </h2>
            <div className={`text-sm leading-relaxed ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  <span><strong>Compte actif :</strong> Vos données sont conservées tant que votre compte existe</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  <span><strong>Suppression de compte :</strong> Toutes vos données sont supprimées sous 30 jours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-seka-green mt-1">•</span>
                  <span><strong>Compte inactif :</strong> Après 2 ans d'inactivité, nous pouvons supprimer le compte</span>
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-6">
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
              Mineurs
            </h2>
            <div className={`text-sm leading-relaxed ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
              <p>
                SEKA Money n'est pas destiné aux personnes de moins de 16 ans. Nous ne collectons pas sciemment de données auprès de mineurs. Si vous êtes parent et découvrez que votre enfant nous a fourni des données, contactez-nous pour les supprimer.
              </p>
            </div>
          </section>

          <section className="mb-6">
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
              Modifications
            </h2>
            <div className={`text-sm leading-relaxed ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
              <p>
                Nous pouvons mettre à jour cette politique de confidentialité. En cas de changement significatif, nous vous informerons par notification dans l'application. La date de dernière mise à jour est indiquée en haut de cette page.
              </p>
            </div>
          </section>

          <section>
            <h2 className={`text-lg font-bold mb-3 ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>
              Contact
            </h2>
            <div className={`text-sm leading-relaxed ${isDark ? 'text-seka-text-secondary' : 'text-gray-600'}`}>
              <p className="mb-3">
                Pour toute question concernant cette politique ou vos données personnelles :
              </p>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-seka-darker' : 'bg-gray-100'}`}>
                <p className={`font-medium ${isDark ? 'text-seka-text' : 'text-gray-900'}`}>SEKA Money</p>
                <p className={`mt-1 ${isDark ? 'text-seka-green' : 'text-green-600'}`}>privacy@sekamoney.com</p>
                <p className={`mt-1 ${isDark ? 'text-seka-text-muted' : 'text-gray-500'}`}>Cotonou, Bénin</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}

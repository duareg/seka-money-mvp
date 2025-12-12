import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { translations } from './translations'

// ============================================
// LANGUAGE CONTEXT - VERSION CORRIGÉE
// ============================================

const LanguageContext = createContext()

// Clé localStorage pour persister la langue
const LANGUAGE_KEY = 'seka_language'

// Langue par défaut
const DEFAULT_LANGUAGE = 'fr'

// Langues disponibles
export const AVAILABLE_LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
]

// ============================================
// LANGUAGE PROVIDER
// ============================================

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    // Récupérer la langue sauvegardée ou utiliser le défaut
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LANGUAGE_KEY)
      if (saved && translations[saved]) {
        return saved
      }
      // Détecter la langue du navigateur
      const browserLang = navigator.language?.split('-')[0]
      if (browserLang && translations[browserLang]) {
        return browserLang
      }
    }
    return DEFAULT_LANGUAGE
  })

  // Sauvegarder quand la langue change
  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language)
    // Mettre à jour l'attribut lang du HTML pour l'accessibilité
    document.documentElement.lang = language
  }, [language])

  // Fonction pour changer la langue
  const setLanguage = (lang) => {
    if (translations[lang]) {
      setLanguageState(lang)
    } else {
      console.warn(`Language "${lang}" not available`)
    }
  }

  // Obtenir les traductions pour la langue actuelle
  const currentTranslations = translations[language] || translations[DEFAULT_LANGUAGE]

  // ============================================
  // FONCTION t() - Accès aux traductions par clé
  // ============================================
  // Usage: t('home.greeting') => 'Bonjour'
  // Usage: t('errors.notFound', 'Not found') => 'Non trouvé' ou fallback
  const t = useCallback((key, fallback = '') => {
    if (!key) return fallback

    const keys = key.split('.')
    let result = currentTranslations

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k]
      } else {
        // Clé non trouvée
        if (process.env.NODE_ENV === 'development') {
          console.warn(`Translation key "${key}" not found for language "${language}"`)
        }
        return fallback || key
      }
    }

    // Si le résultat est un objet (pas une string), retourner la clé
    if (typeof result === 'object') {
      return fallback || key
    }

    return result
  }, [currentTranslations, language])

  const value = {
    language,
    setLanguage,
    t,                                    // FONCTION pour accéder aux traductions
    translations: currentTranslations,    // Objet complet si besoin
    availableLanguages: AVAILABLE_LANGUAGES,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// ============================================
// HOOK useLanguage
// ============================================

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    // Retourner des valeurs par défaut si utilisé hors du Provider
    // Cela évite les crashes mais affichera des warnings
    console.error('useLanguage must be used within a LanguageProvider')
    return {
      language: DEFAULT_LANGUAGE,
      setLanguage: () => { },
      t: (key) => key,
      translations: translations[DEFAULT_LANGUAGE],
      availableLanguages: AVAILABLE_LANGUAGES,
    }
  }

  return context
}

// ============================================
// HOOK useTranslation (alias)
// ============================================

export const useTranslation = useLanguage

export default LanguageContext

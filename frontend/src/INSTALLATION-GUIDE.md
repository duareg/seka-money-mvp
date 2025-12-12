# 🚀 SEKA Money v7 - Guide d'Installation

## 📥 Étape 1 : Télécharger et extraire

```bash
# Extraire le ZIP dans ton dossier src/
unzip seka-complete-v7.zip -d src/
```

## 📁 Étape 2 : Structure des fichiers

Après extraction, tu auras :

```
src/
├── i18n/
│   ├── translations.js      # Toutes les traductions FR/EN
│   ├── LanguageContext.jsx  # Provider de langue
│   └── index.js             # Export
├── currency/
│   └── CurrencyContext.jsx  # Provider de devise
├── pages/
│   ├── Dashboard.jsx        # Accueil avec score intelligent
│   ├── Analyses.jsx         # Analyses améliorées + traduit
│   ├── Objectives.jsx       # Objectifs/Prêts/Investissements
│   ├── AddTransaction.jsx   # Ajout avec wheel picker
│   ├── AddInvestment.jsx    # Ajout investissement
│   ├── Transactions.jsx     # Historique
│   └── Profile.jsx          # Profil avec export
└── components/
    └── ExportData.jsx       # Modal export PDF/Excel
```

## ⚙️ Étape 3 : Configurer App.jsx

Ajoute les providers dans `src/App.jsx` :

```jsx
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from './i18n'
import { CurrencyProvider } from './currency'

// Ton ThemeProvider existant...

function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <CurrencyProvider>
          <ThemeProvider>
            <AuthProvider>
              {/* Tes routes */}
            </AuthProvider>
          </ThemeProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
```

**IMPORTANT** : L'ordre des providers doit être :
1. LanguageProvider (extérieur)
2. CurrencyProvider
3. ThemeProvider
4. AuthProvider (intérieur)

## 🔧 Étape 4 : Vérifier les imports dans chaque page

Chaque page utilise maintenant :

```jsx
import { useLanguage } from '../i18n'
import { useCurrency } from '../currency'

export default function MaPage() {
  const { t, language } = useLanguage()
  const { formatMoney, symbol } = useCurrency()
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{formatMoney(1500)}</p>
    </div>
  )
}
```

## 📋 Étape 5 : Tester

1. Lance l'app : npm run dev
2. Va dans Profil → Change la langue (FR/EN)
3. Va dans Profil → Change la devise (FCFA/EUR/USD...)
4. Vérifie que tout s'affiche correctement

## ✅ Fonctionnalités incluses

| Feature | Description |
|---------|-------------|
| 🌍 Multi-langue | FR/EN sur toutes les pages |
| 💰 Multi-devises | FCFA, NGN, GHS, EUR, USD |
| 💯 Score intelligent | Basé sur 5 critères financiers |
| 📊 Analyses améliorées | Plus d'insights, conseils, graphiques |
| 🔄 Wheel picker | Sélection récurrence style iPhone |
| 📄 Export PDF/Excel | Depuis le profil |
| 🎯 Objectifs complets | Épargne, Prêts, Investissements |

## 🔑 Comment utiliser les traductions

```jsx
// Accéder aux traductions
const { t } = useLanguage()

// Exemples
t('dashboard.greeting')           // "Bonjour" ou "Hello"
t('dashboard.income')             // "Revenus" ou "Income"
t('analyses.expensesByCategory')  // "Dépenses par catégorie"
t('nav.home')                     // "Accueil" ou "Home"
```

## ⚠️ Erreurs courantes

### 1. "useLanguage is not defined"
→ Vérifie que LanguageProvider est dans App.jsx

### 2. "Cannot read property 't' of undefined"
→ Le composant n'est pas dans le LanguageProvider

### 3. "formatMoney is not a function"
→ Vérifie que CurrencyProvider est dans App.jsx

### 4. Page blanche
→ Regarde la console pour l'erreur exacte

## 📱 Prochaines étapes (nécessitent backend)

- [ ] Notifications push
- [ ] Récurrence automatique des revenus

---

Bon courage ! 🚀

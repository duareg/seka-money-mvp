# 🌍 GUIDE D'INTÉGRATION - Multi-langue SEKA Money

## 📁 Structure des fichiers

```
src/
├── i18n/
│   ├── index.js              # Export principal
│   ├── translations.js       # Toutes les traductions FR/EN
│   └── LanguageContext.jsx   # Context + Hook
├── components/
│   └── LanguageSelector.jsx  # Sélecteur avec Wheel Picker
└── App.jsx                   # Wrapper avec LanguageProvider
```

---

## 🔧 ÉTAPE 1 : Copier les fichiers

Copie les fichiers dans ton projet :

```
src/i18n/translations.js
src/i18n/LanguageContext.jsx
src/i18n/index.js
src/components/LanguageSelector.jsx
```

---

## 🔧 ÉTAPE 2 : Modifier App.jsx

Ajoute le `LanguageProvider` autour de ton app :

```jsx
// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState, useEffect, createContext, useContext } from 'react'
import { LanguageProvider } from './i18n'  // <-- AJOUTER

// ... tes imports existants

// Theme Context (existant)
const ThemeContext = createContext()
export const useTheme = () => useContext(ThemeContext)

function App() {
  const [isDark, setIsDark] = useState(true)

  return (
    <LanguageProvider>  {/* <-- WRAPPER */}
      <ThemeContext.Provider value={{ isDark, setIsDark }}>
        <BrowserRouter>
          <Routes>
            {/* tes routes */}
          </Routes>
        </BrowserRouter>
      </ThemeContext.Provider>
    </LanguageProvider>  {/* <-- FERMER */}
  )
}

export default App
```

---

## 🔧 ÉTAPE 3 : Utiliser les traductions dans un composant

### Exemple simple :

```jsx
import { useTranslation } from '../i18n'

function Home() {
  const { t, language } = useTranslation()

  return (
    <div>
      <h1>{t.home.greeting}</h1>
      <p>{t.home.balance}: 500.000 FCFA</p>
      <button>{t.nav.home}</button>
    </div>
  )
}
```

### Exemple avec catégories :

```jsx
import { useTranslation } from '../i18n'

function TransactionCard({ transaction }) {
  const { t } = useTranslation()
  
  // Obtenir le label traduit de la catégorie
  const categoryLabel = transaction.type === 'expense'
    ? t.expenseCategories[transaction.category]
    : t.incomeCategories[transaction.category]

  return (
    <div>
      <span>{categoryLabel}</span>
      <span>{transaction.amount} {t.app.currency}</span>
    </div>
  )
}
```

---

## 🔧 ÉTAPE 4 : Ajouter le sélecteur dans Profile.jsx

```jsx
import LanguageSelector from '../components/LanguageSelector'
import { useTranslation } from '../i18n'

function Profile() {
  const { isDark } = useTheme()
  const { t } = useTranslation()

  return (
    <div>
      <h1>{t.profile.title}</h1>
      
      {/* Section Préférences */}
      <section>
        <h2>{t.profile.preferences}</h2>
        
        {/* Sélecteur de langue */}
        <LanguageSelector isDark={isDark} />
        
        {/* Autres préférences... */}
      </section>
    </div>
  )
}
```

---

## 📋 RÉFÉRENCE RAPIDE DES CLÉS

### Navigation
- `t.nav.home` → "Accueil" / "Home"
- `t.nav.history` → "Historique" / "History"
- `t.nav.objectives` → "Objectifs" / "Goals"
- `t.nav.profile` → "Profil" / "Profile"

### Transactions
- `t.transactions.expense` → "Dépense" / "Expense"
- `t.transactions.income` → "Revenu" / "Income"
- `t.transactions.amount` → "Montant" / "Amount"

### Actions générales
- `t.app.save` → "Enregistrer" / "Save"
- `t.app.cancel` → "Annuler" / "Cancel"
- `t.app.delete` → "Supprimer" / "Delete"
- `t.app.confirm` → "Confirmer" / "Confirm"

### Catégories (exemples)
- `t.expenseCategories.food` → "Alimentation" / "Food"
- `t.expenseCategories.transport` → "Transport" / "Transport"
- `t.incomeCategories.salary` → "Salaire" / "Salary"

### Objectifs
- `t.objectives.title` → "Objectifs" / "Goals"
- `t.objectives.newObjective` → "Nouvel objectif" / "New goal"
- `t.loans.theyOweMe` → "Ils me doivent" / "They owe me"

---

## 🎯 BONNES PRATIQUES

1. **Ne jamais mettre de texte en dur** dans les composants
2. **Toujours utiliser `t.xxx`** pour les textes affichés
3. **Tester les deux langues** pour vérifier que rien n'est oublié
4. **Ajouter les nouvelles traductions** dans les deux langues en même temps

---

## 🆘 DÉPANNAGE

### "useTranslation must be used within a LanguageProvider"
→ Vérifie que `<LanguageProvider>` entoure ton app dans App.jsx

### La langue ne se sauvegarde pas
→ Vérifie que localStorage fonctionne (pas en mode incognito)

### Texte qui affiche la clé au lieu de la traduction
→ Vérifie que la clé existe dans translations.js pour les deux langues

# 💰 GUIDE D'INTÉGRATION - Multi-devises SEKA Money

## 📁 Structure des fichiers

```
src/
├── currency/
│   ├── index.js              # Export principal
│   └── CurrencyContext.jsx   # Context + Hook useCurrency
├── components/
│   └── CurrencySelector.jsx  # Sélecteur pour Profile
└── App.jsx                   # Wrapper avec CurrencyProvider
```

---

## 🔧 ÉTAPE 1 : Copier les fichiers

```
src/currency/CurrencyContext.jsx
src/currency/index.js
src/components/CurrencySelector.jsx
```

---

## 🔧 ÉTAPE 2 : Modifier App.jsx

Ajoute le `CurrencyProvider` autour de ton app :

```jsx
import { LanguageProvider } from './i18n'
import { CurrencyProvider } from './currency'  // <-- AJOUTER

function App() {
  return (
    <LanguageProvider>
      <CurrencyProvider>  {/* <-- AJOUTER */}
        <ThemeContext.Provider value={{ isDark, setIsDark, toggleTheme }}>
          <BrowserRouter>
            {/* tes routes */}
          </BrowserRouter>
        </ThemeContext.Provider>
      </CurrencyProvider>  {/* <-- FERMER */}
    </LanguageProvider>
  )
}
```

---

## 🔧 ÉTAPE 3 : Utiliser dans les composants

### Formater un montant :

```jsx
import { useCurrency } from '../currency'

function TransactionCard({ transaction }) {
  const { formatMoney } = useCurrency()

  return (
    <div>
      <span>{formatMoney(transaction.amount)}</span>
      {/* Affiche "50.000 F" ou "₦50,000" selon la devise choisie */}
    </div>
  )
}
```

### Avec signe (+/-) :

```jsx
const { formatMoneyWithSign } = useCurrency()

// Pour une dépense
formatMoneyWithSign(5000, 'expense')  // "-5.000 F"

// Pour un revenu
formatMoneyWithSign(5000, 'income')   // "+5.000 F"
```

### Obtenir le symbole :

```jsx
const { symbol, currentCurrency } = useCurrency()

console.log(symbol)           // "F" ou "₦" ou "₵" etc.
console.log(currentCurrency)  // { code: 'FCFA', symbol: 'F', label: 'Franc CFA', ... }
```

---

## 🔧 ÉTAPE 4 : Remplacer formatMoney dans api.js

Dans `src/utils/api.js`, tu as probablement une fonction `formatMoney`.

**Option A** : La supprimer et utiliser `useCurrency().formatMoney` partout

**Option B** : La garder pour les composants qui n'ont pas accès au hook (ex: utils)

---

## 📋 DEVISES DISPONIBLES

| Code | Symbole | Label | Position |
|------|---------|-------|----------|
| FCFA | F | Franc CFA | après (50.000 F) |
| NGN | ₦ | Naira | avant (₦50,000) |
| GHS | ₵ | Cedi | avant (₵50,000) |
| EUR | € | Euro | après (50.000 €) |
| USD | $ | Dollar | avant ($50,000) |

---

## 🎯 EXEMPLE COMPLET

```jsx
import { useCurrency } from '../currency'

function Home() {
  const { formatMoney, symbol, currentCurrency } = useCurrency()

  const balance = 500000
  const income = 750000
  const expenses = 250000

  return (
    <div>
      <h2>Solde: {formatMoney(balance)}</h2>
      <p>Revenus: {formatMoney(income)}</p>
      <p>Dépenses: {formatMoney(expenses)}</p>
      <p>Devise actuelle: {currentCurrency.label}</p>
    </div>
  )
}
```

---

## 🆘 DÉPANNAGE

### "useCurrency must be used within a CurrencyProvider"
→ Vérifie que `<CurrencyProvider>` entoure ton app dans App.jsx

### La devise ne se sauvegarde pas
→ Vérifie que localStorage fonctionne

### Le symbole ne change pas
→ Vérifie que tu utilises `formatMoney` du hook, pas une ancienne fonction

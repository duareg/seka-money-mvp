# 🚀 SEKA Money - Roadmap des mises à jour

> Document de planification des futures fonctionnalités

---

## ✅ V1.0 - MVP (Version actuelle)

| Fonctionnalité | Status |
|----------------|--------|
| Inscription/Connexion sécurisée | ✅ |
| Question de sécurité | ✅ |
| Mot de passe oublié | ✅ |
| Dashboard avec score financier | ✅ |
| Transactions (ajout/modif/suppression) | ✅ |
| Historique avec filtres avancés | ✅ |
| Objectifs d'épargne | ✅ |
| Analyses graphiques | ✅ |
| Transactions récurrentes | ✅ |
| Notifications | ✅ |
| Multi-devises (FCFA, EUR, USD...) | ✅ |
| Multi-langues (FR/EN) | ✅ |
| Export PDF/Excel | ✅ |
| Mode sombre/clair | ✅ |

---

## 📊 V1.1 - Budgets & Alertes

**Durée estimée : 2-3 semaines**

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Budgets par catégorie | Définir un montant max par catégorie | 🔴 Haute |
| Périodes flexibles | 1 semaine, 2 semaines, 1 mois | 🔴 Haute |
| Alertes 50% / 80% / 100% | Notifications quand seuils atteints | 🔴 Haute |
| Barre de progression | Visualisation en temps réel | 🟡 Moyenne |
| Historique des budgets | Voir si respectés ou dépassés | 🟡 Moyenne |
| Suggestions de budget | Basées sur les dépenses passées | 🟢 Basse |

### Tâches techniques :
- [ ] Créer table `budgets` dans Supabase
- [ ] Page Budgets.jsx (CRUD)
- [ ] Composant BudgetCard avec barre de progression
- [ ] Edge Function pour vérifier les seuils
- [ ] Cron Job pour envoyer les alertes
- [ ] Intégration dans le Dashboard

---

## 🤖 V1.2 - Intelligence Artificielle

**Durée estimée : 3-4 semaines** ⭐ GROS DIFFÉRENCIATEUR

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Analyse des habitudes | "Tu dépenses 40% de plus en alimentation le weekend" | 🔴 Haute |
| Prédictions | "À ce rythme, tu auras dépensé 150 000F d'ici fin du mois" | 🔴 Haute |
| Conseils personnalisés | "Réduis tes dépenses transport de 10% pour atteindre ton objectif" | 🔴 Haute |
| Détection d'anomalies | "Dépense inhabituelle : 50 000F en divertissement (3x ta moyenne)" | 🟡 Moyenne |
| Assistant chat IA | Poser des questions : "Combien j'ai dépensé en resto ce mois ?" | 🟡 Moyenne |
| Catégorisation auto | L'IA suggère la catégorie basée sur la description | 🟡 Moyenne |
| Score IA amélioré | Analyse plus profonde avec explications détaillées | 🟢 Basse |
| Rapport mensuel IA | Résumé intelligent généré automatiquement | 🟢 Basse |

### Options API IA :
| Option | Avantage | Coût |
|--------|----------|------|
| **Claude API (Anthropic)** | Très intelligent, excellent en français | ~$0.01/requête |
| **GPT-4 API (OpenAI)** | Populaire, bien documenté | ~$0.01/requête |
| **Mistral AI** | Français, moins cher | ~$0.005/requête |
| **Modèle local (Ollama)** | Gratuit mais moins puissant | Gratuit |

### Tâches techniques :
- [ ] Choisir et intégrer API IA (Claude ou GPT)
- [ ] Edge Function pour analyser les transactions
- [ ] Page Insights.jsx avec analyses IA
- [ ] Composant ChatAssistant.jsx
- [ ] Système de cache pour économiser les appels API
- [ ] Génération de rapports mensuels

---

## 📱 V1.3 - Expérience Mobile

**Durée estimée : 2 semaines**

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| PWA optimisée | Installation sur téléphone comme une app native | 🔴 Haute |
| Mode hors-ligne | Ajouter transactions sans internet, sync auto | 🔴 Haute |
| Widget rapide | Bouton flottant "+" pour ajout en 2 clics | 🟡 Moyenne |
| Notifications push | Alertes même quand l'app est fermée | 🟡 Moyenne |
| Raccourcis transactions | Transactions favorites en 1 clic | 🟢 Basse |
| Gestes tactiles | Swipe pour supprimer/modifier | 🟢 Basse |

### Tâches techniques :
- [ ] Configurer Service Worker pour offline
- [ ] IndexedDB pour stocker transactions localement
- [ ] Système de synchronisation
- [ ] Manifest.json optimisé
- [ ] Bouton flottant AddQuick.jsx
- [ ] Web Push Notifications

---

## 👥 V1.4 - Social & Partage

**Durée estimée : 3 semaines**

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Compte partagé | Mode famille/couple pour gérer ensemble | 🔴 Haute |
| Objectifs communs | Épargner à plusieurs pour un projet | 🟡 Moyenne |
| Comparaison anonyme | "Tu épargnes plus que 60% des utilisateurs" | 🟡 Moyenne |
| Défis d'épargne | Challenges hebdomadaires avec récompenses | 🟢 Basse |
| Parrainage | Inviter des amis, gagner des avantages | 🟢 Basse |

### Tâches techniques :
- [ ] Table `shared_accounts` avec permissions
- [ ] Système d'invitations par email/lien
- [ ] Calcul de statistiques anonymisées
- [ ] Page Challenges.jsx
- [ ] Système de parrainage avec codes

---

## 💳 V1.5 - Intégrations Paiements

**Durée estimée : 4 semaines** ⭐ TRÈS DEMANDÉ EN AFRIQUE

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Import SMS Mobile Money | Lire les SMS et ajouter transactions auto | 🔴 Haute |
| Connexion Kkiapay | Sync avec Mobile Money (MTN, Moov, etc.) | 🔴 Haute |
| QR Code paiement | Scanner pour enregistrer une dépense | 🟡 Moyenne |
| Relevé bancaire | Importer fichier CSV/PDF de la banque | 🟡 Moyenne |
| Connexion bancaire | API Open Banking (si disponible) | 🟢 Basse |

### Tâches techniques :
- [ ] Intégration Kkiapay API
- [ ] Parser de SMS Mobile Money (regex patterns)
- [ ] Scanner QR Code avec camera
- [ ] Import CSV/Excel pour relevés
- [ ] Page Integrations.jsx

---

## 📈 V1.6 - Investissements

**Durée estimée : 4 semaines**

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Suivi BRVM | Portefeuille d'actions africaines | 🔴 Haute |
| Tontines digitales | Créer/rejoindre des tontines | 🔴 Haute |
| Épargne automatique | Règles : "Épargner 10% de chaque revenu" | 🟡 Moyenne |
| Objectifs investissement | Planifier pour la retraite, immobilier, etc. | 🟡 Moyenne |
| Calculateurs | Intérêts composés, prêt immobilier, etc. | 🟢 Basse |

### Tâches techniques :
- [ ] API BRVM pour cours des actions
- [ ] Table `tontines` et `tontine_members`
- [ ] Règles d'épargne automatique
- [ ] Page Investments.jsx
- [ ] Calculateurs financiers

---

## 🏆 V1.7 - Gamification

**Durée estimée : 2 semaines**

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Badges & récompenses | "Épargnant du mois", "Budget respecté 3x" | 🟡 Moyenne |
| Niveaux utilisateur | Débutant → Expert financier | 🟡 Moyenne |
| Streaks | "15 jours consécutifs sans dépense superflue" | 🟢 Basse |
| Classement | Leaderboard anonyme des meilleurs épargnants | 🟢 Basse |

### Liste des badges possibles :
- 🥇 Premier pas : Première transaction enregistrée
- 💰 Épargnant débutant : 10 000F épargnés
- 🎯 Objectif atteint : Premier objectif complété
- 📊 Analyste : Consulté les analyses 10 fois
- 🔥 En feu : 7 jours consécutifs d'utilisation
- 💎 Budget master : Budget respecté 3 mois de suite
- 🚀 Expert : Score financier > 80

### Tâches techniques :
- [ ] Table `badges` et `user_badges`
- [ ] Système de calcul des streaks
- [ ] Page Achievements.jsx
- [ ] Animations de déblocage
- [ ] Leaderboard anonymisé

---

## 💼 V2.0 - SEKA Business (Pro)

**Durée estimée : 6-8 semaines**

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| Multi-comptes | Perso + Business séparés | 🔴 Haute |
| Factures | Créer et envoyer des factures | 🔴 Haute |
| Clients/Fournisseurs | Gérer les contacts pro | 🟡 Moyenne |
| Rapports fiscaux | Export pour comptable | 🟡 Moyenne |
| TVA automatique | Calcul et suivi | 🟢 Basse |
| Intégration Perfecto/Sage | Sync avec logiciels comptables | 🟢 Basse |

---

## 📅 Planning recommandé

```
2024
────────────────────────────────────────
Q1  │ V1.0 ✅ MVP - Lancement
    │ V1.1 📊 Budgets & Alertes
────────────────────────────────────────
Q2  │ V1.2 🤖 Intelligence Artificielle
    │ V1.3 📱 Expérience Mobile
────────────────────────────────────────
Q3  │ V1.5 💳 Intégrations Paiements
    │ V1.4 👥 Social & Partage
────────────────────────────────────────
Q4  │ V1.6 📈 Investissements
    │ V1.7 🏆 Gamification
────────────────────────────────────────

2025
────────────────────────────────────────
Q1  │ V2.0 💼 SEKA Business
────────────────────────────────────────
```

---

## 💡 Notes techniques

### Stack actuelle :
- **Frontend** : React + Vite + Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth + Edge Functions)
- **Déploiement** : Vercel / Netlify

### Pour l'IA (V1.2) :
```javascript
// Exemple d'appel Claude API
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.CLAUDE_API_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Analyse ces transactions et donne des conseils: ${JSON.stringify(transactions)}`
    }]
  })
})
```

### Pour Mobile Money (V1.5) :
- Kkiapay : https://docs.kkiapay.me
- Patterns SMS à parser :
  - MTN : "Vous avez recu XXX FCFA de..."
  - Moov : "Transaction reussie. Montant: XXX"

---

## 📞 Contact & Ressources

- **Documentation Supabase** : https://supabase.com/docs
- **Claude API** : https://docs.anthropic.com
- **Kkiapay** : https://kkiapay.me
- **BRVM** : https://www.brvm.org

---

*Dernière mise à jour : Décembre 2025*

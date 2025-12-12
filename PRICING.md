# 💎 SEKA Money - Stratégie de Prix

> Prix unique : **4 900 FCFA/an** (~7,50€)

---

## ✅ VERSION GRATUITE

| Fonctionnalité | Limite |
|----------------|--------|
| Transactions | ✅ Illimitées |
| Catégories | ✅ Toutes (25+) |
| Dashboard | ✅ Complet |
| Score financier | ✅ Basique |
| Historique | ⚠️ 3 derniers mois |
| Objectifs d'épargne | ⚠️ 1 seul actif |
| Notifications | ✅ Basiques |
| Export | ⚠️ PDF du mois en cours uniquement |
| Thème | ⚠️ Sombre uniquement |
| Devise | ⚠️ 1 seule (FCFA par défaut) |
| Transactions récurrentes | ❌ Non disponible |
| Budgets par catégorie | ❌ Non disponible |

---

## 💎 VERSION PREMIUM - 4 900F/an

| Fonctionnalité | Avantage |
|----------------|----------|
| **Historique illimité** | Voir toutes les transactions depuis le début |
| **Objectifs illimités** | Créer autant d'objectifs d'épargne que souhaité |
| **Export PDF + Excel** | Les deux formats disponibles |
| **Export mois passés** | Télécharger les rapports des mois précédents |
| **Analyses avancées** | Graphiques détaillés, comparaisons mois par mois |
| **Transactions récurrentes** | Automatiser les dépenses/revenus réguliers |
| **Multi-devises** | FCFA, EUR, USD, NGN, GHS - changer à volonté |
| **Tous les thèmes** | Mode sombre + Mode clair |
| **Budgets par catégorie** | Définir des limites avec alertes 50%/80%/100% |
| **Rapport mensuel auto** | PDF généré automatiquement chaque mois |
| **IA - Conseils** | Analyses intelligentes et prédictions (V1.2) |
| **IA - Assistant** | Poser des questions sur vos finances (V1.2) |
| **Support prioritaire** | Réponse sous 24h |
| **Badge Premium** | Icône exclusive dans l'app |

---

## 🧮 Calcul de rentabilité

### Hypothèses :
- Prix : 4 900 FCFA/an
- Coût serveur Supabase : ~15 000 FCFA/mois (plan Pro)
- Coût API IA (Claude) : ~50 FCFA/utilisateur/mois

### Seuil de rentabilité :
```
Coûts mensuels : 15 000 + (50 × utilisateurs_premium)
Revenus mensuels : 4 900 × nouveaux_premium / 12

Pour 100 utilisateurs Premium :
- Revenus : 4 900 × 100 = 490 000 FCFA/an = 40 833 FCFA/mois
- Coûts : 15 000 + 5 000 = 20 000 FCFA/mois
- Bénéfice : 20 833 FCFA/mois ✅
```

### Objectifs :
| Étape | Utilisateurs Premium | Revenus annuels |
|-------|---------------------|-----------------|
| Lancement | 50 | 245 000 FCFA |
| 6 mois | 200 | 980 000 FCFA |
| 1 an | 500 | 2 450 000 FCFA |
| 2 ans | 2000 | 9 800 000 FCFA |

---

## 🎁 Offres promotionnelles suggérées

| Offre | Détail |
|-------|--------|
| **Lancement** | -50% → 2 450F la première année |
| **Parrainage** | 1 mois gratuit par ami parrainé |
| **Étudiant** | -30% sur présentation carte étudiant |
| **Early Adopter** | Les 100 premiers = Premium gratuit 6 mois |

---

## 💳 Moyens de paiement à intégrer

- [ ] Kkiapay (Mobile Money : MTN, Moov, Wave)
- [ ] Carte bancaire (Visa, Mastercard via Kkiapay)
- [ ] Orange Money
- [ ] PayPal (pour la diaspora)

---

## 📱 Implémentation dans l'app

### Vérifier si Premium :
```javascript
const isPremium = user?.user_metadata?.premium === true
const premiumExpiry = user?.user_metadata?.premium_expiry
const isActive = isPremium && new Date(premiumExpiry) > new Date()
```

### Table Supabase `subscriptions` :
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan VARCHAR(20) DEFAULT 'free', -- 'free' ou 'premium'
  amount INTEGER DEFAULT 4900,
  currency VARCHAR(10) DEFAULT 'FCFA',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  payment_method VARCHAR(50),
  payment_reference VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

*Dernière mise à jour : Décembre 2024*

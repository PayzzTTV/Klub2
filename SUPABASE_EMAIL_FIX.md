# 🔧 Fix Email Rate Limit - Supabase

## Problème
`email rate limit exceeded` lors de l'inscription

## Solution : Désactiver la confirmation par email

### Étape 1 : Aller dans Supabase Dashboard

1. Va sur https://supabase.com/dashboard
2. Sélectionne ton projet KLUB
3. Va dans **Authentication** → **Settings** (dans la sidebar gauche)
4. Ou va directement sur : `https://supabase.com/dashboard/project/[TON_PROJECT_ID]/settings/auth`

### Étape 2 : Désactiver la confirmation email

Dans la section **Email Auth** :

1. Cherche **"Enable email confirmations"**
2. **Désactive** cette option (toggle OFF)
3. Clique sur **Save**

### Étape 3 : (Optionnel) Augmenter la limite de rate limit

Dans la même page, cherche **Rate Limits** :

1. Cherche **"Email rate limit"**
2. Change de `3 per hour` à `10 per hour` (ou plus)
3. Clique sur **Save**

## Alternative : Utiliser un délai entre les inscriptions

Si tu ne peux pas désactiver la confirmation :

1. Attends 20 minutes entre chaque tentative d'inscription
2. Ou utilise des emails différents

## Après le fix

Une fois la confirmation email désactivée, tu pourras :

- Créer autant de comptes que tu veux
- Te connecter immédiatement sans confirmer l'email
- Tester rapidement ton application

⚠️ **Note** : En production, tu devras réactiver la confirmation email pour la sécurité !

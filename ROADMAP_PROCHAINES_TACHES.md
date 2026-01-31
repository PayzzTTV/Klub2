# 🗺️ KLUB - Roadmap & Prochaines Tâches

**Date de mise à jour :** 2026-01-22
**Version actuelle :** 0.3.0 (Mode Démo Actif)

---

## 🎯 Récapitulatif du Projet KLUB

### Concept Principal
**KLUB** est une plateforme intercommunautaire B2B pour les BDE et organisateurs d'événements (Orgas), avec un **système de réputation unique** basé sur le feedback obligatoire.

### Fonctionnalités Clés
1. **Feedback Obligatoire** : Les BDE doivent noter les Orgas avant de créer un nouveau projet
2. **Système de Réputation** : Badge "Top Prestataire" pour Orgas >4.5/5 (min 5 avis)
3. **Rental Hub** : Location de matériel intercommunautaire
4. **Matching IA** : Suggestions automatiques de matériel dans le chat

---

## ✅ État Actuel (Ce qui est Fait)

### Infrastructure (100%)
- ✅ Next.js 14 avec App Router
- ✅ Design Dark Brutalism complet
- ✅ Schéma SQL Supabase (8 tables, 3 fonctions, 20+ RLS)
- ✅ Types TypeScript centralisés
- ✅ Utilitaires (formatage, validation)

### Pages Créées (70%)
- ✅ Landing page (branding KLUB)
- ✅ Login / Signup (avec sélection BDE/ORGA)
- ✅ Dashboard BDE (avec bandeau feedback obligatoire)
- ✅ Dashboard ORGA (avec système de réputation)
- ✅ Formulaire création de projet
- ✅ Liste des projets
- ✅ **Mode Démo** (sans auth) → http://localhost:3000/demo

### Fonctionnalités Backend
- ✅ `calculate_global_score()` - Calcul du score pondéré
- ✅ `can_post_new_project()` - Vérification feedback obligatoire
- ✅ `auto_complete_projects()` - Complétion automatique
- ✅ Vue `top_orgas` - Classement des meilleures Orgas
- ✅ Vue `projects_needing_feedback` - Projets sans feedback

---

## 🚧 Ce qui Reste à Faire (Roadmap)

### 📌 **PRIORITÉ HAUTE** (À faire maintenant)

#### 1. Page Détail d'un Projet (Semaine 3)
**URL :** `/projects/[id]/page.tsx`

**Fonctionnalités :**
- [ ] Affichage complet du projet (titre, description, dates, budget)
- [ ] Informations sur le BDE créateur
- [ ] Liste des candidatures reçues (pour le BDE)
- [ ] Bouton de candidature (pour les Orgas)
- [ ] Compteur de vues
- [ ] Partage du projet

**Fichiers à créer :**
```
app/projects/[id]/page.tsx
components/ProjectDetails.tsx
```

**Temps estimé :** 2-3 heures

---

#### 2. Formulaire de Candidature ORGA (Semaine 3)
**URL :** `/projects/[id]/apply`

**Fonctionnalités :**
- [ ] Formulaire multi-étapes
- [ ] Message de motivation
- [ ] Prix proposé (optionnel)
- [ ] Upload de documents (optionnel)
- [ ] Envoi de la candidature
- [ ] Notification au BDE

**Fichiers à créer :**
```
app/projects/[id]/apply/page.tsx
components/forms/ApplicationForm.tsx
```

**Temps estimé :** 2 heures

---

#### 3. Formulaire de Feedback Obligatoire (Semaine 4)
**URL :** `/projects/[id]/feedback`

**Fonctionnalités :**
- [ ] Notation sur 5 critères (1-5 étoiles chacun)
  - Ponctualité
  - Qualité du matériel/service
  - Communication
  - Rapport Qualité/Prix
  - Note globale
- [ ] Commentaire texte
- [ ] Validation : impossible de skip
- [ ] Mise à jour automatique de `feedback_given = true`
- [ ] Recalcul du score de l'Orga

**Fichiers à créer :**
```
app/projects/[id]/feedback/page.tsx
components/forms/FeedbackForm.tsx
components/ui/StarRating.tsx
```

**Temps estimé :** 3 heures

---

### 📌 **PRIORITÉ MOYENNE** (Après les 3 premières)

#### 4. Rental Hub - Catalogue de Matériel (Semaine 4-5)
**URL :** `/rental`

**Fonctionnalités :**
- [ ] Liste de tout le matériel disponible
- [ ] Filtres par catégorie (Son, Image, Lumière, Logistique)
- [ ] Filtres par prix
- [ ] Recherche textuelle
- [ ] Tri (prix, date, popularité)
- [ ] Pagination

**Fichiers à créer :**
```
app/rental/page.tsx
components/rental/ItemCard.tsx
components/rental/Filters.tsx
```

**Temps estimé :** 4 heures

---

#### 5. Formulaire Ajout de Matériel (Semaine 5)
**URL :** `/rental/new`

**Fonctionnalités :**
- [ ] Formulaire complet (titre, description, catégorie, prix)
- [ ] Upload d'images multiples (Supabase Storage)
- [ ] Spécifications techniques (JSONB)
- [ ] Disponibilité
- [ ] Prix par jour
- [ ] Nombre de jours min/max

**Fichiers à créer :**
```
app/rental/new/page.tsx
components/forms/InventoryForm.tsx
components/ui/ImageUpload.tsx
```

**Temps estimé :** 3-4 heures

---

#### 6. Page Détail Matériel (Semaine 5)
**URL :** `/rental/[id]`

**Fonctionnalités :**
- [ ] Galerie d'images
- [ ] Informations complètes
- [ ] Profil du propriétaire
- [ ] Calendrier de disponibilité
- [ ] Formulaire de demande de location
- [ ] Prix calculé automatiquement

**Fichiers à créer :**
```
app/rental/[id]/page.tsx
components/rental/Calendar.tsx
components/rental/RentalRequest.tsx
```

**Temps estimé :** 4 heures

---

### 📌 **PRIORITÉ BASSE** (Features avancées)

#### 7. Messagerie Temps Réel (Semaine 6)
**URL :** `/messages`

**Fonctionnalités :**
- [ ] Interface de chat style WhatsApp
- [ ] Supabase Realtime pour les messages live
- [ ] Liste des conversations
- [ ] Notifications de nouveaux messages
- [ ] Indicateur "en train d'écrire..."
- [ ] Statut lu/non lu

**Fichiers à créer :**
```
app/messages/page.tsx
app/messages/[conversationId]/page.tsx
components/chat/MessageList.tsx
components/chat/MessageInput.tsx
lib/supabase/realtime.ts
```

**Temps estimé :** 6-8 heures

---

#### 8. Matching IA dans le Chat (Semaine 6-7)
**Fonctionnalités :**
- [ ] Analyse des mots-clés dans les messages
- [ ] Détection d'objets demandés (ex: "caméra", "sono")
- [ ] Suggestions automatiques d'annonces du catalogue
- [ ] Affichage dans le chat
- [ ] Intégration avec OpenAI API (optionnel)

**Fichiers à créer :**
```
lib/ai/matching.ts
components/chat/Suggestions.tsx
```

**Temps estimé :** 8-10 heures

---

#### 9. Page Profil Public ORGA (Semaine 5)
**URL :** `/orga/[id]`

**Fonctionnalités :**
- [ ] Informations de l'Orga
- [ ] Note globale et statistiques
- [ ] Badge "Top Prestataire"
- [ ] Liste de tous les avis reçus
- [ ] Graphiques des notes par critère
- [ ] Portfolio (projets réalisés)

**Fichiers à créer :**
```
app/orga/[id]/page.tsx
components/profile/ReviewsList.tsx
components/profile/StatsChart.tsx
```

**Temps estimé :** 4 heures

---

## 📊 Calendrier Prévisionnel

### Semaine 3 (Maintenant)
- ✅ Mode Démo (fait)
- 🔲 Page détail projet
- 🔲 Formulaire candidature ORGA

### Semaine 4
- 🔲 Formulaire feedback obligatoire
- 🔲 Rental Hub (liste)

### Semaine 5
- 🔲 Ajout de matériel
- 🔲 Page détail matériel
- 🔲 Profil public ORGA

### Semaine 6
- 🔲 Messagerie temps réel
- 🔲 Matching IA

### Semaine 7-8
- 🔲 Optimisations
- 🔲 Tests utilisateurs
- 🔲 Déploiement Vercel

---

## 🎯 Plan d'Action Immédiat

### 🚀 **Prochaine Session de Dev**

#### Option A : Page Détail Projet (Recommandé)
**Pourquoi :** C'est le maillon manquant entre la liste et les candidatures

**Actions :**
1. Créer `app/projects/[id]/page.tsx`
2. Récupérer le projet depuis Supabase
3. Afficher toutes les infos
4. Ajouter le bouton "Candidater"

#### Option B : Formulaire de Feedback (Critique)
**Pourquoi :** C'est le cœur du système de réputation

**Actions :**
1. Créer `app/projects/[id]/feedback/page.tsx`
2. Créer le composant `StarRating.tsx`
3. Implémenter la validation
4. Insérer dans la table `reviews`

#### Option C : Rental Hub (Visible)
**Pourquoi :** Feature visuelle qui démontre bien la plateforme

**Actions :**
1. Créer `app/rental/page.tsx`
2. Lister le matériel depuis `inventory`
3. Ajouter les filtres par catégorie
4. Créer les cartes de matériel

---

## 📝 Notes Importantes

### Authentification Supabase
**Status :** ⚠️ En attente de configuration

Pour l'instant, vous pouvez tester en mode démo :
- **URL :** http://localhost:3000/demo
- **Dashboard BDE Démo :** http://localhost:3000/demo/bde/dashboard

Quand Supabase sera configuré :
- Les pages `/dashboard/bde` et `/dashboard/orga` fonctionneront
- L'authentification sera activée
- Les données seront réelles

### Design System
Toutes les pages doivent utiliser :
- Fond noir `#000000`
- Accent violet `#7C3AED`
- Classes `.brutalist-card`, `.brutalist-button`, etc.

### Base de Données
Le schéma SQL est prêt avec :
- 8 tables
- 3 fonctions PostgreSQL
- 20+ politiques RLS
- 2 vues SQL

---

## 🏆 Objectif Final

**Date cible :** Fin Semaine 8
**Livrable :** Plateforme KLUB complète et déployée

**Features MVP :**
1. ✅ Authentification BDE/ORGA
2. ✅ Dashboard avec feedback obligatoire
3. ✅ Création et liste de projets
4. 🔲 Candidatures et sélection
5. 🔲 Feedback obligatoire fonctionnel
6. 🔲 Rental Hub complet
7. 🔲 Messagerie temps réel
8. 🔲 Matching IA basique

---

## 📞 Questions ?

Quelle feature voulez-vous développer en priorité ?

1. **Page détail projet** (maillon manquant)
2. **Formulaire feedback** (cœur du système)
3. **Rental Hub** (feature visible)
4. **Messagerie** (feature avancée)

---

**Dernière mise à jour :** 2026-01-22 20:35
**Serveur actuel :** ✅ Lancé sur http://localhost:3000

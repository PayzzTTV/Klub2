# KLUB - Plateforme Intercommunautaire BDE & Orgas

## 📋 Vue d'ensemble du projet

**KLUB** est une plateforme intercommunautaire permettant aux BDE (Bureaux des Étudiants) et aux organisateurs d'événements (Orgas) de collaborer, louer du matériel et s'évaluer mutuellement.

### Stack Technique
- **Frontend:** Next.js 14 (App Router)
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Design:** Dark Brutalism (fond noir #000000, bordures fines, accents néon)

---

## 🎯 Objectifs Principaux

1. **Marketplace de projets** - Les BDE postent leurs événements
2. **Rental Hub** - Location de matériel intercommunautaire
3. **Système de réputation** - Feedback obligatoire et ranking
4. **Messagerie intelligente** - Chat temps réel avec matching IA
5. **Sécurité RLS** - Politiques strictes Supabase

---

## 📊 Architecture des Rôles

### Profil BDE
- ✅ Poster des projets d'événements
- ✅ Mettre du matériel en location
- ✅ Noter les Orgas après collaboration
- ✅ Louer du matériel à d'autres BDE/Orgas
- ⚠️ **Obligation:** Feedback avant nouveau projet

### Profil ORGA
- ✅ Consulter les projets disponibles
- ✅ Proposer ses services
- ✅ Louer du matériel
- ✅ Mettre son matériel en location
- ❌ Ne peut PAS poster de projets

---

## 🗄️ Schéma de Base de Données

### Tables Principales

#### `profiles`
```sql
- id (uuid, FK auth.users)
- role (enum: 'BDE', 'ORGA')
- name (text)
- organization_name (text)
- email (text)
- avatar_url (text)
- bio (text)
- location (text)
- phone (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `projects`
```sql
- id (uuid)
- bde_id (uuid, FK profiles)
- title (text)
- type (enum: 'Gala', 'Soirée', 'Festival', 'Conférence', 'Autre')
- budget (numeric)
- capacity (integer)
- location (text)
- description (text)
- start_date (timestamp)
- end_date (timestamp)
- status (enum: 'draft', 'published', 'in_progress', 'completed', 'cancelled')
- feedback_given (boolean, default: false)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `inventory`
```sql
- id (uuid)
- owner_id (uuid, FK profiles)
- category (enum: 'Son', 'Image', 'Lumière', 'Logistique')
- title (text)
- description (text)
- daily_price (numeric)
- quantity (integer)
- available (boolean)
- images (text[])
- specifications (jsonb)
- location (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `reviews`
```sql
- id (uuid)
- project_id (uuid, FK projects)
- reviewer_id (uuid, FK profiles) -- BDE qui note
- reviewee_id (uuid, FK profiles) -- ORGA notée
- global_rating (numeric 1-5)
- punctuality_rating (numeric 1-5)
- quality_rating (numeric 1-5)
- communication_rating (numeric 1-5)
- value_rating (numeric 1-5)
- comment (text)
- created_at (timestamp)
```

#### `messages`
```sql
- id (uuid)
- conversation_id (uuid)
- sender_id (uuid, FK profiles)
- receiver_id (uuid, FK profiles)
- content (text)
- read (boolean)
- created_at (timestamp)
```

#### `rentals`
```sql
- id (uuid)
- item_id (uuid, FK inventory)
- renter_id (uuid, FK profiles)
- owner_id (uuid, FK profiles)
- start_date (timestamp)
- end_date (timestamp)
- total_price (numeric)
- status (enum: 'pending', 'approved', 'ongoing', 'completed', 'cancelled')
- created_at (timestamp)
```

---

## 🎨 Design System - Dark Brutalism

### Couleurs
```css
--bg-primary: #000000 (Noir pur)
--bg-secondary: #0A0A0A
--border: #1A1A1A (Bordures fines)
--text-primary: #FFFFFF
--text-secondary: #A0A0A0
--accent-neon: #7C3AED (Violet électrique)
--accent-green: #00FF66 (Vert acide)
--error: #FF0055
```

### Typographie
- **Font:** Inter, SF Pro, system-ui (sans-serif moderne)
- **Titres:** font-bold, tracking-tight
- **Corps:** font-normal, leading-relaxed

### Composants
- Bordures fines (1px)
- Coins légèrement arrondis (2-4px max)
- Ombres subtiles
- Animations Framer Motion fluides

---

## 🚀 Roadmap de Développement

### Phase 1: Infrastructure & Base (Semaine 1) ⏳
- [x] Initialiser le projet Next.js 14
- [ ] Configurer Supabase (projet, tables, RLS)
- [ ] Mettre en place l'authentification
- [ ] Créer le layout principal Dark Brutalism
- [ ] Implémenter le système de routing

### Phase 2: Profils & Authentification (Semaine 1-2)
- [ ] Page de connexion/inscription
- [ ] Formulaire de création de profil (BDE/ORGA)
- [ ] Dashboard utilisateur basique
- [ ] Upload d'avatar (Supabase Storage)
- [ ] Middleware de protection des routes

### Phase 3: Marketplace Projets (Semaine 2-3)
- [ ] Formulaire de création de projet (BDE uniquement)
- [ ] Liste des projets disponibles
- [ ] Page détail d'un projet
- [ ] Système de candidature (Orgas)
- [ ] Filtres et recherche avancée

### Phase 4: Rental Hub (Semaine 3-4) ✅ EN COURS
- [x] Formulaire d'ajout de matériel
- [x] Upload d'images multiples
- [x] Catalogue de matériel filtrable
- [x] Page détail équipement
- [x] Système de demande de location
- [ ] Gestion des disponibilités (calendrier)
- [ ] Gestion des locations (approuver/refuser) - OWNER SIDE

### Phase 5: Système de Feedback Obligatoire (Semaine 4-5)
- [ ] Détection automatique de projet terminé
- [ ] Bandeau bloquant Dashboard BDE
- [ ] Formulaire de feedback complet
- [ ] Calcul de la moyenne pondérée
- [ ] Fonction PostgreSQL `calculate_global_score()`
- [ ] Badge "Top Prestataire" (>4.5/5)

### Phase 6: Ranking & Recherche Intelligente (Semaine 5)
- [ ] Algorithme de classement des Orgas
- [ ] Tri par score global
- [ ] Affichage des statistiques (nb avis, moyenne)
- [ ] Intégration du ranking dans la recherche
- [ ] Page profil public avec reviews

### Phase 7: Messagerie Temps Réel (Semaine 6) ❌ SUPPRIMÉE
- ❌ Fonctionnalité retirée du scope (simplification produit)
- Les utilisateurs peuvent communiquer par email/téléphone affichés sur les profils

### Phase 8: Matching IA (Semaine 6-7) ❌ SUPPRIMÉE
- ❌ Dépendait du chat (Phase 7), donc également retirée

### Phase 9: Optimisations & Polish (Semaine 7-8)
- [ ] Performance (lazy loading, ISR)
- [ ] SEO (metadata, sitemap)
- [ ] Animations Framer Motion
- [ ] Responsive design
- [ ] Tests utilisateurs
- [ ] Corrections de bugs

### Phase 10: Déploiement (Semaine 8)
- [ ] Configuration Vercel
- [ ] Variables d'environnement
- [ ] Domaine personnalisé
- [ ] Monitoring et analytics
- [ ] Documentation utilisateur

---

## 🔐 Sécurité (Row Level Security)

### Politiques RLS à implémenter

#### Profiles
```sql
-- Lecture: Public pour les profils ORGA, privé pour BDE
-- Modification: Seulement le propriétaire
```

#### Projects
```sql
-- Lecture: Tous les utilisateurs authentifiés
-- Création: Seulement les BDE
-- Modification: Seulement le créateur
```

#### Inventory
```sql
-- Lecture: Tous les utilisateurs authentifiés
-- Création: BDE et ORGA
-- Modification: Seulement le propriétaire
```

#### Reviews
```sql
-- Lecture: Public
-- Création: Seulement si projet terminé et pas déjà noté
-- Modification: Impossible (immutable)
```

#### Messages
```sql
-- Lecture: Seulement sender ou receiver
-- Création: Utilisateur authentifié
```

---

## 📈 Fonctionnalités Avancées (Post-MVP)

### Monétisation
- [ ] Abonnement "Premium" pour Orgas
- [ ] Placement sponsorisé dans les résultats
- [ ] Commission sur locations de matériel
- [ ] Boost de profil

### Social
- [ ] Système de favoris/watchlist
- [ ] Partage de projets
- [ ] Notifications push
- [ ] Feed d'activité

### Analytics
- [ ] Dashboard statistiques pour BDE
- [ ] Rapports de performance pour Orgas
- [ ] Tracking des locations
- [ ] Analyse des tendances

---

## 🐛 Bugs & Issues Connus

*Aucun pour le moment - Projet en phase d'initialisation*

---

## 📝 Notes de Développement

### Conventions de Code
- **Composants:** PascalCase (ex: `DashboardBDE.tsx`)
- **Fichiers utils:** camelCase (ex: `calculateScore.ts`)
- **CSS:** Tailwind uniquement, pas de CSS custom
- **Types:** Fichier `types/index.ts` centralisé

### Structure des Dossiers
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── bde/
│   │   └── orga/
│   ├── projects/
│   ├── rental/
│   └── messages/
├── components/
│   ├── ui/
│   ├── forms/
│   └── layout/
├── lib/
│   ├── supabase/
│   └── utils/
└── types/
```

---

## ✅ Checklist de Lancement

### Avant Production
- [ ] Toutes les politiques RLS testées
- [ ] Variables d'environnement sécurisées
- [ ] Images optimisées (WebP)
- [ ] Lighthouse score > 90
- [ ] Tests E2E passants
- [ ] Documentation complète
- [ ] Legal (CGU, Politique de confidentialité)

---

**Dernière mise à jour:** 2026-01-31 (22:15)
**Version:** 0.3.0 (Mode Demo complet + Roadmap Chat)
**Statut:** 🚧 En développement actif

---

## 📚 Documentation Complémentaire

- **[ROADMAP_CHAT.md](ROADMAP_CHAT.md)** - 💬 Roadmap détaillée du système de messagerie temps réel avec matching IA (20-25h)
- **[QUICKSTART.md](QUICKSTART.md)** - ⚡ Guide de démarrage rapide (15 minutes)
- **[README.md](README.md)** - 📖 Documentation complète du projet
- **[SETUP_SUPABASE.md](SETUP_SUPABASE.md)** - 🔧 Configuration Supabase étape par étape

---

## 📦 Fichiers Créés (Session Actuelle)

### Configuration & Infrastructure
- [x] `supabase-schema.sql` - Schéma SQL complet avec RLS
- [x] `.env.local.example` - Template des variables d'environnement
- [x] `.env.local` - Variables d'environnement (à configurer)
- [x] `middleware.ts` - Middleware Next.js pour refresh des sessions
- [x] `QUICKSTART.md` - Guide de démarrage rapide
- [x] `README.md` - Documentation complète du projet

### Types & Utilitaires
- [x] `types/index.ts` - Types TypeScript centralisés
- [x] `lib/utils.ts` - Fonctions utilitaires (formatage, validation)
- [x] `lib/supabase/client.ts` - Client Supabase (browser)
- [x] `lib/supabase/server.ts` - Client Supabase (server components)
- [x] `lib/supabase/middleware.ts` - Helper pour middleware

### Design System
- [x] `app/globals.css` - Design Dark Brutalism complet
- [x] `app/layout.tsx` - Layout racine avec Inter font
- [x] `app/page.tsx` - Page d'accueil avec branding KLUB

### Authentification
- [x] `app/(auth)/login/page.tsx` - Page de connexion
- [x] `app/(auth)/signup/page.tsx` - Page d'inscription avec sélection BDE/ORGA

### Structure des Dossiers
```
✅ app/(auth)/login/
✅ app/(auth)/signup/
✅ lib/supabase/
✅ components/ui/
✅ components/forms/
✅ components/layout/
✅ types/
```

---

## ✅ Accomplissements de cette Session

### Phase 1: Infrastructure & Base ✅ COMPLÉTÉ
- [x] Initialiser le projet Next.js 14
- [x] Configurer Supabase (tables, RLS)
- [x] Mettre en place l'authentification
- [x] Créer le layout principal Dark Brutalism
- [x] Implémenter le système de routing

### Phase 2: Profils & Authentification ✅ COMPLÉTÉ
- [x] Page de connexion/inscription
- [x] Formulaire de création de profil (BDE/ORGA)
- [x] Middleware de protection des routes
- [x] Design system Dark Brutalism appliqué

---

## 🎯 Prochaines Priorités

### Immédiat (À faire ensuite)
1. **Dashboard BDE** - Interface principale pour les BDE
2. **Dashboard ORGA** - Interface principale pour les Orgas
3. **Formulaire de création de projet** - Pour les BDE
4. **Page de liste des projets** - Avec filtres et recherche

### Court Terme
5. **Rental Hub** - Catalogue de matériel
6. **Système de feedback** - Formulaire de notation obligatoire
7. **Bandeau bloquant** - Pour les BDE n'ayant pas donné de feedback

---

## 🔧 Configuration Requise pour Lancer le Projet

1. **Créer un projet Supabase**
2. **Exécuter `supabase-schema.sql`** dans SQL Editor
3. **Configurer `.env.local`** avec vos clés
4. **Lancer `npm run dev`**

Voir [QUICKSTART.md](QUICKSTART.md) pour un guide détaillé.

---

**Dernière mise à jour:** 2026-01-22 (19:50)
**Version:** 0.2.0 (Infrastructure complète)
**Statut:** 🚧 En développement actif

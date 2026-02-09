# 📝 KLUB - Changelog

Historique des modifications du projet.

---

## [0.2.1] - 2026-01-22 (20:10)

### 🐛 Corrections

- **SQL:** Corrigé l'erreur `function round(double precision, integer) does not exist`
  - Ajout de casts explicites `::numeric` dans la fonction `calculate_global_score()`
  - Ajout de casts explicites `::numeric` dans la vue `top_orgas`
  - Fichiers affectés : [supabase-schema.sql](supabase-schema.sql) lignes 307 et 632

### 📚 Documentation

- Ajout de [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Guide de dépannage complet
- Ajout de [CHANGELOG.md](CHANGELOG.md) - Historique des modifications

---

## [0.2.0] - 2026-01-22 (19:50)

### ✨ Nouveau

**Infrastructure complète**
- Initialisation Next.js 14 avec App Router
- Configuration Supabase (8 tables, 3 fonctions, 20+ politiques RLS)
- Design system Dark Brutalism complet
- Système d'authentification (login/signup)
- TypeScript avec types complets

**Fichiers créés (20 fichiers) :**
- Documentation : README.md, QUICKSTART.md, claude.md, STATUS.md, PROJECT_SUMMARY.md
- Base de données : supabase-schema.sql
- Application : pages d'accueil, login, signup
- Libraries : clients Supabase, utilitaires, types TypeScript
- Configuration : middleware, .env, tsconfig, etc.

### 🎨 Design

- Palette de couleurs Dark Brutalism (#000000, #7C3AED, #00FF66)
- Classes CSS réutilisables (.brutalist-card, .brutalist-button)
- Typographie Inter
- Scrollbar personnalisée
- Animations CSS

### 🔐 Sécurité

- Row Level Security (RLS) sur toutes les tables
- Politiques strictes par rôle (BDE/ORGA)
- Middleware de refresh des sessions
- Authentification Supabase Auth

### 📊 Base de Données

**8 Tables créées :**
- `profiles` - Profils utilisateurs
- `projects` - Projets d'événements
- `inventory` - Matériel en location
- `rentals` - Demandes de location
- `reviews` - Avis et notations
- `conversations` - Discussions
- `messages` - Messages
- `project_applications` - Candidatures

**3 Fonctions PostgreSQL :**
- `calculate_global_score()` - Calcul du score d'une Orga
- `can_post_new_project()` - Vérification feedback obligatoire
- `auto_complete_projects()` - Complétion automatique

**2 Vues SQL :**
- `top_orgas` - Classement des meilleures Orgas
- `projects_needing_feedback` - Projets sans feedback

---

## [0.1.0] - 2026-01-22 (19:00)

### ✨ Nouveau

- Initialisation du projet
- Génération du prompt complet

---

## 🎯 Prochaines Versions

### [0.3.0] - Dashboard BDE (À venir)
- [ ] Layout du dashboard avec navigation
- [ ] Vue d'ensemble avec statistiques
- [ ] Liste des projets du BDE
- [ ] Bandeau "Feedback obligatoire"
- [ ] Bouton "Créer un projet" (avec blocage)

### [0.4.0] - Formulaire de Projet (À venir)
- [ ] Formulaire multi-étapes
- [ ] Validation des champs
- [ ] Enregistrement en brouillon
- [ ] Publication du projet

### [0.5.0] - Dashboard ORGA (À venir)
- [ ] Layout du dashboard
- [ ] Profil public avec reviews
- [ ] Score global et statistiques
- [ ] Liste des candidatures

### [0.6.0] - Marketplace de Projets (À venir)
- [ ] Liste des projets disponibles
- [ ] Filtres et recherche
- [ ] Page détail d'un projet
- [ ] Système de candidature

### [0.7.0] - Rental Hub (À venir)
- [ ] Catalogue de matériel
- [ ] Filtres par catégorie
- [ ] Upload d'images multiples
- [ ] Calendrier de disponibilité
- [ ] Demande de location

### [0.8.0] - Système de Feedback (À venir)
- [ ] Formulaire de notation (5 critères)
- [ ] Logique de blocage
- [ ] Calcul du score global
- [ ] Badge "Top Prestataire"

### [0.9.0] - Messagerie (À venir)
- [ ] Interface de chat
- [ ] Supabase Realtime
- [ ] Notifications
- [ ] Matching IA

### [1.0.0] - Production (À venir)
- [ ] Optimisations performance
- [ ] Tests E2E
- [ ] SEO
- [ ] Déploiement Vercel

---

## 📌 Conventions de Versioning

Ce projet suit le [Semantic Versioning](https://semver.org/) :

- **MAJOR** (1.0.0) : Changements incompatibles de l'API
- **MINOR** (0.X.0) : Ajout de fonctionnalités rétrocompatibles
- **PATCH** (0.0.X) : Corrections de bugs rétrocompatibles

---

## 🤝 Comment Contribuer

Pour chaque changement :

1. Mettez à jour ce fichier CHANGELOG.md
2. Incrémentez la version dans package.json
3. Créez un commit avec le message : `chore: bump version to X.Y.Z`

---

**Dernière mise à jour :** 2026-01-22

# KLUB - Plateforme Intercommunautaire BDE & Orgas

Plateforme collaborative permettant aux BDE (Bureaux des Étudiants) et aux organisateurs d'événements (Orgas) de collaborer, louer du matériel et s'évaluer mutuellement.

## 🚀 Stack Technique

- **Frontend:** Next.js 14 (App Router)
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Design:** Dark Brutalism

## 📋 Prérequis

- Node.js 18+
- npm ou yarn
- Un compte Supabase

## ⚙️ Installation

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd klub
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer Supabase

#### a) Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Attendez que la base de données soit prête

#### b) Exécuter le schéma SQL

1. Copiez le contenu de [supabase-schema.sql](supabase-schema.sql)
2. Dans Supabase Dashboard, allez dans `SQL Editor`
3. Collez et exécutez le schéma complet
4. Vérifiez que toutes les tables sont créées dans `Table Editor`

#### c) Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
```

Trouvez vos clés dans Supabase Dashboard > Settings > API

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000)

## 📁 Structure du Projet

```
klub/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Page de connexion
│   │   └── signup/         # Page d'inscription
│   ├── dashboard/
│   │   ├── bde/            # Dashboard BDE
│   │   └── orga/           # Dashboard ORGA
│   ├── projects/           # Marketplace de projets
│   ├── rental/             # Rental Hub (matériel)
│   └── messages/           # Messagerie
├── components/
│   ├── ui/                 # Composants UI réutilisables
│   ├── forms/              # Formulaires
│   └── layout/             # Layouts (Header, Nav, etc.)
├── lib/
│   ├── supabase/           # Clients Supabase
│   └── utils.ts            # Fonctions utilitaires
├── types/
│   └── index.ts            # Types TypeScript
├── supabase-schema.sql     # Schéma de base de données
└── claude.md               # Roadmap détaillée
```

## 🎯 Fonctionnalités Principales

### Pour les BDE

- ✅ Créer et publier des projets d'événements
- ✅ Recevoir des candidatures d'Orgas
- ✅ Louer du matériel à d'autres BDE/Orgas
- ✅ Noter les Orgas après collaboration (obligatoire)
- ✅ Mettre du matériel en location

### Pour les ORGA

- ✅ Consulter les projets disponibles
- ✅ Candidater aux projets
- ✅ Louer du matériel
- ✅ Mettre du matériel en location
- ✅ Construire sa réputation via les feedbacks

### Système de Réputation

- Feedback obligatoire après chaque projet terminé
- Notation sur 5 critères (Ponctualité, Qualité, Communication, Rapport Qualité/Prix)
- Badge "Top Prestataire" pour les Orgas >4.5/5
- Algorithme de classement pondéré

## 🔐 Sécurité

- Authentification Supabase Auth
- Row Level Security (RLS) activé sur toutes les tables
- Politiques strictes :
  - Seul le propriétaire peut modifier ses annonces
  - Les feedbacks sont immutables
  - Les messages ne sont visibles que par les participants
  - Les BDE doivent donner un feedback avant de poster un nouveau projet

## 🎨 Design System - Dark Brutalism

### Couleurs

- **Background:** `#000000` (Noir pur)
- **Bordures:** `#1A1A1A` (Fines)
- **Texte:** `#FFFFFF` / `#A0A0A0`
- **Accent Violet:** `#7C3AED`
- **Accent Vert:** `#00FF66`

### Typographie

- Font: Inter
- Bordures: 1px
- Coins: 2-4px max
- Animations: Framer Motion

## 📚 Prochaines Étapes

Consultez le fichier [claude.md](claude.md) pour la roadmap complète et les tâches en cours.

### Phase 1 (Actuelle) ✅
- [x] Setup Next.js 14
- [x] Configuration Supabase
- [x] Système d'authentification
- [x] Design Dark Brutalism
- [ ] Dashboard BDE
- [ ] Rental Hub

### Phase 2
- [ ] Système de feedback obligatoire
- [ ] Algorithme de ranking
- [ ] Messagerie temps réel

### Phase 3
- [ ] Matching IA dans le chat
- [ ] Optimisations et polish
- [ ] Déploiement

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev

# Build production
npm run build

# Démarrer en production
npm start

# Linter
npm run lint

# Générer les types Supabase (après avoir installé la CLI)
npx supabase gen types typescript --project-id "votre-projet-id" > types/supabase.ts
```

## 📖 Documentation

- [Next.js 14](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

## 🤝 Contribution

Ce projet est en développement actif. Pour contribuer :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📝 Licence

MIT

## 🆘 Support

Pour toute question ou problème :

- Consultez le fichier [claude.md](claude.md) pour la documentation détaillée
- Ouvrez une issue sur GitHub
- Consultez la documentation Supabase

---

**Développé avec ❤️ pour la communauté étudiante**

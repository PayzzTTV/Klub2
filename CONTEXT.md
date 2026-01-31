# 🎯 CONTEXT.md - Configuration Projet KLUB

## 📋 Informations Générales

**Nom du projet:** KLUB
**Description:** Plateforme intercommunautaire B2B pour BDE et organisateurs d'événements
**Repository GitHub:** https://github.com/PayzzTTV/Klub
**Statut:** 🚧 En développement actif
**Version:** 0.3.0

---

## 🛠️ Stack Technique

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Design System:** Dark Brutalism

### Backend & Database
- **BaaS:** Supabase
  - PostgreSQL Database
  - Authentication (Email/Password)
  - Storage (Images, Fichiers)
  - Realtime (Chat, Notifications)
  - Row Level Security (RLS)

### Déploiement
- **Hosting:** Vercel
  - Automatic deployments from GitHub
  - Preview deployments for PRs
  - Edge Functions
  - Analytics

### Versioning
- **Git:** GitHub
- **Repository:** https://github.com/PayzzTTV/Klub
- **Branches:**
  - `main` - Production
  - `dev` - Développement
  - `feature/*` - Nouvelles fonctionnalités

---

## 🔐 Configuration des API & Secrets

### Variables d'Environnement (.env.local)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # ⚠️ NEVER COMMIT

# API Tokens (Pattern recommandé)
# $token = config('service.api.token')
NEXT_PUBLIC_API_TOKEN=your_api_token_here # Public API calls
API_SECRET_TOKEN=your_secret_token_here   # Server-side only

# Optional: Third-party APIs
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_... # ⚠️ NEVER COMMIT

# Optional: Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_analytics_id
```

### ⚠️ Règles de Sécurité pour les Tokens

1. **JAMAIS commiter les secrets dans Git**
   - Utiliser `.env.local` (déjà dans `.gitignore`)
   - Utiliser Vercel Environment Variables pour la production

2. **Pattern de configuration recommandé:**
   ```typescript
   // lib/config.ts
   export const config = {
     service: {
       api: {
         token: process.env.API_SECRET_TOKEN || '',
       },
     },
     supabase: {
       url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
       anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
       serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
     },
   };

   // Utilisation:
   const token = config.service.api.token;
   ```

3. **Variables publiques vs privées:**
   - `NEXT_PUBLIC_*` → Accessible côté client (AUCUN secret ici)
   - Sans préfixe → Server-side uniquement (secrets OK)

---

## 🗄️ Configuration Supabase

### Projet Supabase

**Étapes de configuration:**

1. **Créer un projet Supabase**
   - Aller sur https://supabase.com
   - Créer un nouveau projet "KLUB"
   - Région recommandée: EU West (Paris/Frankfurt)

2. **Exécuter le schema SQL**
   ```bash
   # Copier le contenu de supabase-schema.sql
   # Coller dans SQL Editor de Supabase
   # Exécuter tout le script
   ```

3. **Récupérer les clés API**
   - Settings → API
   - Copier `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copier `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copier `service_role` (optionnel) → `SUPABASE_SERVICE_ROLE_KEY`

4. **Configurer Storage**
   ```sql
   -- Créer les buckets
   INSERT INTO storage.buckets (id, name, public) VALUES
     ('avatars', 'avatars', true),
     ('inventory-images', 'inventory-images', true),
     ('application-photos', 'application-photos', true);

   -- Politiques RLS pour Storage
   -- (voir supabase-schema.sql pour les détails)
   ```

### Tables Principales

- `profiles` - Profils BDE et ORGA
- `projects` - Projets d'événements
- `applications` - Candidatures des ORGAs
- `reviews` - Système de feedback obligatoire
- `inventory` - Matériel en location
- `rentals` - Locations de matériel
- `conversations` - Conversations chat
- `messages` - Messages temps réel

---

## 🚀 Déploiement Vercel

### Configuration Projet

**Étapes:**

1. **Connecter GitHub à Vercel**
   - Aller sur https://vercel.com
   - Import Project
   - Sélectionner repository: `PayzzTTV/Klub`
   - Framework: Next.js (détecté automatiquement)

2. **Variables d'environnement Vercel**
   ```
   Settings → Environment Variables

   Production:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - API_SECRET_TOKEN

   Preview (optionnel):
   - Mêmes variables ou env de test
   ```

3. **Build Settings**
   ```bash
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Deploy**
   - Push to `main` → Automatic deployment
   - Push to PR → Preview deployment
   - Custom domain: klub.vercel.app (ou domaine personnalisé)

### Automatic Deployments

**Branches:**
- `main` → Production (https://klub.vercel.app)
- `dev` → Preview (https://klub-dev.vercel.app)
- PR → Preview unique (https://klub-pr-123.vercel.app)

**Workflow:**
```bash
# 1. Développer en local
git checkout dev
npm run dev

# 2. Commit & Push
git add .
git commit -m "feat: add chat system"
git push origin dev

# 3. Create PR dev → main
# Vercel déploie automatiquement une preview

# 4. Merge PR → Déploiement production automatique
```

---

## 📦 GitHub Repository

**URL:** https://github.com/PayzzTTV/Klub

### Structure du Repository

```
Klub/
├── .github/
│   └── workflows/          # CI/CD (optionnel)
├── app/                    # Next.js App Router
│   ├── (auth)/            # Routes authentification
│   ├── (dashboard)/       # Routes dashboard
│   ├── demo/              # Mode demo
│   ├── projects/          # Marketplace projets
│   └── messages/          # Chat (à venir)
├── components/            # Composants React
│   ├── ui/               # Composants UI génériques
│   ├── forms/            # Formulaires
│   └── layout/           # Layout components
├── lib/                  # Utilities
│   ├── supabase/        # Clients Supabase
│   ├── utils.ts         # Helper functions
│   └── config.ts        # Configuration (API tokens)
├── types/               # TypeScript types
├── public/              # Assets statiques
├── supabase-schema.sql  # Schema SQL complet
├── .env.local.example   # Template variables d'environnement
├── .env.local          # Variables locales (GITIGNORED)
├── .gitignore          # Fichiers à ignorer
├── CLAUDE.md           # Documentation principale
├── ROADMAP_CHAT.md     # Roadmap système de chat
├── CONTEXT.md          # Ce fichier
└── README.md           # Documentation utilisateur
```

### Fichiers à NE JAMAIS Commiter

```
.env.local              # Variables d'environnement
.env.production         # Secrets production
.env.development        # Secrets dev
*.key                   # Clés API
*.pem                   # Certificats
node_modules/           # Dépendances npm
.next/                  # Build Next.js
*.log                   # Logs
.DS_Store              # macOS
```

### Commit Guidelines

**Format des commits:**
```bash
feat: add chat system
fix: resolve JSX parsing error
docs: update ROADMAP_CHAT.md
style: apply dark brutalism to cards
refactor: extract form validation logic
test: add unit tests for feedback form
chore: update dependencies
```

**Branches:**
```bash
feature/chat-system
feature/rental-hub
fix/jsx-parsing-error
docs/update-readme
```

---

## 🔒 Sécurité & Best Practices

### 1. Gestion des Secrets

**❌ JAMAIS faire:**
```typescript
// BAD: Token hardcodé
const apiToken = "sk_live_ABC123XYZ";

// BAD: Secret committé dans .env
NEXT_PUBLIC_SECRET_KEY=my_secret_key
```

**✅ TOUJOURS faire:**
```typescript
// GOOD: Utiliser les variables d'environnement
const apiToken = process.env.API_SECRET_TOKEN;

// GOOD: Pattern config centralisé
import { config } from '@/lib/config';
const token = config.service.api.token;
```

### 2. Row Level Security (RLS)

**Toutes les tables Supabase DOIVENT avoir des politiques RLS:**

```sql
-- Exemple: Seul le propriétaire peut modifier son profil
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

### 3. Validation des Inputs

**Côté client ET serveur:**

```typescript
// Client-side validation
const schema = z.object({
  email: z.string().email(),
  message: z.string().min(10).max(500),
});

// Server-side validation (Server Actions/API Routes)
export async function createProject(formData: FormData) {
  const validated = schema.safeParse(formData);
  if (!validated.success) {
    return { error: "Invalid input" };
  }
  // ...
}
```

### 4. Upload de Fichiers

**Validation côté serveur obligatoire:**

```typescript
// Vérifier le type MIME
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}

// Vérifier la taille (max 10MB)
if (file.size > 10 * 1024 * 1024) {
  throw new Error('File too large');
}
```

---

## 📊 Configuration API Tokens

### Pattern Recommandé

```typescript
// lib/config.ts
export const config = {
  service: {
    api: {
      token: process.env.API_SECRET_TOKEN || '',
      publicToken: process.env.NEXT_PUBLIC_API_TOKEN || '',
    },
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  vercel: {
    env: process.env.VERCEL_ENV || 'development', // production | preview | development
    url: process.env.VERCEL_URL || 'localhost:3000',
  },
};

// Validation au démarrage
if (!config.supabase.url) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!config.supabase.anonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY');
}
```

### Utilisation dans le Code

```typescript
// Server Component ou API Route
import { config } from '@/lib/config';

export async function fetchExternalAPI() {
  const response = await fetch('https://api.example.com/data', {
    headers: {
      'Authorization': `Bearer ${config.service.api.token}`,
    },
  });
  return response.json();
}

// Client Component (seulement tokens publics)
import { config } from '@/lib/config';

export function ClientComponent() {
  const publicToken = config.service.api.publicToken;
  // Utiliser seulement pour les appels API publics
}
```

---

## 🎯 Checklist de Déploiement

### Avant le Premier Déploiement

- [ ] Créer projet Supabase
- [ ] Exécuter `supabase-schema.sql`
- [ ] Configurer Storage buckets
- [ ] Tester authentification en local
- [ ] Configurer variables d'environnement Vercel
- [ ] Connecter repository GitHub à Vercel
- [ ] Tester build en local: `npm run build`
- [ ] Push to `main` → Premier déploiement automatique

### Avant Chaque Déploiement

- [ ] Tests locaux passent: `npm run dev`
- [ ] Build local réussit: `npm run build`
- [ ] Aucun secret committé (vérifier avec `git diff`)
- [ ] Variables d'environnement à jour dans Vercel
- [ ] Documentation mise à jour

---

## 📚 Ressources & Documentation

### Documentation Officielle

- **Next.js 14:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs
- **Vercel:** https://vercel.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs

### Documentation Projet

- **[CLAUDE.md](CLAUDE.md)** - Documentation principale et roadmap
- **[ROADMAP_CHAT.md](ROADMAP_CHAT.md)** - Système de messagerie détaillé
- **[QUICKSTART.md](QUICKSTART.md)** - Guide de démarrage rapide (15min)
- **[SESSION_SUMMARY.md](SESSION_SUMMARY.md)** - Résumé de la dernière session
- **[README.md](README.md)** - Documentation utilisateur

---

## 🤝 Contribution

### Workflow de Développement

1. **Clone le repository**
   ```bash
   git clone https://github.com/PayzzTTV/Klub.git
   cd Klub
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.local.example .env.local
   # Éditer .env.local avec vos clés Supabase
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

5. **Créer une branche feature**
   ```bash
   git checkout -b feature/mon-feature
   ```

6. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat: add my feature"
   git push origin feature/mon-feature
   ```

7. **Créer une Pull Request**
   - Aller sur GitHub
   - Create Pull Request: `feature/mon-feature` → `dev`
   - Attendre review et merge

---

## 🐛 Troubleshooting

### Problèmes Courants

**1. "Missing environment variables"**
```bash
# Solution: Copier .env.local.example et configurer
cp .env.local.example .env.local
# Éditer avec vos vraies clés Supabase
```

**2. "Supabase connection failed"**
```bash
# Vérifier les clés dans .env.local
# Vérifier que le projet Supabase est actif
# Tester la connexion: https://YOUR_PROJECT_ID.supabase.co
```

**3. "Vercel build failed"**
```bash
# Vérifier les variables d'environnement dans Vercel Settings
# Vérifier que le build passe en local: npm run build
# Checker les logs Vercel pour l'erreur exacte
```

**4. "RLS policy violation"**
```sql
-- Vérifier les politiques RLS dans Supabase
-- Dashboard → Authentication → Policies
-- Tester les requêtes dans SQL Editor
```

---

**Dernière mise à jour:** 2026-01-31 (23:00)
**Auteur:** Claude Sonnet 4.5
**Status:** ✅ Configuration complète prête pour production

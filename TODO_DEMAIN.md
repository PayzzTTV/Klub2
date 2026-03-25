# KLUB — Todo du 25 Mars 2026

**Dernière session :** 24 Mars 2026
**État du projet :** Phases 1 à 6 complétées ✅ — DevOps actif ✅ — Phase 9 polish avancée ✅
**Prochaine priorité :** Secrets GitHub + CD automatique

---

## 0. Rappel rapide du projet

KLUB = plateforme pour que les BDE et les Orgas collaborent.

| Rôle | Peut faire |
|---|---|
| BDE | Poster des projets, louer du matériel, noter les orgas |
| ORGA | Candidater aux projets, louer/proposer du matériel |

Stack : **Next.js 15 + Supabase + Tailwind + Framer Motion**
URL locale : `npm run dev` → http://localhost:3000

---

## ✅ FAIT (session du 24 Mars)

- `npm install` — toutes les dépendances DevOps installées
- Jest configuré et fonctionnel — **18 tests passent**
- 0 erreur TypeScript
- **34 `alert()`** remplacés par `useToast` dans 9 fichiers
- Pagination ajoutée sur `/projects` (6/page) et `/rental` (9/page)

---

## ÉTAPE 1 — Activer le CD automatique (15 min)

### 1.4 Configurer les secrets GitHub pour le déploiement CD

Dans ton repo GitHub → **Settings → Secrets and variables → Actions** → ajouter :

| Secret | Où le trouver |
|---|---|
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens |
| `VERCEL_ORG_ID` | vercel.com → Settings → General → "Team ID" |
| `VERCEL_PROJECT_ID` | vercel.com → ton projet → Settings → General → "Project ID" |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |

### 1.5 Activer la protection de branche sur GitHub

GitHub → Settings → Branches → Add rule sur `main` :
- [x] Require a pull request before merging
- [x] Require status checks to pass (sélectionner: `quality`, `tests`, `build`)

---

## ÉTAPE 2 — Phase 9 suite : Loading skeletons (optionnel)

> `Skeleton.tsx` et `EmptyState.tsx` existent déjà dans `components/ui/`.
> Ils ne sont pas encore utilisés partout. Si tu veux finir le polish :

Remplacer les spinners basiques par les skeletons dans les pages de dashboard :
- `app/dashboard/bde/page.tsx`
- `app/dashboard/orga/page.tsx`

Pattern :
```tsx
import { CardSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';
if (loading) return <div className="grid ..."><StatCardSkeleton /><StatCardSkeleton /></div>
```

---

## ÉTAPE 3 — Phase 10 : Fonctionnalités supplémentaires (optionnel)

> À faire seulement si l'étape 2 est terminée. Ces features sont des "nice to have".

### Option A — Système de notifications (2-3h)

1. Créer la table dans Supabase :
```sql
CREATE TABLE notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id),
  type text, -- 'application_accepted', 'rental_approved', etc.
  message text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```
2. Badge rouge dans la navbar avec le compte
3. Page `/notifications` avec la liste

### Option B — Upload d'avatar (1-2h)

1. Bucket `avatars` dans Supabase Storage
2. Formulaire dans `/profile/settings`
3. Afficher l'avatar dans la navbar et sur les profils publics

### Option C — Analytics basiques pour BDE/ORGA (2-3h)

Statistiques affichées dans les dashboards :
- Nombre de candidatures reçues ce mois
- Revenus estimés des locations
- Taux d'acceptation des candidatures

---

## Rappel : commandes du quotidien

```bash
# Démarrer le projet
npm run dev

# Avant chaque commit (se fait automatiquement avec Husky)
npm run lint
npm run typecheck

# Lancer les tests
npm run test        # mode watch (développement)
npm run test:ci     # mode CI (tout d'un coup)

# Format d'un commit (obligatoire avec les hooks)
git commit -m "feat(notifications): ajouter badge dans navbar"
git commit -m "fix(rental): corriger affichage calendrier mobile"
git commit -m "test(utils): ajouter tests formatCurrency"
```

---

## État des phases

| Phase | Statut |
|---|---|
| Phase 1 — Infrastructure | ✅ Complétée |
| Phase 2 — Auth & Profils | ✅ Complétée |
| Phase 3 — Marketplace Projets | ✅ Complétée |
| Phase 4 — Rental Hub | ✅ Complétée |
| Phase 5 — Feedback Obligatoire | ✅ Complétée |
| Phase 6 — Ranking | ✅ Complétée |
| Phase 7 — Messagerie | ❌ Supprimée du scope |
| Phase 8 — Matching IA | ❌ Supprimée du scope |
| Phase 9 — Polish & UX | 🔶 En cours (responsive ✅, SEO ✅, toasts ✅, pagination ✅, skeletons partiel) |
| Phase 10 — Déploiement | 🔶 Vercel ✅, secrets GitHub ❌ |
| DevOps CI/CD | ✅ Actif (18 tests, 0 erreur TS) |

---

*Créé le 2026-03-23 — Session DevOps*

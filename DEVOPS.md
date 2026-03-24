# Culture DevOps — KLUB

Ce document décrit les pratiques DevOps appliquées dans ce projet, basées sur le modèle **CALMS** et les **3 Voies**.

---

## Les 3 Voies dans KLUB

### 1ère Voie : Flow (Dev → Production)
> Maximiser le débit, réduire les frictions.

```
Code → Commit → CI (lint + tests + build) → CD → Vercel Production
```

| Pratique | Implémentation |
|---|---|
| CI Pipeline | `.github/workflows/ci.yml` |
| CD Pipeline | `.github/workflows/cd.yml` |
| Build automatisé | `npm run build` |
| Déploiement continu | Vercel via GitHub Actions |

### 2ème Voie : Feedback (Production → Dev)
> Détecter les problèmes le plus tôt possible.

```
Commit → pre-commit hook → CI → Coverage Report → Dev
```

| Pratique | Implémentation |
|---|---|
| Pre-commit lint | Husky + lint-staged |
| Conventional Commits | `.husky/commit-msg` |
| Tests automatisés | Jest + React Testing Library |
| Type checking | `npm run typecheck` |
| Coverage report | `npm run test:coverage` |

### 3ème Voie : Expérimentation Continue
> Apprendre par la pratique, améliorer sans relâche.

| Pratique | Implémentation |
|---|---|
| Feature branches | `git checkout -b feat/ma-feature` |
| Pull Requests | Revue de code obligatoire |
| Tests avant feature | TDD encouragé |
| Pas de `ignoreBuildErrors` | `next.config.ts` corrigé |

---

## CALMS dans KLUB

| Valeur | Application |
|---|---|
| **C**ulture | Conventional Commits, PR reviews, feedback obligatoire |
| **A**utomation | CI/CD, pre-commit hooks, lint automatique |
| **L**ean | Supprimer les étapes manuelles, pipeline streamliné |
| **M**easurement | Coverage reports, métriques CI (Lead Time, MTTR) |
| **S**haring | Code review, documentation, CLAUDE.md |

---

## Workflow de développement

```bash
# 1. Créer une branche feature
git checkout -b feat/ma-fonctionnalite

# 2. Coder avec feedback immédiat
npm run dev        # développement local
npm run typecheck  # vérification TypeScript
npm run lint       # ESLint

# 3. Écrire les tests AVANT de commiter (TDD)
npm run test       # Jest en mode watch

# 4. Commit avec Conventional Commits (validé automatiquement)
git add .
git commit -m "feat(rental): ajouter filtre par catégorie"
# → Husky valide le format + lint-staged nettoie le code

# 5. Push → CI s'exécute automatiquement
git push origin feat/ma-fonctionnalite

# 6. PR → Review → Merge → CD déploie en production
```

---

## Conventional Commits

Format : `type(scope): message`

| Type | Usage |
|---|---|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `docs` | Documentation uniquement |
| `refactor` | Refactoring (ni feat, ni fix) |
| `test` | Ajout/modification de tests |
| `chore` | Maintenance (build, dépendances) |
| `ci` | Changements CI/CD |
| `perf` | Amélioration performance |

Exemples :
```
feat(auth): ajouter connexion Google OAuth
fix(rental): corriger calcul prix location multi-jours
test(utils): ajouter tests needsFeedback
ci: ajouter pipeline CD Vercel
docs: mettre à jour QUICKSTART
```

---

## Scripts disponibles

```bash
npm run dev           # Serveur de développement
npm run build         # Build production (TS + ESLint activés)
npm run typecheck     # Vérification TypeScript seule
npm run lint          # ESLint
npm run lint:fix      # ESLint avec auto-fix
npm run test          # Tests en mode watch
npm run test:ci       # Tests + coverage (pour CI)
npm run test:coverage # Rapport de coverage
```

---

## Configuration des secrets GitHub

Pour le déploiement CD, configurer dans GitHub > Settings > Secrets :

| Secret | Description |
|---|---|
| `VERCEL_TOKEN` | Token API Vercel |
| `VERCEL_ORG_ID` | ID de l'organisation Vercel |
| `VERCEL_PROJECT_ID` | ID du projet Vercel |
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase |

---

## Métriques DevOps cibles

| Métrique | Cible | Mesure |
|---|---|---|
| **Lead Time** | < 2 jours | Temps PR → Production |
| **Deployment Frequency** | Quotidien | Déploiements/semaine |
| **MTTR** | < 1h | Temps correction bug critique |
| **Change Failure Rate** | < 10% | % déploiements avec rollback |
| **Coverage** | > 50% | Jest coverage report |

---

## Théorie des Contraintes (TOC) appliquée

Identifier les goulots d'étranglement actuels :

1. **Contrainte identifiée** : Tests manuels = feedback lent
   → **Solution** : Tests automatisés Jest (implémenté)

2. **Contrainte identifiée** : Erreurs TypeScript ignorées = bugs en prod
   → **Solution** : `ignoreBuildErrors: false` (corrigé)

3. **Contrainte identifiée** : Pas de pipeline CI = intégration manuelle
   → **Solution** : GitHub Actions CI/CD (implémenté)

---

*Dernière mise à jour : 2026-03-23*
*Basé sur le modèle CALMS + 3 Voies DevOps*

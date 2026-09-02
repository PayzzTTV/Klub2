# Base de données KLUB

## Structure

```
supabase/
├── migrations/   ← source de vérité, appliquée dans l'ordre des noms
└── archive/      ← anciens scripts, conservés pour référence, NE PAS EXÉCUTER
```

## Pourquoi ce dossier existe (KLB-16)

Onze fichiers `.sql` mutuellement contradictoires vivaient à la racine du dépôt,
sans ordre d'application ni historique. Il était impossible de déterminer quelles
policies étaient réellement en vigueur — ce qui empêchait d'affirmer quoi que ce
soit sur la sécurité de la base.

Ces fichiers sont désormais dans `archive/`. **Ils ne doivent plus être
exécutés** : plusieurs contiennent des policies aujourd'hui remplacées, et
`supabase-disable-rls-dev.sql` (supprimé) désactivait intégralement le RLS.

## Migrations

| Fichier | Corrige | Objet |
|---|---|---|
| `20260903120000_rls_require_authentication.sql` | KLB-01 | Toutes les policies restreintes `TO authenticated` ; `anon` perd tout privilège sur le schéma public |
| `20260903120100_lock_privileged_columns.sql` | KLB-02, KLB-05 | Privilèges colonne : `role`, `verified`, `feedback_given`, `total_price`, `owner_id` non modifiables par le client |
| `20260903120200_business_invariants.sql` | KLB-04, KLB-06, KLB-07 | Prix et propriétaire dérivés en base, transitions de statut cloisonnées, avis rattachés à une collaboration réelle |
| `20260903120300_harden_functions.sql` | KLB-13 | `search_path` figé sur les fonctions `SECURITY DEFINER` |

## Appliquer

```bash
supabase link --project-ref <votre-project-ref>
supabase db push
```

À défaut de CLI, exécuter les quatre fichiers **dans l'ordre des noms** depuis
l'éditeur SQL Supabase.

## Vérifier après application

```sql
-- 1. Plus aucune policy ouverte à anon / public  (attendu : 0 ligne)
SELECT tablename, policyname, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND ('anon' = ANY(roles) OR 'public' = ANY(roles));

-- 2. RLS actif partout  (attendu : rowsecurity = true sur 8 lignes)
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' ORDER BY tablename;

-- 3. profiles.role non modifiable  (attendu : aucune ligne UPDATE)
SELECT grantee, privilege_type FROM information_schema.column_privileges
WHERE table_name = 'profiles' AND column_name = 'role';

-- 4. Les fonctions SECURITY DEFINER ont un search_path figé  (attendu : 3/3)
SELECT proname, proconfig FROM pg_proc
WHERE pronamespace = 'public'::regnamespace AND prosecdef;
```

## Points restants, à décider côté produit

- **Contact des membres.** Email et téléphone restent lisibles par tout compte
  authentifié : la messagerie ayant été retirée du scope, c'est le mécanisme de
  mise en relation prévu. Les gater derrière une candidature acceptée serait un
  durcissement supplémentaire, mais c'est un changement de produit.
- **Rôle déclaré au signup.** Le rôle est choisi par l'utilisateur à
  l'inscription puis devient immuable. Rien ne vérifie qu'un compte « BDE » est
  bien un BDE — une validation par domaine email ou une revue manuelle serait à
  envisager.

# 🔒 KLUB — Audit de sécurité

**Date de l'audit :** 3 septembre 2026
**Commit audité :** `a3573d1` (main)
**Méthode :** analyse statique du code, des fichiers SQL et de l'historique git
**Statut :** ⚠️ correctifs appliqués côté code — **migrations en attente d'application en base**

> ### Ce document remplace la version du 9 février 2026
>
> La version précédente concluait « ✅ SÉCURISÉ — Failles potentielles : ❌ AUCUNE »
> pour les tables `profiles` et `projects`. Cette conclusion était fausse : ces deux
> tables portaient trois des défauts critiques listés ci-dessous. Un audit qui se
> déclare conforme sans l'être est plus dangereux qu'une absence d'audit — c'est
> le constat KLB-17.

---

## Le point structurant

L'application n'expose **aucune route API**. Chaque lecture et chaque écriture part
du navigateur avec la clé `anon`, publique par construction puisqu'elle est servie
dans le bundle JavaScript. **Le RLS PostgreSQL est donc l'unique frontière de
sécurité.** Toute validation écrite en TypeScript est indicative : elle se contourne
par un appel direct à PostgREST.

Corollaire pratique : un invariant métier qui n'est pas exprimé en contrainte,
policy ou trigger PostgreSQL n'est pas un invariant.

---

## Constats

Sévérité : 🔴 critique · 🟠 élevé · 🟡 moyen · ⚪ faible

| ID | Sév. | Constat | État |
|---|---|---|---|
| KLB-01 | 🔴 | Toutes les policies s'appliquaient au rôle `anon` : aspiration des emails et téléphones de tous les ORGA sans compte | ✅ corrigé (migration) |
| KLB-02 | 🔴 | Élévation ORGA → BDE en une requête (`update({ role: 'BDE' })`) | ✅ corrigé (migration) |
| KLB-03 | 🔴 | Clé `service_role` en clair dans `.test-accounts` | ⚠️ retirée du disque — **rotation à faire** |
| KLB-04 | 🟠 | Le locataire fixait `total_price` et `owner_id`, et approuvait sa propre location | ✅ corrigé (migration + code) |
| KLB-05 | 🟠 | `feedback_given` modifiable par le client : feedback obligatoire contournable | ✅ corrigé (migration + code) |
| KLB-06 | 🟠 | Un avis pouvait viser un ORGA étranger au projet : classement falsifiable | ✅ corrigé (migration) |
| KLB-07 | 🟠 | La « SERVER-SIDE VALIDATION » s'exécutait dans le navigateur | ✅ corrigé (trigger) |
| KLB-08 | 🟡 | `ignoreBuildErrors` et `ignoreDuringBuilds` masquaient toute régression | ✅ corrigé |
| KLB-09 | 🟡 | 16 CVE npm dont 12 hautes, aucune veille | ✅ 14/16 corrigées, veille en place |
| KLB-10 | 🟡 | Aucun en-tête de sécurité HTTP | ✅ corrigé, vérifié en exécution |
| KLB-11 | 🟡 | Le middleware ne protégeait aucune route | ✅ corrigé, vérifié en exécution |
| KLB-12 | 🟡 | `supabase-disable-rls-dev.sql` présent au dépôt | ✅ supprimé |
| KLB-13 | 🟡 | `SECURITY DEFINER` sans `search_path` figé | ✅ corrigé (migration) |
| KLB-14 | 🟡 | Bypass d'auth `localStorage.dev_authenticated` livré en production | ✅ supprimé |
| KLB-15 | 🟡 | Mot de passe : 6 caractères, sous les exigences du CLAUDE.md | ⚠️ front à 12 — **politique Supabase à régler** |
| KLB-16 | ⚪ | Onze fichiers SQL contradictoires, aucune migration | ✅ corrigé (`supabase/migrations/`) |
| KLB-17 | ⚪ | Audit précédent trompeur | ✅ ce document |
| KLB-18 | ⚪ | Secret serveur dans un module partagé | ✅ corrigé (`lib/config.server.ts`) |
| KLB-19 | ⚪ | Clé `anon` dans l'historique git (publique par nature) | ℹ️ sans impact propre |
| KLB-20 | ⚪ | Aucune journalisation ni alerte | ❌ non traité |

**Rapport détaillé, avec chaînes d'exploitation et correctifs commentés :**
https://claude.ai/code/artifact/3de31ee3-5c15-4e93-9893-0dfac48efd89

---

## Ce qui a été vérifié et jugé conforme

- **Supabase Storage** — buckets cloisonnés par `auth.uid()` en premier segment de
  chemin, limites de taille, liste blanche de types MIME, `WITH CHECK` symétrique.
- **XSS** — aucun `dangerouslySetInnerHTML`, `innerHTML`, `eval` ni `new Function`.
- **Injection SQL** — tout passe par le query builder paramétré de `supabase-js`.
- **Immuabilité des avis** — aucune policy `UPDATE`/`DELETE` sur `reviews` ; RLS
  refuse par défaut. Contraintes `no_self_review` et `one_review_per_project`.
- **Isolation des conversations** — `EXISTS` sur `conversations` vérifiant la
  participation, et `auth.uid() = sender_id` à l'insertion.
- **Historique git** — aucune clé `service_role` n'a jamais été committée
  (vérifié par `git log -S` sur l'ensemble des révisions). Le `.gitignore` a tenu.
- **Clause `WITH CHECK` implicite** — les anciennes policies `UPDATE` l'omettaient,
  mais PostgreSQL réutilise alors l'expression `USING` pour les nouvelles valeurs.
  Ce n'était **pas** une faille ; les nouvelles policies l'explicitent quand même.

---

## Actions restant à votre main

Ces trois points ne peuvent pas être appliqués depuis le dépôt.

### 1. Appliquer les migrations (KLB-01, 02, 04, 05, 06, 07, 13)

Tant que ce n'est pas fait, **les trois constats critiques restent ouverts en
production**. Le code applicatif est déjà aligné sur le comportement d'après
migration.

```bash
supabase link --project-ref <votre-project-ref>
supabase db push
```

Requêtes de vérification : voir [`supabase/README.md`](supabase/README.md).

### 2. Révoquer la clé `service_role` (KLB-03)

La clé a été retirée de `.test-accounts`, mais **elle reste valide**. Rotation dans
`Supabase Dashboard > Settings > API > Rotate service_role`. Changer aussi les mots
de passe des deux comptes de test, qui figuraient dans le même fichier.

### 3. Politique de mot de passe (KLB-15)

Le formulaire exige désormais 12 caractères, mais un attribut HTML se contourne.
Dans `Supabase > Authentication > Policies` : longueur minimale 12, exiger
lettres + chiffres + symboles, activer la vérification contre les mots de passe
compromis (HaveIBeenPwned).

---

## Décisions produit ouvertes

Ces points ne sont pas des défauts, mais des arbitrages à trancher.

- **Contact des membres.** Email et téléphone restent lisibles par tout compte
  authentifié. La messagerie ayant été retirée du scope, c'est le mécanisme de mise
  en relation prévu. Les gater derrière une candidature acceptée ou une location
  approuvée réduirait la surface de scraping interne.
- **Rôle déclaré au signup.** Le rôle est choisi à l'inscription puis devient
  immuable. Rien ne vérifie qu'un compte « BDE » en est réellement un — une
  validation par domaine email ou une revue manuelle serait à envisager.
- **Next.js 16.** Deux CVE subsistent, sur un `postcss` transitif de *build*. Les
  corriger impose un passage en majeure, avec migration et tests de non-régression.
  Toutes les advisories *runtime* de Next.js (bypass middleware, cache poisoning,
  SSRF, XSS nonce CSP) sont déjà corrigées en 15.5.25.
- **Journalisation (KLB-20).** Aucune alerte n'existe : une aspiration de la table
  `profiles` passerait inaperçue. À brancher sur les logs Supabase / Vercel.

---

## Garde-fous automatisés mis en place

- `npm audit --audit-level=high` bloquant en CI.
- Scan de secrets `gitleaks` sur l'historique complet.
- [`scripts/check-rls-policies.py`](scripts/check-rls-policies.py) — refuse toute
  `CREATE POLICY` dépourvue de `TO authenticated` (le défaut KLB-01 ne peut plus
  être réintroduit sans que la CI échoue).
- Dependabot hebdomadaire sur npm et les GitHub Actions.
- Le job `build` dépend désormais du job `security`.

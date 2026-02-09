# ✅ Correction Appliquée - Schéma SQL

**Date :** 2026-01-22 20:10
**Version :** 0.2.1
**Fichier affecté :** [supabase-schema.sql](supabase-schema.sql)

---

## 🐛 Problème Identifié

### Erreur Supabase
```sql
ERROR: 42883: function round(double precision, integer) does not exist
LINE 632: ROUND(AVG(r.global_rating) * LN(COUNT(r.id) + 1), 2)
HINT: No function matches the given name and argument types. You might need to add explicit type casts.
```

### Cause
PostgreSQL ne trouve pas automatiquement la fonction `ROUND()` pour les résultats de `LN()` qui retourne un type `double precision`. Il faut caster explicitement le résultat en `numeric`.

---

## ✅ Corrections Appliquées

### 1. Fonction `calculate_global_score()` (Ligne 307)

**Avant :**
```sql
ROUND(AVG(global_rating) * LN(COUNT(*) + 1), 2) as weighted_score
```

**Après :**
```sql
ROUND((AVG(global_rating) * LN(COUNT(*) + 1))::numeric, 2) as weighted_score
```

### 2. Vue `top_orgas` (Ligne 632)

**Avant :**
```sql
ROUND(AVG(r.global_rating), 2) as average_rating,
COUNT(r.id) as total_reviews,
ROUND(AVG(r.global_rating) * LN(COUNT(r.id) + 1), 2) as weighted_score
```

**Après :**
```sql
ROUND(AVG(r.global_rating)::numeric, 2) as average_rating,
COUNT(r.id)::integer as total_reviews,
ROUND((AVG(r.global_rating) * LN(COUNT(r.id) + 1))::numeric, 2) as weighted_score
```

---

## 🚀 Prochaines Étapes

### Si vous n'avez pas encore exécuté le schéma SQL

1. Allez sur Supabase Dashboard > SQL Editor
2. Copiez **tout** le contenu de [supabase-schema.sql](supabase-schema.sql)
3. Collez et exécutez
4. Vérifiez qu'il n'y a plus d'erreurs

### Si vous avez déjà exécuté l'ancien schéma SQL

Vous devez recréer les fonctions et vues corrigées :

#### Option A : Tout réexécuter (Recommandé)

```sql
-- 1. Supprimer les objets existants
DROP VIEW IF EXISTS top_orgas CASCADE;
DROP VIEW IF EXISTS projects_needing_feedback CASCADE;
DROP FUNCTION IF EXISTS calculate_global_score(UUID) CASCADE;

-- 2. Réexécuter tout le schéma
-- (Copiez et collez TOUT le contenu de supabase-schema.sql)
```

#### Option B : Seulement les corrections

Exécutez ces commandes dans SQL Editor :

```sql
-- 1. Recréer la fonction calculate_global_score
CREATE OR REPLACE FUNCTION calculate_global_score(orga_uuid UUID)
RETURNS TABLE (
  average_rating NUMERIC,
  total_reviews INTEGER,
  punctuality_avg NUMERIC,
  quality_avg NUMERIC,
  communication_avg NUMERIC,
  value_avg NUMERIC,
  weighted_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(global_rating), 2) as average_rating,
    COUNT(*)::INTEGER as total_reviews,
    ROUND(AVG(punctuality_rating), 2) as punctuality_avg,
    ROUND(AVG(quality_rating), 2) as quality_avg,
    ROUND(AVG(communication_rating), 2) as communication_avg,
    ROUND(AVG(value_rating), 2) as value_avg,
    ROUND((AVG(global_rating) * LN(COUNT(*) + 1))::numeric, 2) as weighted_score
  FROM reviews
  WHERE reviewee_id = orga_uuid;
END;
$$ LANGUAGE plpgsql;

-- 2. Recréer la vue top_orgas
DROP VIEW IF EXISTS top_orgas;

CREATE OR REPLACE VIEW top_orgas AS
SELECT
  p.id,
  p.name,
  p.organization_name,
  p.avatar_url,
  p.location,
  ROUND(AVG(r.global_rating)::numeric, 2) as average_rating,
  COUNT(r.id)::integer as total_reviews,
  ROUND((AVG(r.global_rating) * LN(COUNT(r.id) + 1))::numeric, 2) as weighted_score
FROM profiles p
INNER JOIN reviews r ON r.reviewee_id = p.id
WHERE p.role = 'ORGA'
GROUP BY p.id
HAVING AVG(r.global_rating) >= 4.5 AND COUNT(r.id) >= 5
ORDER BY weighted_score DESC;
```

---

## ✅ Vérification

Pour vérifier que tout fonctionne :

```sql
-- Test 1: Vérifier que la fonction existe
SELECT calculate_global_score('00000000-0000-0000-0000-000000000000');
-- Devrait retourner une ligne avec des valeurs NULL (car pas d'avis pour cet UUID fictif)

-- Test 2: Vérifier que la vue existe
SELECT * FROM top_orgas LIMIT 5;
-- Devrait retourner 0 lignes (car pas encore de reviews dans la DB)
```

---

## 📚 Documentation Mise à Jour

- ✅ [supabase-schema.sql](supabase-schema.sql) - Schéma corrigé
- ✅ [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Guide de dépannage ajouté
- ✅ [CHANGELOG.md](CHANGELOG.md) - Historique des modifications
- ✅ [STATUS.md](STATUS.md) - Version mise à jour (0.2.1)

---

## 🆘 Besoin d'Aide ?

Si vous rencontrez d'autres erreurs :

1. Consultez [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Vérifiez que toutes les tables existent dans Table Editor
3. Vérifiez que RLS est activé sur toutes les tables

---

**Status :** ✅ Correction appliquée et documentée
**Prochaine étape :** Développer le Dashboard BDE

---

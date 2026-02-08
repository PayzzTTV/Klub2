# ✅ TODO - À Faire Demain (9 Février 2026)

## 🔴 PRIORITÉ 1 : Fixer le Bug RLS (5 minutes)

### Problème Actuel
```
Error fetching project applications: {}
```

### Solution
Exécuter ce SQL dans Supabase SQL Editor :

```sql
-- Désactiver le RLS sur toutes les tables (MODE DEV)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE inventory DISABLE ROW LEVEL SECURITY;
ALTER TABLE rentals DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

-- Vérifier que tout est désactivé
SELECT tablename, rowsecurity
FROM pg_tables
WHERE table_schema = 'public'
ORDER BY tablename;
```

### Vérification
- Toutes les tables doivent avoir `rowsecurity = false`
- Rafraîchir http://localhost:3002/demo/projects/[un-id-de-projet]
- L'erreur doit disparaître

---

## 🟡 PRIORITÉ 2 : Créer Données de Test (15 minutes)

### 2.1 Créer 2 Comptes ORGA

**Via Supabase Dashboard → Authentication → Users → Add user**

Compte ORGA 1 :
- Email: `orga1@test.com`
- Password: `password123`
- ✅ **COCHER "Auto Confirm User"**

Compte ORGA 2 :
- Email: `orga2@test.com`
- Password: `password123`
- ✅ **COCHER "Auto Confirm User"**

Puis exécuter ce SQL :
```sql
-- Mettre à jour les profils des ORGA
UPDATE profiles
SET
  role = 'ORGA',
  name = 'ORGA Test 1',
  organization_name = 'SoundPro Events'
WHERE email = 'orga1@test.com';

UPDATE profiles
SET
  role = 'ORGA',
  name = 'ORGA Test 2',
  organization_name = 'LightMasters'
WHERE email = 'orga2@test.com';

-- Vérifier
SELECT email, role, name, organization_name FROM profiles;
```

### 2.2 Créer 5 Équipements

```sql
-- ID du compte orga1@test.com (à adapter)
-- Récupérer l'ID : SELECT id FROM profiles WHERE email = 'orga1@test.com';

INSERT INTO inventory (owner_id, category, title, description, daily_price, quantity, available, location)
VALUES
-- Équipement 1 : Sono
(
  (SELECT id FROM profiles WHERE email = 'orga1@test.com'),
  'Son',
  'Enceintes JBL EON615 (Paire)',
  'Paire d''enceintes amplifiées 1000W. Parfait pour soirées jusqu''à 300 personnes.',
  150.00,
  2,
  true,
  'Paris'
),
-- Équipement 2 : Lumière
(
  (SELECT id FROM profiles WHERE email = 'orga1@test.com'),
  'Lumière',
  'Pack 4 Lyres LED Moving Head',
  '4 lyres LED RGB avec contrôle DMX. Idéal pour créer une ambiance lumineuse professionnelle.',
  200.00,
  1,
  true,
  'Paris'
),
-- Équipement 3 : Image
(
  (SELECT id FROM profiles WHERE email = 'orga2@test.com'),
  'Image',
  'Vidéoprojecteur 4K 5000 Lumens',
  'Projecteur haute définition pour conférences et événements. Écran jusqu''à 10m.',
  120.00,
  1,
  true,
  'Lyon'
),
-- Équipement 4 : Logistique
(
  (SELECT id FROM profiles WHERE email = 'orga2@test.com'),
  'Logistique',
  'Barrières de sécurité (x20)',
  'Lot de 20 barrières de sécurité pour contrôle de foule. Métal robuste.',
  80.00,
  20,
  true,
  'Lyon'
),
-- Équipement 5 : Son
(
  (SELECT id FROM profiles WHERE email = 'orga1@test.com'),
  'Son',
  'Table de mixage Behringer X32',
  'Console numérique 32 canaux. Parfaite pour concerts et festivals.',
  180.00,
  1,
  true,
  'Paris'
);

-- Vérifier
SELECT id, title, category, daily_price, available FROM inventory;
```

### 2.3 Créer 2 Candidatures

```sql
-- Candidature 1 : ORGA1 postule à un projet BDE
INSERT INTO project_applications (project_id, orga_id, message, proposed_price, status)
VALUES (
  (SELECT id FROM projects LIMIT 1),  -- Premier projet
  (SELECT id FROM profiles WHERE email = 'orga1@test.com'),
  'Bonjour, je suis intéressé par votre projet. Nous avons 5 ans d''expérience dans l''organisation de galas. Notre équipe compte 10 personnes qualifiées.',
  4500.00,
  'pending'
);

-- Candidature 2 : ORGA2 postule au même projet
INSERT INTO project_applications (project_id, orga_id, message, proposed_price, status)
VALUES (
  (SELECT id FROM projects LIMIT 1),  -- Premier projet
  (SELECT id FROM profiles WHERE email = 'orga2@test.com'),
  'Nous sommes spécialisés dans les événements étudiants depuis 8 ans. Nous proposons un package complet son + lumière.',
  3800.00,
  'pending'
);

-- Vérifier
SELECT * FROM project_applications;
```

---

## 🟢 PRIORITÉ 3 : Tester le Flow Complet (20 minutes)

### Test 1 : Compte BDE
1. Se connecter avec `bde1@test.com` / `password123`
2. Dashboard BDE doit afficher les 7 projets
3. Cliquer sur "Créer un projet"
4. Remplir le formulaire et publier
5. Vérifier que le nouveau projet apparaît dans le dashboard
6. Cliquer sur un projet → voir les 2 candidatures

### Test 2 : Compte ORGA
1. Se déconnecter
2. Se connecter avec `orga1@test.com` / `password123`
3. Voir la liste des projets disponibles
4. Cliquer sur un projet → "Postuler"
5. Remplir le formulaire de candidature
6. Vérifier que la candidature apparaît dans la base

### Test 3 : Rental (Location)
1. Aller sur `/demo/rental`
2. Voir les 5 équipements créés
3. Filtrer par catégorie
4. Cliquer sur un équipement → voir les détails

---

## 🔵 PRIORITÉ 4 : Migrer Pages Restantes (1-2 heures)

### Page 1 : Apply to Project (`/demo/projects/[id]/apply`)
- Activer l'authentification
- Connecter au formulaire de candidature
- Créer l'application dans `project_applications`

### Page 2 : Feedback (`/demo/feedback/[projectId]`)
- Activer l'authentification
- Formulaire de notation (5 critères)
- Insérer dans table `reviews`
- Marquer `feedback_given = true` sur le projet

### Page 3 : Rental Detail (`/demo/rental/[id]`)
- Afficher les détails de l'équipement
- Bouton "Louer" → créer demande de location
- Insérer dans table `rentals`

---

## 📋 Checklist Complète

### Matin (30 min)
- [ ] ☕ Café
- [ ] 🔴 Exécuter script SQL RLS
- [ ] 🔴 Vérifier que l'erreur disparaît
- [ ] 🟡 Créer 2 comptes ORGA
- [ ] 🟡 Créer 5 équipements
- [ ] 🟡 Créer 2 candidatures
- [ ] 🟢 Tester flow BDE
- [ ] 🟢 Tester flow ORGA

### Après-midi (1-2h)
- [ ] 🔵 Migrer page Apply
- [ ] 🔵 Migrer page Feedback
- [ ] 🔵 Migrer page Rental Detail
- [ ] 🟢 Tester tout le flow complet
- [ ] 📦 Commit + Push version 0.6.0

---

## 🎯 Objectif de la Journée

**Finir la Phase 3 : Migration Supabase à 100%**

À la fin de la journée :
- ✅ Toutes les pages principales migrées
- ✅ Données de test complètes
- ✅ Flow BDE → ORGA → Candidature → Feedback fonctionnel
- ✅ Prêt pour Phase 4 (Messagerie temps réel)

---

**Bon courage pour demain ! 💪🚀**

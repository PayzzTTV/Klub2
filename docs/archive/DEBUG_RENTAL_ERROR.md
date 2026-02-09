# 🐛 Debug: Erreur Création de Location

## Problème Identifié

Erreur lors de la création d'une demande de location via `/rental/[id]` → bouton "Envoyer la demande".

### Erreur Console
```
Error creating rental request: {}
```

---

## 🔍 Diagnostic

### Causes Possibles

1. **Politiques RLS (Row Level Security)** 🔴 PROBABLE
   - La policy `"Users can create rental requests"` n'autorise que si `auth.uid() = renter_id`
   - Vérifie que le `currentUserId` est correctement récupéré

2. **Données Manquantes**
   - `owner_id` ou `renter_id` invalide
   - `item_id` invalide
   - Dates mal formatées

3. **Problème Auth**
   - User pas connecté
   - Session expirée

---

## ✅ Améliorations Apportées

### 1. Logging Détaillé
**Fichier:** `lib/utils/rentals.ts`

```typescript
if (error) {
  console.error('Error creating rental request:', {
    message: error.message,
    details: error.details,
    hint: error.hint,
    code: error.code,
    full: error
  });
  return null;
}
```

### 2. Message d'Erreur Amélioré
**Fichier:** `app/rental/[id]/page.tsx`

```typescript
if (!rental) {
  alert('❌ Erreur lors de l\'envoi de la demande.\n\n' +
        'Veuillez vérifier:\n' +
        '- Que vous êtes bien connecté\n' +
        '- Que les dates sont valides\n' +
        '- Que l\'équipement est disponible\n\n' +
        'Consultez la console (F12) pour plus de détails.');
  return;
}
```

---

## 🧪 Comment Tester

### 1. Ouvre la Console Développeur
```
Appuie sur F12 dans ton navigateur
Onglet "Console"
```

### 2. Reproduis l'Erreur
```
1. Va sur /rental
2. Clique sur un équipement
3. Clique "📅 Réserver maintenant"
4. Remplis les dates
5. Coche "J'accepte"
6. Clique "Envoyer la demande"
```

### 3. Lis les Détails dans la Console
Tu devrais maintenant voir:
```
Error creating rental request: {
  message: "...",  // Message d'erreur
  details: "...",  // Détails techniques
  hint: "...",     // Suggestion de fix
  code: "...",     // Code d'erreur
  full: {...}      // Objet complet
}
```

---

## 🔧 Solutions Selon l'Erreur

### Erreur: "new row violates row-level security policy"

**Cause:** RLS policy rejette l'insertion

**Solution:**
```sql
-- Vérifier que la policy existe
SELECT * FROM pg_policies
WHERE tablename = 'rentals'
AND policyname = 'Users can create rental requests';

-- Si elle existe, vérifier qu'elle est bien:
CREATE POLICY "Users can create rental requests"
  ON rentals FOR INSERT
  WITH CHECK (auth.uid() = renter_id);
```

**Fix rapide:**
```sql
-- Supprimer l'ancienne policy
DROP POLICY IF EXISTS "Users can create rental requests" ON rentals;

-- Recréer la policy correctement
CREATE POLICY "Users can create rental requests"
  ON rentals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = renter_id);
```

---

### Erreur: "null value in column ... violates not-null constraint"

**Cause:** Un champ obligatoire est `null`

**Champs obligatoires dans `rentals`:**
- `item_id` (UUID)
- `renter_id` (UUID)
- `owner_id` (UUID)
- `start_date` (timestamp)
- `end_date` (timestamp)
- `total_price` (numeric)
- `status` (enum)

**Solution:**
Vérifie dans la console que tous ces champs ont une valeur:
```typescript
console.log('Rental data:', {
  item_id: equipmentId,
  renter_id: currentUserId,
  owner_id: equipment.owner_id,
  start_date: bookingData.startDate,
  end_date: bookingData.endDate,
  total_price: totalPrice,
});
```

---

### Erreur: "foreign key constraint fails"

**Cause:** `item_id`, `renter_id` ou `owner_id` référence un ID qui n'existe pas

**Solution:**
Vérifie que:
```sql
-- L'équipement existe
SELECT id FROM inventory WHERE id = 'ton-item-id';

-- Le renter existe
SELECT id FROM profiles WHERE id = 'ton-renter-id';

-- Le owner existe
SELECT id FROM profiles WHERE id = 'ton-owner-id';
```

---

### Erreur: "invalid input syntax for type uuid"

**Cause:** Un des UUID est malformé

**Solution:**
Les UUID doivent être au format: `12345678-1234-1234-1234-123456789abc`

Vérifie dans la console:
```typescript
console.log('UUID Check:', {
  equipmentId: equipmentId,  // Doit être un UUID
  currentUserId: currentUserId,  // Doit être un UUID
  ownerId: equipment.owner_id,  // Doit être un UUID
});
```

---

## 🛠️ Debug Step-by-Step

### Étape 1: Vérifier l'Auth
```typescript
// Dans app/rental/[id]/page.tsx, ajoute ceci avant handleSubmitBooking
console.log('Current User ID:', currentUserId);

const { data: { user } } = await supabase.auth.getUser();
console.log('Auth User:', user);
```

### Étape 2: Vérifier les Données
```typescript
// Au début de handleSubmitBooking
console.log('Booking Data:', {
  equipmentId,
  currentUserId,
  owner_id: equipment.owner_id,
  startDate: bookingData.startDate,
  endDate: bookingData.endDate,
  totalPrice,
  days
});
```

### Étape 3: Tester la Query Manuellement
```sql
-- Dans Supabase SQL Editor
INSERT INTO rentals (
  item_id,
  renter_id,
  owner_id,
  start_date,
  end_date,
  total_price,
  status
) VALUES (
  'ton-item-id',      -- Remplace par un vrai ID
  'ton-renter-id',    -- Remplace par un vrai ID
  'ton-owner-id',     -- Remplace par un vrai ID
  '2026-02-10',
  '2026-02-12',
  300,
  'pending'
);
```

Si cette query échoue, tu verras l'erreur exacte.

---

## 📊 Checklist de Vérification

Avant de créer une location, vérifie:

- [ ] User est connecté (`currentUserId` n'est pas null)
- [ ] `equipmentId` est un UUID valide
- [ ] `equipment.owner_id` existe et est différent de `currentUserId`
- [ ] `startDate` et `endDate` sont au bon format (YYYY-MM-DD)
- [ ] `startDate` < `endDate`
- [ ] `totalPrice` est un nombre positif
- [ ] Politiques RLS configurées correctement
- [ ] Table `rentals` existe dans Supabase

---

## 🚀 Fix Rapide (Si RLS est le Problème)

**Exécute ce SQL dans Supabase:**

```sql
-- 1. Enable RLS sur rentals (si pas déjà fait)
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;

-- 2. Supprimer toutes les policies existantes
DROP POLICY IF EXISTS "Users can view their own rentals" ON rentals;
DROP POLICY IF EXISTS "Users can create rental requests" ON rentals;
DROP POLICY IF EXISTS "Owners can update rental status" ON rentals;

-- 3. Recréer les policies correctement
CREATE POLICY "Users can view their own rentals"
  ON rentals FOR SELECT
  TO authenticated
  USING (auth.uid() = renter_id OR auth.uid() = owner_id);

CREATE POLICY "Users can create rental requests"
  ON rentals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = renter_id);

CREATE POLICY "Owners can update rental status"
  ON rentals FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
```

---

## 📝 Notes

- Les erreurs RLS retournent souvent un objet vide `{}`
- C'est une mesure de sécurité pour ne pas exposer les détails
- Le logging détaillé aide à identifier la source exacte

---

**Dernière mise à jour:** 2026-02-08
**Status:** Debugging en cours

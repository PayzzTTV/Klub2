# 🐛 Bugs Critiques à Corriger - KLUB

**Priorité:** HAUTE
**À corriger avant:** Déploiement production

---

## Bug #1: Validation des Dates de Location (CRITIQUE)

### Description
Actuellement, rien n'empêche deux utilisateurs de réserver le même équipement pour des dates qui se chevauchent.

### Impact
- ⚠️ Double-booking possible
- ⚠️ Conflits de location
- ⚠️ Mauvaise expérience utilisateur

### Exemple de Scénario
```
Équipement: "Sonorisation JBL"
- User A réserve: 10 mars → 12 mars (Approuvé)
- User B réserve: 11 mars → 13 mars (Rien ne l'empêche!)
→ CONFLIT: Les deux users pensent avoir l'équipement le 11-12 mars
```

### Solution Proposée

#### Option A: Validation Côté Client (Rapide)
**Fichier:** `app/rental/[id]/page.tsx`

```typescript
// Ajouter cette fonction avant handleSubmitBooking
const checkDateConflict = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  return bookedDates.some(rental => {
    // Skip cancelled rentals
    if (rental.status === 'cancelled') return false;

    const rentalStart = new Date(rental.start_date);
    const rentalEnd = new Date(rental.end_date);

    // Check if dates overlap
    return (start <= rentalEnd && end >= rentalStart);
  });
};

// Dans handleSubmitBooking, ajouter AVANT la soumission:
const hasConflict = checkDateConflict(bookingData.startDate, bookingData.endDate);
if (hasConflict) {
  alert('❌ Ces dates sont déjà réservées. Veuillez choisir d\'autres dates.');
  return;
}
```

#### Option B: Validation Côté Serveur (Sécurisé)
**Fichier:** `lib/utils/rentals.ts`

Modifier la fonction `createRentalRequest` :

```typescript
export async function createRentalRequest(
  supabase: SupabaseClient,
  rentalData: {
    item_id: string;
    renter_id: string;
    owner_id: string;
    start_date: string;
    end_date: string;
    total_price: number;
  }
): Promise<any> {
  try {
    // 1. Check for date conflicts
    const { data: existingRentals } = await supabase
      .from('rentals')
      .select('start_date, end_date')
      .eq('item_id', rentalData.item_id)
      .in('status', ['pending', 'approved', 'ongoing']);

    if (existingRentals && existingRentals.length > 0) {
      const start = new Date(rentalData.start_date);
      const end = new Date(rentalData.end_date);

      const hasConflict = existingRentals.some(rental => {
        const rentalStart = new Date(rental.start_date);
        const rentalEnd = new Date(rental.end_date);
        return (start <= rentalEnd && end >= rentalStart);
      });

      if (hasConflict) {
        throw new Error('Ces dates sont déjà réservées');
      }
    }

    // 2. Create rental if no conflict
    const { data, error } = await supabase
      .from('rentals')
      .insert({
        item_id: rentalData.item_id,
        renter_id: rentalData.renter_id,
        owner_id: rentalData.owner_id,
        start_date: rentalData.start_date,
        end_date: rentalData.end_date,
        total_price: rentalData.total_price,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating rental request:', error);
    throw error;
  }
}
```

**Et dans `app/rental/[id]/page.tsx` :**

```typescript
const handleSubmitBooking = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    // ... validation existante ...

    const rental = await createRentalRequest(supabase, {
      item_id: equipmentId,
      renter_id: currentUserId,
      owner_id: equipment.owner_id,
      start_date: bookingData.startDate,
      end_date: bookingData.endDate,
      total_price: totalPrice,
    });

    alert('✅ Demande envoyée avec succès !');
    setShowBookingForm(false);
  } catch (error: any) {
    // Handle conflict error
    if (error.message?.includes('déjà réservées')) {
      alert('❌ ' + error.message);
    } else {
      alert('❌ Erreur lors de l\'envoi de la demande');
    }
  } finally {
    setSubmitting(false);
  }
};
```

### Recommandation
✅ **Implémenter les DEUX options** pour une protection maximale :
- Option A (client) → UX rapide, feedback immédiat
- Option B (serveur) → Sécurité, protection contre race conditions

### Priorité
🔴 **CRITIQUE** - À corriger avant tout déploiement

---

## Bug #2: RLS Policies pour la Table `rentals`

### Description
Les politiques RLS pour la table `rentals` doivent être vérifiées pour s'assurer que:
- Les users ne voient QUE leurs propres locations (comme renter OU owner)
- Les users ne peuvent PAS modifier les locations des autres

### Fichier à Modifier
`supabase-schema.sql`

### Politiques Actuelles à Vérifier

```sql
-- Vérifier que ces politiques existent:

-- 1. SELECT: Users can see rentals where they are renter OR owner
CREATE POLICY "Users can view their own rentals"
ON rentals FOR SELECT
TO authenticated
USING (
  auth.uid() = renter_id OR auth.uid() = owner_id
);

-- 2. INSERT: Any authenticated user can create a rental
CREATE POLICY "Authenticated users can create rentals"
ON rentals FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = renter_id);

-- 3. UPDATE: Only owner can update rental status
CREATE POLICY "Owners can update rental status"
ON rentals FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- 4. DELETE: Only renter can cancel pending rentals
CREATE POLICY "Renters can cancel pending rentals"
ON rentals FOR DELETE
TO authenticated
USING (
  auth.uid() = renter_id AND
  status = 'pending'
);
```

### Test de Validation

```sql
-- Exécuter ces queries pour tester:

-- 1. En tant que User A, essayer de voir les rentals de User B
SELECT * FROM rentals WHERE renter_id = 'user_b_id';
-- Résultat attendu: Aucune ligne (si User A n'est pas owner)

-- 2. En tant que User A, essayer de modifier une rental de User B
UPDATE rentals SET status = 'approved' WHERE id = 'user_b_rental_id';
-- Résultat attendu: 0 rows updated (policy violation)
```

### Priorité
🟡 **HAUTE** - À vérifier/corriger rapidement

---

## Bug #3: Validation Quantité Disponible

### Description
Quand un équipement a `quantity = 2`, on devrait pouvoir avoir 2 locations simultanées. Actuellement, ce n'est pas géré.

### Impact
- ⚠️ Perte de revenus potentiels
- ⚠️ Équipements sous-utilisés

### Solution Proposée

**Fichier:** `lib/utils/rentals.ts`

```typescript
export async function createRentalRequest(
  supabase: SupabaseClient,
  rentalData: { /* ... */ }
): Promise<any> {
  try {
    // 1. Get item details
    const { data: item } = await supabase
      .from('inventory')
      .select('quantity')
      .eq('id', rentalData.item_id)
      .single();

    if (!item) throw new Error('Équipement non trouvé');

    // 2. Count concurrent rentals for these dates
    const { data: concurrentRentals, error: countError } = await supabase
      .from('rentals')
      .select('id')
      .eq('item_id', rentalData.item_id)
      .in('status', ['approved', 'ongoing'])
      .or(`start_date.lte.${rentalData.end_date},end_date.gte.${rentalData.start_date}`);

    if (countError) throw countError;

    const concurrentCount = concurrentRentals?.length || 0;

    // 3. Check if quantity available
    if (concurrentCount >= item.quantity) {
      throw new Error('Plus de quantité disponible pour ces dates');
    }

    // 4. Create rental
    // ... existing code ...
  } catch (error) {
    console.error('Error creating rental request:', error);
    throw error;
  }
}
```

### Priorité
🟢 **MOYENNE** - Nice to have, pas bloquant

---

## Bug #4: ESLint Config Warning

### Description
```
Cannot find module 'eslint-config-next/core-web-vitals'
```

### Impact
- ⚠️ Warnings dans le build
- ⚠️ Pas de linting automatique

### Solution

**Fichier:** `eslint.config.mjs`

```javascript
import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  ...compat.extends('next/typescript'),
];

export default eslintConfig;
```

**OU plus simple:**

```javascript
export default {
  extends: ['next/core-web-vitals', 'next/typescript'],
};
```

### Priorité
🟢 **BASSE** - Cosmétique, n'affecte pas le fonctionnement

---

## Checklist de Correction

### Avant Déploiement
- [ ] Bug #1: Validation des dates implémentée (client + serveur)
- [ ] Bug #2: RLS policies vérifiées et corrigées
- [ ] Bug #1 & #2 testés manuellement
- [ ] Tests automatisés écrits (optionnel)

### Optionnel (Amélioration)
- [ ] Bug #3: Gestion de la quantité multiple
- [ ] Bug #4: ESLint config corrigé

---

## Tests de Validation

### Test Bug #1: Date Conflicts

```bash
# Test Case 1: Same dates
User A: 10 mars → 12 mars
User B: 10 mars → 12 mars
Expected: ❌ Erreur "dates déjà réservées"

# Test Case 2: Overlap start
User A: 10 mars → 12 mars
User B: 09 mars → 11 mars
Expected: ❌ Erreur "dates déjà réservées"

# Test Case 3: Overlap end
User A: 10 mars → 12 mars
User B: 11 mars → 13 mars
Expected: ❌ Erreur "dates déjà réservées"

# Test Case 4: Encompass
User A: 10 mars → 12 mars
User B: 09 mars → 13 mars
Expected: ❌ Erreur "dates déjà réservées"

# Test Case 5: No conflict
User A: 10 mars → 12 mars
User B: 13 mars → 15 mars
Expected: ✅ Succès
```

### Test Bug #2: RLS Policies

```bash
# Test Case 1: View own rentals
User A queries rentals WHERE renter_id = user_a_id
Expected: ✅ Returns User A's rentals

# Test Case 2: Cannot view others' rentals
User A queries rentals WHERE renter_id = user_b_id
Expected: ✅ Returns empty (unless User A is owner)

# Test Case 3: Owner can approve
Owner updates rental status = 'approved'
Expected: ✅ Succès

# Test Case 4: Renter cannot approve
Renter updates rental status = 'approved'
Expected: ❌ Policy violation
```

---

## Estimation de Temps

| Bug | Temps de Fix | Temps de Test | Total |
|-----|--------------|---------------|-------|
| #1  | 30 min       | 20 min        | 50 min |
| #2  | 15 min       | 10 min        | 25 min |
| #3  | 45 min       | 15 min        | 60 min |
| #4  | 5 min        | 2 min         | 7 min  |

**Total Critique (#1 + #2):** ~1h15
**Total Complet:** ~2h20

---

## Ordre de Correction Recommandé

1. 🔴 **Bug #1** (Validation dates) - Critique
2. 🟡 **Bug #2** (RLS policies) - Haute
3. 🟢 **Bug #3** (Quantité multiple) - Moyenne
4. 🟢 **Bug #4** (ESLint config) - Basse

---

**Dernière mise à jour:** 2026-02-08
**Statut:** À corriger avant production

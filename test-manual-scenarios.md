# 🧪 Tests Manuels - KLUB

## 📋 Plan de Tests

Date: 09 Février 2026
Testeur: Claude + Utilisateur
Environnement: Development (localhost:3000)

---

## ✅ Test 1: Démarrage du Serveur

**Objectif:** Vérifier que l'application démarre correctement

**Étapes:**
1. Lancer `npm run dev`
2. Accéder à http://localhost:3000

**Résultat attendu:**
- ✅ Serveur démarre en ~2s
- ✅ Page d'accueil s'affiche
- ✅ Pas d'erreurs dans la console

**Status:** ✅ PASS

---

## 🔒 Test 2: Protection des Routes (Sécurité)

**Objectif:** Vérifier que les pages sensibles nécessitent une authentification

### Test 2.1: Accès /rental sans login
**Étapes:**
1. Se déconnecter (ou ouvrir navigation privée)
2. Accéder à http://localhost:3000/rental

**Résultat attendu:**
- ✅ Redirection automatique vers /login
- ❌ PAS d'affichage du catalogue

**Status:** ⏳ À TESTER

### Test 2.2: Accès /projects sans login
**Étapes:**
1. Se déconnecter
2. Accéder à http://localhost:3000/projects

**Résultat attendu:**
- ✅ Redirection automatique vers /login
- ❌ PAS d'affichage des projets

**Status:** ⏳ À TESTER

### Test 2.3: Accès /rental après login
**Étapes:**
1. Se connecter avec un compte
2. Accéder à http://localhost:3000/rental

**Résultat attendu:**
- ✅ Catalogue s'affiche
- ✅ Liste d'équipements visible

**Status:** ⏳ À TESTER

---

## 📅 Test 3: Calendrier Visuel

**Objectif:** Vérifier que le nouveau calendrier fonctionne correctement

### Test 3.1: Affichage du calendrier
**Étapes:**
1. Se connecter
2. Aller sur /rental
3. Cliquer sur un équipement
4. Cliquer sur "📅 Réserver maintenant"

**Résultat attendu:**
- ✅ Calendrier mensuel s'affiche
- ✅ Mois actuel visible (Février 2026)
- ✅ Légende avec couleurs visible en bas
- ✅ Boutons ← → pour navigation

**Status:** ⏳ À TESTER

### Test 3.2: Navigation entre mois
**Étapes:**
1. Dans le calendrier, cliquer sur →
2. Cliquer sur ←

**Résultat attendu:**
- ✅ Mois change correctement
- ✅ Dates se mettent à jour
- ✅ Animation fluide

**Status:** ⏳ À TESTER

### Test 3.3: Dates bloquées visuelles
**Étapes:**
1. Créer une réservation avec User A (10 mars → 12 mars)
2. Avec User B, voir le même équipement

**Résultat attendu:**
- ✅ Dates 10, 11, 12 mars en ROUGE
- ✅ Impossible de cliquer dessus
- ✅ Statut "Réservé" visible

**Status:** ⏳ À TESTER

### Test 3.4: Dates en attente (pending)
**Étapes:**
1. Créer une demande pending (15 mars → 17 mars)
2. Voir l'équipement

**Résultat attendu:**
- ✅ Dates 15, 16, 17 mars en ORANGE
- ✅ Statut "En attente" visible

**Status:** ⏳ À TESTER

---

## 🍞 Test 4: Toast Notifications

**Objectif:** Vérifier que les toasts remplacent bien les alerts

### Test 4.1: Toast Success
**Étapes:**
1. Aller sur /rental/[id]
2. Remplir le formulaire correctement
3. Soumettre

**Résultat attendu:**
- ✅ Toast vert s'affiche en haut à droite
- ✅ Message: "Demande de location envoyée!"
- ✅ Durée visible, total affiché
- ✅ Disparaît après 5 secondes
- ✅ Bouton X pour fermer manuellement

**Status:** ⏳ À TESTER

### Test 4.2: Toast Error
**Étapes:**
1. Formulaire de réservation
2. Sélectionner des dates déjà réservées
3. Soumettre

**Résultat attendu:**
- ✅ Toast rouge s'affiche
- ✅ Message: "Aucune quantité disponible..."
- ✅ Icône ❌ visible

**Status:** ⏳ À TESTER

### Test 4.3: Toast Warning
**Étapes:**
1. Formulaire de réservation
2. Soumettre sans accepter les conditions

**Résultat attendu:**
- ✅ Toast orange s'affiche
- ✅ Message: "Veuillez accepter les conditions..."
- ✅ Icône ⚠️ visible

**Status:** ⏳ À TESTER

### Test 4.4: Multiple Toasts
**Étapes:**
1. Déclencher plusieurs erreurs rapidement

**Résultat attendu:**
- ✅ Plusieurs toasts s'empilent verticalement
- ✅ Pas de chevauchement
- ✅ Chacun disparaît indépendamment

**Status:** ⏳ À TESTER

---

## 🚫 Test 5: Validation Date Conflict (CRITIQUE)

**Objectif:** Vérifier qu'on ne peut pas réserver des dates déjà prises

### Test 5.1: Double-booking simple
**Préparation:**
1. Créer User A (BDE) et User B (ORGA)
2. Créer un équipement avec quantity=1

**Étapes:**
1. User A réserve: 10 mars → 12 mars
2. Owner approuve
3. User B tente de réserver: 11 mars → 13 mars

**Résultat attendu:**
- ✅ Toast error: "Aucune quantité disponible"
- ❌ Demande NON créée dans la DB
- ✅ Calendrier montre 10-12 mars en rouge

**Status:** ⏳ À TESTER

### Test 5.2: Date dans le passé
**Étapes:**
1. Formulaire de réservation
2. Sélectionner date de début = hier

**Résultat attendu:**
- ✅ Toast error: "La date de début ne peut pas être dans le passé"
- ❌ Demande NON créée

**Status:** ⏳ À TESTER

### Test 5.3: Chevauchement partiel
**Étapes:**
1. Réservation existante: 10 mars → 15 mars
2. Tenter: 13 mars → 17 mars (chevauchement 13-15)

**Résultat attendu:**
- ✅ Toast error détecté
- ❌ Réservation refusée

**Status:** ⏳ À TESTER

---

## 📦 Test 6: Multiple Quantity Support

**Objectif:** Vérifier que les équipements avec quantity > 1 fonctionnent

### Test 6.1: Deux locations simultanées OK
**Préparation:**
1. Créer équipement avec quantity=2

**Étapes:**
1. User A réserve: 10 mars → 12 mars (1/2 utilisé)
2. User B réserve: 11 mars → 13 mars (2/2 utilisé)

**Résultat attendu:**
- ✅ Les DEUX réservations sont acceptées
- ✅ Calendrier montre 11-12 mars en orange (pas rouge)

**Status:** ⏳ À TESTER

### Test 6.2: Troisième location refusée
**Étapes:**
1. User C tente de réserver: 11 mars → 12 mars

**Résultat attendu:**
- ✅ Toast error: "Aucune quantité disponible"
- ❌ Réservation refusée
- ✅ Calendrier montre toutes les unités prises

**Status:** ⏳ À TESTER

---

## 📝 Test 7: Système de Feedback Obligatoire

**Objectif:** Vérifier que le BDE ne peut pas créer de projet sans feedback

### Test 7.1: Projet terminé → Bandeau s'affiche
**Préparation:**
1. Créer un projet avec User BDE
2. Changer status → 'completed' dans Supabase
3. Mettre feedback_given = false

**Étapes:**
1. User BDE va sur /bde/dashboard

**Résultat attendu:**
- ✅ Bandeau rouge en haut avec ⚠️
- ✅ Message: "Feedback obligatoire requis"
- ✅ Nombre de projets affiché
- ✅ Bouton "Donner mon feedback"

**Status:** ⏳ À TESTER

### Test 7.2: Bouton "Créer projet" désactivé
**Étapes:**
1. Même contexte (feedback en attente)
2. Observer la carte "Créer un projet"

**Résultat attendu:**
- ✅ Carte grisée (opacity-50)
- ✅ cursor-not-allowed
- ✅ Message: "⚠️ Feedback obligatoire en attente"
- ❌ Lien non cliquable

**Status:** ⏳ À TESTER

### Test 7.3: Donner feedback débloque
**Étapes:**
1. Cliquer sur "Donner mon feedback"
2. Remplir le formulaire (5 notes + commentaire)
3. Soumettre
4. Retourner sur dashboard

**Résultat attendu:**
- ✅ Bandeau rouge disparaît
- ✅ Bouton "Créer projet" redevient cliquable
- ✅ feedback_given = true dans DB

**Status:** ⏳ À TESTER

---

## ⭐ Test 8: Calcul Score Global ORGA

**Objectif:** Vérifier que les moyennes sont calculées correctement

### Test 8.1: Créer 3 reviews
**Données:**
- Review 1: global=5, punctuality=5, quality=5, communication=5, value=5
- Review 2: global=4, punctuality=4, quality=4, communication=4, value=4
- Review 3: global=3, punctuality=3, quality=3, communication=3, value=3

**Résultat attendu:**
- ✅ avgGlobal = (5+4+3)/3 = 4.0
- ✅ Affiché avec 1 décimale
- ✅ 3 reviews total

**Status:** ⏳ À TESTER

### Test 8.2: Badge "Top Prestataire"
**Étapes:**
1. ORGA avec avgGlobal = 4.7

**Résultat attendu:**
- ✅ Badge violet avec ⭐
- ✅ Texte: "Top Prestataire"

**Status:** ⏳ À TESTER

---

## 📱 Test 9: Responsive Design

**Objectif:** Vérifier que l'UI fonctionne sur mobile

### Test 9.1: Calendrier mobile
**Étapes:**
1. Réduire fenêtre à 375px (iPhone SE)
2. Aller sur /rental/[id]
3. Ouvrir calendrier

**Résultat attendu:**
- ✅ Calendrier s'adapte
- ✅ Grille 7 colonnes lisible
- ✅ Boutons accessibles

**Status:** ⏳ À TESTER

### Test 9.2: Toasts mobile
**Étapes:**
1. Vue mobile
2. Déclencher un toast

**Résultat attendu:**
- ✅ Toast visible (pas en dehors de l'écran)
- ✅ Largeur adaptée
- ✅ Bouton X accessible

**Status:** ⏳ À TESTER

---

## 🔧 Test 10: Console Errors

**Objectif:** Vérifier qu'il n'y a pas d'erreurs JavaScript

### Test 10.1: Navigation complète
**Étapes:**
1. Ouvrir console (F12)
2. Naviguer sur toutes les pages:
   - / (home)
   - /login
   - /rental
   - /rental/[id]
   - /projects
   - /bde/dashboard
   - /feedback/[id]

**Résultat attendu:**
- ✅ Aucune erreur rouge
- ⚠️ Warnings acceptables (Next.js, dev mode)
- ✅ Pas de 404 sur assets

**Status:** ⏳ À TESTER

---

## 📊 Récapitulatif

### Tests Critiques (MUST PASS)
- [ ] Test 2: Protection auth
- [ ] Test 5: Validation dates
- [ ] Test 7: Feedback obligatoire

### Tests UX (SHOULD PASS)
- [ ] Test 3: Calendrier visuel
- [ ] Test 4: Toast notifications
- [ ] Test 9: Responsive

### Tests Nice-to-Have
- [ ] Test 6: Multiple quantity
- [ ] Test 8: Score calculation
- [ ] Test 10: Console errors

---

## 🐛 Bugs Trouvés

| # | Sévérité | Description | Status |
|---|----------|-------------|--------|
| - | - | - | - |

---

## ✅ Critères de Succès

**PASS = Prêt pour production si:**
- ✅ Tous les tests critiques passent
- ✅ Au moins 80% des tests UX passent
- ✅ Aucun bug bloquant

**FAIL = Corrections nécessaires si:**
- ❌ Un test critique échoue
- ❌ Bug de sécurité détecté
- ❌ Erreurs console critiques

---

**Notes:**
- Utiliser deux navigateurs différents pour tests multi-utilisateurs
- Vider cache entre tests si nécessaire
- Documenter tous les bugs avec screenshots

**Début des tests:** [À compléter]
**Fin des tests:** [À compléter]
**Durée:** [À compléter]

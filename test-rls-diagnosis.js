// ============================================================================
// DIAGNOSTIC RLS - KLUB Platform
// ============================================================================
// Ce script teste la connexion Supabase et diagnostique les problèmes RLS
// ============================================================================

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vedmmndhzmusxssveoht.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZG1tbmRoem11c3hzc3Zlb2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMDUzMzcsImV4cCI6MjA4NDY4MTMzN30.53nxt2lRU9FrgHsNaXqTQzut0_5PK5s_ZM3aKCdBOU0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runDiagnostics() {
  console.log('\n🔍 DIAGNOSTIC SUPABASE & RLS\n');
  console.log('='.repeat(60));

  // ============================================================================
  // TEST 1: Connexion de base
  // ============================================================================
  console.log('\n📡 TEST 1: Connexion Supabase...');
  try {
    const { data, error } = await supabase.from('profiles').select('count');
    if (error) {
      console.log('❌ Erreur de connexion:', error.message);
      return;
    }
    console.log('✅ Connexion réussie !');
  } catch (err) {
    console.log('❌ Erreur critique:', err.message);
    return;
  }

  // ============================================================================
  // TEST 2: Vérifier si les tables existent
  // ============================================================================
  console.log('\n📊 TEST 2: Vérification des tables...');
  const tables = ['profiles', 'projects', 'inventory', 'conversations', 'messages', 'reviews', 'rentals', 'project_applications'];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Existe`);
      }
    } catch (err) {
      console.log(`❌ ${table}: ${err.message}`);
    }
  }

  // ============================================================================
  // TEST 3: Test RLS sans authentification
  // ============================================================================
  console.log('\n🔒 TEST 3: Test RLS sans authentification...');

  // Profiles
  try {
    const { data, error } = await supabase.from('profiles').select('id, role, name').limit(5);
    if (error) {
      console.log('❌ profiles SELECT:', error.message);
    } else {
      console.log(`✅ profiles SELECT: ${data?.length || 0} résultats (RLS autorise la lecture)`);
    }
  } catch (err) {
    console.log('❌ profiles SELECT:', err.message);
  }

  // Projects
  try {
    const { data, error } = await supabase.from('projects').select('id, title, status').limit(5);
    if (error) {
      console.log('❌ projects SELECT:', error.message);
    } else {
      console.log(`✅ projects SELECT: ${data?.length || 0} résultats`);
    }
  } catch (err) {
    console.log('❌ projects SELECT:', err.message);
  }

  // Inventory
  try {
    const { data, error } = await supabase.from('inventory').select('id, title, available').limit(5);
    if (error) {
      console.log('❌ inventory SELECT:', error.message);
    } else {
      console.log(`✅ inventory SELECT: ${data?.length || 0} résultats`);
    }
  } catch (err) {
    console.log('❌ inventory SELECT:', err.message);
  }

  // ============================================================================
  // TEST 4: Test INSERT (doit échouer sans auth)
  // ============================================================================
  console.log('\n✏️ TEST 4: Test INSERT sans authentification (doit échouer)...');

  try {
    const { error } = await supabase.from('profiles').insert({
      id: '00000000-0000-0000-0000-000000000000',
      role: 'ORGA',
      name: 'Test',
      email: 'test@test.com'
    });

    if (error) {
      if (error.message.includes('violates row-level security policy')) {
        console.log('✅ INSERT profiles: RLS fonctionne correctement (bloque INSERT)');
      } else {
        console.log('❌ INSERT profiles:', error.message);
      }
    } else {
      console.log('⚠️ INSERT profiles: ATTENTION - RLS n\'a PAS bloqué l\'insertion !');
    }
  } catch (err) {
    console.log('❌ INSERT profiles:', err.message);
  }

  // ============================================================================
  // TEST 5: Vérifier si RLS est activé
  // ============================================================================
  console.log('\n🔐 TEST 5: Vérifier l\'état du RLS sur les tables...');
  console.log('⚠️ Cette requête nécessite des privilèges admin, elle peut échouer');

  // ============================================================================
  // RÉSUMÉ
  // ============================================================================
  console.log('\n' + '='.repeat(60));
  console.log('📋 RÉSUMÉ DU DIAGNOSTIC\n');
  console.log('Si tu vois des erreurs "violates row-level security policy":');
  console.log('  → C\'est NORMAL pour les INSERT sans auth');
  console.log('  → Les RLS fonctionnent correctement !');
  console.log('\nSi tu vois "new row violates row-level security policy":');
  console.log('  → Exécute supabase-rls-fix-safe.sql dans Supabase Dashboard');
  console.log('\nSi les SELECT échouent avec des erreurs RLS:');
  console.log('  → Les politiques sont trop restrictives');
  console.log('  → Exécute supabase-rls-fix-safe.sql');
  console.log('\n' + '='.repeat(60));
}

runDiagnostics();

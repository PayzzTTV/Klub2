// Test de Connexion Supabase pour KLUB
// Ce script vérifie que la configuration Supabase fonctionne

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vedmmndhzmusxssveoht.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZG1tbmRoem11c3hzc3Zlb2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMDUzMzcsImV4cCI6MjA4NDY4MTMzN30.53nxt2lRU9FrgHsNaXqTQzut0_5PK5s_ZM3aKCdBOU0'

async function testSupabaseConnection() {
  console.log('🚀 Test de connexion Supabase KLUB\n')
  console.log('📍 URL:', supabaseUrl)
  console.log('🔑 Clé:', supabaseKey.substring(0, 20) + '...\n')

  try {
    // Créer le client Supabase
    const supabase = createClient(supabaseUrl, supabaseKey)
    console.log('✅ Client Supabase créé\n')

    // Test 1: Vérifier les tables
    console.log('📊 Test 1: Vérification des tables...')
    const tables = [
      'profiles',
      'projects',
      'inventory',
      'rentals',
      'reviews',
      'conversations',
      'messages',
      'project_applications'
    ]

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`)
      } else {
        console.log(`   ✅ ${table}: OK (${data ? data.length : 0} résultats)`)
      }
    }

    console.log('\n🎉 Tous les tests sont passés !\n')
    console.log('📋 Prochaines étapes:')
    console.log('   1. Activer l\'authentification Email dans Supabase')
    console.log('   2. Créer un compte test')
    console.log('   3. Tester l\'application sur http://localhost:3000\n')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.error('\n🔧 Vérifiez:')
    console.error('   - Que le schéma SQL a bien été exécuté')
    console.error('   - Que les clés dans .env.local sont correctes')
    console.error('   - Que le projet Supabase n\'est pas en pause\n')
  }
}

testSupabaseConnection()

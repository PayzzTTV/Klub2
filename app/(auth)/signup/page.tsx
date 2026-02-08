'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [role, setRole] = useState<UserRole>('BDE');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // MODE DEV : Simuler la création de compte sans Supabase
      // Pour activer : créer un fichier .env.development.local avec NEXT_PUBLIC_DEV_MODE=true
      const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

      if (isDevMode) {
        console.log('🔧 MODE DEV: Création de compte simulée (sans Supabase)');

        // Simuler un délai d'inscription
        await new Promise(resolve => setTimeout(resolve, 800));

        // Stocker les infos en localStorage pour simuler une "session"
        const mockUser = {
          id: `dev-user-${Date.now()}`,
          email,
          name,
          organization_name: organizationName,
          role,
          location,
          created_at: new Date().toISOString(),
        };

        localStorage.setItem('dev_user', JSON.stringify(mockUser));
        localStorage.setItem('dev_authenticated', 'true');

        alert(`✅ Compte créé avec succès ! (Mode Dev)\n\nBienvenue ${name} !`);

        // Rediriger selon le rôle
        if (role === 'BDE') {
          router.push('/demo/bde/dashboard');
        } else {
          router.push('/demo/projects');
        }
        return;
      }

      // MODE PRODUCTION : Utiliser Supabase normalement
      console.log('🔐 MODE PRODUCTION: Création via Supabase');

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            organization_name: organizationName,
            role,
            location,
          },
          emailRedirectTo: `${window.location.origin}/demo/bde/dashboard`,
        }
      });

      if (authError) {
        console.error('Auth error:', authError);

        // Gérer l'erreur de rate limit email
        if (authError.message.includes('email rate limit')) {
          throw new Error('⚠️ Limite d\'emails atteinte.\n\n💡 Active le MODE DEV:\n1. Crée un fichier ".env.development.local"\n2. Ajoute: NEXT_PUBLIC_DEV_MODE=true\n3. Redémarre le serveur (npm run dev)\n\nOu attends 20 minutes.');
        }

        throw authError;
      }

      if (authData.user) {
        // Attendre un peu pour que l'authentification soit complète
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Créer le profil
        const { error: profileError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          email,
          name,
          organization_name: organizationName,
          role,
          location,
        });

        if (profileError) {
          console.error('Profile error:', profileError);

          if (profileError.message.includes('row-level security')) {
            throw new Error('Erreur de permissions RLS. Exécute supabase-fix-profiles-complete.sql');
          }
          throw profileError;
        }

        alert('✅ Compte créé avec succès !');
        if (role === 'BDE') {
          router.push('/demo/bde/dashboard');
        } else {
          router.push('/demo/projects');
        }
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  // Afficher un badge si en mode dev
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-5xl font-bold tracking-tighter mb-2 cursor-pointer">
              <span className="text-white">K</span>
              <span className="text-[#7C3AED]">L</span>
              <span className="text-white">UB</span>
            </h1>
          </Link>
          <p className="text-[#A0A0A0]">Créer votre compte</p>
          {isDevMode && (
            <p className="text-[#00FF66] text-xs mt-2">🔧 MODE DEV ACTIF (Sans emails)</p>
          )}
        </div>

        {/* Form */}
        <div className="brutalist-card p-8">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-[#FF0055]/10 border border-[#FF0055] p-3 rounded text-sm text-[#FF0055] whitespace-pre-line">
                {error}
              </div>
            )}

            {/* Type de compte */}
            <div>
              <label className="block text-sm font-medium mb-3">Type de compte</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('BDE')}
                  className={`p-4 border rounded transition-all ${
                    role === 'BDE'
                      ? 'border-[#7C3AED] bg-[#7C3AED]/10'
                      : 'border-[#1A1A1A] hover:border-[#2A2A2A]'
                  }`}
                >
                  <div className="text-2xl mb-2">🎓</div>
                  <div className="font-semibold">BDE</div>
                  <div className="text-xs text-[#A0A0A0] mt-1">
                    Bureau des Étudiants
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('ORGA')}
                  className={`p-4 border rounded transition-all ${
                    role === 'ORGA'
                      ? 'border-[#7C3AED] bg-[#7C3AED]/10'
                      : 'border-[#1A1A1A] hover:border-[#2A2A2A]'
                  }`}
                >
                  <div className="text-2xl mb-2">🎪</div>
                  <div className="font-semibold">ORGA</div>
                  <div className="text-xs text-[#A0A0A0] mt-1">
                    Organisateur d'événements
                  </div>
                </button>
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Nom complet
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[#0A0A0A] border border-[#1A1A1A] px-4 py-3 rounded focus:border-[#7C3AED] focus:outline-none transition-colors"
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label htmlFor="organization" className="block text-sm font-medium mb-2">
                  Nom de l'organisation
                </label>
                <input
                  id="organization"
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  className="w-full bg-[#0A0A0A] border border-[#1A1A1A] px-4 py-3 rounded focus:border-[#7C3AED] focus:outline-none transition-colors"
                  placeholder={role === 'BDE' ? 'BDE Polytechnique' : 'SoundPro Events'}
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-2">
                Localisation
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full bg-[#0A0A0A] border border-[#1A1A1A] px-4 py-3 rounded focus:border-[#7C3AED] focus:outline-none transition-colors"
                placeholder="Paris, France"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0A0A0A] border border-[#1A1A1A] px-4 py-3 rounded focus:border-[#7C3AED] focus:outline-none transition-colors"
                placeholder="votre@email.fr"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-[#0A0A0A] border border-[#1A1A1A] px-4 py-3 rounded focus:border-[#7C3AED] focus:outline-none transition-colors"
                placeholder="••••••••"
              />
              <p className="text-xs text-[#A0A0A0] mt-1">Minimum 6 caractères</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full brutalist-button-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création du compte...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#A0A0A0]">Déjà un compte ? </span>
            <Link href="/login" className="text-[#7C3AED] hover:underline font-medium">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

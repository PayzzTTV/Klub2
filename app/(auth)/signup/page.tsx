'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types';
import { Syne } from 'next/font/google';

const syne = Syne({ subsets: ['latin'], weight: ['400', '700', '800'] });

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
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, organization_name: organizationName, role, location },
          emailRedirectTo: `${window.location.origin}/bde/dashboard`,
        }
      });

      if (authError) {
        if (authError.message.includes('email rate limit')) {
          throw new Error('Limite d\'emails atteinte. Veuillez patienter 20 minutes avant de réessayer.');
        }
        throw authError;
      }

      if (authData.user) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push(role === 'BDE' ? '/bde/dashboard' : '/projects');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const roleInfo = {
    BDE: {
      label: 'BDE',
      sub: 'Bureau des Étudiants',
      desc: 'Postez vos événements, recrutez des prestataires, gérez vos locations de matériel.',
      perks: ['Poster des projets', 'Louer du matériel', 'Noter les prestataires'],
    },
    ORGA: {
      label: 'ORGA',
      sub: 'Organisateur',
      desc: 'Proposez vos services aux BDE, louez votre matériel, développez votre réputation.',
      perks: ['Répondre aux projets', 'Louer votre matériel', 'Score de réputation'],
    },
  };

  return (
    <>
      <style>{`
        .s-grid-bg {
          background-image:
            linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        .s-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid #222;
          border-radius: 0;
          padding: 10px 0;
          width: 100%;
          color: #fff;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .s-input:focus { border-bottom-color: #7C3AED; }
        .s-input::placeholder { color: #333; }

        .s-label {
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #555;
          transition: color 0.2s;
          display: block;
          margin-bottom: 2px;
        }
        .s-field:focus-within .s-label { color: #7C3AED; }

        .role-card {
          flex: 1;
          padding: 16px;
          border: 1px solid #1A1A1A;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          text-align: left;
          background: #000;
        }
        .role-card:hover { border-color: #2A2A2A; }
        .role-card.active {
          border-color: #7C3AED;
          background: rgba(124,58,237,0.05);
        }
        .role-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1px solid #333;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .role-card.active .role-dot {
          background: #7C3AED;
          border-color: #7C3AED;
          box-shadow: 0 0 8px rgba(124,58,237,0.6);
        }

        .s-btn {
          position: relative;
          overflow: hidden;
          background: #7C3AED;
          color: #fff;
          border: none;
          padding: 14px 32px;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s;
          width: 100%;
          font-family: inherit;
        }
        .s-btn:hover:not(:disabled) { background: #6D28D9; }
        .s-btn:active:not(:disabled) { transform: translateY(1px); }
        .s-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .s-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          transform: translateX(-100%);
          transition: transform 0.4s;
        }
        .s-btn:hover::after { transform: translateX(100%); }

        .perk-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #6B6B6B;
        }
        .perk-dot {
          width: 4px;
          height: 4px;
          background: #00FF66;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .neon-glow { text-shadow: 0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(124,58,237,0.15); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu1 { animation: fadeUp 0.45s ease both; }
        .fu2 { animation: fadeUp 0.45s 0.07s ease both; }
        .fu3 { animation: fadeUp 0.45s 0.14s ease both; }
        .fu4 { animation: fadeUp 0.45s 0.21s ease both; }
        .fu5 { animation: fadeUp 0.45s 0.28s ease both; }
        .fu6 { animation: fadeUp 0.45s 0.35s ease both; }

        .vert-line {
          position: absolute;
          width: 1px;
          top: 0; bottom: 0;
          background: linear-gradient(to bottom, transparent, rgba(124,58,237,0.3), transparent);
          animation: pulse-line 4s ease-in-out infinite;
        }
        @keyframes pulse-line {
          0%,100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Aurora background */}
      <div style={{ position:'fixed', width:'550px', height:'550px', borderRadius:'50%', filter:'blur(90px)', background:'radial-gradient(circle, #7C3AED 0%, transparent 70%)', opacity:0.12, top:'-150px', left:'-100px', pointerEvents:'none', zIndex:0, animation:'lb1 20s ease-in-out infinite' }} />
      <div style={{ position:'fixed', width:'400px', height:'400px', borderRadius:'50%', filter:'blur(90px)', background:'radial-gradient(circle, #4F1DED 0%, transparent 70%)', opacity:0.08, bottom:'-80px', right:'-80px', pointerEvents:'none', zIndex:0, animation:'lb2 25s ease-in-out infinite' }} />

      <div className={`min-h-screen flex ${syne.className}`} style={{ background: '#06060E', position: 'relative' }}>

        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden s-grid-bg border-r border-[#0F0F0F]" style={{ zIndex: 2 }}>
          <div className="vert-line" style={{ left: '33%', animationDelay: '0s' }} />
          <div className="vert-line" style={{ left: '66%', animationDelay: '2s' }} />

          {/* Glow */}
          <div style={{
            position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)',
            top: '-80px', right: '-80px', pointerEvents: 'none',
          }} />

          {/* Logo */}
          <div className="relative z-10">
            <Link href="/">
              <h1 className="neon-glow" style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                KL<span style={{ color: '#7C3AED' }}>U</span>B
              </h1>
            </Link>
          </div>

          {/* Role info panel */}
          <div className="relative z-10">
            <div style={{
              fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#555', marginBottom: '12px'
            }}>
              — Vous rejoignez en tant que
            </div>
            <div style={{
              fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 800,
              letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '16px',
              transition: 'all 0.3s ease'
            }}>
              {roleInfo[role].label}
              <span style={{ color: '#7C3AED' }}>.</span>
            </div>
            <p style={{ fontSize: '13px', color: '#6B6B6B', lineHeight: 1.6, marginBottom: '24px', maxWidth: '280px' }}>
              {roleInfo[role].desc}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {roleInfo[role].perks.map(p => (
                <div key={p} className="perk-item">
                  <span className="perk-dot" />
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* Step indicator */}
          <div className="relative z-10">
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1,2,3].map(i => (
                <div key={i} style={{
                  height: '2px', flex: 1,
                  background: i === 1 ? '#7C3AED' : '#1A1A1A',
                  transition: 'background 0.3s'
                }} />
              ))}
            </div>
            <p style={{ fontSize: '10px', color: '#555', marginTop: '8px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Étape 1 sur 1
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex items-start justify-center px-8 py-12 overflow-y-auto" style={{ zIndex: 2 }}>
          <div className="w-full" style={{ maxWidth: '400px' }}>

            {/* Mobile logo */}
            <div className="lg:hidden mb-8 fu1">
              <Link href="/">
                <h1 className="neon-glow" style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.03em' }}>
                  KL<span style={{ color: '#7C3AED' }}>U</span>B
                </h1>
              </Link>
            </div>

            {/* Heading */}
            <div className="fu1" style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>
                Créer un compte
              </h2>
              <p style={{ fontSize: '13px', color: '#555' }}>
                Rejoignez la communauté KLUB
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                borderLeft: '2px solid #FF0055', paddingLeft: '12px',
                marginBottom: '20px', fontSize: '12px', color: '#FF0055',
                whiteSpace: 'pre-line'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Role selector */}
              <div className="fu2">
                <div className="s-label" style={{ marginBottom: '10px' }}>Type de compte</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {(['BDE', 'ORGA'] as UserRole[]).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`role-card ${role === r ? 'active' : ''}`}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700 }}>{r}</span>
                        <span className="role-dot" />
                      </div>
                      <div style={{ fontSize: '10px', color: '#555', letterSpacing: '0.05em' }}>
                        {roleInfo[r].sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name + Org */}
              <div className="fu3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="s-field">
                  <label className="s-label" htmlFor="name">Nom complet</label>
                  <input
                    id="name" type="text" value={name}
                    onChange={e => setName(e.target.value)}
                    className="s-input" placeholder="Jean Dupont" required
                  />
                </div>
                <div className="s-field">
                  <label className="s-label" htmlFor="organization">Organisation</label>
                  <input
                    id="organization" type="text" value={organizationName}
                    onChange={e => setOrganizationName(e.target.value)}
                    className="s-input"
                    placeholder={role === 'BDE' ? 'BDE Polytechnique' : 'SoundPro Events'}
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="s-field fu4">
                <label className="s-label" htmlFor="location">Localisation</label>
                <input
                  id="location" type="text" value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="s-input" placeholder="Paris, France" required
                />
              </div>

              {/* Email */}
              <div className="s-field fu4">
                <label className="s-label" htmlFor="email">Email</label>
                <input
                  id="email" type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="s-input" placeholder="votre@email.fr"
                  required autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="s-field fu5">
                <label className="s-label" htmlFor="password">Mot de passe</label>
                <input
                  id="password" type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="s-input" placeholder="••••••••"
                  required minLength={6} autoComplete="new-password"
                />
                <div style={{ fontSize: '10px', color: '#333', marginTop: '4px', letterSpacing: '0.05em' }}>
                  Minimum 6 caractères
                </div>
              </div>

              {/* Submit */}
              <div className="fu6" style={{ paddingTop: '4px' }}>
                <button type="submit" disabled={loading} className="s-btn">
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span style={{
                        width: '12px', height: '12px', borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                        display: 'inline-block', animation: 'spin 0.6s linear infinite',
                      }} />
                      Création...
                    </span>
                  ) : `Rejoindre en tant que ${role} →`}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="fu6" style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #111' }}>
              <p style={{ fontSize: '13px', color: '#555', textAlign: 'center' }}>
                Déjà un compte ?{' '}
                <Link
                  href="/login"
                  style={{ color: '#7C3AED', fontWeight: 700, textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                >
                  Se connecter
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

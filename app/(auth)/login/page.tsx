'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Syne } from 'next/font/google';
import { useLanguage } from '@/lib/hooks/useLanguage';

const syne = Syne({ subsets: ['latin'], weight: ['400', '700', '800'] });

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t, lang, setLang } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(t.common.error);

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role === 'BDE') {
          router.push('/bde/dashboard');
        } else {
          router.push('/projects');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t.common.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .klub-font { font-family: var(--syne-font); }

        .grid-bg {
          background-image:
            linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* Aurora blobs */
        .login-blob {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          will-change: transform;
          z-index: 0;
        }
        .login-blob-1 {
          width: 700px; height: 700px;
          background: radial-gradient(circle, #7C3AED 0%, transparent 70%);
          opacity: 0.22;
          top: -200px; left: -150px;
          animation: lb1 20s ease-in-out infinite;
        }
        .login-blob-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #4F1DED 0%, transparent 70%);
          opacity: 0.16;
          bottom: -120px; right: -80px;
          animation: lb2 25s ease-in-out infinite;
        }
        .login-blob-3 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, #7C3AED 0%, transparent 70%);
          opacity: 0.10;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation: lb3 30s ease-in-out infinite;
        }
        @keyframes lb1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(60px,100px) scale(1.1); }
          66% { transform: translate(-30px,50px) scale(0.95); }
        }
        @keyframes lb2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40% { transform: translate(-80px,-60px) scale(1.15); }
          80% { transform: translate(40px,-30px) scale(0.9); }
        }
        @keyframes lb3 {
          0%,100% { transform: translate(-50%,-50%) scale(1); }
          50% { transform: translate(-50%,-50%) scale(1.3); }
        }

        /* Grain */
        .login-grain {
          position: fixed;
          inset: -200%;
          width: 400%; height: 400%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.03;
          pointer-events: none;
          z-index: 1;
          animation: grain 0.15s steps(1) infinite;
        }
        @keyframes grain {
          0%   { transform: translate(0,0); }
          20%  { transform: translate(-2%,-3%); }
          40%  { transform: translate(3%,2%); }
          60%  { transform: translate(-1%,4%); }
          80%  { transform: translate(4%,-1%); }
          100% { transform: translate(-2%,3%); }
        }

        .neon-glow {
          text-shadow: 0 0 60px rgba(124,58,237,0.35), 0 0 120px rgba(124,58,237,0.12);
        }

        .underline-input {
          background: transparent;
          border: none;
          border-bottom: 1px solid #2A2A2A;
          border-radius: 0;
          padding: 12px 0;
          width: 100%;
          color: #fff;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s ease;
          font-family: inherit;
        }

        .underline-input:focus {
          border-bottom-color: #7C3AED;
        }

        .underline-input::placeholder {
          color: #3A3A3A;
        }

        .field-label {
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #6B6B6B;
          transition: color 0.2s ease;
        }

        .field-wrap:focus-within .field-label {
          color: #7C3AED;
        }

        .submit-btn {
          position: relative;
          overflow: hidden;
          background: #7C3AED;
          color: #fff;
          border: none;
          padding: 14px 32px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s ease, transform 0.1s ease;
          width: 100%;
        }

        .submit-btn:hover:not(:disabled) {
          background: #6D28D9;
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(1px);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.4s ease;
        }

        .submit-btn:hover::after {
          transform: translateX(100%);
        }

        .left-panel-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #1A1A1A;
          padding: 5px 12px;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #6B6B6B;
        }

        .left-panel-tag::before {
          content: '';
          width: 5px;
          height: 5px;
          background: #00FF66;
          border-radius: 50%;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-up-1 { animation: fadeUp 0.5s ease both; }
        .fade-up-2 { animation: fadeUp 0.5s 0.08s ease both; }
        .fade-up-3 { animation: fadeUp 0.5s 0.16s ease both; }
        .fade-up-4 { animation: fadeUp 0.5s 0.24s ease both; }
        .fade-up-5 { animation: fadeUp 0.5s 0.32s ease both; }

        .left-fade { animation: fadeUp 0.6s ease both; }

        .diagonal-line {
          position: absolute;
          width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(124,58,237,0.4), transparent);
          animation: lineDrop 3s ease-in-out infinite;
        }

        @keyframes lineDrop {
          0%, 100% { opacity: 0.3; transform: scaleY(0.8); }
          50% { opacity: 0.8; transform: scaleY(1); }
        }

        .error-shake {
          animation: shake 0.3s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>

      {/* Aurora background */}
      <div className="login-blob login-blob-1" />
      <div className="login-blob login-blob-2" />
      <div className="login-blob login-blob-3" />
      <div className="login-grain" />

      <div className={`min-h-screen flex ${syne.className}`} style={{ background: '#07071A', position: 'relative' }}>

        {/* ── LEFT PANEL ── */}
        <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden grid-bg" style={{ zIndex: 2 }}>

          {/* Decorative vertical lines */}
          <div className="diagonal-line" style={{ left: '20%', top: 0, bottom: 0, animationDelay: '0s' }} />
          <div className="diagonal-line" style={{ left: '50%', top: 0, bottom: 0, animationDelay: '1s' }} />
          <div className="diagonal-line" style={{ left: '80%', top: 0, bottom: 0, animationDelay: '2s' }} />

          {/* Violet radial glow */}
          <div
            style={{
              position: 'absolute',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)',
              bottom: '-100px',
              left: '-100px',
              pointerEvents: 'none',
            }}
          />

          {/* Top tag */}
          <div className="left-fade relative z-10">
            <div className="left-panel-tag">{t.auth.login.leftTag}</div>
          </div>

          {/* Center content */}
          <div className="relative z-10 left-fade" style={{ animationDelay: '0.1s' }}>
            <div className="mb-6">
              <span style={{
                fontSize: '10px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: '#6B6B6B',
                display: 'block',
                marginBottom: '16px'
              }}>
                {t.auth.login.leftSub}
              </span>
              <h1
                className="neon-glow klub-font"
                style={{
                  fontSize: 'clamp(72px, 8vw, 120px)',
                  fontWeight: 800,
                  lineHeight: 0.9,
                  letterSpacing: '-0.03em',
                  color: '#fff',
                  margin: 0,
                }}
              >
                KL
                <span style={{ color: '#7C3AED' }}>U</span>
                B
              </h1>
            </div>

            <p style={{ color: '#6B6B6B', fontSize: '15px', lineHeight: 1.6, maxWidth: '340px' }}>
              {t.auth.login.leftDesc}
            </p>
          </div>

          {/* Bottom stats */}
          <div className="relative z-10 left-fade" style={{ animationDelay: '0.2s' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1px',
              background: '#1A1A1A',
              border: '1px solid #1A1A1A',
            }}>
              {t.auth.login.stats.map((stat) => (
                <div key={stat.label} style={{ background: '#000', padding: '16px 20px' }}>
                  <div className="klub-font" style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>{stat.val}</div>
                  <div style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#6B6B6B', textTransform: 'uppercase', marginTop: '2px' }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 flex items-center justify-center px-8 py-12 relative" style={{ zIndex: 2, background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(0px)', borderLeft: '1px solid rgba(124,58,237,0.12)' }}>

          {/* Subtle top border accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #7C3AED, transparent)',
            opacity: 0.4,
          }} />

          <div className="w-full" style={{ maxWidth: '360px' }}>

            {/* Mobile logo */}
            <div className="lg:hidden mb-10 fade-up-1">
              <Link href="/">
                <h1 className="klub-font neon-glow" style={{ fontSize: '48px', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  KL<span style={{ color: '#7C3AED' }}>U</span>B
                </h1>
              </Link>
            </div>

            {/* Heading */}
            <div className="fade-up-1 mb-10">
              <h2 className="klub-font" style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '6px' }}>
                {t.auth.login.title}
              </h2>
              <p style={{ fontSize: '13px', color: '#6B6B6B' }}>
                {t.auth.login.subtitle}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="error-shake fade-up-1"
                style={{
                  borderLeft: '2px solid #FF0055',
                  paddingLeft: '12px',
                  marginBottom: '24px',
                  fontSize: '13px',
                  color: '#FF0055',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

              {/* Email */}
              <div className="field-wrap fade-up-2">
                <label className="field-label" htmlFor="email">{t.auth.login.email}</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="underline-input"
                  placeholder={t.auth.login.emailPlaceholder}
                  required
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="field-wrap fade-up-3">
                <label className="field-label" htmlFor="password">{t.auth.login.password}</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="underline-input"
                  placeholder={t.auth.login.passwordPlaceholder}
                  required
                  autoComplete="current-password"
                />
              </div>

              {/* Submit */}
              <div className="fade-up-4" style={{ paddingTop: '8px' }}>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <span style={{
                        width: '14px', height: '14px', borderRadius: '50%',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        display: 'inline-block',
                        animation: 'spin 0.6s linear infinite',
                      }} />
                      {t.auth.login.submitting}
                    </span>
                  ) : t.auth.login.submit}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="fade-up-5" style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #1A1A1A' }}>
              <p style={{ fontSize: '13px', color: '#6B6B6B', textAlign: 'center', marginBottom: '16px' }}>
                {t.auth.login.noAccount}{' '}
                <Link
                  href="/signup"
                  style={{ color: '#7C3AED', fontWeight: 700, textDecoration: 'none' }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                >
                  {t.auth.login.signup}
                </Link>
              </p>

              {/* Language toggle */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                  style={{ padding: '6px 14px', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', background: 'transparent', border: '1px solid #1A1A1A', color: '#444', cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.2s, color 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#7C3AED'; (e.currentTarget as HTMLButtonElement).style.color = '#7C3AED'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#1A1A1A'; (e.currentTarget as HTMLButtonElement).style.color = '#444'; }}
                >
                  <span style={{ color: lang === 'fr' ? '#fff' : '#555' }}>FR</span>
                  {' / '}
                  <span style={{ color: lang === 'en' ? '#fff' : '#555' }}>EN</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

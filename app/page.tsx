'use client';

import Link from 'next/link';
import { Syne } from 'next/font/google';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/hooks/useLanguage';

const syne = Syne({ subsets: ['latin'], weight: ['400', '700', '800'] });

export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tickerItems = [...t.home.ticker, ...t.home.ticker];

  return (
    <>
      <style>{`
        .lp-grid-bg {
          background-image:
            linear-gradient(rgba(124,58,237,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .neon-text {
          text-shadow: 0 0 60px rgba(124,58,237,0.5), 0 0 120px rgba(124,58,237,0.15);
        }

        .ticker-track {
          display: flex;
          gap: 48px;
          animation: ticker 28s linear infinite;
          white-space: nowrap;
        }

        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .lp-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #7C3AED;
          color: #fff;
          padding: 14px 28px;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s, transform 0.1s;
          font-family: inherit;
          border: none;
        }
        .lp-btn-primary:hover { background: #6D28D9; }
        .lp-btn-primary:active { transform: translateY(1px); }

        .lp-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: #fff;
          padding: 14px 28px;
          font-weight: 700;
          font-size: 13px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          border: 1px solid #1A1A1A;
          transition: border-color 0.2s, background 0.2s;
          font-family: inherit;
        }
        .lp-btn-ghost:hover { border-color: #7C3AED; background: rgba(124,58,237,0.05); }

        .feature-row {
          display: grid;
          grid-template-columns: 60px 1fr auto;
          gap: 32px;
          align-items: start;
          padding: 36px 0;
          border-bottom: 1px solid #111;
          transition: background 0.2s;
        }
        .feature-row:hover { background: rgba(124,58,237,0.02); }

        .role-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid #1A1A1A;
          padding: 6px 14px;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #E8E8E8;
          text-decoration: none;
          transition: border-color 0.2s, color 0.2s;
        }
        .role-pill:hover { border-color: #7C3AED; color: #7C3AED; }
        .role-pill .dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #00FF66;
        }

        .stat-block {
          padding: 40px 0;
          border-right: 1px solid #111;
        }
        .stat-block:last-child { border-right: none; }

        .nav-link {
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #E8E8E8;
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-link:hover { color: #fff; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu { animation: fadeUp 0.6s ease both; }
        .fu-d1 { animation: fadeUp 0.6s 0.1s ease both; }
        .fu-d2 { animation: fadeUp 0.6s 0.2s ease both; }
        .fu-d3 { animation: fadeUp 0.6s 0.3s ease both; }
        .fu-d4 { animation: fadeUp 0.6s 0.4s ease both; }

        .big-title {
          font-size: clamp(80px, 14vw, 200px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 0.88;
        }

        .section-label {
          font-size: 10px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #E8E8E8;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .section-label::before {
          content: '';
          display: block;
          width: 24px;
          height: 1px;
          background: #E8E8E8;
        }

        .hero-tagline {
          font-size: clamp(13px, 1.5vw, 16px);
          color: #E8E8E8;
          line-height: 1.6;
          max-width: 340px;
        }

        .scroll-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          opacity: 0.3;
          animation: fadeUp 1s 0.8s ease both;
        }
        .scroll-indicator span {
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }
        .scroll-line {
          width: 1px;
          height: 40px;
          background: linear-gradient(to bottom, #fff, transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%,100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        .cta-section {
          position: relative;
          overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .bg-canvas {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          will-change: transform;
        }

        .blob-1 {
          width: 600px; height: 600px;
          background: radial-gradient(circle, #7C3AED 0%, transparent 70%);
          top: -200px; left: -100px;
          animation: drift1 18s ease-in-out infinite;
        }
        .blob-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, #4F1DED 0%, transparent 70%);
          bottom: 0; right: -150px;
          animation: drift2 22s ease-in-out infinite;
          opacity: 0.12;
        }
        .blob-3 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, #00FF66 0%, transparent 70%);
          top: 40%; left: 60%;
          animation: drift3 26s ease-in-out infinite;
          opacity: 0.06;
        }
        .blob-4 {
          width: 280px; height: 280px;
          background: radial-gradient(circle, #7C3AED 0%, transparent 70%);
          top: 70%; left: 20%;
          animation: drift4 20s ease-in-out infinite;
          opacity: 0.1;
        }

        @keyframes drift1 {
          0%,100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(80px, 120px) scale(1.1); }
          66% { transform: translate(-40px, 60px) scale(0.95); }
        }
        @keyframes drift2 {
          0%,100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-100px, -80px) scale(1.15); }
          66% { transform: translate(60px, -40px) scale(0.9); }
        }
        @keyframes drift3 {
          0%,100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-120px, 80px) scale(1.2); }
        }
        @keyframes drift4 {
          0%,100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(80px, -60px) scale(1.1); }
          80% { transform: translate(-40px, 40px) scale(0.9); }
        }

        .grain {
          position: fixed;
          inset: -200%;
          width: 400%;
          height: 400%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.035;
          pointer-events: none;
          z-index: 1;
          animation: grainShift 0.15s steps(1) infinite;
        }

        @keyframes grainShift {
          0%   { transform: translate(0, 0); }
          10%  { transform: translate(-2%, -3%); }
          20%  { transform: translate(3%, 2%); }
          30%  { transform: translate(-1%, 4%); }
          40%  { transform: translate(4%, -1%); }
          50%  { transform: translate(-3%, 2%); }
          60%  { transform: translate(2%, 3%); }
          70%  { transform: translate(-4%, -2%); }
          80%  { transform: translate(1%, -4%); }
          90%  { transform: translate(3%, 1%); }
          100% { transform: translate(-2%, 3%); }
        }

        .lang-toggle-home {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: 1px solid #1A1A1A;
          cursor: pointer;
          padding: 4px 10px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #555;
          font-family: inherit;
          transition: border-color 0.2s, color 0.2s;
        }
        .lang-toggle-home:hover { border-color: #7C3AED; color: #7C3AED; }
      `}</style>

      <div className={`min-h-screen bg-black text-white ${syne.className}`} style={{ position: 'relative' }}>

        {/* ── ANIMATED BACKGROUND ── */}
        <div className="bg-canvas">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          <div className="blob blob-4" />
        </div>
        <div className="grain" />

        {/* ── NAVBAR ── */}
        <nav style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          borderBottom: '1px solid #0D0D0D',
          background: scrollY > 20 ? 'rgba(0,0,0,0.95)' : 'transparent',
          backdropFilter: scrollY > 20 ? 'blur(12px)' : 'none',
          transition: 'background 0.3s, backdrop-filter 0.3s',
          padding: '0 40px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="neon-text" style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              KL<span style={{ color: '#7C3AED' }}>U</span>B
            </span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link href="/rental" className="nav-link">{t.nav.equipment}</Link>
            <Link href="/projects" className="nav-link">{t.nav.projects}</Link>
            <div style={{ width: '1px', height: '16px', background: '#1A1A1A' }} />
            <Link href="/login" className="nav-link">{t.nav.login}</Link>
            <Link href="/signup" className="lp-btn-primary" style={{ padding: '8px 18px', fontSize: '11px' }}>
              {t.nav.signup}
            </Link>
            {/* Language toggle */}
            <button
              className="lang-toggle-home"
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              title={lang === 'fr' ? 'Switch to English' : 'Passer en français'}
            >
              <span style={{ color: lang === 'fr' ? '#fff' : '#555' }}>FR</span>
              <span style={{ color: '#333' }}>/</span>
              <span style={{ color: lang === 'en' ? '#fff' : '#555' }}>EN</span>
            </button>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="lp-grid-bg" style={{
          minHeight: '100vh',
          paddingTop: '60px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 2,
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', width: '800px', height: '800px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
            top: '0', right: '-200px', pointerEvents: 'none',
          }} />

          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            justifyContent: 'center', padding: '60px 40px 40px',
          }}>
            <div className="section-label fu" style={{ marginBottom: '32px' }}>
              {t.home.platformLabel}
            </div>

            <div className="fu-d1" style={{ marginBottom: '40px' }}>
              <h1 className="big-title neon-text">
                KL<span style={{ color: '#7C3AED' }}>U</span>B
              </h1>
              <div style={{
                fontSize: 'clamp(14px, 2vw, 18px)',
                color: '#E8E8E8',
                fontWeight: 400,
                letterSpacing: '0.02em',
                marginTop: '16px',
                paddingLeft: '4px',
              }}>
                {t.home.subtitle}
              </div>
            </div>

            <div className="fu-d2" style={{
              display: 'flex',
              flexDirection: 'column' as const,
              gap: '32px',
              maxWidth: '600px',
            }}>
              <p className="hero-tagline">{t.home.tagline}</p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const }}>
                <Link href="/signup" className="lp-btn-primary">
                  {t.home.ctaPrimary}
                </Link>
                <Link href="/rental" className="lp-btn-ghost">
                  {t.home.ctaSecondary}
                </Link>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <Link href="/signup?role=BDE" className="role-pill">
                  <span className="dot" /> {t.home.iAmBDE}
                </Link>
                <Link href="/signup?role=ORGA" className="role-pill">
                  <span className="dot" style={{ background: '#7C3AED' }} /> {t.home.iAmOrga}
                </Link>
              </div>
            </div>
          </div>

          <div className="scroll-indicator" style={{ paddingBottom: '32px', alignSelf: 'center' }}>
            <div className="scroll-line" />
            <span>Scroll</span>
          </div>
        </section>

        {/* ── TICKER ── */}
        <div style={{
          position: 'relative', zIndex: 2,
          borderTop: '1px solid #111',
          borderBottom: '1px solid #111',
          padding: '16px 0',
          overflow: 'hidden',
          background: '#050505',
        }}>
          <div className="ticker-track">
            {tickerItems.map((item, i) => (
              <span key={i} style={{
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: i % 3 === 1 ? '#7C3AED' : '#E8E8E8',
                flexShrink: 0,
              }}>
                {item}
                <span style={{ marginLeft: '48px', color: '#1A1A1A' }}>◆</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── FEATURES ── */}
        <section style={{ padding: '100px 40px', maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px' }}>
            <div>
              <div className="section-label" style={{ marginBottom: '12px' }}>{t.home.whatWeDo}</div>
              <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
                {t.home.everythingYouNeed.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < t.home.everythingYouNeed.split('\n').length - 1 && <br />}</span>
                ))}
              </h2>
            </div>
            <div style={{ fontSize: '11px', color: '#E8E8E8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {t.home.features}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #111' }}>
            {t.home.features_list.map((f) => (
              <div key={f.num} className="feature-row">
                <div style={{
                  fontSize: '11px', letterSpacing: '0.1em',
                  color: '#E8E8E8', paddingTop: '4px', fontWeight: 700
                }}>
                  {f.num}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '10px' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#E8E8E8', lineHeight: 1.7, maxWidth: '480px' }}>
                    {f.desc}
                  </p>
                </div>
                <div style={{
                  fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: '#E8E8E8', border: '1px solid #333', padding: '4px 10px',
                  whiteSpace: 'nowrap', alignSelf: 'flex-start',
                }}>
                  {f.tag}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── STATS ── */}
        <section style={{
          borderTop: '1px solid #111',
          borderBottom: '1px solid #111',
          background: 'rgba(3,3,3,0.7)',
          backdropFilter: 'blur(20px)',
          position: 'relative', zIndex: 2,
        }}>
          <div style={{
            maxWidth: '900px', margin: '0 auto',
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          }}>
            {[t.home.stats.bde, t.home.stats.providers, t.home.stats.rating].map((s) => (
              <div key={s.label} className="stat-block" style={{ padding: '48px 40px' }}>
                <div style={{
                  fontSize: 'clamp(40px, 5vw, 64px)',
                  fontWeight: 800,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  color: '#fff',
                  marginBottom: '8px',
                }}>
                  {s.val}
                  <span style={{ color: '#7C3AED' }}>.</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '4px' }}>{s.label}</div>
                <div style={{ fontSize: '11px', color: '#E8E8E8', letterSpacing: '0.05em' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="cta-section" style={{ padding: '120px 40px', textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div className="section-label" style={{ justifyContent: 'center', marginBottom: '24px' }}>
              {t.home.joinKlub}
            </div>
            <h2 style={{
              fontSize: 'clamp(40px, 7vw, 80px)',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 0.95,
              marginBottom: '32px',
            }}>
              {t.home.nextEventStartsHere.split('\n').map((line, i, arr) => (
                <span key={i}>
                  {i === arr.length - 1 ? <span style={{ color: '#7C3AED' }}>{line}</span> : line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p style={{ fontSize: '15px', color: '#E8E8E8', marginBottom: '40px', lineHeight: 1.6 }}>
              {t.home.freeSignup}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup?role=BDE" className="lp-btn-primary">
                {t.home.iAmBDE} →
              </Link>
              <Link href="/signup?role=ORGA" className="lp-btn-ghost">
                {t.home.iAmOrga} →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{
          position: 'relative', zIndex: 2,
          borderTop: '1px solid #0D0D0D',
          padding: '32px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>
            KL<span style={{ color: '#7C3AED' }}>U</span>B
          </span>
          <div style={{ display: 'flex', gap: '24px' }}>
            <Link href="/login" className="nav-link">{t.nav.login}</Link>
            <Link href="/signup" className="nav-link">{t.nav.signup}</Link>
            <Link href="/rental" className="nav-link">{t.nav.equipment}</Link>
            <Link href="/projects" className="nav-link">{t.nav.projects}</Link>
          </div>
          <span style={{ fontSize: '11px', color: '#E8E8E8', letterSpacing: '0.08em' }}>
            © 2026 KLUB
          </span>
        </footer>

      </div>
    </>
  );
}

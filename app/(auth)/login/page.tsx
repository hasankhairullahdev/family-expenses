"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const QUICK_USERS = [
  {
    name: "Hasan",
    email: process.env.NEXT_PUBLIC_QUICK_USER_HASAN_EMAIL ?? "hasan@family.local",
    password: process.env.NEXT_PUBLIC_QUICK_USER_HASAN_PASSWORD ?? "hasan123",
  },
  {
    name: "Lia",
    email: process.env.NEXT_PUBLIC_QUICK_USER_LIA_EMAIL ?? "lia@family.local",
    password: process.env.NEXT_PUBLIC_QUICK_USER_LIA_PASSWORD ?? "lia123",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah. Silakan coba lagi.");
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleQuickLogin(user: typeof QUICK_USERS[number]) {
    setError("");
    setQuickLoading(user.name);
    try {
      const result = await signIn("credentials", {
        email: user.email,
        password: user.password,
        redirect: false,
      });
      if (result?.error) {
        setError("Login gagal. Silakan coba lagi.");
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setQuickLoading(null);
    }
  }

  return (
    <div className="login-root">
      {/* Background decorative layer */}
      <div className="bg-layer" aria-hidden="true">
        <div className="bg-vignette" />
        <div className="bg-maroon-glow" />
        <div className="bg-grid" />
      </div>

      {/* Corner ornaments */}
      <svg
        className="ornament ornament-tl"
        viewBox="0 0 120 120"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 2 L60 2 M2 2 L2 60"
          stroke="rgba(155,28,28,0.5)"
          strokeWidth="1.5"
        />
        <path
          d="M10 10 L50 10 M10 10 L10 50"
          stroke="rgba(212,175,55,0.25)"
          strokeWidth="0.8"
        />
        <circle cx="2" cy="2" r="3" fill="rgba(155,28,28,0.7)" />
      </svg>
      <svg
        className="ornament ornament-br"
        viewBox="0 0 120 120"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M118 118 L60 118 M118 118 L118 60"
          stroke="rgba(155,28,28,0.5)"
          strokeWidth="1.5"
        />
        <path
          d="M110 110 L70 110 M110 110 L110 70"
          stroke="rgba(212,175,55,0.25)"
          strokeWidth="0.8"
        />
        <circle cx="118" cy="118" r="3" fill="rgba(155,28,28,0.7)" />
      </svg>

      {/* Login card */}
      <main className="card-wrapper">
        <div className="card">
          {/* Top maroon accent bar */}
          <div className="card-accent-bar" aria-hidden="true" />

          {/* Header */}
          <header className="card-header">
            {/* Monogram / crest */}
            <div className="crest" aria-hidden="true">
              <svg viewBox="0 0 56 56" fill="none" className="crest-svg">
                <circle
                  cx="28"
                  cy="28"
                  r="27"
                  stroke="rgba(155,28,28,0.7)"
                  strokeWidth="1"
                />
                <circle
                  cx="28"
                  cy="28"
                  r="21"
                  stroke="rgba(212,175,55,0.3)"
                  strokeWidth="0.5"
                />
                <text
                  x="50%"
                  y="54%"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fontSize="18"
                  fontFamily="Georgia, serif"
                  fill="rgba(212,175,55,0.85)"
                  letterSpacing="2"
                >
                  KK
                </text>
              </svg>
            </div>

            <h1 className="title">Keuangan Keluarga</h1>

            {/* Decorative divider */}
            <div className="divider" aria-hidden="true">
              <span className="divider-line" />
              <span className="divider-diamond">◆</span>
              <span className="divider-line" />
            </div>

            <p className="subtitle">Hasan &amp; Lia</p>
          </header>

          {/* Quick login buttons */}
          <div className="quick-login">
            <p className="quick-label">Masuk sebagai</p>
            <div className="quick-buttons">
              {QUICK_USERS.map((u) => (
                <button
                  key={u.name}
                  type="button"
                  onClick={() => handleQuickLogin(u)}
                  disabled={!!quickLoading || loading}
                  className="quick-btn"
                >
                  <span className="quick-avatar">
                    {u.name[0]}
                  </span>
                  {quickLoading === u.name ? (
                    <svg className="spinner" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeDasharray="50" strokeDashoffset="15" />
                    </svg>
                  ) : (
                    u.name
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="form-divider">
            <span className="form-divider-line" />
            <span className="form-divider-text">atau masuk manual</span>
            <span className="form-divider-line" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="field-group">
              <div className="field">
                <label htmlFor="email" className="field-label">
                  Email
                </label>
                <div className="input-wrapper">
                  <svg
                    className="input-icon"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 5.5A1.5 1.5 0 014 4h12a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 0116 16H4a1.5 1.5 0 01-1.5-1.5v-9z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M2.5 5.5l7.5 5.5 7.5-5.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    placeholder="email@contoh.com"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="password" className="field-label">
                  Password
                </label>
                <div className="input-wrapper">
                  <svg
                    className="input-icon"
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect
                      x="4"
                      y="8.5"
                      width="12"
                      height="9"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M7 8.5V6a3 3 0 016 0v2.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <circle cx="10" cy="13" r="1.2" fill="currentColor" />
                  </svg>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="error-banner" role="alert">
                <svg
                  className="error-icon"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="10"
                    cy="10"
                    r="8.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M10 6v5M10 13.5v.5"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!quickLoading}
              className="submit-btn"
            >
              {loading ? (
                <>
                  <svg
                    className="spinner"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray="50"
                      strokeDashoffset="15"
                    />
                  </svg>
                  Masuk…
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* Footer note */}
          <footer className="card-footer">
            <p>Akses terbatas untuk anggota keluarga</p>
          </footer>
        </div>
      </main>

      <style>{`
        /* ── Reset & root ─────────────────────────────────── */
        .login-root {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          background: #fdf8f0;
          overflow: hidden;
          font-family: var(--font-sans, 'Inter', sans-serif);
        }

        /* ── Background layers ────────────────────────────── */
        .bg-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .bg-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 100% 80% at 50% 0%,
            rgba(155,28,28,0.06) 0%,
            transparent 60%);
        }
        .bg-maroon-glow {
          position: absolute;
          bottom: -10%;
          right: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(ellipse at center,
            rgba(212,175,55,0.08) 0%,
            transparent 70%);
          filter: blur(60px);
        }
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(155,28,28,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(155,28,28,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* ── Corner ornaments ─────────────────────────────── */
        .ornament {
          position: absolute;
          width: 120px;
          height: 120px;
          pointer-events: none;
        }
        .ornament-tl { top: 1.5rem; left: 1.5rem; }
        .ornament-br { bottom: 1.5rem; right: 1.5rem; }

        /* ── Card wrapper ─────────────────────────────────── */
        .card-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
        }

        .card {
          background: #ffffff;
          border: 1px solid rgba(155,28,28,0.15);
          border-radius: 16px;
          padding: 0 0 2rem 0;
          box-shadow:
            0 0 0 1px rgba(212,175,55,0.08) inset,
            0 20px 60px rgba(155,28,28,0.08),
            0 4px 16px rgba(0,0,0,0.06);
          overflow: hidden;
        }

        /* ── Top accent bar ───────────────────────────────── */
        .card-accent-bar {
          height: 4px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(155,28,28,0.4) 10%,
            #9b1c1c 40%,
            #7f1d1d 50%,
            #9b1c1c 60%,
            rgba(155,28,28,0.4) 90%,
            transparent 100%);
          margin-bottom: 0;
        }

        /* ── Card header ──────────────────────────────────── */
        .card-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 2.25rem 2.5rem 1.75rem;
          gap: 0;
        }

        /* ── Crest / monogram ─────────────────────────────── */
        .crest {
          margin-bottom: 1.25rem;
        }
        .crest-svg {
          width: 56px;
          height: 56px;
        }

        /* ── Title ────────────────────────────────────────── */
        .title {
          font-family: var(--font-heading, 'Playfair Display', Georgia, serif);
          font-size: 1.65rem;
          font-weight: 600;
          color: #2e2820;
          letter-spacing: 0.02em;
          text-align: center;
          line-height: 1.2;
          margin: 0;
        }

        /* ── Decorative divider ───────────────────────────── */
        .divider {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin: 0.9rem 0 0.6rem;
          width: 100%;
          max-width: 200px;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg,
            transparent,
            rgba(212,175,55,0.6),
            transparent);
        }
        .divider-diamond {
          color: rgba(212,175,55,0.8);
          font-size: 0.55rem;
          line-height: 1;
        }

        /* ── Subtitle ─────────────────────────────────────── */
        .subtitle {
          font-size: 0.8rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #b8960c;
          margin: 0;
          font-weight: 500;
        }

        /* ── Form ─────────────────────────────────────────── */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 0 2.5rem;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .field-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #8c7f6e;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 0.85rem;
          width: 15px;
          height: 15px;
          color: rgba(155,28,28,0.5);
          pointer-events: none;
          flex-shrink: 0;
        }

        .input {
          width: 100%;
          background: #fdf8f0;
          border: 1px solid #e8d5b4;
          border-radius: 10px;
          padding: 0.72rem 0.85rem 0.72rem 2.5rem;
          font-size: 0.9rem;
          color: #2e2820;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          font-family: inherit;
          -webkit-appearance: none;
        }
        .input::placeholder {
          color: #b8ad9e;
        }
        .input:focus {
          border-color: #9b1c1c;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(155,28,28,0.10);
        }
        .input:-webkit-autofill,
        .input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 100px #fdf8f0 inset !important;
          -webkit-text-fill-color: #2e2820 !important;
          caret-color: #2e2820;
        }

        /* ── Error banner ─────────────────────────────────── */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.65rem 0.85rem;
          background: #fce8e8;
          border: 1px solid rgba(155,28,28,0.25);
          border-radius: 10px;
          font-size: 0.82rem;
          color: #9b1c1c;
          line-height: 1.4;
        }
        .error-icon {
          width: 15px;
          height: 15px;
          flex-shrink: 0;
          color: #9b1c1c;
        }

        /* ── Submit button ────────────────────────────────── */
        .submit-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.82rem;
          background: #9b1c1c;
          border: 1px solid rgba(212,175,55,0.25);
          border-radius: 10px;
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s, transform 0.12s;
          font-family: inherit;
          margin-top: 0.25rem;
          overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg,
            rgba(255,255,255,0.08) 0%,
            transparent 100%);
          pointer-events: none;
        }
        .submit-btn:hover:not(:disabled) {
          background: #7f1d1d;
          box-shadow: 0 6px 24px rgba(155,28,28,0.3);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(1px);
          box-shadow: 0 2px 12px rgba(155,28,28,0.2);
        }
        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .submit-btn:focus-visible {
          outline: 2px solid rgba(212,175,55,0.6);
          outline-offset: 2px;
        }

        /* ── Spinner ──────────────────────────────────────── */
        .spinner {
          width: 15px;
          height: 15px;
          animation: spin 0.75s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── Quick login ──────────────────────────────────── */
        .quick-login {
          padding: 1.5rem 2.5rem 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .quick-label {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #8c7f6e;
          margin: 0;
        }
        .quick-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          width: 100%;
        }
        .quick-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1.5px solid rgba(155,28,28,0.2);
          background: #fdf8f0;
          color: #2e2820;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.1s;
          letter-spacing: 0.02em;
        }
        .quick-btn:hover:not(:disabled) {
          background: #fff;
          border-color: #9b1c1c;
          box-shadow: 0 4px 16px rgba(155,28,28,0.12);
        }
        .quick-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .quick-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .quick-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(155,28,28,0.1);
          border: 1px solid rgba(155,28,28,0.2);
          color: #9b1c1c;
          font-size: 0.8rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        /* ── Form divider ─────────────────────────────────── */
        .form-divider {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 2.5rem 0;
        }
        .form-divider-line {
          flex: 1;
          height: 1px;
          background: #e8d5b4;
        }
        .form-divider-text {
          font-size: 0.68rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #b8ad9e;
          white-space: nowrap;
        }

        /* ── Card footer ──────────────────────────────────── */
        .card-footer {
          margin-top: 1.75rem;
          padding: 0 2.5rem;
          text-align: center;
        }
        .card-footer p {
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          color: #b8ad9e;
          margin: 0;
          position: relative;
        }
        .card-footer p::before,
        .card-footer p::after {
          content: '——';
          margin: 0 0.5rem;
          color: rgba(155,28,28,0.2);
        }

        /* ── Responsive ───────────────────────────────────── */
        @media (max-width: 480px) {
          .card-header { padding: 2rem 1.75rem 1.5rem; }
          .quick-login { padding: 1.25rem 1.75rem 0; }
          .form-divider { padding: 1rem 1.75rem 0; }
          .login-form { padding: 0 1.75rem; }
          .card-footer { padding: 0 1.75rem; }
          .title { font-size: 1.4rem; }
          .ornament { width: 80px; height: 80px; }
        }
      `}</style>
    </div>
  );
}

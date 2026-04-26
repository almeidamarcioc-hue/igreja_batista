// src/components/Login/LoginForm.jsx
import React, { useState } from 'react';
import {
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  SpinnerIcon,
  UserIcon,
} from './icons';
import { DEFAULT_VERSE, DEFAULT_VERSE_REF } from './slides';

export default function LoginForm({
  onLogin,
  logoSrc = '/logo.png',
  verse = DEFAULT_VERSE,
  verseRef = DEFAULT_VERSE_REF,
}) {
  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  function flashToast(msg, kind = 'ok') {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2400);
  }

  async function submit(e) {
    e.preventDefault();
    if (!user || !pwd) {
      flashToast('Preencha usuário e senha', 'warn');
      return;
    }
    setLoading(true);
    try {
      if (onLogin) {
        await onLogin(user, pwd);
      } else {
        await new Promise((r) => setTimeout(r, 900));
      }
      flashToast(`Bem-vindo, ${user}.`, 'ok');
    } catch (err) {
      flashToast(err?.message || 'Falha ao entrar', 'warn');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ibtm-form-side">
      <div className="ibtm-form-inner">
        <div className="ibtm-logo-stack">
          <img src={logoSrc} alt="IBTM" className="ibtm-logo-img" />
          <div className="ibtm-brand-line">Igreja Batista Tabernáculo da Manhã</div>
        </div>

        <div style={{ marginTop: 56 }}>
          <h1 className="ibtm-heading">
            Acesse sua <em>conta</em>.
          </h1>
          <p className="ibtm-subheading">
            Bem-vindo de volta. Entre com suas credenciais para acessar os recursos da
            sua área ministerial.
          </p>
        </div>

        <form
          onSubmit={submit}
          style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 18 }}
        >
          {/* Usuário */}
          <div>
            <label className="ibtm-field-label">Usuário</label>
            <div className="ibtm-input-wrap">
              <span className="ibtm-input-icon-left">
                <UserIcon />
              </span>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="ex. pastor.daniel"
                className="ibtm-field"
                style={{ paddingLeft: 46 }}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="ibtm-field-label">Senha</label>
              <a href="#" className="ibtm-link-quiet">Esqueci minha senha</a>
            </div>
            <div className="ibtm-input-wrap">
              <span className="ibtm-input-icon-left">
                <LockIcon />
              </span>
              <input
                type={showPwd ? 'text' : 'password'}
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="••••••••"
                className="ibtm-field"
                style={{ paddingLeft: 46, paddingRight: 46 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="ibtm-eye-btn"
                onClick={() => setShowPwd((v) => !v)}
                aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPwd ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="ibtm-btn-primary"
            disabled={loading}
            style={{ marginTop: 8 }}
          >
            {loading ? (
              <>
                <SpinnerIcon /> Entrando...
              </>
            ) : (
              <>
                Entrar <ArrowRightIcon />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: 32, fontSize: 13, color: 'var(--ibtm-ink-mute)' }}>
          Ainda não tem acesso?{' '}
          <a
            href="#"
            style={{ color: 'var(--ibtm-primary)', textDecoration: 'none', fontWeight: 500 }}
          >
            Fale com a secretaria
          </a>
        </div>
      </div>

      <div className="ibtm-verse-corner">
        <em>{verse}</em>{' '}
        <span style={{ opacity: 0.7 }}>· {verseRef}</span>
      </div>

      {toast && (
        <div className="ibtm-toast is-show">
          {toast.kind === 'ok' && <CheckIcon />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

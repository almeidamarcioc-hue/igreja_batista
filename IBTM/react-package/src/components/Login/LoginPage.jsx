// src/components/Login/LoginPage.jsx
// Componente raiz — importe este no seu app.
import React from 'react';
import './Login.css';
import LoginForm from './LoginForm';
import MediaCarousel from './MediaCarousel';

/**
 * @typedef {Object} LoginPageProps
 * @property {(user: string, pwd: string) => Promise<any>} [onLogin]
 *    Função chamada ao submeter. Receberá usuário e senha. Pode ser async.
 *    Se omitida, simula um login com toast.
 * @property {string} [logoSrc]   Caminho da imagem do logo (default: '/logo.png')
 * @property {string} [verse]     Versículo no rodapé
 * @property {string} [verseRef]  Referência do versículo
 * @property {Array}  [slides]    Slides customizados (ver slides.js)
 */

export default function LoginPage({
  onLogin,
  logoSrc,
  verse,
  verseRef,
  slides,
}) {
  return (
    <div className="ibtm-login-grid">
      <LoginForm
        onLogin={onLogin}
        logoSrc={logoSrc}
        verse={verse}
        verseRef={verseRef}
      />
      <MediaCarousel slides={slides} />
    </div>
  );
}

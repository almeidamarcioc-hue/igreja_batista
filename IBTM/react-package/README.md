# IBTM Login — Pacote React pronto para incorporar

Tela de login completa para o sistema da Igreja Batista Tabernáculo da Manhã.
Stack: **React 18 + TypeScript-friendly + CSS puro**. Sem dependências além do React.

## 📦 Estrutura de arquivos

```
src/
  components/
    Login/
      LoginPage.jsx        ← componente raiz (importe este)
      LoginForm.jsx        ← formulário (lado esquerdo)
      MediaCarousel.jsx    ← carrossel (lado direito)
      DecoShapes.jsx       ← formas decorativas SVG
      icons.jsx            ← ícones inline
      slides.js            ← dados dos slides (edite aqui)
      Login.css            ← estilos
public/
  logo.png                 ← seu logo (88x88 recomendado)
```

## 🚀 Como usar

### 1. Instalar fontes
No `<head>` do seu `index.html` (ou via `next/font`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Instrument+Serif:ital@1&family=Geist:wght@300;400;500;600&display=swap" rel="stylesheet">
```

### 2. Importar no app
```jsx
import LoginPage from './components/Login/LoginPage';

export default function App() {
  return <LoginPage onLogin={(user, pwd) => {
    // chame seu auth aqui
    console.log('login', user, pwd);
  }} />;
}
```

### 3. Customizar
- **Slides:** edite `slides.js` (texto, gradientes, cores)
- **Cores:** as variáveis CSS estão no topo de `Login.css`
- **Logo:** substitua `public/logo.png` pelo seu

## 🎨 Paleta (cores do logo IBTM)

| Variável        | Hex       | Uso                              |
|-----------------|-----------|----------------------------------|
| `--navy`        | `#1F1F4D` | texto, fundo do carrossel        |
| `--primary`     | `#4848A8` | botão, links, marca              |
| `--accent`      | `#F07848` | laranja vibrante                 |
| `--teal`        | `#30C0A8` | verde-água                       |
| `--skyblue`     | `#0090D8` | azul brilhante                   |
| `--yellow`      | `#F8D800` | amarelo                          |
| `--paper`       | `#FAFAF7` | fundo do formulário              |

## 📝 Props do `LoginPage`

| Prop        | Tipo                          | Default                           |
|-------------|-------------------------------|-----------------------------------|
| `onLogin`   | `(user, pwd) => Promise<any>` | mock (apenas mostra toast)        |
| `logoSrc`   | `string`                      | `'/logo.png'`                     |
| `verse`     | `string`                      | Salmo 23:1                        |
| `verseRef`  | `string`                      | `"Salmo 23:1"`                    |
| `slides`    | `Slide[]`                     | 4 slides incluídos                |

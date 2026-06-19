#  CSS Visual Generator

**The ultimate CSS visual design tool — all generators in one premium interface.**

> Generate beautiful CSS gradients, shadows, filters, glassmorphism, neumorphism, and more with real-time preview and one-click copy.

---

##  Features

-  **10 CSS Generators** — Gradient, Box Shadow, Text Shadow, Border Radius, CSS Filters, Glassmorphism, Neumorphism, Gradient Animation, Mesh Gradient, Noise Texture
-  **Dark/Light Mode** — Gorgeous dark theme default with instant theme switching
-  **One-Click Copy** — Copy generated CSS in Plain CSS, Tailwind, or SCSS format
-  **Save Presets** — Save and load your favorite settings per generator
-  **Undo/Redo** — Up to 20 steps of history with Ctrl+Z / Ctrl+Shift+Z
-  **Share via URL** — Encode any generator state into a shareable link
-  **Fully Responsive** — Mobile-first design, works beautifully on all screen sizes
-  **Blazing Fast** — Lazy loaded generators, debounced inputs, memoized computations
-  **Zero Dependencies** — No UI libraries, custom CSS only
-  **Accessible** — WCAG contrast checker, 44px touch targets, keyboard shortcuts

##  Tech Stack

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Custom_Properties-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?logo=javascript&logoColor=black)

##  Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd css-visual-generator

# Install dependencies
npm install

# Start dev server
npm run dev
```

##  Build for Production

```bash
npm run build
```

Deploy the `dist/` folder to Vercel, Netlify, or any static host.

##  Live Demo

[View Live Demo →](https://css-visual-generator.vercel.app)

## 📁 Project Structure

```
src/
  components/
    Navbar.jsx
    generators/          # 10 CSS generators
    shared/              # Reusable components
  hooks/                 # Custom React hooks
  utils/                 # CSS generators, color utils, URL encoding
  App.jsx
  index.css              # Design system with CSS variables
  main.jsx
```

## License

MIT

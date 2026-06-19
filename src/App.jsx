import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import Navbar from './components/Navbar.jsx';
import { decodeStateFromUrl, clearUrlState } from './utils/urlEncoder.js';

// Lazy load generators
const GradientGenerator = lazy(() => import('./components/generators/GradientGenerator.jsx'));
const BoxShadowGenerator = lazy(() => import('./components/generators/BoxShadowGenerator.jsx'));
const TextShadowGenerator = lazy(() => import('./components/generators/TextShadowGenerator.jsx'));
const BorderRadiusGenerator = lazy(() => import('./components/generators/BorderRadiusGenerator.jsx'));
const FilterGenerator = lazy(() => import('./components/generators/FilterGenerator.jsx'));
const GlassmorphismGenerator = lazy(() => import('./components/generators/GlassmorphismGenerator.jsx'));
const NeumorphismGenerator = lazy(() => import('./components/generators/NeumorphismGenerator.jsx'));
const GradientAnimationGenerator = lazy(() => import('./components/generators/GradientAnimationGenerator.jsx'));
const MeshGradientGenerator = lazy(() => import('./components/generators/MeshGradientGenerator.jsx'));
const NoiseTextureGenerator = lazy(() => import('./components/generators/NoiseTextureGenerator.jsx'));

function LoadingFallback() {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" stroke="currentColor" fill="none" style={{ opacity: 0.8, color: 'var(--color-primary)' }}>
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
            .spinner-svg { animation: spin 1s linear infinite; transform-origin: center; }
          `}</style>
          <circle className="spinner-svg" cx="12" cy="12" r="10" strokeWidth="2.5" strokeDasharray="32" strokeLinecap="round" />
        </svg>
      </div>
      <p className="empty-state-text">Loading generator...</p>
    </div>
  );
}

const TAB_TO_GENERATOR_MAP = {
  'gradient': 'gradient',
  'box-shadow': 'boxShadow',
  'text-shadow': 'textShadow',
  'border-radius': 'borderRadius',
  'filters': 'filters',
  'glassmorphism': 'glassmorphism',
  'neumorphism': 'neumorphism',
  'gradient-animation': 'gradientAnimation',
  'mesh-gradient': 'meshGradient',
  'noise-texture': 'noiseTexture',
};

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('css-gen-theme') || 'light';
  });

  const [activeTab, setActiveTab] = useState(() => {
    const urlState = decodeStateFromUrl();
    if (urlState) return urlState.generatorId;
    return 'gradient';
  });

  const [sharedState, setSharedState] = useState(() => {
    const urlState = decodeStateFromUrl();
    if (urlState) return { generatorId: urlState.generatorId, state: urlState.state };
    return null;
  });

  // Theme toggle
  const handleThemeToggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('css-gen-theme', next);
      return next;
    });
  }, []);

  // Tab change
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setSharedState(null);
    clearUrlState();
  }, []);

  // Global keyboard shortcuts: Ctrl+Z, Ctrl+Shift+Z
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          document.dispatchEvent(new CustomEvent('css-gen-redo'));
        } else {
          document.dispatchEvent(new CustomEvent('css-gen-undo'));
        }
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const getInitialState = useCallback((generatorId) => {
    if (sharedState && TAB_TO_GENERATOR_MAP[sharedState.generatorId] === generatorId) {
      return sharedState.state;
    }
    return undefined;
  }, [sharedState]);

  const renderGenerator = useCallback(() => {
    switch (activeTab) {
      case 'gradient':
        return <GradientGenerator initialState={getInitialState('gradient')} />;
      case 'box-shadow':
        return <BoxShadowGenerator initialState={getInitialState('boxShadow')} />;
      case 'text-shadow':
        return <TextShadowGenerator initialState={getInitialState('textShadow')} />;
      case 'border-radius':
        return <BorderRadiusGenerator initialState={getInitialState('borderRadius')} />;
      case 'filters':
        return <FilterGenerator initialState={getInitialState('filters')} />;
      case 'glassmorphism':
        return <GlassmorphismGenerator initialState={getInitialState('glassmorphism')} />;
      case 'neumorphism':
        return <NeumorphismGenerator initialState={getInitialState('neumorphism')} />;
      case 'gradient-animation':
        return <GradientAnimationGenerator initialState={getInitialState('gradientAnimation')} />;
      case 'mesh-gradient':
        return <MeshGradientGenerator initialState={getInitialState('meshGradient')} />;
      case 'noise-texture':
        return <NoiseTextureGenerator initialState={getInitialState('noiseTexture')} />;
      default:
        return null;
    }
  }, [activeTab, getInitialState]);

  return (
    <>
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />
      <main className="main-content">
        <Suspense fallback={<LoadingFallback />}>
          <div className="generator-enter" key={activeTab}>
            {renderGenerator()}
          </div>
        </Suspense>
      </main>
      <footer className="app-footer">
        <div className="app-footer-credits">
          Developed by Syed Azmul Haque
        </div>
        <a
          href="https://azmul123.github.io/portfolio/"
          target="_blank"
          rel="noopener noreferrer"
          className="app-footer-link"
        >
          <svg className="app-footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
          GitHub Portfolio
        </a>
      </footer>
    </>
  );
}

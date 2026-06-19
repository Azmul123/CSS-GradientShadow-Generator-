import React, { useCallback, useRef, useEffect, useState } from 'react';

const TABS = [
  { id: 'gradient', label: 'Gradient', icon: '◩' },
  { id: 'box-shadow', label: 'Box Shadow', icon: '❑' },
  { id: 'text-shadow', label: 'Text Shadow', icon: '✎' },
  { id: 'border-radius', label: 'Border Radius', icon: '⬡' },
  { id: 'filters', label: 'CSS Filters', icon: '◐' },
  { id: 'glassmorphism', label: 'Glassmorphism', icon: '⧉' },
  { id: 'neumorphism', label: 'Neumorphism', icon: '◎' },
  { id: 'gradient-animation', label: 'Gradient Animation', icon: '✦' },
  { id: 'mesh-gradient', label: 'Mesh Gradient', icon: '❖' },
  { id: 'noise-texture', label: 'Noise Texture', icon: '▞' },
];

export { TABS };

export default function Navbar({ activeTab, onTabChange, theme, onThemeToggle }) {
  const tabsRef = useRef(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  // Drag-to-scroll references
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasMoved = useRef(false);

  // Update left/right fade indicators based on scroll position
  const updateFadeIndicators = useCallback(() => {
    const el = tabsRef.current;
    if (!el) return;

    const isScrollable = el.scrollWidth > el.clientWidth;
    if (!isScrollable) {
      setShowLeftFade(false);
      setShowRightFade(false);
      return;
    }

    setShowLeftFade(el.scrollLeft > 8);
    setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  const scrollActiveTabIntoView = useCallback((tabId) => {
    if (!tabsRef.current) return;
    const activeBtn = tabsRef.current.querySelector(`[data-tab="${tabId}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, []);

  useEffect(() => {
    scrollActiveTabIntoView(activeTab);
    // Recalculate indicators after tab centers (with a tiny delay for smooth animation completion)
    const t = setTimeout(updateFadeIndicators, 300);
    return () => clearTimeout(t);
  }, [activeTab, scrollActiveTabIntoView, updateFadeIndicators]);

  // Set up scroll and resize listeners for indicators
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;

    updateFadeIndicators();

    el.addEventListener('scroll', updateFadeIndicators);
    window.addEventListener('resize', updateFadeIndicators);

    return () => {
      el.removeEventListener('scroll', updateFadeIndicators);
      window.removeEventListener('resize', updateFadeIndicators);
    };
  }, [updateFadeIndicators]);

  // Drag-to-scroll event handlers
  const handleMouseDown = (e) => {
    if (!tabsRef.current) return;
    isDragging.current = true;
    hasMoved.current = false;
    tabsRef.current.classList.add('dragging');
    startX.current = e.pageX - tabsRef.current.offsetLeft;
    scrollLeftStart.current = tabsRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !tabsRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsRef.current.offsetLeft;
    const dist = x - startX.current;
    if (Math.abs(dist) > 5) {
      hasMoved.current = true;
    }
    tabsRef.current.scrollLeft = scrollLeftStart.current - dist * 1.5;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
    if (tabsRef.current) {
      tabsRef.current.classList.remove('dragging');
    }
  };

  const handleTabClick = (tabId, e) => {
    if (hasMoved.current) {
      e.preventDefault();
      return;
    }
    onTabChange(tabId);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="navbar-brand-icon">✦</div>
            <span>CSS Visual Gen</span>
          </div>
          <button
            className="theme-toggle"
            onClick={onThemeToggle}
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☼' : '☾'}
          </button>
        </div>
      </nav>
      <div className={`tabs-container ${showLeftFade ? 'show-fade-left' : ''} ${showRightFade ? 'show-fade-right' : ''}`}>
        <div
          className="tabs-scroll"
          ref={tabsRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              data-tab={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={(e) => handleTabClick(tab.id, e)}
            >
              <span style={{ marginRight: '6px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

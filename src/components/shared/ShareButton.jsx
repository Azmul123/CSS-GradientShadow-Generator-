import React, { useCallback, useState, useRef } from 'react';
import { encodeStateToUrl } from '../../utils/urlEncoder.js';

export default function ShareButton({ generatorId, state }) {
  const [shared, setShared] = useState(false);
  const timeoutRef = useRef(null);

  const handleShare = useCallback(() => {
    const url = encodeStateToUrl(generatorId, state);
    navigator.clipboard.writeText(url).then(() => {
      setShared(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShared(false), 2000);
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setShared(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShared(false), 2000);
    });
  }, [generatorId, state]);

  return (
    <button
      className={`btn btn-secondary btn-sm ${shared ? 'copied' : ''}`}
      onClick={handleShare}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
    >
      {shared ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Link Copied!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
          Share
        </>
      )}
    </button>
  );
}

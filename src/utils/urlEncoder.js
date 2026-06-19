// ---- URL ENCODING/DECODING ----

export function encodeStateToUrl(generatorId, state) {
  try {
    const encoded = btoa(JSON.stringify(state));
    const params = new URLSearchParams(window.location.search);
    params.set('g', generatorId);
    params.set('s', encoded);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
    return `${window.location.origin}${newUrl}`;
  } catch (e) {
    console.warn('Failed to encode state to URL:', e);
    return window.location.href;
  }
}

export function decodeStateFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const generatorId = params.get('g');
    const encoded = params.get('s');
    if (generatorId && encoded) {
      const state = JSON.parse(atob(encoded));
      return { generatorId, state };
    }
  } catch (e) {
    console.warn('Failed to decode state from URL:', e);
  }
  return null;
}

export function clearUrlState() {
  window.history.replaceState(null, '', window.location.pathname);
}

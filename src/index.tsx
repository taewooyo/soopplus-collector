import React from 'react';
import { createRoot } from 'react-dom/client';
import '../public/manifest.json';

import './style.scss';
import App from './App';
import { hydrateAllStores } from './stores';

// chrome.storage에서 데이터 로드 후 렌더링
(async () => {
  await hydrateAllStores();

  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
})();

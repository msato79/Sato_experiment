import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { DevApp } from './components/DevApp';
import './index.css';

// 開発者モード: URLパラメータに?dev=trueを追加すると開発者モードが有効になります
const isDevMode = new URLSearchParams(window.location.search).get('dev') === 'true';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {isDevMode ? <DevApp /> : <App />}
  </React.StrictMode>
);


import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './api/interceptors';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
    },
    mutations: {
      retry: 0,
    },
  },
});

function GlobalNotifications() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    function onNotify(e) {
      const detail = e.detail || {};
      const id = `${Date.now()}_${Math.random()}`;
      const entry = { id, type: detail.type || 'info', message: detail.message || '' };
      setItems((prev) => [...prev, entry]);
      setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== id));
      }, 4000);
    }
    window.addEventListener('easyappz:notify', onNotify);
    return () => window.removeEventListener('easyappz:notify', onNotify);
  }, []);

  return (
    <div data-easytag="id1-react/src/index.js" className="pointer-events-none fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {items.map((n) => (
        <div
          key={n.id}
          data-easytag="id2-react/src/index.js"
          className={`pointer-events-auto min-w-[260px] max-w-[360px] rounded-md border px-4 py-3 shadow-lg transition-all ${
            n.type === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-slate-200 bg-white text-slate-900'
          }`}
        >
          <div data-easytag="id3-react/src/index.js" className="text-sm font-medium">{n.type === 'error' ? 'Ошибка' : 'Сообщение'}</div>
          <div data-easytag="id4-react/src/index.js" className="mt-1 text-sm opacity-90">{n.message}</div>
        </div>
      ))}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <GlobalNotifications />
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

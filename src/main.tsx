import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from './services/supabase'

// If this page is opened as an OAuth popup by Supabase, forward the session
// to the opener window and close the popup. This ensures the main window
// receives the authenticated session without relying on polling.
if (window.opener) {
  (async () => {
    try {
      // Give Supabase a moment to process the redirect
      await new Promise((r) => setTimeout(r, 300));
      const { data: { session } } = await supabase.auth.getSession();
      try {
        window.opener.postMessage({ type: 'supabase-auth', session }, window.location.origin);
      } catch (e) {
        // ignore postMessage errors
      }
    } catch (e) {
      // ignore
    } finally {
      // Close the popup; if it fails (blocked), do nothing
      try {
        window.close();
      } catch (e) {}
    }
  })();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

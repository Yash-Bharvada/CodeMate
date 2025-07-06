import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Monaco CDN worker override for Vite compatibility
try {
  // Dynamically import monaco if available
  // @ts-ignore
  import('monaco-editor').then(monaco => {
    // @ts-ignore
    self.MonacoEnvironment = {
      getWorkerUrl: function (moduleId, label) {
        return `https://unpkg.com/monaco-editor@0.52.2/min/vs/base/worker/workerMain.js`;
      }
    };
  });
} catch (e) {
  // Monaco not available, ignore
}

createRoot(document.getElementById("root")!).render(<App />);

import { ErrorBoundary } from './components/common/ErrorBoundary';
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const app = (
  <StrictMode>
    <ErrorBoundary><App /></ErrorBoundary>
  </StrictMode>
)
const root=document.getElementById('root')!;
if(document.getElementById('vrb-public-data'))hydrateRoot(root,app);
else createRoot(root).render(app);

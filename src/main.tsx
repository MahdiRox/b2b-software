/// <reference types="vite/client" />
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import App from './App.tsx';
import ConvexSetupGuide from './components/ConvexSetupGuide.tsx';
import './index.css';

function resolveAbsoluteUrl(rawUrl?: string): string | null {
  if (!rawUrl) return null;
  const cleaned = String(rawUrl).trim().replace(/^["']|["']$/g, '');
  if (!cleaned || cleaned === 'VITE_CONVEX_URL' || cleaned === 'undefined' || cleaned === 'null') {
    return null;
  }

  // Handle dev: deployment prefix if user pasted deployment ID
  if (cleaned.startsWith('dev:')) {
    const deployName = cleaned.split('|')[0].replace('dev:', '');
    return `https://${deployName}.convex.cloud`;
  }

  try {
    const url = new URL(cleaned);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.origin;
    }
  } catch {
    // If protocol was omitted, test with https
    try {
      const urlWithHttps = new URL(`https://${cleaned}`);
      if (urlWithHttps.protocol === 'https:') {
        return urlWithHttps.origin;
      }
    } catch {
      return null;
    }
  }
  return null;
}

const rawEnvUrl = (import.meta as any).env?.VITE_CONVEX_URL;
// Priority: valid env URL -> fallback to deployed cloud instance
const validConvexUrl =
  resolveAbsoluteUrl(rawEnvUrl) ||
  resolveAbsoluteUrl('https://blissful-ibex-671.eu-west-1.convex.cloud');

const root = document.getElementById('root')!;

if (!validConvexUrl) {
  createRoot(root).render(<ConvexSetupGuide />);
} else {
  try {
    const convex = new ConvexReactClient(validConvexUrl);
    createRoot(root).render(
      <StrictMode>
        <ConvexProvider client={convex}>
          <App />
        </ConvexProvider>
      </StrictMode>
    );
  } catch (err) {
    console.error('Failed to initialize Convex client:', err);
    createRoot(root).render(<ConvexSetupGuide />);
  }
}

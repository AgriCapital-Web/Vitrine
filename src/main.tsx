import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { installImageGuard } from "./lib/image-guard";
import { enforceCanonicalHost } from "./lib/canonical-host";

// Vite may fail to load a lazy route chunk when a visitor has an older
// deployment cached. Recover once automatically; the app error boundary then
// shows a useful screen instead of leaving the page blank if it still fails.
const chunkRetryKey = `agricapital-chunk-retry:${window.location.pathname}`;
const recoverFromChunkError = () => {
  try {
    const lastAttempt = Number(sessionStorage.getItem(chunkRetryKey) || 0);
    if (!lastAttempt || Date.now() - lastAttempt > 5 * 60 * 1000) {
      sessionStorage.setItem(chunkRetryKey, String(Date.now()));
      window.location.reload();
      return true;
    }
  } catch {
    // If storage is unavailable, avoid an uncontrolled reload loop.
  }
  return false;
};

window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault();
  recoverFromChunkError();
});

const isChunkLoadError = (value: unknown) => {
  const message = value instanceof Error ? value.message : String(value ?? "");
  return /failed to fetch dynamically imported module|error loading dynamically imported module|loading chunk .* failed|chunkloaderror|importing a module script failed|failed to load module script/i.test(message);
};

window.addEventListener("error", (event) => {
  if (isChunkLoadError(event.error || event.message)) recoverFromChunkError();
});

window.addEventListener("unhandledrejection", (event) => {
  if (isChunkLoadError(event.reason)) recoverFromChunkError();
});

const fonts = document.createElement("link");
fonts.rel = "stylesheet";
fonts.href = "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@400;500;600;700;800&display=swap";
document.head.appendChild(fonts);

installImageGuard();
enforceCanonicalHost();


const root = document.getElementById("root");
if (root) createRoot(root).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

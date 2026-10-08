import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { installImageGuard } from "./lib/image-guard";
import { enforceCanonicalHost } from "./lib/canonical-host";

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

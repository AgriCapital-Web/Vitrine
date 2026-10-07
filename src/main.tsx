import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import { installImageGuard } from "./lib/image-guard";
import { enforceCanonicalHost } from "./lib/canonical-host";

installImageGuard();
enforceCanonicalHost();


createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

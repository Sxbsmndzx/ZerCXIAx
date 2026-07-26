import { createRoot } from "react-dom/client";
import { setBaseUrl } from "@workspace/api-client-react";
import App from "./App";
import "./index.css";

// Falls back to the known Replit production backend when VITE_API_BASE_URL
// isn't set for the current deploy context, so relative "/api/..." calls
// don't silently land on this frontend's own origin (which would otherwise
// be caught by Netlify's SPA redirect and return the app shell instead of
// a real API response).
const DEFAULT_API_BASE_URL = "https://onyx-core--migatitosusu.replit.app";
const apiBase = (import.meta.env.VITE_API_BASE_URL as string | undefined) || DEFAULT_API_BASE_URL;
setBaseUrl(apiBase);

createRoot(document.getElementById("root")!).render(<App />);

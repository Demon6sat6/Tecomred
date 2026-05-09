import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.tsx"

// Force reset to Peru/PEN data if version is outdated
const CURRENT_VERSION = "peru_v1"
if (localStorage.getItem("tr_store_version") !== CURRENT_VERSION) {
  // Clear ALL old data
  const keysToRemove = Object.keys(localStorage).filter(k => k.startsWith("admin_") || k.startsWith("tr_"))
  keysToRemove.forEach(k => localStorage.removeItem(k))
  localStorage.setItem("tr_store_version", CURRENT_VERSION)
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

var ERROR_STYLE = "padding:16px;color:#ef4444;font-size:14px;";

export function mountApp(App: () => any) {
  window.onerror = function (msg) {
    var el = document.getElementById("root");
    if (el && !el.children.length) {
      el.innerHTML = '<div style="' + ERROR_STYLE + '">Error: ' + msg + "</div>";
    }
  };

  try {
    createRoot(document.getElementById("root")!).render(
      <StrictMode><App /></StrictMode>
    );
  } catch (e) {
    document.getElementById("root")!.innerHTML =
      '<div style="' + ERROR_STYLE + '">Failed to initialize: ' + String(e) + "</div>";
  }
}

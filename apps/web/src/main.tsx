import ReactDOM from "react-dom/client";
import { TanstackRouterProvider } from "@/integrations/tanstack-router/root-provider";

import "./index.css";
import { TanstackQueryProvider } from "@/integrations/tanstack-query/root-provider";

const rootElement = document.getElementById("app");
const appLoaderElement = document.getElementById("app-loader");

if (!rootElement) {
  throw new Error("Root element not found");
}

const hideAppLoader = () => {
  if (!appLoaderElement) {
    return;
  }

  appLoaderElement.classList.add("is-hidden");

  window.setTimeout(() => {
    appLoaderElement.remove();
  }, 180);
};

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <TanstackQueryProvider>
      <TanstackRouterProvider />
    </TanstackQueryProvider>,
  );

  window.requestAnimationFrame(() => {
    hideAppLoader();
  });
}

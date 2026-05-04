import ReactDOM from "react-dom/client";
import { TanstackRouterProvider } from "@/integrations/tanstack-router/root-provider";

import "./index.css";
import { TanstackQueryProvider } from "@/integrations/tanstack-query/root-provider";

const rootElement = document.getElementById("app");

if (!rootElement) {
  throw new Error("Root element not found");
}

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <TanstackQueryProvider>
      <TanstackRouterProvider />
    </TanstackQueryProvider>,
  );
}

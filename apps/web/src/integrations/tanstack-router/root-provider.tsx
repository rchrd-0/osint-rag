import { createRouter, RouterProvider } from "@tanstack/react-router";
import Loader from "@/components/loader";
import { queryClient } from "@/integrations/tanstack-query/root-provider";

import { routeTree } from "@/routeTree.gen";

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultPendingComponent: () => <Loader />,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const TanstackRouterProvider = () => {
  return <RouterProvider router={router} context={queryClient} />;
};

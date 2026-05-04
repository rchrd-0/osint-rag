import { apiClient } from "@/api/client";

export const api = {
  ping: () => apiClient.get("").json<{ success: boolean; message: "OK" }>(),
  checkHealth: () =>
    apiClient.get("/health").json<{
      success: boolean;
      data: {
        uptime: number;
      };
    }>(),
};

import { env } from "@osint-rag/env/web";
import type { ApiErrorResponse, ApiResponse } from "@osint-rag/types";
import ky from "ky";

export class ApiError extends Error {
  public message: string;
  public status: number;
  public errors?: ApiErrorResponse["errors"];

  constructor(message: string, status: number, errors?: ApiErrorResponse["errors"]) {
    super(message);
    this.name = "ApiError";
    this.message = message;
    this.status = status;
    this.errors = errors;
  }
}

export const apiClient = ky.create({
  prefix: env.VITE_SERVER_URL,
  retry: 0,
  headers: {
    "Content-Type": "application/json",
  },
  hooks: {
    // beforeRequest: [
    //   (request) => {
    //     const token = auth.getToken();
    //     if (token) {
    //       request.headers.set("Authorization", `Bearer ${token}`);
    //     }
    //   },
    // ],
    afterResponse: [
      async (state) => {
        const { response } = state;
        // if (response.status === 401) {
        //   auth.clearToken();
        //
        //   // redirect
        // }

        let parsedBody: ApiResponse<unknown>;
        try {
          parsedBody = await response.json();
        } catch (_err) {
          if (!response.ok) {
            throw new ApiError(response.statusText, response.status);
          }
          return;
        }

        if (!response.ok || parsedBody.success === false) {
          const errorBody = parsedBody as ApiErrorResponse;

          throw new ApiError(
            errorBody.message || "An unknown error occurred",
            response.status,
            errorBody.errors,
          );
        }

        const data = parsedBody.data;

        const responseData = data !== undefined ? data : parsedBody;

        return new Response(JSON.stringify(responseData), {
          status: response.status,
          headers: response.headers,
        });
      },
    ],
  },
});

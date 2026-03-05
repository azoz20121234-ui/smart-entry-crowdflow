import type { ExecutiveStateResponse } from "@shared/operator";

const REQUEST_TIMEOUT_MS = 2500;

export async function fetchExecutiveState(): Promise<ExecutiveStateResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("/api/executive/state", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Executive API failed with status ${response.status}`);
    }

    return (await response.json()) as ExecutiveStateResponse;
  } finally {
    clearTimeout(timeout);
  }
}

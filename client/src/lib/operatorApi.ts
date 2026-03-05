import type { OperatorStateResponse } from "@shared/operator";

const REQUEST_TIMEOUT_MS = 2500;

export async function fetchOperatorState(): Promise<OperatorStateResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch("/api/operator/state", {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Operator API failed with status ${response.status}`);
    }

    return (await response.json()) as OperatorStateResponse;
  } finally {
    clearTimeout(timeout);
  }
}

import type { OperatorStateResponse } from "@shared/operator";
import { getFallbackOperatorState } from "./fallbackState";

const REQUEST_TIMEOUT_MS = 2500;
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ?? "";

export async function fetchOperatorState(): Promise<OperatorStateResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}/api/operator/state`, {
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
  } catch {
    return getFallbackOperatorState();
  } finally {
    clearTimeout(timeout);
  }
}

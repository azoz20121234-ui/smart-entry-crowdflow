import type { ExecutiveStateResponse } from "@shared/operator";
import { getFallbackExecutiveState } from "./fallbackState";

const REQUEST_TIMEOUT_MS = 2500;
const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") ?? "";

export async function fetchExecutiveState(): Promise<ExecutiveStateResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}/api/executive/state`, {
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
  } catch {
    return getFallbackExecutiveState();
  } finally {
    clearTimeout(timeout);
  }
}

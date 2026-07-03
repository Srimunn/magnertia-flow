// Mock/live seam for all services. See architecture.md.
//
// Set VITE_API_MODE=live to hit real endpoints instead of mock resolvers — no
// call-site changes needed in any service file.

const USE_MOCK = import.meta.env.VITE_API_MODE !== "live";
const MOCK_LATENCY_MS = 150;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiRequest<T>(endpoint: string, mockResolver: () => T): Promise<T> {
  if (USE_MOCK) {
    await delay(MOCK_LATENCY_MS);
    return mockResolver();
  }
  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`Request to ${endpoint} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

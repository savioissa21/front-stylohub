import { describe, it, expect, vi, beforeEach } from "vitest";

// fetchProfile uses React cache() — we must import after mocking fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Reset cache between tests: re-import module fresh each time
beforeEach(() => {
  vi.resetModules();
  mockFetch.mockReset();
});

describe("fetchProfile", () => {
  it("returns null when the API responds with a non-ok status", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) });
    const { fetchProfile } = await import("../fetchProfile");
    const result = await fetchProfile("nonexistent");
    expect(result).toBeNull();
  });

  it("returns the profile data when the API responds with ok", async () => {
    const fakeProfile = { username: "arthurdev", plan: "FREE", widgets: [] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeProfile,
    });
    const { fetchProfile } = await import("../fetchProfile");
    const result = await fetchProfile("arthurdev");
    expect(result).toEqual(fakeProfile);
  });

  it("calls the correct API URL", async () => {
    const fakeProfile = { username: "arthurdev", plan: "FREE", widgets: [] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => fakeProfile,
    });
    const { fetchProfile } = await import("../fetchProfile");
    await fetchProfile("arthurdev");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/p/arthurdev"),
      expect.objectContaining({ next: { revalidate: 60 } })
    );
  });

  it("returns null when fetch throws a network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network failure"));
    const { fetchProfile } = await import("../fetchProfile");
    const result = await fetchProfile("arthurdev");
    expect(result).toBeNull();
  });
});

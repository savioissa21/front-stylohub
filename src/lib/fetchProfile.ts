import { cache } from "react";
import type { Profile } from "@/types/profile";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export const fetchProfile = cache(async (username: string): Promise<Profile | null> => {
  try {
    const res = await fetch(`${API_URL}/api/p/${username}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<Profile>;
  } catch {
    return null;
  }
});

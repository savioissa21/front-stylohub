import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for the public profile page.
 * Mirrors the layout of the profile: avatar, username, and a stack of link buttons.
 */
export default function PublicProfileLoading() {
  return (
    <div className="min-h-screen bg-stylo-dark flex flex-col items-center pt-16 pb-8 px-4">
      <div className="w-full max-w-sm">
        {/* Avatar skeleton */}
        <div className="flex justify-center mb-4">
          <Skeleton className="w-20 h-20 rounded-full bg-white/8" />
        </div>

        {/* Username skeleton */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <Skeleton className="h-5 w-32 rounded-full bg-white/8" />
          <Skeleton className="h-3 w-48 rounded-full bg-white/5" />
        </div>

        {/* Link button skeletons */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton
              key={i}
              className="w-full h-12 rounded-xl bg-white/8"
              style={{ opacity: 1 - i * 0.12 }}
            />
          ))}
        </div>

        {/* Powered by skeleton */}
        <div className="mt-10 flex justify-center">
          <Skeleton className="h-4 w-28 rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}

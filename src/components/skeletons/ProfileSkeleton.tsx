import { Skeleton } from "@/components/ui/skeleton";

export function ProfileHeaderSkeleton() {
  return (
    <div className="flex flex-col items-center py-6 space-y-4">
      <Skeleton className="h-24 w-24 rounded-full" />
      <div className="space-y-2 text-center">
        <Skeleton className="h-6 w-40 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </div>
  );
}

export function ProfileMenuItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <Skeleton className="h-5 w-5 rounded" />
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <ProfileHeaderSkeleton />
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <ProfileMenuItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

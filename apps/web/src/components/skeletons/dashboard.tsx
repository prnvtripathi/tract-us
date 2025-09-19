import { Skeleton } from "../ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Skeleton className="size-10 md:size-16 rounded-full" />
                <div className="flex flex-col gap-2">
                    <Skeleton className="h-6 w-60" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    );
}

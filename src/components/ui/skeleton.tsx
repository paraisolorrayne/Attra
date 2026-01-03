import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-foreground-secondary/10',
        className
      )}
    />
  )
}

export function VehicleCardSkeleton() {
  return (
    <div className="bg-background-card border border-border rounded-xl overflow-hidden">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  )
}

export function VehicleGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <VehicleCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function VehicleHorizontalCardSkeleton() {
  return (
    <div className="bg-background-card rounded-2xl overflow-hidden flex flex-col md:flex-row">
      <Skeleton className="aspect-[16/10] md:w-1/2 rounded-none" />
      <div className="p-8 flex-1 space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-4 mt-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-10 w-36 mt-4" />
      </div>
    </div>
  )
}

export function VehicleListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <VehicleHorizontalCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function BlogCardSkeleton() {
  return (
    <div className="bg-background-card border border-border rounded-xl overflow-hidden">
      <Skeleton className="aspect-[16/10] rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

export function BlogGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <BlogCardSkeleton key={i} />
      ))}
    </div>
  )
}


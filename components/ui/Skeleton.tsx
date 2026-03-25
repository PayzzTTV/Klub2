import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-[#1A1A1A] rounded animate-pulse ${className}`}
      initial={{ opacity: 0.4 }}
      animate={{ opacity: [0.4, 0.6, 0.4] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="brutalist-card p-6 space-y-4">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-3 mt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export function RentalCardSkeleton() {
  return (
    <div className="brutalist-card overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between pt-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="brutalist-card p-6 space-y-2">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export function DashboardBDESkeleton() {
  return (
    <div className="min-h-screen bg-[#000000] py-8 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        {/* Actions rapides */}
        <div className="mb-8">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="brutalist-card p-6 space-y-3">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="brutalist-card p-6 space-y-3">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        </div>
        {/* Projets récents */}
        <div>
          <Skeleton className="h-6 w-48 mb-4" />
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardORGASkeleton() {
  return (
    <div className="min-h-screen bg-[#000000] py-8 sm:py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        {/* Stats 4 colonnes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
          <div className="brutalist-card p-6 space-y-3">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="brutalist-card p-6 space-y-3">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="brutalist-card p-6 space-y-3">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        {/* Candidatures */}
        <div>
          <Skeleton className="h-6 w-56 mb-4" />
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}

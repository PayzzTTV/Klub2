'use client';

type TopProviderBadgeProps = {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
};

export default function TopProviderBadge({ size = 'md', showLabel = true }: TopProviderBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#00FF66] font-bold ${sizeClasses[size]} rounded-sm`}
      title="Top Prestataire - Score ≥ 4.5/5 avec minimum 5 avis"
    >
      <span className={iconSizes[size]}>⭐</span>
      {showLabel && <span>Top Prestataire</span>}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { PendingFeedbackProject } from '@/lib/hooks/usePendingFeedback';
import { useLanguage } from '@/lib/hooks/useLanguage';

type FeedbackBannerProps = {
  projects: PendingFeedbackProject[];
};

export default function FeedbackBanner({ projects }: FeedbackBannerProps) {
  const { t, lang } = useLanguage();
  if (projects.length === 0) return null;

  const firstProject = projects[0];
  const remainingCount = projects.length - 1;

  return (
    <div className="mb-8 brutalist-card bg-[#FF0055]/10 border-[#FF0055] p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#FF0055]/5 animate-pulse"></div>

      <div className="relative z-10">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 text-4xl">⚠️</div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">
              ⚠️ {t.feedback.banner.title}
            </h2>
            <p className="text-[#A0A0A0] mb-4">
              {t.feedback.banner.desc.split('{count}')[0]}
              <span className="text-white font-semibold">{projects.length}</span>
              {t.feedback.banner.desc.split('{count}')[1] ?? ''}
            </p>

            <div className="brutalist-card bg-[#0A0A0A] p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white">{firstProject.title}</h3>
                <span className="text-xs px-2 py-1 bg-[#7C3AED]/20 text-[#7C3AED] rounded">
                  {firstProject.type}
                </span>
              </div>
              <p className="text-sm text-[#A0A0A0]">
                {new Date(firstProject.end_date).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US')}
              </p>
            </div>

            {remainingCount > 0 && (
              <p className="text-sm text-[#A0A0A0] mb-4">
                + {remainingCount} {lang === 'fr' ? 'autre(s) projet(s) en attente' : 'more project(s) pending'}
              </p>
            )}

            <Link
              href={`/feedback/${firstProject.id}`}
              className="inline-flex items-center gap-2 bg-[#FF0055] hover:bg-[#FF0055]/80 text-white font-bold px-6 py-3 transition-all"
            >
              ✍️ {t.feedback.banner.action}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

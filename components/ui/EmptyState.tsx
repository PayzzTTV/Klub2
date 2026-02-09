'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      className="brutalist-card p-12 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="text-6xl mb-4"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-[#A0A0A0] mb-6 max-w-md mx-auto">{description}</p>

      {(actionLabel && (actionHref || onAction)) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {actionHref ? (
            <Link
              href={actionHref}
              className="brutalist-button-primary inline-block px-6 py-3"
            >
              {actionLabel}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="brutalist-button-primary px-6 py-3"
            >
              {actionLabel}
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

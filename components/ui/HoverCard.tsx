'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
}

export function HoverCard({ children, className = '', onClick, href }: HoverCardProps) {
  const Component = href ? motion.a : motion.div;
  const props = href ? { href } : {};

  return (
    <Component
      {...props}
      onClick={onClick}
      className={`brutalist-card cursor-pointer ${className}`}
      whileHover={{
        scale: 1.02,
        borderColor: '#7C3AED',
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </Component>
  );
}

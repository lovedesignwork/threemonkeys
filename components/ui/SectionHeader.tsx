'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeInUp } from '@/lib/animations';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  centered = true,
  className,
}: SectionHeaderProps) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className={cn('mb-12', centered && 'text-center', className)}
    >
      <h2 className="text-4xl md:text-5xl font-[family-name:var(--font-oswald)] font-light tracking-wide text-white mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

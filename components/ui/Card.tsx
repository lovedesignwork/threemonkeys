'use client';

import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, hover = false, padding = 'md', ...props }, ref) => {
    const paddingSizes = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10',
          paddingSizes[padding],
          hover && 'hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface MotionCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const MotionCard = forwardRef<HTMLDivElement, MotionCardProps>(
  ({ className, children, hover = false, padding = 'md', ...props }, ref) => {
    const paddingSizes = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10',
          paddingSizes[padding],
          hover && 'hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

MotionCard.displayName = 'MotionCard';

export { Card, MotionCard };
export type { CardProps, MotionCardProps };

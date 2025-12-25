'use client';

import { motion } from 'framer-motion';

interface BudgetRingProps {
  percent: number;  // 0-100
  size?: number;
  strokeWidth?: number;
}

export function BudgetRing({ percent, size = 200, strokeWidth = 16 }: BudgetRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  // Color based on percent
  const getColor = () => {
    if (percent >= 100) return 'stroke-red-500';
    if (percent >= 90) return 'stroke-red-400';
    if (percent >= 75) return 'stroke-orange-400';
    if (percent >= 50) return 'stroke-yellow-400';
    return 'stroke-green-500';
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/20"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          className={getColor()}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-4xl font-bold"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          {percent < 1 && percent > 0 ? percent.toFixed(1) : Math.round(percent)}%
        </motion.span>
        <span className="text-sm text-muted-foreground">used</span>
      </div>
    </div>
  );
}

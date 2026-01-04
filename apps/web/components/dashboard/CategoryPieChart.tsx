'use client';

import { motion } from 'framer-motion';
import { Expense, Category } from '@expense-tracker/shared-types';
import { useMemo, useState } from 'react';
import { formatCurrency, CurrencyFormat } from '@expense-tracker/shared-utils';
import { getCategoryColorById } from '@/lib/utils/categoryColors';

interface CategoryPieChartProps {
  expenses: Expense[];
  categories: Category[];
  totalBudget: number;
  currency?: string;
  currencyFormat?: CurrencyFormat;
  size?: number;
}

interface CategoryData {
  id: string;
  name: string;
  color: string;
  amount: number;
  percentage: number;
  budgetPercentage: number;
}

export function CategoryPieChart({
  expenses,
  categories,
  totalBudget,
  currency = 'Rs.',
  currencyFormat = 'en-LK',
  size = 200
}: CategoryPieChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Calculate category totals
  const categoryData = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    if (total === 0) return [];

    // Group expenses by category
    const categoryMap = new Map<string, number>();
    expenses.forEach((expense) => {
      const current = categoryMap.get(expense.category) || 0;
      categoryMap.set(expense.category, current + expense.amount);
    });

    // Convert to array with percentages
    const data: CategoryData[] = Array.from(categoryMap.entries())
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId);
        const color = getCategoryColorById(categoryId, categories);

        return {
          id: categoryId,
          name: category?.name || 'Unknown',
          color,
          amount,
          percentage: (amount / total) * 100,
          budgetPercentage: (amount / totalBudget) * 100,
        };
      })
      .sort((a, b) => b.amount - a.amount); // Sort by amount descending

    return data;
  }, [expenses, categories, totalBudget]);

  // Calculate pie chart segments
  const segments = useMemo(() => {
    let currentAngle = 0;

    return categoryData.map((cat) => {
      const startAngle = currentAngle;
      const sweepAngle = (cat.percentage / 100) * 360;
      currentAngle += sweepAngle;

      // Calculate path for pie slice
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (startAngle + sweepAngle - 90) * (Math.PI / 180);

      const radius = size / 2;
      const innerRadius = radius * 0.5; // Donut chart

      const x1 = radius + radius * Math.cos(startRad);
      const y1 = radius + radius * Math.sin(startRad);
      const x2 = radius + radius * Math.cos(endRad);
      const y2 = radius + radius * Math.sin(endRad);

      const x3 = radius + innerRadius * Math.cos(endRad);
      const y3 = radius + innerRadius * Math.sin(endRad);
      const x4 = radius + innerRadius * Math.cos(startRad);
      const y4 = radius + innerRadius * Math.sin(startRad);

      const largeArc = sweepAngle > 180 ? 1 : 0;

      const path = [
        `M ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
        'Z',
      ].join(' ');

      return {
        ...cat,
        path,
        startAngle,
        sweepAngle,
      };
    });
  }, [categoryData, size]);

  if (categoryData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <div className="text-center">
          <p className="text-2xl font-bold text-muted-foreground">0%</p>
          <p className="text-sm text-muted-foreground">No expenses</p>
        </div>
      </div>
    );
  }

  const totalSpent = categoryData.reduce((sum, cat) => sum + cat.amount, 0);
  const budgetPercentage = (totalSpent / totalBudget) * 100;

  return (
    <div>
      {/* Pie Chart */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          {segments.map((segment, index) => (
            <g key={segment.id}>
              <motion.path
                d={segment.path}
                fill={segment.color}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: hoveredCategory === segment.id ? 0.9 : 1,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                  ease: 'easeOut'
                }}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredCategory(segment.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                style={{
                  filter: hoveredCategory === segment.id ? 'brightness(1.2)' : 'none',
                }}
              />
            </g>
          ))}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hoveredCategory ? (
            // Show hovered category info
            <>
              <motion.span
                key={hoveredCategory}
                className="text-2xl font-bold"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {categoryData.find(c => c.id === hoveredCategory)?.budgetPercentage.toFixed(1)}%
              </motion.span>
              <span className="text-xs text-muted-foreground text-center px-2">
                {categoryData.find(c => c.id === hoveredCategory)?.name}
              </span>
            </>
          ) : (
            // Show total budget percentage
            <>
              <motion.span
                className={`text-3xl font-bold ${budgetPercentage > 100 ? 'text-red-500' : ''}`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
              >
                {Math.round(budgetPercentage)}%
              </motion.span>
              <span className="text-xs text-muted-foreground">
                {budgetPercentage > 100 ? 'over budget' : 'used'}
              </span>
            </>
          )}
        </div>

        {/* Tooltip for hovered category */}
        {hoveredCategory && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-3 py-1 rounded-md text-xs whitespace-nowrap shadow-lg border z-50"
          >
            {formatCurrency(
              categoryData.find(c => c.id === hoveredCategory)?.amount || 0,
              currency,
              currencyFormat
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

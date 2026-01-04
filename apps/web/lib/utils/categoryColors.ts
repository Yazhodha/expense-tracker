import { Category } from '@expense-tracker/shared-types';

// Default vibrant colors for categories
export const CATEGORY_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#a855f7', // violet
  '#84cc16', // lime
  '#f43f5e', // rose
  '#06b6d4', // sky
  '#eab308', // yellow
];

/**
 * Get a color for a category
 * - If category has a valid color, use it
 * - Otherwise, assign a default color based on category index
 */
export function getCategoryColor(category: Category | undefined, index: number): string {
  if (!category) {
    return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
  }

  const color = category.color;

  // Check if color is valid
  if (color && color.startsWith('#') && color !== '#gray') {
    return color;
  }

  // Return default color based on index
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

/**
 * Get a color for a category by ID from a list of categories
 */
export function getCategoryColorById(
  categoryId: string,
  categories: Category[]
): string {
  const index = categories.findIndex(c => c.id === categoryId);
  const category = categories[index];
  return getCategoryColor(category, index);
}

/**
 * Assign default colors to all categories in a list
 * Returns a new array with updated colors
 */
export function assignDefaultColors(categories: Category[]): Category[] {
  return categories.map((category, index) => ({
    ...category,
    color: getCategoryColor(category, index),
  }));
}

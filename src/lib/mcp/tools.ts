import { z } from 'zod';

export const addExpenseSchema = z.object({
  expenses: z.array(z.object({
    amount: z.number().positive(),
    category: z.string(),
    merchant: z.string().optional(),
    note: z.string().optional(),
    date: z.string().optional(),
  })),
});

export const getSummarySchema = z.object({});

export const getExpensesSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.number().optional().default(20),
});

export const tools = [
  {
    name: 'add_expenses',
    description: 'Add one or more expenses extracted from a screenshot or user input. Each expense needs amount, category (groceries/dining/fuel/shopping/subscriptions/health/entertainment/transport/utilities/other), and optionally merchant name and note.',
    inputSchema: {
      type: 'object',
      properties: {
        expenses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              amount: { type: 'number', description: 'Amount in Rs.' },
              category: { type: 'string', description: 'Category: groceries, dining, fuel, shopping, subscriptions, health, entertainment, transport, utilities, other' },
              merchant: { type: 'string', description: 'Merchant/store name' },
              note: { type: 'string', description: 'Additional note' },
              date: { type: 'string', description: 'ISO date string (defaults to today)' },
            },
            required: ['amount', 'category'],
          },
        },
      },
      required: ['expenses'],
    },
  },
  {
    name: 'get_summary',
    description: 'Get the current billing cycle budget summary including spent amount, remaining budget, percentage used, and daily budget.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_expenses',
    description: 'Get a list of recent expenses, optionally filtered by date range.',
    inputSchema: {
      type: 'object',
      properties: {
        startDate: { type: 'string', description: 'Start date (ISO string)' },
        endDate: { type: 'string', description: 'End date (ISO string)' },
        limit: { type: 'number', description: 'Max expenses to return (default 20)' },
      },
    },
  },
];

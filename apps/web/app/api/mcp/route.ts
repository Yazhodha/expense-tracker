import { NextRequest } from 'next/server';
import { tools, addExpenseSchema, getSummarySchema, getExpensesSchema } from '@/lib/mcp/tools';
import { addExpenseAdmin, getExpensesForCycleAdmin, getUserSettingsAdmin } from '@/lib/firebase/firestore-admin';
import { getBillingCycle } from '@expense-tracker/shared-utils';

export async function GET() {
  return Response.json({
    protocolVersion: '2024-11-05',
    capabilities: { tools: {} },
    serverInfo: {
      name: 'spendwise-expense-tracker',
      version: '1.0.0',
    },
    tools,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { method, params, id } = body;

  switch (method) {
    case 'tools/list':
      return Response.json({
        jsonrpc: '2.0',
        id,
        result: { tools },
      });

    case 'tools/call':
      return handleToolCall(params, id);

    default:
      return Response.json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: 'Method not found' },
      });
  }
}

async function handleToolCall(params: any, id: string) {
  const { name, arguments: args } = params;
  const userId = params.userId || args.userId;

  if (!userId) {
    return Response.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32602, message: 'userId is required' },
    });
  }

  try {
    let result;

    switch (name) {
      case 'add_expenses': {
        const validated = addExpenseSchema.parse(args);
        const addedIds = [];

        for (const expense of validated.expenses) {
          const expenseId = await addExpenseAdmin(userId, {
            amount: expense.amount,
            category: expense.category,
            merchant: expense.merchant,
            note: expense.note,
            date: expense.date ? new Date(expense.date) : new Date(),
            source: 'claude',
          });
          addedIds.push(expenseId);
        }

        result = {
          success: true,
          message: `Added ${addedIds.length} expense(s)`,
          ids: addedIds,
        };
        break;
      }

      case 'get_summary': {
        const settings = await getUserSettingsAdmin(userId);
        if (!settings) {
          throw new Error('User settings not found');
        }

        const cycle = getBillingCycle(settings.billingDate);
        const expenses = await getExpensesForCycleAdmin(userId, cycle.startDate, cycle.endDate);

        const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
        const remaining = settings.monthlyLimit - spent;

        result = {
          spent,
          limit: settings.monthlyLimit,
          remaining,
          percentUsed: Math.round((spent / settings.monthlyLimit) * 100),
          daysRemaining: cycle.daysRemaining,
          dailyBudget: cycle.daysRemaining > 0 ? Math.floor(remaining / cycle.daysRemaining) : 0,
          status: remaining < 0 ? 'danger' : remaining < settings.monthlyLimit * 0.1 ? 'warning' : 'good',
        };
        break;
      }

      case 'get_expenses': {
        const validated = getExpensesSchema.parse(args);
        const settings = await getUserSettingsAdmin(userId);
        if (!settings) {
          throw new Error('User settings not found');
        }

        const cycle = getBillingCycle(settings.billingDate);

        const startDate = validated.startDate ? new Date(validated.startDate) : cycle.startDate;
        const endDate = validated.endDate ? new Date(validated.endDate) : cycle.endDate;

        const expenses = await getExpensesForCycleAdmin(userId, startDate, endDate);

        result = {
          expenses: expenses.slice(0, validated.limit).map((e) => ({
            id: e.id,
            amount: e.amount,
            category: e.category,
            merchant: e.merchant,
            note: e.note,
            date: e.date.toISOString(),
            source: e.source,
          })),
          total: expenses.length,
        };
        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return Response.json({
      jsonrpc: '2.0',
      id,
      result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] },
    });

  } catch (error: any) {
    return Response.json({
      jsonrpc: '2.0',
      id,
      error: { code: -32000, message: error.message },
    });
  }
}

import { getAdminDb } from './admin';
import { Expense } from '@/lib/types';

const EXPENSES_COLLECTION = 'expenses';
const USERS_COLLECTION = 'users';

export async function addExpenseAdmin(
  userId: string,
  expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const adminDb = getAdminDb();
  const docRef = await adminDb.collection(EXPENSES_COLLECTION).add({
    ...expense,
    userId,
    date: expense.date,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
}

export async function getExpensesForCycleAdmin(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Expense[]> {
  const adminDb = getAdminDb();
  const snapshot = await adminDb
    .collection(EXPENSES_COLLECTION)
    .where('userId', '==', userId)
    .where('date', '>=', startDate)
    .where('date', '<=', endDate)
    .orderBy('date', 'desc')
    .get();

  return snapshot.docs.map((doc: any) => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      amount: data.amount,
      category: data.category,
      merchant: data.merchant,
      note: data.note,
      date: data.date.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
      source: data.source,
    };
  }) as Expense[];
}

export async function getUserSettingsAdmin(userId: string): Promise<{ monthlyLimit: number; billingDate: number } | null> {
  const adminDb = getAdminDb();
  const userDoc = await adminDb.collection(USERS_COLLECTION).doc(userId).get();

  if (!userDoc.exists) {
    return { monthlyLimit: 100000, billingDate: 15 };
  }

  const data = userDoc.data();
  return {
    monthlyLimit: data?.settings?.monthlyLimit ?? 100000,
    billingDate: data?.settings?.billingDate ?? 15,
  };
}

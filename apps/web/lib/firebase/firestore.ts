import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from './config';
import { Expense } from '@expense-tracker/shared-types';

const EXPENSES_COLLECTION = 'expenses';

export async function addExpense(
  userId: string,
  expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  // Remove undefined values to avoid Firebase errors
  const expenseData: any = {
    userId,
    amount: expense.amount,
    category: expense.category,
    merchant: expense.merchant,
    source: expense.source,
    date: Timestamp.fromDate(expense.date),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Only add note if it has a value
  if (expense.note) {
    expenseData.note = expense.note;
  }

  const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), expenseData);
  return docRef.id;
}

export async function updateExpense(
  expenseId: string,
  updates: Partial<Expense>
): Promise<void> {
  const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
  const updateData: any = {
    updatedAt: Timestamp.now(),
  };

  // Only include fields that are provided
  if (updates.amount !== undefined) updateData.amount = updates.amount;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.merchant !== undefined) updateData.merchant = updates.merchant;
  if (updates.source !== undefined) updateData.source = updates.source;

  // Only add note if it has a value (null/empty string removes it)
  if (updates.note !== undefined) {
    if (updates.note) {
      updateData.note = updates.note;
    }
  }

  // Convert date to Timestamp if it's being updated
  if (updates.date) {
    updateData.date = Timestamp.fromDate(updates.date);
  }

  await updateDoc(docRef, updateData);
}

export async function deleteExpense(expenseId: string): Promise<void> {
  await deleteDoc(doc(db, EXPENSES_COLLECTION, expenseId));
}

export function subscribeToExpenses(
  userId: string,
  startDate: Date,
  endDate: Date,
  callback: (expenses: Expense[]) => void
): () => void {
  // Simplified query - only filter by userId and order by date
  // We'll filter the date range in memory to avoid complex index requirements
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const allExpenses = snapshot.docs.map((doc) => {
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

    // Filter by date range in memory
    const filteredExpenses = allExpenses.filter((expense) => {
      return expense.date >= startDate && expense.date <= endDate;
    });

    callback(filteredExpenses);
  });
}

export async function getExpensesForCycle(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Expense[]> {
  // Simplified query - only filter by userId and order by date
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('userId', '==', userId),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  const allExpenses = snapshot.docs.map((doc) => {
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

  // Filter by date range in memory
  return allExpenses.filter((expense) => {
    return expense.date >= startDate && expense.date <= endDate;
  });
}

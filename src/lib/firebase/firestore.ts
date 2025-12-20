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
import { Expense } from '@/lib/types';

const EXPENSES_COLLECTION = 'expenses';

export async function addExpense(
  userId: string,
  expense: Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, EXPENSES_COLLECTION), {
    ...expense,
    userId,
    date: Timestamp.fromDate(expense.date),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateExpense(
  expenseId: string,
  updates: Partial<Expense>
): Promise<void> {
  const docRef = doc(db, EXPENSES_COLLECTION, expenseId);
  const updateData: any = {
    ...updates,
    updatedAt: Timestamp.now(),
  };

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
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('userId', '==', userId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map((doc) => {
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

    callback(expenses);
  });
}

export async function getExpensesForCycle(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<Expense[]> {
  const q = query(
    collection(db, EXPENSES_COLLECTION),
    where('userId', '==', userId),
    where('date', '>=', Timestamp.fromDate(startDate)),
    where('date', '<=', Timestamp.fromDate(endDate)),
    orderBy('date', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
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

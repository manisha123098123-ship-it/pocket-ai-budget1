import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';

const col = (uid) => collection(db, 'users', uid, 'transactions');

export function watchTransactions(uid, cb, onError) {
  return onSnapshot(query(col(uid)), (snap) => {
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    cb(list.sort((a, b) => b.date.localeCompare(a.date)));
  }, onError);
}
export const addTransaction = (uid, t) => addDoc(col(uid), t);
export const updateTransaction = (uid, id, t) => updateDoc(doc(db, 'users', uid, 'transactions', id), t);
export const deleteTransaction = (uid, id) => deleteDoc(doc(db, 'users', uid, 'transactions', id));
export async function seed(uid, items) {
  const batch = writeBatch(db);
  items.forEach((t) => batch.set(doc(col(uid)), t));
  await batch.commit();
}

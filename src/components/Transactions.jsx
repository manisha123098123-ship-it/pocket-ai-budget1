import { useState } from 'react';
import { Pencil, Trash2, Download } from 'lucide-react';
import { addTransaction, deleteTransaction, updateTransaction } from '../data';
import { categories } from '../i18n';
import { money, toCSV } from '../utils';

const blank = () => ({ description: '', amount: '', type: 'expense', category: categories[0], date: new Date().toISOString().slice(0, 10) });

export default function Transactions({ t, user, tx }) {
  const [form, setForm] = useState(blank());
  const [editId, setEditId] = useState(null);
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!form.description.trim() || !(amount > 0)) return setError('Enter a description and a valid amount');
    setBusy(true); setError('');
    try {
      const data = { ...form, description: form.description.trim(), amount };
      editId ? await updateTransaction(user.uid, editId, data) : await addTransaction(user.uid, data);
      setForm(blank()); setEditId(null);
    } catch { setError('Could not save. Please try again.'); }
    setBusy(false);
  };
  const remove = (id) => deleteTransaction(user.uid, id).catch(() => setError('Could not delete.'));
  const edit = (x) => { setEditId(x.id); setForm({ description: x.description, amount: x.amount, type: x.type, category: x.category, date: x.date }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const download = () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([toCSV(tx)], { type: 'text/csv' }));
    a.download = 'pocketwise-transactions.csv'; a.click(); URL.revokeObjectURL(a.href);
  };
  const list = tx.filter((x) => (type === 'all' || x.type === type) && x.description.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="glass grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6">
        <input className="input lg:col-span-2" placeholder={t('desc')} value={form.description} onChange={set('description')} />
        <input className="input" type="number" min="1" placeholder={t('amount')} value={form.amount} onChange={set('amount')} />
        <select className="input" value={form.type} onChange={set('type')}><option value="expense">{t('expense')}</option><option value="income">{t('incomeT')}</option></select>
        <select className="input" value={form.category} onChange={set('category')}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
        <input className="input" type="date" value={form.date} onChange={set('date')} />
        <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
          <button className="btn" disabled={busy}>{editId ? t('save') : t('add')}</button>
          {editId && <button type="button" className="btn-ghost" onClick={() => { setEditId(null); setForm(blank()); }}>{t('cancel')}</button>}
          {error && <span className="self-center text-sm text-rose-400">{error}</span>}
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <input className="input max-w-xs" placeholder={t('search')} value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-[10rem]" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">{t('all')}</option><option value="expense">{t('expense')}</option><option value="income">{t('incomeT')}</option>
        </select>
        <button className="btn-ghost ml-auto flex items-center gap-2" onClick={download} disabled={!tx.length}><Download size={16} />{t('export')}</button>
      </div>

      <div className="glass divide-y divide-white/10 overflow-hidden">
        {list.length === 0 && <div className="mute p-4 text-sm">{t('empty')}</div>}
        {list.map((x) => (
          <div key={x.id} className="flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{x.description}</div>
              <div className="mute text-xs">{x.category} · {x.date}</div>
            </div>
            <div className={`font-semibold ${x.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>{x.type === 'income' ? '+' : '−'}{money(x.amount)}</div>
            <button className="btn-ghost p-2" onClick={() => edit(x)} aria-label="Edit"><Pencil size={14} /></button>
            <button className="btn-ghost p-2" onClick={() => remove(x.id)} aria-label="Delete"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

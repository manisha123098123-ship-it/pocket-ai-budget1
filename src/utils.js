export const money = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
export const monthKey = (d) => String(d).slice(0, 7);

export function summarize(tx, month = new Date().toISOString().slice(0, 7)) {
  const inMonth = tx.filter((t) => monthKey(t.date) === month);
  const sum = (arr, type) => arr.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
  const income = sum(inMonth, 'income');
  const expenses = sum(inMonth, 'expense');
  const balance = sum(tx, 'income') - sum(tx, 'expense');
  const rate = income ? Math.round(((income - expenses) / income) * 100) : 0;
  const health = income ? Math.max(0, Math.min(100, Math.round(50 + rate * 1.5 - (expenses > income ? 20 : 0)))) : 0;
  const byCategory = {};
  inMonth.filter((t) => t.type === 'expense').forEach((t) => (byCategory[t.category] = (byCategory[t.category] || 0) + t.amount));
  const trend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
    const k = d.toISOString().slice(0, 7);
    const m = tx.filter((t) => monthKey(t.date) === k);
    trend.push({ month: d.toLocaleString('en', { month: 'short' }), income: sum(m, 'income'), expenses: sum(m, 'expense') });
  }
  return { income, expenses, balance, rate, health, byCategory, trend };
}

export function toCSV(tx) {
  const rows = [['Description', 'Amount', 'Type', 'Category', 'Date'], ...tx.map((t) => [t.description, t.amount, t.type, t.category, t.date])];
  return rows.map((r) => r.map((v) => '"' + String(v).replace(/"/g, '""') + '"').join(',')).join('\n');
}

export function demoData() {
  const out = [];
  for (let i = 0; i < 4; i++) {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
    const ym = d.toISOString().slice(0, 7);
    out.push({ description: 'Salary', amount: 55000, type: 'income', category: 'Salary', date: ym + '-01' });
    out.push({ description: 'Groceries', amount: 5200 + i * 300, type: 'expense', category: 'Food & Dining', date: ym + '-05' });
    out.push({ description: 'Electricity & internet', amount: 3100, type: 'expense', category: 'Bills & Utilities', date: ym + '-08' });
    out.push({ description: 'Bus pass / fuel', amount: 1900, type: 'expense', category: 'Transport', date: ym + '-10' });
    out.push({ description: 'Movies & OTT', amount: 1200 + i * 150, type: 'expense', category: 'Entertainment', date: ym + '-15' });
    out.push({ description: 'Online shopping', amount: 3500, type: 'expense', category: 'Shopping', date: ym + '-18' });
  }
  return out;
}

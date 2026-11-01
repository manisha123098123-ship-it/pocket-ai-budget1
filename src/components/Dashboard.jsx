import { motion } from 'framer-motion';
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { summarize, money, demoData } from '../utils';
import { seed } from '../data';
import { categories, colors } from '../i18n';

export default function Dashboard({ t, user, tx }) {
  const s = summarize(tx);
  const pie = Object.entries(s.byCategory).map(([name, value]) => ({ name, value }));
  const cards = [
    [t('balance'), money(s.balance)], [t('income'), money(s.income)], [t('expenses'), money(s.expenses)],
    [t('savings'), s.rate + '%'],
  ];
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cards.map(([label, value], i) => (
          <motion.div key={label} className="glass p-4" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} whileHover={{ y: -3 }}>
            <div className="mute text-xs">{label}</div>
            <div className="text-xl font-bold">{value}</div>
          </motion.div>
        ))}
        <motion.div className="glass p-4" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="mute text-xs">{t('health')}</div>
          <div className="text-xl font-bold">{s.health}/100</div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div className="h-full bg-gradient-to-r from-violet-500 to-emerald-400" initial={{ width: 0 }} animate={{ width: s.health + '%' }} transition={{ duration: 1 }} />
          </div>
        </motion.div>
      </div>

      {tx.length === 0 && (
        <div className="glass flex items-center justify-between p-4">
          <span className="mute text-sm">{t('empty')}</span>
          <button className="btn" onClick={() => seed(user.uid, demoData())}>{t('demo')}</button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass h-80 p-4">
          <h3 className="mb-2 text-sm font-semibold">{t('byCat')}</h3>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie data={pie} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {pie.map((d) => <Cell key={d.name} fill={colors[categories.indexOf(d.name)] || '#94a3b8'} />)}
              </Pie>
              <Tooltip formatter={(v) => money(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="glass h-80 p-4">
          <h3 className="mb-2 text-sm font-semibold">{t('trend')}</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={s.trend}>
              <XAxis dataKey="month" stroke="#9aa3c7" /><YAxis stroke="#9aa3c7" width={50} />
              <Tooltip formatter={(v) => money(v)} /><Legend />
              <Bar dataKey="income" name={t('income')} fill="#4ade80" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" name={t('expenses')} fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

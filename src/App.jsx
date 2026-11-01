import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, ReceiptText, Sparkles, LogOut, Sun, Moon, Languages } from 'lucide-react';
import { auth } from './firebase';
import { dict } from './i18n';
import { watchTransactions } from './data';
import Login from './components/Login.jsx';
import Dashboard from './components/Dashboard.jsx';
import Transactions from './components/Transactions.jsx';
import Assistant from './components/Assistant.jsx';

const tabs = [
  { id: 'dashboard', icon: LayoutDashboard },
  { id: 'transactions', icon: ReceiptText },
  { id: 'assistant', icon: Sparkles },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('dashboard');
  const [lang, setLang] = useState(localStorage.getItem('pw_lang') || 'en');
  const [dark, setDark] = useState(localStorage.getItem('pw_dark') !== 'false');
  const [tx, setTx] = useState([]);
  const [error, setError] = useState('');
  const t = (k) => dict[lang][k] || k;

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setReady(true); }), []);
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('pw_dark', dark); }, [dark]);
  useEffect(() => { localStorage.setItem('pw_lang', lang); }, [lang]);
  useEffect(() => {
    if (!user) { setTx([]); return; }
    return watchTransactions(user.uid, setTx, () => setError('Could not load data. Check Firestore rules and config.'));
  }, [user]);

  if (!ready) return (
    <div className="grid h-screen place-items-center">
      <motion.div className="h-14 w-14 rounded-full border-4 border-violet-400 border-t-transparent"
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }} />
    </div>
  );
  if (!user) return <Login t={t} />;

  const View = { dashboard: Dashboard, transactions: Transactions, assistant: Assistant }[tab];
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="glass m-3 flex items-center justify-between gap-2 p-3 md:w-60 md:flex-col md:items-stretch md:justify-start">
        <div className="text-xl font-bold grad-text md:mb-4 md:px-2">PocketWise AI</div>
        <nav className="flex gap-1 md:flex-col">
          {tabs.map(({ id, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${tab === id ? 'bg-violet-500/30 font-semibold' : 'hover:bg-white/10'}`}>
              <Icon size={18} /> <span className="hidden sm:inline">{t(id)}</span>
            </button>
          ))}
        </nav>
        <div className="flex gap-1 md:mt-auto md:flex-col">
          <button className="btn-ghost flex items-center gap-2" onClick={() => setLang(lang === 'en' ? 'ta' : 'en')}><Languages size={16} />{lang === 'en' ? 'தமிழ்' : 'English'}</button>
          <button className="btn-ghost flex items-center gap-2" onClick={() => setDark(!dark)}>{dark ? <Sun size={16} /> : <Moon size={16} />}</button>
          <button className="btn-ghost flex items-center gap-2" onClick={() => signOut(auth)}><LogOut size={16} /><span className="hidden sm:inline">{t('logout')}</span></button>
        </div>
      </aside>
      <main className="flex-1 p-3 md:p-6">
        {error && <div className="mb-3 rounded-xl bg-rose-500/20 p-3 text-sm">{error}</div>}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <View t={t} lang={lang} user={user} tx={tx} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

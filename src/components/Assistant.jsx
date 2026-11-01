import { useRef, useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { auth } from '../firebase';
import { summarize } from '../utils';

export default function Assistant({ t, lang, tx }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const end = useRef(null);
  useEffect(() => end.current?.scrollIntoView({ behavior: 'smooth' }), [messages, busy]);

  const send = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    const next = [...messages, { role: 'user', text }];
    setMessages(next); setInput(''); setBusy(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const { income, expenses, balance, rate, byCategory } = summarize(tx);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ messages: next, lang, summary: { income, expenses, balance, savingsRate: rate, byCategory } }),
      });
      const data = await res.json();
      setMessages([...next, { role: 'model', text: res.ok ? data.reply : '⚠️ ' + (data.error || 'Error') }]);
    } catch {
      setMessages([...next, { role: 'model', text: '⚠️ Could not reach the AI service.' }]);
    }
    setBusy(false);
  };

  return (
    <div className="glass flex h-[75vh] flex-col p-4">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && <p className="mute text-sm">Try: “Where am I overspending?” or “How can I save ₹5,000 more this month?”</p>}
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${m.role === 'user' ? 'ml-auto bg-violet-500/40' : 'bg-white/10'}`}>{m.text}</div>
        ))}
        {busy && <div className="mute text-sm animate-pulse">…</div>}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input className="input" placeholder={t('ask')} value={input} onChange={(e) => setInput(e.target.value)} />
        <button className="btn flex items-center gap-2" disabled={busy}><Send size={16} />{t('send')}</button>
      </form>
    </div>
  );
}

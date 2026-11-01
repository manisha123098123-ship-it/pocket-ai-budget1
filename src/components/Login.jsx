import { useState } from 'react';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

export default function Login({ t }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async (fn) => {
    setBusy(true); setError('');
    try { await fn(); } catch (e) { setError(e.code?.replace('auth/', '').replace(/-/g, ' ') || 'Something went wrong'); }
    setBusy(false);
  };
  const submit = (e) => {
    e.preventDefault();
    run(() => (mode === 'login' ? signInWithEmailAndPassword : createUserWithEmailAndPassword)(auth, email, password));
  };

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass w-full max-w-sm p-6">
        <h1 className="text-3xl font-bold grad-text">PocketWise AI</h1>
        <p className="mute mb-5 text-sm">{t('welcome')}</p>
        <form onSubmit={submit} className="space-y-3">
          <input className="input" type="email" required placeholder={t('email')} value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" type="password" required minLength={6} placeholder={t('password')} value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <p className="text-sm capitalize text-rose-400">{error}</p>}
          <button className="btn w-full" disabled={busy}>{mode === 'login' ? t('login') : t('signup')}</button>
        </form>
        <button className="btn-ghost mt-3 w-full" disabled={busy} onClick={() => run(() => signInWithPopup(auth, googleProvider))}>{t('google')}</button>
        <button className="mute mt-4 w-full text-sm underline" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? t('signup') : t('login')}
        </button>
      </motion.div>
    </div>
  );
}

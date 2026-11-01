# PocketWise AI — Smart Personal Budget Manager

React + Vite + Tailwind + Framer Motion + Recharts + Firebase Auth/Firestore + Gemini (via a server-side function).

## Status (phase 1)
Working: email + Google sign-in, per-user Firestore data, add/edit/delete/search/filter transactions, CSV export,
dashboard (balance, income, expenses, savings rate, health score, pie + 6-month bar charts), demo data,
Tamil/English switch, dark/light theme, AI chat through `/api/chat`.
Planned next: budgets + alerts, savings goals + badges, recurring expenses, voice entry, PDF reports, notifications, PWA.

## 1. Firebase setup
1. Create a project at https://console.firebase.google.com.
2. **Authentication → Sign-in method**: enable Email/Password and Google.
3. **Firestore Database**: create in production mode, then paste `firestore.rules` into the Rules tab and publish.
4. **Project settings → Your apps → Web app**: copy the config values.
5. **Authentication → Settings → Authorized domains**: add your Vercel domain after deploying.

## 2. Gemini key
Create a key at https://aistudio.google.com/apikey. It is used only in `api/chat.js` on the server.

## 3. Run locally
```bash
npm install
cp .env.example .env.local     # fill in values
npm i -g vercel
vercel dev                     # serves the app AND /api/chat
```
(`npm run dev` runs the UI only; the AI chat needs `vercel dev` or a deployment.)

## 4. Deploy via GitHub + Vercel
GitHub Pages cannot run the `/api/chat` function, so use Vercel (free tier works).
1. Create a GitHub repo and push:
   ```bash
   git init && git add . && git commit -m "PocketWise AI"
   git branch -M main
   git remote add origin https://github.com/<you>/pocketwise-ai.git
   git push -u origin main
   ```
2. At https://vercel.com → **Add New → Project** → import the repo (Framework: Vite).
3. Add environment variables (Settings → Environment Variables):
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`,
   `GEMINI_API_KEY`, `GEMINI_MODEL` (optional), `FIREBASE_WEB_API_KEY` (same value as `VITE_FIREBASE_API_KEY`).
4. Deploy, then add the Vercel domain to Firebase Authorized domains.

## Security notes
- `GEMINI_API_KEY` has no `VITE_` prefix, so it never reaches the browser.
- `/api/chat` rejects requests without a valid Firebase ID token.
- Firestore rules restrict each user to `users/{their uid}/...`.

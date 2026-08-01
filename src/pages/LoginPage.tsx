import { useState } from 'react';
import { z } from 'zod';
import { authService } from '../services/authService';
import { isConfigured } from '../lib/supabase';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setMessage('');
    if (!z.string().email().safeParse(email).success) { setMessage('יש להזין כתובת דוא״ל תקינה.'); return; }
    setBusy(true);
    try { await authService.sendMagicLink(email, mode === 'signup'); setMessage(mode === 'signup' ? 'קישור הרשמה נשלח אליך. לאחר האימות תקבל/י הרשאת צפייה.' : 'קישור התחברות נשלח אליך בדוא״ל.'); }
    catch { setMessage('לא ניתן לשלוח את הקישור כעת. בדקו את הכתובת ונסו שוב.'); }
    finally { setBusy(false); }
  };
  const isSignup = mode === 'signup';
  return <div className="login"><img className="login-watermark" src="/maccabi-kfar-saba-logo-transparent.png" alt="" aria-hidden="true"/><section><img className="login-logo" src="/maccabi-kfar-saba-logo-transparent.png" alt="סמל מכבי כפר סבא"/><h1>ניהול ומעקב</h1><p>מכבי כפר סבא · נערים א׳</p><div className="auth-tabs" role="tablist" aria-label="כניסה למערכת"><button role="tab" aria-selected={!isSignup} className={!isSignup ? 'active' : ''} onClick={() => { setMode('login'); setMessage(''); }}>כניסה</button><button role="tab" aria-selected={isSignup} className={isSignup ? 'active' : ''} onClick={() => { setMode('signup'); setMessage(''); }}>הרשמה</button></div><form onSubmit={submit}><label>כתובת דוא״ל<input dir="ltr" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" /></label><button className="button primary" disabled={busy || !isConfigured}>{busy ? 'שולח…' : isSignup ? 'שלחו לי קישור הרשמה' : 'שלחו לי קישור התחברות'}</button></form>{isSignup && <p className="auth-note">נרשמים חדשים מקבלים הרשאת צפייה בלבד. שינוי הרשאה מתבצע על ידי מנהל המערכת.</p>}{!isConfigured && <p className="notice">נדרשת הגדרת Supabase בקובץ `.env` לפני התחברות.</p>}{message && <p className="notice">{message}</p>}</section></div>;
}

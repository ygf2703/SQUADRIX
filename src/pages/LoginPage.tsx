import { useState } from 'react';
import { z } from 'zod';
import { authService } from '../services/authService';
import { isConfigured } from '../lib/supabase';

const passwordSchema = z.string().min(8, 'הסיסמה חייבת להכיל לפחות 8 תווים.');
type AuthMode = 'login' | 'signup' | 'recover' | 'update-password';

export function LoginPage() {
  const recoveryLink = new URLSearchParams(window.location.search).get('reset_password') === '1';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [mode, setMode] = useState<AuthMode>(recoveryLink ? 'update-password' : 'login');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const isSignup = mode === 'signup';
  const isReset = mode === 'update-password';

  const switchMode = (next: AuthMode) => { setMode(next); setMessage(''); setPassword(''); setConfirmation(''); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    if (mode !== 'update-password' && !z.string().email().safeParse(email).success) { setMessage('יש להזין כתובת דוא״ל תקינה.'); return; }
    if (mode === 'recover') {
      setBusy(true);
      try { await authService.requestPasswordReset(email); setMessage('נשלח קישור מאובטח להגדרת סיסמה חדשה.'); }
      catch { setMessage('לא ניתן לשלוח קישור לאיפוס סיסמה.'); }
      finally { setBusy(false); }
      return;
    }
    if (!passwordSchema.safeParse(password).success) { setMessage('הסיסמה חייבת להכיל לפחות 8 תווים.'); return; }
    if ((isSignup || isReset) && password !== confirmation) { setMessage('אימות הסיסמה אינו תואם.'); return; }
    setBusy(true);
    try {
      if (isSignup) {
        await authService.signUp(email, password);
        switchMode('login');
        setMessage('ההרשמה הושלמה. אפשר להיכנס עם המייל והסיסמה שבחרת.');
      } else if (isReset) {
        await authService.updatePassword(password);
        window.history.replaceState({}, '', '/login');
        switchMode('login');
        setMessage('הסיסמה עודכנה. אפשר להיכנס כעת.');
      } else {
        await authService.signIn(email, password);
      }
    } catch {
      setMessage(isSignup ? 'לא ניתן להשלים את ההרשמה. ייתכן שהמייל כבר קיים.' : isReset ? 'קישור האיפוס אינו תקף או שפג תוקפו. בקשו קישור חדש.' : 'כתובת המייל או הסיסמה שגויות.');
    } finally { setBusy(false); }
  };

  const title = isReset ? 'הגדרת סיסמה חדשה' : mode === 'recover' ? 'איפוס סיסמה' : 'Football Team Operations';
  const submitLabel = busy ? 'מעבד…' : isSignup ? 'יצירת חשבון' : isReset ? 'שמירת סיסמה חדשה' : mode === 'recover' ? 'שליחת קישור לאיפוס' : 'כניסה למערכת';

  return <div className="login squadrix-login"><img className="login-watermark" src="/squadrix-logo.png" alt="" aria-hidden="true"/><section><img className="login-logo" src="/squadrix-logo.png" alt="SQUADRIX"/><h1>SQUADRIX</h1><p>{title}</p>{!isReset && mode !== 'recover' && <div className="auth-tabs" role="tablist" aria-label="כניסה למערכת"><button type="button" role="tab" aria-selected={!isSignup} className={!isSignup ? 'active' : ''} onClick={() => switchMode('login')}>כניסה</button><button type="button" role="tab" aria-selected={isSignup} className={isSignup ? 'active' : ''} onClick={() => switchMode('signup')}>הרשמה</button></div>}<form onSubmit={submit}>{!isReset && <label>כתובת דוא״ל<input dir="ltr" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" /></label>}{mode !== 'recover' && <label>{isReset ? 'סיסמה חדשה' : 'סיסמה'}<input dir="ltr" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={isSignup || isReset ? 'new-password' : 'current-password'} /></label>}{(isSignup || isReset) && <label>אימות סיסמה<input dir="ltr" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" /></label>}<button className="button primary" disabled={busy || !isConfigured}>{submitLabel}</button></form>{mode === 'login' && <button type="button" className="auth-link" onClick={() => switchMode('recover')}>שכחתי סיסמה</button>}{(mode === 'recover' || isReset) && <button type="button" className="auth-link" onClick={() => switchMode('login')}>חזרה לכניסה</button>}{isSignup && <p className="auth-note">נרשמים חדשים מקבלים הרשאת צפייה בלבד. שינוי הרשאה מתבצע על ידי מנהל המערכת.</p>}{!isConfigured && <p className="notice">נדרשת הגדרת Supabase בקובץ `.env` לפני התחברות.</p>}{message && <p className="notice">{message}</p>}</section></div>;
}

import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, ExternalLink, ShieldCheck, Store } from 'lucide-react';
import { EmptyState, LoadingSkeleton, PageHeader, PrimaryButton } from '../components/ui';
import { useTeam } from '../contexts/TeamContext';
import { subscriptionService, type ClubSubscription } from '../services/subscriptionService';

const STORE_PRODUCT_ID = '9P2WBRG7415R';
const STORE_WEB_URL = `https://apps.microsoft.com/detail/${STORE_PRODUCT_ID}`;
const STORE_DESKTOP_URL = `ms-windows-store://pdp/?productid=${STORE_PRODUCT_ID}`;

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat('he-IL', { dateStyle: 'long' }).format(new Date(value)) : '—';
}

export function SubscriptionPage() {
  const { activeTeam, canManageClub } = useTeam();
  const [subscription, setSubscription] = useState<ClubSubscription | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!activeTeam?.club_id || !canManageClub) return;
    setSubscription(null); setError('');
    void subscriptionService.getClubSubscription(activeTeam.club_id)
      .then(setSubscription)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'לא ניתן לטעון את מצב המנוי.'));
  }, [activeTeam?.club_id, canManageClub]);

  if (!canManageClub) return <EmptyState title="גישה למנהלי מועדון בלבד" text="מסך המנוי זמין לבעלים, מנכ״ל, מנהל מקצועי או מנהל מועדון." />;
  if (!activeTeam) return <EmptyState title="אין קבוצה פעילה" text="בחרו קבוצה לפני ניהול מנוי המועדון." />;
  if (!subscription && !error) return <LoadingSkeleton lines={4} />;
  if (error) return <section className="error-state"><div><strong>לא ניתן לטעון את מצב המנוי</strong><p>{error}</p></div></section>;

  const isTrial = subscription?.status === 'trial';
  const isActive = subscription?.status === 'active';
  const title = isActive ? 'המנוי פעיל' : isTrial ? 'חודש ניסיון פעיל' : 'נדרש מנוי פעיל';
  const copy = isActive
    ? `המנוי של ${activeTeam.name} פעיל עד ${formatDate(subscription?.current_period_ends_at ?? null)}.`
    : isTrial
      ? `תקופת הניסיון של המועדון מסתיימת ב־${formatDate(subscription?.trial_ends_at ?? null)}.`
      : 'תקופת הניסיון הסתיימה. רכשו את המנוי החודשי כדי להמשיך להשתמש במערכת.';
  const storeHref = navigator.userAgent.includes('Electron') ? STORE_DESKTOP_URL : STORE_WEB_URL;

  return <>
    <PageHeader title="מנוי מועדון" description="חודש ראשון ללא עלות, ולאחר מכן 250 ₪ לחודש לכל מועדון." />
    <section className={`subscription-hero ${subscription?.status}`}>
      <div className="subscription-icon">{isActive ? <CheckCircle2 /> : isTrial ? <Clock3 /> : <Store />}</div>
      <div><h2>{title}</h2><p>{copy}</p></div>
      {!isActive && <PrimaryButton onClick={() => { window.open(storeHref, '_blank', 'noopener,noreferrer'); }}><Store size={18}/>רכישת מנוי ב־Microsoft Store <ExternalLink size={16}/></PrimaryButton>}
    </section>
    <section className="subscription-grid">
      <article className="data-card"><h2>מה כולל המנוי</h2><ul className="subscription-list"><li>כל הקבוצות תחת אותו מועדון</li><li>סגל, משחקים, אימונים, הרכבים וסטטיסטיקות</li><li>הרשאות לצוות המקצועי ולהנהלת המועדון</li><li>מיתוג עצמאי: שם, לוגו וצבעי ממשק</li></ul></article>
      <article className="data-card"><h2>פרטי חיוב</h2><dl className="subscription-details"><div><dt>מסלול</dt><dd>חודשי למועדון</dd></div><div><dt>מחיר לאחר ניסיון</dt><dd>250 ₪ לחודש</dd></div><div><dt>ספק תשלום</dt><dd>Microsoft Store</dd></div><div><dt>Store ID</dt><dd dir="ltr">{subscription?.provider_product_id ?? STORE_PRODUCT_ID}</dd></div></dl></article>
    </section>
    <section className="subscription-security"><ShieldCheck size={20}/><p>אישור המנוי נשמר רק לאחר אימות מול Microsoft Store בצד השרת. האפליקציה אינה מאפשרת למשתמש לשנות סטטוס מנוי בעצמו.</p></section>
  </>;
}

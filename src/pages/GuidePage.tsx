import { CalendarDays, ClipboardList, FileSpreadsheet, Settings, Users, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui';

const steps = [
  { icon: Settings, title: '1. מגדירים את המועדון', text: 'מנהל המערכת נכנס להגדרות, מזין שם מועדון, צבעים ולוגו. אפשר להוסיף בהמשך גם קישור לעמוד הקבוצה באתר ההתאחדות.', to: '/settings', action: 'להגדרות' },
  { icon: Users, title: '2. מגדירים גישה לצוות', text: 'כל משתמש נרשם עם מייל וסיסמה. מנהל המערכת קובע אם הוא צוות מקצועי שיכול לערוך או משתמש לצפייה בלבד.', to: '/users', action: 'למשתמשים' },
  { icon: UsersRound, title: '3. בונים את הסגל', text: 'מוסיפים שחקנים ידנית או מייבאים קובץ CSV לפי התבנית. אפשר לעדכן תפקיד, סטטוס, פציעה, עומס יתר וצפי היעדרות.', to: '/players', action: 'לסגל' },
  { icon: ClipboardList, title: '4. מוסיפים משחקים', text: 'יוצרים משחק בודד או מייבאים לוח משחקים מ־CSV. לאחר משחק אפשר להשלים תוצאה ונתונים מקצועיים.', to: '/matches', action: 'למשחקים' },
  { icon: CalendarDays, title: '5. מנהלים את השבוע', text: 'לוח הזמנים מיועד לאימונים, מחנות אימונים ומשחקי אימון. הוא מאפשר לראות את תוכנית הצוות במקום אחד.', to: '/schedule', action: 'ללוח הזמנים' },
  { icon: FileSpreadsheet, title: '6. מנתחים ביצועים', text: 'לאחר הזנת דקות, שערים ובישולים, עמוד הסטטיסטיקות מציג נתונים מצטברים ומידע לפי שחקן.', to: '/statistics', action: 'לסטטיסטיקות' },
];

export function GuidePage() {
  return <><PageHeader title="מדריך שימוש" description="סדר העבודה המומלץ להקמה ולהפעלה שוטפת של המועדון."/><section className="guide-intro"><b>מתחילים בהגדרות, ממשיכים לסגל ולמשחקים, ומקבלים תמונת מצב בדשבורד ובסטטיסטיקות.</b><span>אין צורך למלא הכול מראש — אפשר להתחיל בנתון אחד ולהתקדם בהדרגה.</span></section><section className="guide-grid">{steps.map(({ icon: Icon, title, text, to, action }) => <article className="guide-step" key={title}><Icon size={24}/><h2>{title}</h2><p>{text}</p><Link to={to}>{action}</Link></article>)}</section><section className="guide-note"><h2>ייבוא CSV</h2><p>במסכי סגל ומשחקים יש כפתור <b>ייבוא CSV</b> והורדת תבנית עם שמות השדות הנדרשים. הייבוא מציג בדיקה לפני השמירה.</p></section></>;
}

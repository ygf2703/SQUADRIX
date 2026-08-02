# SQUADRIX — Football Team Operations

SQUADRIX היא מערכת RTL לניהול הפעילות המקצועית של קבוצות כדורגל: סגל, משחקים, לוח זמנים, סטטיסטיקות והרשאות צוות.

מכבי כפר סבא היא קבוצת ה־MVP הראשונה בלבד. זהות המועדון ניתנת להתאמה דרך המערכת, בעוד **SQUADRIX** הוא מותג האפליקציה.

## יכולות קיימות

- הרשמה חד־פעמית וכניסה חוזרת עם כתובת דוא״ל וסיסמה.
- תפקידי משתמש: `admin`, `professional_staff`, `viewer`, עם RLS ב־Supabase.
- ניהול שחקנים, כולל סטטוס פציעה או עומס יתר וצפי היעדרות.
- הוספה, עריכה ומחיקה מאושרת של שחקנים ומשחקים.
- לוח מקצועי לאימונים, מחנות אימונים ומשחקי אימון.
- ייבוא סגל ומשחקים מקובצי CSV, עם הורדת תבניות ואימות לפני שמירה.
- מיתוג קבוצה: שם, שם קצר, צבעים ולוגו מותאם דרך **הגדרות → מיתוג הקבוצה**.
- העלאת לוגו ל־Supabase Storage והחלתו על ממשק הקבוצה.
- Audit log ברמת בסיס הנתונים לפעולות מהותיות.

## דרישות

- Node.js 22 ומעלה.
- פרויקט Supabase פעיל.

## הרצה מקומית

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

פתחו את `http://127.0.0.1:5173`.

## משתני סביבה

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
URL=http://localhost:8888
DEPLOY_PRIME_URL=
```

`VITE_SUPABASE_ANON_KEY` הוא מפתח ציבורי ללקוח. `SUPABASE_SERVICE_ROLE_KEY` מיועד רק ל־Netlify Functions, ואסור לחשוף אותו בדפדפן או ב־Git.

## הגדרת Supabase

1. צרו פרויקט Supabase.
2. עברו אל `Authentication → Providers → Email` והפעילו Email + Password.
3. כבו את **Confirm email** כדי שהרשמה ראשונה תעבוד מיד, ללא קישור אימות בדוא״ל.
4. הריצו את קובצי ה־SQL הבאים לפי הסדר ב־SQL Editor:

   - `202608010001_initial_schema.sql`
   - `202608010002_team_schedule.sql`
   - `202608010003_audit_triggers.sql`
   - `202608010004_player_availability.sql`
   - `202608010005_player_absence_date.sql`
   - `202608010006_csv_import.sql`
- `202608010007_club_branding.sql`
   - `202608010008_official_source.sql`

5. החשבון הראשון של `noamfrostig@gmail.com` מקבל הרשאת `admin`; כל חשבון חדש נוצר כ־`viewer`.
6. התחברו כמנהל, פתחו **הגדרות → מיתוג הקבוצה**, והגדירו את זהות הקבוצה הראשונה.

## ייבוא CSV

מהאפליקציה:

- `סגל → ייבוא CSV → הורדת תבנית`
- `משחקים → ייבוא CSV → הורדת תבנית`

קיימים גם קובצי בדיקה מוכנים:

- `sample-imports/sample-squad-24.csv` — סגל מדגמי של 24 שחקנים.
- `sample-imports/sample-matches-46.csv` — 6 משחקי אימון, 36 משחקי ליגה ו־4 משחקי גביע.

## בדיקות

```powershell
npm.cmd run lint
npm.cmd run build
```

## פריסה ב־Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

הגדירו ב־Netlify את משתני הסביבה שלמעלה, ובפרט `SUPABASE_SERVICE_ROLE_KEY` עבור `netlify/functions/invite-user.ts`.

## מגבלות נוכחיות

- מסך ניהול משתמשים מלא טרם מומש; הרשאות קיימות בבסיס הנתונים.
- עריכת אירוע קיים בלוח הזמנים טרם חוברה לממשק; הוספה ומחיקה פעילות.
- הזנת סגל למשחק, דקות, שערים, כרטיסים ואירועי משחק מפורטים עדיין אינה ממומשת.
- העלאת תמונות שחקנים טרם ממומשת.
- חיבור ההתאחדות שומר ובודק מקור רשמי, אך סנכרון אוטומטי ממתין ל־API רשמי או אישור גישה, משום שהאתר מחזיר `403` לבקשת שרת רגילה.

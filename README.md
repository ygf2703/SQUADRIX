# מכבי כפר סבא — ניהול ומעקב

מערכת פרטית לניהול ומעקב אחר קבוצת מכבי כפר סבא — נערים א׳, ליגה ארצית דרום. הממשק בעברית וב־RTL ומותאם למחשב ולנייד.

## יכולות קיימות

- התחברות והרשמה באמצעות Magic Link של Supabase Auth.
- משתמש חדש נרשם כ־`viewer`; רק `noamfrostig@gmail.com` מוגדר כ־`admin`.
- הרשאות `admin`, `professional_staff` ו־`viewer`, עם RLS ב־Supabase.
- דשבורד, סגל, משחקים, סטטיסטיקות ולוח זמנים מקצועי.
- הוספת שחקנים ומשחקים עם אימות טפסים באמצעות React Hook Form ו־Zod.
- סטטוסי שחקן: פעיל, פציעה, עומס יתר, מושעה ולא פעיל. בפציעה או עומס יתר ניתן להגדיר צפי היעדרות.
- לוח זמנים לאימונים, מחנות אימונים ומשחקי אימון.
- ייבוא סגל ומשחקים מקובצי CSV, כולל תבניות מוכנות להורדה ואימות לפני שמירה.
- מחיקה מאושרת של שחקנים, משחקים ואירועי לוח זמנים; פעולות מהותיות מתועדות ב־Audit Log.
- לוגו המועדון מוצג ללא שינוי, עם watermark עדין בחוויית הכניסה ובמעטפת האפליקציה.

אין חיבור להתאחדות לכדורגל, API חיצוני, scraping או סנכרון אוטומטי.

## הרצה מקומית

דרושה גרסת Node.js 22 ומעלה.

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

`SUPABASE_SERVICE_ROLE_KEY` מיועד ל־Netlify Functions בלבד. אין לחשוף אותו בדפדפן, ב־Vite או ב־Git.

## Supabase

1. צרו פרויקט Supabase.
2. הפעילו Email OTP / Magic Link תחת Authentication והגדירו Redirect URLs עבור הפיתוח והדומיין ב־Netlify.
3. הריצו את כל קבצי ה־SQL שבתיקיית `supabase/migrations` לפי הסדר:
   - `202608010001_initial_schema.sql`
   - `202608010002_team_schedule.sql`
   - `202608010003_audit_triggers.sql`
   - `202608010004_player_availability.sql`
   - `202608010005_player_absence_date.sql`
   - `202608010006_csv_import.sql`
4. התחברו בפעם הראשונה עם `noamfrostig@gmail.com` כדי ליצור את מנהל המערכת היחיד.

## Netlify

הגדרות build:

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

הגדירו ב־Netlify את משתני הסביבה שלמעלה, ובפרט את `SUPABASE_SERVICE_ROLE_KEY` עבור `netlify/functions/invite-user.ts`.

## בדיקות

```powershell
npm.cmd run lint
npm.cmd run build
```

## מגבלות נוכחיות

עריכת פריטים קיימים, העלאת תמונות שחקנים, הזנת הרכבים/אירועי משחק מפורטים ומסך מלא לניהול משתמשים עדיין דורשים מימוש. אין נתוני שחקנים או משחקים מומצאים ב־seed.

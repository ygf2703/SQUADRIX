# SQUADRIX — Football Team Operations

מערכת RTL לניהול הפעילות המקצועית של קבוצת כדורגל: סגל, משחקים, לוח זמנים, סטטיסטיקות והרשאות צוות.

מכבי כפר סבא היא נתוני ה־MVP הראשונים בלבד. המוצר מוכן למיתוג מועדונים: שם קבוצה, שם קצר, לוגו וצבעי ממשק.

## יכולות

- הרשמה וכניסה באמצעות כתובת דוא״ל וסיסמה.
- תפקידי `admin`, `professional_staff`, `viewer` ו־RLS.
- ניהול שחקנים, סטטוס פציעה/עומס יתר וצפי היעדרות.
- ניהול משחקים, אימונים, מחנות ומשחקי אימון.
- עריכת שחקנים ומשחקים ומחיקה מאושרת.
- ייבוא סגל ומשחקים מ־CSV, עם תבניות להורדה.
- מסך מיתוג למנהל מערכת והעלאת לוגו ל־Supabase Storage.

## הרצה מקומית

נדרשת Node.js 22 ומעלה.

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

`SUPABASE_SERVICE_ROLE_KEY` מיועד ל־Netlify Functions בלבד; אין לחשוף אותו בדפדפן או ב־Git.

## Supabase

1. צרו פרויקט Supabase והפעילו Email + Password. כדי לא לדרוש קישור אימות במייל, כבו את Confirm email בהגדרות ספק Email.
2. הריצו את קובצי ה־SQL לפי הסדר ב־`supabase/migrations`, כולל `202608010007_club_branding.sql`.
3. התחברו בפעם הראשונה עם `noamfrostig@gmail.com` כדי ליצור את מנהל המערכת הראשי.
4. במסך **הגדרות → מיתוג הקבוצה** הגדירו את זהות הקבוצה הראשונה.

## בדיקות

```powershell
npm.cmd run lint
npm.cmd run build
```

## פריסה ב־Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`

הגדירו את משתני הסביבה שלמעלה, ובפרט `SUPABASE_SERVICE_ROLE_KEY` עבור `netlify/functions/invite-user.ts`.

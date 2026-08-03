# SQUADRIX — Football Team Operations

מערכת RTL לניהול הפעילות המקצועית של קבוצת כדורגל: סגל, משחקים, לוח זמנים, סטטיסטיקות, משתמשים ומיתוג מועדון.

SQUADRIX עולה כמוצר נקי. מנהל המערכת מזין את זהות המועדון, הלוגו, צבעי הממשק והנתונים דרך האפליקציה.

## יכולות פעילות

- הרשמה וכניסה באמצעות דוא״ל וסיסמה, כולל חידוש סיסמה.
- תפקידי משתמשים: `admin`, `professional_staff`, `viewer`.
- מסך משתמשים למנהל: צפייה במשתמשים ושינוי תפקיד של משתמשים שאינם מנהלים.
- ניהול סגל: הוספה, עריכה, מחיקה מאושרת, סטטוס פעיל/פצוע/עומס יתר וצפי חזרה.
- ניהול משחקים ולוח מקצועי: אימונים, מחנות אימון, משחקי אימון ומשחקים רשמיים.
- נתוני שחקן לכל משחק: סטטוס בסגל, הרכב/מחליף, דקות, שערים, בישולים וכרטיסים.
- עמוד „המשחק הבא”: בחירת מערך והרכב של 11 שחקנים זמינים בלבד, עם הדמיית מגרש ומדים בצבעי המועדון.
- דשבורד סטטיסטיקות עם בחירת שחקן ומדדי דקות, שערים, בישולים, הרכב והיעדרויות.
- ייבוא CSV לסגל ולמשחקים, כולל תבניות להורדה ואימות לפני שמירה.
- מיתוג מועדון: שם, שם קצר, צבעים ולוגו ב־Supabase Storage; הלוגו משמש גם כסימן מים עדין בממשק.
- מדריך שימוש בתוך האפליקציה.
- איפוס סביבת עבודה מתוך ההגדרות, למנהל בלבד, עם חלון אישור.

## עבודה שוטפת

1. מנהל נכנס ל־**הגדרות** ומגדיר את פרטי המועדון.
2. ב־**משתמשים** מגדירים את רמות ההרשאה של חברי הצוות.
3. מכניסים סגל ומשחקים ידנית או מייבאים CSV.
4. ב־**המשחק הבא** בוחרים משחק, מערך ו־11 שחקנים זמינים; פצועים, מושעים ושחקנים בעומס יתר אינם מוצגים לבחירה.
5. לכל משחק נכנסים ל־**משחקים → בחירת משחק → סגל וסטטיסטיקות**, מזינים דקות, שערים, בישולים וכרטיסים ושומרים.
6. ב־**סטטיסטיקות** מסננים שחקן ומקבלים את התמונה המצטברת.

## הרצה מקומית

דרישות: Node.js 22 ומעלה ופרויקט Supabase פעיל.

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

פותחים את `http://127.0.0.1:5173`.

## משתני סביבה

בקובץ `.env` המקומי וב־Netlify יש להגדיר:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

במידה שמשתמשים ב־Netlify Functions שדורשים הרשאת שרת, מגדירים גם ב־Netlify בלבד:

```env
SUPABASE_SERVICE_ROLE_KEY=
```

אין להכניס מפתחות אמיתיים ל־Git. `VITE_SUPABASE_ANON_KEY` הוא מפתח ציבורי ללקוח; `SUPABASE_SERVICE_ROLE_KEY` הוא סודי ואסור לחשוף אותו בדפדפן.

## הגדרת Supabase

1. ב־`Authentication → Providers → Email` מפעילים Email + Password ומאפשרים הרשמה.
2. עבור הרשמה מיידית ללא קישור אימות, מכבים את **Confirm email**.
3. ב־`Authentication → URL Configuration` מגדירים:
   - Site URL: `https://squadrix.netlify.app`
   - Redirect URLs: `https://squadrix.netlify.app/app/**`, וכן כתובות localhost לפיתוח.
4. מריצים ב־SQL Editor את קובצי ה־migration לפי הסדר:

   - `202608010001_initial_schema.sql`
   - `202608010002_team_schedule.sql`
   - `202608010003_audit_triggers.sql`
   - `202608010004_player_availability.sql`
   - `202608010005_player_absence_date.sql`
   - `202608010006_csv_import.sql`
   - `202608010007_club_branding.sql`
   - `202608010008_official_source.sql`
   - `202608020002_admin_workspace_reset.sql`
   - `202608020003_match_lineups.sql`
   - `202608020004_imported_season_statistics.sql`
   - `202608020005_idempotent_player_import.sql`
   - `202608020006_fix_workspace_reset.sql`

`202608010007_club_branding.sql` יוצר את bucket בשם `club-logos` ואת מדיניות האחסון. אם מוצגת השגיאת `Bucket not found`, יש לוודא שה־migration הזה רץ בהצלחה.

חשבון חדש מקבל כברירת מחדל הרשאת `viewer`. יש לקדם משתמש מורשה לתפקיד `admin` ישירות ב־Supabase בעת ההקמה הראשונה; לאחר מכן ניהול התפקידים מתבצע במסך **משתמשים**.

## ייבוא CSV

בתוך האפליקציה:

- `סגל → ייבוא CSV → הורדת תבנית`
- `משחקים → ייבוא CSV → הורדת תבנית`

קובצי בדיקה אופציונליים נמצאים ב־repository בלבד ואינם נטענים אוטומטית:

- `sample-imports/sample-squad-24.csv` — סגל לדוגמה של 24 שחקנים.
- `sample-imports/sample-matches-46.csv` — 6 משחקי אימון, 36 משחקי ליגה ו־4 משחקי גביע.

## איפוס נתונים להדגמה

אדמין יכול לאפס את סביבת העבודה מתוך **הגדרות → איפוס סביבת העבודה**. הפעולה מוחקת את הנתונים התפעוליים של הסגל, המשחקים, הסטטיסטיקות ולוח הזמנים, ומחזירה מועדון/עונה/קבוצה נקיים. היא אינה מוחקת משתמשים או הרשאות.

האפשרות זמינה רק לאחר הרצת `202608020002_admin_workspace_reset.sql`. קיים גם `202608020001_reset_demo_data.sql` לאיפוס ידני דרך SQL Editor. שתי הפעולות מיועדות להדגמה בלבד — אין להריץ אותן על נתוני מועדון פעיל. קבצי לוגו ישנים עשויים להישאר פיזית ב־Storage, אך אינם מחוברים למועדון לאחר האיפוס.

## פריסה ב־Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- משתני סביבה: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `NODE_VERSION=22`; ואם נדרשות פונקציות שרת — גם `SUPABASE_SERVICE_ROLE_KEY`.

לא מגדירים ידנית את `URL` ב־Netlify; זו משתנה מערכת שמנוהל על ידי Netlify.

## חיבור להתאחדות לכדורגל

בהגדרות ניתן לשמור כתובת עמוד קבוצה של ההתאחדות ולבדוק את מבנה הקישור (`team_id`, `season_id`). חיבור סנכרון אוטומטי עדיין אינו פעיל: בקשת שרת רגילה אל אתר ההתאחדות נחסמת כרגע ב־`403`.

לא נעקפים מנגנוני גישה או הגנות אתר. כדי לבנות סנכרון אמין נדרש API רשמי, תיעוד אינטגרציה או חשבון פורטל מורשה ברמת המועדון. עד אז מזינים את הנתונים ידנית או בייבוא CSV.

## גבולות ה־MVP

הגרסה הנוכחית מיועדת לפיילוט של מועדון יחיד. לפני מכירה למספר מועדונים יש להוסיף מבנה multi-tenant מלא: `organizations`, שיוך מועדונים לארגון, memberships ו־RLS שמבודד נתונים בין לקוחות.

לגרסת Microsoft Store מומלץ בהמשך לעטוף את אותו מוצר Web באמצעות Tauri ולהפיק חבילת MSIX; אין צורך לבנות מוצר נפרד.

## בדיקות

```powershell
npm.cmd run lint
npm.cmd run build
```

## Desktop for Windows

SQUADRIX can be distributed as a native Windows desktop application without changing the existing Supabase or Netlify setup.

```powershell
# Run the packaged app locally after building the web client
npm.cmd run desktop

# Create a Windows installer and a portable executable
npm.cmd run desktop:package
```

The generated files are placed in `release-desktop/`:

- `SQUADRIX-Setup-<version>.exe` — recommended installer for clubs.
- `SQUADRIX-Portable-<version>.exe` — runs without installation.

The current desktop distribution is an unsigned Windows build. For Microsoft Store distribution, use the same Electron application to produce a signed MSIX/AppX package after opening the Microsoft Partner Center account and obtaining a signing certificate.

## Landing page

The standalone marketing site is located in `landing/`. It is intentionally separate from the authenticated application so it can be deployed as a second Netlify site or a subdomain without changing the existing app URL.

- Main file: `landing/index.html`
- YouTube demo link: set `SQUADRIX_YOUTUBE_URL` in `landing/config.js`
- Price displayed: `250 ₪` per club per month

The landing page is published from the same Netlify site at the root URL. The authenticated application is available at `https://squadrix.netlify.app/app/login`.

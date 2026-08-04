# SQUADRIX — Football Team Operations

מערכת RTL לניהול הפעילות המקצועית של מועדון כדורגל: קבוצות, סגל, משחקים, לוח זמנים, הרכבים, סטטיסטיקות והרשאות.

האתר השיווקי זמין ב־`/` והאפליקציה המאובטחת ב־`/app/login`.

## יכולות עיקריות

- התחברות והרשמה באמצעות דוא״ל וסיסמה, כולל חידוש סיסמה.
- ניהול סגל, משחקים, אירועי לוח זמנים, הרכב למשחק הבא וסטטיסטיקות שחקנים.
- ייבוא CSV לסגל ולמשחקים, עם תבניות להורדה.
- צבעי ממשק ולוגו מועדון המוחלים בכל האפליקציה.
- ניהול קבוצות במועדון והרשאות לפי מועדון או קבוצה:
  - `owner`, `ceo`, `professional_director`, `club_admin` — גישה לכל קבוצות המועדון.
  - `head_coach`, `assistant_coach`, `analyst`, `physio`, `viewer` — גישה לקבוצות שאליהן שובצו בלבד.
- עמוד נחיתה עם סרטון הדגמה, חודש ניסיון וגרסת Windows.

## הפעלה מקומית

דרישות: Node.js 22 ומעלה ופרויקט Supabase פעיל.

```powershell
Copy-Item .env.example .env
npm.cmd install
npm.cmd run dev
```

פותחים את `http://127.0.0.1:5173`. העמוד הראשי הוא דף הנחיתה; האפליקציה נמצאת ב־`http://127.0.0.1:5173/app/login`.

## משתני סביבה

בקובץ `.env` המקומי וגם ב־Netlify:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### מנוי Microsoft Store

המנוי החודשי של SQUADRIX מוגדר כ־Microsoft Store Subscription Add-on:

- Add-on Store ID: `9P2WBRG7415R`
- מחיר: 250 ₪ לחודש למועדון
- ניסיון: 30 ימים ממועד יצירת המועדון

יש להריץ את המיגרציה הבאה לאחר `202608030001_multi_team_access.sql`:

```text
supabase/migrations/202608030002_club_subscriptions.sql
```

ב־Netlify מגדירים את המשתנים הבאים **בצד השרת בלבד**. אין להוסיף קידומת `VITE_` ואין להכניס את ה־secret ל־Git:

```env
MICROSOFT_STORE_TENANT_ID=d1407724-44a1-4743-9787-c8b0905ab76e
MICROSOFT_STORE_CLIENT_ID=244469db-e83d-4081-be23-4deef0d39a0b
MICROSOFT_STORE_CLIENT_SECRET=
MICROSOFT_STORE_SUBSCRIPTION_STORE_ID=9P2WBRG7415R
```

מסך **מנוי מועדון** זמין לבעלי מועדון ולמנהלי מועדון. הוא מציג את מצב הניסיון/המנוי ומוביל לרכישה ב־Microsoft Store. סטטוס מנוי אינו ניתן לשינוי מהדפדפן; אימות entitlement מול Microsoft Store חייב להיעשות בפונקציית שרת לפני שהמערכת תעדכן מנוי ל־`active`.

אין להכניס מפתחות אמיתיים ל־Git. אם נעשה שימוש בפונקציות שרת עם הרשאת שירות, מגדירים את `SUPABASE_SERVICE_ROLE_KEY` ב־Netlify בלבד.

## הגדרת Supabase

1. ב־`Authentication → Providers → Email` מפעילים Email + Password.
2. עבור הרשמה מיידית ללא קישור אימות, מבטלים את **Confirm email**.
3. ב־`Authentication → URL Configuration` מגדירים:
   - Site URL: `https://squadrix.netlify.app`
   - Redirect URLs: `https://squadrix.netlify.app/app/**` וגם כתובות localhost לפיתוח.
4. מריצים ב־SQL Editor את קובצי ה־migration לפי סדר השם שלהם. בהתקנה קיימת יש להריץ גם:

```text
supabase/migrations/202608030001_multi_team_access.sql
```

ה־migration האחרון הכרחי לפני שימוש במספר קבוצות. הוא יוצר את טבלאות החברות, RPCs לניהול הרשאות ומדיניות RLS שמבודדת נתונים בין קבוצות ומועדונים. הוא אינו מוחק נתונים קיימים; מנהלי מערכת קיימים מקבלים בעלות על המועדון ואנשי צוות מקצועי מקבלים שיוך לקבוצות הקיימות.

## ניהול מועדון וקבוצות

לאחר הרצת ה־migration, בעלים/מנכ״ל/מנהל מקצועי/מנהל מועדון נכנסים ל־**ניהול מועדון**:

1. יוצרים קבוצות נוספות עם שם, שנתון, ליגה ומחוז.
2. איש הצוות נרשם פעם אחת לאפליקציה.
3. מזינים את כתובת הדוא״ל שלו ובוחרים שיוך לכל המועדון או לקבוצה ספציפית.
4. המשתמש רואה רק את הקבוצות המותרות לו; בחירת הקבוצה הפעילה מסננת סגל, משחקים, לוח זמנים וסטטיסטיקות.

## נתוני משחק וסטטיסטיקות

נתוני דקות, שערים, בישולים וכרטיסים נשמרים ברמת שחקן־משחק. מזינים אותם מתוך פירוט המשחק, והם מוצגים בעמוד השחקן, בסגל ובעמוד הסטטיסטיקות. CSV של סגל מכיל נתוני פתיחה לעונה; נתונים בפועל מתעדכנים גם דרך פירוט המשחק.

דוח משחק ידני נשמר כפעולה אחת: תוצאה, סטטוס משחק, דקות, כובשים, מבשלים וכרטיסים. כדי להפעיל את השמירה האטומית יש להריץ לאחר המיגרציות הקודמות גם:

```text
supabase/migrations/202608040001_match_reporting.sql
```

הדוח נשמר במקור הנתונים של המשחק וממנו נגזרים אוטומטית כרטיס השחקן, טבלת הסגל, דשבורד הסטטיסטיקה ופירוט הכובשים/המבשלים תחת אותו משחק.

## Netlify

- Build command: `npm run build`
- Publish directory: `dist`
- Node: `22`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

Netlify מנהל את `URL` בעצמו; אין להגדיר משתנה זה ידנית. הדף הראשי נבנה מתוך `landing/` והאפליקציה נשארת תחת `/app`.

## Microsoft Store ו־MSIX

האפליקציה כוללת מעטפת Electron. היא משתמשת באותו לקוח Supabase, כך שנתוני המועדון נשארים בענן והאפליקציה זמינה גם כיישום שולחני.

```powershell
# בדיקה מקומית של מעטפת הדסקטופ
npm.cmd run desktop

# יצירת MSIX להפצה ב־Microsoft Store
npm.cmd run desktop:msix
```

הזהות המוגדרת ב־`package.json` תואמת ל־Partner Center:

- Package identity: `FrostigKnowledgeTransfer.squadrix`
- Publisher: `CN=8D5E8299-C1EE-4376-8783-93E12C1B31BC`
- Application ID: `squadrix`
- Store ID: `9PKRRC8D2LCS`

לפני העלאה לחנות: מריצים `npm.cmd run lint` ו־`npm.cmd run build`, יוצרים MSIX מה־commit הסופי בלבד, מעלים ל־Partner Center, ומשלימים privacy policy, תיאור, צילומי מסך וסיווג גיל. חבילת Store לא דורשת חתימה מקומית; Microsoft חותמת את ההפצה. להפצה ישירה מחוץ לחנות נדרשת חתימה בתעודה מהימנה.

## בדיקות

```powershell
npm.cmd run lint
npm.cmd run build
```

## מגבלות ידועות

אין עדיין אינטגרציית API רשמית מול ההתאחדות לכדורגל. עד לקבלת API מתועד ומורשה, הנתונים מוזנים ידנית או באמצעות CSV. אין לעקוף מנגנוני גישה של אתר ההתאחדות.

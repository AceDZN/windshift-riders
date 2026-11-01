# Windshift Riders: Workbook catalog levels

- **Slug:** `windshift-riders`
- **Title (he):** רוכבי הרוח
- **Title (en):** Windshift Riders
- **Tagline (he):** דואים מעל חופים, רכסים ומדבר וקוראים את מזג האוויר מהנוף: בריזה, שמש, צל ותבליט. תופסים אוויר עולה, חוצים את המעברים הזהובים ונוחתים באחו.
- **Grades:** 8, 9
- **Orientation:** `any` (touch drag stick and brake button; checked at 390×844 portrait)
- **Levels:** 24 authored courses, all open from the start (no locks). `?level=N` opens course N on its short launch briefing (one button, "ממריאים"), the same screen every course opens on.

Module paths come from `CURRICULUM.md` (its W, S, C and B sources); the FAA soaring extension it also cites is not a Workbook module and is left out.

| n | Hebrew level title | Hebrew skill | Workbook geography module paths |
|---|---|---|---|
| 1 | כנפיים ראשונות | שליטה בדאון והיכרות עם הרוח | grade-8/chapter-3/weather-phenomena |
| 2 | הרוח מהים | בריזת ים ביום וסחיפה | grade-8/chapter-3/weather-phenomena |
| 3 | קיצור מסוכן | מהירות מול רזרבת גובה | grade-8/chapter-3/weather-phenomena |
| 4 | חוף חדש | בריזת ים בקו חוף אחר | grade-8/chapter-3/weather-phenomena, grade-9/chapter-2/landform-belts |
| 5 | אדמה מתחממת | חימום קרקע יבשה מול רטובה | grade-8/chapter-3/sun-energy, grade-8/chapter-3/weather-phenomena |
| 6 | צל ענן | צל מחליש חימום ועלייה | grade-8/chapter-3/sun-energy |
| 7 | סיבוב רחב | נשארים בתוך זרם עולה | grade-8/chapter-3/sun-energy |
| 8 | אותו צבע, חום אחר | רטיבות וחימום, לא רק צבע | grade-8/chapter-3/sun-energy |
| 9 | צד הרוח | עלייה במדרון הפונה לרוח | grade-8/chapter-3/weather-phenomena, grade-9/chapter-2/landform-belts |
| 10 | מעבר ההרים | גובה התבליט ורזרבת גובה | grade-9/chapter-2/landform-belts |
| 11 | הרוח הסתובבה | היפוך רוח מחליף את צד העלייה | grade-8/chapter-3/weather-phenomena |
| 12 | רכס לא מוכר | קריאת רוח ומדרון בלי סימון | grade-8/chapter-3/weather-phenomena, grade-9/chapter-2/landform-belts |
| 13 | שקיעה בחוף | החימום נחלש עם השקיעה | grade-8/chapter-3/sun-energy, grade-8/chapter-3/weather-phenomena |
| 14 | בריזת לילה | בריזת יבשה בלילה | grade-8/chapter-3/weather-phenomena |
| 15 | מהעמק להר | רוח עמק במעלה המדרון ביום | grade-8/chapter-3/weather-phenomena, grade-9/chapter-2/landform-belts |
| 16 | לילה בעמק | רוח הר יורדת בלילה | grade-8/chapter-3/weather-phenomena, grade-9/chapter-2/landform-belts |
| 17 | הכרמל והים | חוף ורכס בדרך אחת | grade-9/chapter-2/israel-climate, grade-9/chapter-2/landform-belts, grade-8/chapter-3/weather-phenomena |
| 18 | צל הגשם | מדרון גשום מול צל גשם | grade-9/chapter-2/israel-climate, grade-9/chapter-2/landform-belts |
| 19 | מרחבי הנגב | זרמים עולים במדבר | grade-9/chapter-2/israel-climate, grade-8/chapter-3/sun-energy |
| 20 | יום קריר בהר | גובה, צל וחשיפה לשמש | grade-9/chapter-2/israel-climate, grade-8/chapter-3/sun-energy |
| 21 | רק התחזית | תכנון טיסה לפי תחזית | grade-8/chapter-3/weather-phenomena, grade-8/chapter-3/sun-energy, grade-9/chapter-2/landform-belts |
| 22 | הרוח משתנה | תגובה לשינוי רוח | grade-8/chapter-3/weather-phenomena |
| 23 | המסלול שלכם | סיכון מול רזרבת גובה | grade-8/chapter-3/weather-phenomena, grade-8/chapter-3/sun-energy |
| 24 | אלופי הרוח | חימום, רוח ותבליט יחד | grade-8/chapter-3/weather-phenomena, grade-8/chapter-3/sun-energy, grade-9/chapter-2/israel-climate, grade-9/chapter-2/landform-belts |

Host events: `ready` after the glider model renders; `level-start {level}` when a course opens (deep link, course list, next, retry); `level-complete {level, stars, durationMs}` on a landing, where stars is the count of the three medals (finish, control, environment) and `durationMs` is the course's flight time.

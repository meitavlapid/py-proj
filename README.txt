Blog Project — מערכת בלוג קהילתית
מערכת בלוגים מודרנית הכוללת התחברות, הרשמה, כתיבת פוסטים, תגובות, לייקים, תגיות, פרופיל משתמש, וחיפוש — בפיתוח מלא עם Django + React.


תכולת הפרויקט
🔹 Frontend (React)
עמוד בית עם תצוגת פוסטים

מערכת התחברות/הרשמה

עמודים:

PostDetails (פרטים + תגובות)

CreatePost, EditPost

Profile, EditProfile

SearchResults (חיפוש לפי תגיות/מילות מפתח)

🔹 Backend (Django REST + JWT)
מודלים: Post, Comment, UserProfile, Like

הרשאות לפי תפקיד (משתמש, צוות, אדמין)

מערכת JWT לאבטחה

API RESTful לפי עקרונות DRF

טוקן רענון

אפשרות תגובות מקוננות (Reply)

שימוש ב-Taggit לניהול תגיות

תמיכה ב-CORS


התקנה והרצה
קבצים חשובים
frontend/ – פרויקט React

blog/ – פרויקט Django

.env – משתנים סודיים (DB, JWT, SECRET_KEY וכו')


התקנת חבילות

# התקנת צד שרת
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# התקנת צד לקוח
cd frontend
npm install
npm run dev



התממשקות (API)
Endpoint	Method	תיאור
/api/v1/posts/	GET/POST	רשימת פוסטים / יצירה
/api/v1/posts/:id/	GET/PATCH/DELETE	פוסט לפי מזהה
/api/v1/comments/	POST	יצירת תגובה
/api/v1/comments/post/:post_id/	GET	תגובות לפי פוסט
/api/v1/likes/like/	POST	לייק לפוסט
/api/v1/likes/unlike/	POST	ביטול לייק
/api/v1/users/me/	GET/PATCH	פרטי משתמש נוכחי
/api/v1/auth/register/	POST	הרשמה
/api/v1/token/	POST	קבלת JWT
/api/v1/token/refresh/	POST	רענון JWT


משתמשים ודמו

סופר יוזר\מנהל
username:
 meita
password: 
‏ABab12!@
יוזר רגיל
username:
regular
password: 
ABab12!@


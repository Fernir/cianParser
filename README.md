## 🏠 CIAN PARSER

Парсер квартир с CIAN.ru с красивым веб-интерфейсом, фильтрацией и поддержкой темной темы.

#### ✨ ВОЗМОЖНОСТИ

- 🔍 Парсинг квартир с CIAN.ru (аренда, 1-2 комнатные)
- 🗃️ Сохранение в SQLite всех параметров квартир
- 📸 Автоматическая загрузка фотографий
- 🎨 Современный UI с поддержкой светлой/темной темы
- 🔎 Расширенная фильтрация по цене, району, метро, площади и др.
- 📱 Адаптивный дизайн для всех устройств
- ⚡ SSR с Next.js для быстрой загрузки и SEO
- 🔄 Автоматический парсинг по расписанию

#### 🛠️ ТЕХНОЛОГИИ

**Backend:**

- Python 3.11+
- FastAPI - современный веб-фреймворк
- SQLAlchemy - ORM для работы с БД
- SQLite - легкая встраиваемая БД
- BeautifulSoup4 - парсинг HTML
- APScheduler - планировщик задач

**Frontend:**

- Next.js 15 - React фреймворк с SSR
- TypeScript - типизация
- CSS Modules - изолированные стили
- React Leaflet - карты
- Context API - управление состоянием

#### 📦 УСТАНОВКА

Предварительные требования:

- Python 3.11 или выше
- Node.js 18 или выше
- npm или yarn

Клонирование репозитория:

```
git clone https://github.com/yourusername/cian-parser.git
cd cian-parser
```

Backend:

```
cd backend
python -m venv venv
source venv/bin/activate # для Linux/Mac
```

#### или

```
venv\Scripts\activate # для Windows

pip install -r requirements.txt
cp .env.example .env
python scripts/init_db.py
python scripts/run_parser.py --pages 3
python run.py
```

Frontend:

```
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

#### 🚀 ЗАПУСК

##### Режим разработки:

Терминал 1 (Backend):

```
cd backend
source venv/bin/activate
python run.py
```

##### API доступно на http://localhost:8000

Терминал 2 (Frontend):

```
cd frontend
npm run dev
```

##### Сайт доступен на http://localhost:3000

Планировщик (автоматический парсинг):
cd backend
source venv/bin/activate
python scheduler.py

#### Парсер будет запускаться каждый час

#### 📁 СТРУКТУРА ПРОЕКТА

```
cian-parser/
├── backend/ # Python FastAPI backend
│ ├── app/
│ │ ├── api/ # API endpoints
│ │ ├── parser/ # Парсер CIAN
│ │ ├── models.py # SQLAlchemy модели
│ │ ├── crud.py # CRUD операции
│ │ └── database.py # Подключение к БД
│ ├── scripts/ # Вспомогательные скрипты
│ ├── requirements.txt # Python зависимости
│ └── run.py # Точка входа API
│
├── frontend/ # Next.js фронтенд
│ ├── src/
│ │ ├── app/ # Страницы Next.js
│ │ ├── components/ # React компоненты
│ │ ├── context/ # React контексты
│ │ ├── hooks/ # Кастомные хуки
│ │ ├── services/ # API сервисы
│ │ └── assets/ # Стили и ресурсы
│ ├── public/ # Статические файлы
│ └── package.json # Node зависимости
│
└── static/ # Загруженные фото
└── photos/ # Фото квартир
```

#### ⚙️ КОНФИГУРАЦИЯ

Backend (.env):
DATABASE_URL=sqlite:///./cian_apartments.db
PARSER_LOCATION=Москва
PARSER_START_PAGE=1
PARSER_END_PAGE=3
PHOTOS_PATH=../static/photos

Frontend (.env.local):
NEXT_PUBLIC_API_URL=http://localhost:8000/api

#### 📊 ИСПОЛЬЗОВАНИЕ

Парсинг данных:

- Базовый парсинг (2 страницы, 1-2 комнатные)
  `python scripts/run_parser.py`

- Парсинг с очисткой БД
  `python scripts/run_parser.py --clear`

- Указать количество страниц
  `python scripts/run_parser.py --pages 5`

- Указать комнатность
  `python scripts/run_parser.py --rooms 1,2,3`

- Без загрузки фото
  `python scripts/run_parser.py --no-photos`
- Полная очистка перед парсингом
  `python scripts/run_parser.py --clear --pages 3`

Очистка базы:

- Удалить все записи и фото
  python scripts/clear_db.py

- Без подтверждения
  python scripts/clear_db.py --force

#### 🎨 ТЕМНАЯ ТЕМА

Проект поддерживает светлую и темную тему:

- 🌞 Светлая тема по умолчанию
- 🌙 Темная тема переключается кнопкой в хедере
- 💾 Выбор темы сохраняется в cookies
- 🔄 Тема применяется даже при отключенном JavaScript

#### 📝 API ENDPOINTS

GET /api/apartments/ - Список квартир с пагинацией
GET /api/apartments/{id} - Детальная информация
GET /api/apartments/stats - Статистика
GET /health - Проверка сервера

Параметры фильтрации:

- page - номер страницы
- per_page - элементов на странице
- min_price - минимальная цена
- max_price - максимальная цена
- rooms - комнатность (1,2,3 через запятую)
- district - район
- underground - метро
- min_area - минимальная площадь
- max_area - максимальная площадь
- has_photo - только с фото
- is_owner - только собственники
- sort_by - сортировка

#### 🤝 ВКЛАД В ПРОЕКТ

1. Форкните репозиторий
2. Создайте ветку для фичи (git checkout -b feature/amazing-feature)
3. Закоммитьте изменения (git commit -m 'Add amazing feature')
4. Запушьте в ветку (git push origin feature/amazing-feature)
5. Откройте Pull Request

#### 📄 ЛИЦЕНЗИЯ

MIT License

#### 🙏 БЛАГОДАРНОСТИ

- CIAN.ru за данные
- FastAPI за отличный фреймворк
- Next.js за мощный React фреймворк
- Всем контрибьюторам

**⭐ Если проект полезен, поставьте звезду на GitHub!**

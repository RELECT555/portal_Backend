# МЕДИПАЛ Портал - Backend API

Backend API для корпоративного портала МЕДИПАЛ, построенный на Node.js, Express, TypeScript и Prisma ORM.

## 🛠 Технологический стек

- **Node.js** v20+
- **TypeScript**
- **Express.js** - веб-фреймворк
- **Prisma ORM** - работа с БД
- **PostgreSQL** - база данных
- **Zod** - валидация данных
- **Azure AD** - аутентификация (TODO)

## 📋 Требования

- Node.js >= 20.0.0
- PostgreSQL >= 14
- npm или yarn

## 🚀 Установка и запуск

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

Заполните переменные окружения:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/medipal_portal"
PORT=4000
CORS_ORIGINS=http://localhost:3000

# Azure AD (будет реализовано)
AZURE_TENANT_ID=
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
```

### 3. Настройка базы данных

Создайте PostgreSQL базу данных:

```bash
# Войдите в PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE medipal_portal;
```

Примените миграции Prisma:

```bash
npm run prisma:push
```

Для просмотра данных в UI:

```bash
npm run prisma:studio
```

### 4. Запуск в режиме разработки

```bash
npm run dev
```

Сервер запустится на `http://localhost:4000`

### 5. Production сборка

```bash
npm run build
npm start
```

## 📁 Структура проекта

```
src/
├── controllers/       # Контроллеры для обработки запросов
├── routes/           # Определение API роутов
├── middleware/       # Express middleware (auth, errors)
├── lib/              # Утилиты и конфигурация (Prisma)
└── index.ts          # Точка входа приложения

prisma/
└── schema.prisma     # Prisma схема БД
```

## 🔌 API Endpoints

### Аутентификация

```
POST   /api/auth/login       # Логин (TODO: Azure AD)
GET    /api/auth/me          # Текущий пользователь
```

### Посты

```
GET    /api/posts            # Список постов (с фильтрами)
GET    /api/posts/:id        # Получить пост
POST   /api/posts            # Создать пост (auth)
PUT    /api/posts/:id        # Обновить пост (auth)
DELETE /api/posts/:id        # Удалить пост (auth)
POST   /api/posts/:id/like   # Лайк (auth)
POST   /api/posts/:id/view   # Просмотр (auth)
POST   /api/posts/:id/comments # Комментарий (auth)
```

### Live публикации

```
GET    /api/live             # Список Live публикаций
GET    /api/live/:id         # Получить публикацию
POST   /api/live             # Создать публикацию (auth)
PUT    /api/live/:id         # Обновить (auth)
POST   /api/live/:id/like    # Лайк (auth)
POST   /api/live/:id/heart   # Сердечко (auth)
```

### Новости

```
GET    /api/news             # Список новостей
GET    /api/news/:id         # Получить новость
```

### Профиль

```
GET    /api/profile          # Текущий профиль (auth)
GET    /api/profile/:userId  # Профиль пользователя (auth)
PUT    /api/profile          # Обновить профиль (auth)
GET    /api/profile/:userId/stats # Статистика (auth)
```

### Вакансии

```
GET    /api/vacancies        # Список вакансий
GET    /api/vacancies/:id    # Получить вакансию
```

### Библиотека

```
GET    /api/library/books        # Список книг
GET    /api/library/books/:id    # Получить книгу
POST   /api/library/books/:id/borrow  # Взять книгу (auth)
POST   /api/library/books/:id/return  # Вернуть книгу (auth)
```

### Банк идей

```
GET    /api/ideas            # Список идей
POST   /api/ideas            # Добавить идею (auth)
POST   /api/ideas/:id/vote   # Голосовать (auth)
```

### Благодарности

```
GET    /api/gratitude/stats    # Статистика
GET    /api/gratitude/entries  # Список благодарностей
POST   /api/gratitude          # Отправить благодарность (auth)
```

### Команда

```
GET    /api/team             # Список сотрудников
GET    /api/team/:userId     # Профиль сотрудника
```

## 🔐 Аутентификация

В режиме разработки (`NODE_ENV=development`) аутентификация временно отключена для удобства тестирования.

В production будет использоваться Azure AD через MSAL (Microsoft Authentication Library).

Защищённые endpoints требуют заголовок:
```
Authorization: Bearer <token>
```

## 📊 Модели данных

### Основные сущности:

- **User** - Пользователи портала
- **Post** - Посты (новости, статьи, объявления)
- **LivePublication** - Live публикации
- **Comment** - Комментарии
- **Like** - Лайки
- **Heart** - Сердечки для Live
- **Vacancy** - Вакансии
- **Book** - Книги в библиотеке
- **Idea** - Идеи из банка идей
- **Gratitude** - Благодарности
- **Achievement** - Достижения пользователей

Подробная схема доступна в [prisma/schema.prisma](prisma/schema.prisma)

## 🧪 Разработка

### Полезные команды:

```bash
# Запуск в dev режиме с hot-reload
npm run dev

# Генерация Prisma Client после изменения схемы
npm run prisma:generate

# Создание новой миграции
npm run prisma:migrate

# Применение схемы без миграций (для разработки)
npm run prisma:push

# Открыть Prisma Studio (GUI для БД)
npm run prisma:studio

# Линтинг
npm run lint

# Форматирование кода
npm run format
```

## 🐳 Docker

Запуск с помощью Docker:

```bash
docker build -t medipal-backend .
docker run -p 4000:4000 --env-file .env medipal-backend
```

## 📝 TODO

- [ ] Реализовать Azure AD аутентификацию
- [ ] Добавить middleware для проверки ролей
- [ ] Реализовать загрузку файлов/изображений
- [ ] Добавить rate limiting
- [ ] Настроить логирование (Winston)
- [ ] Написать unit тесты (Jest)
- [ ] Добавить Swagger документацию
- [ ] Настроить CI/CD
- [ ] Добавить кэширование (Redis)

## 🤝 Интеграция с фронтендом

Фронтенд доступен в репозитории `portal_Frontend` и ожидает API на `http://localhost:4000/api`.

Убедитесь, что:
1. Backend запущен на порту 4000
2. CORS настроен для фронтенда (по умолчанию `http://localhost:3000`)
3. База данных настроена и применены миграции

## 📄 Лицензия

Proprietary - МЕДИПАЛ

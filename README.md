# Personal Website

Современный персональный сайт о Калиматовой Аише Еркебулановне с акцентом на визуальные эффекты (градиенты, glassmorphism, анимации) и адаптивный дизайн. Проект состоит из backend (Spring Boot + PostgreSQL) и frontend (React + Vite).

## Содержание
- Описание
- Технологии
- Структура проекта
- Предварительные требования
- Настройка базы данных
- Запуск backend
- Запуск frontend
- Переменные окружения
- API
- Статические изображения
- Сборка продакшн-версии
- Частые проблемы

## Описание
- Главная секция с ФИО и главной фотографией.
- Секция «10 фактов» — данные хранятся в PostgreSQL и загружаются через REST API.
- WOW-дизайн: градиенты, полупрозрачные карточки, плавные hover-эффекты, 3D/параллакс-оттенок на геро-изображении.

## Технологии
- Backend: Spring Boot, Spring Web, Spring Data JPA, PostgreSQL Driver
- DB: PostgreSQL
- Frontend: React + Vite + TypeScript

## Структура проекта
```
project/
├── backend/               # Spring Boot приложение
│   ├── src/
│   ├── pom.xml
│   └── ...
├── frontend/              # React + Vite приложение
│   ├── src/
│   │   ├── img/
│   │   │   ├── main.png
│   │   │   ├── 1.png..10.png
│   │   └── ...
│   └── ...
└── database/
    └── init.sql           # создание таблицы и наполнение 10 фактами
```

## Предварительные требования
- Java 17+
- Maven 3.9+
- Node.js 18+ (рекомендуется LTS)
- PostgreSQL 14+ (или совместимая)

## Настройка базы данных (с нуля)
1) Создайте БД, например `aisha`.
2) Выполните единый скрипт инициализации `database/full_init.sql` (создаёт таблицы, индексы, сиды и view):

```bash
psql -U postgres -h localhost -d aisha -f database/full_init.sql
```

## Запуск backend
Перейдите в каталог `backend/` и запустите приложение:
```bash
cd backend
./mvnw spring-boot:run   # Linux/Mac
mvnw.cmd spring-boot:run # Windows
```
По умолчанию сервер стартует на `http://localhost:8080`.

## Запуск frontend
Перейдите в каталог `frontend/` и поднимите dev-сервер Vite:
```bash
cd frontend
npm install
npm run dev
```
Dev-сервер будет доступен на `http://localhost:5173`. Прокси на backend уже настроен в `frontend/vite.config.ts` для пути `/api`.

## Переменные окружения (Backend)
В `backend/src/main/resources/application.properties` заданы значения по умолчанию и могут быть переопределены через переменные окружения:
- `DB_URL` (по умолчанию: `jdbc:postgresql://localhost:5432/aisha`)
- `DB_USER` (по умолчанию: `postgres`)
- `DB_PASSWORD` (по умолчанию: `postgres`)

Пример запуска с переопределениями:
```bash
DB_URL=jdbc:postgresql://localhost:5432/aisha DB_USER=postgres DB_PASSWORD=secret \
  ./mvnw spring-boot:run
```

## API
- `GET /api/categories` — список категорий
- `GET /api/facts?category=&page=&size=` — список фактов (с пагинацией и фильтром по категории)
- `GET /api/facts/random?category=` — случайный факт (опционально по категории)
- `POST /api/facts` — добавить факт `{ fact, category }`
- `PUT /api/facts/{id}` — обновить факт `{ fact, category }`
- `DELETE /api/facts/{id}` — удалить факт

## Статические изображения (Frontend)
- Главная фотография: `frontend/src/img/main.png`
- Факты 1..10: `frontend/src/img/1.png` … `frontend/src/img/10.png`

Эти изображения используются в геро-секции и карточках фактов.

## Сборка продакшн-версии
Frontend:
```bash
cd frontend
npm run build
```
Будет создана сборка в `frontend/dist/`.

Backend (fat jar):
```bash
cd backend
./mvnw clean package
```
Готовый jar будет в `backend/target/`.

## Частые проблемы
- Нет соединения с БД: проверьте `DB_URL`, доступность сервера PostgreSQL и применён ли `database/init.sql`.
- CORS в dev-режиме: решается настроенным Vite-прокси (`/api` → `http://localhost:8080`).
- Изображения не отображаются: проверьте наличие файлов в `frontend/src/img/` и пути в компоненте `App.tsx`.

---
Название проекта: Personal Website

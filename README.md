# 📚 Course Service — RESTful API

A simple and educational API built with **Node.js + TypeScript** using **Fastify**, **Drizzle ORM** (PostgreSQL), and **Zod**.  
It provides a basic course management system, including creation, listing, and lookup by ID.

> 📌 Future iterations will include **user management** and **course enrollments** (many-to-many).

---

## 🚀 What This Project Does

This API allows you to:

- Register new courses (`POST /courses`)
- List all courses (`GET /courses`)
- Get course details by ID (`GET /courses/:id`)

Built with clean structure and modern tools for learning and portfolio purposes.

---

## ⚙️ Requirements

- Node.js **v22+**
- Docker + Docker Compose
- `npm` (or compatible package manager)

---

## 🧰 Tech Stack

- **Fastify 5** – Web server
- **TypeScript** – Static typing
- **Drizzle ORM** – PostgreSQL ORM
- **Zod** – Schema validation
- **Swagger/OpenAPI + Scalar** – Auto API docs at `/docs`
- **Docker Compose** – Local dev environment

---

## 🔧 Setup Instructions

### 1. Clone the project

```bash
git clone https://github.com/Jogogallodeveloper/course-service.git
cd course-service
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start PostgreSQL via Docker

```bash
docker compose up -d
```

### 4. Create a `.env` file at the project root:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/desafio
NODE_ENV=development
```

> Optional: create `.env.test` for test environments.

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. (Optional) Open Drizzle Studio to inspect schema:

```bash
npm run db:studio
```

---

## ▶️ Running the Server

```bash
npm run dev
```

- API URL: `http://localhost:3333`
- API Docs: `http://localhost:3333/docs` (dev mode only)

---

## 📬 API Endpoints

### `POST /courses`
Create a new course

```json
{ "title": "Docker Fundamentals" }
```

Response:
```json
{ "courseId": "uuid" }
```

---

### `GET /courses`
List all courses

```json
{
  "courses": [
    { "id": "uuid", "title": "..." },
    ...
  ]
}
```

---

### `GET /courses/:id`
Retrieve a course by ID

Success:
```json
{
  "course": {
    "id": "uuid",
    "title": "...",
    "description": "..." | null
  }
}
```

Error:
- `404 Not Found`: empty body

---

## 🗃️ Database Models

Defined in `src/database/schema.ts`

### `courses`
- `id`: UUID, PK, auto-generated
- `title`: text, required, unique
- `description`: text, optional

### `users` (for study/testing)
- `id`: UUID, PK
- `name`: text, required
- `email`: text, required, unique

---

## 🧪 REST Client File

You can test the endpoints using the `requisicoes.http` file  
(compatible with REST Client VSCode extension).

---

## 📈 API Flow (Mermaid Diagram)

```mermaid
graph TD
    A[POST /courses] --> B[Validate body]
    B --> C[Insert into DB]
    C --> D[Return courseId]

    E[GET /courses] --> F[Fetch all courses]
    F --> G[Return JSON]

    H[GET /courses/:id] --> I[Find course by ID]
    I --> J{Found?}
    J -->|Yes| K[Return course]
    J -->|No| L[Return 404]
```
## 📜 Available Scripts

| Command               | Description                              |
|-----------------------|------------------------------------------|
| `npm run dev`         | Start dev server with auto-reload        |
| `npm run db:migrate`  | Run DB migrations with Drizzle           |
| `npm run db:generate` | Generate Drizzle artifacts               |
| `npm run db:studio`   | Open Drizzle Studio GUI (optional)       |

---

## 🧠 Tips & Troubleshooting

- ❌ **Connection refused to Postgres?**  
  Make sure `docker compose up -d` is running and port 5432 is free.

- ❌ **Missing `DATABASE_URL`?**  
  Ensure your `.env` file is configured correctly.

- ❌ **Docs not showing at `/docs`?**  
  Set `NODE_ENV=development` and restart the server.

---

## 📄 License

This project is licensed under the [ISC License](./LICENSE).
git checkout -b docs/full-readme-update
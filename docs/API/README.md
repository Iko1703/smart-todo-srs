# TimeTracker API Documentation

## Mock Server URL
https://94dcaa06-97a4-45c8-9874-775c0f1873b8.mock.pstmn.io

## Environments
- base_url: https://94dcaa06-97a4-45c8-9874-775c0f1873b8.mock.pstmn.io

---

## Authentication

### POST /auth/login
Авторизация пользователя

**Request:**
```
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "username": "alex",
  "password": "password123"
}
```

**Response Examples:**

Success (200 OK):
```
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  "user_id": 1,
  "username": "alex",
  "message": "Login successful"
}
```

Error (401 Unauthorized):
```
{
  "error": "Invalid credentials",
  "code": "AUTH_ERROR"
}
```

**Tests:**
```
pm.test("Status 200", () => {
  pm.response.to.have.status(200);
});

pm.test("Save token", () => {
  const json = pm.response.json();
  pm.environment.set("auth_token", json.token);
  pm.environment.set("user_id", json.user_id);
});
```

---

## Users

### GET /users?active=true
Получить всех пользователей

**Request:**
```
GET {{base_url}}/users?active=true
```

**Response Examples:**

Success (200 OK):
```
{
  "users": [
    {
      "user_id": 1,
      "username": "alex",
      "email": "alex@example.com",
      "created_at": "2024-01-15T10:00:00Z",
      "last_login": "2024-01-16T09:30:00Z"
    },
    {
      "user_id": 2,
      "username": "maria",
      "email": "maria@example.com",
      "created_at": "2024-01-15T11:00:00Z",
      "last_login": "2024-01-16T10:15:00Z"
    }
  ]
}
```

Empty list (200 OK):
```
{
  "users": []
}
```

**Tests:**
```
pm.test("Status code is 200", () => {
  pm.response.to.have.status(200);
});

pm.test("Response has users array", () => {
  const jsonData = pm.response.json();
  pm.expect(jsonData.users).to.be.an('array');
});
```

---

## Projects

### GET /projects?deleted=false
Получить все проекты

**Request:**
```
GET {{base_url}}/projects?deleted=false
```

**Response Examples:**
```
{
  "projects": [
    {
      "project_id": 1,
      "name": "Работа",
      "description": "Рабочие задачи и проекты",
      "color": "#e74c3c",
      "user_id": 1,
      "is_default": true,
      "created_at": "2024-01-15T10:00:00Z"
    },
    {
      "project_id": 2,
      "name": "Учёба",
      "description": "Обучение и саморазвитие",
      "color": "#3498db",
      "user_id": 1,
      "is_default": true,
      "created_at": "2024-01-15T10:05:00Z"
    }
  ]
}
```

**Tests:**
```
pm.test("Status code is 200", () => {
  pm.response.to.have.status(200);
});

pm.test("Response has projects array", () => {
  const jsonData = pm.response.json();
  pm.expect(jsonData.projects).to.be.an('array');
});
```

---

### POST /projects
Создать проект

**Request:**
```
POST {{base_url}}/projects
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "name": "Новый проект",
  "description": "Описание проекта",
  "color": "#27ae60"
}
```

**Response Examples:**

Success (201 Created):
```
{
  "project_id": 3,
  "name": "Новый проект",
  "message": "Project created successfully",
  "created_at": "2024-01-16T10:00:00Z"
}
```

Error (400 Bad Request):
```
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "name": "Name is required"
  }
}
```

Error (409 Conflict):
```
{
  "error": "Project name already exists",
  "code": "DUPLICATE_ERROR"
}
```

**Tests:**
```
pm.test("Status code is 201", () => {
  pm.response.to.have.status(201);
});

pm.test("Project creation response structure", () => {
  const jsonData = pm.response.json();
  pm.expect(jsonData.project_id).to.be.a('number');
  pm.expect(jsonData.message).to.include('created');
});
```

---

## Time Sessions

### GET /time_sessions
Получить все сессии времени

**Request:**
```
GET {{base_url}}/time_sessions
```

**Response Examples:**
```
{
  "sessions": [
    {
      "session_id": 1,
      "title": "Разработка API",
      "description": "Создание REST API для проекта",
      "start_time": "2024-01-16T09:00:00Z",
      "end_time": "2024-01-16T12:30:00Z",
      "duration_seconds": 12600,
      "user_id": 1,
      "project_id": 1,
      "created_at": "2024-01-16T09:00:00Z"
    }
  ],
  "total_time": 12600,
  "count": 1
}
```

**Tests:**
```
pm.test("Status code is 200", () => {
  pm.response.to.have.status(200);
});

pm.test("Response has sessions array", () => {
  const jsonData = pm.response.json();
  pm.expect(jsonData.sessions).to.be.an('array');
});
```

---

### POST /time_sessions
Создать сессию времени

**Request:**
```
POST {{base_url}}/time_sessions
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "title": "Новая задача",
  "description": "Описание задачи",
  "start_time": "2024-01-16T14:00:00Z",
  "end_time": "2024-01-16T15:30:00Z",
  "project_id": 1
}
```

**Response Examples:**

Success (201 Created):
```
{
  "session_id": 2,
  "title": "Новая задача",
  "message": "Time session created successfully",
  "created_at": "2024-01-16T14:00:00Z"
}
```

Error (400 Bad Request):
```
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "title": "Title is required",
    "start_time": "Start time is required"
  }
}
```

**Tests:**
```
pm.test("Status code is 201", () => {
  pm.response.to.have.status(201);
});

pm.test("Save session ID", () => {
  const jsonData = pm.response.json();
  pm.environment.set("session_id", jsonData.session_id);
});
```

---

### PATCH /time_sessions/:id
Обновить сессию времени

**Request:**
```
PATCH {{base_url}}/time_sessions/1
Content-Type: application/json
Authorization: Bearer {{auth_token}}

{
  "end_time": "2024-01-16T15:30:00Z",
  "duration_seconds": 5400
}
```

**Response Examples:**

Success (200 OK):
```
{
  "session_id": 1,
  "message": "Time session updated successfully"
}
```

Error (404 Not Found):
```
{
  "error": "Time session not found",
  "code": "NOT_FOUND"
}
```

**Tests:**
```
pm.test("Status code is 200", () => {
  pm.response.to.have.status(200);
});
```

---

## Workflow Testing

1. Авторизация
```
POST /auth/login
→ Сохраняем auth_token и user_id
```

2. Создание проекта
```
POST /projects
→ Сохраняем project_id
```

3. Создание сессии времени
```
POST /time_sessions
→ Используем сохраненный project_id
→ Сохраняем session_id
```

4. Проверка данных
```
GET /projects
GET /time_sessions
→ Проверяем, что данные созданы
```

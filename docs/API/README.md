# TimeTracker API

## Mock Server URL
`[https://ваш-id.mock.pstmn.io](https://94dcaa06-97a4-45c8-9874-775c0f1873b8.mock.pstmn.io)`

## Endpoints

### Authentication
- `POST /auth/login` - Вход в систему

### Users  
- `GET /users` - Получить всех пользователей

### Projects
- `GET /projects` - Получить все проекты
- `POST /projects` - Создать проект (требует авторизации)

### Time Sessions
- `GET /time_sessions` - Получить все сессии времени

## Примеры

### Login
```json
POST /auth/login
{
  "username": "alex",
  "password": "password123"
}

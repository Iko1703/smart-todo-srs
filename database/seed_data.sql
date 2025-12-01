INSERT INTO Users (username, email, password_hash) VALUES
('alex_developer', 'alex@example.com', 'hash123'),
('maria_student', 'maria@example.com', 'hash456'),
('ivan_manager', 'ivan@example.com', 'hash789');

INSERT INTO Projects (name, description, color, user_id, is_default) VALUES
('Работа', 'Рабочие задачи и проекты', '#e74c3c', 1, 1),
('Учёба', 'Обучение и саморазвитие', '#3498db', 1, 1),
('Личное', 'Личные дела и отдых', '#27ae60', 1, 1),
('Дипломная работа', 'Написание диплома', '#9b59b6', 2, 0),
('Фитнес', 'Тренировки и спорт', '#1abc9c', 3, 0);

INSERT INTO Time_Sessions (title, description, start_time, end_time, user_id, project_id) VALUES
('Разработка API', 'Создание REST API для проекта', '2024-01-15 09:00:00', '2024-01-15 12:30:00', 1, 1),
('Code review', 'Проверка кода коллег', '2024-01-15 14:00:00', '2024-01-15 15:30:00', 1, 1),
('Изучение React', 'Прохождение онлайн-курса', '2024-01-15 16:00:00', '2024-01-15 18:00:00', 1, 2),
('Совещание', 'Планерка отдела', '2024-01-16 10:00:00', '2024-01-16 11:00:00', 1, 1),
('Написание главы 3', 'Глава: Методология', '2024-01-15 13:00:00', '2024-01-15 16:00:00', 2, 4),
('Тренировка в зале', 'Силовая тренировка', '2024-01-15 19:00:00', '2024-01-15 20:30:00', 3, 5);

INSERT INTO Tags (name, color, user_id) VALUES
('срочно', '#e74c3c', 1),
('важно', '#f39c12', 1),
('блокер', '#c0392b', 1),
('исследование', '#3498db', 2),
('практика', '#27ae60', 2);

INSERT INTO Session_Tags (session_id, tag_id) VALUES
(1, 1),
(1, 2), 
(3, 4), 
(5, 1),
(5, 4); 

INSERT INTO User_Settings (user_id, theme, language, notifications_enabled) VALUES
(1, 'dark', 'ru', 1),
(2, 'light', 'en', 1),
(3, 'auto', 'ru', 0);

INSERT INTO Reports (user_id, report_type, period_start, period_end, title, data_json) VALUES
(1, 'daily', '2024-01-15', '2024-01-15', 'Отчет за 15 января', 
 '{"total_hours": 6.5, "work": 4.5, "study": 2.0}');

UPDATE Time_Sessions 
SET duration_seconds = strftime('%s', end_time) - strftime('%s', start_time)
WHERE end_time IS NOT NULL;

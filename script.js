// Глобальные переменные
let timerInterval;
let seconds = 0;
let isTimerRunning = false;
let currentSession = null;
let timeRecords = JSON.parse(localStorage.getItem('timeRecords')) || [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateTimeRecordsList();
    setDateTimeInputs();
});

// Установка текущего времени в поля ввода
function setDateTimeInputs() {
    const now = new Date();
    const startTime = document.getElementById('startTime');
    const endTime = document.getElementById('endTime');
    
    // Устанавливаем начальное время (1 час назад)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    startTime.value = formatDateTimeForInput(oneHourAgo);
    endTime.value = formatDateTimeForInput(now);
}

// Форматирование даты для input[type=datetime-local]
function formatDateTimeForInput(date) {
    return date.toISOString().slice(0, 16);
}

// Запуск таймера
function startTimer() {
    const taskName = document.getElementById('taskName').value;
    const project = document.getElementById('projectSelect').value;
    
    if (!taskName.trim()) {
        alert('Введите название задачи');
        return;
    }
    
    if (!project) {
        alert('Выберите проект');
        return;
    }
    
    isTimerRunning = true;
    currentSession = {
        taskName: taskName,
        project: project,
        startTime: new Date()
    };
    
    document.getElementById('startTimer').disabled = true;
    document.getElementById('stopTimer').disabled = false;
    document.getElementById('taskName').disabled = true;
    document.getElementById('projectSelect').disabled = true;
    
    timerInterval = setInterval(updateTimer, 1000);
}

// Остановка таймера
function stopTimer() {
    if (!isTimerRunning) return;
    
    isTimerRunning = false;
    clearInterval(timerInterval);
    
    const endTime = new Date();
    const duration = seconds;
    
    // Сохраняем запись
    const record = {
        ...currentSession,
        endTime: endTime,
        duration: duration
    };
    
    timeRecords.push(record);
    saveToLocalStorage();
    updateTimeRecordsList();
    
    // Сброс таймера и полей ввода
    resetTimer();
    document.getElementById('startTimer').disabled = false;
    document.getElementById('stopTimer').disabled = true;
    document.getElementById('taskName').disabled = false;
    document.getElementById('projectSelect').disabled = false;
    document.getElementById('taskName').value = '';
    
    alert(`Задача "${currentSession.taskName}" сохранена. Время: ${formatTime(duration)}`);
    currentSession = null;
}

// Обновление таймера
function updateTimer() {
    seconds++;
    document.getElementById('timer').textContent = formatTime(seconds);
}

// Сброс таймера
function resetTimer() {
    seconds = 0;
    document.getElementById('timer').textContent = '00:00:00';
}

// Форматирование времени (секунды в ЧЧ:ММ:СС)
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
    ].join(':');
}

// Добавление записи вручную
function addManualEntry() {
    const taskName = document.getElementById('manualTaskName').value;
    const project = document.getElementById('manualProjectSelect').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    if (!taskName.trim() || !project || !startTime || !endTime) {
        alert('Заполните все поля');
        return;
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (end <= start) {
        alert('Время окончания должно быть позже времени начала');
        return;
    }
    
    const duration = Math.floor((end - start) / 1000);
    
    const record = {
        taskName: taskName,
        project: project,
        startTime: start,
        endTime: end,
        duration: duration
    };
    
    timeRecords.push(record);
    saveToLocalStorage();
    updateTimeRecordsList();
    
    // Очистка формы
    document.getElementById('manualTaskName').value = '';
    alert('Запись успешно добавлена');
}

// Обновление списка записей
function updateTimeRecordsList() {
    const recordsList = document.getElementById('timeRecordsList');
    recordsList.innerHTML = '';
    
    if (timeRecords.length === 0) {
        recordsList.innerHTML = '<li class="no-records">Записей пока нет</li>';
        return;
    }
    
    // Сортировка по дате (новые сверху)
    const sortedRecords = [...timeRecords].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    
    sortedRecords.forEach((record, index) => {
        const li = document.createElement('li');
        li.className = 'record-item';
        
        const startTime = new Date(record.startTime).toLocaleString();
        const duration = formatTime(record.duration);
        
        li.innerHTML = `
            <div class="record-info">
                <strong>${record.taskName}</strong>
                <span class="record-project project-${record.project}">${getProjectName(record.project)}</span>
                <div>${startTime} - ${duration}</div>
            </div>
            <div class="record-actions">
                <button onclick="editRecord(${index})">✏️</button>
                <button onclick="deleteRecord(${index})">🗑️</button>
            </div>
        `;
        
        recordsList.appendChild(li);
    });
}

// Получение названия проекта
function getProjectName(projectKey) {
    const projects = {
        'work': 'Работа',
        'study': 'Учёба',
        'personal': 'Личное'
    };
    return projects[projectKey] || projectKey;
}

// Применение фильтров
function applyFilters() {
    // Базовая реализация - в будущем можно расширить
    updateTimeRecordsList();
}

// Удаление записи
function deleteRecord(index) {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
        timeRecords.splice(index, 1);
        saveToLocalStorage();
        updateTimeRecordsList();
    }
}

// Редактирование записи (заглушка)
function editRecord(index) {
    alert('Функция редактирования будет реализована в следующих версиях');
}

// Сохранение в localStorage
function saveToLocalStorage() {
    localStorage.setItem('timeRecords', JSON.stringify(timeRecords));
}

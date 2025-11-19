// Глобальные переменные
let timerInterval;
let seconds = 0;
let isTimerRunning = false;
let currentSession = null;
let editingIndex = null;
let editModal = null;
let timeRecords = JSON.parse(localStorage.getItem('timeRecords')) || [];
let currentFilters = {
    search: '',
    project: '',
    dateFrom: '',
    dateTo: ''
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateTimeRecordsList();
    setDateTimeInputs();
    initializeFilterElements();
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

// Инициализация элементов фильтрации
function initializeFilterElements() {
    const searchInput = document.getElementById('searchInput');
    const filterProject = document.getElementById('filterProject');
    const dateFrom = document.getElementById('dateFrom');
    const dateTo = document.getElementById('dateTo');
    
    // Установка значений по умолчанию для дат (последние 7 дней)
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    dateFrom.value = formatDateForInput(weekAgo);
    dateTo.value = formatDateForInput(today);
    
    currentFilters.dateFrom = dateFrom.value;
    currentFilters.dateTo = dateTo.value;
    
    // Обработчики событий для реального поиска
    searchInput.addEventListener('input', function(e) {
        currentFilters.search = e.target.value.toLowerCase();
        applyFilters();
    });
    
    filterProject.addEventListener('change', function(e) {
        currentFilters.project = e.target.value;
        applyFilters();
    });
    
    dateFrom.addEventListener('change', function(e) {
        currentFilters.dateFrom = e.target.value;
        applyFilters();
    });
    
    dateTo.addEventListener('change', function(e) {
        currentFilters.dateTo = e.target.value;
        applyFilters();
    });
}

// Форматирование даты для input[type=date]
function formatDateForInput(date) {
    return date.toISOString().split('T')[0];
}

// Применение фильтров
function applyFilters() {
    const filteredRecords = timeRecords.filter(record => {
        // Фильтр по поисковому запросу
        if (currentFilters.search) {
            const taskName = record.taskName.toLowerCase();
            if (!taskName.includes(currentFilters.search)) {
                return false;
            }
        }
        
        // Фильтр по проекту
        if (currentFilters.project && record.project !== currentFilters.project) {
            return false;
        }
        
        // Фильтр по дате
        const recordDate = new Date(record.startTime).toISOString().split('T')[0];
        
        if (currentFilters.dateFrom && recordDate < currentFilters.dateFrom) {
            return false;
        }
        
        if (currentFilters.dateTo && recordDate > currentFilters.dateTo) {
            return false;
        }
        
        return true;
    });
    
    updateTimeRecordsList(filteredRecords);
}

// Обновление списка записей с учетом фильтров
function updateTimeRecordsList(recordsToShow = null) {
    const recordsList = document.getElementById('timeRecordsList');
    recordsList.innerHTML = '';
    
    const records = recordsToShow || timeRecords;
    
    if (records.length === 0) {
        recordsList.innerHTML = '<li class="no-records">Записей не найдено</li>';
        return;
    }
    
    // Сортировка по дате (новые сверху)
    const sortedRecords = [...records].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    
    // Группировка по датам
    const groupedRecords = groupRecordsByDate(sortedRecords);
    
    Object.keys(groupedRecords).forEach(date => {
        // Заголовок даты
        const dateHeader = document.createElement('li');
        dateHeader.className = 'date-header';
        dateHeader.innerHTML = `<strong>${formatDisplayDate(date)}</strong>`;
        recordsList.appendChild(dateHeader);
        
        // Записи для этой даты
        groupedRecords[date].forEach((record, index) => {
            const li = document.createElement('li');
            li.className = 'record-item';
            
            const startTime = new Date(record.startTime).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            });
            const duration = formatTime(record.duration);
            
            li.innerHTML = `
                <div class="record-info">
                    <div class="record-main">
                        <strong>${record.taskName}</strong>
                        <span class="record-project project-${record.project}">${getProjectName(record.project)}</span>
                    </div>
                    <div class="record-details">
                        <span class="record-time">${startTime}</span>
                        <span class="record-duration">${duration}</span>
                    </div>
                </div>
                <div class="record-actions">
                    <button onclick="editRecord(${timeRecords.indexOf(record)})" title="Редактировать">✏️</button>
                    <button onclick="deleteRecord(${timeRecords.indexOf(record)})" title="Удалить">🗑️</button>
                </div>
            `;
            
            recordsList.appendChild(li);
        });
    });
}

// Группировка записей по датам
function groupRecordsByDate(records) {
    return records.reduce((groups, record) => {
        const date = new Date(record.startTime).toISOString().split('T')[0];
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(record);
        return groups;
    }, {});
}

// Форматирование даты для отображения
function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (dateString === today) {
        return 'Сегодня';
    } else if (dateString === yesterday) {
        return 'Вчера';
    } else {
        return date.toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Сброс фильтров
function resetFilters() {
    currentFilters = {
        search: '',
        project: '',
        dateFrom: document.getElementById('dateFrom').value,
        dateTo: document.getElementById('dateTo').value
    };
    
    document.getElementById('searchInput').value = '';
    document.getElementById('filterProject').value = '';
    
    applyFilters();
}

// Получение статистики по отфильтрованным записям
function getFilteredStats() {
    const filteredRecords = getFilteredRecords();
    const totalTime = filteredRecords.reduce((sum, record) => sum + record.duration, 0);
    const projectStats = {};
    
    filteredRecords.forEach(record => {
        if (!projectStats[record.project]) {
            projectStats[record.project] = {
                time: 0,
                count: 0
            };
        }
        projectStats[record.project].time += record.duration;
        projectStats[record.project].count++;
    });
    
    return {
        totalRecords: filteredRecords.length,
        totalTime: totalTime,
        projectStats: projectStats
    };
}

// Получение отфильтрованных записей
function getFilteredRecords() {
    return timeRecords.filter(record => {
        if (currentFilters.search) {
            const taskName = record.taskName.toLowerCase();
            if (!taskName.includes(currentFilters.search)) {
                return false;
            }
        }
        
        if (currentFilters.project && record.project !== currentFilters.project) {
            return false;
        }
        
        const recordDate = new Date(record.startTime).toISOString().split('T')[0];
        
        if (currentFilters.dateFrom && recordDate < currentFilters.dateFrom) {
            return false;
        }
        
        if (currentFilters.dateTo && recordDate > currentFilters.dateTo) {
            return false;
        }
        
        return true;
    });
}

function editRecord(index) {
    editingIndex = index;
    const record = timeRecords[index];
    
    createEditModal(record);
    showEditModal(record);
}

// Создание модального окна редактирования
function createEditModal(record) {
    if (editModal) {
        editModal.remove();
    }
    
    editModal = document.createElement('div');
    editModal.className = 'modal-overlay';
    editModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Редактирование записи</h3>
                <button class="close-modal" onclick="closeEditModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="editTaskName">Название задачи:</label>
                    <input type="text" id="editTaskName" class="form-input">
                </div>
                
                <div class="form-group">
                    <label for="editProject">Проект:</label>
                    <select id="editProject" class="form-select">
                        <option value="work">Работа</option>
                        <option value="study">Учёба</option>
                        <option value="personal">Личное</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="editStartTime">Начало:</label>
                    <input type="datetime-local" id="editStartTime" class="form-input">
                </div>
                
                <div class="form-group">
                    <label for="editEndTime">Окончание:</label>
                    <input type="datetime-local" id="editEndTime" class="form-input">
                </div>
                
                <div class="form-group">
                    <label>Длительность:</label>
                    <div id="editDuration" class="duration-display">00:00:00</div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="closeEditModal()">Отмена</button>
                    <button type="button" class="btn-danger" onclick="deleteRecord(editingIndex, true)">Удалить</button>
                    <button type="button" class="btn-primary" onclick="saveEditedRecord()">Сохранить</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(editModal);
    
    // Обработчики для автоматического пересчета длительности
    document.getElementById('editStartTime').addEventListener('change', updateEditDuration);
    document.getElementById('editEndTime').addEventListener('change', updateEditDuration);
}

// Показ модального окна с данными записи
function showEditModal(record) {
    const startTime = new Date(record.startTime);
    const endTime = new Date(record.endTime);
    
    document.getElementById('editTaskName').value = record.taskName;
    document.getElementById('editProject').value = record.project;
    document.getElementById('editStartTime').value = formatDateTimeForInput(startTime);
    document.getElementById('editEndTime').value = formatDateTimeForInput(endTime);
    
    updateEditDuration();
    editModal.style.display = 'flex';
}

// Закрытие модального окна
function closeEditModal() {
    if (editModal) {
        editModal.style.display = 'none';
        editingIndex = null;
    }
}

// Обновление отображения длительности при редактировании
function updateEditDuration() {
    const startTime = document.getElementById('editStartTime').value;
    const endTime = document.getElementById('editEndTime').value;
    
    if (startTime && endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        
        if (end > start) {
            const duration = Math.floor((end - start) / 1000);
            document.getElementById('editDuration').textContent = formatTime(duration);
        } else {
            document.getElementById('editDuration').textContent = '00:00:00';
        }
    }
}

// Сохранение отредактированной записи
function saveEditedRecord() {
    const taskName = document.getElementById('editTaskName').value.trim();
    const project = document.getElementById('editProject').value;
    const startTime = document.getElementById('editStartTime').value;
    const endTime = document.getElementById('editEndTime').value;
    
    // Валидация
    if (!taskName) {
        showAlert('Введите название задачи', 'error');
        return;
    }
    
    if (!project) {
        showAlert('Выберите проект', 'error');
        return;
    }
    
    if (!startTime || !endTime) {
        showAlert('Заполните время начала и окончания', 'error');
        return;
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (end <= start) {
        showAlert('Время окончания должно быть позже времени начала', 'error');
        return;
    }
    
    const duration = Math.floor((end - start) / 1000);
    
    // Обновление записи
    timeRecords[editingIndex] = {
        taskName: taskName,
        project: project,
        startTime: start,
        endTime: end,
        duration: duration
    };
    
    saveToLocalStorage();
    updateTimeRecordsList();
    closeEditModal();
    
    showAlert('Запись успешно обновлена', 'success');
}

// Улучшенная функция удаления с поддержкой вызова из модального окна
function deleteRecord(index, fromModal = false) {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
        timeRecords.splice(index, 1);
        saveToLocalStorage();
        updateTimeRecordsList();
        
        if (fromModal) {
            closeEditModal();
        }
        
        showAlert('Запись удалена', 'success');
    }
}

// Функция для показа уведомлений
function showAlert(message, type = 'info') {
    // Удаляем предыдущие уведомления
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    // Показываем уведомление
    setTimeout(() => {
        alert.classList.add('show');
    }, 100);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 300);
    }, 3000);
}

// Быстрое редактирование длительности (удобная функция)
function quickEditDuration(index, changeMinutes) {
    const record = timeRecords[index];
    const newEndTime = new Date(record.endTime.getTime() + changeMinutes * 60 * 1000);
    
    if (newEndTime <= record.startTime) {
        showAlert('Время окончания не может быть раньше начала', 'error');
        return;
    }
    
    record.endTime = newEndTime;
    record.duration = Math.floor((newEndTime - record.startTime) / 1000);
    
    saveToLocalStorage();
    updateTimeRecordsList();
    showAlert(`Время изменено на ${changeMinutes > 0 ? '+' : ''}${changeMinutes} мин`, 'success');
}

// Сохранение в localStorage
function saveToLocalStorage() {
    localStorage.setItem('timeRecords', JSON.stringify(timeRecords));
}

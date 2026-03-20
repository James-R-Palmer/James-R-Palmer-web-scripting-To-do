// --- Setup & DOM Elements ---
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tagInput = document.getElementById('tag-input');
const errorMessage = document.getElementById('error-message');
const taskList = document.getElementById('task-list');
const statusFilterSelect = document.getElementById('status-filter');
const tagFilterSelect = document.getElementById('tag-filter'); // Assumes this is in HTML
const activeTaskCounter = document.getElementById('active-task-counter');


let tasks = [];

// ==========================================
// Core Functions
// ==========================================

// Load Tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
        try {
            tasks = JSON.parse(savedTasks);
        } catch (e) {
            console.error("Error parsing saved tasks", e);
            tasks = [];
        }
    }
}

// Save Tasks to localStorage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Update the Active Task Counter
function updateCounter() {
    const activeCount = tasks.filter(task => !task.completed).length;
    activeTaskCounter.textContent = `${activeCount} active task${activeCount !== 1 ? 's' : ''}`;
}

// Update the Tag Filter Dropdown Options
function updateTagFilterOptions() {
    const tags = [...new Set(tasks.map(task => task.tag).filter(tag => tag !== ""))];
    const currentSelection = tagFilterSelect.value;
    
    // Reset options, keep 'All Tags'
    tagFilterSelect.innerHTML = '<option value="all">All Tags</option>';
    
    tags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagFilterSelect.appendChild(option);
    });

    // Restore selection if it still exists
    if (tags.includes(currentSelection) || currentSelection === 'all') {
        tagFilterSelect.value = currentSelection;
    }
}


function addTask(text, tag) {
    const newTask = {
        id: Date.now(),
        text: text,
        tag: tag || 'general',
        completed: false
    };
    tasks.push(newTask);
    saveTasks();
    renderTasks();
}

// Toggle Task Completion
function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

// Delete Task
function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}

// Render the Task List with Filters
function renderTasks() {
    taskList.innerHTML = '';
    
    const statusFilter = statusFilterSelect.value;
    const tagFilter = tagFilterSelect.value;

    const filteredTasks = tasks.filter(task => {
        const matchesStatus = statusFilter === "all" || 
                             (statusFilter === "active" && !task.completed) || 
                             (statusFilter === "completed" && task.completed);
        const matchesTag = tagFilter === "all" || task.tag === tagFilter;
        return matchesStatus && matchesTag;
    });

    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''}`;
        li.innerHTML = `
            <input type="checkbox" class="complete-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${task.text} [${task.tag}]</span>
            <button class="delete-btn">Delete</button>
        `;

        // Event Listeners for inside the list
        li.querySelector('.complete-checkbox').addEventListener('change', () => toggleTask(task.id));
        li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));

        taskList.appendChild(li);
    });

    updateCounter();
    updateTagFilterOptions();
}

// --- Event Listeners ---
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = taskInput.value.trim();
    const tag = tagInput.value.trim();

    if (!text) {
        if (errorMessage) {
            errorMessage.textContent = "Task name is required.";
            errorMessage.style.display = 'block';
        }
        return;
    }
    
    if (errorMessage) {
        errorMessage.textContent = "";
        errorMessage.style.display = 'none';
    }

    addTask(text, tag);
    taskForm.reset();
});

statusFilterSelect.addEventListener('change', renderTasks);
tagFilterSelect.addEventListener('change', renderTasks);

// --- Initialization ---
loadTasks();
renderTasks();

/**
 * TaskFlow Application Logic
 * Pure JavaScript, Vanilla CSS, Responsive & Accessible
 */

(() => {

// Initial Sample Seed Data
const DEFAULT_TASKS = [
  {
    id: 'task-1',
    title: 'Design high-converting Landing Page UI',
    description: 'Create responsive Figma wireframes with hero illustration and dark mode palette.',
    priority: 'high',
    category: 'Design',
    status: 'in-progress',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-2',
    title: 'Implement Task Creation and Filter Logic',
    description: 'Ensure smooth modal popup, validation, and real-time search filtering.',
    priority: 'urgent',
    category: 'Development',
    status: 'todo',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-3',
    title: 'Draft Product Launch Announcement',
    description: 'Write engaging copy for newsletter and social media announcement threads.',
    priority: 'medium',
    category: 'Marketing',
    status: 'todo',
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-4',
    title: 'Setup repository and project dependencies',
    description: 'Initial commit, folder architecture, and documentation.',
    priority: 'low',
    category: 'Development',
    status: 'completed',
    dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  }
];

// App State
let tasks = [];
let currentView = 'board'; // 'board' or 'list'
let searchQuery = '';
let selectedPriority = 'all';
let selectedCategory = 'all';

// DOM Element References
const elements = {
  boardView: document.getElementById('boardView'),
  listView: document.getElementById('listView'),
  boardViewBtn: document.getElementById('boardViewBtn'),
  listViewBtn: document.getElementById('listViewBtn'),
  emptyState: document.getElementById('emptyState'),
  emptyTitle: document.getElementById('emptyTitle'),
  emptySubtitle: document.getElementById('emptySubtitle'),
  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),
  priorityFilter: document.getElementById('priorityFilter'),
  categoryFilter: document.getElementById('categoryFilter'),
  themeToggleBtn: document.getElementById('themeToggleBtn'),
  openModalBtn: document.getElementById('openAddTaskModalBtn'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  cancelModalBtn: document.getElementById('cancelModalBtn'),
  taskModal: document.getElementById('taskModal'),
  taskForm: document.getElementById('taskForm'),
  modalTitle: document.getElementById('modalTitle'),
  modalSubtitle: document.getElementById('modalSubtitle'),
  modalBadgeDot: document.getElementById('modalBadgeDot'),
  modalMetaInfo: document.getElementById('modalMetaInfo'),
  metaCreatedAt: document.getElementById('metaCreatedAt'),
  metaUpdatedAt: document.getElementById('metaUpdatedAt'),
  metaUpdatedAtWrap: document.getElementById('metaUpdatedAtWrap'),
  submitBtnText: document.getElementById('submitBtnText'),
  editTaskId: document.getElementById('editTaskId'),
  taskTitleInput: document.getElementById('taskTitleInput'),
  taskDescriptionInput: document.getElementById('taskDescriptionInput'),
  taskPrioritySelect: document.getElementById('taskPrioritySelect'),
  taskCategorySelect: document.getElementById('taskCategorySelect'),
  taskStatusSelect: document.getElementById('taskStatusSelect'),
  taskDueDateInput: document.getElementById('taskDueDateInput'),
  statProgressPercent: document.getElementById('statProgressPercent'),
  statPendingCount: document.getElementById('statPendingCount'),
  progressBarFill: document.getElementById('progressBarFill'),
  countTodo: document.getElementById('countTodo'),
  countInProgress: document.getElementById('countInProgress'),
  countCompleted: document.getElementById('countCompleted'),
  cardsTodo: document.getElementById('cardsTodo'),
  cardsInProgress: document.getElementById('cardsInProgress'),
  cardsCompleted: document.getElementById('cardsCompleted'),
  listRows: document.getElementById('listRows'),
  clearCompletedBtn: document.getElementById('clearCompletedBtn'),
  loadSamplesBtn: document.getElementById('loadSamplesBtn'),
  emptyAddTaskBtn: document.getElementById('emptyAddTaskBtn'),
  toastContainer: document.getElementById('toastContainer'),
  confirmDeleteModal: document.getElementById('confirmDeleteModal'),
  confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
  confirmCancelBtn: document.getElementById('confirmCancelBtn'),
  confirmDeleteTaskName: document.getElementById('confirmDeleteTaskName')
};

// ============================================================================
// INITIALIZATION
// ============================================================================
function init() {
  loadThemePreference();
  loadTasks();
  setupEventListeners();
  setupDragAndDrop();
  setupDeleteConfirmModal();
  render();
}

// Load tasks from LocalStorage or seed default
function loadTasks() {
  try {
    const stored = localStorage.getItem('taskflow_tasks');
    if (stored) {
      tasks = JSON.parse(stored);
    } else {
      tasks = [...DEFAULT_TASKS];
      saveTasks();
    }
  } catch (e) {
    console.error('Failed to parse stored tasks:', e);
    tasks = [...DEFAULT_TASKS];
  }
}

function saveTasks() {
  try {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}

// Theme handling
function loadThemePreference() {
  const savedTheme = localStorage.getItem('taskflow_theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
  }
}

function toggleTheme() {
  const isLight = document.body.classList.contains('light-theme');
  if (isLight) {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    localStorage.setItem('taskflow_theme', 'dark');
    showToast('Dark theme activated', 'info');
  } else {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    localStorage.setItem('taskflow_theme', 'light');
    showToast('Light theme activated', 'info');
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================
function setupEventListeners() {
  // Theme Toggle
  elements.themeToggleBtn.addEventListener('click', toggleTheme);

  // View Switchers
  elements.boardViewBtn.addEventListener('click', () => switchView('board'));
  elements.listViewBtn.addEventListener('click', () => switchView('list'));

  // Search & Filter
  elements.searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    elements.clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
    render();
  });

  elements.clearSearchBtn.addEventListener('click', () => {
    elements.searchInput.value = '';
    searchQuery = '';
    elements.clearSearchBtn.style.display = 'none';
    render();
  });

  elements.priorityFilter.addEventListener('change', (e) => {
    selectedPriority = e.target.value;
    render();
  });

  elements.categoryFilter.addEventListener('change', (e) => {
    selectedCategory = e.target.value;
    render();
  });

  // Modal Open / Close
  elements.openModalBtn.addEventListener('click', () => openAddTaskModal('todo'));
  elements.closeModalBtn.addEventListener('click', closeModal);
  elements.cancelModalBtn.addEventListener('click', closeModal);

  // Click outside modal to close
  elements.taskModal.addEventListener('click', (e) => {
    if (e.target === elements.taskModal) {
      closeModal();
    }
  });

  // Form Submit
  elements.taskForm.addEventListener('submit', handleTaskFormSubmit);

  // Clear Completed
  elements.clearCompletedBtn.addEventListener('click', () => {
    const completedCount = tasks.filter(t => t.status === 'completed').length;
    if (completedCount === 0) {
      showToast('No completed tasks to clear', 'info');
      return;
    }
    tasks = tasks.filter(t => t.status !== 'completed');
    saveTasks();
    render();
    showToast(`Archived ${completedCount} completed task(s)`, 'success');
  });

  // Sample tasks & Empty state buttons
  elements.loadSamplesBtn.addEventListener('click', () => {
    tasks = [...DEFAULT_TASKS];
    saveTasks();
    render();
    showToast('Loaded demo tasks', 'success');
  });

  elements.emptyAddTaskBtn.addEventListener('click', () => {
    openAddTaskModal('todo');
  });

  // Keyboard Shortcuts (N for New Task, Escape for Close)
  window.addEventListener('keydown', (e) => {
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if (!isTyping && (e.key === 'n' || e.key === 'N')) {
      e.preventDefault();
      openAddTaskModal('todo');
    } else if (e.key === 'Escape' && elements.taskModal.classList.contains('is-active')) {
      closeModal();
    }
  });
}

// ============================================================================
// VIEW SWITCHING
// ============================================================================
function switchView(view) {
  currentView = view;
  if (view === 'board') {
    elements.boardView.style.display = 'grid';
    elements.listView.style.display = 'none';
    elements.boardViewBtn.classList.add('active');
    elements.listViewBtn.classList.remove('active');
  } else {
    elements.boardView.style.display = 'none';
    elements.listView.style.display = 'block';
    elements.listViewBtn.classList.add('active');
    elements.boardViewBtn.classList.remove('active');
  }
}

// ============================================================================
// FILTERING & DERIVED DATA
// ============================================================================
function getFilteredTasks() {
  return tasks.filter(task => {
    const matchesSearch = !searchQuery ||
      task.title.toLowerCase().includes(searchQuery) ||
      task.description.toLowerCase().includes(searchQuery) ||
      task.category.toLowerCase().includes(searchQuery);

    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;

    return matchesSearch && matchesPriority && matchesCategory;
  });
}

// ============================================================================
// RENDER LOGIC
// ============================================================================
function render() {
  updateStats();

  const filteredTasks = getFilteredTasks();

  // If no tasks match filters or no tasks at all
  if (filteredTasks.length === 0) {
    elements.emptyState.style.display = 'block';
    if (tasks.length === 0) {
      elements.emptyTitle.textContent = 'No tasks yet';
      elements.emptySubtitle.textContent = 'Create your very first task or load demo tasks to explore TaskFlow.';
      elements.loadSamplesBtn.style.display = 'inline-flex';
    } else {
      elements.emptyTitle.textContent = 'No matching tasks found';
      elements.emptySubtitle.textContent = 'Try adjusting your search query, priority, or category filters.';
      elements.loadSamplesBtn.style.display = 'none';
    }
  } else {
    elements.emptyState.style.display = 'none';
  }

  renderBoardView(filteredTasks);
  renderListView(filteredTasks);
}

function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = total - completed;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  elements.statProgressPercent.textContent = `${percent}%`;
  elements.statPendingCount.textContent = pending;
  elements.progressBarFill.style.width = `${percent}%`;

  // Column header counts
  elements.countTodo.textContent = tasks.filter(t => t.status === 'todo').length;
  elements.countInProgress.textContent = tasks.filter(t => t.status === 'in-progress').length;
  elements.countCompleted.textContent = completed;
}

function renderBoardView(filteredTasks) {
  // Clear columns
  elements.cardsTodo.innerHTML = '';
  elements.cardsInProgress.innerHTML = '';
  elements.cardsCompleted.innerHTML = '';

  filteredTasks.forEach(task => {
    const cardEl = createBoardCardElement(task);
    if (task.status === 'todo') {
      elements.cardsTodo.appendChild(cardEl);
    } else if (task.status === 'in-progress') {
      elements.cardsInProgress.appendChild(cardEl);
    } else if (task.status === 'completed') {
      elements.cardsCompleted.appendChild(cardEl);
    }
  });
}

function createBoardCardElement(task) {
  const card = document.createElement('div');
  card.className = `task-card ${task.status === 'completed' ? 'is-completed' : ''}`;
  card.draggable = true;
  card.dataset.id = task.id;
  card.dataset.priority = task.priority;

  // Due date format & overdue check
  let dueHtml = '';
  if (task.dueDate) {
    const isOverdue = task.status !== 'completed' && isDateOverdue(task.dueDate);
    const dateFormatted = formatPrettyDate(task.dueDate);
    dueHtml = `
      <span class="due-date-pill ${isOverdue ? 'is-overdue' : ''}" title="${isOverdue ? 'Overdue!' : 'Due Date'}">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        ${dateFormatted}
      </span>
    `;
  }

  // Next Stage Button
  const nextStage = getNextStage(task.status);
  const updatedBadge = task.updatedAt ? `<span class="updated-badge" title="Last updated: ${formatPrettyDateTime(task.updatedAt)}">✏️ Edited</span>` : '';

  card.innerHTML = `
    <div class="card-top">
      <div class="card-meta-tags">
        <span class="priority-pill ${task.priority}" title="Click to cycle priority" data-id="${task.id}">${task.priority}</span>
        <span class="tag-badge">${escapeHtml(task.category)}</span>
        ${updatedBadge}
      </div>
      <div class="card-actions-menu">
        <button class="update-action-btn edit-btn" title="Update Task Details" data-id="${task.id}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          <span>Update</span>
        </button>
        <button class="mini-icon-btn delete-btn" title="Delete task" data-id="${task.id}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>

    <div class="card-main">
      <div class="task-checkbox-wrap">
        <input type="checkbox" class="task-checkbox" ${task.status === 'completed' ? 'checked' : ''} data-id="${task.id}" title="Toggle Complete">
      </div>
      <div class="task-content" title="Click to update task details">
        <h3 class="task-title">${escapeHtml(task.title)}</h3>
        ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ''}
      </div>
    </div>

    <div class="card-footer">
      <div>${dueHtml}</div>
      <button class="stage-shift-btn" data-id="${task.id}" data-next="${nextStage.key}" title="Move to ${nextStage.label}">
        ${nextStage.label} &rarr;
      </button>
    </div>
  `;

  // Attach card event listeners
  card.querySelector('.task-checkbox').addEventListener('change', (e) => {
    toggleTaskCompletion(task.id, e.target.checked);
  });

  // Clicking on card content opens update modal
  card.querySelector('.task-content').addEventListener('click', () => {
    openEditTaskModal(task.id);
  });

  // Quick inline priority cycle on click
  card.querySelector('.priority-pill').addEventListener('click', (e) => {
    e.stopPropagation();
    cycleTaskPriority(task.id);
  });

  card.querySelector('.edit-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    openEditTaskModal(task.id);
  });

  card.querySelector('.delete-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    deleteTask(task.id);
  });

  card.querySelector('.stage-shift-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    updateTaskStatus(task.id, nextStage.key);
  });

  return card;
}

function renderListView(filteredTasks) {
  elements.listRows.innerHTML = '';

  filteredTasks.forEach(task => {
    const row = document.createElement('div');
    row.className = `list-row ${task.status === 'completed' ? 'is-completed' : ''}`;

    const isOverdue = task.dueDate && task.status !== 'completed' && isDateOverdue(task.dueDate);

    row.innerHTML = `
      <div class="col-check">
        <input type="checkbox" class="task-checkbox" ${task.status === 'completed' ? 'checked' : ''} data-id="${task.id}">
      </div>
      <div class="col-task" style="cursor: pointer;" title="Click to update task details">
        <span class="list-title">${escapeHtml(task.title)}</span>
        ${task.description ? `<p class="list-desc-snippet">${escapeHtml(task.description)}</p>` : ''}
      </div>
      <div class="col-category">
        <span class="tag-badge">${escapeHtml(task.category)}</span>
      </div>
      <div class="col-priority">
        <span class="priority-pill ${task.priority}" title="Click to cycle priority" data-id="${task.id}">${task.priority}</span>
      </div>
      <div class="col-due">
        ${task.dueDate ? `<span class="due-date-pill ${isOverdue ? 'is-overdue' : ''}">${formatPrettyDate(task.dueDate)}</span>` : '<span style="color:var(--text-dim)">-</span>'}
      </div>
      <div class="col-actions">
        <button class="list-update-btn edit-btn" title="Update Task Details" data-id="${task.id}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M12 20h9"></path>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
          </svg>
          <span>Update</span>
        </button>
        <button class="mini-icon-btn delete-btn" title="Delete" data-id="${task.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;

    row.querySelector('.task-checkbox').addEventListener('change', (e) => {
      toggleTaskCompletion(task.id, e.target.checked);
    });

    row.querySelector('.col-task').addEventListener('click', () => {
      openEditTaskModal(task.id);
    });

    row.querySelector('.priority-pill').addEventListener('click', (e) => {
      e.stopPropagation();
      cycleTaskPriority(task.id);
    });

    row.querySelector('.edit-btn').addEventListener('click', () => {
      openEditTaskModal(task.id);
    });

    row.querySelector('.delete-btn').addEventListener('click', () => {
      deleteTask(task.id);
    });

    elements.listRows.appendChild(row);
  });
}

// ============================================================================
// TASK ACTIONS (CRUD)
// ============================================================================
function openAddTaskModal(defaultStatus = 'todo') {
  elements.editTaskId.value = '';
  elements.modalTitle.textContent = 'Create New Task';
  if (elements.modalSubtitle) elements.modalSubtitle.textContent = 'Add a new task to your workflow';
  elements.submitBtnText.textContent = 'Add Task';
  if (elements.modalMetaInfo) elements.modalMetaInfo.style.display = 'none';

  elements.taskForm.reset();
  elements.taskStatusSelect.value = defaultStatus;
  elements.taskPrioritySelect.value = 'medium';
  elements.taskCategorySelect.value = 'Development';

  elements.taskModal.classList.add('is-active');
  elements.taskModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => elements.taskTitleInput.focus(), 50);
}

function openEditTaskModal(taskId) {
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  elements.editTaskId.value = task.id;
  elements.modalTitle.textContent = 'Update Task';
  if (elements.modalSubtitle) elements.modalSubtitle.textContent = 'Modify details, stage, priority, or due date';
  elements.submitBtnText.textContent = 'Update Task';

  if (elements.modalMetaInfo) {
    elements.modalMetaInfo.style.display = 'flex';
    elements.metaCreatedAt.textContent = formatPrettyDateTime(task.createdAt || new Date().toISOString());
    if (task.updatedAt) {
      elements.metaUpdatedAtWrap.style.display = 'flex';
      elements.metaUpdatedAt.textContent = formatPrettyDateTime(task.updatedAt);
    } else {
      elements.metaUpdatedAtWrap.style.display = 'none';
    }
  }

  elements.taskTitleInput.value = task.title;
  elements.taskDescriptionInput.value = task.description || '';
  elements.taskPrioritySelect.value = task.priority;
  elements.taskCategorySelect.value = task.category;
  elements.taskStatusSelect.value = task.status;
  elements.taskDueDateInput.value = task.dueDate || '';

  elements.taskModal.classList.add('is-active');
  elements.taskModal.setAttribute('aria-hidden', 'false');
  setTimeout(() => elements.taskTitleInput.focus(), 50);
}

function closeModal() {
  elements.taskModal.classList.remove('is-active');
  elements.taskModal.setAttribute('aria-hidden', 'true');
  elements.taskForm.reset();
}

function handleTaskFormSubmit(e) {
  e.preventDefault();

  const title = elements.taskTitleInput.value.trim();
  if (!title) {
    showToast('Task title is required', 'error');
    elements.taskTitleInput.focus();
    return;
  }

  const id = elements.editTaskId.value;
  const description = elements.taskDescriptionInput.value.trim();
  const priority = elements.taskPrioritySelect.value;
  const category = elements.taskCategorySelect.value;
  const status = elements.taskStatusSelect.value;
  const dueDate = elements.taskDueDateInput.value;

  if (id) {
    // Update existing task
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = {
        ...tasks[index],
        title,
        description,
        priority,
        category,
        status,
        dueDate,
        updatedAt: new Date().toISOString()
      };
      showToast('Task updated successfully! ✨', 'success');
    }
  } else {
    // Create new task
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      title,
      description,
      priority,
      category,
      status,
      dueDate,
      createdAt: new Date().toISOString()
    };
    tasks.unshift(newTask);
    showToast('Task created successfully!', 'success');
  }

  saveTasks();
  closeModal();
  render();
}

// Pending delete task ID — set when confirm modal opens
let _pendingDeleteId = null;

function deleteTask(id) {
  const taskToDelete = tasks.find(t => t.id === id);
  if (!taskToDelete) return;

  // Show confirm modal instead of deleting directly
  _pendingDeleteId = id;
  const nameEl = elements.confirmDeleteTaskName;
  nameEl.textContent = taskToDelete.title.length > 60
    ? taskToDelete.title.substring(0, 57) + '…'
    : taskToDelete.title;

  elements.confirmDeleteModal.classList.add('is-active');
  elements.confirmDeleteModal.setAttribute('aria-hidden', 'false');
  elements.confirmCancelBtn.focus();
}

function _commitDeleteTask() {
  if (!_pendingDeleteId) return;
  const taskToDelete = tasks.find(t => t.id === _pendingDeleteId);
  tasks = tasks.filter(t => t.id !== _pendingDeleteId);
  _pendingDeleteId = null;
  _closeConfirmModal();
  saveTasks();
  render();
  if (taskToDelete) {
    const shortTitle = taskToDelete.title.length > 30
      ? taskToDelete.title.substring(0, 28) + '…'
      : taskToDelete.title;
    showToast(`"${shortTitle}" deleted`, 'error');
  }
}

function _closeConfirmModal() {
  _pendingDeleteId = null;
  elements.confirmDeleteModal.classList.remove('is-active');
  elements.confirmDeleteModal.setAttribute('aria-hidden', 'true');
}

function setupDeleteConfirmModal() {
  elements.confirmDeleteBtn.addEventListener('click', _commitDeleteTask);
  elements.confirmCancelBtn.addEventListener('click', _closeConfirmModal);

  // Close on backdrop click
  elements.confirmDeleteModal.addEventListener('click', (e) => {
    if (e.target === elements.confirmDeleteModal) _closeConfirmModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.confirmDeleteModal.classList.contains('is-active')) {
      _closeConfirmModal();
    }
  });
}

function toggleTaskCompletion(id, isChecked) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.status = isChecked ? 'completed' : 'todo';
  saveTasks();
  render();

  if (isChecked) {
    showToast('Task marked complete 🎉', 'success');
  }
}

function updateTaskStatus(id, newStatus) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.status = newStatus;
  saveTasks();
  render();
  showToast(`Moved to ${formatStatusName(newStatus)}`, 'info');
}

function getNextStage(currentStatus) {
  if (currentStatus === 'todo') {
    return { key: 'in-progress', label: 'In Progress' };
  } else if (currentStatus === 'in-progress') {
    return { key: 'completed', label: 'Complete' };
  } else {
    return { key: 'todo', label: 'To Do' };
  }
}

function formatStatusName(status) {
  if (status === 'todo') return 'To Do';
  if (status === 'in-progress') return 'In Progress';
  if (status === 'completed') return 'Completed';
  return status;
}

// ============================================================================
// DRAG AND DROP HANDLERS (Kanban Columns)
// ============================================================================
function setupDragAndDrop() {
  const columns = document.querySelectorAll('.kanban-column');

  document.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.task-card');
    if (card) {
      e.dataTransfer.setData('text/plain', card.dataset.id);
      card.style.opacity = '0.4';
    }
  });

  document.addEventListener('dragend', (e) => {
    const card = e.target.closest('.task-card');
    if (card) {
      card.style.opacity = '1';
    }
  });

  columns.forEach(col => {
    col.addEventListener('dragover', (e) => {
      e.preventDefault();
      col.style.borderColor = 'var(--accent-primary)';
    });

    col.addEventListener('dragleave', () => {
      col.style.borderColor = 'var(--border-subtle)';
    });

    col.addEventListener('drop', (e) => {
      e.preventDefault();
      col.style.borderColor = 'var(--border-subtle)';
      const taskId = e.dataTransfer.getData('text/plain');
      const targetStatus = col.dataset.status;

      if (taskId && targetStatus) {
        updateTaskStatus(taskId, targetStatus);
      }
    });
  });
}

// ============================================================================
// UTILITIES
// ============================================================================
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatPrettyDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatPrettyDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function cycleTaskPriority(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const nextIdx = (priorities.indexOf(task.priority) + 1) % priorities.length;
  task.priority = priorities[nextIdx];
  task.updatedAt = new Date().toISOString();
  saveTasks();
  render();
  showToast(`Priority updated to ${task.priority.toUpperCase()}`, 'info');
}

function isDateOverdue(dateString) {
  if (!dateString) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [year, month, day] = dateString.split('-');
  const due = new Date(year, month - 1, day);
  return due < today;
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 2800);
}

// Window global references for inline quick buttons
window.openAddTaskModal = openAddTaskModal;
window.openEditTaskModal = openEditTaskModal;

// Run initial setup on DOM ready
document.addEventListener('DOMContentLoaded', init);

})(); // end IIFE

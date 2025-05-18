let currentStatus = 'all';
let currentPriority = 'all';

async function addTask() {
    var taskInput = document.getElementById("task");
    var prioritySelect = document.getElementById("priority");
    var taskValue = taskInput.value;
    var priorityValue = prioritySelect.value;

    if (taskValue.trim() === '') {
        alert('Please enter a task');
        return;
    }

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                taskName: taskValue, 
                taskStatus: 'active',
                priority: priorityValue 
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add task');
        }

        const task = await response.json();
        addTaskToList(task);
        taskInput.value = "";
        filterTasks();
    } 
    catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task: ' + error.message);
    }
}

function filterTasks() {
    const filter = document.querySelector('.status .active')?.id || 'all';
    const items = document.querySelectorAll('#task-list .todo-item');

    items.forEach(item => {
        const isChecked = item.querySelector('input').checked;
        if (filter === 'all') {
            item.style.display = '';
        } 
        else if (filter === 'active') {
            item.style.display = isChecked ? 'none' : '';
        } 
        else if (filter === 'completed') {
            item.style.display = isChecked ? '' : 'none';
        }
    });
};

function addTaskToList(task) {
    const list = document.createElement("li");
    list.className = `todo-item priority-${task.priority}`;
    list.setAttribute("draggable", "true");
    list.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.taskStatus === "completed";

    if (checkbox.checked) {
        list.classList.add("completed");
    }
    checkbox.addEventListener("change", async function() {
        const newStatus = checkbox.checked ? 'completed' : 'active';
        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    taskName: task.taskName, 
                    taskStatus: newStatus,
                    priority: task.priority 
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update task');
            }

            list.classList.toggle("completed");
            filterTasks();
        } 
        catch (error) {
            console.error('Error updating task:', error);
        }
    });

    list.appendChild(checkbox);

    const textWrapper = document.createElement("span");
    textWrapper.className = "task-text";
    textWrapper.textContent = task.taskName;
    list.appendChild(textWrapper);

    const priorityBadge = document.createElement("span");
    priorityBadge.className = "priority-badge";
    priorityBadge.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    list.appendChild(priorityBadge);

    const reorderIcon = document.createElement("span");
    reorderIcon.className = "reorder-icon";
    reorderIcon.innerHTML = "⤡";
    reorderIcon.title = "Drag to reorder";
    list.appendChild(reorderIcon);

    const editIcon = document.createElement("span");
    editIcon.className = "edit-icon";
    editIcon.textContent = "✏️";
    editIcon.title = "Edit Task";

    editIcon.addEventListener("click", async function() {
        const newTaskValue = prompt("Edit task:", task.taskName);
        if (newTaskValue !== null && newTaskValue.trim() !== '') {
            try {
                const response = await fetch(`/api/tasks/${task.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        taskName: newTaskValue, 
                        taskStatus: checkbox.checked ? 'completed' : 'active',
                        priority: task.priority 
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update task');
                }

                textWrapper.textContent = newTaskValue;
            } 
            catch (error) {
                console.error('Error updating task:', error);
            }
        }
    });

    const deleteIcon = document.createElement("span");
    deleteIcon.className = "delete-icon";
    deleteIcon.textContent = "❌";
    deleteIcon.title = "Delete Task";
    deleteIcon.addEventListener("click", async function() {
        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            list.remove();
            filterTasks();
        } 
        catch (error) {
            console.error('Error deleting task:', error);
        }
    });

    list.appendChild(editIcon);
    list.appendChild(deleteIcon);

    list.addEventListener("dragstart", dragStart);
    list.addEventListener("dragover", dragOver);
    list.addEventListener("drop", drop);

    const ul = document.getElementById("task-list");
    ul.appendChild(list);
};

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        addTask();
    });

    const filterButtons = document.querySelectorAll('.status button');
    const priorityButtons = document.querySelectorAll('.priority-filter button');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Status button clicked:', button.id);
            currentStatus = button.id;
            fetchTasks(currentStatus, currentPriority);
        });
    });

    priorityButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Priority button clicked:', button.id);
            currentPriority = button.id.replace('priority-', '');
            fetchTasks(currentStatus, currentPriority);
        });
    });

    fetchTasks('all', 'all');
});

function filterTasksByPriority(priority) {
    const items = document.querySelectorAll('#task-list .todo-item');
    items.forEach(item => {
        if (priority === 'all') {
            item.style.display = '';
        } else {
            item.style.display = item.classList.contains(`priority-${priority}`) ? '' : 'none';
        }
    });
}

let draggedItem = null;

function dragStart(e) {
    draggedItem = this;
}

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    if (draggedItem) {
        this.parentNode.insertBefore(draggedItem, this.nextSibling);
        updateTaskOrder();
    }
}

async function updateTaskOrder() {
    const tasks = Array.from(document.querySelectorAll('#task-list .todo-item'))
        .map((item, index) => {
            const id = parseInt(item.dataset.id, 10);
            return {
                id: isNaN(id) ? null : id,
                taskOrder: index + 1
            };
        })
        .filter(task => task.id !== null);

    console.log('Tasks array to be sent:', tasks);

    try {
        const response = await fetch('/api/tasks/order/:id', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tasks }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to update task order: ${errorText}`);
        }

        const responseData = await response.json();
        console.log('Task order updated successfully:', responseData);

    } 
    catch (error) {
        console.error('Error updating task order:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const items = document.querySelectorAll('#task-list .todo-item');
    items.forEach(item => {
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragover', dragOver);
        item.addEventListener('drop', drop);
    });

    fetchTasks('all', 'all');
});

async function fetchTasks(status = 'all', priority = 'all') {
    try {
        console.log('Fetching tasks with status:', status, 'and priority:', priority);
        const response = await fetch(`/api/tasks${status !== 'all' ? `/${status}` : ''}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        const tasks = await response.json();
        console.log('Fetched tasks:', tasks);
        
        const ul = document.getElementById("task-list");
        ul.innerHTML = '';

        // Filter tasks by priority
        const filteredTasks = tasks.filter(task => {
            if (priority === 'all') return true;
            return task.priority === priority;
        });

        filteredTasks.sort((a, b) => a.taskOrder - b.taskOrder);

        filteredTasks.forEach(task => {
            addTaskToList(task);
        });

        // Update active filter buttons
        updateActiveFilters(status, priority);
    } 
    catch (error) {
        console.error('Error fetching tasks:', error);
        alert('Error fetching tasks: ' + error.message);
    }
}

function updateActiveFilters(status, priority) {
    // Update status buttons
    const statusButtons = document.querySelectorAll('.status button');
    statusButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.id === status) {
            btn.classList.add('active');
        }
    });

    // Update priority buttons
    const priorityButtons = document.querySelectorAll('.priority-filter button');
    priorityButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.id === `priority-${priority}`) {
            btn.classList.add('active');
        }
    });
}
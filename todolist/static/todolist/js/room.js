// ======================= Helpers =======================

// CSRF once
const CSRF_TOKEN = getCookie("csrftoken");
// Read cookie by name
function getCookie(name) {
    const cookies = document.cookie.split(";").map(c => c.trim());
    for (let cookie of cookies) {
        if (cookie.startsWith(name + "=")) {
            return decodeURIComponent(cookie.substring(name.length + 1));
        }
    }
    return null;
}

// Unified POST helper
function postJSON(url, data) {
    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": CSRF_TOKEN,
        },
        body: JSON.stringify(data),
    });
}

// Modal toggler
function toggleModal(id, show) {
    document.getElementById(id).classList.toggle("hidden", !show);
}

// ======================= Task Logic =======================

// Save Task
function saveTask(taskElement) {
    const taskContainer = taskElement.closest(".task-container");
    postJSON("/update-task/", {
        title: taskElement.innerText.trim(),
        taskId: taskContainer.dataset.taskId,
    }).then(res => {
        if (!res.ok) alert("Error saving task");
    }).catch(() => alert("Network error while saving task"));
}

// Task listeners (debounced)
const typingTimers = new WeakMap();
function setupTaskListeners(taskElement) {
    const doneTypingInterval = 2000;

    taskElement.addEventListener("blur", () => saveTask(taskElement));

    taskElement.addEventListener("input", () => {
        clearTimeout(typingTimers.get(taskElement));
        typingTimers.set(taskElement, setTimeout(() => {
            saveTask(taskElement);
        }, doneTypingInterval));
    });
}

// Delete task
function setupDeleteListener(deleteBtn) {
    deleteBtn.addEventListener("click", () => {
        const taskContainer = deleteBtn.closest(".task-container");
        postJSON("/remove-task/", { taskId: taskContainer.dataset.taskId })
            .then(res => {
                if (res.ok) taskContainer.remove();
                else alert("Error deleting task");
            })
            .catch(() => alert("Network error while deleting task"));
    });
}

// Add Task
function setupAddTaskButton(addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
        const categoryDiv = addTaskBtn.closest(".category");
        const taskList = categoryDiv.querySelector(".task-list");

        postJSON("/add_task/", { category_id: categoryDiv.dataset.categoryId })
            .then(res => res.json())
            .then(data => {
                if (!data.id) return;

                const taskContainer = document.createElement("div");
                taskContainer.classList.add("task-container");
                taskContainer.dataset.taskId = data.id;

                taskContainer.innerHTML = `
                    <div class="task" contenteditable="true">${data.title}</div>
                    <button class="done">
                        <img alt="flowi bin" src="/static/todolist/images/bin_white.png">
                    </button>
                `;

                taskList.insertBefore(taskContainer, addTaskBtn);

                setupTaskListeners(taskContainer.querySelector(".task"));
                setupDeleteListener(taskContainer.querySelector(".done"));
            })
            .catch(() => alert("Network error while adding task"));
    });
}

// ======================= Category Logic =======================

// Add category
function confirmAddCategory() {
    const input = document.getElementById("new-category-name");
    const name = input.value.trim();
    if (!name) return alert("Please enter a category name");

    const roomId = document.querySelector(".categories").dataset.roomId;

    postJSON("/add_category/", { user_input: name, roomId })
        .then(res => res.json())
        .then(data => {
            if (!data.id) return;

            // Add category to DOM
            const categories = document.querySelector(".categories");
            const categoryDiv = document.createElement("div");
            categoryDiv.classList.add("category");
            categoryDiv.dataset.categoryId = data.id;
            categoryDiv.innerHTML = `
                <h3 class="category-name">${data.name}</h3>
                <div class="task-list" data-category-id="${data.id}">
                    <button class="add-task">+</button>
                </div>
            `;
            categories.appendChild(categoryDiv);

            // Hook up new task button
            setupAddTaskButton(categoryDiv.querySelector(".add-task"));

            // Add to dropdown
            const dropdown = document.getElementById("category-dropdown");
            dropdown.append(new Option(data.name, data.id));

            // Reset + close
            input.value = "";
            toggleModal("add-category-modal", false);
        })
        .catch(() => alert("Network error while adding category"));
}

// Remove category
function confirmRemoveCategory() {
    const dropdown = document.getElementById("category-dropdown");
    const categoryId = dropdown.value;
    if (!categoryId) return alert("Please select a category!");

    postJSON("/remove_category/", { categoryId })
        .then(res => res.json())
        .then(data => {
            if (!data.success) return alert("Error removing category");

            dropdown.querySelector(`option[value="${categoryId}"]`)?.remove();
            document.querySelector(`.category[data-category-id="${categoryId}"]`)?.remove();
            toggleModal("remove-category-modal", false);
        })
        .catch(() => alert("Network error while removing category"));
}

// ======================= Init =======================
document.addEventListener("DOMContentLoaded", () => {
    // Initialize tasks
    document.querySelectorAll(".task").forEach(setupTaskListeners);
    document.querySelectorAll(".done").forEach(setupDeleteListener);
    document.querySelectorAll(".add-task").forEach(setupAddTaskButton);

    // Category modals
    document.getElementById("confirm-add-category")?.addEventListener("click", confirmAddCategory);
    document.getElementById("close-add-modal")?.addEventListener("click", () => toggleModal("add-category-modal", false));
    document.getElementById("confirm-remove-category")?.addEventListener("click", confirmRemoveCategory);
    document.getElementById("close-remove-modal")?.addEventListener("click", () => toggleModal("remove-category-modal", false));

    // Side nav
    document.querySelectorAll(".side-nav button").forEach(button => {
        button.addEventListener("click", () => {
            switch (button.dataset.tooltip) {
                case "Add a new category": addCategory(); break;
                case "Remove an existing category": removeCategory(); break;
                case "Leave this room": window.location.href = button.dataset.url; break;
                default: console.log("Unknown action");
            }
        });
    });
});

// Explicit modal openers
function addCategory() { toggleModal("add-category-modal", true); }
function removeCategory() { toggleModal("remove-category-modal", true); }

"use strict";

let lastDeleted = null;
let pendingDelete = null;
let nextTaskId = 1;
let nextListId = 1;

const lists = [
  { id: "na-wczoraj", name: "Na wczoraj", tasks: [] },
  { id: "pilne", name: "Pilne", tasks: [] },
  { id: "inne", name: "Inne", tasks: [] },
];

const getList = (listId) => lists.find((l) => l.id === listId);

const renderSelect = () => {
  const select = document.getElementById("list-select");
  const current = select.value;
  select.innerHTML = "";
  lists.forEach((list) => {
    const option = document.createElement("option");
    option.value = list.id;
    option.textContent = list.name;
    select.appendChild(option);
  });
  if (current && getList(current)) {
    select.value = current;
  }
};

const createTaskElement = (task, listId) => {
  const li = document.createElement("li");
  li.className = "task-item" + (task.done ? " done" : "");
  li.dataset.taskId = task.id;

  const textSpan = document.createElement("span");
  textSpan.className = "task-text";
  textSpan.textContent = task.text;

  const dateSpan = document.createElement("span");
  dateSpan.className = "task-date";
  if (task.done && task.doneAt) {
    dateSpan.textContent = task.doneAt;
  }

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn-delete";
  deleteBtn.textContent = "✕";
  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openDeleteModal(task.id, listId);
  });

  li.addEventListener("click", () => toggleDone(task.id, listId));
  li.appendChild(textSpan);
  li.appendChild(dateSpan);
  li.appendChild(deleteBtn);

  return li;
};

const renderLists = () => {
  const container = document.getElementById("lists-container");
  const collapsed = new Set();
  container.querySelectorAll(".list-card.collapsed").forEach((el) => {
    collapsed.add(el.dataset.listId);
  });
  container.innerHTML = "";

  lists.forEach((list) => {
    const section = document.createElement("section");
    section.className = "card list-card" + (collapsed.has(list.id) ? " collapsed" : "");
    section.dataset.listId = list.id;

    const header = document.createElement("h2");
    header.className = "list-header";
    header.textContent = list.name;
    header.addEventListener("click", () => {
      section.classList.toggle("collapsed");
    });

    const ul = document.createElement("ul");
    ul.className = "task-list";
    list.tasks.forEach((task) => {
      ul.appendChild(createTaskElement(task, list.id));
    });

    section.appendChild(header);
    section.appendChild(ul);
    container.appendChild(section);
  });

  applyFilter();
};

const toggleDone = (taskId, listId) => {
  const list = getList(listId);
  const task = list.tasks.find((t) => t.id === taskId);
  task.done = !task.done;
  task.doneAt = task.done ? new Date().toLocaleString("pl-PL") : null;
  renderLists();
};

const openDeleteModal = (taskId, listId) => {
  const list = getList(listId);
  const task = list.tasks.find((t) => t.id === taskId);
  pendingDelete = { taskId, listId };
  document.getElementById("modal-text").textContent =
    `Czy na pewno chcesz usunąć zadanie o treści: ${task.text}`;
  document.getElementById("delete-modal").showModal();
};

const confirmDelete = () => {
  if (!pendingDelete) { return; }
  const { taskId, listId } = pendingDelete;
  const list = getList(listId);
  const idx = list.tasks.findIndex((t) => t.id === taskId);
  const [removed] = list.tasks.splice(idx, 1);
  lastDeleted = { task: removed, listId, idx };
  pendingDelete = null;
  document.getElementById("delete-modal").close();
  document.getElementById("undo-btn").classList.remove("hidden");
  renderLists();
};

const undoDelete = () => {
  if (!lastDeleted) { return; }
  const list = getList(lastDeleted.listId);
  list.tasks.splice(lastDeleted.idx, 0, lastDeleted.task);
  lastDeleted = null;
  document.getElementById("undo-btn").classList.add("hidden");
  renderLists();
};

const addTask = () => {
  const input = document.getElementById("task-input");
  const text = input.value.trim();
  if (text === "") {
    input.classList.add("input-error");
    input.focus();
    return;
  }
  input.classList.remove("input-error");
  const listId = document.getElementById("list-select").value;
  const list = getList(listId);
  list.tasks.push({ id: nextTaskId++, text, done: false, doneAt: null });
  input.value = "";
  renderLists();
};

const addList = () => {
  const input = document.getElementById("new-list-input");
  const name = input.value.trim();
  if (name === "") { return; }
  const id = `custom-${nextListId++}`;
  lists.push({ id, name, tasks: [] });
  input.value = "";
  renderSelect();
  renderLists();
};

const applyFilter = () => {
  const query = document.getElementById("search-input").value;
  const ignoreCase = document.getElementById("case-insensitive").checked;
  const items = document.querySelectorAll(".task-item");
  items.forEach((li) => {
    const text = li.querySelector(".task-text").textContent;
    const match = ignoreCase
      ? text.toLowerCase().includes(query.toLowerCase())
      : text.includes(query);
    li.style.display = match ? "" : "none";
  });
};

document.addEventListener("DOMContentLoaded", () => {
  renderSelect();
  renderLists();

  document.getElementById("add-btn").addEventListener("click", addTask);

  document.getElementById("task-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { addTask(); }
  });

  document.getElementById("task-input").addEventListener("input", () => {
    document.getElementById("task-input").classList.remove("input-error");
  });

  document.getElementById("add-list-btn").addEventListener("click", addList);

  document.getElementById("new-list-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") { addList(); }
  });

  document.getElementById("undo-btn").addEventListener("click", undoDelete);

  document.getElementById("search-input").addEventListener("input", applyFilter);

  document.getElementById("case-insensitive").addEventListener("change", applyFilter);

  document.getElementById("modal-confirm").addEventListener("click", confirmDelete);

  document.getElementById("modal-cancel").addEventListener("click", () => {
    pendingDelete = null;
    document.getElementById("delete-modal").close();
  });
});

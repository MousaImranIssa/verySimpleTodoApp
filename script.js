const todos = document.querySelector('.todos');
const todoTextField = document.querySelector('.todo-text-field');
const todoAddButton = document.querySelector('.todo-add-button');

let db = new PouchDB('todos');

todoAddButton.onclick = async function (e) {
    e.preventDefault();
    const todoContainer = document.createElement('div');
    todoContainer.className = 'todo-container';

    const todo = document.createElement('div');
    todo.className = 'todo';
    todo.innerText = todoTextField.value;

    const todoCheckbox = document.createElement('input');
    todoCheckbox.type = 'checkbox';
    todoCheckbox.className = 'todo-checkbox';

    const todoDeleteButton = document.createElement('input');
    todoDeleteButton.className = 'todo-delete-button';
    todoDeleteButton.type = 'button';
    todoDeleteButton.value = 'Del';

    todoContainer.appendChild(todoDeleteButton);
    todoContainer.appendChild(todo);
    todoContainer.appendChild(todoCheckbox);
    todos.appendChild(todoContainer);

    const todoDoc = {
        _id: new Date().toISOString(),
        text: todoTextField.value,
        completed: false,
    };
    try {
        await db.put(todoDoc);
        todoContainer.setAttribute('data-id', todoDoc._id);
        todoTextField.value = '';
    } catch (err) {
        console.log('Failed To Add todo', err)
        alert('Failed to add todo. Please try again later.');
    }
};

document.addEventListener('click', async function (e) {
    if (e.target.matches('.todo-delete-button')) {
        const todoContainer = e.target.closest('.todo-container');
        const todoId = todoContainer.getAttribute('data-id');
        try {
            const todoDoc = await db.get(todoId);
            await db.remove(todoDoc);
            todoContainer.remove();
            db.compact();
        } catch (err) {
            console.log('Failed To Delete todo', err)
            alert('Failed To Delete todo, Please try again later.');
        }
    }

    if (e.target.matches('.todo-checkbox')) {
        const todoContainer = e.target.closest('.todo-container');
        const todoId = todoContainer.getAttribute('data-id');
        const todo = todoContainer.querySelector('.todo');
        try {
            const todoDoc = await db.get(todoId);
            todoDoc.completed = e.target.checked;
            await db.put(todoDoc);
            if (e.target.checked) {
                todo.classList.add('completed');
            } else {
                todo.classList.remove('completed');
            }
        } catch (err) {
            console.error('Failed to update todo status', err);
            alert('Failed to update todo status. Please try again later.');
        }
    }
});

async function loadDocs() {
    try {
        const result = await db.allDocs({ include_docs: true });
        result.rows.forEach(row => {
            const todoContainer = document.createElement('div');
            todoContainer.className = 'todo-container';
            todoContainer.setAttribute('data-id', row.id);

            const todo = document.createElement('div');
            todo.className = 'todo';
            todo.innerText = row.doc.text;

            const todoCheckbox = document.createElement('input');
            todoCheckbox.className = 'todo-checkbox';
            todoCheckbox.type = 'checkbox';
            todoCheckbox.checked = row.doc.completed;

            const todoDeleteButton = document.createElement('input');
            todoDeleteButton.className = 'todo-delete-button';
            todoDeleteButton.type = 'button';
            todoDeleteButton.value = 'Del';

            todoContainer.appendChild(todoDeleteButton);
            todoContainer.appendChild(todo);
            todoContainer.appendChild(todoCheckbox);
            todos.appendChild(todoContainer);

            if (row.doc.completed) {
                todo.classList.add('completed');
            }
        });
    } catch (err) {
        console.error('Failed to load todos', err);
        alert('Failed to load todos. Please try again later.');
    }
}
loadDocs();
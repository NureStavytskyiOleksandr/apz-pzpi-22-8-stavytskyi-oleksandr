const dashboardSection = document.getElementById('dashboard');
const userRole = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');
const backBtn = document.getElementById('backBtn');
const addUserBtn = document.getElementById('addUserBtn');
const addUserForm = document.getElementById('addUserForm');
const addUsername = document.getElementById('addUsername');
const addEmail = document.getElementById('addEmail');
const addPassword = document.getElementById('addPassword');
const addRole = document.getElementById('addRole');
const submitAddUserBtn = document.getElementById('submitAddUserBtn');
const cancelAddUserBtn = document.getElementById('cancelAddUserBtn');
const usersList = document.getElementById('usersList');

async function waitForI18n() {
  while (!i18nInitialized) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function loadUsers() {
  await waitForI18n();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || !role || role !== 'super_admin') {
    alert(t('access_denied'));
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = 'index.html';
    return;
  }
  userRole.textContent = `${t('role_label')} ${role}`;
  fetchUsers();
}

// Завантаження користувачів
async function fetchUsers() {
  try {
    const users = await fetch('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => res.json());
    usersList.innerHTML = users.map(user => `
      <li class="list-group-item" id="user-${user.user_id}">
        ${user.username} (${user.email}) - Роль: ${user.role}
        <button class="btn btn-sm btn-warning ms-2" onclick="showEditForm(${user.user_id}, '${user.username}', '${user.email}', '${user.role}')" data-i18n="edit_button">Редагувати</button>
        <button class="btn btn-sm btn-danger ms-2" onclick="deleteUser(${user.user_id})" data-i18n="delete_button">Видалити</button>
        <div id="editForm-${user.user_id}" class="mt-2 hidden">
          <div class="mb-2">
            <label for="editUsername-${user.user_id}" class="form-label" data-i18n="username_label">Ім'я користувача</label>
            <input type="text" class="form-control" id="editUsername-${user.user_id}" value="${user.username}">
          </div>
          <div class="mb-2">
            <label for="editEmail-${user.user_id}" class="form-label" data-i18n="email_label">Email</label>
            <input type="email" class="form-control" id="editEmail-${user.user_id}" value="${user.email}">
          </div>
          <div class="mb-2">
            <label for="editRole-${user.user_id}" class="form-label" data-i18n="role_label_select">Роль</label>
            <select id="editRole-${user.user_id}" class="form-select">
              <option value="user" ${user.role === 'user' ? 'selected' : ''} data-i18n="user_option">User</option>
              <option value="parking_admin" ${user.role === 'parking_admin' ? 'selected' : ''} data-i18n="parking_admin_option">Parking Admin</option>
              <option value="super_admin" ${user.role === 'super_admin' ? 'selected' : ''} data-i18n="super_admin_option">Super Admin</option>
            </select>
          </div>
          <button class="btn btn-success" onclick="editUser(${user.user_id})" data-i18n="save_button">Зберегти</button>
          <button class="btn btn-secondary" onclick="hideEditForm(${user.user_id})" data-i18n="cancel_button">Скасувати</button>
        </div>
      </li>
    `).join('');
    setLanguage(currentLang); // Оновлюємо переклад для динамічно створених елементів
  } catch (err) {
    console.error('Помилка при завантаженні користувачів:', err);
  }
}

// Показати форму додавання
addUserBtn.addEventListener('click', () => {
  addUserForm.classList.remove('hidden');
  addUserBtn.classList.add('hidden');
});

// Скасувати додавання
cancelAddUserBtn.addEventListener('click', () => {
  addUserForm.classList.add('hidden');
  addUserBtn.classList.remove('hidden');
  addUsername.value = '';
  addEmail.value = '';
  addPassword.value = '';
  addRole.value = 'user';
});

// Додавання користувача через маршрут реєстрації
submitAddUserBtn.addEventListener('click', async () => {
  const username = addUsername.value;
  const email = addEmail.value;
  const password = addPassword.value;
  const role = addRole.value;
  if (username && email && password) {
    try {
      const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ username, email, password, role }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('create_user_error'));
      }
      addUserForm.classList.add('hidden');
      addUserBtn.classList.remove('hidden');
      addUsername.value = '';
      addEmail.value = '';
      addPassword.value = '';
      addRole.value = 'user';
      fetchUsers();
    } catch (err) {
      alert(err.message || t('create_user_error'));
    }
  } else {
    alert(t('fill_all_fields'));
  }
});

// Показати форму редагування
window.showEditForm = (userId, username, email, role) => {
  const editForm = document.getElementById(`editForm-${userId}`);
  editForm.classList.remove('hidden');
  document.getElementById(`user-${userId}`).querySelector('button.btn-warning').classList.add('hidden');
};

// Приховати форму редагування
window.hideEditForm = (userId) => {
  const editForm = document.getElementById(`editForm-${userId}`);
  editForm.classList.add('hidden');
  document.getElementById(`user-${userId}`).querySelector('button.btn-warning').classList.remove('hidden');
};

// Редагування користувача
window.editUser = async (userId) => {
  const username = document.getElementById(`editUsername-${userId}`).value;
  const email = document.getElementById(`editEmail-${userId}`).value;
  const role = document.getElementById(`editRole-${userId}`).value;
  if (username && email) {
    try {
      await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, role }),
      });
      fetchUsers();
    } catch (err) {
      alert(t('edit_user_error'));
    }
  } else {
    alert(t('fill_all_fields'));
  }
};

// Видалення користувача
window.deleteUser = async (userId) => {
  if (confirm(t('delete_user_confirmation'))) {
    try {
      await fetch(`http://localhost:3000/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchUsers();
    } catch (err) {
      alert(t('delete_user_error'));
    }
  }
};

// Повернення назад
backBtn.addEventListener('click', () => {
  window.location.href = 'dashboard.html';
});

// Вихід
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = 'index.html';
});

// Ініціалізація
loadUsers();
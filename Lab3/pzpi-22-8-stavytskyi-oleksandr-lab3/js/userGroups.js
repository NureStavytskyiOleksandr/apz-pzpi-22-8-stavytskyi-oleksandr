const userRole = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');
const backBtn = document.getElementById('backBtn');
const groupNameInput = document.getElementById('groupName');
const groupDescriptionInput = document.getElementById('groupDescription');
const createGroupBtn = document.getElementById('createGroupBtn');
const groupsList = document.getElementById('groupsList');

let parkingId = null;
let allUsers = [];

async function waitForI18n() {
  while (!i18nInitialized) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function loadUserGroups() {
  await waitForI18n();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || !role || !['super_admin', 'parking_admin'].includes(role)) {
    alert(t('access_denied'));
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = 'index.html';
    return;
  }
  userRole.textContent = `${t('role_label')} ${role}`;
  const urlParams = new URLSearchParams(window.location.search);
  parkingId = urlParams.get('parkingId');
  if (!parkingId) {
    alert(t('parking_not_selected'));
    window.location.href = 'dashboard.html';
    return;
  }
  console.log('Завантаження груп для parkingId:', parkingId);
  fetchGroups();
  fetchUsers();
}

async function fetchGroups() {
  try {
    const response = await fetch(`http://localhost:3000/user-groups/parking/${parkingId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) {
      throw new Error(`Помилка при отриманні груп: ${response.status} ${response.statusText}`);
    }
    const groups = await response.json();
    console.log('Отримані групи:', groups);
    displayGroups(groups);
  } catch (err) {
    console.error('Помилка при завантаженні груп:', err);
    groupsList.innerHTML = `<p class="text-danger">${t('fetch_groups_error')}</p>`;
  }
}

async function fetchUsers() {
  try {
    const response = await fetch('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) {
      throw new Error(`Помилка при отриманні користувачів: ${response.status} ${response.statusText}`);
    }
    const users = await response.json();
    allUsers = users.filter(user => user.role === 'user');
    console.log('Отримані користувачі:', allUsers);
    fetchGroups();
  } catch (err) {
    console.error('Помилка при завантаженні користувачів:', err);
    allUsers = [];
  }
}

async function displayGroups(groups) {
  if (groups.length === 0) {
    groupsList.innerHTML = `<p>${t('no_groups_message')}</p>`;
    return;
  }
  groupsList.innerHTML = groups.map(group => `
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">${group.group_name}</h5>
        <p class="card-text">${t('group_id_label')}${group.group_id}</p>
        <p class="card-text">${t('description_label')}${group.description || t('no_description_message')}</p>
        <button class="btn btn-primary me-2" onclick="editGroup(${group.group_id})" data-i18n="edit_button">Редагувати</button>
        <button class="btn btn-danger me-2" onclick="deleteGroup(${group.group_id})" data-i18n="delete_button">Видалити</button>
        <button class="btn btn-primary" onclick="showAddMemberForm(${group.group_id})" data-i18n="add_member_button">Додати користувача</button>
        <div id="editForm-${group.group_id}" class="mt-2 hidden">
          <div class="input-group mb-2">
            <input type="text" id="editGroupName-${group.group_id}" class="form-control" value="${group.group_name}">
            <input type="text" id="editGroupDescription-${group.group_id}" class="form-control ms-2" value="${group.description || ''}">
            <button class="btn btn-success ms-2" onclick="saveGroup(${group.group_id})" data-i18n="save_button">Зберегти</button>
            <button class="btn btn-secondary ms-2" onclick="hideEditForm(${group.group_id})" data-i18n="cancel_button">Скасувати</button>
          </div>
        </div>
        <div id="addMemberForm-${group.group_id}" class="mt-2 hidden">
          <div class="input-group mb-2">
            <select id="userSelect-${group.group_id}" class="form-select">
              <option value="" data-i18n="select_user_option">-- Виберіть користувача --</option>
              ${allUsers.map(user => `<option value="${user.user_id}">${user.username} (${user.email})</option>`).join('')}
            </select>
            <button class="btn btn-success" onclick="addMember(${group.group_id})" data-i18n="add_button">Додати</button>
            <button class="btn btn-secondary" onclick="hideAddMemberForm(${group.group_id})" data-i18n="cancel_button">Скасувати</button>
          </div>
        </div>
        <div id="membersList-${group.group_id}" class="mt-2"></div>
      </div>
    </div>
  `).join('');
  for (const group of groups) {
    await fetchMembers(group.group_id);
  }
  setLanguage(currentLang); // Оновлюємо переклад для динамічно створених елементів
}

async function fetchMembers(groupId) {
  try {
    const response = await fetch(`http://localhost:3000/user-group-members/group/${groupId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) {
      throw new Error(`Помилка при отриманні членів групи: ${response.status} ${response.statusText}`);
    }
    const members = await response.json();
    console.log(`Члени групи ${groupId}:`, members);
    const membersList = document.getElementById(`membersList-${groupId}`);
    membersList.innerHTML = members.length > 0 ? `
      <h6 data-i18n="group_members_label">Члени групи:</h6>
      <ul class="list-group">
        ${members.map(member => {
          const user = allUsers.find(u => u.user_id === member.user_id);
          return user ? `
            <li class="list-group-item d-flex justify-content-between align-items-center">
              ${user.username} (${user.email})
              <button class="btn btn-danger btn-sm" onclick="removeMember(${member.user_id}, ${groupId})" data-i18n="delete_button">Видалити</button>
            </li>
          ` : `<li class="list-group-item">${t('user_not_found_message')}${member.user_id}${t('user_not_found_suffix')}</li>`;
        }).join('')}
      </ul>
    ` : `<p>${t('no_members_message')}</p>`;
    setLanguage(currentLang); // Оновлюємо переклад для динамічно створених елементів
  } catch (err) {
    console.error('Помилка при завантаженні членів групи:', err);
    const membersList = document.getElementById(`membersList-${groupId}`);
    membersList.innerHTML = `<p class="text-danger">${t('fetch_members_error')}</p>`;
  }
}

createGroupBtn.addEventListener('click', async () => {
  const groupName = groupNameInput.value.trim();
  const description = groupDescriptionInput.value.trim();
  if (!groupName) {
    alert(t('enter_group_name_message'));
    return;
  }
  try {
    const response = await fetch('http://localhost:3000/user-groups', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_name: groupName, description, parking_id: parseInt(parkingId) }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Помилка при створенні групи: ${response.status} ${response.statusText} - ${errorData.error}`);
    }
    groupNameInput.value = '';
    groupDescriptionInput.value = '';
    fetchGroups();
  } catch (err) {
    console.error('Помилка при створенні групи:', err);
    alert(t('create_group_error'));
  }
});

window.editGroup = (groupId) => {
  const form = document.getElementById(`editForm-${groupId}`);
  form.classList.remove('hidden');
};

window.hideEditForm = (groupId) => {
  const form = document.getElementById(`editForm-${groupId}`);
  form.classList.add('hidden');
};

window.saveGroup = async (groupId) => {
  const groupName = document.getElementById(`editGroupName-${groupId}`).value.trim();
  const description = document.getElementById(`editGroupDescription-${groupId}`).value.trim();
  if (!groupName) {
    alert(t('enter_group_name_message'));
    return;
  }
  try {
    const response = await fetch(`http://localhost:3000/user-groups/${groupId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_name: groupName, description, parking_id: parseInt(parkingId) }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Помилка при оновленні групи: ${response.status} ${response.statusText} - ${errorData.error}`);
    }
    hideEditForm(groupId);
    fetchGroups();
  } catch (err) {
    console.error('Помилка при оновленні групи:', err);
    alert(t('update_group_error'));
  }
};

window.deleteGroup = async (groupId) => {
  if (confirm(t('delete_group_confirmation'))) {
    try {
      const response = await fetch(`http://localhost:3000/user-groups/${groupId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Помилка при видаленні групи: ${response.status} ${response.statusText} - ${errorData.error}`);
      }
      fetchGroups();
    } catch (err) {
      console.error('Помилка при видаленні групи:', err);
      alert(t('delete_group_error'));
    }
  }
};

window.showAddMemberForm = (groupId) => {
  const form = document.getElementById(`addMemberForm-${groupId}`);
  form.classList.remove('hidden');
};

window.hideAddMemberForm = (groupId) => {
  const form = document.getElementById(`addMemberForm-${groupId}`);
  form.classList.add('hidden');
};

window.addMember = async (groupId) => {
  const userSelect = document.getElementById(`userSelect-${groupId}`);
  const userId = parseInt(userSelect.value);
  if (!userId) {
    alert(t('select_user_message'));
    return;
  }
  try {
    const response = await fetch('http://localhost:3000/user-group-members', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, group_id: groupId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Помилка при додаванні користувача: ${response.status} ${response.statusText} - ${errorData.error}`);
    }
    hideAddMemberForm(groupId);
    fetchMembers(groupId);
  } catch (err) {
    console.error('Помилка при додаванні користувача до групи:', err);
    alert(t('add_member_error'));
  }
};

window.removeMember = async (userId, groupId) => {
  if (confirm(t('delete_member_confirmation'))) {
    try {
      const response = await fetch(`http://localhost:3000/user-group-members/${userId}/${groupId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Помилка при видаленні користувача: ${response.status} ${response.statusText} - ${errorData.error}`);
      }
      fetchMembers(groupId);
    } catch (err) {
      console.error('Помилка при видаленні користувача з групи:', err);
      alert(t('remove_member_error'));
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
loadUserGroups();
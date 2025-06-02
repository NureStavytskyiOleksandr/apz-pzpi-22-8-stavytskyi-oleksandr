const userRole = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');
const backBtn = document.getElementById('backBtn');
const groupNameInput = document.getElementById('groupName');
const groupDescriptionInput = document.getElementById('groupDescription');
const createGroupBtn = document.getElementById('createGroupBtn');
const groupsList = document.getElementById('groupsList');

let parkingId = null;
let role = null;

async function waitForI18n() {
  while (!i18nInitialized) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function loadParkingGroups() {
  await waitForI18n();

  const token = localStorage.getItem('token');
  role = localStorage.getItem('role');
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
  console.log('Роль користувача:', role);
  console.log('parkingId з URL:', parkingId);
  if (!parkingId && role === 'parking_admin') {
    alert(t('parking_not_selected'));
    window.location.href = 'dashboard.html';
    return;
  }
  fetchGroups();
}

async function fetchGroups() {
  try {
    const endpoint = role === 'parking_admin' 
      ? `http://localhost:3000/parking-groups/parking/${parkingId}`
      : 'http://localhost:3000/parking-groups';
    console.log('Запит до:', endpoint);
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) {
      throw new Error(`Помилка при отриманні груп: ${response.status} ${response.statusText}`);
    }
    const groups = await response.json();
    console.log('Отримані групи з сервера:', groups);
    displayGroups(groups);
  } catch (err) {
    console.error('Помилка при завантаженні груп:', err);
    groupsList.innerHTML = `<p class="text-danger">${t('fetch_parking_groups_error')}</p>`;
  }
}

async function displayGroups(groups) {
  if (groups.length === 0) {
    groupsList.innerHTML = `<p>${t('no_parking_groups_message')}</p>`;
    return;
  }
  groupsList.innerHTML = groups.map(group => `
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">${group.group_name}</h5>
        <p class="card-text">${t('group_id_label')}${group.parking_group_id}</p>
        <p class="card-text">${t('description_label')}${group.description || t('no_description_message')}</p>
        <p class="card-text">${t('parking_id_label')}${group.parking_id}</p>
        <button class="btn btn-primary me-2" onclick="editGroup(${group.parking_group_id})" data-i18n="edit_button">Редагувати</button>
        <button class="btn btn-danger me-2" onclick="deleteGroup(${group.parking_group_id})" data-i18n="delete_button">Видалити</button>
        <div id="editForm-${group.parking_group_id}" class="mt-2 hidden">
          <div class="input-group mb-2">
            <input type="text" id="editGroupName-${group.parking_group_id}" class="form-control" value="${group.group_name}">
            <input type="text" id="editGroupDescription-${group.parking_group_id}" class="form-control ms-2" value="${group.description || ''}">
            <button class="btn btn-success ms-2" onclick="saveGroup(${group.parking_group_id})" data-i18n="save_button">Зберегти</button>
            <button class="btn btn-secondary ms-2" onclick="hideEditForm(${group.parking_group_id})" data-i18n="cancel_button">Скасувати</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  setLanguage(currentLang); // Оновлюємо переклад для динамічно створених елементів
}

createGroupBtn.addEventListener('click', async () => {
  const groupName = groupNameInput.value.trim();
  const description = groupDescriptionInput.value.trim();
  if (!groupName) {
    alert(t('enter_group_name_message'));
    return;
  }
  try {
    const response = await fetch('http://localhost:3000/parking-groups', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ parking_id: role === 'parking_admin' ? parseInt(parkingId) : null, group_name: groupName, description }),
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

window.editGroup = (parkingGroupId) => {
  const form = document.getElementById(`editForm-${parkingGroupId}`);
  form.classList.remove('hidden');
};

window.hideEditForm = (parkingGroupId) => {
  const form = document.getElementById(`editForm-${parkingGroupId}`);
  form.classList.add('hidden');
};

window.saveGroup = async (parkingGroupId) => {
  const groupName = document.getElementById(`editGroupName-${parkingGroupId}`).value.trim();
  const description = document.getElementById(`editGroupDescription-${parkingGroupId}`).value.trim();
  if (!groupName) {
    alert(t('enter_group_name_message'));
    return;
  }
  try {
    const response = await fetch(`http://localhost:3000/parking-groups/${parkingGroupId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ parking_id: role === 'parking_admin' ? parseInt(parkingId) : null, group_name: groupName, description }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Помилка при оновленні групи: ${response.status} ${response.statusText} - ${errorData.error}`);
    }
    hideEditForm(parkingGroupId);
    fetchGroups();
  } catch (err) {
    console.error('Помилка при оновленні групи:', err);
    alert(t('update_group_error'));
  }
};

window.deleteGroup = async (parkingGroupId) => {
  if (confirm(t('delete_group_confirmation'))) {
    try {
      const response = await fetch(`http://localhost:3000/parking-groups/${parkingGroupId}`, {
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
loadParkingGroups();
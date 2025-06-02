const userRole = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');
const backBtn = document.getElementById('backBtn');
const userGroupSelect = document.getElementById('userGroupSelect');
const parkingGroupSelect = document.getElementById('parkingGroupSelect');
const createAccessBtn = document.getElementById('createAccessBtn');
const accessList = document.getElementById('accessList');

let parkingId = null;
let role = null;

async function waitForI18n() {
  while (!i18nInitialized) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function loadAccessPage() {
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
  if (!parkingId && role === 'parking_admin') {
    alert(t('parking_not_selected'));
    window.location.href = 'dashboard.html';
    return;
  }
  fetchUserGroups();
  fetchParkingGroups();
  fetchAccessRecords();
}

async function fetchUserGroups() {
  try {
    const endpoint = role === 'parking_admin' 
      ? `http://localhost:3000/user-groups/parking/${parkingId}`
      : 'http://localhost:3000/user-groups';
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) {
      throw new Error(`Помилка при отриманні груп користувачів: ${response.status} ${response.statusText}`);
    }
    const groups = await response.json();
    userGroupSelect.innerHTML = `<option value="" data-i18n="select_group_option">${t('select_group_option')}</option>` + 
      groups.map(group => `<option value="${group.group_id}">${group.group_name} (ID: ${group.group_id})</option>`).join('');
    setLanguage(currentLang); // Оновлюємо переклад для селекту
  } catch (err) {
    console.error('Помилка при завантаженні груп користувачів:', err);
    userGroupSelect.innerHTML = `<option value="">${t('fetch_groups_error')}</option>`;
  }
  updateCreateButtonState();
}

async function fetchParkingGroups() {
  try {
    const endpoint = role === 'parking_admin' 
      ? `http://localhost:3000/parking-groups/parking/${parkingId}`
      : 'http://localhost:3000/parking-groups';
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) {
      throw new Error(`Помилка при отриманні груп парковок: ${response.status} ${response.statusText}`);
    }
    const groups = await response.json();
    parkingGroupSelect.innerHTML = `<option value="" data-i18n="select_group_option">${t('select_group_option')}</option>` + 
      groups.map(group => `<option value="${group.parking_group_id}">${group.group_name} (Parking ID: ${group.parking_id})</option>`).join('');
    setLanguage(currentLang); // Оновлюємо переклад для селекту
  } catch (err) {
    console.error('Помилка при завантаженні груп парковок:', err);
    parkingGroupSelect.innerHTML = `<option value="">${t('fetch_parking_groups_error')}</option>`;
  }
  updateCreateButtonState();
}

function updateCreateButtonState() {
  createAccessBtn.disabled = !userGroupSelect.value || !parkingGroupSelect.value;
}

async function fetchAccessRecords() {
  try {
    const response = await fetch('http://localhost:3000/user-group-parking-group-access', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) {
      throw new Error(`Помилка при отриманні зв’язків: ${response.status} ${response.statusText}`);
    }
    const accessRecords = await response.json();
    const userGroups = await fetch('http://localhost:3000/user-groups', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => res.json());
    const parkingGroups = await fetch('http://localhost:3000/parking-groups', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => res.json());

    const filteredRecords = role === 'parking_admin' 
      ? accessRecords.filter(record => parkingGroups.some(pg => pg.parking_group_id === record.parking_group_id && pg.parking_id === parseInt(parkingId)))
      : accessRecords;

    displayAccessRecords(filteredRecords, userGroups, parkingGroups);
  } catch (err) {
    console.error('Помилка при завантаженні зв’язків:', err);
    accessList.innerHTML = `<p class="text-danger">${t('fetch_access_error')}</p>`;
  }
}

async function displayAccessRecords(records, userGroups, parkingGroups) {
  if (records.length === 0) {
    accessList.innerHTML = `<p>${t('no_access_records_message')}</p>`;
    return;
  }
  accessList.innerHTML = records.map(record => {
    const userGroup = userGroups.find(ug => ug.group_id === record.group_id);
    const parkingGroup = parkingGroups.find(pg => pg.parking_group_id === record.parking_group_id);
    return `
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title" data-i18n="access_title">Зв’язок між групами</h5>
          <p class="card-text">${t('select_user_group_label')} ${userGroup ? userGroup.group_name : 'Невідома'} (ID: ${record.group_id})</p>
          <p class="card-text">${t('select_parking_group_label')} ${parkingGroup ? parkingGroup.group_name : 'Невідома'} (ID: ${record.parking_group_id})</p>
          <button class="btn btn-danger" onclick="deleteAccess(${record.group_id}, ${record.parking_group_id})" data-i18n="delete_button">Видалити зв’язок</button>
        </div>
      </div>
    `;
  }).join('');
  setLanguage(currentLang); // Оновлюємо переклад для динамічно створених елементів
}

createAccessBtn.addEventListener('click', async () => {
  const groupId = userGroupSelect.value;
  const parkingGroupId = parkingGroupSelect.value;
  if (!groupId || !parkingGroupId) {
    alert(t('select_both_groups_message'));
    return;
  }
  try {
    const response = await fetch('http://localhost:3000/user-group-parking-group-access', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ group_id: parseInt(groupId), parking_group_id: parseInt(parkingGroupId) }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Помилка при створенні зв’язку: ${response.status} ${response.statusText} - ${errorData.error}`);
    }
    userGroupSelect.value = '';
    parkingGroupSelect.value = '';
    createAccessBtn.disabled = true;
    fetchAccessRecords();
  } catch (err) {
    console.error('Помилка при створенні зв’язку:', err);
    alert(t('create_access_error'));
  }
});

window.deleteAccess = async (groupId, parkingGroupId) => {
  if (confirm(t('delete_access_confirmation'))) {
    try {
      const response = await fetch(`http://localhost:3000/user-group-parking-group-access/${groupId}/${parkingGroupId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Помилка при видаленні зв’язку: ${response.status} ${response.statusText} - ${errorData.error}`);
      }
      fetchAccessRecords();
    } catch (err) {
      console.error('Помилка при видаленні зв’язку:', err);
      alert(t('delete_access_error'));
    }
  }
};

userGroupSelect.addEventListener('change', updateCreateButtonState);
parkingGroupSelect.addEventListener('change', updateCreateButtonState);

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
loadAccessPage();
const userRole = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');
const backBtn = document.getElementById('backBtn');
const groupSelect = document.getElementById('groupSelect');
const spotNumberInput = document.getElementById('spotNumber');
const createSpotBtn = document.getElementById('createSpotBtn');
const spotsList = document.getElementById('spotsList');

let parkingId = null;
let role = null;

async function waitForI18n() {
  while (!i18nInitialized) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function loadParkingSpots() {
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
  fetchGroups();
}

async function fetchGroups() {
  try {
    const endpoint = role === 'parking_admin' 
      ? `http://localhost:3000/parking-groups/parking/${parkingId}`
      : 'http://localhost:3000/parking-groups';
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) {
      throw new Error(`Помилка при отриманні груп: ${response.status} ${response.statusText}`);
    }
    const groups = await response.json();
    groupSelect.innerHTML = `<option value="" data-i18n="select_group_option">${t('select_group_option')}</option>` + 
      groups.map(group => `<option value="${group.parking_group_id}">${group.group_name} (Parking ID: ${group.parking_id})</option>`).join('');
    setLanguage(currentLang); // Оновлюємо переклад для селекту
  } catch (err) {
    console.error('Помилка при завантаженні груп:', err);
    groupSelect.innerHTML = `<option value="">${t('fetch_groups_error_spots')}</option>`;
  }
}

async function fetchSpots() {
  const parkingGroupId = groupSelect.value;
  createSpotBtn.disabled = !parkingGroupId;
  spotsList.innerHTML = '';
  if (!parkingGroupId) return;
  try {
    const response = await fetch('http://localhost:3000/parking-spots', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) {
      throw new Error(`Помилка при отриманні паркомісць: ${response.status} ${response.statusText}`);
    }
    const spots = await response.json();
    const filteredSpots = spots.filter(spot => spot.parking_group_id === parseInt(parkingGroupId));
    displaySpots(filteredSpots);
  } catch (err) {
    console.error('Помилка при завантаженні паркомісць:', err);
    spotsList.innerHTML = `<p class="text-danger">${t('fetch_spots_error')}</p>`;
  }
}

async function displaySpots(spots) {
  if (spots.length === 0) {
    spotsList.innerHTML = `<p>${t('no_spots_message')}</p>`;
    return;
  }
  spotsList.innerHTML = spots.map(spot => `
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">${t('spot_number_label')}${spot.spot_number}</h5>
        <p class="card-text">${t('group_id_label')}${spot.spot_id}</p>
        <p class="card-text">${t('parking_id_label')}${spot.parking_group_id}</p>
        <p class="card-text">${t('is_occupied_label')}${spot.is_occupied ? t('yes_option') : t('no_option')}</p>
        <button class="btn btn-primary me-2" onclick="editSpot(${spot.spot_id})" data-i18n="edit_button">Редагувати</button>
        <button class="btn btn-danger me-2" onclick="deleteSpot(${spot.spot_id})" data-i18n="delete_button">Видалити</button>
        <div id="editForm-${spot.spot_id}" class="mt-2 hidden">
          <div class="input-group mb-2">
            <input type="text" id="editSpotNumber-${spot.spot_id}" class="form-control" value="${spot.spot_number}">
            <select id="editIsOccupied-${spot.spot_id}" class="form-select ms-2">
              <option value="false" ${!spot.is_occupied ? 'selected' : ''} data-i18n="no_option">Ні</option>
              <option value="true" ${spot.is_occupied ? 'selected' : ''} data-i18n="yes_option">Так</option>
            </select>
            <button class="btn btn-success ms-2" onclick="saveSpot(${spot.spot_id})" data-i18n="save_button">Зберегти</button>
            <button class="btn btn-secondary ms-2" onclick="hideEditForm(${spot.spot_id})" data-i18n="cancel_button">Скасувати</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  setLanguage(currentLang); // Оновлюємо переклад для динамічно створених елементів
}

createSpotBtn.addEventListener('click', async () => {
  const spotNumber = spotNumberInput.value.trim();
  const parkingGroupId = groupSelect.value;
  if (!spotNumber) {
    alert(t('enter_spot_number_message'));
    return;
  }
  try {
    const response = await fetch('http://localhost:3000/parking-spots', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ parking_group_id: parseInt(parkingGroupId), spot_number: spotNumber }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Помилка при створенні паркомісця: ${response.status} ${response.statusText} - ${errorData.error}`);
    }
    spotNumberInput.value = '';
    fetchSpots();
  } catch (err) {
    console.error('Помилка при створенні паркомісця:', err);
    alert(t('create_spot_error'));
  }
});

window.editSpot = (spotId) => {
  const form = document.getElementById(`editForm-${spotId}`);
  form.classList.remove('hidden');
};

window.hideEditForm = (spotId) => {
  const form = document.getElementById(`editForm-${spotId}`);
  form.classList.add('hidden');
};

window.saveSpot = async (spotId) => {
  const spotNumber = document.getElementById(`editSpotNumber-${spotId}`).value.trim();
  const isOccupied = document.getElementById(`editIsOccupied-${spotId}`).value === 'true';
  const parkingGroupId = groupSelect.value;
  if (!spotNumber) {
    alert(t('enter_spot_number_message'));
    return;
  }
  try {
    const response = await fetch(`http://localhost:3000/parking-spots/${spotId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ parking_group_id: parseInt(parkingGroupId), spot_number: spotNumber, is_occupied: isOccupied }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Помилка при оновленні паркомісця: ${response.status} ${response.statusText} - ${errorData.error}`);
    }
    hideEditForm(spotId);
    fetchSpots();
  } catch (err) {
    console.error('Помилка при оновленні паркомісця:', err);
    alert(t('update_spot_error'));
  }
};

window.deleteSpot = async (spotId) => {
  if (confirm(t('delete_spot_confirmation'))) {
    try {
      const response = await fetch(`http://localhost:3000/parking-spots/${spotId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Помилка при видаленні паркомісця: ${response.status} ${response.statusText} - ${errorData.error}`);
      }
      fetchSpots();
    } catch (err) {
      console.error('Помилка при видаленні паркомісця:', err);
      alert(t('delete_spot_error'));
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
loadParkingSpots();
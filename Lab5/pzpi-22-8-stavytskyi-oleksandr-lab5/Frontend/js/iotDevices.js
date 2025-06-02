const userRole = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');
const backBtn = document.getElementById('backBtn');
const spotSelect = document.getElementById('spotSelect');
const deviceUUIDInput = document.getElementById('deviceUUID');
const createDeviceBtn = document.getElementById('createDeviceBtn');
const devicesList = document.getElementById('devicesList');

let parkingId = null;
let role = null;

async function waitForI18n() {
  while (!i18nInitialized) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function loadIoTDevices() {
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
  fetchSpots();
}

async function fetchSpots() {
  try {
    const response = await fetch('http://localhost:3000/parking-spots', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) {
      throw new Error(`Помилка при отриманні паркомісць: ${response.status} ${response.statusText}`);
    }
    const spots = await response.json();
    const filteredSpots = role === 'parking_admin' 
      ? spots.filter(async spot => spot.parking_group_id && spot.parking_group_id in (await fetchGroups()).map(g => g.parking_group_id))
      : spots;
    spotSelect.innerHTML = `<option value="" data-i18n="select_spot_option">${t('select_spot_option')}</option>` + 
      filteredSpots.map(spot => `<option value="${spot.spot_id}">${t('spot_number_label')}${spot.spot_number} (ID: ${spot.spot_id})</option>`).join('');
    setLanguage(currentLang); // Оновлюємо переклад для селекту
  } catch (err) {
    console.error('Помилка при завантаженні паркомісць:', err);
    spotSelect.innerHTML = `<option value="">${t('fetch_spots_error_devices')}</option>`;
  }
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
    return await response.json();
  } catch (err) {
    console.error('Помилка при завантаженні груп:', err);
    return [];
  }
}

function updateDevices() {
  const spotId = spotSelect.value;
  createDeviceBtn.disabled = !spotId;
  if (spotId) {
    fetchDevices();
  } else {
    devicesList.innerHTML = '';
  }
}

async function fetchDevices() {
  try {
    const response = await fetch('http://localhost:3000/iot-devices', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    if (!response.ok) {
      throw new Error(`Помилка при отриманні IoT-пристроїв: ${response.status} ${response.statusText}`);
    }
    const devices = await response.json();
    const filteredDevices = devices.filter(device => device.spot_id === parseInt(spotSelect.value));
    displayDevices(filteredDevices);
  } catch (err) {
    console.error('Помилка при завантаженні IoT-пристроїв:', err);
    devicesList.innerHTML = `<p class="text-danger">${t('fetch_devices_error')}</p>`;
  }
}

async function displayDevices(devices) {
  if (devices.length === 0) {
    devicesList.innerHTML = `<p>${t('no_devices_message')}</p>`;
    return;
  }
  devicesList.innerHTML = devices.map(device => `
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">${t('device_uuid_label')}${device.device_uuid}</h5>
        <p class="card-text">${t('group_id_label')}${device.device_id}</p>
        <p class="card-text">${t('spot_id_label')}${device.spot_id}</p>
        <button class="btn btn-primary me-2" onclick="editDevice(${device.device_id})" data-i18n="edit_button">Редагувати</button>
        <button class="btn btn-danger me-2" onclick="deleteDevice(${device.device_id})" data-i18n="delete_button">Видалити</button>
        <div id="editForm-${device.device_id}" class="mt-2 hidden">
          <div class="input-group mb-2">
            <input type="text" id="editDeviceUUID-${device.device_id}" class="form-control" value="${device.device_uuid}">
            <select id="editSpotSelect-${device.device_id}" class="form-select ms-2">
              ${Array.from(document.getElementById('spotSelect').options).map(opt => 
                `<option value="${opt.value}" ${opt.value == device.spot_id ? 'selected' : ''}>${opt.text}</option>`).join('')}
            </select>
            <button class="btn btn-success ms-2" onclick="saveDevice(${device.device_id})" data-i18n="save_button">Зберегти</button>
            <button class="btn btn-secondary ms-2" onclick="hideEditForm(${device.device_id})" data-i18n="cancel_button">Скасувати</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  setLanguage(currentLang); // Оновлюємо переклад для динамічно створених елементів
}

createDeviceBtn.addEventListener('click', async () => {
  const deviceUUID = deviceUUIDInput.value.trim();
  const spotId = spotSelect.value;
  if (!deviceUUID || !spotId) {
    alert(t('enter_device_info_message'));
    return;
  }
  try {
    const response = await fetch('http://localhost:3000/iot-devices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_uuid: deviceUUID, spot_id: parseInt(spotId) }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Помилка при створенні IoT-пристрою: ${response.status} ${response.statusText} - ${errorData.error}`);
    }
    deviceUUIDInput.value = '';
    fetchDevices();
  } catch (err) {
    console.error('Помилка при створенні IoT-пристрою:', err);
    alert(t('create_device_error'));
  }
});

window.editDevice = (deviceId) => {
  const form = document.getElementById(`editForm-${deviceId}`);
  form.classList.remove('hidden');
};

window.hideEditForm = (deviceId) => {
  const form = document.getElementById(`editForm-${deviceId}`);
  form.classList.add('hidden');
};

window.saveDevice = async (deviceId) => {
  const deviceUUID = document.getElementById(`editDeviceUUID-${deviceId}`).value.trim();
  const spotId = document.getElementById(`editSpotSelect-${deviceId}`).value;
  if (!deviceUUID || !spotId) {
    alert(t('enter_device_info_message'));
    return;
  }
  try {
    const response = await fetch(`http://localhost:3000/iot-devices/${deviceId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_uuid: deviceUUID, spot_id: parseInt(spotId) }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Помилка при оновленні IoT-пристрою: ${response.status} ${response.statusText} - ${errorData.error}`);
    }
    hideEditForm(deviceId);
    fetchDevices();
  } catch (err) {
    console.error('Помилка при оновленні IoT-пристрою:', err);
    alert(t('update_device_error'));
  }
};

window.deleteDevice = async (deviceId) => {
  if (confirm(t('delete_device_confirmation'))) {
    try {
      const response = await fetch(`http://localhost:3000/iot-devices/${deviceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Помилка при видаленні IoT-пристрою: ${response.status} ${response.statusText} - ${errorData.error}`);
      }
      fetchDevices();
    } catch (err) {
      console.error('Помилка при видаленні IoT-пристрою:', err);
      alert(t('delete_device_error'));
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
loadIoTDevices();
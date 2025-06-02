const dashboardSection = document.getElementById('dashboard');
const userRole = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');
const backBtn = document.getElementById('backBtn');
const addParkingBtn = document.getElementById('addParkingBtn');
const addParkingForm = document.getElementById('addParkingForm');
const addParkingName = document.getElementById('addParkingName');
const addParkingAddress = document.getElementById('addParkingAddress');
const submitAddParkingBtn = document.getElementById('submitAddParkingBtn');
const cancelAddParkingBtn = document.getElementById('cancelAddParkingBtn');
const parkingsList = document.getElementById('parkingsList');

async function waitForI18n() {
  while (!i18nInitialized) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function loadParkings() {
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
  fetchParkings();
}

// Завантаження парковок
async function fetchParkings() {
  try {
    const parkings = await fetch('http://localhost:3000/parkings', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => res.json());
    parkingsList.innerHTML = parkings.map(parking => `
      <li class="list-group-item" id="parking-${parking.parking_id}">
        ${parking.name} - ${parking.address}
        <button class="btn btn-sm btn-warning ms-2" onclick="showEditForm(${parking.parking_id}, '${parking.name}', '${parking.address}')" data-i18n="edit_button">Редагувати</button>
        <button class="btn btn-sm btn-danger ms-2" onclick="deleteParking(${parking.parking_id})" data-i18n="delete_button">Видалити</button>
        <div id="editForm-${parking.parking_id}" class="mt-2 hidden">
          <div class="mb-2">
            <label for="editParkingName-${parking.parking_id}" class="form-label" data-i18n="parking_name_label">Назва парковки</label>
            <input type="text" class="form-control" id="editParkingName-${parking.parking_id}" value="${parking.name}">
          </div>
          <div class="mb-2">
            <label for="editParkingAddress-${parking.parking_id}" class="form-label" data-i18n="parking_address_label">Адреса парковки</label>
            <input type="text" class="form-control" id="editParkingAddress-${parking.parking_id}" value="${parking.address}">
          </div>
          <button class="btn btn-success" onclick="editParking(${parking.parking_id})" data-i18n="save_button">Зберегти</button>
          <button class="btn btn-secondary" onclick="hideEditForm(${parking.parking_id})" data-i18n="cancel_button">Скасувати</button>
        </div>
      </li>
    `).join('');
    setLanguage(currentLang); // Оновлюємо переклад для динамічно створених елементів
  } catch (err) {
    console.error('Помилка при завантаженні парковок:', err);
  }
}

// Показати форму додавання
addParkingBtn.addEventListener('click', () => {
  addParkingForm.classList.remove('hidden');
  addParkingBtn.classList.add('hidden');
});

// Скасувати додавання
cancelAddParkingBtn.addEventListener('click', () => {
  addParkingForm.classList.add('hidden');
  addParkingBtn.classList.remove('hidden');
  addParkingName.value = '';
  addParkingAddress.value = '';
});

// Додавання парковки
submitAddParkingBtn.addEventListener('click', async () => {
  const name = addParkingName.value;
  const address = addParkingAddress.value;
  if (name && address) {
    try {
      await fetch('http://localhost:3000/parkings', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address }),
      });
      addParkingForm.classList.add('hidden');
      addParkingBtn.classList.remove('hidden');
      addParkingName.value = '';
      addParkingAddress.value = '';
      fetchParkings();
    } catch (err) {
      alert(t('create_parking_error'));
    }
  } else {
    alert(t('fill_all_fields'));
  }
});

// Показати форму редагування
window.showEditForm = (parkingId, name, address) => {
  const editForm = document.getElementById(`editForm-${parkingId}`);
  editForm.classList.remove('hidden');
  document.getElementById(`parking-${parkingId}`).querySelector('button.btn-warning').classList.add('hidden');
};

// Приховати форму редагування
window.hideEditForm = (parkingId) => {
  const editForm = document.getElementById(`editForm-${parkingId}`);
  editForm.classList.add('hidden');
  document.getElementById(`parking-${parkingId}`).querySelector('button.btn-warning').classList.remove('hidden');
};

// Редагування парковки
window.editParking = async (parkingId) => {
  const name = document.getElementById(`editParkingName-${parkingId}`).value;
  const address = document.getElementById(`editParkingAddress-${parkingId}`).value;
  if (name && address) {
    try {
      await fetch(`http://localhost:3000/parkings/${parkingId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address }),
      });
      fetchParkings();
    } catch (err) {
      alert(t('edit_parking_error'));
    }
  } else {
    alert(t('fill_all_fields'));
  }
};

// Видалення парковки
window.deleteParking = async (parkingId) => {
  if (confirm(t('delete_confirmation'))) {
    try {
      await fetch(`http://localhost:3000/parkings/${parkingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchParkings();
    } catch (err) {
      alert(t('delete_parking_error'));
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
loadParkings();
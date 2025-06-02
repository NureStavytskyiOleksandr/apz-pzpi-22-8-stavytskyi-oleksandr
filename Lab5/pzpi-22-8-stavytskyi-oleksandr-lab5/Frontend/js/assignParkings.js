const dashboardSection = document.getElementById('dashboard');
const userRole = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');
const backBtn = document.getElementById('backBtn');
const parkingAdminsList = document.getElementById('parkingAdminsList');

let allParkings = [];

async function waitForI18n() {
  while (!i18nInitialized) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function loadAssignParkings() {
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
  fetchAllParkings();
  fetchParkingAdmins();
}

// Завантаження всіх парковок
async function fetchAllParkings() {
  try {
    const parkings = await fetch('http://localhost:3000/parkings', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => res.json());
    allParkings = parkings;
  } catch (err) {
    console.error('Помилка при завантаженні парковок:', err);
  }
}

// Завантаження адмінів парковок
async function fetchParkingAdmins() {
  try {
    const users = await fetch('http://localhost:3000/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => res.json());
    const parkingAdmins = users.filter(user => user.role === 'parking_admin');
    const parkingAdminsData = await Promise.all(
      parkingAdmins.map(async (admin) => {
        const assignedParkings = await fetch(`http://localhost:3000/parking-admins`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }).then(res => res.json());
        const adminParkings = assignedParkings.filter(pa => pa.user_id === admin.user_id);
        return { ...admin, assignedParkings: adminParkings };
      })
    );
    parkingAdminsList.innerHTML = parkingAdminsData.map(admin => `
      <li class="list-group-item" id="admin-${admin.user_id}">
        ${admin.username} (${admin.email})
        <button class="btn btn-sm btn-primary ms-2" onclick="showAssignForm(${admin.user_id})" data-i18n="add_parking_to_admin_button">Додати парковку</button>
        <div class="mt-2">
          <h6 data-i18n="assigned_parkings_label">Призначені парковки:</h6>
          <ul class="list-group mb-2">
            ${admin.assignedParkings.length > 0 ? admin.assignedParkings.map(pa => {
              const parking = allParkings.find(p => p.parking_id === pa.parking_id);
              return parking ? `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  ${parking.name} - ${parking.address}
                  <button class="btn btn-sm btn-danger" onclick="removeParking(${pa.parking_admin_id})" data-i18n="delete_button">Видалити</button>
                </li>
              ` : '';
            }).join('') : `<li class="list-group-item" data-i18n="no_assigned_parkings">Немає призначених парковок</li>`}
          </ul>
        </div>
        <div id="assignForm-${admin.user_id}" class="mt-2 hidden">
          <div class="mb-2">
            <label for="parkingSelect-${admin.user_id}" class="form-label" data-i18n="select_parking_label">Оберіть парковку</label>
            <select id="parkingSelect-${admin.user_id}" class="form-select">
              ${allParkings.map(parking => `<option value="${parking.parking_id}">${parking.name} - ${parking.address}</option>`).join('')}
            </select>
          </div>
          <button class="btn btn-success" onclick="assignParking(${admin.user_id})" data-i18n="save_button">Зберегти</button>
          <button class="btn btn-secondary" onclick="hideAssignForm(${admin.user_id})" data-i18n="cancel_button">Скасувати</button>
        </div>
      </li>
    `).join('');
    setLanguage(currentLang); // Оновлюємо переклад для динамічно створених елементів
  } catch (err) {
    console.error('Помилка при завантаженні адмінів:', err);
  }
}

// Показати форму призначення
window.showAssignForm = (userId) => {
  const assignForm = document.getElementById(`assignForm-${userId}`);
  assignForm.classList.remove('hidden');
  document.getElementById(`admin-${userId}`).querySelector('button.btn-primary').classList.add('hidden');
};

// Приховати форму призначення
window.hideAssignForm = (userId) => {
  const assignForm = document.getElementById(`assignForm-${userId}`);
  assignForm.classList.add('hidden');
  document.getElementById(`admin-${userId}`).querySelector('button.btn-primary').classList.remove('hidden');
};

// Призначення парковки
window.assignParking = async (userId) => {
  const parkingSelect = document.getElementById(`parkingSelect-${userId}`);
  const parkingId = parseInt(parkingSelect.value);
  try {
    await fetch('http://localhost:3000/parking-admins', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, parking_id: parkingId }),
    });
    hideAssignForm(userId);
    fetchParkingAdmins();
  } catch (err) {
    alert(t('assign_parking_error'));
  }
};

// Видалення призначення парковки
window.removeParking = async (parkingAdminId) => {
  if (confirm(t('remove_parking_confirmation'))) {
    try {
      await fetch(`http://localhost:3000/parking-admins/${parkingAdminId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchParkingAdmins();
    } catch (err) {
      alert(t('remove_parking_error'));
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
loadAssignParkings();
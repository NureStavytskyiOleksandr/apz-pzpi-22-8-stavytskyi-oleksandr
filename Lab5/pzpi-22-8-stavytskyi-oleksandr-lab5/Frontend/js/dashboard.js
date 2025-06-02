const dashboardSection = document.getElementById('dashboard');
const userRole = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');
const manageParkingsBtn = document.getElementById('manageParkingsBtn');
const manageUsersBtn = document.getElementById('manageUsersBtn');
const assignParkingsBtn = document.getElementById('assignParkingsBtn');
const createBackupBtn = document.getElementById('createBackupBtn');
const parkingSelect = document.getElementById('parkingSelect');
const viewStatsBtn = document.getElementById('viewStatsBtn');
const manageUserGroupsBtn = document.getElementById('manageUserGroupsBtn');
const manageParkingGroupsBtn = document.getElementById('manageParkingGroupsBtn');
const manageParkingSpotsBtn = document.getElementById('manageParkingSpotsBtn');
const manageIoTDevicesBtn = document.getElementById('manageIoTDevicesBtn');
const manageAccessBtn = document.getElementById('manageAccessBtn');

let userId = null;
let assignedParkings = [];
let allParkings = [];
let role = null;

async function waitForI18n() {
  while (!i18nInitialized) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function loadDashboard() {
  await waitForI18n();

  const token = localStorage.getItem('token');
  role = localStorage.getItem('role');
  if (!token || !role) {
    window.location.href = 'index.html';
    return;
  }
  if (role !== 'super_admin' && role !== 'parking_admin') {
    alert(t('access_denied'));
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = 'index.html';
    return;
  }
  userRole.textContent = `${t('role_label')} ${role}`;
  const decodedToken = JSON.parse(atob(token.split('.')[1]));
  userId = decodedToken.user_id;
  console.log('Роль користувача:', role);
  if (role === 'super_admin') {
    manageParkingsBtn.style.display = 'inline-block';
    manageUsersBtn.style.display = 'inline-block';
    assignParkingsBtn.style.display = 'inline-block';
    createBackupBtn.style.display = 'inline-block';
    viewStatsBtn.style.display = 'none';
    manageUserGroupsBtn.style.display = 'none';
    manageParkingGroupsBtn.style.display = 'none'; // Ховаємо для super_admin
    manageParkingSpotsBtn.style.display = 'none'; // Ховаємо для super_admin
    manageIoTDevicesBtn.style.display = 'none'; // Ховаємо для super_admin
    manageAccessBtn.style.display = 'none'; // Ховаємо для super_admin
    parkingSelect.classList.add('d-none');
  } else if (role === 'parking_admin') {
    manageParkingsBtn.style.display = 'none';
    manageUsersBtn.style.display = 'none';
    assignParkingsBtn.style.display = 'none';
    createBackupBtn.style.display = 'none';
    viewStatsBtn.style.display = 'inline-block';
    manageUserGroupsBtn.style.display = 'inline-block';
    manageParkingGroupsBtn.style.display = 'inline-block';
    manageParkingSpotsBtn.style.display = 'inline-block';
    manageIoTDevicesBtn.style.display = 'inline-block';
    manageAccessBtn.style.display = 'inline-block';
    parkingSelect.classList.remove('d-none');
    await fetchAssignedParkings();
  }
}

async function fetchAssignedParkings() {
  try {
    const assignedData = await fetch(`http://localhost:3000/parking-admins/user/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => {
      if (!res.ok) throw new Error('Помилка при отриманні призначених парковок');
      return res.json();
    });
    assignedParkings = assignedData;
    allParkings = await fetch('http://localhost:3000/parkings', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    }).then(res => res.json());
    parkingSelect.innerHTML = `<option value="" data-i18n="select_parking">${t('select_parking')}</option>` + 
      assignedParkings.map(pa => {
        const parking = allParkings.find(p => p.parking_id === pa.parking_id);
        return parking ? `<option value="${parking.parking_id}">${parking.name} - ${parking.address}</option>` : '';
      }).join('');
    setLanguage(currentLang);
    if (assignedParkings.length > 0) {
      parkingSelect.value = assignedParkings[0].parking_id;
      updateButtonState();
    }
  } catch (err) {
    console.error('Помилка при завантаженні парковок:', err);
  }
}

function switchParking() {
  updateButtonState();
}

function updateButtonState() {
  const hasSelectedParking = !!parkingSelect.value;
  viewStatsBtn.disabled = !hasSelectedParking;
  manageUserGroupsBtn.disabled = !hasSelectedParking;
  manageParkingGroupsBtn.disabled = !hasSelectedParking;
  manageParkingSpotsBtn.disabled = !hasSelectedParking;
  manageIoTDevicesBtn.disabled = !hasSelectedParking;
  manageAccessBtn.disabled = !hasSelectedParking;
}

viewStatsBtn.addEventListener('click', () => {
  const parkingId = parkingSelect.value;
  if (parkingId) {
    window.location.href = `parkingStats.html?parkingId=${parkingId}`;
  }
});

manageUserGroupsBtn.addEventListener('click', () => {
  const parkingId = parkingSelect.value;
  if (parkingId) {
    window.location.href = `userGroups.html?parkingId=${parkingId}`;
  }
});

manageParkingGroupsBtn.addEventListener('click', () => {
  const parkingId = parkingSelect.value;
  if (parkingId) {
    window.location.href = `parkingGroups.html?parkingId=${parkingId}`;
  } else if (role === 'super_admin') {
    window.location.href = 'parkingGroups.html';
  }
});

manageParkingSpotsBtn.addEventListener('click', () => {
  const parkingId = parkingSelect.value;
  if (parkingId) {
    window.location.href = `parkingSpots.html?parkingId=${parkingId}`;
  } else if (role === 'super_admin') {
    window.location.href = 'parkingSpots.html';
  }
});

manageIoTDevicesBtn.addEventListener('click', () => {
  const parkingId = parkingSelect.value;
  if (parkingId) {
    window.location.href = `iotDevices.html?parkingId=${parkingId}`;
  } else if (role === 'super_admin') {
    window.location.href = 'iotDevices.html';
  }
});

manageAccessBtn.addEventListener('click', () => {
  const parkingId = parkingSelect.value;
  if (parkingId) {
    window.location.href = `userGroupParkingGroupAccess.html?parkingId=${parkingId}`;
  } else if (role === 'super_admin') {
    window.location.href = 'userGroupParkingGroupAccess.html';
  }
});

manageParkingsBtn.addEventListener('click', () => {
  window.location.href = 'parkings.html';
});

manageUsersBtn.addEventListener('click', () => {
  window.location.href = 'users.html';
});

assignParkingsBtn.addEventListener('click', () => {
  window.location.href = 'assignParkings.html';
});

createBackupBtn.addEventListener('click', () => {
  window.location.href = 'backup.html';
});

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = 'index.html';
});

loadDashboard();
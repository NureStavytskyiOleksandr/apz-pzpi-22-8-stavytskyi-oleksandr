const dashboardSection = document.getElementById('dashboard');
const userRole = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');
const backBtn = document.getElementById('backBtn');
const createBackupBtn = document.getElementById('createBackupBtn');
const backupMessage = document.getElementById('backupMessage');

async function waitForI18n() {
  while (!i18nInitialized) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function loadBackup() {
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
}

// Створення бекапу
createBackupBtn.addEventListener('click', async () => {
  try {
    const response = await fetch('http://localhost:3000/backup/backup', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const data = await response.json();
    if (response.ok) {
      backupMessage.textContent = `${t('backup_success')}${data.fileName}`;
    } else {
      backupMessage.textContent = t('backup_error');
    }
  } catch (err) {
    backupMessage.textContent = t('server_error');
  }
});

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
loadBackup();
const userRole = document.getElementById('userRole');
const logoutBtn = document.getElementById('logoutBtn');
const backBtn = document.getElementById('backBtn');
const timeRange = document.getElementById('timeRange');
const fetchStatsBtn = document.getElementById('fetchStatsBtn');
const statsContent = document.getElementById('statsContent');

let parkingId = null;

async function waitForI18n() {
  while (!i18nInitialized) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function loadStats() {
  await waitForI18n();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (!token || !role || role !== 'parking_admin') {
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
}

fetchStatsBtn.addEventListener('click', async () => {
  const days = parseInt(timeRange.value);
  const now = new Date();
  const endTime = now.toISOString();
  const startTime = new Date(now.setDate(now.getDate() - days)).toISOString();

  try {
    // Запит на відсоток зайнятості
    const occupancyResponse = await fetch(`http://localhost:3000/parking-stats/${parkingId}/occupancy?start_time=${startTime}&end_time=${endTime}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const occupancyData = await occupancyResponse.json();

    // Запит на середню тривалість
    const durationResponse = await fetch(`http://localhost:3000/parking-stats/${parkingId}/average-duration?start_time=${startTime}&end_time=${endTime}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    const durationData = await durationResponse.json();

    if (!occupancyResponse.ok || !durationResponse.ok) {
      throw new Error(t('stats_error'));
    }

    statsContent.innerHTML = `
      <div class="card mt-4">
        <div class="card-body">
          <h5 class="card-title">${t('stats_for_parking')}${parkingId}</h5>
          <p class="card-text">${t('period_label')}${days}${t('days_label')}</p>
          <p class="card-text">${t('occupancy_rate_label')}${occupancyData.occupancy_rate}</p>
          <p class="card-text">${t('average_duration_label')}${durationData.average_duration_seconds}${t('seconds_label')}</p>
        </div>
      </div>
    `;
  } catch (err) {
    console.error('Помилка при завантаженні статистики:', err);
    statsContent.innerHTML = `<p class="text-danger">${t('stats_error')}</p>`;
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
loadStats();
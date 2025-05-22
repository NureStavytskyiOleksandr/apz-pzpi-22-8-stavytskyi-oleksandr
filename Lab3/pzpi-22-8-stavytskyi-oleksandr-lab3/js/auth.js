const API_BASE_URL = 'http://localhost:3000';

const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

// Перевірка авторизації
function checkAuth() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  if (token && role) {
    window.location.href = 'dashboard.html';
  }
}

// Обробка логіну
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      loginError.textContent = '';
      window.location.href = 'dashboard.html';
    } else {
      loginError.textContent = data.error || 'Помилка входу';
    }
  } catch (err) {
    loginError.textContent = 'Помилка сервера';
  }
});

// Ініціалізація
checkAuth();

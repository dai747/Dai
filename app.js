// Referensi elemen
const loginContainer = document.getElementById('login-container');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');

const appContainer = document.getElementById('app-container');
const currentUserSpan = document.getElementById('current-user');
const roleBadge = document.getElementById('role-badge');
const logoutBtn = document.getElementById('logout-btn');

const addPersonForm = document.getElementById('add-person-form');
const personNameInput = document.getElementById('person-name');
const peopleContainer = document.getElementById('people-container');

// Data user preset (plain password, untuk demo – jangan dipakai di production)
const users = {
  admin: { password: 'AdminRucoy', role: 'admin' },
  user: { password: 'user123', role: 'user' }
};

// State user saat ini
let currentUser = null;
let currentRole = null;

// Data orang, simpan di localStorage
let people = JSON.parse(localStorage.getItem('peopleList')) || [];

// Fungsi simpan data orang ke localStorage
function savePeople() {
  localStorage.setItem('peopleList', JSON.stringify(people));
}

// Urutkan nama alfabetik
function sortPeople() {
  people.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

// Kelompokkan orang per huruf A-Z, sisanya '#'
function groupPeople() {
  const groups = {};
  for (let c = 65; c <= 90; c++) {
    groups[String.fromCharCode(c)] = [];
  }
  groups['#'] = [];

  people.forEach(name => {
    if (!name) return;
    const firstChar = name.trim()[0].toUpperCase();
    if (firstChar >= 'A' && firstChar <= 'Z') groups[firstChar].push(name);
    else groups['#'].push(name);
  });

  return groups;
}

// Tampilkan atau sembunyikan form tambah orang jika admin
function updateAddFormVisibility() {
  addPersonForm.hidden = (currentRole !== 'admin');
}

// Toggle collapse daftar per huruf
function toggleGroup(e) {
  const header = e.currentTarget;
  const list = header.nextElementSibling;
  if (!list) return;
  const isCollapsed = list.classList.toggle('collapsed');
  header.setAttribute('aria-expanded', !isCollapsed);
  const arrow = header.querySelector('.arrow');
  arrow.textContent = isCollapsed ? '▸' : '▾';
}

// Render daftar orang dengan grup huruf
function renderPeople() {
  peopleContainer.innerHTML = '';
  if (people.length === 0) {
    const p = document.createElement('p');
    p.textContent = "Belum ada orang yang ditambahkan.";
    p.style.fontStyle = 'italic';
    peopleContainer.appendChild(p);
    return;
  }
  const groups = groupPeople();

  Object.keys(groups).sort().forEach(letter => {
    const names = groups[letter];
    if (names.length === 0) return;

    const groupDiv = document.createElement('section');
    groupDiv.className = 'letter-group';

    const header = document.createElement('div');
    header.className = 'letter-header';
    header.tabIndex = 0;
    header.setAttribute('role', 'button');
    header.setAttribute('aria-expanded', 'true');
    header.setAttribute('aria-controls', `list-${letter}`);
    header.addEventListener('click', toggleGroup);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleGroup(e);
      }
    });
    header.innerHTML = `<span><span class="arrow">▾</span> ${letter}</span><span>${names.length}</span>`;

    const ul = document.createElement('ul');
    ul.className = 'people-list';
    ul.id = `list-${letter}`;

    names.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;

      if (currentRole === 'admin') {
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Hapus';
        delBtn.setAttribute('aria-label', `Hapus ${name}`);
        delBtn.onclick = () => {
          if (confirm(`Yakin ingin menghapus "${name}"?`)) {
            const idx = people.indexOf(name);
            if (idx > -1) {
              people.splice(idx, 1);
              savePeople();
              renderPeople();
            }
          }
        };
        li.appendChild(delBtn);
      }

      ul.appendChild(li);
    });

    groupDiv.appendChild(header);
    groupDiv.appendChild(ul);
    peopleContainer.appendChild(groupDiv);
  });
}

// Login handler
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!(username in users)) {
    loginError.textContent = 'Username atau password salah.';
    loginError.style.display = 'block';
    return;
  }

  if (users[username].password !== password) {
    loginError.textContent = 'Username atau password salah.';
    loginError.style.display = 'block';
    return;
  }

  currentUser = username;
  currentRole = users[username].role;

  loginError.style.display = 'none';
  usernameInput.value = '';
  passwordInput.value = '';

  loginContainer.hidden = true;
  appContainer.hidden = false;

  currentUserSpan.textContent = currentUser;
  roleBadge.textContent = currentRole.toUpperCase();
  
  updateAddFormVisibility();
  renderPeople();
});

// Logout handler
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  currentRole = null;
  peopleContainer.innerHTML = '';
  addPersonForm.hidden = true;
  loginContainer.hidden = false;
  appContainer.hidden = true;
  loginError.style.display = 'none';
});

// Tambah nama orang (hanya admin)
addPersonForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = personNameInput.value.trim();
  if (name.length === 0) return;
  if (people.includes(name)) {
    alert('Nama sudah ada dalam daftar.');
    return;
  }
  people.push(name);
  sortPeople();
  savePeople();
  personNameInput.value = '';
  renderPeople();
});

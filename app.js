// ============================================================
// App — Prueba de Excel Clase 3
// ============================================================
const supabase = window.supabase.createClient(APP_CONFIG.SUPABASE_URL, APP_CONFIG.SUPABASE_ANON_KEY);

const screens = {
  loading: document.getElementById('screen-loading'),
  blocked: document.getElementById('screen-blocked'),
  instructions: document.getElementById('screen-instructions'),
  quiz: document.getElementById('screen-quiz'),
  done: document.getElementById('screen-done'),
  adminLogin: document.getElementById('screen-admin-login'),
  admin: document.getElementById('screen-admin'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

let currentIp = null;
let timerInterval = null;
let studentName = '';

// ------------------------------------------------------------
// 1) Obtener IP pública del visitante
// ------------------------------------------------------------
async function getPublicIp() {
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    const data = await res.json();
    return data.ip;
  } catch (e) {
    console.error('No se pudo obtener la IP pública', e);
    return 'desconocida-' + Math.random().toString(36).slice(2, 8);
  }
}

// ------------------------------------------------------------
// 2) Arranque: revisa si ya hay un intento local en curso o si el admin pide entrar
// ------------------------------------------------------------
init();

async function init() {
  if (location.hash === '#admin') {
    showScreen('adminLogin');
    return;
  }

  currentIp = await getPublicIp();

  // Si ya tiene un examen EN CURSO en este navegador (no enviado), lo retoma
  const saved = localStorage.getItem('quiz_session');
  if (saved) {
    const session = JSON.parse(saved);
    if (session.ip === currentIp && !session.submitted && Date.now() < session.endTime) {
      studentName = session.name;
      renderQuestions();
      showScreen('quiz');
      startTimer(session.endTime);
      return;
    }
    if (session.submitted) {
      showBlockedScreen({ nombre: session.name, fecha: session.fecha, puntaje_auto: session.autoScore });
      return;
    }
  }

  showScreen('instructions');
}

// ------------------------------------------------------------
// 3) Pantalla de instrucciones
// ------------------------------------------------------------
const inputName = document.getElementById('input-name');
const btnStart = document.getElementById('btn-start');

inputName.addEventListener('input', () => {
  btnStart.disabled = inputName.value.trim().length < 3;
});

document.getElementById('btn-admin-link').addEventListener('click', () => {
  location.hash = '#admin';
  showScreen('adminLogin');
});

btnStart.addEventListener('click', async () => {
  studentName = inputName.value.trim();
  btnStart.disabled = true;
  btnStart.textContent = 'Verificando...';

  // ¿Esta IP ya completó la prueba antes (en Supabase, no solo en este navegador)?
  const { data: existing, error } = await supabase
    .from('intentos')
    .select('nombre, fecha, puntaje_auto')
    .eq('ip', currentIp)
    .maybeSingle();

  if (existing) {
    showBlockedScreen(existing);
    return;
  }

  const endTime = Date.now() + APP_CONFIG.TIME_LIMIT_MINUTES * 60 * 1000;
  localStorage.setItem('quiz_session', JSON.stringify({
    ip: currentIp, name: studentName, endTime, submitted: false
  }));

  renderQuestions();
  showScreen('quiz');
  startTimer(endTime);
});

function showBlockedScreen(record) {
  document.getElementById('blocked-info').innerHTML = `
    <strong>${escapeHtml(record.nombre)}</strong><br>
    Enviada el ${new Date(record.fecha).toLocaleString('es-CR')}<br>
    Nota automática: ${record.puntaje_auto} / 80
  `;
  showScreen('blocked');
}

// ------------------------------------------------------------
// 4) Preguntas
// ------------------------------------------------------------
function renderQuestions() {
  document.getElementById('quiz-student-name').textContent = studentName;
  const container = document.getElementById('questions-container');
  container.innerHTML = '';

  QUIZ_QUESTIONS.forEach((item, idx) => {
    const card = document.createElement('div');
    card.className = 'qcard';
    card.innerHTML = `
      <div class="qhead">
        <div class="qicon">${item.icon}</div>
        <div>
          <div class="qnum">Pregunta ${idx + 1} de ${QUIZ_QUESTIONS.length}</div>
          <div class="qtext">${escapeHtml(item.q)}</div>
        </div>
      </div>
      <div class="options">
        ${item.options.map((opt, i) => `
          <label class="opt" data-qid="${item.id}" data-oi="${i}">
            <input type="radio" name="${item.id}" value="${i}" required>
            <span>${escapeHtml(opt)}</span>
          </label>
        `).join('')}
      </div>
    `;
    container.appendChild(card);
  });

  container.querySelectorAll('.opt').forEach(label => {
    label.addEventListener('click', () => {
      const qid = label.dataset.qid;
      container.querySelectorAll(`.opt[data-qid="${qid}"]`).forEach(l => l.classList.remove('checked'));
      label.classList.add('checked');
    });
  });

  document.getElementById('input-file').addEventListener('change', (e) => {
    const f = e.target.files[0];
    document.getElementById('file-chosen').textContent = f ? f.name : 'Ningún archivo seleccionado';
  });
}

// ------------------------------------------------------------
// 5) Cronómetro
// ------------------------------------------------------------
function startTimer(endTime) {
  const timerEl = document.getElementById('timer');
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) {
      clearInterval(timerInterval);
      timerEl.textContent = '00:00';
      submitQuiz(true);
      return;
    }
    const mins = Math.floor(remaining / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    timerEl.classList.toggle('warn', remaining < 5 * 60 * 1000);
  }, 1000);
}

// ------------------------------------------------------------
// 6) Envío de la prueba
// ------------------------------------------------------------
document.getElementById('quiz-form').addEventListener('submit', (e) => {
  e.preventDefault();
  submitQuiz(false);
});

let submitting = false;

async function submitQuiz(autoSubmitted) {
  if (submitting) return;
  submitting = true;
  clearInterval(timerInterval);

  const btn = document.getElementById('btn-submit');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  // Recolectar respuestas y calcular nota automática
  const respuestas = {};
  let autoScore = 0;
  QUIZ_QUESTIONS.forEach(item => {
    const checked = document.querySelector(`input[name="${item.id}"]:checked`);
    const chosen = checked ? parseInt(checked.value, 10) : null;
    respuestas[item.id] = chosen;
    if (chosen === item.correct) autoScore += POINTS_PER_QUESTION;
  });

  // Subir archivo del caso práctico, si lo adjuntaron
  let archivoUrl = null;
  let archivoNombre = null;
  const fileInput = document.getElementById('input-file');
  const file = fileInput.files[0];
  if (file) {
    archivoNombre = file.name;
    const path = `${currentIp}_${Date.now()}_${sanitizeFilename(file.name)}`;
    const { error: uploadError } = await supabase.storage
      .from(APP_CONFIG.STORAGE_BUCKET)
      .upload(path, file);
    if (!uploadError) {
      const { data: pub } = supabase.storage.from(APP_CONFIG.STORAGE_BUCKET).getPublicUrl(path);
      archivoUrl = pub.publicUrl;
    } else {
      console.error('Error subiendo archivo', uploadError);
    }
  }

  const comentario = document.getElementById('input-comment').value.trim();

  const { error } = await supabase.from('intentos').insert({
    nombre: studentName,
    ip: currentIp,
    respuestas,
    puntaje_auto: autoScore,
    comentario_estudiante: comentario || null,
    archivo_url: archivoUrl,
    archivo_nombre: archivoNombre,
    completado: true
  });

  if (error) {
    console.error(error);
    alert('Hubo un problema guardando tu prueba. Revisá tu conexión e intentá enviar de nuevo.');
    btn.disabled = false;
    btn.textContent = 'Enviar prueba';
    startTimer(JSON.parse(localStorage.getItem('quiz_session')).endTime);
    submitting = false;
    return;
  }

  const session = JSON.parse(localStorage.getItem('quiz_session') || '{}');
  session.submitted = true;
  session.autoScore = autoScore;
  session.fecha = new Date().toISOString();
  localStorage.setItem('quiz_session', JSON.stringify(session));

  document.getElementById('done-name').textContent = studentName;
  document.getElementById('done-auto').textContent = `${autoScore} / ${AUTO_TOTAL}`;
  showScreen('done');
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// PANEL DOCENTE (super usuario)
// ============================================================
document.getElementById('btn-admin-back').addEventListener('click', () => {
  location.hash = '';
  init();
});

document.getElementById('btn-admin-login').addEventListener('click', async () => {
  const email = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value;
  const errEl = document.getElementById('admin-login-error');
  errEl.textContent = '';

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    errEl.textContent = 'Correo o contraseña incorrectos.';
    return;
  }
  loadAdminDashboard();
});

document.getElementById('btn-admin-logout').addEventListener('click', async () => {
  await supabase.auth.signOut();
  location.hash = '';
  showScreen('instructions');
});

async function loadAdminDashboard() {
  showScreen('admin');
  const { data: rows, error } = await supabase
    .from('intentos')
    .select('*')
    .order('fecha', { ascending: false });

  if (error) {
    document.getElementById('admin-tbody').innerHTML = `<tr><td colspan="7">No se pudieron cargar los datos.</td></tr>`;
    return;
  }

  renderAdminStats(rows);
  renderAdminTable(rows);
}

function renderAdminStats(rows) {
  const total = rows.length;
  const avgAuto = total ? (rows.reduce((s, r) => s + r.puntaje_auto, 0) / total).toFixed(1) : '0';
  const pendientes = rows.filter(r => r.puntaje_manual === null).length;
  document.getElementById('admin-stats').innerHTML = `
    <div class="statchip"><strong>${total}</strong>Intentos registrados</div>
    <div class="statchip"><strong>${avgAuto}</strong>Promedio automático (/${AUTO_TOTAL})</div>
    <div class="statchip"><strong>${pendientes}</strong>Casos prácticos sin calificar</div>
  `;
}

function renderAdminTable(rows) {
  const tbody = document.getElementById('admin-tbody');
  tbody.innerHTML = rows.map(r => {
    const total = r.puntaje_manual === null ? '—' : (r.puntaje_auto + r.puntaje_manual);
    const fileCell = r.archivo_url
      ? `<a class="filelink" href="${r.archivo_url}" target="_blank" rel="noopener">${escapeHtml(r.archivo_nombre || 'archivo')}</a>`
      : '<span style="color:var(--sub)">Sin archivo</span>';
    return `
      <tr>
        <td>${escapeHtml(r.nombre)}</td>
        <td>${new Date(r.fecha).toLocaleString('es-CR')}</td>
        <td>${escapeHtml(r.ip)}</td>
        <td>${r.puntaje_auto} / ${AUTO_TOTAL}</td>
        <td>
          <input type="number" min="0" max="${CASE_STUDY_POINTS}" class="manualinput" value="${r.puntaje_manual ?? ''}" placeholder="/${CASE_STUDY_POINTS}" data-id="${r.id}">
        </td>
        <td><strong>${total}</strong></td>
        <td>${fileCell}</td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.manualinput').forEach(input => {
    input.addEventListener('change', async () => {
      const id = input.dataset.id;
      let val = input.value === '' ? null : Math.max(0, Math.min(CASE_STUDY_POINTS, parseInt(input.value, 10)));
      const { error } = await supabase.from('intentos').update({ puntaje_manual: val }).eq('id', id);
      if (error) {
        alert('No se pudo guardar la nota manual.');
      } else {
        loadAdminDashboard();
      }
    });
  });
}

document.getElementById('btn-export-csv').addEventListener('click', async () => {
  const { data: rows } = await supabase.from('intentos').select('*').order('fecha', { ascending: false });
  const header = ['Nombre', 'Fecha', 'IP', 'Automatico', 'CasoPractico', 'Total', 'Archivo'];
  const lines = [header.join(',')];
  rows.forEach(r => {
    const total = r.puntaje_manual === null ? '' : r.puntaje_auto + r.puntaje_manual;
    lines.push([
      `"${r.nombre}"`, new Date(r.fecha).toLocaleString('es-CR'), r.ip,
      r.puntaje_auto, r.puntaje_manual ?? '', total, r.archivo_url ?? ''
    ].join(','));
  });
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'resultados_clase3.csv'; a.click();
  URL.revokeObjectURL(url);
});

// Si ya hay sesión de Supabase Auth activa y entramos por #admin, saltar el login
supabase.auth.getSession().then(({ data }) => {
  if (location.hash === '#admin' && data.session) {
    loadAdminDashboard();
  }
});

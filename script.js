/* ============================================================
   COACHING PLATFORM — script.js
   Handles: login, dashboard, pdf viewer, security features
   ============================================================ */

'use strict';

/* ──────────────────────────────────────
   UTILITY HELPERS
   ────────────────────────────────────── */

/** Returns the current page filename */
const currentPage = () => window.location.pathname.split('/').pop() || 'index.html';

/** Simple session helpers (sessionStorage so it clears on tab close) */
const Session = {
  set (key, val) { sessionStorage.setItem(`cv_${key}`, JSON.stringify(val)); },
  get (key)      { try { return JSON.parse(sessionStorage.getItem(`cv_${key}`)); } catch { return null; } },
  remove (key)   { sessionStorage.removeItem(`cv_${key}`); },
  clear ()       { sessionStorage.clear(); }
};

/** Toast notification system */
function showToast (msg, type = '', duration = 3000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast${type ? ' toast-' + type : ''}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ──────────────────────────────────────
   AUTH GUARD — redirect if not logged in
   ────────────────────────────────────── */
function authGuard () {
  const page = currentPage();
  const protected_ = ['dashboard.html', 'viewer.html'];
  if (protected_.includes(page) && !Session.get('user')) {
    window.location.replace('index.html');
  }
  if (page === 'index.html' && Session.get('user')) {
    window.location.replace('dashboard.html');
  }
}
authGuard();

/* ──────────────────────────────────────
   SECURITY — global event blocks
   ────────────────────────────────────── */
function applySecurityLayer () {
  /* Disable right-click context menu */
  document.addEventListener('contextmenu', e => {
    e.preventDefault();
    showToast('⚠️ Right-click is disabled', 'warn');
  });

  /* Disable drag (content dragging) */
  document.addEventListener('dragstart', e => e.preventDefault());

  /* Block print screen key (best-effort, can't fully prevent OS screenshot) */
  document.addEventListener('keydown', e => {
    const blocked = [
      /* Ctrl+S, Ctrl+U, Ctrl+P, Ctrl+A, Ctrl+C on viewer */
      { ctrl: true, key: 's' },
      { ctrl: true, key: 'u' },
      { ctrl: true, key: 'p' },
      /* F12 dev tools */
      { ctrl: false, key: 'F12' },
      /* PrintScreen */
      { ctrl: false, key: 'PrintScreen' },
    ];

    const isBlocked = blocked.some(combo => {
      const ctrlMatch = combo.ctrl ? (e.ctrlKey || e.metaKey) : true;
      return ctrlMatch && e.key.toLowerCase() === combo.key.toLowerCase();
    });

    if (isBlocked) {
      e.preventDefault();
      showToast('⚠️ This action is restricted', 'warn');
    }
  });
}
applySecurityLayer();

/* ──────────────────────────────────────
   LOGIN PAGE LOGIC
   ────────────────────────────────────── */
function initLogin () {
  const form      = document.getElementById('loginForm');
  if (!form) return; // not on login page

  const emailInput  = document.getElementById('email');
  const pwdInput    = document.getElementById('password');
  const emailErr    = document.getElementById('emailErr');
  const pwdErr      = document.getElementById('pwdErr');
  const errBanner   = document.getElementById('errorBanner');
  const loginBtn    = document.getElementById('loginBtn');
  const btnSpinner  = document.getElementById('btnSpinner');
  const btnLabel    = document.getElementById('btnLabel');
  const btnArrow    = document.getElementById('btnArrow');
  const togglePwd   = document.getElementById('togglePwd');

  /* Demo credential */
  const DEMO_EMAIL = 'student@coachvault.com';
  const DEMO_PASS  = 'pass123';

  /* Toggle password visibility */
  togglePwd.addEventListener('click', () => {
    const isPass = pwdInput.type === 'password';
    pwdInput.type = isPass ? 'text' : 'password';
    togglePwd.innerHTML = isPass
      ? '<i class="ri-eye-line"></i>'
      : '<i class="ri-eye-off-line"></i>';
  });

  /* Inline validation helpers */
  function validateEmail (val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
  }
  function validatePassword (val) { return val.length >= 6; }

  emailInput.addEventListener('input', () => {
    if (validateEmail(emailInput.value)) {
      emailErr.classList.remove('visible');
      emailInput.style.borderColor = '';
    }
  });

  pwdInput.addEventListener('input', () => {
    if (validatePassword(pwdInput.value)) {
      pwdErr.classList.remove('visible');
      pwdInput.style.borderColor = '';
    }
  });

  /* Form submit */
  form.addEventListener('submit', async e => {
    e.preventDefault();
    let valid = true;

    /* Validate email */
    if (!validateEmail(emailInput.value)) {
      emailErr.classList.add('visible');
      emailInput.style.borderColor = 'var(--danger)';
      valid = false;
    }

    /* Validate password */
    if (!validatePassword(pwdInput.value)) {
      pwdErr.classList.add('visible');
      pwdInput.style.borderColor = 'var(--danger)';
      valid = false;
    }

    if (!valid) return;

    /* Show loading state */
    loginBtn.disabled = true;
    btnSpinner.style.display = 'block';
    btnLabel.textContent = 'Signing in…';
    btnArrow.style.display = 'none';
    errBanner.classList.remove('visible');




    /* Simulate async auth (replace with real API call) */
   const res = await fetch("http://10.131.96.240:5000/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email: emailInput.value,
    password: pwdInput.value
  })
});

const data = await res.json();

if (res.ok) {
  Session.set('user', data.user);
  Session.set('token', data.token);
  window.location.replace('dashboard.html');
} else {
  errBanner.classList.add('visible');
}




    // if (email === DEMO_EMAIL && pass === DEMO_PASS) {
    //   /* Success — store session */
    //   Session.set('user', { email, name: 'Student', initial: 'S' });
    //   btnLabel.textContent = 'Success! Redirecting…';
    //   setTimeout(() => window.location.replace('dashboard.html'), 600);
    // } else {
    //   /* Failure */
    //   errBanner.classList.add('visible');
    //   loginBtn.disabled = false;
    //   btnSpinner.style.display = 'none';
    //   btnLabel.textContent = 'Sign In';
    //   btnArrow.style.display = '';
    //   /* Shake the card */
    //   const card = document.querySelector('.login-card');
    //   card.style.animation = 'none';
    //   card.style.transform = 'translateX(-8px)';
    //   setTimeout(() => { card.style.transform = ''; }, 100);
    // }
  });
}

















/* ──────────────────────────────────────
   DASHBOARD PAGE LOGIC
   ────────────────────────────────────── */

/* Notes data — swap pdfUrl to real hosted PDF URLs */
let NOTES = [];

async function fetchNotes() {
  const res = await fetch("http://10.131.96.240:5000/notes");
  const data = await res.json();
  return data;
}



function initDashboard () {
  const grid           = document.getElementById('notesGrid');
  if (!grid) return; // not on dashboard

  const searchInput    = document.getElementById('searchInput');
  const filterChips    = document.getElementById('filterChips');
  const visibleBadge   = document.getElementById('visibleBadge');
  const logoutBtn      = document.getElementById('logoutBtn');
  const userAvatar     = document.getElementById('userAvatar');

  

  /* Set user avatar initial */
  const user = Session.get('user');
  if (user && userAvatar) {
    userAvatar.textContent = user.initial || 'S';
  }

  /* Logout */
  logoutBtn && logoutBtn.addEventListener('click', () => {
    Session.clear();
    window.location.replace('index.html');
  });

  let currentFilter = 'all';
  let currentSearch = '';

  /* Render cards */
async function renderNotes () {
  NOTES = await fetchNotes();



    visibleBadge.textContent = `${filtered.length} file${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-icon">📭</div>
          <p>No notes found for this search.</p>
        </div>`;
      return;
    }

function openNote(note) {
  Session.set("currentNote", note);
  window.location.href = "viewer.html";
}

    /* Store note data in session for viewer to pick up */
    grid.querySelectorAll('.note-card').forEach(card => {
      card.addEventListener('click', e => {
        e.preventDefault();
        const id   = parseInt(card.dataset.id);
        const note = NOTES.find(n => n.id === id);
        if (note) {
          Session.set('currentNote', note);
          window.location.href = `viewer.html?id=${id}`;
        }
      });
    });
  }

  /* Filter chips */
async function renderNotes () {
  NOTES = await fetchNotes();

  let filtered = NOTES.filter(n => {
    const matchFilter = currentFilter === 'all' || n.category === currentFilter;
    const matchSearch = n.title.toLowerCase().includes(currentSearch)
                     || n.category.toLowerCase().includes(currentSearch);
    return matchFilter && matchSearch;
  });

  visibleBadge.textContent = `${filtered.length} file${filtered.length !== 1 ? 's' : ''}`;

  if (filtered.length === 0) {
    grid.innerHTML = `<p>No notes found</p>`;
    return;
  }

  grid.innerHTML = filtered.map((note, i) => `
    <div class="note-card" data-id="${note._id}">
      <div class="card-title">${note.title}</div>
    </div>
  `).join('');

  grid.querySelectorAll('.note-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const note = NOTES.find(n => n._id === id);
      Session.set('currentNote', note);
      window.location.href = "viewer.html";
    });
  });
}

  /* Search */
  searchInput.addEventListener('input', () => {
    currentSearch = searchInput.value.toLowerCase().trim();
    renderNotes();
  });

  renderNotes();
}

/* ──────────────────────────────────────
   VIEWER PAGE LOGIC
   ────────────────────────────────────── */
function initViewer () {
  const pdfFrame       = document.getElementById('pdfFrame');
  if (!pdfFrame) return; // not on viewer

  const loaderScreen   = document.getElementById('loaderScreen');
  const blurOverlay    = document.getElementById('blurOverlay');
  const viewerFileName = document.getElementById('viewerFileName');
  const viewerFileSub  = document.getElementById('viewerFileSub');
  const watermarkLayer = document.getElementById('watermarkLayer');

  /* Get note from session */
  const note = Session.get('currentNote');
  if (!note) {
    /* No note selected, go back to dashboard */
    window.location.replace('dashboard.html');
    return;
  }

  /* Update nav info */
  viewerFileName.textContent = note.title;
  viewerFileSub.textContent  = `${note.category} · ${note.size} · ${note.pages} pages`;
  document.title = `CoachVault — ${note.title}`;

  /* ── Watermark tiling ── */
  const user = Session.get('user') || { email: 'student@coachvault.com' };
  const wmText = `CoachVault · ${user.email}`;

  function buildWatermarks () {
    watermarkLayer.innerHTML = '';
    const cols = Math.ceil(window.innerWidth  / 280) + 1;
    const rows = Math.ceil(window.innerHeight / 180) + 1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const span = document.createElement('span');
        span.className   = 'watermark-text';
        span.textContent = wmText;
        span.style.top   = `${r * 180 - 20}px`;
        span.style.left  = `${c * 280 - 40}px`;
        watermarkLayer.appendChild(span);
      }
    }
  }
  buildWatermarks();
  window.addEventListener('resize', buildWatermarks);

  /* ── Load PDF in iframe ── */
  /*
     Note: Browsers block iframe-level toolbar control for cross-origin PDFs.
     For production use PDF.js (https://mozilla.github.io/pdf.js/) to render
     PDFs in canvas — that fully prevents toolbar access and download.
     Here we use #toolbar=0&navpanes=0 params which work for same-origin or
     Google Drive embedded PDFs.
  */
  // const pdfSrc = `${note.fileUrl}#toolbar=0&navpanes=0&scrollbar=1&statusbar=0&messages=0&view=FitH`;
  const pdfSrc = `${note.fileUrl}#toolbar=0`;
  window.location.href = note.fileUrl;
  pdfFrame.src = note.fileUrl;
  pdfFrame.src = `https://docs.google.com/gview?embedded=true&url=${note.fileUrl}`;

  /* ── Show / hide loader ── */
  pdfFrame.addEventListener('load', () => {
    setTimeout(() => {
      loaderScreen.classList.add('hidden');
    }, 800); // slight extra delay so bar completes
  });

  /* Fallback: hide loader after 4 s regardless */
  setTimeout(() => loaderScreen.classList.add('hidden'), 4000);

  /* ── Tab visibility — blur content when user switches tabs ── */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      blurOverlay.classList.add('active');
    } else {
      blurOverlay.classList.remove('active');
    }
  });

  /* ── Extra iframe security: block pointer events to prevent right-click inside ── */
  /*
     We overlay the iframe with a transparent div so the iframe context menu
     cannot be reached directly. Scroll is still captured and passed through.
  */
  // const interceptor = document.createElement('div');
  // interceptor.style.cssText = `
  //   position: absolute; inset: 0; z-index: 10;
  //   background: transparent; cursor: default;
  // `;
  // pdfFrame.parentElement.style.position = 'relative';
  // pdfFrame.parentElement.appendChild(interceptor);

  interceptor.style.pointerEvents = "none";

  /* Allow scroll passthrough on desktop */
  interceptor.addEventListener('wheel', e => {
    pdfFrame.contentWindow && pdfFrame.contentWindow.scrollBy(0, e.deltaY);
  }, { passive: true });

  /* Show toast if user tries to right-click on overlay */
  interceptor.addEventListener('contextmenu', e => {
    e.preventDefault();
    showToast('⚠️ Content is protected', 'warn');
  });
}

/* ──────────────────────────────────────
   BOOT — initialise correct page
   ────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const page = currentPage();

  if (page === 'index.html' || page === '')  initLogin();
  if (page === 'dashboard.html')             initDashboard();
  if (page === 'viewer.html')                initViewer();
});






const user = Session.get('user');
const uploadBox = document.getElementById("uploadBox");

if (user && user.role !== "admin") {
  uploadBox.style.display = "none";
}


async function uploadNote() {
  const file = document.getElementById("fileInput").files[0];
  const formData = new FormData();

  formData.append("file", file);

  const res = await fetch("http://10.131.96.240:5000/upload", {
    method: "POST",
    headers: {
      authorization: Session.get("token")
    },
    body: formData
  });

  if (res.ok) {
    alert("Uploaded");
  } else {
    alert("Error");
  }

  if (res.ok) {
  alert("Uploaded");
  renderNotes(); // 🔥 refresh notes
}
}

document.getElementById("fileInput").addEventListener("change", function() {
  const fileName = this.files[0]?.name || "Choose PDF";
  document.querySelector(".upload-text").textContent = fileName;
});


// ===== SECURITY FEATURES =====

// Right click disable
document.addEventListener("contextmenu", e => e.preventDefault());

// Keyboard shortcuts block
document.addEventListener("keydown", e => {
  if (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'u')) {
    e.preventDefault();
  }

  // PrintScreen detect
  if (e.key === "PrintScreen") {
    alert("Screenshot not allowed");
  }
});

// Tab change blur
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    document.body.style.filter = "blur(10px)";
  } else {
    document.body.style.filter = "none";
  }
});
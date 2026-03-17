// ── RIPPLE ──
function ripple(e) {
  const el = e.currentTarget, r = el.getBoundingClientRect();
  const s = document.createElement('span'); s.className = 'rip';
  const sz = Math.max(r.width, r.height);
  s.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - r.left - sz / 2}px;top:${e.clientY - r.top - sz / 2}px`;
  el.appendChild(s); setTimeout(() => s.remove(), 700);
}
document.querySelectorAll('.rip-wrap').forEach(el => el.addEventListener('click', ripple));

// ── REVEAL ──
const obs = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) e.target.classList.add('vis');
}), { threshold: .1 });
document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

// ── DATA ──
let all = [], filt = 'tous';

const tmap = {
  eau:     { icon: '💧', lbl: "Fuite d'eau",  cls: 't-eau'     },
  lumiere: { icon: '💡', lbl: 'Lumière',       cls: 't-lumiere' },
  energie: { icon: '⚡', lbl: 'Énergie',       cls: 't-energie' },
  dechets: { icon: '♻️', lbl: 'Déchets',       cls: 't-dechets' },
  autre:   { icon: '📌', lbl: 'Autre',         cls: 't-autre'   },
};

// Fallback de détection côté client (mêmes règles que le backend, normalisé)
function normaliser(texte) {
  return (texte || '').toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function gt(d) {
  const n = normaliser(d);
  if (n.includes('eau') || n.includes('robinet') || n.includes('fuite'))                              return 'eau';
  if (n.includes('lumiere') || n.includes('eclairage') || n.includes('lampe') || n.includes('salle')) return 'lumiere';
  if (n.includes('energie') || n.includes('electricite') || n.includes('branche'))                    return 'energie';
  if (n.includes('dechet') || n.includes('poubelle') || n.includes('tri'))                            return 'dechets';
  return 'autre';
}

function getType(item) {
  // Priorité au type stocké en base, fallback sur détection par description
  if (item.type && tmap[item.type]) return item.type;
  return gt(item.description);
}

function fd(d) {
  if (!d) return '';
  const date = new Date(d);
  if (isNaN(date)) return '';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function escHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function toast(msg, type = 'g') {
  const el = document.getElementById('toast');
  document.getElementById('tmsg').textContent = msg;
  el.className = `toast t${type} show`;
  setTimeout(() => el.className = 'toast', 3500);
}

function majNavStats(data) {
  const n = data.filter(x => x.statut === 'nouveau').length;
  const c = data.filter(x => x.statut === 'en_cours').length;
  const d = data.filter(x => x.statut === 'traité').length;
  document.getElementById('s-t').textContent = data.length;
  document.getElementById('s-n').textContent = n;
  document.getElementById('s-c').textContent = c;
  document.getElementById('s-d').textContent = d;
  const total = data.length;
  document.getElementById('ccnt').textContent = total + (total > 1 ? ' signalements' : ' signalement');
}

// ── SPINNER LISTE ──
function showListeSpinner() {
  document.getElementById('liste').innerHTML = `
    <div class="empty">
      <div class="liste-spinner"></div>
      <p>Chargement…</p>
    </div>`;
}

// ── RENDER ──
function render(data) {
  const liste = document.getElementById('liste');
  const fd2 = filt === 'tous' ? data : data.filter(x => x.statut === filt);

  if (!fd2.length) {
    liste.innerHTML = `
      <div class="empty">
        <div class="empty-i">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity=".35">
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
          </svg>
        </div>
        <p>${filt !== 'tous'
          ? 'Aucun signalement avec ce statut.'
          : 'Aucun signalement pour l\'instant.<br><span class="empty-hint">Soyez le premier à signaler un problème !</span>'}</p>
      </div>`;
    return;
  }

  liste.innerHTML = fd2.map(item => {
    const t   = tmap[getType(item)];
    const st  = item.statut || 'nouveau';
    const dc  = st === 'traité' ? 'dt' : st === 'en_cours' ? 'dc' : 'dn';
    const tc  = st === 'traité' ? 'stt' : st === 'en_cours' ? 'stc' : 'stn';
    const tl  = st === 'traité' ? '✅ Traité' : st === 'en_cours' ? '🔵 En cours' : '🟡 Nouveau';
    const dateStr = fd(item.date_creation || item.created_at);

    const acts = st === 'traité'
      ? `<span class="resolved-lbl">✅ Résolu</span>`
      : st === 'en_cours'
      ? `<button class="btn btn-sm btn-ok rip-wrap" onclick="chSt(${item.id},'traité',event)">✅ Marquer traité</button>`
      : `<button class="btn btn-sm btn-blue rip-wrap" onclick="chSt(${item.id},'en_cours',event)">🔵 En cours</button>
         <button class="btn btn-sm btn-ok rip-wrap"  onclick="chSt(${item.id},'traité',event)">✅ Traité</button>`;

    return `<div class="sitem" id="si-${item.id}">
      <div class="sdot ${dc}"></div>
      <div class="sbdy">
        <div class="stop2">
          <div class="sdesc">${escHtml(item.description)}</div>
          <span class="sdate">${dateStr}</span>
        </div>
        <div class="smeta">
          <span class="tag ${t.cls}">${t.icon} ${t.lbl}</span>
          <span class="stag ${tc}">${tl}</span>
          ${item.anonyme ? `<span class="tag t-autre tag-anon">👤 Anonyme</span>` : ''}
        </div>
        ${item.suggestion ? `<div class="ssug">💡 ${escHtml(item.suggestion)}</div>` : ''}
        <div class="sact">${acts}</div>
      </div>
    </div>`;
  }).join('');

  document.querySelectorAll('.rip-wrap').forEach(el => {
    el.removeEventListener('click', ripple);
    el.addEventListener('click', ripple);
  });
}

function filtrer(v, btn) {
  filt = v;
  document.querySelectorAll('.fbtn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render(all);
}

// ── CHARGER LA LISTE ──
async function charger(showSpinner = false) {
  if (showSpinner) showListeSpinner();
  try {
    const res  = await fetch('/signalements');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    all = Array.isArray(data) ? data : [];
    majNavStats(all);
    render(all);
  } catch (err) {
    console.error('Erreur chargement:', err.message);
    document.getElementById('liste').innerHTML = `
      <div class="empty">
        <div class="empty-i" style="font-size:2rem;opacity:.4">⚠️</div>
        <p>Impossible de contacter le serveur.<br>
        <button onclick="charger(true)" class="btn-retry">🔄 Réessayer</button></p>
      </div>`;
  }
}

// ── SOUMETTRE ──
async function ajouter(e) {
  const desc    = document.getElementById('desc').value.trim();
  const anonyme = document.getElementById('anonyme').checked;
  const type    = document.getElementById('type').value;

  if (!desc) { toast('Veuillez décrire le problème ⚠️', 'w'); return; }

  const btn  = document.getElementById('sbtn');
  const bico = document.getElementById('bico');
  const blbl = document.getElementById('blbl');

  btn.disabled = true;
  bico.innerHTML = '<div class="spin"></div>';
  blbl.textContent = 'Envoi en cours…';

  try {
    const res = await fetch('/signalement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: desc, anonyme, type })
    });

    const data = await res.json();

    if (!res.ok) {
      toast(data.error || 'Erreur lors de l\'envoi ❌', 'r');
      return;
    }

    document.getElementById('sugtxt').textContent = data.suggestion || '';
    document.getElementById('sugbox').classList.add('show');
    document.getElementById('desc').value = '';
    document.getElementById('anonyme').checked = false;
    document.getElementById('type').value = 'eau';
    document.getElementById('blbl').textContent = 'Envoyer le signalement';

    toast(anonyme ? 'Signalement anonyme envoyé ✅' : 'Signalement envoyé ✅', 'g');
    await charger();
    await chargerStats();

    setTimeout(() => document.getElementById('sugbox').classList.remove('show'), 7000);
  } catch (err) {
    toast('Erreur réseau — serveur inaccessible ❌', 'r');
  } finally {
    btn.disabled = false;
    bico.textContent = '➕';
    blbl.textContent = 'Envoyer le signalement';
  }
}

// ── CHANGER STATUT ──
async function chSt(id, st, e) {
  try {
    const res = await fetch(`/signalement/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: st })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Erreur');
    }
    toast(st === 'traité' ? '✅ Marqué comme traité !' : '🔵 Passé en cours', 'g');
    await charger();
    await chargerStats();
  } catch (err) {
    toast('Erreur lors de la mise à jour ❌', 'r');
  }
}

// ── CHECKBOX LABEL ──
document.getElementById('anonyme').addEventListener('change', function () {
  document.getElementById('blbl').textContent =
    this.checked ? 'Envoyer anonymement' : 'Envoyer le signalement';
});

// ── STATS ──
let statsChart = null;

async function chargerStats() {
  try {
    const res = await fetch('/stats');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = await res.json();

    document.getElementById('stat-total').textContent   = d.total;
    document.getElementById('stat-nouveau').textContent = d.par_statut.nouveau;
    document.getElementById('stat-encours').textContent = d.par_statut.en_cours;
    document.getElementById('stat-traite').textContent  = d.par_statut.traite;
    document.getElementById('stat-taux').textContent    = d.taux_resolution + ' %';
    document.getElementById('stat-progress-bar').style.width = d.taux_resolution + '%';

    const labels   = ['💧 Eau', '💡 Lumière', '⚡ Énergie', '♻️ Déchets', '📌 Autre'];
    const values   = [d.par_type.eau, d.par_type.lumiere, d.par_type.energie, d.par_type.dechets, d.par_type.autre];
    const bgColors = ['#BAE6FD', '#FEF3C7', '#FDE68A', '#DCFCE7', '#F3F4F6'];
    const bdColors = ['#0284C7', '#D97706', '#B45309', '#16A34A', '#9CA3AF'];

    if (statsChart) {
      statsChart.data.datasets[0].data = values;
      statsChart.update();
    } else {
      const ctx = document.getElementById('statsChart').getContext('2d');
      statsChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: bgColors,
            borderColor: bdColors,
            borderWidth: 1.5,
            borderRadius: 6,
            borderSkipped: false,
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => ` ${ctx.parsed.y} signalement${ctx.parsed.y > 1 ? 's' : ''}`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { stepSize: 1, font: { family: 'Inter', size: 11 }, color: '#64748B' },
              grid: { color: '#E5E7EB' },
              border: { display: false }
            },
            x: {
              ticks: { font: { family: 'Inter', size: 11 }, color: '#374151' },
              grid: { display: false },
              border: { display: false }
            }
          }
        }
      });
    }
  } catch (err) {
    console.error('[chargerStats] Erreur:', err.message);
  }
}

// ── INITIALISATION ──
charger(true);
chargerStats();

// Rafraîchissement auto toutes les 60s (réduit de 30s)
setInterval(() => charger(), 60000);
setInterval(() => chargerStats(), 60000);

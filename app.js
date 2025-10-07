// Vanilla JS for language, fake data, KPIs, canvas chart, and simple animations

// ---- Language ----
const langSelect = document.getElementById('langSelect');
const storedLang = localStorage.getItem('lang') || 'sr_lat';
langSelect.value = storedLang;
applyLanguage(storedLang);
langSelect.addEventListener('change', (e) => {
  const lang = e.target.value;
  localStorage.setItem('lang', lang);
  applyLanguage(lang);
});

function applyLanguage(lang) {
  const dict = window.i18n[lang] || window.i18n.sr_lat;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  document.documentElement.lang = (lang === 'sr_cyr') ? 'sr' : lang.split('_')[0];
}

// ---- Fake data (replace with real API later) ----
const financeData = {
  goalByDec2025: 450000, // EUR
  totalDonations: 182350,
  costs: [
    { label: "Kupovina placa", amount: 120000 },
    { label: "Dozvole i projekat", amount: 14500 },
    { label: "Pripremni radovi", amount: 8900 },
    { label: "Ugovori i takse", amount: 7400 }
  ],
  donations: [
    // YYYY-MM for chart (last 12 months)
    { month: "2024-11", amount: 12000 },
    { month: "2024-12", amount: 14500 },
    { month: "2025-01", amount: 9800 },
    { month: "2025-02", amount: 11200 },
    { month: "2025-03", amount: 13750 },
    { month: "2025-04", amount: 15600 },
    { month: "2025-05", amount: 14650 },
    { month: "2025-06", amount: 12200 },
    { month: "2025-07", amount: 13100 },
    { month: "2025-08", amount: 14250 },
    { month: "2025-09", amount: 12800 },
    { month: "2025-10", amount: 15900 }
  ],
  transactions: [
    // Recent donations (this month/week)
    { date: "2025-10-01", donor: "Anonimno", amount: 1200 },
    { date: "2025-10-03", donor: "Porodica Marković", amount: 500 },
    { date: "2025-10-05", donor: "Anonimno", amount: 2500 },
    { date: "2025-10-06", donor: "Ivana i Luka", amount: 300 },
    { date: "2025-10-07", donor: "Anonimno", amount: 800 }
  ]
};

// ---- Helpers ----
const euro = (n) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const parseISO = (s) => new Date(s + "T00:00:00");

function isSameISOWeek(d1, d2) {
  // ISO week calc
  const date = new Date(d1.valueOf());
  const dayNum = (d => (d.getDay() || 7))(date);
  date.setDate(date.getDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getFullYear(),0,1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1)/7);
  const date2 = new Date(d2.valueOf());
  const dayNum2 = (d => (d.getDay() || 7))(date2);
  date2.setDate(date2.getDate() + 4 - dayNum2);
  const yearStart2 = new Date(Date.UTC(date2.getFullYear(),0,1));
  const weekNo2 = Math.ceil((((date2 - yearStart2) / 86400000) + 1)/7);
  return (weekNo === weekNo2) && (date.getFullYear() === date2.getFullYear());
}

// ---- KPIs ----
function renderKPIs() {
  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0,7);
  const monthSum = financeData.transactions
    .filter(t => t.date.slice(0,7) === currentMonthStr)
    .reduce((a,b) => a + b.amount, 0);

  const weekSum = financeData.transactions
    .filter(t => isSameISOWeek(parseISO(t.date), now))
    .reduce((a,b) => a + b.amount, 0);

  const costsTotal = financeData.costs.reduce((a,b) => a + b.amount, 0);
  const total = financeData.totalDonations;
  const goal = financeData.goalByDec2025;
  const gap = Math.max(goal - total, 0);
  const pct = Math.min(100, Math.round(total/goal*100));

  document.getElementById('kpiTotal').textContent = euro(total);
  document.getElementById('kpiMonth').textContent = euro(monthSum);
  document.getElementById('kpiWeek').textContent = euro(weekSum);
  document.getElementById('kpiCosts').textContent = euro(costsTotal);
  document.getElementById('goalBadge').textContent = euro(goal);
  document.getElementById('progressPct').textContent = pct + "%";
  document.getElementById('goalValue').textContent = euro(goal);
  document.getElementById('gapValue').textContent = euro(gap);

  // Animate bar
  const bar = document.getElementById('barFill');
  requestAnimationFrame(() => { bar.style.width = pct + "%"; });
}
renderKPIs();

// ---- Lists ----
function renderLists() {
  const now = new Date();
  const thisMonth = now.toISOString().slice(0,7);

  const monthList = document.getElementById('monthList');
  const weekList = document.getElementById('weekList');
  const costsList = document.getElementById('costsList');
  monthList.innerHTML = "";
  weekList.innerHTML = "";
  costsList.innerHTML = "";

  financeData.transactions
    .filter(t => t.date.slice(0,7) === thisMonth)
    .sort((a,b)=> b.date.localeCompare(a.date))
    .forEach(t => {
      const li = document.createElement('li');
      li.textContent = `${t.date} — ${t.donor} — ${euro(t.amount)}`;
      monthList.appendChild(li);
      if (isSameISOWeek(parseISO(t.date), now)) {
        weekList.appendChild(li.cloneNode(true));
      }
    });

  financeData.costs.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.label} — ${euro(c.amount)}`;
    costsList.appendChild(li);
  });
}
renderLists();


// ---- Responsive Canvas ----
function resizeCanvas(){
  const canvas = document.getElementById('donationsChart');
  if(!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  // Ensure CSS width is respected; height is proportional
  const rect = canvas.getBoundingClientRect();
  const targetWidth = Math.max(320, rect.width); // fallback min
  const targetHeightCss = Math.max(180, Math.min(360, targetWidth * 0.45)); // 45% of width, clamped
  // Set the CSS height to keep layout stable
  canvas.style.height = targetHeightCss + 'px';
  // Set internal pixel buffer with DPR for crisp lines
  canvas.width = Math.floor(targetWidth * dpr);
  canvas.height = Math.floor(targetHeightCss * dpr);
}

function debounce(fn, ms){let t;return function(){clearTimeout(t);t=setTimeout(()=>fn.apply(this, arguments), ms);}}
window.addEventListener('resize', debounce(()=>{ resizeCanvas(); resizeCanvas();
drawChart(); }, 120));

// ---- Chart (vanilla canvas) ----
function drawChart() {
  resizeCanvas();
  const canvas = document.getElementById('donationsChart');
  const ctx = canvas.getContext('2d');
  const padding = { top: 20, right: 20, bottom: 36, left: 48 };
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0,0,w,h);

  const months = financeData.donations.map(d => d.month);
  const values = financeData.donations.map(d => d.amount);
  const maxVal = Math.max(...values) * 1.2;
  const barW = (w - padding.left - padding.right) / values.length * 0.6;

  // Axes
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, h - padding.bottom);
  ctx.lineTo(w - padding.right, h - padding.bottom);
  ctx.stroke();

  // Y grid & labels
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "12px Inter, sans-serif";
  const steps = 4;
  for (let i=0; i<=steps; i++){
    const y = h - padding.bottom - (i/steps)*(h - padding.top - padding.bottom);
    const val = Math.round((i/steps)*maxVal);
    ctx.fillText(euro(val), 6, y+4);
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(w - padding.right, y); ctx.stroke();
  }

  // Bars with simple animation
  months.forEach((m, idx) => {
    const xCenter = padding.left + (idx + 0.5) * ((w - padding.left - padding.right) / months.length);
    const x = xCenter - barW/2;
    const targetH = (values[idx]/maxVal) * (h - padding.top - padding.bottom);
    let cur = 0;
    const step = () => {
      ctx.fillStyle = "rgba(201,162,39,0.9)";
      ctx.fillRect(x, h - padding.bottom - cur, barW, cur);
      if (cur < targetH) {
        cur += Math.max(1, targetH/20);
        requestAnimationFrame(step);
      } else {
        // draw value label
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText(euro(values[idx]), x, h - padding.bottom - targetH - 6);
      }
    };
    step();

    // X labels
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "11px Inter, sans-serif";
    const label = m.slice(5) + "." + m.slice(2,4);
    ctx.fillText(label, xCenter - 12, h - padding.bottom + 16);
  });
}
resizeCanvas();
drawChart();

// ---- Static info ----
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('parishAddress').textContent = "Beispielstraße 1, 5020 Salzburg";
document.getElementById('parishBank').textContent = "Raiffeisenbank Salzburg";
document.getElementById('iban').textContent = "AT61 1904 3002 3457 3201";
document.getElementById('bic').textContent = "RZOOAT2L";

// ---- Contact form (dummy) ----
document.getElementById('contactForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const status = document.getElementById('formStatus');
  status.textContent = "Hvala! Poruka je zabeležena (demo).";
  e.target.reset();
});

// ---- Reveal animations (IntersectionObserver) ----
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('reveal');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.card, .section h2, .kpi, .hero-text').forEach(el => {
  el.classList.add('will-reveal'); observer.observe(el);
});

// Minimal styles for reveal (append to head)
const style = document.createElement('style');
style.textContent = `.will-reveal{opacity:0;transform:translateY(8px);transition:.6s ease}
.reveal{opacity:1;transform:none}`;
document.head.appendChild(style);

// ---- Theme toggle ----
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  const currentTheme = localStorage.getItem('theme') || 'dark';
  setTheme(currentTheme);

  themeToggle.addEventListener('click', () => {
    const newTheme = (document.documentElement.dataset.theme === 'dark') ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  });

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeToggle.textContent = (theme === 'light') ? '🌙' : '☀️';
    document.body.style.background = (theme === 'light') ? '#fafafa' : 'var(--bg)';
    document.body.style.color = (theme === 'light') ? '#111' : 'var(--text)';
  }
}
// ---- Compact mobile menu ----
const menuBtn = document.getElementById('menuToggle');
const navEl = document.getElementById('nav');
if (menuBtn && navEl){
  const closeMenu = () => { navEl.classList.remove('open'); menuBtn.setAttribute('aria-expanded','false'); };
  menuBtn.addEventListener('click', () => {
    const isOpen = navEl.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
  // zatvori kada klikneš link
  navEl.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  // zatvori na scroll
  window.addEventListener('scroll', closeMenu, { passive:true });
}
// ---- Chart lightbox (click to enlarge) ----
const smallCanvas = document.getElementById('donationsChart');
const lb = document.getElementById('lightbox');
const lbImg = document.getElementById('lightboxImg');
const lbClose = document.getElementById('lightboxClose');

function openLightboxFromCanvas(cnv){
  try{
    const dataURL = cnv.toDataURL('image/png');
    lbImg.src = dataURL;
    lb.classList.add('show');
    lb.setAttribute('aria-hidden','false');
  }catch(e){ /* some browsers block if empty canvas */ }
}

if (smallCanvas && lb){
  smallCanvas.style.cursor = 'zoom-in';
  smallCanvas.addEventListener('click', ()=>openLightboxFromCanvas(smallCanvas));
  lb.addEventListener('click', (e)=>{ if (e.target===lb || e.target.classList.contains('lightbox-backdrop')) lb.classList.remove('show'); });
  lbClose.addEventListener('click', ()=> lb.classList.remove('show'));
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') lb.classList.remove('show'); });
}

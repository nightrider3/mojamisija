// ===============================
// Language (i18n)
// ===============================
const langSelect = document.getElementById('langSelect');
const storedLang = localStorage.getItem('lang') || 'sr_lat';
if (langSelect) {
  langSelect.value = storedLang;
  applyLanguage(storedLang);
  langSelect.addEventListener('change', (e) => {
    const lang = e.target.value;
    localStorage.setItem('lang', lang);
    applyLanguage(lang);
  });
}
function applyLanguage(lang) {
  const dict = (window.i18n && window.i18n[lang]) || (window.i18n && window.i18n.sr_lat) || {};
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
  document.documentElement.lang = (lang === 'sr_cyr') ? 'sr' : (lang || 'sr').split('_')[0];
}

// ===============================
// Demo podaci + helperi
// ===============================
const financeData = {
  goalByDec2025: 450000,
  totalDonations: 182350,
  costs: [
    { label: "Kupovina placa", amount: 120000 },
    { label: "Dozvole i projekat", amount: 14500 },
    { label: "Pripremni radovi", amount: 8900 },
    { label: "Ugovori i takse", amount: 7400 }
  ],
  donations: [
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
    { date: "2025-10-01", donor: "Anonimno", amount: 1200 },
    { date: "2025-10-03", donor: "Porodica Marković", amount: 500 },
    { date: "2025-10-05", donor: "Anonimno", amount: 2500 },
    { date: "2025-10-06", donor: "Ivana i Luka", amount: 300 },
    { date: "2025-10-07", donor: "Anonimno", amount: 800 }
  ]
};
const euro = (n) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
const parseISO = (s) => new Date(s + "T00:00:00");

// ===============================
// ISO sedmica helper
// ===============================
function isSameISOWeek(d1, d2) {
  const date = new Date(d1.valueOf());
  const dayNum = (d => (d.getDay() || 7))(date);
  date.setDate(date.getDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getFullYear(), 0, 1));
  const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);

  const date2 = new Date(d2.valueOf());
  const dayNum2 = (d => (d.getDay() || 7))(date2);
  date2.setDate(date2.getDate() + 4 - dayNum2);
  const yearStart2 = new Date(Date.UTC(date2.getFullYear(), 0, 1));
  const weekNo2 = Math.ceil((((date2 - yearStart2) / 86400000) + 1) / 7);

  return (weekNo === weekNo2) && (date.getFullYear() === date2.getFullYear());
}

// ===============================
// KPI-i i liste
// ===============================
function renderKPIs() {
  const now = new Date();
  const currentMonthStr = now.toISOString().slice(0, 7);

  const monthSum = financeData.transactions
    .filter(t => t.date.slice(0, 7) === currentMonthStr)
    .reduce((a, b) => a + b.amount, 0);

  const weekSum = financeData.transactions
    .filter(t => isSameISOWeek(parseISO(t.date), now))
    .reduce((a, b) => a + b.amount, 0);

  const costsTotal = financeData.costs.reduce((a, b) => a + b.amount, 0);
  const total = financeData.totalDonations;
  const goal = financeData.goalByDec2025;
  const gap = Math.max(goal - total, 0);
  const pct = Math.min(100, Math.round(total / goal * 100));

  const el = id => document.getElementById(id);
  el('kpiTotal') && (el('kpiTotal').textContent = euro(total));
  el('kpiMonth') && (el('kpiMonth').textContent = euro(monthSum));
  el('kpiWeek') && (el('kpiWeek').textContent = euro(weekSum));
  el('kpiCosts') && (el('kpiCosts').textContent = euro(costsTotal));
  el('goalBadge') && (el('goalBadge').textContent = euro(goal));
  el('progressPct') && (el('progressPct').textContent = pct + "%");
  el('goalValue') && (el('goalValue').textContent = euro(goal));
  el('gapValue') && (el('gapValue').textContent = euro(gap));

  // Pokreni animaciju bara tek kad sekcija postane vidljiva
  animateBarOnScroll(pct);
}

// ===============================
// Dashboard scroll animacija progress bara
// ===============================
function animateBarOnScroll(targetPct) {
  const bar = document.getElementById('barFill');
  if (!bar) return;
  bar.style.width = "0%";

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        let start = 0;
        const duration = 1500;
        const step = 10;
        const totalSteps = duration / step;
        const increment = targetPct / totalSteps;

        const fillInterval = setInterval(() => {
          start += increment;
          if (start >= targetPct) {
            start = targetPct;
            clearInterval(fillInterval);
          }
          bar.style.width = start + "%";
        }, step);

        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  const section = document.querySelector('.chart-section');
  if (section) observer.observe(section);
}

// ===============================
// Liste finansija
// ===============================
function renderLists() {
  const now = new Date();
  const thisMonth = now.toISOString().slice(0, 7);
  const monthList = document.getElementById('monthList');
  const weekList = document.getElementById('weekList');
  const costsList = document.getElementById('costsList');
  if (!monthList || !weekList || !costsList) return;

  monthList.innerHTML = "";
  weekList.innerHTML = "";
  costsList.innerHTML = "";

  financeData.transactions
    .filter(t => t.date.slice(0, 7) === thisMonth)
    .sort((a, b) => b.date.localeCompare(a.date))
    .forEach(t => {
      const li = document.createElement('li');
      li.textContent = `${t.date} — ${t.donor} — ${euro(t.amount)}`;
      monthList.appendChild(li);
      if (isSameISOWeek(parseISO(t.date), new Date())) {
        weekList.appendChild(li.cloneNode(true));
      }
    });

  financeData.costs.forEach(c => {
    const li = document.createElement('li');
    li.textContent = `${c.label} — ${euro(c.amount)}`;
    costsList.appendChild(li);
  });
}

// ===============================
// Chart (zlatni) + responsive canvas
// ===============================
function resizeCanvas() {
  const canvas = document.getElementById('donationsChart');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  const targetWidth = Math.max(320, rect.width || 980);
  const targetHeightCss = Math.max(220, Math.min(360, targetWidth * 0.45));
  canvas.style.height = targetHeightCss + 'px';
  canvas.width = Math.floor(targetWidth * dpr);
  canvas.height = Math.floor(targetHeightCss * dpr);
}

// crtanje chart-a (osnove)
function drawChartBase(ctx, w, h, padding, maxVal) {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "rgba(0,0,0,0.20)";
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top);
  ctx.lineTo(padding.left, h - padding.bottom);
  ctx.lineTo(w - padding.right, h - padding.bottom);
  ctx.stroke();
  ctx.fillStyle = "#555";
  ctx.font = "12px Inter, sans-serif";
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const y = h - padding.bottom - (i / steps) * (h - padding.top - padding.bottom);
    const val = Math.round((i / steps) * maxVal);
    ctx.fillText(euro(val), 6, y + 4);
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(w - padding.right, y); ctx.stroke();
  }
}

// punjenje barova (animirano na scroll)
function animateChartOnScroll() {
  const canvas = document.getElementById("donationsChart");
  if (!canvas) return;

  let animated = false;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animateBars();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(canvas);

  function animateBars() {
    resizeCanvas();
    const ctx = canvas.getContext("2d");
    const months = financeData.donations.map(d => d.month);
    const values = financeData.donations.map(d => d.amount);
    const maxVal = Math.max(...values) * 1.2;
    const padding = { top: 20, right: 20, bottom: 36, left: 60 };
    const w = canvas.width, h = canvas.height;
    const barW = (w - padding.left - padding.right) / values.length * 0.6;

    let progress = 0;
    const duration = 1500;
    const steps = 60;
    const interval = duration / steps;

    const anim = setInterval(() => {
      progress += 1 / steps;
      if (progress >= 1) { progress = 1; clearInterval(anim); }

      drawChartBase(ctx, w, h, padding, maxVal);

      months.forEach((m, idx) => {
        const barH = ((values[idx] * progress) / maxVal) * (h - padding.top - padding.bottom);
        const xCenter = padding.left + (idx + 0.5) * ((w - padding.left - padding.right) / months.length);
        const x = xCenter - barW / 2;
        ctx.fillStyle = "rgba(201,162,39,0.9)";
        ctx.fillRect(x, h - padding.bottom - barH, barW, barH);
        ctx.fillStyle = "#333";
        ctx.font = "11px Inter, sans-serif";
        ctx.fillText(euro(values[idx]), x, h - padding.bottom - barH - 6);
        const label = m.slice(5) + "." + m.slice(2, 4);
        ctx.fillText(label, xCenter - 12, h - padding.bottom + 16);
      });
    }, interval);
  }
}

// ===============================
// Galerija slideshow
// ===============================
let slideIndex = 0;
let slideTimer = null;
function setSlide(n) {
  const slides = document.querySelectorAll(".slide");
  if (slides.length === 0) return;
  slides.forEach(s => s.classList.remove("active"));
  slideIndex = (n + slides.length) % slides.length;
  slides[slideIndex].classList.add("active");
}
function nextSlide(delta = 1) { setSlide(slideIndex + delta); }
function startAuto() { stopAuto(); slideTimer = setInterval(() => nextSlide(1), 4000); }
function stopAuto() { if (slideTimer) clearInterval(slideTimer); slideTimer = null; }
function initGallery() {
  const slides = document.querySelectorAll(".slide");
  if (slides.length === 0) return;
  slideIndex = 0; setSlide(slideIndex);
  const prevBtn = document.querySelector(".slideshow .prev");
  const nextBtn = document.querySelector(".slideshow .next");
  prevBtn && prevBtn.addEventListener('click', () => { nextSlide(-1); startAuto(); });
  nextBtn && nextBtn.addEventListener('click', () => { nextSlide(1); startAuto(); });
  const box = document.querySelector(".slideshow");
  if (box) { box.addEventListener('mouseenter', stopAuto); box.addEventListener('mouseleave', startAuto); }
  startAuto();
}

// ===============================
// Kontakt forma
// ===============================
function initContact() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const status = document.getElementById('formStatus');
    if (status) status.textContent = "Hvala! Poruka je zabeležena (demo).";
    form.reset();
  });
}

// ===============================
// Init
// ===============================
function init() {
  renderKPIs();
  renderLists();
  animateChartOnScroll();
  initGallery();
  initContact();
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

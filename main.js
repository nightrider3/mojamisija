/* ================================
   SPC Salzburg – Modern JS
   - Typing Title
   - IntersectionObserver reveals
   - Multilingual (sr-latn, sr-cyrl, de)
   - Theme toggle with persistence
   - Donations dashboard
   ================================= */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// ------------------------ Language pack
const i18n = {
  "sr-latn": {
    home: "Početna",
    about: "O projektu",
    team: "Tim",
    donate: "Donacije",
    subheading: "Transparentno, profesionalno, posvećeno.",
    planning: "Planiranje",
    planning_desc: "Stručni tim planira svaki detalj.",
    building: "Izgradnja",
    building_desc: "Kvalitetna i bezbedna izgradnja crkve.",
    finance: "Finansije",
    finance_desc: "Potpuna transparentnost troškova i donacija.",
    donation_dashboard: "Dashboard za Donacije",
    import_csv: "Uvezi CSV",
    export_json: "Izvezi JSON",
    total: "Ukupno prikupljeno:",
    goal: "Cilj do decembra 2025:",
    remaining: "Preostalo:",
    donor_count: "Broj donatora",
    avg_donation: "Prosečna donacija",
    last_donation: "Poslednja donacija",
    progress_to_goal: "Napredak ka cilju",
    t_date: "Datum",
    t_name: "Ime",
    t_amount: "Iznos (€)",
    t_method: "Metod",
    t_note: "Napomena",
    report: "Detaljan izveštaj",
    theme_dark: "Dark",
    theme_light: "Light",
    animated_title: "Zajedno gradimo svetilište."
  },
  "sr-cyrl": {
    home: "Почетна",
    about: "О пројекту",
    team: "Тим",
    donate: "Донације",
    subheading: "Транспарентно, професионално, посвећено.",
    planning: "Планирање",
    planning_desc: "Стручни тим планира сваки детаљ.",
    building: "Изградња",
    building_desc: "Квалитетна и безбедна изградња цркве.",
    finance: "Финансије",
    finance_desc: "Потпуна транспарентност трошкова и донација.",
    donation_dashboard: "Дашборд за Донације",
    import_csv: "Увези CSV",
    export_json: "Извези JSON",
    total: "Укупно прикупљено:",
    goal: "Циљ до децембра 2025:",
    remaining: "Преостало:",
    donor_count: "Број донатора",
    avg_donation: "Просечна донација",
    last_donation: "Последња донација",
    progress_to_goal: "Напредак ка циљу",
    t_date: "Датум",
    t_name: "Име",
    t_amount: "Износ (€)",
    t_method: "Метод",
    t_note: "Напомена",
    report: "Детаљан извештај",
    theme_dark: "Тамно",
    theme_light: "Светло",
    animated_title: "Заједно градимо светионик вере."
  },
  de: {
    home: "Start",
    about: "Projekt",
    team: "Team",
    donate: "Spenden",
    subheading: "Transparent, professionell, engagiert.",
    planning: "Planung",
    planning_desc: "Das Expertenteam plant jedes Detail.",
    building: "Bau",
    building_desc: "Qualitativer und sicherer Kirchenbau.",
    finance: "Finanzen",
    finance_desc: "Volle Transparenz von Kosten und Spenden.",
    donation_dashboard: "Spenden-Dashboard",
    import_csv: "CSV importieren",
    export_json: "JSON exportieren",
    total: "Gesamt gesammelt:",
    goal: "Ziel bis Dezember 2025:",
    remaining: "Verbleibend:",
    donor_count: "Anzahl Spender",
    avg_donation: "Durchschnittsspende",
    last_donation: "Letzte Spende",
    progress_to_goal: "Fortschritt zum Ziel",
    t_date: "Datum",
    t_name: "Name",
    t_amount: "Betrag (€)",
    t_method: "Methode",
    t_note: "Notiz",
    report: "Detaillierter Bericht",
    theme_dark: "Dunkel",
    theme_light: "Hell",
    animated_title: "Gemeinsam bauen wir unser Heiligtum."
  }
};

function setLang(lang){
  const dict = i18n[lang] ?? i18n["sr-latn"];
  $$(".trans").forEach(el=>{
    const key = el.dataset.key;
    if(dict[key]) el.textContent = dict[key];
  });
  // Theme button text
  $$("[data-i18n='theme_dark']").forEach(el=>el.textContent = dict.theme_dark);
  $$("[data-i18n='theme_light']").forEach(el=>el.textContent = dict.theme_light);
  // Animated title retype
  typeTitle(dict.animated_title);
  localStorage.setItem("lang", lang);
  document.documentElement.lang = lang.startsWith("sr") ? "sr" : lang;
}

$("#lang-select")?.addEventListener("change", e=> setLang(e.target.value));

// ------------------------ Theme toggle
function applyTheme(theme){
  const root = document.documentElement;
  if(theme === "dark"){
    root.classList.add("dark");
  }else{
    root.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
  $("#theme-toggle")?.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
}
$("#theme-toggle")?.addEventListener("click", ()=>{
  const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
  applyTheme(next);
});

// Init persisted settings
(function initPrefs(){
  const savedLang = localStorage.getItem("lang") || "sr-latn";
  const savedTheme = localStorage.getItem("theme") || "light";
  $("#lang-select").value = savedLang;
  applyTheme(savedTheme);
  setLang(savedLang);
})();

// ------------------------ Typing animation (title auffüllen)
let typeTimeout;
function typeTitle(text){
  const el = $("#animated-title");
  if(!el) return;
  if(typeTimeout) clearTimeout(typeTimeout);
  el.textContent = "";
  let i=0;
  const type = ()=>{
    if(i <= text.length){
      el.textContent = text.slice(0,i);
      i++;
      typeTimeout = setTimeout(type, 32); // speed
    }
  };
  type();
}

// ------------------------ Hamburger menu (mobile)
$("#hamburger")?.addEventListener("click", ()=>{
  const menu = $("#nav-menu");
  const open = menu.classList.toggle("open");
  $("#hamburger").setAttribute("aria-expanded", open ? "true" : "false");
});

// ------------------------ Reveal on scroll (Ein-/Ausblendungen)
const obs = new IntersectionObserver((entries)=>{
  for(const e of entries){
    if(e.isIntersecting){
      e.target.classList.add("revealed");
      obs.unobserve(e.target);
    }
  }
},{threshold:0.12});
$$(".reveal").forEach(el=>obs.observe(el));

// ------------------------ Donations Dashboard
const GOAL = 200000; // 200k €
const state = {
  donations: [] // {date, name, amount, method, note}
};
const nf = new Intl.NumberFormat("de-AT",{style:"currency", currency:"EUR", maximumFractionDigits:0});

$("#donation-file")?.addEventListener("change", async (e)=>{
  const file = e.target.files?.[0];
  if(!file) return;
  const txt = await file.text();
  importCSV(txt);
  render();
});

$("#export-json")?.addEventListener("click", (e)=>{
  if(!state.donations.length){
    e.preventDefault();
    return;
  }
  const blob = new Blob([JSON.stringify(state.donations, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  $("#export-json").href = url;
  // Note: download attr set in HTML
});

function importCSV(text){
  // Autodetect delimiter
  const delim = text.indexOf(";")>-1 && text.indexOf(",")>-1
    ? (text.split("\n")[0].split(";").length > text.split("\n")[0].split(",").length ? ";" : ",")
    : (text.indexOf(";")>-1 ? ";" : ",");
  const lines = text.split(/\r?\n/).filter(Boolean);
  // Optional header
  const header = lines[0].toLowerCase();
  let startIdx = 0;
  if(/datum|date|name|ime|betrag|iznos/.test(header)) startIdx = 1;

  const toAmount = (s)=>{
    if(s==null) return 0;
    return Number(String(s).replace(/[€\s]/g,"").replace(",","."));
  };

  for(let i=startIdx;i<lines.length;i++){
    const cols = lines[i].split(delim).map(c=>c.trim());
    const [date,name,amount,method,note] = cols;
    if(!date && !amount) continue;
    state.donations.push({
      date: date || "",
      name: name || "",
      amount: toAmount(amount || 0),
      method: method || "",
      note: note || ""
    });
  }
}

function render(){
  const total = state.donations.reduce((a,d)=>a + (d.amount||0), 0);
  const donors = new Set(state.donations.map(d=>d.name || `Donor #${Math.random().toString(36).slice(2,6)}`)).size;
  const avg = state.donations.length ? total / state.donations.length : 0;
  const remaining = Math.max(GOAL - total, 0);
  const last = state.donations[state.donations.length-1]?.amount || 0;
  const pct = Math.min(100, Math.round((total/GOAL)*100));

  $("#stat-total").textContent = nf.format(total);
  $("#stat-goal").textContent = nf.format(GOAL);
  $("#stat-remaining").textContent = nf.format(remaining);
  $("#stat-donors").textContent = String(donors);
  $("#stat-avg").textContent = nf.format(Math.round(avg));
  $("#stat-last").textContent = nf.format(last);
  $("#progress-fill").style.width = pct + "%";
  $("#progress-percent").textContent = pct + "%";

  // Table
  const tbody = $("#donation-table tbody");
  tbody.innerHTML = "";
  state.donations.slice().reverse().forEach(d=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(d.date)}</td>
      <td>${escapeHtml(d.name)}</td>
      <td>${(d.amount||0).toLocaleString("de-AT",{minimumFractionDigits:0})}</td>
      <td>${escapeHtml(d.method)}</td>
      <td>${escapeHtml(d.note)}</td>
    `;
    tbody.appendChild(tr);
  });
}

function escapeHtml(s=""){
  return String(s)
    .replace(/&/g,"&amp;")
    .replace(/</g,"&lt;")
    .replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;")
    .replace(/'/g,"&#39;");
}

// Initial empty render
render();

/* ============================================================
   COPYWRITER FOR YOU — application logic
   Vanilla JS, no build step. All content comes from config.js.
   ============================================================ */
(() => {
"use strict";
const C = window.CFY_CONFIG;
if (!C) return;

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const motionOff = () => motionQuery.matches || document.documentElement.classList.contains("motion-off");
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmtDateLong = new Intl.DateTimeFormat("nl-NL", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
const fmtMonth = new Intl.DateTimeFormat("nl-NL", { month:"long", year:"numeric" });

/* ---------- toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("is-on"), 2600);
}

/* ---------- dialogs (native <dialog>: focus trap + ESC) ---------- */
const lockScroll = () => document.documentElement.classList.add("modal-open");
const unlockScroll = () => { if (!document.querySelector("dialog[open]")) document.documentElement.classList.remove("modal-open"); };
function openDialog(d) { if (!d.open) { d.showModal(); lockScroll(); } }
function closeDialog(d) {
  if (!d.open) return;
  if (motionOff()) { d.close(); return; }
  d.classList.add("closing");
  setTimeout(() => { d.close(); d.classList.remove("closing"); }, 190);
}
$$("dialog").forEach(d => {
  d.addEventListener("cancel", e => { e.preventDefault(); closeDialog(d); });
  d.addEventListener("click", e => { if (e.target === d) closeDialog(d); });
  d.addEventListener("close", unlockScroll);
});
$$("[data-open-privacy]").forEach(b => b.addEventListener("click", e => { e.preventDefault(); openDialog($("#privacyDialog")); }));
$("#privacyClose").addEventListener("click", () => closeDialog($("#privacyDialog")));

/* ---------- navigation ---------- */
const header = $("#siteHeader");
const menuDialog = $("#menuDialog");
$("#navToggle").addEventListener("click", () => openDialog(menuDialog));
$("#menuClose").addEventListener("click", () => closeDialog(menuDialog));
$$("[data-menu-link]").forEach(a => a.addEventListener("click", e => {
  e.preventDefault();
  closeDialog(menuDialog);
  const target = $(a.getAttribute("href"));
  if (target) {
    target.scrollIntoView({ behavior: motionOff() ? "auto" : "smooth" });
    history.replaceState(null, "", a.getAttribute("href"));
  }
}));
const onHeaderScroll = () => header.classList.toggle("scrolled", window.scrollY > 24);
window.addEventListener("scroll", onHeaderScroll, { passive:true });
onHeaderScroll();

const navLinks = $$("[data-navlink]");
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (!en.isIntersecting) return;
    navLinks.forEach(a => {
      const active = a.getAttribute("href") === "#" + en.target.id;
      if (active) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  });
}, { rootMargin: "-40% 0px -55% 0px" });
$$("main section[id]").forEach(s => sectionObserver.observe(s));

/* ---------- render: services ---------- */
const serviceLabel = id => (C.services.find(s => s.id === id) || {}).title || "Kennismaking / weet ik nog niet";
$("#serviceList").innerHTML = C.services.map((s, i) => `
  <button class="service-row" type="button" data-service="${esc(s.id)}" data-img="${esc(s.img)}">
    <span class="service-nr">${String(i + 1).padStart(2, "0")}</span>
    <span>
      <span class="service-title">${esc(s.title)}</span>
      <span class="service-desc">${esc(s.desc)}</span>
    </span>
    <span class="service-tag">${esc(s.tag)}</span>
    <svg class="ic service-arrow" aria-hidden="true"><use href="#i-arrow"/></svg>
  </button>`).join("");
$("#serviceList").addEventListener("click", e => {
  const row = e.target.closest(".service-row");
  if (row) openBooking(row.dataset.service);
});

/* ---------- render: process ---------- */
$("#processList").innerHTML = C.process.map((p, i) => `
  <li data-reveal style="--d:${i * 0.06}s">
    <span class="process-nr">${esc(p.nr)}</span>
    <div><h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p></div>
  </li>`).join("");

/* ---------- render: FAQ ---------- */
$("#faqList").innerHTML = C.faq.map((f, i) => `
  <div class="faq-item">
    <h3><button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-panel-${i}" id="faq-q-${i}">
      <span>${esc(f.q)}</span>
      <span class="faq-icon" aria-hidden="true"><svg class="ic"><use href="#i-x"/></svg></span>
    </button></h3>
    <div class="faq-panel" id="faq-panel-${i}" role="region" aria-labelledby="faq-q-${i}">
      <div class="faq-inner">
        <p>${esc(f.a)}</p>
        ${f.link ? `<a class="text-link" href="${esc(f.link.href)}">${esc(f.link.label)}</a>` : ""}
      </div>
    </div>
  </div>`).join("");
$("#faqList").addEventListener("click", e => {
  const q = e.target.closest(".faq-q");
  if (!q) return;
  const item = q.closest(".faq-item");
  const open = item.classList.toggle("open");
  q.setAttribute("aria-expanded", String(open));
});

/* ---------- render: samples (tabs) ---------- */
const sampleTabs = $("#sampleTabs");
const samplePanel = $("#samplePanel");
sampleTabs.innerHTML = C.samples.map((s, i) => `
  <button class="sample-tab" type="button" role="tab" id="tab-${esc(s.id)}"
          aria-selected="${i === 0}" aria-controls="samplePanel" tabindex="${i === 0 ? 0 : -1}" data-i="${i}">
    <span class="tab-nr">0${i + 1}</span>${esc(s.label)}
  </button>`).join("");
function selectSample(i, focus = false) {
  const s = C.samples[i];
  $$(".sample-tab", sampleTabs).forEach((t, j) => {
    t.setAttribute("aria-selected", String(j === i));
    t.tabIndex = j === i ? 0 : -1;
  });
  samplePanel.setAttribute("aria-labelledby", "tab-" + s.id);
  samplePanel.innerHTML = `
    <div class="sample-fade">
      <p class="sample-meta"><span class="meta-kind">${esc(s.kind)}</span><span>${esc(s.brand)}</span><span>Voorbeeld — fictief</span></p>
      <h3 class="sample-title">${esc(s.title)}</h3>
      <div class="sample-body">${s.body.map(p => `<p>${esc(p)}</p>`).join("")}</div>
      <p class="sample-note"><svg class="ast" aria-hidden="true"><use href="#i-ast"/></svg><span>${esc(s.note)} Deze tekst is een stijlvoorbeeld en geen klantproject.</span></p>
    </div>`;
  if (focus) $$(".sample-tab", sampleTabs)[i].focus();
}
sampleTabs.addEventListener("click", e => {
  const t = e.target.closest(".sample-tab");
  if (t) selectSample(Number(t.dataset.i));
});
sampleTabs.addEventListener("keydown", e => {
  const tabs = $$(".sample-tab", sampleTabs);
  const cur = tabs.findIndex(t => t.getAttribute("aria-selected") === "true");
  let next = null;
  if (e.key === "ArrowDown" || e.key === "ArrowRight") next = (cur + 1) % tabs.length;
  if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = (cur - 1 + tabs.length) % tabs.length;
  if (e.key === "Home") next = 0;
  if (e.key === "End") next = tabs.length - 1;
  if (next !== null) { e.preventDefault(); selectSample(next, true); }
});
selectSample(0);

/* ---------- reveal on scroll ---------- */
const revealEls = $$("[data-reveal]");
if (motionOff()) {
  revealEls.forEach(el => el.classList.add("is-in"));
} else {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  revealEls.forEach(el => io.observe(el));
}

/* ---------- marquee (duplicate for seamless loop) ---------- */
const track = $("#marqueeTrack");
track.appendChild(track.firstElementChild.cloneNode(true));

/* ---------- parallax (why-section photo) ---------- */
const parallaxImg = $(".img-parallax img");
let parallaxTick = false;
function parallax() {
  parallaxTick = false;
  if (!parallaxImg) return;
  if (motionOff() || window.innerWidth < 1024) { parallaxImg.style.transform = ""; return; }
  const r = parallaxImg.parentElement.getBoundingClientRect();
  if (r.bottom < 0 || r.top > window.innerHeight) return;
  const y = clamp(((r.top + r.height / 2) - window.innerHeight / 2) / window.innerHeight * -10, -6, 6);
  parallaxImg.style.transform = `translate3d(0, ${y}%, 0) scale(1.14)`;
}
window.addEventListener("scroll", () => {
  if (!parallaxTick) { parallaxTick = true; requestAnimationFrame(parallax); }
}, { passive:true });

/* ---------- process progress line ---------- */
const timeline = $(".process-timeline");
const processFill = $("#processFill");
let lineTick = false;
function processLine() {
  lineTick = false;
  if (!timeline) return;
  if (motionOff()) { processFill.style.transform = "scaleY(1)"; return; }
  const r = timeline.getBoundingClientRect();
  const p = clamp((window.innerHeight * 0.72 - r.top) / r.height, 0, 1);
  processFill.style.transform = `scaleY(${p})`;
}
window.addEventListener("scroll", () => {
  if (!lineTick) { lineTick = true; requestAnimationFrame(processLine); }
}, { passive:true });
processLine();

/* ---------- floating service preview (desktop, fine pointers) ---------- */
const preview = $("#servicePreview");
const previewImg = $("#previewImg");
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  let px = 0, py = 0, tx = 0, ty = 0, active = false;
  const cache = new Map();
  const loop = () => {
    px += (tx - px) * 0.14; py += (ty - py) * 0.14;
    preview.style.left = px + "px"; preview.style.top = py + "px";
    if (active) requestAnimationFrame(loop);
  };
  $("#serviceList").addEventListener("mousemove", e => {
    tx = clamp(e.clientX + 28, 8, window.innerWidth - 256);
    ty = clamp(e.clientY - 100, 8, window.innerHeight - 180);
  });
  $$(".service-row").forEach(row => {
    row.addEventListener("mouseenter", () => {
      if (motionOff()) return;
      const src = row.dataset.img;
      if (!cache.has(src)) { const im = new Image(); im.src = src; cache.set(src, im); }
      previewImg.src = src;
      preview.classList.add("is-on");
      if (!active) { active = true; px = tx; py = ty; loop(); }
    });
  });
  $("#serviceList").addEventListener("mouseleave", () => {
    preview.classList.remove("is-on");
    active = false;
  });
}

/* ---------- ambient video ---------- */
const video = $("#studioVideo");
const videoToggle = $("#videoToggle");
let videoLoaded = false, userPaused = false;
const saveData = navigator.connection && navigator.connection.saveData;
function loadVideo() {
  if (videoLoaded || !video) return;
  videoLoaded = true;
  video.src = video.dataset.src;
  video.load();
}
function setVideoUI() {
  const playing = video && !video.paused;
  videoToggle.textContent = playing ? "Video pauzeren" : "Video afspelen";
  videoToggle.setAttribute("aria-pressed", String(playing));
}
if (video) {
  video.addEventListener("play", setVideoUI);
  video.addEventListener("pause", setVideoUI);
  video.addEventListener("error", () => { video.remove(); videoToggle.remove(); });
  const vio = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting && !motionOff() && !saveData && !userPaused) {
        loadVideo(); video.play().catch(() => {});
      } else if (video.isConnected) { video.pause(); }
    });
  }, { threshold: 0.25 });
  vio.observe(video.parentElement);
  videoToggle.addEventListener("click", () => {
    if (video.paused) { userPaused = false; loadVideo(); video.play().catch(() => {}); }
    else { userPaused = true; video.pause(); }
  });
  setVideoUI();
}

/* ---------- motion preference toggle ---------- */
const motionToggle = $("#motionToggle");
function applyMotionPref() {
  const off = localStorage.getItem("cfy-motion") === "off";
  document.documentElement.classList.toggle("motion-off", off);
  motionToggle.textContent = off ? "Animaties hervatten" : "Animaties pauzeren";
  motionToggle.setAttribute("aria-pressed", String(off));
  if (off) {
    revealEls.forEach(el => el.classList.add("is-in"));
    if (video && !video.paused) video.pause();
    if (processFill) processFill.style.transform = "scaleY(1)";
    if (parallaxImg) parallaxImg.style.transform = "";
  }
}
try { applyMotionPref(); } catch (e) { /* storage unavailable */ }
motionToggle.addEventListener("click", () => {
  try {
    const off = localStorage.getItem("cfy-motion") === "off";
    localStorage.setItem("cfy-motion", off ? "on" : "off");
  } catch (e) { document.documentElement.classList.toggle("motion-off"); }
  applyMotionPref();
});

/* ============================================================
   BOOKING — a genuine REQUEST flow (never a confirmed slot)
   ============================================================ */
const bookDialog = $("#bookingDialog");
const bookForm = $("#bookingForm");
const bookSuccess = $("#bookSuccess");
const bookNext = $("#bookNext");
const bookBack = $("#bookBack");
const stepNames = ["Dienst", "Moment", "Gegevens", "Bevestigen"];
const today = new Date(); today.setHours(0, 0, 0, 0);
const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + (C.integrations.maxDaysAhead || 120));
const monthStart = d => new Date(d.getFullYear(), d.getMonth(), 1);
const maxMonth = monthStart(maxDate);
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const state = { step: 1, service: null, date: null, time: null, month: monthStart(today), submitting: false, done: false };
const timeLabel = id => {
  const t = C.timeWindows.find(w => w.id === id);
  return t ? `${t.label} (${t.hint})` : "";
};

function setErr(id, msg) {
  const el = $("#err-" + id);
  const input = $("#" + id);
  if (!el) return;
  if (msg) { el.textContent = msg; el.hidden = false; if (input) input.setAttribute("aria-invalid", "true"); }
  else { el.hidden = true; el.textContent = ""; if (input) input.removeAttribute("aria-invalid"); }
}

/* step 1 — service radio cards */
const serviceChoices = [...C.services.map(s => ({ id: s.id, label: s.title })), { id: "kennismaking", label: "Kennismaking / weet ik nog niet" }];
function renderServiceOptions() {
  $("#serviceOptions").innerHTML = serviceChoices.map(s => `
    <button class="service-option" type="button" role="radio" data-id="${esc(s.id)}"
            aria-checked="${state.service === s.id}" tabindex="${state.service === s.id || (!state.service && s.id === serviceChoices[0].id) ? 0 : -1}">
      <span>${esc(s.label)}</span><svg class="ic" aria-hidden="true"><use href="#i-check"/></svg>
    </button>`).join("");
}
$("#serviceOptions").addEventListener("click", e => {
  const b = e.target.closest(".service-option");
  if (!b) return;
  state.service = b.dataset.id;
  renderServiceOptions();
  setErr("service");
});

/* step 2 — calendar */
function renderCalendar() {
  const m = state.month;
  $("#calMonth").textContent = fmtMonth.format(m);
  $("#calPrev").disabled = m <= monthStart(today);
  $("#calNext").disabled = m >= maxMonth;
  const first = (new Date(m.getFullYear(), m.getMonth(), 1).getDay() + 6) % 7;
  const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  let html = "";
  for (let i = 0; i < first; i++) html += `<span class="cal-day is-empty" aria-hidden="true"></span>`;
  for (let d = 1; d <= days; d++) {
    const date = new Date(m.getFullYear(), m.getMonth(), d);
    const dis = date < today || date > maxDate;
    const sel = state.date && iso(date) === iso(state.date);
    const cls = ["cal-day", iso(date) === iso(today) ? "is-today" : "", sel ? "is-selected" : ""].filter(Boolean).join(" ");
    html += `<button class="${cls}" type="button" data-date="${iso(date)}" ${dis ? "disabled" : ""}
             aria-label="${fmtDateLong.format(date)}" aria-pressed="${!!sel}">${d}</button>`;
  }
  $("#calGrid").innerHTML = html;
}
$("#calPrev").addEventListener("click", () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() - 1, 1); renderCalendar(); });
$("#calNext").addEventListener("click", () => { state.month = new Date(state.month.getFullYear(), state.month.getMonth() + 1, 1); renderCalendar(); });
$("#calGrid").addEventListener("click", e => {
  const b = e.target.closest(".cal-day[data-date]");
  if (!b || b.disabled) return;
  const [y, mo, da] = b.dataset.date.split("-").map(Number);
  state.date = new Date(y, mo - 1, da);
  renderCalendar(); updateChosen(); setErr("date");
});

/* step 2 — preferred day parts */
function renderTimeChips() {
  $("#timeChips").innerHTML = C.timeWindows.map(w => `
    <button class="time-chip" type="button" role="radio" data-id="${esc(w.id)}"
            aria-checked="${state.time === w.id}" tabindex="${state.time === w.id || (!state.time && w.id === C.timeWindows[0].id) ? 0 : -1}">
      <span class="tc-label">${esc(w.label)}</span><span class="tc-hint">${esc(w.hint)}</span>
    </button>`).join("");
}
$("#timeChips").addEventListener("click", e => {
  const b = e.target.closest(".time-chip");
  if (!b) return;
  state.time = b.dataset.id;
  renderTimeChips(); updateChosen(); setErr("time");
});
function updateChosen() {
  const parts = [];
  if (state.date) parts.push(fmtDateLong.format(state.date));
  if (state.time) parts.push(timeLabel(state.time));
  $("#chosenSlot").textContent = parts.length ? "Voorkeur: " + parts.join(" · ") : "";
}

/* roving arrow-key support for the two radio groups */
[["#serviceOptions", ".service-option"], ["#timeChips", ".time-chip"]].forEach(([sel, item]) => {
  $(sel).addEventListener("keydown", e => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const items = $$(item, $(sel));
    const i = items.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    const dir = (e.key === "ArrowDown" || e.key === "ArrowRight") ? 1 : -1;
    const next = items[(i + dir + items.length) % items.length];
    next.click(); next.focus();
  });
});

/* step navigation */
function goStep(n, focus = true) {
  state.step = n;
  $$(".step", bookForm).forEach(s => { s.hidden = Number(s.dataset.step) !== n; });
  $$("#bookProgress .seg").forEach((s, i) => s.classList.toggle("done", i < n));
  $("#bookStepLabel").textContent = `Stap ${n} van 4 — ${stepNames[n - 1]}`;
  bookBack.hidden = n === 1;
  $("span.btn-label", bookNext).textContent = n === 4 ? "Verstuur aanvraag" : "Volgende";
  if (n === 4) buildSummary();
  if (focus) { const t = $(`.step[data-step="${n}"] .step-title`, bookForm); if (t) t.focus(); }
}
bookBack.addEventListener("click", () => goStep(state.step - 1));

/* validation */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9 ()\-.]{6,24}$/;
function validateStep(n) {
  let ok = true, firstBad = null;
  const bad = (id, msg, el) => { setErr(id, msg); ok = false; if (!firstBad) firstBad = el || $("#" + id); };
  if (n === 1 && !state.service) bad("service", "Kies een dienst of kennismaking.", $(".service-option"));
  if (n === 2) {
    if (!state.date) bad("date", "Kies een voorkeursdatum.", $(".cal-day:not([disabled])"));
    if (!state.time) bad("time", "Kies een dagdeel (mag ‘In overleg’ zijn).", $(".time-chip"));
  }
  if (n === 3) {
    if ($("#fName").value.trim().length < 2) bad("fName", "Vul je volledige naam in.");
    if (!EMAIL_RE.test($("#fEmail").value.trim())) bad("fEmail", "Vul een geldig e-mailadres in.");
    if (!PHONE_RE.test($("#fPhone").value.trim())) bad("fPhone", "Vul een geldig telefoonnummer in.");
    if ($("#fMessage").value.trim().length < 10) bad("fMessage", "Vertel iets meer over je project (minimaal 10 tekens).");
    if (!$("#fPrivacy").checked) bad("fPrivacy", "Ga akkoord met het privacybeleid om te versturen.");
  }
  if (firstBad) firstBad.focus();
  return ok;
}
["fName", "fEmail", "fPhone", "fMessage", "fPrivacy"].forEach(id => {
  $("#" + id).addEventListener("input", () => setErr(id));
});

/* summary */
function summaryRows(withEdit) {
  const rows = [
    ["Dienst", serviceLabel(state.service), 1],
    ["Voorkeursdatum", state.date ? fmtDateLong.format(state.date) : "—", 2],
    ["Dagdeel", state.time ? timeLabel(state.time) : "—", 2],
    ["Naam", $("#fName").value.trim(), 3],
    ["Bedrijf", $("#fCompany").value.trim() || "—", 3],
    ["E-mail", $("#fEmail").value.trim(), 3],
    ["Telefoon", $("#fPhone").value.trim(), 3],
    ["Bericht", $("#fMessage").value.trim(), 3]
  ];
  return rows.map(([k, v, step]) =>
    `<div><dt>${esc(k)}</dt><dd>${esc(v)}${withEdit ? ` <button class="text-link summary-edit" type="button" data-goto="${step}">Wijzig</button>` : ""}</dd></div>`
  ).join("");
}
function buildSummary() { $("#summaryList").innerHTML = summaryRows(true); }
$("#summaryList").addEventListener("click", e => {
  const b = e.target.closest("[data-goto]");
  if (b) goStep(Number(b.dataset.goto));
});

/* submission adapter — modular: local API, Formspree, or disabled */
async function sendRequest(kind, payload) {
  const ep = kind === "booking" ? C.integrations.bookingEndpoint : C.integrations.contactEndpoint;
  if (!ep) return { ok: false, reason: "disabled" };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(ep, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok && j.ok) return { ok: true, id: j.id };
    if (j.fields) return { ok: false, reason: "fields", fields: j.fields };
    return { ok: false, reason: "server", detail: j.error };
  } catch (err) {
    return { ok: false, reason: "network" };
  } finally { clearTimeout(timer); }
}
const failText = {
  disabled: "Online aanvragen is nog niet geactiveerd op deze website. Bel +31 6 14645205 of kopieer je aanvraag en geef hem telefonisch door.",
  network: "Versturen is niet gelukt — er is geen verbinding met de server. Probeer het opnieuw, bel +31 6 14645205 of kopieer je aanvraag.",
  server: "De server kon de aanvraag niet verwerken. Probeer het opnieuw of bel +31 6 14645205.",
  fields: "Controleer de gemarkeerde velden en verstuur opnieuw."
};
function requestText() {
  return [
    "Aanvraag gesprek — Copywriter For You",
    "Dienst: " + serviceLabel(state.service),
    "Voorkeursdatum: " + (state.date ? fmtDateLong.format(state.date) : "—"),
    "Dagdeel: " + (state.time ? timeLabel(state.time) : "—"),
    "Naam: " + $("#fName").value.trim(),
    "Bedrijf: " + ($("#fCompany").value.trim() || "—"),
    "E-mail: " + $("#fEmail").value.trim(),
    "Telefoon: " + $("#fPhone").value.trim(),
    "Bericht: " + $("#fMessage").value.trim(),
    "",
    "Let op: dit is een aanvraag, geen bevestigde afspraak."
  ].join("\n");
}
$("#copyRequest").addEventListener("click", async () => {
  const text = requestText();
  try { await navigator.clipboard.writeText(text); toast("Aanvraag gekopieerd naar klembord"); }
  catch (e) {
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast("Aanvraag gekopieerd naar klembord"); }
    catch (e2) { toast("Kopiëren niet mogelijk — selecteer de tekst handmatig"); }
    ta.remove();
  }
});

bookForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (state.submitting) return;
  if (state.step < 4) { if (validateStep(state.step)) goStep(state.step + 1); return; }
  if (!validateStep(3)) { goStep(3); return; }
  state.submitting = true;
  bookNext.disabled = true;
  bookNext.classList.add("is-loading");
  $("#bookAlert").hidden = true;
  const payload = {
    service: serviceLabel(state.service),
    date: state.date ? iso(state.date) : "",
    time: state.time ? timeLabel(state.time) : "",
    name: $("#fName").value.trim(),
    company: $("#fCompany").value.trim(),
    email: $("#fEmail").value.trim(),
    phone: $("#fPhone").value.trim(),
    message: $("#fMessage").value.trim(),
    privacy: $("#fPrivacy").checked,
    website: $("#fWebsite").value
  };
  const res = await sendRequest("booking", payload);
  state.submitting = false;
  bookNext.disabled = false;
  bookNext.classList.remove("is-loading");
  if (res.ok) {
    state.done = true;
    bookForm.hidden = true;
    $$("#bookProgress .seg").forEach(s => s.classList.add("done"));
    $("#bookStepLabel").textContent = "Aanvraag verstuurd";
    $("#successSummary").innerHTML = summaryRows(false);
    $("#successRef").textContent = res.id ? "Referentie: " + res.id + " — bewaar deze bij contact." : "";
    bookSuccess.hidden = false;
    $("#successTitle").focus();
  } else if (res.reason === "fields") {
    const map = { name:"fName", email:"fEmail", phone:"fPhone", message:"fMessage", privacy:"fPrivacy", service:"service", date:"date", time:"time" };
    let jump = 4;
    Object.entries(res.fields).forEach(([k, v]) => {
      const id = map[k]; if (!id) return;
      setErr(id, v);
      const step = ["service"].includes(k) ? 1 : ["date", "time"].includes(k) ? 2 : 3;
      jump = Math.min(jump, step);
    });
    if (jump < 4) goStep(jump);
    else { $("#bookAlertText").textContent = failText.fields; $("#bookAlert").hidden = false; }
  } else {
    $("#bookAlertText").textContent = res.detail || failText[res.reason] || failText.server;
    $("#bookAlert").hidden = false;
    $("#bookAlert").scrollIntoView({ behavior: motionOff() ? "auto" : "smooth", block: "nearest" });
  }
});

function resetBooking() {
  state.step = 1; state.service = null; state.date = null; state.time = null;
  state.month = monthStart(today); state.submitting = false; state.done = false;
  bookForm.reset();
  ["service", "date", "time", "fName", "fEmail", "fPhone", "fMessage", "fPrivacy"].forEach(id => setErr(id));
  $("#bookAlert").hidden = true;
  bookSuccess.hidden = true;
  bookForm.hidden = false;
  renderServiceOptions(); renderCalendar(); renderTimeChips(); updateChosen();
  goStep(1, false);
}
function openBooking(serviceId) {
  if (menuDialog.open) closeDialog(menuDialog);
  if (state.done) resetBooking();
  if (serviceId && serviceChoices.some(s => s.id === serviceId)) {
    state.service = serviceId;
    renderServiceOptions(); setErr("service");
    goStep(1, false);
  }
  openDialog(bookDialog);
  requestAnimationFrame(() => { const t = $(`.step[data-step="${state.step}"] .step-title`, bookForm); if (t) t.focus(); });
}
$$("[data-book]").forEach(b => b.addEventListener("click", () => openBooking(b.dataset.service || null)));
$("#bookClose").addEventListener("click", () => closeDialog(bookDialog));
$("#bookDone").addEventListener("click", () => closeDialog(bookDialog));
bookDialog.addEventListener("close", () => { if (state.done) resetBooking(); });
renderServiceOptions(); renderCalendar(); renderTimeChips(); goStep(1, false);

/* ============================================================
   CONTACT FORM
   ============================================================ */
const contactForm = $("#contactForm");
const contactStatus = $("#contactStatus");
["cName", "cEmail", "cMessage", "cPrivacy"].forEach(id => $("#" + id).addEventListener("input", () => setErr(id)));
contactForm.addEventListener("submit", async e => {
  e.preventDefault();
  let ok = true, firstBad = null;
  const bad = (id, msg) => { setErr(id, msg); ok = false; if (!firstBad) firstBad = $("#" + id); };
  if ($("#cName").value.trim().length < 2) bad("cName", "Vul je naam in.");
  if (!EMAIL_RE.test($("#cEmail").value.trim())) bad("cEmail", "Vul een geldig e-mailadres in.");
  if ($("#cMessage").value.trim().length < 10) bad("cMessage", "Vertel iets meer (minimaal 10 tekens).");
  if (!$("#cPrivacy").checked) bad("cPrivacy", "Ga akkoord met het privacybeleid.");
  if (!ok) { firstBad.focus(); return; }
  const btn = $("#contactSubmit");
  btn.disabled = true; btn.classList.add("is-loading");
  contactStatus.hidden = true;
  const res = await sendRequest("contact", {
    name: $("#cName").value.trim(),
    company: $("#cCompany").value.trim(),
    email: $("#cEmail").value.trim(),
    message: $("#cMessage").value.trim(),
    privacy: $("#cPrivacy").checked,
    website: $("#cWebsite").value
  });
  btn.disabled = false; btn.classList.remove("is-loading");
  contactStatus.hidden = false;
  if (res.ok) {
    contactForm.reset();
    contactStatus.className = "form-status is-ok";
    contactStatus.textContent = "Bericht verstuurd. Er wordt zo snel mogelijk contact met je opgenomen." + (res.id ? " Referentie: " + res.id : "");
  } else {
    contactStatus.className = "form-status is-err";
    contactStatus.textContent = (res.reason === "disabled")
      ? "Online berichten versturen is nog niet geactiveerd. Bel +31 6 14645205 — vermeld als 24 uur geopend."
      : "Versturen is niet gelukt. Probeer het opnieuw of bel +31 6 14645205.";
  }
});

/* ---------- misc ---------- */
$("#year").textContent = String(new Date().getFullYear());
})();
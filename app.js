/* ============================================================
   BOOKOUT✶ demo — all data & messaging simulated.
   Real quote window: 1 hour. Demo window: 60s (1 min = 1 hr).
   ============================================================ */

"use strict";

const WINDOW_MS = 60_000; // demo: 60s stands in for the real 1-hour window
const SIM_RATIO = 60;     // 1 real second = 1 simulated minute

const VENUES = [
  { id: "neon",     name: "Neon Garden",     area: "Downtown",      tags: ["Rooftop", "Open-air"],        band: [600, 1200],  buyout: [6000, 9000],   g: ["#ff3d6e", "#7a1f8f"], glyph: "N" },
  { id: "velvet",   name: "Velvet Citrus",   area: "Thornton Park", tags: ["Lounge", "Live DJ"],          band: [500, 900],   buyout: [4500, 7000],   g: ["#ffa53d", "#c2264d"], glyph: "V" },
  { id: "gator",    name: "The Gilded Gator", area: "Downtown",     tags: ["Speakeasy", "Cocktails"],     band: [450, 850],   buyout: [4000, 6500],   g: ["#b8862f", "#3c2a10"], glyph: "G" },
  { id: "lumen",    name: "LUMEN",           area: "I-Drive",       tags: ["Megaclub", "EDM"],            band: [900, 2000],  buyout: [12000, 18000], g: ["#3d7bff", "#ff3d6e"], glyph: "L" },
  { id: "static",   name: "Static Room",     area: "Mills 50",      tags: ["Warehouse", "House / techno"],band: [400, 800],   buyout: [3500, 6000],   g: ["#444a63", "#101322"], glyph: "S" },
  { id: "palma",    name: "Palma Social",    area: "Downtown",      tags: ["Latin", "Reggaeton"],         band: [550, 1000],  buyout: [5000, 8000],   g: ["#ff7a4d", "#8f1f5c"], glyph: "P" },
  { id: "seven",    name: "Skyline SEVEN",   area: "Downtown",      tags: ["Rooftop", "Skyline views"],   band: [700, 1400],  buyout: [7000, 11000],  g: ["#2fd4c2", "#153a63"], glyph: "7" },
  { id: "wax",      name: "Basement Wax",    area: "Mills 50",      tags: ["Vinyl bar", "Intimate"],      band: [300, 600],   buyout: [2500, 4500],   g: ["#c2264d", "#26102e"], glyph: "W" },
  { id: "meridian", name: "Club Meridian",   area: "I-Drive",       tags: ["Bottle service", "Go-go"],    band: [800, 1600],  buyout: [9000, 14000],  g: ["#ffd23d", "#c2264d"], glyph: "M" },
];

const INCLUDES_POOL = [
  "Skip-the-line entry for all guests",
  "2 bottles + mixers included",
  "Dance-floor table",
  "DJ booth adjacent section",
  "Dedicated server all night",
  "Champagne on arrival",
  "Comp entry before 11 PM",
  "VIP wristbands for the group",
];

const NOTES_POOL = [
  "We'll take care of your group — ask for me at the door.",
  "Big night this week, this table will go fast.",
  "Can add a birthday setup at no charge.",
  "Best view in the room, trust me.",
  "If you're flexible on time I can do better on price.",
  "",
  "",
];

/* ---------- state ---------- */

const state = {
  type: "table",          // 'table' | 'buyout'
  area: "all",
  date: "",
  time: "10:00 PM",
  party: 8,
  occasion: "Night out",
  budget: "",             // "" or "min-max"
  selected: new Set(),    // venue ids receiving the request
  requestOpen: false,
  windowEndsAt: 0,
  quotes: [],             // {id, venueId, total, deposit, includes[], note, at, source}
  sort: "price",
  humanVenueId: null,     // the venue "you" play in promoter view
  humanQuoted: false,
  booked: null,           // quote id
  timers: [],
  tick: null,
  promoterScreen: "sms",  // 'sms' | 'form'
};

const $ = (id) => document.getElementById(id);
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const rand = (min, max) => Math.round(min + Math.random() * (max - min));
const roundTo = (n, step) => Math.round(n / step) * step;

/* ---------- boot ---------- */

(function boot() {
  // default date: next Friday
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
  $("fDate").value = d.toISOString().slice(0, 10);

  bindSearch();
  bindBoard();
  bindPromoter();
  bindBooking();

  $("logoHome").addEventListener("click", resetAll);
  $("btnNewSearch").addEventListener("click", resetAll);
})();

/* ---------- search screen ---------- */

function bindSearch() {
  document.querySelectorAll("#searchForm .seg-opt[data-type]").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll("#searchForm .seg-opt[data-type]").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      state.type = b.dataset.type;
    })
  );

  $("stepUp").addEventListener("click", () => setParty(state.party + 1));
  $("stepDown").addEventListener("click", () => setParty(state.party - 1));

  $("budgetChips").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    document.querySelectorAll("#budgetChips .chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    state.budget = chip.dataset.budget;
  });

  $("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.area = $("fArea").value;
    state.date = $("fDate").value;
    state.time = $("fTime").value;
    state.occasion = $("fOccasion").value;
    showResults();
  });

  document.querySelectorAll(".btn-back").forEach((b) =>
    b.addEventListener("click", () => showScreen(b.dataset.back))
  );
}

function setParty(n) {
  state.party = Math.min(40, Math.max(2, n));
  $("fParty").textContent = state.party;
}

/* ---------- results / select ---------- */

function matchedVenues() {
  return VENUES.filter((v) => state.area === "all" || v.area === state.area);
}

function showResults() {
  const matches = matchedVenues();
  state.selected = new Set(matches.map((v) => v.id));

  $("resultsSub").textContent =
    `${state.type === "buyout" ? "Full buyout" : "Table"} · ${fmtDate(state.date)} · ${state.time} · ${state.party} people · ${state.occasion}` +
    (state.budget ? ` · budget ${budgetLabel(state.budget)}` : "");

  const grid = $("venueGrid");
  grid.innerHTML = "";
  matches.forEach((v, i) => {
    const card = document.createElement("article");
    card.className = "venue-card selected";
    card.style.animationDelay = `${i * 60}ms`;
    card.dataset.id = v.id;
    card.innerHTML = `
      <div class="venue-art" style="background:linear-gradient(135deg,${v.g[0]},${v.g[1]})">${v.glyph}</div>
      <div class="venue-body">
        <div class="venue-name">${v.name}</div>
        <div class="venue-meta">${v.area} · ${state.type === "buyout" ? "buyouts from " + usd.format(v.buyout[0]) : "tables from " + usd.format(v.band[0])}</div>
        <div class="venue-tags">${v.tags.map((t) => `<span>${t}</span>`).join("")}</div>
      </div>
      <div class="venue-check">✓</div>`;
    card.addEventListener("click", () => {
      if (state.selected.has(v.id)) {
        state.selected.delete(v.id);
        card.classList.replace("selected", "deselected");
      } else {
        state.selected.add(v.id);
        card.classList.replace("deselected", "selected");
      }
      updateSendbar();
    });
    grid.appendChild(card);
  });

  updateSendbar();
  showScreen("results");
}

function updateSendbar() {
  const n = state.selected.size;
  $("sendCount").textContent = n === 0 ? "No venues selected" : `Request quotes from ${n} venue${n > 1 ? "s" : ""}`;
  $("btnSend").disabled = n === 0;
  $("btnSend").style.opacity = n === 0 ? 0.4 : 1;
}

/* ---------- request + simulation engine ---------- */

$("btnSend").addEventListener("click", startRequest);

function startRequest() {
  if (state.selected.size === 0) return;

  clearTimers();
  state.quotes = [];
  state.booked = null;
  state.humanQuoted = false;
  state.requestOpen = true;
  state.windowEndsAt = Date.now() + WINDOW_MS;
  state.promoterScreen = "sms";

  const ids = [...state.selected];
  // reserve one venue for the human promoter (it never auto-quotes)
  state.humanVenueId = ids[rand(0, ids.length - 1)];
  $("promoterVenueName").textContent = venueById(state.humanVenueId).name;
  $("promoterDot").classList.add("live");

  // schedule auto-quotes: ~75% of the other venues reply, at least 2 if possible
  const others = ids.filter((id) => id !== state.humanVenueId);
  let repliers = others.filter(() => Math.random() < 0.75);
  while (repliers.length < Math.min(2, others.length)) {
    const missing = others.filter((id) => !repliers.includes(id));
    repliers.push(missing[rand(0, missing.length - 1)]);
  }
  repliers.forEach((id) => {
    const delay = rand(4_000, WINDOW_MS - 6_000);
    state.timers.push(setTimeout(() => addQuote(makeAutoQuote(id)), delay));
  });

  $("textedCount").textContent = ids.length;
  $("boardSummary").textContent = $("resultsSub").textContent;
  $("boardTitle").textContent = "Quotes are coming in";
  $("quotesEmpty").classList.remove("hidden");

  state.tick = setInterval(tickWindow, 250);
  tickWindow();
  renderQuotes();
  renderPhone();
  showScreen("board");
  toast(`Request texted to ${ids.length} promoters ⚡`);
}

function makeAutoQuote(venueId) {
  const v = venueById(venueId);
  const band = state.type === "buyout" ? v.buyout : v.band;
  let total = rand(band[0], band[1]);

  // scale tables with party size; nudge toward stated budget
  if (state.type === "table" && state.party > 6) total *= 1 + (state.party - 6) * 0.05;
  if (state.budget) {
    const [lo, hi] = state.budget.split("-").map(Number);
    const target = Math.min(Math.max(total, lo), hi === 99999 ? total : hi);
    total = total * 0.4 + target * 0.6;
  }
  total = roundTo(total, 25);

  const depPct = [15, 20, 25, 30][rand(0, 3)];
  const includes = shuffle(INCLUDES_POOL).slice(0, rand(2, 3));
  if (state.occasion === "Birthday" && Math.random() < 0.6) includes.push("Birthday setup on the house");

  return {
    id: "q_" + venueId + "_" + Date.now(),
    venueId,
    total,
    deposit: roundTo((total * depPct) / 100, 10),
    includes,
    note: NOTES_POOL[rand(0, NOTES_POOL.length - 1)],
    at: Date.now(),
    source: "auto",
  };
}

function addQuote(q) {
  if (!state.requestOpen) return;
  state.quotes.push(q);
  renderQuotes();
  renderPhone();
  $("repliedCount").textContent = `${state.quotes.length} replied`;
  if (q.source === "human") toast("Your quote is live on the customer's board ✓");
}

function tickWindow() {
  const left = state.windowEndsAt - Date.now();
  const ring = $("ring");
  if (left <= 0) {
    state.requestOpen = false;
    clearInterval(state.tick);
    ring.classList.add("closed");
    ring.classList.remove("urgent");
    ring.style.setProperty("--p", 0);
    $("ringTime").textContent = "0:00";
    $("ringLabel").textContent = "window closed";
    $("boardTitle").textContent = state.quotes.length
      ? "Quoting closed — compare & book"
      : "Quoting closed — no replies";
    renderQuotes();
    renderPhone();
    return;
  }
  const frac = left / WINDOW_MS;
  // display simulated time: 60s real = 60min simulated
  const simSecs = Math.ceil((left / 1000) * SIM_RATIO);
  const mm = Math.floor(simSecs / 60);
  const ss = simSecs % 60;
  $("ringTime").textContent = `${mm}:${String(ss).padStart(2, "0")}`;
  ring.style.setProperty("--p", frac * 100);
  ring.classList.toggle("urgent", frac < 0.18);
}

/* ---------- quote board ---------- */

function bindBoard() {
  $("sortSeg").addEventListener("click", (e) => {
    const b = e.target.closest(".seg-opt");
    if (!b) return;
    document.querySelectorAll("#sortSeg .seg-opt").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    state.sort = b.dataset.sort;
    renderQuotes();
  });
}

function renderQuotes() {
  const list = $("quotesList");
  list.querySelectorAll(".quote-card, .window-closed-note").forEach((n) => n.remove());
  $("quotesEmpty").classList.toggle("hidden", state.quotes.length > 0);

  const sorted = [...state.quotes].sort((a, b) =>
    state.sort === "price" ? a.total - b.total :
    state.sort === "deposit" ? a.deposit - b.deposit :
    b.at - a.at
  );
  const bestPrice = Math.min(...state.quotes.map((q) => q.total));
  const lowDep = Math.min(...state.quotes.map((q) => q.deposit));

  sorted.forEach((q) => {
    const v = venueById(q.venueId);
    const badges = [];
    if (state.quotes.length > 1 && q.total === bestPrice) badges.push(`<span class="quote-badge best">best price</span>`);
    if (state.quotes.length > 1 && q.deposit === lowDep && q.total !== bestPrice) badges.push(`<span class="quote-badge lowdep">lowest deposit</span>`);
    if (q.source === "human") badges.push(`<span class="quote-badge human">your live quote</span>`);

    const card = document.createElement("article");
    card.className = "quote-card";
    card.innerHTML = `
      <div class="quote-emblem" style="background:linear-gradient(135deg,${v.g[0]},${v.g[1]})">${v.glyph}</div>
      <div class="quote-main">
        <div class="quote-venue">${v.name} ${badges.join("")}</div>
        <div class="quote-includes">${q.includes.join(" · ")}</div>
        ${q.note ? `<div class="quote-note">“${q.note}”</div>` : ""}
      </div>
      <div class="quote-side">
        <div class="quote-price">${usd.format(q.total)}</div>
        <div class="quote-dep">deposit ${usd.format(q.deposit)}</div>
        <button class="btn-book" data-quote="${q.id}">Book</button>
      </div>`;
    card.querySelector(".btn-book").addEventListener("click", () => openBooking(q.id));
    list.appendChild(card);
  });

  if (!state.requestOpen && state.quotes.length) {
    const note = document.createElement("div");
    note.className = "window-closed-note";
    note.textContent = `QUOTE WINDOW CLOSED · ${state.quotes.length} OF ${state.selected.size} VENUES REPLIED`;
    list.appendChild(note);
  }
}

/* ---------- booking ---------- */

let bookingQuoteId = null;

function bindBooking() {
  $("bookClose").addEventListener("click", () => $("bookBackdrop").classList.add("hidden"));
  $("bookBackdrop").addEventListener("click", (e) => {
    if (e.target === $("bookBackdrop")) $("bookBackdrop").classList.add("hidden");
  });
  $("btnPay").addEventListener("click", confirmBooking);
}

function openBooking(quoteId) {
  const q = state.quotes.find((x) => x.id === quoteId);
  if (!q) return;
  bookingQuoteId = quoteId;
  const v = venueById(q.venueId);
  $("bookVenue").textContent = v.name;
  $("bookLines").innerHTML = `
    <div class="bline"><span>${state.type === "buyout" ? "Full venue buyout" : "Table"} · ${state.party} people</span><b>${fmtDate(state.date)} · ${state.time}</b></div>
    <div class="bline"><span>Quoted total</span><b>${usd.format(q.total)}</b></div>
    <div class="bline"><span>Includes</span><b>${q.includes.join("<br>")}</b></div>
    <div class="bline total"><span>Deposit due now</span><b>${usd.format(q.deposit)}</b></div>`;
  $("payAmount").textContent = usd.format(q.deposit);
  $("btnPay").classList.remove("paying");
  $("bookBackdrop").classList.remove("hidden");
}

function confirmBooking() {
  const q = state.quotes.find((x) => x.id === bookingQuoteId);
  if (!q) return;
  $("btnPay").classList.add("paying");
  $("btnPay").firstChild.textContent = "Processing… ";

  setTimeout(() => {
    state.booked = q.id;
    state.requestOpen = false;
    clearTimers();
    clearInterval(state.tick);

    const v = venueById(q.venueId);
    const code = "BK-ORL-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    $("confirmVenue").textContent = v.name;
    $("confirmCode").innerHTML = `Confirmation <b>${code}</b>`;
    $("confirmLines").innerHTML = `
      <div class="bline"><span>${state.type === "buyout" ? "Full buyout" : "Table"} · ${state.party} people · ${state.occasion}</span><b>${fmtDate(state.date)} · ${state.time}</b></div>
      <div class="bline"><span>Quoted total</span><b>${usd.format(q.total)}</b></div>
      <div class="bline total"><span>Deposit paid (credited to bill)</span><b>${usd.format(q.deposit)}</b></div>`;
    $("bookBackdrop").classList.add("hidden");
    $("btnPay").firstChild.textContent = "Pay deposit ";
    $("promoterDot").classList.remove("live");
    showScreen("confirm");
  }, 900);
}

/* ---------- promoter phone ---------- */

function bindPromoter() {
  $("btnPromoter").addEventListener("click", () => togglePanel(true));
  $("panelClose").addEventListener("click", () => togglePanel(false));
  $("panelBackdrop").addEventListener("click", () => togglePanel(false));
}

function togglePanel(open) {
  $("promoterPanel").classList.toggle("hidden", !open);
  $("panelBackdrop").classList.toggle("hidden", !open);
  if (open) renderPhone();
}

function renderPhone() {
  const screen = $("phoneScreen");
  const v = state.humanVenueId ? venueById(state.humanVenueId) : null;

  if (!v || (!state.requestOpen && !state.humanQuoted && state.quotes.length === 0 && !state.booked)) {
    screen.innerHTML = `
      <div class="sms-head">MESSAGES · BOOKOUT</div>
      <div class="sms-empty">No requests yet.<br><br>Close this panel and submit a booking request as a customer — the text will land here.</div>`;
    return;
  }

  if (state.promoterScreen === "form") { renderQuoteForm(screen, v); return; }

  const budget = state.budget ? ` Budget ${budgetLabel(state.budget)}.` : "";
  const linkCode = "7F3K";
  let html = `
    <div class="sms-head">MESSAGES · +1 (407) 555-0199 · BOOKOUT</div>
    <div class="sms-bubble">
      <b>New request on BOOKOUT✶</b><br>
      ${state.type === "buyout" ? "Full buyout" : "Table"} for ${state.party} · ${fmtDate(state.date)} ${state.time} · ${state.occasion}.${budget}<br>
      Venue: ${v.name}.<br>
      ${state.requestOpen ? `Quote here (expires in 1h): <span class="sms-link" id="smsLink">bkout.app/q/${linkCode}</span>` : `<em>Quote link expired.</em>`}
      <time>now</time>
    </div>`;

  if (state.humanQuoted) {
    const mine = state.quotes.find((q) => q.source === "human");
    if (mine) html += `
      <div class="sms-bubble mine">
        Quote sent ✓ ${usd.format(mine.total)} · deposit ${usd.format(mine.deposit)}<br>
        <small>The customer sees it live on their board.</small>
        <time>now</time>
      </div>`;
  }
  if (state.booked) {
    const bq = state.quotes.find((q) => q.id === state.booked);
    const won = bq && bq.source === "human";
    html += `
      <div class="sms-bubble">
        ${won ? `🎉 <b>You won the booking!</b> Deposit ${usd.format(bq.deposit)} received. See you ${fmtDate(state.date)}.` : `This request was booked with another venue. Better luck tonight!`}
        <time>now</time>
      </div>`;
  }

  screen.innerHTML = html;
  const link = document.getElementById("smsLink");
  if (link) link.addEventListener("click", () => { state.promoterScreen = "form"; renderPhone(); });
}

function renderQuoteForm(screen, v) {
  if (!state.requestOpen) {
    screen.innerHTML = `
      <div class="qform-head">bkout.app/q/7F3K</div>
      <div class="qform-closed">⏱ The 1-hour quote window has closed.<br>This link is no longer active.</div>`;
    return;
  }
  if (state.humanQuoted) {
    screen.innerHTML = `
      <div class="qform-head">bkout.app/q/7F3K · <b>sent ✓</b></div>
      <div class="qform-closed">Your quote is live.<br>Watch the customer's board to see if you win it.</div>`;
    return;
  }

  const band = state.type === "buyout" ? v.buyout : v.band;
  const suggested = roundTo((band[0] + band[1]) / 2, 25);

  screen.innerHTML = `
    <div class="qform-head">bkout.app/q/7F3K · no login needed</div>
    <div class="qform">
      <h4>Quote this request</h4>
      <p>${v.name} · ${state.type === "buyout" ? "full buyout" : "table"} for ${state.party} · ${fmtDate(state.date)} ${state.time}${state.budget ? ` · budget ${budgetLabel(state.budget)}` : ""}</p>
      <label class="field"><span>Total price ($)</span>
        <input type="number" id="qfPrice" value="${suggested}" min="50" step="25" inputmode="numeric"></label>
      <label class="field"><span>Deposit required ($)</span>
        <input type="number" id="qfDeposit" value="${roundTo(suggested * 0.2, 10)}" min="10" step="10" inputmode="numeric"></label>
      <div class="field"><span>What's included</span>
        <div class="chips" id="qfIncludes">
          ${INCLUDES_POOL.slice(0, 6).map((inc, i) => `<button type="button" class="chip ${i < 2 ? "active" : ""}" data-inc="${inc}">${inc}</button>`).join("")}
        </div>
      </div>
      <label class="field"><span>Note to customer</span>
        <textarea id="qfNote" placeholder="We'll take care of your group…"></textarea></label>
      <button class="btn-primary" id="qfSend">Send quote →</button>
    </div>`;

  document.getElementById("qfPrice").addEventListener("input", (e) => {
    const p = Number(e.target.value) || 0;
    document.getElementById("qfDeposit").value = roundTo(p * 0.2, 10);
  });
  document.getElementById("qfIncludes").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (chip) chip.classList.toggle("active");
  });
  document.getElementById("qfSend").addEventListener("click", () => {
    const total = Math.max(50, Number(document.getElementById("qfPrice").value) || 0);
    const deposit = Math.max(10, Number(document.getElementById("qfDeposit").value) || 0);
    const includes = [...document.querySelectorAll("#qfIncludes .chip.active")].map((c) => c.dataset.inc);
    const note = document.getElementById("qfNote").value.trim();
    state.humanQuoted = true;
    state.promoterScreen = "sms";
    addQuote({
      id: "q_human_" + Date.now(),
      venueId: v.id,
      total: roundTo(total, 5),
      deposit: roundTo(Math.min(deposit, total), 5),
      includes: includes.length ? includes : ["Standard table setup"],
      note,
      at: Date.now(),
      source: "human",
    });
    renderPhone();
  });
}

/* ---------- shared helpers ---------- */

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
  $("screen-" + name).classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetAll() {
  clearTimers();
  clearInterval(state.tick);
  state.quotes = [];
  state.requestOpen = false;
  state.booked = null;
  state.humanVenueId = null;
  state.humanQuoted = false;
  state.promoterScreen = "sms";
  $("promoterDot").classList.remove("live");
  $("promoterVenueName").textContent = "—";
  $("ring").classList.remove("closed", "urgent");
  $("ringLabel").textContent = "left to quote";
  togglePanel(false);
  showScreen("search");
}

function clearTimers() {
  state.timers.forEach(clearTimeout);
  state.timers = [];
}

function venueById(id) {
  return VENUES.find((v) => v.id === id);
}

function fmtDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function budgetLabel(b) {
  const [lo, hi] = b.split("-").map(Number);
  return hi === 99999 ? `$${lo / 1000}k+` : `$${lo >= 1000 ? lo / 1000 + "k" : lo}–$${hi / 1000}k`;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

let toastTimer = null;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("hidden"), 2600);
}

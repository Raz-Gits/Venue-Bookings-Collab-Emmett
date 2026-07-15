/* ============================================================
   BOOKOUT demo · all data and messaging simulated.
   Real quote window: 1 hour. Demo window: 60s (1 min = 1 hr).
   ============================================================ */

"use strict";

const WINDOW_MS = 60_000; // demo: 60s stands in for the real 1-hour window
const SIM_RATIO = 60;     // 1 real second = 1 simulated minute

const VENUES = [
  { id: "neon",     name: "Neon Garden",      area: "Downtown",      tags: "Rooftop · Open-air",     band: [600, 1200],  buyout: [6000, 9000],   g: ["#ff7a5c", "#c2264d"], glyph: "N", rating: 4.92, fav: true },
  { id: "velvet",   name: "Velvet Citrus",    area: "Thornton Park", tags: "Lounge · Live DJ",       band: [500, 900],   buyout: [4500, 7000],   g: ["#ffa53d", "#e0563b"], glyph: "V", rating: 4.85, fav: true },
  { id: "gator",    name: "The Gilded Gator",  area: "Downtown",      tags: "Speakeasy · Cocktails",  band: [450, 850],   buyout: [4000, 6500],   g: ["#c79a3f", "#6b4a1a"], glyph: "G", rating: 4.78, fav: false },
  { id: "lumen",    name: "LUMEN",            area: "I-Drive",       tags: "Megaclub · EDM",         band: [900, 2000],  buyout: [12000, 18000], g: ["#5b7bff", "#ff3d6e"], glyph: "L", rating: 4.71, fav: false },
  { id: "static",   name: "Static Room",      area: "Mills 50",      tags: "Warehouse · Techno",     band: [400, 800],   buyout: [3500, 6000],   g: ["#7a8199", "#2b3040"], glyph: "S", rating: 4.88, fav: true },
  { id: "palma",    name: "Palma Social",     area: "Downtown",      tags: "Latin · Reggaeton",      band: [550, 1000],  buyout: [5000, 8000],   g: ["#ff8a4d", "#b02063"], glyph: "P", rating: 4.83, fav: false },
  { id: "seven",    name: "Skyline SEVEN",    area: "Downtown",      tags: "Rooftop · Skyline views",band: [700, 1400],  buyout: [7000, 11000],  g: ["#3fd0c2", "#2a5b8f"], glyph: "7", rating: 4.95, fav: true },
  { id: "wax",      name: "Basement Wax",     area: "Mills 50",      tags: "Vinyl bar · Intimate",   band: [300, 600],   buyout: [2500, 4500],   g: ["#e0563b", "#5c1f3a"], glyph: "W", rating: 4.90, fav: true },
  { id: "meridian", name: "Club Meridian",    area: "I-Drive",       tags: "Bottle service · Go-go", band: [800, 1600],  buyout: [9000, 14000],  g: ["#ffc23d", "#e0563b"], glyph: "M", rating: 4.76, fav: false },
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
  "We'll take care of your group, ask for me at the door.",
  "Big night this week, this table will go fast.",
  "Can add a birthday setup at no charge.",
  "Best view in the room, trust me.",
  "If you're flexible on time I can do better on price.",
  "",
  "",
];

/* ---------- state ---------- */

const state = {
  type: "buyout",         // default tab: Venues (whole-venue buyout)
  area: "all",
  date: "",
  time: "10:00 PM",
  party: 8,
  occasion: "Night out",
  budget: null,           // null = no budget; otherwise a total-dollar number
  selected: new Set(),
  requestOpen: false,
  windowEndsAt: 0,
  quotes: [],
  sort: "price",
  humanVenueId: null,
  humanQuoted: false,
  booked: null,
  timers: [],
  tick: null,
};

const WAITING_HTML =
  `<div class="pulse-dot"></div>` +
  `<p>Waiting for the first quote…<br><small>Promoters are typing. Try the <b>Promoter view</b> ↗ to send one yourself.</small></p>`;

const $ = (id) => document.getElementById(id);
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const rand = (min, max) => Math.round(min + Math.random() * (max - min));
const roundTo = (n, step) => Math.round(n / step) * step;

/* ---------- boot ---------- */

(function boot() {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7)); // next Friday
  $("fDate").value = d.toISOString().slice(0, 10);

  bindBrowse();
  bindBoard();
  bindPromoter();
  bindBooking();

  $("logoHome").addEventListener("click", resetAll);
  $("btnNewSearch").addEventListener("click", resetAll);
  document.querySelectorAll(".btn-back").forEach((b) =>
    b.addEventListener("click", () => {
      if (b.dataset.back === "browse") { state.requestOpen = false; stopClock(); }
      showScreen(b.dataset.back);
    })
  );

  renderGrid();
})();

/* ---------- browse screen ---------- */

function bindBrowse() {
  document.querySelectorAll(".prod-tab").forEach((b) =>
    b.addEventListener("click", () => {
      document.querySelectorAll(".prod-tab").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      state.type = b.dataset.type;
      renderGrid();
    })
  );

  $("fArea").addEventListener("change", (e) => { state.area = e.target.value; renderGrid(); });
  $("fDate").addEventListener("change", (e) => { state.date = e.target.value; });
  $("fTime").addEventListener("change", (e) => { state.time = e.target.value; });
  $("fOccasion").addEventListener("change", (e) => { state.occasion = e.target.value; });

  $("fPartyNum").addEventListener("input", (e) => {
    let n = parseInt(e.target.value, 10);
    if (!Number.isFinite(n)) return;
    state.party = Math.min(2000, Math.max(1, n));
  });
  $("fPartyNum").addEventListener("blur", (e) => {
    e.target.value = state.party;
  });

  $("fBudget").addEventListener("input", (e) => {
    const n = parseInt(e.target.value, 10);
    state.budget = Number.isFinite(n) && n > 0 ? n : null;
  });

  $("btnSend").addEventListener("click", startRequest);
}

function matchedVenues() {
  return VENUES.filter((v) => state.area === "all" || v.area === state.area);
}

function renderGrid() {
  // sync current filter values into state
  state.date = $("fDate").value;
  state.time = $("fTime").value;
  state.occasion = $("fOccasion").value;

  const matches = matchedVenues();
  state.selected = new Set(matches.map((v) => v.id)); // all pre-selected

  $("browseCount").textContent =
    `${matches.length} ${state.type === "buyout" ? "venue" : "venue"}${matches.length === 1 ? "" : "s"}` +
    (state.area === "all" ? " across Orlando" : ` in ${state.area}`);

  const grid = $("venueGrid");
  grid.innerHTML = "";
  matches.forEach((v, i) => {
    const priceLabel = state.type === "buyout"
      ? `from ${usd.format(v.buyout[0])}`
      : `from ${usd.format(v.band[0])}`;
    const priceSuffix = state.type === "buyout" ? "/ venue" : "/ table";
    const card = document.createElement("article");
    card.className = "v-card selected";
    card.style.animationDelay = `${i * 45}ms`;
    card.dataset.id = v.id;
    card.innerHTML = `
      <div class="v-photo" style="background:linear-gradient(150deg,${v.g[0]},${v.g[1]})">
        ${v.glyph}
        ${v.fav ? `<span class="v-fav">Guest favorite</span>` : ""}
        <button class="v-heart" type="button" aria-label="Add or remove ${v.name}">
          <svg viewBox="0 0 32 32"><path d="M16 28C7.9 22.7 3 17.9 3 12.4 3 8.3 6.3 5 10.4 5c2.4 0 4.6 1.1 6 2.9C17.7 6.1 19.9 5 22.3 5 26.4 5 29 8.3 29 12.4c0 5.5-4.9 10.3-13 15.6z"/></svg>
        </button>
      </div>
      <div class="v-body">
        <div class="v-top">
          <span class="v-name">${v.name}</span>
          <span class="v-rating">${starSvg()} ${v.rating.toFixed(2)}</span>
        </div>
        <div class="v-area">${v.area}</div>
        <div class="v-tags">${v.tags}</div>
        <div class="v-price"><b>${priceLabel}</b> ${priceSuffix}</div>
      </div>`;
    card.addEventListener("click", () => toggleVenue(v.id, card));
    grid.appendChild(card);
  });

  updateSendbar();
}

function toggleVenue(id, card) {
  if (state.selected.has(id)) {
    state.selected.delete(id);
    card.classList.replace("selected", "unselected");
  } else {
    state.selected.add(id);
    card.classList.replace("unselected", "selected");
  }
  updateSendbar();
}

function updateSendbar() {
  const n = state.selected.size;
  $("sendCount").textContent = n === 0 ? "No venues selected" : `Request quotes from ${n} venue${n > 1 ? "s" : ""}`;
  $("btnSend").disabled = n === 0;
}

/* ---------- request + simulation engine ---------- */

function startRequest() {
  if (state.selected.size === 0) return;

  // final sync of manual guest field
  const pn = parseInt($("fPartyNum").value, 10);
  if (Number.isFinite(pn)) state.party = Math.min(2000, Math.max(1, pn));

  stopClock(); // clear any prior interval + pending auto-quotes before a fresh run
  state.quotes = [];
  state.booked = null;
  state.humanQuoted = false;
  state.requestOpen = true;
  state.windowEndsAt = Date.now() + WINDOW_MS;

  const ids = [...state.selected];
  state.humanVenueId = ids[rand(0, ids.length - 1)]; // reserved for the human promoter
  $("promoterVenueName").textContent = venueById(state.humanVenueId).name;
  $("promoterDot").classList.add("live");

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
  $("boardSummary").textContent = summaryText();
  $("boardTitle").textContent = "Quotes are coming in";
  $("repliedCount").textContent = "0 replied";
  $("quotesEmpty").innerHTML = WAITING_HTML;
  $("quotesEmpty").classList.remove("hidden");
  $("ring").classList.remove("closed", "urgent");
  $("ringLabel").textContent = "left to quote";

  state.tick = setInterval(tickWindow, 250);
  tickWindow();
  renderQuotes();
  renderPhone();
  showScreen("board");
  toast(`Request texted to ${ids.length} promoters`);
}

function summaryText() {
  return `${state.type === "buyout" ? "Full venue" : "Table"} · ${fmtDate(state.date)} · ${state.time} · ${state.party} people · ${state.occasion}` +
    (state.budget ? ` · budget ${budgetLabel(state.budget)}` : "");
}

function makeAutoQuote(venueId) {
  const v = venueById(venueId);
  const band = state.type === "buyout" ? v.buyout : v.band;
  let total = rand(band[0], band[1]);

  if (state.type === "table" && state.party > 6) total *= 1 + (state.party - 6) * 0.05;
  if (state.budget) {
    // promoters anchor to the stated total: most land near or just under budget
    total = total * 0.3 + state.budget * 0.7;
    total = Math.min(total, state.budget * 1.06);
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
  if (q.source === "human") toast("Your quote is live on the customer's board");
}

function tickWindow() {
  if (!state.requestOpen) { stopClock(); return; } // guard against orphaned intervals
  const left = state.windowEndsAt - Date.now();
  const ring = $("ring");
  if (left <= 0) {
    state.requestOpen = false;
    stopClock();
    ring.classList.add("closed");
    ring.classList.remove("urgent");
    ring.style.setProperty("--p", 0);
    $("ringTime").textContent = "0:00";
    $("ringLabel").textContent = "window closed";
    $("boardTitle").textContent = state.quotes.length
      ? "Quoting closed · compare and book"
      : "Quoting closed · no replies";
    renderQuotes();
    renderPhone();
    return;
  }
  const frac = left / WINDOW_MS;
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
  const empty = $("quotesEmpty");
  empty.classList.toggle("hidden", state.quotes.length > 0);
  if (state.quotes.length === 0) {
    empty.innerHTML = state.requestOpen
      ? WAITING_HTML
      : `<p>No promoters replied before the window closed.<br><small>Head back and try more venues or another night.</small></p>`;
  }

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
    if (state.quotes.length > 1 && q.total === bestPrice) badges.push(`<span class="quote-badge best">Best price</span>`);
    if (state.quotes.length > 1 && q.deposit === lowDep && q.total !== bestPrice) badges.push(`<span class="quote-badge lowdep">Lowest deposit</span>`);
    if (q.source === "human") badges.push(`<span class="quote-badge human">Your live quote</span>`);

    const card = document.createElement("article");
    card.className = "quote-card";
    card.innerHTML = `
      <div class="quote-emblem" style="background:linear-gradient(150deg,${v.g[0]},${v.g[1]})">${v.glyph}</div>
      <div class="quote-main">
        <div class="quote-venue">${v.name} <span class="v-rating">${starSvg()} ${v.rating.toFixed(2)}</span> ${badges.join(" ")}</div>
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
    note.textContent = `Quote window closed · ${state.quotes.length} of ${state.selected.size} venues replied`;
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
    <div class="bline"><span>${state.type === "buyout" ? "Full venue" : "Table"} · ${state.party} people</span><b>${fmtDate(state.date)} · ${state.time}</b></div>
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
    stopClock();

    const v = venueById(q.venueId);
    const code = "BK-ORL-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    $("confirmVenue").textContent = v.name;
    $("confirmCode").innerHTML = `Confirmation <b>${code}</b>`;
    $("confirmLines").innerHTML = `
      <div class="bline"><span>${state.type === "buyout" ? "Full venue" : "Table"} · ${state.party} people · ${state.occasion}</span><b>${fmtDate(state.date)} · ${state.time}</b></div>
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

  // empty state: no live request yet
  if (!v || (!state.requestOpen && !state.humanQuoted && state.quotes.length === 0 && !state.booked)) {
    screen.innerHTML = `
      <div class="pa">
        <div class="pa-top"><span class="pa-brand">bookout<i>◈</i> <b>for venues</b></span></div>
        <div class="pa-empty">No open requests right now.<br><br>Close this panel and send a booking request as a customer. It arrives here as a text and shows up in your venue app.</div>
      </div>`;
    return;
  }

  const budgetLine = state.budget ? `, budget ${budgetLabel(state.budget)}` : "";
  const smsCopy = `New request on BookOut: ${state.type === "buyout" ? "full venue" : "table"} for ${state.party} on ${fmtDate(state.date)} ${state.time}${budgetLine}. Quote in your app: bkout.app/q/7F3K`;

  const tag = state.requestOpen
    ? `<span class="pa-tag open">Open · ${$("ringTime").textContent} left</span>`
    : `<span class="pa-tag closed">Window closed</span>`;

  const requestCard = `
    <div class="pa-alert">
      <div class="pa-alert-ic">📩</div>
      <div>
        <b>New request texted to you</b>
        <span>+1 (407) 555-0199 · also in your app below</span>
        <div class="pa-sms">"${smsCopy}"</div>
      </div>
    </div>
    <div class="pa-req">
      <div class="pa-req-head">
        ${tag}
        <span class="pa-req-title">${state.type === "buyout" ? "Full venue" : "Table"} request</span>
      </div>
      <div class="pa-grid">
        <div><small>Date</small><b>${fmtDate(state.date)}</b></div>
        <div><small>Start</small><b>${state.time}</b></div>
        <div><small>Party</small><b>${state.party} people</b></div>
        <div><small>Occasion</small><b>${state.occasion}</b></div>
        <div><small>Area</small><b>${v.area}</b></div>
        <div><small>Budget</small><b>${state.budget ? budgetLabel(state.budget) : "Open"}</b></div>
      </div>
    </div>`;

  let body;
  if (state.humanQuoted) {
    body = quoteStatusCard();
  } else if (!state.requestOpen) {
    body = `<div class="pa-missed">This request's 1-hour window closed before you quoted.<br>You'll be first to know on the next one.</div>`;
  } else {
    body = quoteFormMarkup(v);
  }

  screen.innerHTML = `
    <div class="pa">
      <div class="pa-top"><span class="pa-brand">bookout<i>◈</i> <b>for venues</b></span><span class="pa-venue">${v.name}</span></div>
      <div class="pa-body">${requestCard}${body}</div>
    </div>`;

  if (!state.humanQuoted && state.requestOpen) wireQuoteForm(v);
}

function quoteStatusCard() {
  const mine = state.quotes.find((q) => q.source === "human");
  let status = `<div class="pa-status live">Live on the customer's board. Waiting to hear back.</div>`;
  if (state.booked) {
    const bq = state.quotes.find((q) => q.id === state.booked);
    status = bq && bq.source === "human"
      ? `<div class="pa-status won">🎉 You won the booking. Deposit ${usd.format(bq.deposit)} received.</div>`
      : `<div class="pa-status lost">Booked with another venue this time. Better luck tonight.</div>`;
  }
  return `
    <div class="pa-sent">
      <div class="pa-section-title">Your quote</div>
      <div class="pa-sent-row"><span>Total</span><b>${mine ? usd.format(mine.total) : ""}</b></div>
      <div class="pa-sent-row"><span>Deposit</span><b>${mine ? usd.format(mine.deposit) : ""}</b></div>
      ${status}
    </div>`;
}

function quoteFormMarkup(v) {
  const band = state.type === "buyout" ? v.buyout : v.band;
  const suggested = roundTo((band[0] + band[1]) / 2, 25);
  return `
    <div class="pa-form">
      <div class="pa-section-title">Send your quote</div>
      <div class="qform">
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
          <textarea id="qfNote" placeholder="We'll take care of your group, ask for me at the door."></textarea></label>
        <button class="btn-primary" id="qfSend">Send quote</button>
      </div>
    </div>`;
}

function wireQuoteForm(v) {
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
  state.requestOpen = false;
  stopClock();
  state.quotes = [];
  state.booked = null;
  state.humanVenueId = null;
  state.humanQuoted = false;
  $("promoterDot").classList.remove("live");
  $("promoterVenueName").textContent = "…";
  $("ring").classList.remove("closed", "urgent");
  $("ringLabel").textContent = "left to quote";
  togglePanel(false);
  renderGrid();
  showScreen("browse");
}

function stopClock() {
  clearInterval(state.tick);
  state.tick = null;
  clearTimers();
}

function clearTimers() {
  state.timers.forEach(clearTimeout);
  state.timers = [];
}

function venueById(id) { return VENUES.find((v) => v.id === id); }

function starSvg() {
  return `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1l2.2 4.5 4.8.7-3.5 3.4.8 4.9L8 12.7 3.7 14.5l.8-4.9L1 6.2l4.8-.7z"/></svg>`;
}

function fmtDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function budgetLabel(b) {
  return usd.format(b); // b is a total-dollar number
}

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

let toastTimer = null;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("hidden"), 2600);
}

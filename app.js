/* ============================================================
   BOOKOUT demo · all data, bookings, and approvals simulated.
   Set prices per venue; book a night; the venue approves.
   ============================================================ */

"use strict";

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

/* ============================================================
   TEMP REAL-VENUE PHOTOS · DEMO ONLY · REPLACE BEFORE LAUNCH
   Hotlinked from these venues' own public sites purely so we can
   judge how real photography looks in the UI. Not licensed for
   production use and hotlinks can break at any time. PLAN.md's
   launch checklist blocks going live until these are swapped for
   our own licensed venue photos (with the venues' permission).
   ============================================================ */
const TEMP_REAL_PHOTOS = {
  // The Beacham (downtown Orlando) standing in for Neon Garden
  neon: {
    credit: "The Beacham, Orlando",
    shots: [
      "https://lirp.cdn-website.com/4eb3478d/dms3rep/multi/opt/beacham-home-hero-1-1920w.png",
      "https://lirp.cdn-website.com/4eb3478d/dms3rep/multi/opt/beacham-home-rental-1-1920w.png",
      "https://lirp.cdn-website.com/4eb3478d/dms3rep/multi/opt/beacham-home-rental-2-1920w.png",
    ],
  },
  // Mango's Tropical Cafe (I-Drive) standing in for Palma Social
  palma: {
    credit: "Mango's Tropical Cafe, Orlando",
    shots: [
      "https://cdn.prod.website-files.com/67ee7f2c25ba2cfc9ac41648/67ee7f2c25ba2cfc9ac41816_Mango_s-Orlando-dinner-8-3-2025-_smaller.avif",
      "https://cdn.prod.website-files.com/67ee7f2c25ba2cfc9ac41648/67ee7f2c25ba2cfc9ac41812_Mango_s-Orlando-dinner-8-3-2025-(155-de-174).avif",
      "https://cdn.prod.website-files.com/67ee7f2c25ba2cfc9ac41648/67ee7f2c25ba2cfc9ac41814_Mango_s-Orlando-Evento-Loreal-7-3-2025-(16-de-34).avif",
      "https://cdn.prod.website-files.com/67ee7f2c25ba2cfc9ac41648/67ee7f2c25ba2cfc9ac41813_Mango_s-Orlando-dinner-8-3-2025-(144-de-174).avif",
    ],
  },
  // ICEBAR Orlando (I-Drive) standing in for Club Meridian
  meridian: {
    credit: "ICEBAR Orlando",
    shots: [
      "https://icebarorlando.com/bc/wp-content/uploads/home-hero-ice-landscape.png",
      "https://icebarorlando.com/bc/wp-content/uploads/home-corporate-events-img-1.jpg",
      "https://icebarorlando.com/bc/wp-content/uploads/home-corporate-events-img-4.jpg",
      "https://icebarorlando.com/bc/wp-content/uploads/home-corporate-events-img-6.jpg",
    ],
  },
};

function venuePhotos(v) { return TEMP_REAL_PHOTOS[v.id] || null; }

// background style for a venue surface: real photo when we have one,
// always with the brand gradient underneath as the loading/failure fallback
function photoBg(v, i, angle) {
  const grad = `linear-gradient(${angle || 150}deg,${v.g[0]},${v.g[1]})`;
  const ph = venuePhotos(v);
  const shot = ph && ph.shots[i % ph.shots.length];
  return shot ? `background:url('${shot}') center/cover no-repeat, ${grad}` : `background:${grad}`;
}

/* ---------- state ---------- */

const state = {
  city: "Orlando",        // chosen on the entry screen
  type: "table",          // what a specific booking is for: table or whole-venue buyout
  filter: "table",        // explore filter: "table" | "buyout" (tables are the default)
  range: { start: null, end: null }, // the When picker's date range (null = anytime)
  addons: {},             // tables added onto a buyout: pkgId -> qty
  date: "",
  time: "10:00 PM",
  party: 8,
  occasion: "Night out",
  currentVenueId: null,   // venue open in the detail page
  selectedPkgId: null,    // package chosen in the detail page
  booking: null,          // the live request-to-book: {venueId, pkg, ..., status}
};

// set prices/packages each venue lists upfront (book-and-approve model)
// sign: "included" = LED table sign comes with it · "addon" = +$50, billed at the venue
function venuePackages(v) {
  const t = v.band, b = v.buyout;
  return [
    { id: v.id + "-t1", type: "table", name: "Standard table", price: roundTo(t[0], 25), depPct: 20, cap: "up to 6 guests", sign: "addon",
      includes: ["Reserved table with bottle minimum", "Skip-the-line entry for your group"] },
    { id: v.id + "-t2", type: "table", name: "Dancefloor table", price: roundTo((t[0] + t[1]) / 2, 25), depPct: 20, cap: "up to 10 guests", sign: "addon",
      includes: ["Prime table by the floor", "2 bottles and mixers included", "Skip-the-line entry"] },
    { id: v.id + "-t3", type: "table", name: "VIP booth", price: roundTo(t[1], 25), depPct: 25, cap: "up to 15 guests", sign: "included",
      includes: ["Best booth in the house", "Dedicated server all night", "Champagne on arrival", "Custom LED table sign"] },
    { id: v.id + "-b1", type: "buyout", name: "Full venue buyout", price: roundTo(b[0], 100), depPct: 20, cap: "whole venue", sign: "included",
      includes: ["The entire venue for the night", "Your own guest list", "Dedicated event manager"] },
    { id: v.id + "-b2", type: "buyout", name: "Premium buyout", price: roundTo(b[1], 100), depPct: 25, cap: "whole venue and extras", sign: "included",
      includes: ["Entire venue and rooftop", "Custom production and staffing", "Security and coat check"] },
  ].map((p) => ({ ...p, deposit: roundTo((p.price * p.depPct) / 100, 10) }));
}

const SIGN_PRICE = 50; // LED sign add-on when not included; billed at the venue, not in the deposit

/* canned "AI" sign lines for the demo; production swaps this for a small Claude call */
const SIGN_TEMPLATES = {
  "Birthday": ["Happy Birthday {n}", "{n}'s Big Night", "Cheers to {n}"],
  "Bachelor / bachelorette": ["{n}'s Last Dance", "Team {n} Tonight", "The {n} Party"],
  "Corporate": ["Cheers to the Team", "{n} Night Out", "Big Wins Only"],
  "Celebration": ["Cheers to {n}", "Pop the Champagne", "{n} Did the Thing"],
  "Night out": ["The {n} Crew", "VIP: {n} + Friends", "Good Nights Only"],
};

// no-name variants so we never mangle a template around a missing name
const SIGN_TEMPLATES_NONAME = {
  "Birthday": ["Birthday Mode: ON", "Cheers to Another Year", "Make a Wish"],
  "Bachelor / bachelorette": ["The Last Dance", "One Last Night Out", "Team Forever"],
  "Corporate": ["Cheers to the Team", "Big Wins Only", "Out of Office"],
  "Celebration": ["Pop the Champagne", "We Did the Thing", "Cheers to Us"],
  "Night out": ["Good Nights Only", "The Night Crew", "VIP: Us"],
};

function suggestSigns(occasion, name) {
  const n = (name || "").trim();
  if (!n) return SIGN_TEMPLATES_NONAME[occasion] || SIGN_TEMPLATES_NONAME["Night out"];
  const base = SIGN_TEMPLATES[occasion] || SIGN_TEMPLATES["Night out"];
  return base.map((t) => t.replaceAll("{n}", n));
}

function packageById(v, id) { return venuePackages(v).find((p) => p.id === id); }

/* ============================================================
   Dynamic date pricing + shared calendar
   Ported from Emmett's PR #2 (feature/when-date-range-deals),
   adapted to price the chosen package per night.
   ============================================================ */

const EARLY_BIRD_MAX = 0.18; // biggest early-bird discount, reached ~30 days out
const DOW_NARROW = ["S", "M", "T", "W", "T", "F", "S"]; // calendar header letters (React Aria style)
const MONTHS_AHEAD = 6;

// chevron icons for calendar navigation (ported from the React Aria calendar's header)
const CHEV_L = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M10 3L5.5 8 10 13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CHEV_R = `<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M6 3l4.5 5L6 13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function isoOf(dt) {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function isoAddDays(iso, n) {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return isoOf(dt);
}
function nightsInRange(start, end, cap) {
  if (!start || !end || end < start) return [];
  const out = [];
  let cur = start;
  while (cur <= end && out.length < cap) { out.push(cur); cur = isoAddDays(cur, 1); }
  return out;
}
// deterministic per-week wobble so long ranges vary
function weekWobble(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const wk = Math.floor(Date.UTC(y, m - 1, d) / (7 * 864e5));
  const s = Math.sin(wk * 12.9898) * 43758.5453;
  return 0.94 + (s - Math.floor(s)) * 0.12; // 0.94 .. 1.06
}
function daysOut(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((Date.UTC(y, m - 1, d) - today) / 864e5);
}
// early-bird: 0.6%/day out, capped at EARLY_BIRD_MAX
function earlyBirdDiscount(iso) {
  const out = daysOut(iso);
  if (out <= 0) return 0;
  return Math.min(EARLY_BIRD_MAX, out * 0.006);
}
function earlyBirdFactor(iso) { return 1 - earlyBirdDiscount(iso); }
// weekday demand (weekends peak, midweek quiet)
function busyFactor(iso) {
  if (!iso) return 1;
  const [y, m, d] = iso.split("-").map(Number);
  const wd = new Date(y, m - 1, d).getDay();
  const base = (wd === 5 || wd === 6) ? 1.28 : wd === 4 ? 1.08 : wd === 0 ? 1.00 : 0.82;
  return base * weekWobble(iso);
}
function demandFactor(iso) { return iso ? busyFactor(iso) * earlyBirdFactor(iso) : 1; }
function demandLabel(iso) {
  const f = busyFactor(iso);
  return f >= 1.15 ? "Peak" : f >= 1.0 ? "Busy" : "Quiet";
}
function cheapestNight(start, end) {
  const nights = nightsInRange(start, end, 60);
  if (!nights.length) return start;
  return nights.reduce((best, iso) => demandFactor(iso) < demandFactor(best) ? iso : best, nights[0]);
}
function compactMoney(n) { return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`; }
function monthLabel(y, m) { return new Date(y, m, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" }); }
function fmtShort(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function monthMeta(y, m) { return { startWd: new Date(y, m, 1).getDay(), days: new Date(y, m + 1, 0).getDate() }; }
function calAtMin(y, m) { const n = new Date(); return y < n.getFullYear() || (y === n.getFullYear() && m <= n.getMonth()); }
function calAtMax(y, m) { const n = new Date(); return new Date(y, m, 1) >= new Date(n.getFullYear(), n.getMonth() + MONTHS_AHEAD, 1); }
function calShell(y, m, cells) {
  return `
    <div class="cal-nav">
      <button type="button" class="cal-arrow" data-cal="prev" ${calAtMin(y, m) ? "disabled" : ""} aria-label="Previous month">${CHEV_L}</button>
      <b>${monthLabel(y, m)}</b>
      <button type="button" class="cal-arrow" data-cal="next" ${calAtMax(y, m) ? "disabled" : ""} aria-label="Next month">${CHEV_R}</button>
    </div>
    <div class="cal-grid cal-dow">${DOW_NARROW.map((d) => `<span>${d}</span>`).join("")}</div>
    <div class="cal-grid">${cells}</div>`;
}

// price a package (or a base figure) for a given night
function pkgTypeBase(v, type) {
  const list = venuePackages(v).filter((p) => p.type === type);
  return Math.min(...list.map((p) => p.price));
}
function priceForNight(base, iso) { return roundTo(base * demandFactor(iso), 25); }

const $ = (id) => document.getElementById(id);
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const rand = (min, max) => Math.round(min + Math.random() * (max - min));
const roundTo = (n, step) => Math.round(n / step) * step;

/* ---------- boot ---------- */

(function boot() {
  const d = new Date();
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7)); // next Friday
  $("fDate").value = d.toISOString().slice(0, 10);

  if (Object.keys(TEMP_REAL_PHOTOS).length) {
    console.warn("BookOut: TEMP hotlinked venue photos in use (TEMP_REAL_PHOTOS in app.js). Replace with licensed photos before launch. See PLAN.md.");
  }

  // spotlight glow: share pointer position with the cards via CSS vars on :root
  document.addEventListener("pointermove", (e) => {
    const r = document.documentElement.style;
    r.setProperty("--x", e.clientX.toFixed(1));
    r.setProperty("--y", e.clientY.toFixed(1));
  }, { passive: true });

  bindCity();
  bindBrowse();
  bindWhen();
  bindVenue();
  bindReqModal();
  bindPendingExtras();
  bindPromoterApp();
  bindChat();

  $("logoHome").addEventListener("click", resetAll);
  $("btnNewSearch").addEventListener("click", resetAll);
  document.querySelectorAll(".btn-back").forEach((b) =>
    b.addEventListener("click", () => showScreen(b.dataset.back))
  );

  renderGrid();
})();

/* ---------- browse screen ---------- */

function bindBrowse() {
  // what to book: Tables / Full venues (filters the grid; the venue page follows)
  document.querySelectorAll("#typeToggle .mode-opt, #cmpToggle .mode-opt").forEach((b) =>
    b.addEventListener("click", () => {
      state.filter = b.dataset.filter;
      state.type = state.filter;
      syncFilterUI();
      renderGrid();
      renderCompare(); // keep the compare screen in sync if it's the one showing
    })
  );

  // instant price comparison across every venue
  $("modeLink").addEventListener("click", openCompare);

  $("fDate").addEventListener("change", (e) => { state.date = e.target.value; });
  $("fTime").addEventListener("change", (e) => { state.time = e.target.value; });
  $("fOccasion").addEventListener("change", (e) => { state.occasion = e.target.value; });

  $("fPartyNum").addEventListener("input", (e) => {
    let n = parseInt(e.target.value, 10);
    if (!Number.isFinite(n)) return;
    state.party = Math.min(2000, Math.max(1, n));
    syncWho();
  });
  $("fPartyNum").addEventListener("blur", (e) => {
    e.target.value = state.party;
  });

  // Who popover (guests stepper)
  $("segWho").addEventListener("click", () => {
    $("whenPop").classList.add("hidden");
    $("whoPop").classList.toggle("hidden");
  });
  $("whoDone").addEventListener("click", () => $("whoPop").classList.add("hidden"));
  $("whoMinus").addEventListener("click", () => { state.party = Math.max(1, state.party - 1); $("fPartyNum").value = state.party; syncWho(); });
  $("whoPlus").addEventListener("click", () => { state.party = Math.min(2000, state.party + 1); $("fPartyNum").value = state.party; syncWho(); });

  // search button: apply and jump to the venues
  $("btnGo").addEventListener("click", () => {
    renderGrid();
    const rows = $("bookRows");
    if (rows.scrollIntoView) rows.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function syncWho() {
  $("whoText").textContent = `${state.party} guest${state.party === 1 ? "" : "s"}`;
}

function syncFilterUI() {
  document.querySelectorAll("#typeToggle .mode-opt, #cmpToggle .mode-opt").forEach((x) =>
    x.classList.toggle("active", x.dataset.filter === state.filter)
  );
}

function matchedVenues() {
  return VENUES; // single city in the demo; all venues belong to the chosen city
}

/* ============================================================
   When range picker
   Look and selection behavior ported to vanilla JS from the
   React Aria RangeCalendar (react-aria-components + origin-ui
   styling) that Raz sent. Same rules: pick a start, pick an
   end, earlier click restarts the range; past dates disabled;
   today gets a dot; range middle squares off, ends stay round.
   ============================================================ */

let rcY = null, rcM = null; // month shown in the When popover (lazy: set on first render)

function bindWhen() {
  const pill = $("whenPill"), pop = $("whenPop");
  const openPop = () => {
    const seed = state.range.start || $("fDate").value || isoOf(new Date());
    const [y, m] = seed.split("-").map(Number);
    rcY = y; rcM = m - 1;
    renderRangeCal();
    pop.classList.remove("hidden");
  };
  pill.addEventListener("click", () => {
    $("whoPop").classList.add("hidden");
    if (pop.classList.contains("hidden")) openPop(); else pop.classList.add("hidden");
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".seg-wrap")) { pop.classList.add("hidden"); $("whoPop").classList.add("hidden"); }
  });
  $("whenClear").addEventListener("click", () => {
    state.range = { start: null, end: null };
    syncWhenLabel();
    renderRangeCal();
    renderRows(); // card prices follow your dates
  });
  $("whenDone").addEventListener("click", () => pop.classList.add("hidden"));
  syncWhenLabel();
}

function rcPick(iso) {
  const r = state.range;
  if (!r.start || r.end) state.range = { start: iso, end: null }; // fresh range
  else if (iso < r.start) state.range = { start: iso, end: null }; // earlier click restarts
  else state.range = { start: r.start, end: iso };                 // close the range (same day allowed)

  // the working night follows the range: its start, or the cheapest night inside it
  const nr = state.range;
  state.date = nr.end ? cheapestNight(nr.start, nr.end) : nr.start;
  $("fDate").value = state.date;

  syncWhenLabel();
  renderRangeCal();
  renderRows(); // card prices follow your dates
  renderCompare(); // and the compare screen, if it's the one showing
}

function syncWhenLabel() {
  const r = state.range;
  $("whenLabel").textContent = !r.start ? "Add dates"
    : !r.end ? `${fmtShort(r.start)} · pick an end date`
    : r.start === r.end ? fmtDate(r.start)
    : `${fmtShort(r.start)} to ${fmtShort(r.end)}`;
}

function renderRangeCal() {
  const el = $("rcCal");
  if (!el) return;
  if (rcY == null) { const t = new Date(); rcY = t.getFullYear(); rcM = t.getMonth(); }
  const todayIso = isoOf(new Date());
  const { startWd, days } = monthMeta(rcY, rcM);
  const r = state.range;

  let cells = "";
  for (let i = 0; i < startWd; i++) cells += `<span class="rc-cell empty"></span>`;
  for (let d = 1; d <= days; d++) {
    const iso = isoOf(new Date(rcY, rcM, d));
    const past = iso < todayIso;
    const isStart = r.start === iso, isEnd = r.end === iso;
    const capped = r.start && r.end && r.start !== r.end; // a real two-night range: square the joined edges
    const cls = ["rc-cell",
      past ? "disabled" : "",
      isStart || isEnd ? "sel" : "",
      isStart ? "start" : "", isEnd ? "end" : "",
      capped && (isStart || isEnd) ? "capped" : "",
      r.start && r.end && iso > r.start && iso < r.end ? "mid" : "",
      iso === todayIso ? "today" : ""].filter(Boolean).join(" ");
    cells += past
      ? `<span class="${cls}">${d}</span>`
      : `<button type="button" class="${cls}" data-iso="${iso}">${d}</button>`;
  }

  el.innerHTML = `
    <header class="rc-head">
      <button type="button" class="rc-nav" data-rc="prev" ${calAtMin(rcY, rcM) ? "disabled" : ""} aria-label="Previous month">${CHEV_L}</button>
      <b class="rc-title">${monthLabel(rcY, rcM)}</b>
      <button type="button" class="rc-nav" data-rc="next" ${calAtMax(rcY, rcM) ? "disabled" : ""} aria-label="Next month">${CHEV_R}</button>
    </header>
    <div class="rc-grid rc-dow">${DOW_NARROW.map((x) => `<span>${x}</span>`).join("")}</div>
    <div class="rc-grid">${cells}</div>`;

  el.querySelector('[data-rc="prev"]').addEventListener("click", () => { rcM--; if (rcM < 0) { rcM = 11; rcY--; } renderRangeCal(); });
  el.querySelector('[data-rc="next"]').addEventListener("click", () => { rcM++; if (rcM > 11) { rcM = 0; rcY++; } renderRangeCal(); });
  el.querySelectorAll(".rc-cell[data-iso]").forEach((b) => b.addEventListener("click", () => rcPick(b.dataset.iso)));
}

function renderGrid() {
  // sync current filter values into state
  state.date = $("fDate").value;
  state.time = $("fTime").value;
  state.occasion = $("fOccasion").value;
  syncWho();
  renderRows();
}

/* ---- book mode: Airbnb-look photo carousels ---- */

function nightWord() {
  if (!state.date) return "Fri";
  const [y, m, d] = state.date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short" });
}

// one card per venue; the price line follows the Tables / Full venues filter
function bookCard(v) {
  const min = priceForNight(pkgTypeBase(v, state.filter), state.date);
  const priceLine = state.filter === "table" ? `Tables from ${usd.format(min)}` : `Full venue from ${usd.format(min)}`;
  return `<article class="pcard" data-id="${v.id}">
    <div class="pcard-photo" style="${photoBg(v, 0)}">
      ${venuePhotos(v) ? "" : `<span class="pcard-glyph">${v.glyph}</span>`}
      ${v.fav ? `<span class="pcard-fav">Guest favorite</span>` : ""}
      <button type="button" class="pcard-heart" aria-label="Save ${v.name}"><svg viewBox="0 0 32 32"><path d="M16 28C7.9 22.7 3 17.9 3 12.4 3 8.3 6.3 5 10.4 5c2.4 0 4.6 1.1 6 2.9C17.7 6.1 19.9 5 22.3 5 26.4 5 29 8.3 29 12.4c0 5.5-4.9 10.3-13 15.6z"/></svg></button>
    </div>
    <div class="pcard-name">${v.name} · ${v.area}</div>
    <div class="pcard-sub">${priceLine}</div>
    <div class="pcard-sub">${starSvg()} ${v.rating.toFixed(2)} · ${nightWord()} night</div>
  </article>`;
}

function renderRows() {
  $("exploreTitle").textContent = state.filter === "table" ? `Tables in ${state.city}` : `Full venues in ${state.city}`;
  // venues with real photos lead, so the page opens photo-first
  const vs = [...matchedVenues()].sort((a, b) => (venuePhotos(b) ? 1 : 0) - (venuePhotos(a) ? 1 : 0));
  $("exploreGrid").innerHTML = vs.map(bookCard).join("");
  $("exploreGrid").querySelectorAll(".pcard").forEach((c) =>
    c.addEventListener("click", () => openVenue(c.dataset.id)) // pick tables or the whole venue inside
  );
  $("exploreGrid").querySelectorAll(".pcard-heart").forEach((h) =>
    h.addEventListener("click", (e) => { e.stopPropagation(); h.classList.toggle("on"); })
  );
}

/* ---- compare prices: instant, no quotes, no waiting ---- */

// the window we compare across: your chosen dates, or the next 4 weeks
function compareWindow() {
  const today = isoOf(new Date());
  const r = state.range;
  if (r.start && r.end && r.end >= today) {
    return { start: r.start >= today ? r.start : today, end: r.end, ranged: true };
  }
  return { start: today, end: isoAddDays(today, 27), ranged: false };
}

function openCompare() {
  renderCompare();
  showScreen("compare");
}

function renderCompare() {
  const el = $("cmpList");
  if (!el) return;
  const type = state.filter;
  const { start, end, ranged } = compareWindow();
  const nights = nightsInRange(start, end, 42);

  // each venue's cheapest night in the window, priced for the chosen type
  const rows = matchedVenues().map((v) => {
    const base = pkgTypeBase(v, type);
    const best = nights.reduce((acc, iso) => {
      const p = priceForNight(base, iso);
      return p < acc.price ? { iso, price: p } : acc;
    }, { iso: nights[0], price: priceForNight(base, nights[0]) });
    return { v, night: best.iso, price: best.price, deposit: roundTo(best.price * 0.2, 10) };
  }).sort((a, b) => a.price - b.price);

  $("cmpTitle").textContent = type === "table" ? "Tables, compared" : "Full venues, compared";
  $("cmpSub").textContent = `${ranged ? `${fmtShort(start)} to ${fmtShort(end)}` : "Next 4 weeks"} · ${state.party} people · each place's cheapest night, deposit held until the venue approves`;

  el.innerHTML = rows.map((r, i) => `
    <button type="button" class="cmp-row${i === 0 ? " best" : ""}" data-id="${r.v.id}" data-night="${r.night}">
      <span class="cmp-thumb" style="${photoBg(r.v, 0)}">${venuePhotos(r.v) ? "" : r.v.glyph}</span>
      <span class="cmp-main">
        <b>${r.v.name}${i === 0 ? ` <i class="cmp-badge">Best price</i>` : ""}</b>
        <small>${r.v.area} · ${starSvg()} ${r.v.rating.toFixed(2)}</small>
      </span>
      <span class="cmp-night">
        <b>${fmtDate(r.night)}</b>
        <small>${demandLabel(r.night)} night</small>
      </span>
      <span class="cmp-price">
        <b>${usd.format(r.price)}</b>
        <small>you pay ${usd.format(r.deposit)} now</small>
      </span>
      <span class="cmp-go" aria-hidden="true">Book →</span>
    </button>`).join("");

  el.querySelectorAll(".cmp-row").forEach((rowEl) =>
    rowEl.addEventListener("click", () => {
      state.date = rowEl.dataset.night; // jump straight to that venue on its cheapest night
      $("fDate").value = state.date;
      openVenue(rowEl.dataset.id);
    })
  );
}

/* ---------- book-and-approve flow (default) ---------- */

function bindVenue() {
  $("venueBack").addEventListener("click", () => showScreen("browse"));
  // clicking anywhere outside the booking card folds its panels back up
  document.addEventListener("click", (e) => {
    const cal = $("vbCalPanel"), gp = $("vbGuestPanel");
    if (!cal && !gp) return;
    if (!e.target.closest(".vd-book")) {
      if (cal) cal.classList.remove("open");
      if (gp) gp.classList.remove("open");
      const n = $("vbNight"), g = $("vbGuests");
      if (n) n.classList.remove("expanded");
      if (g) g.classList.remove("expanded");
    }
  });
}

function openVenue(id) {
  state.currentVenueId = id;
  state.selectedPkgId = null;
  state.addons = {};
  syncNight();
  renderVenue();
  showScreen("venue");
}

function syncNight() {
  const pn = parseInt($("fPartyNum").value, 10);
  if (Number.isFinite(pn)) state.party = Math.min(2000, Math.max(1, pn));
  state.date = $("fDate").value;
  state.time = $("fTime").value;
  state.occasion = $("fOccasion").value;
}

const AMENITY_POOL = ["Full bar", "Bottle service", "Coat check", "Premium sound system", "Skip-the-line entry", "Card and cash", "Outdoor area", "Private restrooms"];

function venueBlurb(v) {
  const t = v.tags.split(" · ");
  return `${v.name} is a ${t[0].toLowerCase()} spot in ${v.area}${t[1] ? `, known for ${t[1].toLowerCase()}` : ""}. Reserve a table or take the whole room, then lock your night below.`;
}
function venueAmenities(v) {
  const fromTags = v.tags.split(" · ");
  return [...new Set([...fromTags, ...AMENITY_POOL])].slice(0, 6);
}
function venueCapacity(v) { return `Up to ${roundTo(v.buyout[1] / 40, 10)} guests`; }

// deterministic fake review count for the demo (real reviews come with real venues)
function reviewsOf(v) {
  let s = 0;
  for (const ch of v.id) s += ch.charCodeAt(0);
  return 46 + (s % 180);
}

let calY, calM; // month shown in the venue night calendar

function renderVenue() {
  const v = venueById(state.currentVenueId);
  const pkgs = venuePackages(v);
  const groups = [
    { label: "Full venue", list: pkgs.filter((p) => p.type === "buyout") },
    { label: "Tables", list: pkgs.filter((p) => p.type === "table") },
  ];
  if (state.type === "table") groups.reverse();

  const pkgHtml = groups.map((g) => `
    <div class="pkg-group">
      <h3 class="pkg-group-title">${g.label}</h3>
      ${g.list.map((p) => `
        <button type="button" class="pkg" data-pkg="${p.id}">
          <span class="pkg-radio" aria-hidden="true"></span>
          <span class="pkg-main">
            <span class="pkg-top"><b>${p.name}</b><span class="pkg-cap">${p.cap}</span></span>
            <span class="pkg-inc">${p.includes.join(" · ")}</span>
          </span>
          <span class="pkg-price"><b>from ${usd.format(p.price)}</b><span>price varies by night</span></span>
        </button>`).join("")}
    </div>`).join("");

  const ph = venuePhotos(v);
  const kind = v.tags.split(" · ")[0];
  $("venueDetail").innerHTML = `
    <div class="vd">
      <div class="vd-titlebar">
        <h1 class="vd-name">${v.name}</h1>
        <div class="vd-actions">
          <button type="button" class="vd-action" id="vdShare">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M12 3l-4 4M12 3l4 4M5 13v6h14v-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Share
          </button>
          <button type="button" class="vd-action" id="vdSave">
            <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 28C7.9 22.7 3 17.9 3 12.4 3 8.3 6.3 5 10.4 5c2.4 0 4.6 1.1 6 2.9C17.7 6.1 19.9 5 22.3 5 26.4 5 29 8.3 29 12.4c0 5.5-4.9 10.3-13 15.6z" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>
            Save
          </button>
        </div>
      </div>

      <div class="vd-mosaic">
        <div class="vm-hero" style="${photoBg(v, 0)}">${ph ? "" : `<span class="vd-glyph">${v.glyph}</span>`}</div>
        <div class="vm-right">
          <div class="vm-tile" style="${photoBg(v, 1, 130)}"></div>
          <div class="vm-tile" style="${photoBg(v, 2, 155)}"></div>
          <div class="vm-tile" style="${photoBg(v, 3, 180)}"></div>
          <div class="vm-tile" style="${photoBg(v, 4, 205)}"></div>
        </div>
        <button type="button" class="vm-all" id="vdAllPhotos">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="5" r="1.6"/><circle cx="12" cy="5" r="1.6"/><circle cx="19" cy="5" r="1.6"/><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/><circle cx="5" cy="19" r="1.6"/><circle cx="12" cy="19" r="1.6"/><circle cx="19" cy="19" r="1.6"/></svg>
          Show all photos
        </button>
      </div>
      ${ph ? `<p class="vd-photo-credit">Demo photos: ${ph.credit} (temporary stand-ins, replaced with licensed photos before launch)</p>` : ""}

      <div class="vd-cols">
        <div class="vd-left">
          <div class="vd-sub2">
            <h2>${kind} in ${v.area}, ${state.city}</h2>
            <p>${venueCapacity(v)} · 9:00 PM to 2:00 AM · ${v.tags}</p>
          </div>

          ${v.fav ? `
          <div class="vd-favbox">
            <div class="favbox-title"><b>Guest<br>favorite</b></div>
            <p class="favbox-copy">One of the most loved venues on BookOut, according to guests</p>
            <div class="favbox-rating"><b>${v.rating.toFixed(2)}</b><span class="favbox-stars">${starSvg()}${starSvg()}${starSvg()}${starSvg()}${starSvg()}</span></div>
            <div class="favbox-reviews"><b>${reviewsOf(v)}</b><span>Reviews</span></div>
          </div>` : `
          <div class="vd-ratingline">${starSvg()} <b>${v.rating.toFixed(2)}</b> · ${reviewsOf(v)} reviews</div>`}

          <p class="vd-blurb">${venueBlurb(v)}</p>

          <div class="vd-amen">
            <h3>What's here</h3>
            <ul class="vd-amen-list">${venueAmenities(v).map((a) => `<li>${a}</li>`).join("")}</ul>
          </div>

          <h2 class="venue-section">Choose what to book</h2>
          <div class="pkgs">${pkgHtml}</div>

          <div id="vdAddons"></div>
        </div>

        <aside class="vd-book">
          <div class="vd-book-card">
            <div class="vb-price" id="vbPrice"></div>

            <div class="vb-fields">
              <button type="button" class="vb-field" id="vbNight" aria-haspopup="dialog" aria-controls="vbCalPanel">
                <small>Night</small><b id="vbNightVal"></b>
              </button>
              <button type="button" class="vb-field" id="vbGuests" aria-haspopup="dialog" aria-controls="vbGuestPanel">
                <small>Guests</small><b id="vbGuestsVal"></b>
                <svg class="vb-chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>
            </div>

            <div class="vb-panel vb-calpanel" id="vbCalPanel" role="region" aria-label="Pick your night">
              <div class="vb-panel-inner"><div class="vb-panel-pad">
                <div class="vb-calhead">
                  <b>Pick your night</b>
                  <span class="vb-hint" id="vdDealsHint"></span>
                </div>
                <div class="vd-cal" id="vdCal"></div>
                <div class="vb-calfoot">
                  <button type="button" class="btn-textlink" id="vbCheapest">Jump to cheapest night</button>
                  <button type="button" class="vb-close" id="vbCalClose">Close</button>
                </div>
              </div></div>
            </div>

            <div class="vb-panel vb-guestpanel" id="vbGuestPanel" role="region" aria-label="How many guests">
              <div class="vb-panel-inner"><div class="vb-panel-pad">
                <div class="who-row">
                  <div><b>Guests</b><small>Your whole group, big is fine</small></div>
                  <div class="stepper">
                    <button type="button" class="step-btn" id="vbGMinus" aria-label="Fewer guests">-</button>
                    <b class="step-qty" id="vbGQty"></b>
                    <button type="button" class="step-btn" id="vbGPlus" aria-label="More guests">+</button>
                  </div>
                </div>
                <div class="vb-calfoot">
                  <span></span>
                  <button type="button" class="vb-close" id="vbGuestClose">Done</button>
                </div>
              </div></div>
            </div>

            <div class="vb-note" id="vbDep"></div>
            <button type="button" class="btn-primary btn-big" id="bfRequest" disabled>Book this night</button>
            <p class="vb-fine">Deposit charged now and credited to your bill. Refunded in full, instantly, if the club can't host you.</p>
          </div>
        </aside>
      </div>
    </div>`;

  $("bfRequest").addEventListener("click", openReqModal);

  // Airbnb-style: fields stay compact, sections unfold inside the card
  const calPanel = $("vbCalPanel"), guestPanel = $("vbGuestPanel");
  $("vbNight").addEventListener("click", () => {
    guestPanel.classList.remove("open");
    calPanel.classList.toggle("open");
    $("vbGuests").classList.remove("expanded");
    $("vbNight").classList.toggle("expanded", calPanel.classList.contains("open"));
  });
  $("vbGuests").addEventListener("click", () => {
    calPanel.classList.remove("open");
    guestPanel.classList.toggle("open");
    $("vbNight").classList.remove("expanded");
    $("vbGuests").classList.toggle("expanded", guestPanel.classList.contains("open"));
  });
  const closePanels = () => {
    calPanel.classList.remove("open");
    guestPanel.classList.remove("open");
    $("vbNight").classList.remove("expanded");
    $("vbGuests").classList.remove("expanded");
  };
  $("vbCalClose").addEventListener("click", closePanels);
  $("vbGuestClose").addEventListener("click", closePanels);
  $("vbCheapest").addEventListener("click", () => {
    const { start, end } = compareWindow();
    state.date = cheapestNight(start, end);
    $("fDate").value = state.date;
    const [y, m] = state.date.split("-").map(Number);
    calY = y; calM = m - 1;
    renderVenueCalendar();
  });
  const bump = (d) => {
    state.party = Math.min(2000, Math.max(1, state.party + d));
    $("fPartyNum").value = state.party;
    syncWho();
    updateBookCard();
  };
  $("vbGMinus").addEventListener("click", () => bump(-1));
  $("vbGPlus").addEventListener("click", () => bump(1));
  $("vdShare").addEventListener("click", () => {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(`https://bkout.app/v/${v.id}`);
    toast("Link copied. Send it to the group chat.");
  });
  $("vdSave").addEventListener("click", (e) => {
    e.currentTarget.classList.toggle("saved");
    toast(e.currentTarget.classList.contains("saved") ? `${v.name} saved` : `${v.name} removed from saves`);
  });
  $("vdAllPhotos").addEventListener("click", () => toast("Full photo sets arrive with each venue's press kit (demo)"));
  $("venueDetail").querySelectorAll(".pkg").forEach((btn) =>
    btn.addEventListener("click", () => selectPackage(btn.dataset.pkg))
  );

  state.selectedPkgId = null;
  // start the calendar on the month of the chosen night (default from browse)
  const seed = (state.date && daysOut(state.date) >= 0) ? state.date : isoOf(new Date());
  const [sy, sm] = seed.split("-").map(Number);
  calY = sy; calM = sm - 1;
  if (!state.date || daysOut(state.date) < 0) state.date = seed;
  renderVenueCalendar();
}

function selectPackage(pkgId) {
  state.selectedPkgId = pkgId;
  const v = venueById(state.currentVenueId);
  const p = packageById(v, pkgId);
  if (!p || p.type !== "buyout") state.addons = {}; // added tables only ride on a buyout
  $("venueDetail").querySelectorAll(".pkg").forEach((b) => b.classList.toggle("sel", b.dataset.pkg === pkgId));
  renderVenueCalendar(); // prices update to the chosen package
}

/* ---- add tables onto a full-venue buyout ---- */

function renderAddons() {
  const box = $("vdAddons");
  if (!box) return;
  const v = venueById(state.currentVenueId);
  const p = state.selectedPkgId ? packageById(v, state.selectedPkgId) : null;
  if (!p || p.type !== "buyout") { box.innerHTML = ""; return; }

  const tables = venuePackages(v).filter((x) => x.type === "table");
  box.innerHTML = `
    <div class="vd-addons">
      <div class="vd-addons-head">
        <h3>Add tables to your buyout</h3>
        <span>Reserved tables inside your event, for VIPs and bottle service. Each has its own deposit.</span>
      </div>
      ${tables.map((t) => {
        const qty = state.addons[t.id] || 0;
        const each = priceForNight(t.price, state.date);
        return `<div class="addon${qty ? " has" : ""}">
          <div class="addon-main">
            <b>${t.name}</b>
            <span>${t.cap} · ${usd.format(each)} for ${fmtShort(state.date)}</span>
          </div>
          <div class="stepper" data-addon="${t.id}">
            <button type="button" class="step-btn" data-step="-1" ${qty === 0 ? "disabled" : ""} aria-label="Remove one ${t.name}">-</button>
            <b class="step-qty">${qty}</b>
            <button type="button" class="step-btn" data-step="1" ${qty >= 8 ? "disabled" : ""} aria-label="Add one ${t.name}">+</button>
          </div>
        </div>`;
      }).join("")}
    </div>`;

  box.querySelectorAll(".step-btn").forEach((btn) =>
    btn.addEventListener("click", () => {
      const id = btn.closest(".stepper").dataset.addon;
      const next = Math.min(8, Math.max(0, (state.addons[id] || 0) + Number(btn.dataset.step)));
      if (next === 0) delete state.addons[id]; else state.addons[id] = next;
      renderAddons();
      updateBookCard();
    })
  );
}

function renderVenueCalendar() {
  const v = venueById(state.currentVenueId);
  const p = state.selectedPkgId ? packageById(v, state.selectedPkgId) : null;
  const base = p ? p.price : pkgTypeBase(v, state.type);
  const todayIso = isoOf(new Date());
  const { startWd, days } = monthMeta(calY, calM);

  const selectable = [];
  for (let d = 1; d <= days; d++) { const iso = isoOf(new Date(calY, calM, d)); if (iso >= todayIso) selectable.push(iso); }
  const minF = selectable.length ? Math.min(...selectable.map(demandFactor)) : 1;

  const r = state.range;
  const ranged = r.start && r.end;

  let cells = "";
  for (let i = 0; i < startWd; i++) cells += `<div class="cal-cell empty"></div>`;
  for (let d = 1; d <= days; d++) {
    const iso = isoOf(new Date(calY, calM, d));
    const today = iso === todayIso;
    if (iso < todayIso) { cells += `<div class="cal-cell past"><span class="cal-num">${d}</span></div>`; continue; }
    const total = priceForNight(base, iso);
    const deal = demandFactor(iso) <= minF * 1.0001;
    const eb = Math.round(earlyBirdDiscount(iso) * 100);
    const picked = iso === state.date;
    const inRange = ranged && iso >= r.start && iso <= r.end;
    const tag = deal ? `<span class="cal-tag">Deal</span>` : eb >= 5 ? `<span class="cal-tag early">-${eb}%</span>` : "";
    cells += `<button type="button" class="cal-cell priced${picked ? " is-picked" : ""}${deal ? " is-deal" : ""}${inRange ? " in-range" : ""}${today ? " is-today" : ""}" data-iso="${iso}">
      <span class="cal-dot lvl-${demandLabel(iso).toLowerCase()}"></span>
      <span class="cal-num">${d}</span>
      <span class="cal-price">${compactMoney(total)}</span>
      ${tag}</button>`;
  }

  $("vdCal").innerHTML = calShell(calY, calM, cells);
  $("vdCal").querySelector('[data-cal="prev"]').addEventListener("click", () => { calM--; if (calM < 0) { calM = 11; calY--; } renderVenueCalendar(); });
  $("vdCal").querySelector('[data-cal="next"]').addEventListener("click", () => { calM++; if (calM > 11) { calM = 0; calY++; } renderVenueCalendar(); });
  $("vdCal").querySelectorAll(".cal-cell[data-iso]").forEach((btn) =>
    btn.addEventListener("click", () => { state.date = btn.dataset.iso; renderVenueCalendar(); })
  );
  $("vdDealsHint").textContent = ranged
    ? `Your dates ${fmtShort(r.start)} to ${fmtShort(r.end)} are highlighted. Cheapest nights are ringed.`
    : "Highlighted nights are cheapest. Midweek and booking early save the most.";
  renderAddons(); // add-on table prices follow the picked night
  updateBookCard();
}

// the docked booking card: price for the picked night, book button state
function updateBookCard() {
  const cb = currentBooking();
  const v = venueById(state.currentVenueId);
  $("vbNightVal").textContent = fmtDate(state.date);
  $("vbGuestsVal").textContent = `${state.party} guest${state.party === 1 ? "" : "s"}`;
  $("vbGQty").textContent = state.party;
  if (!cb) {
    const from = priceForNight(pkgTypeBase(v, state.filter), state.date);
    $("vbPrice").innerHTML = `<b>from ${usd.format(from)}</b> <span>for ${fmtDate(state.date)}</span>`;
    $("vbDep").textContent = "Choose what to book on the left";
    $("bfRequest").disabled = true;
  } else {
    const n = cb.addons.reduce((s, a) => s + a.qty, 0);
    $("vbPrice").innerHTML = `<b>${usd.format(cb.total)}</b> <span>${cb.p.name}${n ? ` + ${n} table${n > 1 ? "s" : ""}` : ""} · ${fmtDate(state.date)}</span>`;
    $("vbDep").textContent = `${usd.format(cb.deposit)} deposit today · refunded instantly if the club can't host`;
    $("bfRequest").disabled = false;
  }
}

// the price + deposit for the current package (plus any added tables) on the current night
function currentBooking() {
  const v = venueById(state.currentVenueId);
  const p = state.selectedPkgId ? packageById(v, state.selectedPkgId) : null;
  if (!p) return null;
  const base = priceForNight(p.price, state.date);
  let deposit = (base * p.depPct) / 100;
  const addons = [];
  if (p.type === "buyout") {
    for (const t of venuePackages(v).filter((x) => x.type === "table")) {
      const qty = state.addons[t.id] || 0;
      if (!qty) continue;
      const each = priceForNight(t.price, state.date);
      addons.push({ id: t.id, name: t.name, qty, each, line: each * qty });
      deposit += (each * qty * t.depPct) / 100; // each table keeps its own deposit rate
    }
  }
  const total = base + addons.reduce((s, a) => s + a.line, 0);
  return { v, p, base, addons, total, deposit: roundTo(deposit, 10), night: state.date };
}

function bindReqModal() {
  $("reqClose").addEventListener("click", () => $("reqBackdrop").classList.add("hidden"));
  $("reqBackdrop").addEventListener("click", (e) => { if (e.target === $("reqBackdrop")) $("reqBackdrop").classList.add("hidden"); });
  $("reqSubmit").addEventListener("click", submitBooking);
}

/* ---- post-booking extras: personalize AFTER the card is charged ---- */

function bindPendingExtras() {
  // time and occasion edits flow straight into the live booking
  $("fTime").addEventListener("change", () => { if (state.booking) state.booking.time = state.time; });
  $("fOccasion").addEventListener("change", () => { if (state.booking) state.booking.occasion = state.occasion; });

  $("signText").addEventListener("input", (e) => setBookingSign(e.target.value));

  // LED sign: canned "AI" suggestions in the demo (production: a small Claude call)
  $("signSuggest").addEventListener("click", () => {
    const occ = state.booking ? state.booking.occasion : state.occasion;
    const lines = suggestSigns(occ, $("signName").value);
    const box = $("signChips");
    box.innerHTML = lines.map((l) => `<button type="button" class="chip" data-sign="${l}">${l}</button>`).join("");
    box.classList.remove("hidden");
    box.querySelectorAll(".chip").forEach((c) =>
      c.addEventListener("click", () => {
        $("signText").value = c.dataset.sign;
        setBookingSign(c.dataset.sign);
        box.querySelectorAll(".chip").forEach((x) => x.classList.toggle("active", x === c));
      })
    );
  });
}

function setBookingSign(text) {
  const b = state.booking;
  if (!b) return;
  const t = (text || "").trim();
  b.sign = t ? { text: t, price: b.pkg.sign === "included" ? 0 : SIGN_PRICE } : null;
}

// reset the extras form for a fresh booking
function prepPendingExtras() {
  const b = state.booking;
  if (!b) return;
  $("signCost").textContent = b.pkg.sign === "included" ? "Included with your booking" : `+${usd.format(SIGN_PRICE)}, billed at the venue`;
  $("signText").value = "";
  $("signName").value = "";
  $("signChips").innerHTML = "";
  $("signChips").classList.add("hidden");
  $("fTime").value = b.time;
  $("fOccasion").value = b.occasion;
}

function openReqModal() {
  const cb = currentBooking();
  if (!cb) return;
  const { v, p, base, addons, total, deposit } = cb;
  const eb = Math.round(earlyBirdDiscount(state.date) * 100);
  $("reqVenue").textContent = v.name;
  $("reqSummary").innerHTML = `
    <div class="bline"><span>${p.name} · ${demandLabel(state.date)} night${eb >= 5 ? ` · early bird -${eb}%` : ""}</span><b>${usd.format(base)}</b></div>
    ${addons.map((a) => `<div class="bline"><span>${a.qty}× ${a.name} (added)</span><b>${usd.format(a.line)}</b></div>`).join("")}
    ${addons.length ? `<div class="bline"><span>Night total</span><b>${usd.format(total)}</b></div>` : ""}
    <div class="bline"><span>${p.type === "buyout" ? "Full venue" : "Table"} · ${state.party} people</span><b>${fmtDate(state.date)} · ${state.time}</b></div>
    <div class="bline"><span>Includes</span><b>${p.includes.join("<br>")}</b></div>
    <div class="bline total"><span>Deposit charged now</span><b>${usd.format(deposit)}</b></div>`;
  $("reqDep").textContent = usd.format(deposit);
  $("reqBackdrop").classList.remove("hidden");
}

function submitBooking() {
  const cb = currentBooking();
  if (!cb) return;
  const { v, p, addons, total, deposit } = cb;
  const btn = $("reqSubmit");
  btn.classList.add("paying");
  btn.firstChild.textContent = "Charging your card… ";

  setTimeout(() => {
    btn.classList.remove("paying");
    btn.firstChild.textContent = "Book this night ";
    state.booking = {
      venueId: v.id,
      venueName: v.name,
      pkg: p,
      addons,
      sign: null, // personalized after booking, on the booked screen
      date: state.date,
      time: state.time,
      party: state.party,
      occasion: state.occasion,
      price: total,
      deposit: deposit,
      // split the deposit: organizer-guarantee model, never all-or-nothing.
      // Your card covers the full deposit; friends chip in by link; anything
      // unpaid at the cutoff stays on your card. Real version: Stripe, Phase 3.
      split: {
        code: Math.random().toString(36).slice(2, 6).toUpperCase(),
        target: deposit,
        collected: 0,
        parts: [],
      },
      status: "pending", // the club still confirms behind the scenes
      code: "BK-ORL-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      at: Date.now(),
    };
    $("reqBackdrop").classList.add("hidden");
    prepPendingExtras();
    renderPending();
    showScreen("pending");
    startPendingPoll();
    toast(`Booked. ${v.name} is locking in your night.`);
  }, 900);
}

function renderPending() {
  const b = state.booking;
  if (!b) return;
  const declined = b.status === "declined";
  $("pendingCard").className = "pending card" + (declined ? " declined" : "");
  $("pendingCard").innerHTML = `
    <div class="pending-badge ${declined ? "no" : ""}">${declined ? "Refunded" : "Booked · deposit charged"}</div>
    <h2 class="pending-title">${declined ? `${b.venueName} couldn't host that night` : `You're in at ${b.venueName}`}</h2>
    <p class="pending-sub">${declined
      ? "Your deposit was refunded in full, instantly. Pick another venue or another night."
      : `Your card was charged and your night is booked. ${b.venueName} is locking it in on their end, and in the rare case they can't host you, you're refunded instantly.`}</p>
    <div class="pending-lines">
      <div class="bline"><span>${b.pkg.name}${bookingAddonsLabel(b)}</span><b>${usd.format(b.price)}</b></div>
      ${signLine(b)}
      <div class="bline"><span>${b.pkg.type === "buyout" ? "Full venue" : "Table"} · ${b.party} people · ${b.occasion}</span><b>${fmtDate(b.date)} · ${b.time}</b></div>
      <div class="bline total"><span>Deposit ${declined ? "refunded" : "charged (credited to your bill)"}</span><b>${usd.format(b.deposit)}</b></div>
    </div>
    ${declined
      ? `<button class="btn-primary btn-big" id="pendingRetry">Back to venues</button>`
      : `<div class="pending-live"><span class="pulse-dot"></span> ${b.venueName} is confirming, usually minutes</div>
         <button class="btn-line" id="pendingVenueSide">See it from the club's side →</button>`}`;

  $("pendingExtras").classList.toggle("hidden", declined);
  if (declined) {
    $("pendingRetry").addEventListener("click", resetCustomer);
  } else {
    $("pendingVenueSide").addEventListener("click", enterPromoterHome);
    renderSplit($("splitPending"));
  }
}

// one bline describing the LED sign on a stored booking
function signLine(b) {
  if (!b.sign) return "";
  const cost = b.sign.price ? `+${usd.format(b.sign.price)} at the venue` : "included";
  return `<div class="bline"><span>LED sign: "${b.sign.text}"</span><b>${cost}</b></div>`;
}

/* ---- split the deposit (simulated organizer-guarantee model) ---- */

const FRIEND_POOL = ["Alex", "Jordan", "Sam", "Riley", "Casey", "Dana", "Jesse", "Morgan"];

function splitChipIn() {
  const b = state.booking;
  if (!b || !b.split) return;
  const s = b.split;
  const remaining = s.target - s.collected;
  if (remaining <= 0) return;
  const share = Math.max(5, roundTo(s.target / Math.min(Math.max(b.party, 2), 8), 5));
  const name = FRIEND_POOL[s.parts.length % FRIEND_POOL.length];
  const amount = Math.min(share, remaining);
  s.parts.push({ name, amount });
  s.collected += amount;
}

function renderSplit(el) {
  const b = state.booking;
  if (!el || !b || !b.split) return;
  const s = b.split;
  const pct = Math.min(100, Math.round((s.collected / s.target) * 100));
  const remaining = Math.max(0, s.target - s.collected);
  el.innerHTML = `
    <div class="split">
      <div class="split-head">
        <b>Split the deposit</b>
        <span class="split-link">bkout.app/s/${s.code}</span>
        <button type="button" class="chip split-copy">Copy link</button>
      </div>
      <div class="split-bar"><i style="width:${pct}%"></i></div>
      <div class="split-meta">${usd.format(s.collected)} of ${usd.format(s.target)} chipped in${s.parts.length ? ` · ${s.parts.length} friend${s.parts.length > 1 ? "s" : ""}` : ""}</div>
      ${s.parts.map((p) => `<div class="split-row"><span>${p.name} paid by link</span><b>${usd.format(p.amount)}</b></div>`).join("")}
      <button type="button" class="btn-line split-sim" ${remaining <= 0 ? "disabled" : ""}>${remaining <= 0 ? "Fully covered by friends" : "Simulate a friend chipping in"}</button>
      <p class="split-fine">Never all-or-nothing: your card guarantees the full deposit, friends chip in by link, and whatever's unpaid at the cutoff (24h before your night) just stays on your card. Friends' shares are credited back to you. <em>(Simulated; real version is Stripe, Phase 3.)</em></p>
    </div>`;
  el.querySelector(".split-copy").addEventListener("click", () => {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(`https://bkout.app/s/${s.code}`);
    toast("Split link copied. Send it to the group chat.");
  });
  el.querySelector(".split-sim").addEventListener("click", () => {
    splitChipIn();
    renderSplit(el);
  });
}

let pendingPoll = null;
function startPendingPoll() {
  clearInterval(pendingPoll);
  pendingPoll = setInterval(() => {
    if (!state.booking) { clearInterval(pendingPoll); return; }
    const onPending = !$("screen-pending").classList.contains("hidden");
    if (state.booking.status === "confirmed" && onPending) {
      clearInterval(pendingPoll);
      renderBookingConfirm();
      showScreen("confirm");
    } else if (state.booking.status === "declined" && onPending) {
      renderPending();
    }
  }, 500);
}

function renderBookingConfirm() {
  const b = state.booking;
  if (!b) return;
  clearInterval(pendingPoll);
  $("confirmVenue").textContent = b.venueName;
  $("confirmCode").innerHTML = `Confirmation <b>${b.code}</b>`;
  $("confirmLines").innerHTML = `
    <div class="bline"><span>${b.pkg.name}${bookingAddonsLabel(b)}</span><b>${usd.format(b.price)}</b></div>
    ${(b.addons || []).map((a) => `<div class="bline"><span>Added: ${a.qty}× ${a.name}</span><b>${usd.format(a.line)}</b></div>`).join("")}
    ${signLine(b)}
    <div class="bline"><span>${b.pkg.type === "buyout" ? "Full venue" : "Table"} · ${b.party} people · ${b.occasion}</span><b>${fmtDate(b.date)} · ${b.time}</b></div>
    <div class="bline total"><span>Deposit paid (credited to bill)</span><b>${usd.format(b.deposit)}</b></div>`;
  renderSplit($("splitConfirm"));
}

// short "+ 2 tables" suffix for a stored booking's package line
function bookingAddonsLabel(b) {
  const n = (b.addons || []).reduce((s, a) => s + a.qty, 0);
  return n ? ` + ${n} table${n > 1 ? "s" : ""}` : "";
}

function resetCustomer() {
  clearInterval(pendingPoll);
  state.booking = null;
  state.currentVenueId = null;
  state.selectedPkgId = null;
  showScreen("browse");
}

/* ---------- promoter side: login + dashboard demo ---------- */

const PROMOTER = { venue: null, requests: [] };

function bindPromoterApp() {
  $("btnPromoterEntry").addEventListener("click", () => showScreen("plogin"));
  $("pBackCustomer").addEventListener("click", () => showScreen("city"));
  $("pLogin").addEventListener("click", enterPromoterHome);
  $("pSkip").addEventListener("click", enterPromoterHome);
  $("pLogout").addEventListener("click", () => showScreen("city"));
}

function enterPromoterHome(e) {
  if (e) e.preventDefault();
  initPromoterHome();
  showScreen("phome");
}

function initPromoterHome() {
  // if the customer has a live request, you are that venue's promoter
  PROMOTER.venue = state.booking ? venueById(state.booking.venueId) : VENUES[0];
  $("pVenueName").textContent = PROMOTER.venue.name;
  $("pGreet").textContent = `Welcome back, ${PROMOTER.venue.name}`;
  buildPRequests();
  renderPStats();
  renderPReqs();
  renderPRecent();
}

function buildPRequests() {
  const list = [];
  const b = state.booking;
  if (b) {
    list.push({
      id: "live", live: true,
      title: b.pkg.name,
      type: b.pkg.type, party: b.party,
      date: fmtDate(b.date), time: b.time, occasion: b.occasion,
      price: b.price, deposit: b.deposit,
      addons: b.addons || [],
      sign: b.sign || null,
      status: b.status === "pending" ? "open" : b.status, // open | confirmed | declined
      isNew: true,
    });
  }
  list.push(
    { id: "s1", title: "Full venue buyout", type: "buyout", party: 120, date: "Sat, Aug 22", time: "10:00 PM", occasion: "Corporate", price: 17000, deposit: 3550,
      addons: [{ name: "VIP booth", qty: 2, each: 1500, line: 3000 }], status: "open", isNew: true },
    { id: "s2", title: "VIP booth", type: "table", party: 10, date: "Fri, Aug 14", time: "11:00 PM", occasion: "Bachelor / bachelorette", price: 1500, deposit: 375,
      sign: { text: "Nick's Last Dance", price: 0 }, status: "open", isNew: false },
  );
  PROMOTER.requests = list;
}

function renderPStats() {
  const open = PROMOTER.requests.filter((r) => r.status === "open").length;
  const stats = [
    { v: String(open), l: "Awaiting approval" },
    { v: "92%", l: "Approval rate" },
    { v: "12", l: "Bookings this month" },
    { v: "$18,400", l: "Booked this month" },
  ];
  $("pStats").innerHTML = stats.map((s) => `<div class="p-stat"><b>${s.v}</b><span>${s.l}</span></div>`).join("");
}

function renderPRecent() {
  const rows = [
    { d: "Birthday · 30 people · Aug 2", v: "$4,200" },
    { d: "Corporate buyout · 90 people · Jul 26", v: "$11,500" },
    { d: "Bachelorette · 12 people · Jul 19", v: "$1,650" },
  ];
  $("pRecent").innerHTML = rows.map((r) =>
    `<div class="p-recent-row"><span class="rr-left">${r.d}</span><span><b>${r.v}</b> · <span class="p-recent-won">Confirmed</span></span></div>`).join("");
}

function renderPReqs() {
  $("pReqs").innerHTML = PROMOTER.requests.map(pReqCard).join("");
  PROMOTER.requests.forEach((r) => {
    const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
    on(`pApprove-${r.id}`, "click", () => decideReq(r.id, "confirmed"));
    on(`pDecline-${r.id}`, "click", () => decideReq(r.id, "declined"));
    on(`pView-${r.id}`, "click", () => { renderBookingConfirm(); showScreen("confirm"); });
  });
}

function pReqCard(r) {
  const tag = r.status === "confirmed" ? `<span class="p-req-tag ok">Confirmed</span>`
    : r.status === "declined" ? `<span class="p-req-tag">Declined</span>`
    : (r.isNew ? `<span class="p-req-tag new">New</span>` : "");
  const grid = `
    <div class="p-req-grid">
      <div><small>Booking</small><b>${r.title}</b></div>
      <div><small>Date</small><b>${r.date}</b></div>
      <div><small>Start</small><b>${r.time}</b></div>
      <div><small>Party</small><b>${r.party} people</b></div>
      <div><small>Occasion</small><b>${r.occasion}</b></div>
      <div><small>Price</small><b>${usd.format(r.price)} · dep ${usd.format(r.deposit)}</b></div>
      ${r.addons && r.addons.length ? `<div><small>Added tables</small><b>${r.addons.map((a) => `${a.qty}× ${a.name}`).join(", ")}</b></div>` : ""}
      ${r.sign ? `<div><small>LED sign</small><b>"${r.sign.text}"${r.sign.price ? ` (+${usd.format(r.sign.price)})` : ""}</b></div>` : ""}
    </div>`;

  let foot;
  if (r.status === "confirmed") {
    foot = `<div class="p-req-foot"><span class="p-req-status won">Approved. Deposit ${usd.format(r.deposit)} captured.</span>${r.live ? `<button type="button" class="btn-line" id="pView-${r.id}">View customer confirmation →</button>` : ""}</div>`;
  } else if (r.status === "declined") {
    foot = `<div class="p-req-foot"><span class="p-req-status">Declined. The customer's deposit was refunded instantly.</span></div>`;
  } else {
    foot = `<div class="p-req-foot">
      <span class="p-req-status">${r.live ? "Paid and booked by a customer just now. Confirm it, or decline to refund them." : "Paid and booked. Confirm it, or decline to refund."}</span>
      <div class="p-req-actions">
        <button type="button" class="btn-textlink" id="pDecline-${r.id}">Decline</button>
        <button type="button" class="btn-primary" id="pApprove-${r.id}">Confirm booking</button>
      </div>
    </div>`;
  }

  return `<div class="p-req ${r.status === "confirmed" ? "won" : ""}">
    <div class="p-req-head">${tag}<span class="p-req-title">${r.type === "buyout" ? "Full venue" : "Table"} request${r.live ? " · live" : ""}</span></div>
    ${grid}${foot}</div>`;
}

function decideReq(id, decision) {
  const r = PROMOTER.requests.find((x) => x.id === id);
  if (!r) return;
  r.status = decision;
  r.isNew = false;
  if (r.live && state.booking) state.booking.status = decision;
  renderPReqs();
  renderPStats();
  toast(decision === "confirmed" ? "Booking approved" : "Request declined");
}

/* ---------- city picker (entry step) ---------- */

const CITIES = [
  { name: "Orlando, FL", live: true },
  { name: "Miami, FL" },
  { name: "Tampa, FL" },
  { name: "Atlanta, GA" },
  { name: "Nashville, TN" },
  { name: "New York, NY" },
  { name: "Los Angeles, CA" },
  { name: "Austin, TX" },
];

function bindCity() {
  const input = $("cityInput");
  input.addEventListener("input", () => renderCitySuggest(input.value));
  input.addEventListener("focus", () => renderCitySuggest(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const first = CITIES.filter((c) => matchCity(c, input.value))[0];
      if (first && first.live) chooseCity(first);
      else if (first) toast(`BookOut is live in Orlando first. ${first.name.split(",")[0]} is coming soon.`);
    }
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".city-field")) $("citySuggest").classList.add("hidden");
  });
  $("segWhere").addEventListener("click", () => showScreen("city")); // Where opens the city picker
}

function matchCity(c, q) {
  return c.name.toLowerCase().includes((q || "").trim().toLowerCase());
}

function renderCitySuggest(q) {
  const box = $("citySuggest");
  const list = CITIES.filter((c) => matchCity(c, q));
  if (!list.length) {
    box.innerHTML = `<div class="city-empty">No cities match. Try Orlando.</div>`;
    box.classList.remove("hidden");
    return;
  }
  box.innerHTML = list.map((c) => `
    <button type="button" class="city-opt ${c.live ? "live" : ""}" data-city="${c.name}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6-7-11a7 7 0 0114 0c0 5-7 11-7 11z" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="10" r="2.2" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
      <span class="city-name">${c.name}</span>
      ${c.live ? "" : `<span class="city-soon">Coming soon</span>`}
    </button>`).join("");
  box.classList.remove("hidden");
  box.querySelectorAll(".city-opt").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = CITIES.find((x) => x.name === btn.dataset.city);
      if (c.live) chooseCity(c);
      else { toast(`BookOut is live in Orlando first. ${c.name.split(",")[0]} is coming soon.`); }
    });
  });
}

function chooseCity(c) {
  state.city = c.name.split(",")[0];
  $("citySuggest").classList.add("hidden");
  $("cityInput").value = c.name;
  $("whereText").textContent = c.name;
  renderGrid();
  showScreen("browse");
}

/* ---------- Ask AI chat ---------- */

const chat = { collected: {}, launched: false, busy: false };

function bindChat() {
  const aiBtn = $("btnAskAI");
  if (aiBtn) aiBtn.addEventListener("click", openChat); // entry point removed in the redesign; chat kept dormant
  $("chatClose").addEventListener("click", closeChat);
  $("chatBackdrop").addEventListener("click", (e) => { if (e.target === $("chatBackdrop")) closeChat(); });
  $("chatForm").addEventListener("submit", (e) => { e.preventDefault(); chatUserSubmit($("chatText").value); });
}

function openChat() {
  chat.collected = {};
  chat.launched = false;
  chat.busy = false;
  $("chatLog").innerHTML = "";
  $("chatBackdrop").classList.remove("hidden");
  botSay("Hey. I can set this up for you. Tell me the basics: what's the occasion, how many people, and what night? You can add a start time and a budget too.");
  setTimeout(() => $("chatText").focus(), 120);
}

function closeChat() { $("chatBackdrop").classList.add("hidden"); }

function chatUserSubmit(text) {
  text = (text || "").trim();
  if (!text || chat.busy) return;
  addMsg("user", text);
  $("chatText").value = "";
  const launchCmd = /^(go|get quotes?|yes|yep|yeah|do it|send it|launch|ok|okay|sure)\b/.test(text.toLowerCase());
  parseInput(text);
  botTurn(launchCmd);
}

function botTurn(launchCmd) {
  const c = chat.collected;
  if (!c.date) { botSay("What night are you thinking? You can say a day like Friday, or 'this weekend', 'tomorrow', or a date."); return; }
  if (!c.party) { botSay("Got it. Roughly how many people?"); return; }
  const n = matchedVenues().length;
  if (launchCmd) { launchFromChat(); return; }
  botSay(summarize(n), () => addAction(`Show me ${n} ${n === 1 ? "venue" : "venues"} for my night`, launchFromChat));
}

function summarize(n) {
  const c = chat.collected;
  const bits = [
    c.type === "table" ? "Tables" : "Venues",
    fmtDate(c.date),
    c.time || "10:00 PM",
    `${c.party} people`,
    c.occasion || "Night out",
  ];
  return `Here's what I've got: ${bits.join(" · ")}. I'll line up ${n} ${n === 1 ? "venue" : "venues"} in ${state.city} with prices so you can book in a tap.`;
}

function launchFromChat() {
  if (chat.launched) return;
  chat.launched = true;
  const c = chat.collected;
  if (c.type) {
    state.type = c.type;
    state.filter = state.type;
    syncFilterUI();
  }
  if (c.date) {
    $("fDate").value = c.date;
    state.range = { start: c.date, end: c.date };
    syncWhenLabel();
  }
  if (c.time) $("fTime").value = c.time;
  if (c.party) $("fPartyNum").value = c.party;
  if (c.occasion) $("fOccasion").value = c.occasion;
  renderGrid();     // rebuild the grid with the night context
  closeChat();
  showScreen("browse");
  toast("Here are your venues. Tap one to see prices and book.");
}

/* ---- chat parsing ---- */

function parseInput(text) {
  const c = chat.collected;
  const low = text.toLowerCase();
  let rest = " " + low.replace(/,/g, "") + " ";

  const b = extractBudget(rest);
  if (b.value != null) { c.budget = b.value; rest = rest.replace(b.raw, " "); }

  rest = rest.replace(/\b\d{1,2}(:\d{2})?\s?(am|pm)\b/g, " "); // drop time tokens before guest parse

  const g = extractGuests(rest);
  if (g != null) c.party = g;

  if (/\btables?\b|bottle service|\bsection\b/.test(rest)) c.type = "table";
  else if (/buyout|full venue|whole (venue|place|club)|entire|book out|private (the )?venue/.test(rest)) c.type = "buyout";

  const occ = extractOccasion(rest); if (occ) c.occasion = occ;
  const tm = extractTime(low); if (tm) c.time = tm;
  const dt = extractDate(low); if (dt) c.date = dt;
}

function extractBudget(s) {
  let m = s.match(/\$\s?(\d+(?:\.\d+)?)\s?(k)?/);
  if (m) return { value: Math.round(parseFloat(m[1]) * (m[2] ? 1000 : 1)), raw: m[0] };
  m = s.match(/budget[^\d]{0,10}(\d+(?:\.\d+)?)\s?(k)?/);
  if (m) return { value: Math.round(parseFloat(m[1]) * (m[2] ? 1000 : 1)), raw: m[0] };
  m = s.match(/\b(\d+(?:\.\d+)?)\s?k\b/);
  if (m) return { value: Math.round(parseFloat(m[1]) * 1000), raw: m[0] };
  return { value: null, raw: null };
}

function extractGuests(s) {
  let m = s.match(/(\d{1,4})\s*(?:people|ppl|guests?|pax|heads|persons?)\b/);
  if (m) return clampParty(m[1]);
  m = s.match(/(?:for|party of|group of|table for|of)\s+(\d{1,4})\b/);
  if (m) return clampParty(m[1]);
  const nums = s.match(/\b\d{1,4}\b/g);
  if (nums) {
    for (const n of nums) {
      const v = parseInt(n, 10);
      if (v >= 1 && v <= 2000 && !(v >= 1900 && v <= 2100)) return v;
    }
  }
  return null;
}

function clampParty(x) { return Math.min(2000, Math.max(1, parseInt(x, 10))); }

function extractOccasion(s) {
  if (/bachelorette|bachelor/.test(s)) return "Bachelor / bachelorette";
  if (/b-?day|birthday/.test(s)) return "Birthday";
  if (/corporate|company|work event|team/.test(s)) return "Corporate";
  if (/celebrat|anniversar|graduation|promotion/.test(s)) return "Celebration";
  if (/night out|going out|casual/.test(s)) return "Night out";
  return null;
}

function extractTime(s) {
  const m = s.match(/\b(\d{1,2})(?::(\d{2}))?\s?(am|pm)\b/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const ap = m[3];
  if (ap === "pm" && h >= 9 && h <= 11) return `${h}:00 PM`;
  if ((ap === "am" && (h === 12 || h <= 2)) || (ap === "pm" && h === 12)) return "12:00 AM";
  return "10:00 PM";
}

function extractDate(s) {
  const today = new Date();
  const isoOf = (d) => d.toISOString().slice(0, 10);
  const plus = (n) => { const x = new Date(today); x.setDate(today.getDate() + n); return isoOf(x); };
  const nextDow = (target) => { const diff = (target - today.getDay() + 7) % 7; return plus(diff); };

  if (/\btonight\b|\btoday\b/.test(s)) return isoOf(today);
  if (/\btomorrow\b/.test(s)) return plus(1);
  if (/this weekend|\bweekend\b/.test(s)) return nextDow(6);

  const days = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6,
    sun: 0, mon: 1, tue: 2, tues: 2, wed: 3, thu: 4, thur: 4, thurs: 4, fri: 5, sat: 6 };
  for (const k in days) { if (new RegExp("\\b" + k + "\\b").test(s)) return nextDow(days[k]); }

  let m = s.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (m) {
    const y = m[3] ? (m[3].length === 2 ? 2000 + +m[3] : +m[3]) : today.getFullYear();
    const d = new Date(y, +m[1] - 1, +m[2]);
    if (!isNaN(d.getTime())) return isoOf(d);
  }
  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  m = s.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})\b/);
  if (m) {
    const mi = months.indexOf(m[1]);
    let d = new Date(today.getFullYear(), mi, +m[2]);
    if (d.getTime() < today.getTime() - 86400000) d = new Date(today.getFullYear() + 1, mi, +m[2]);
    return isoOf(d);
  }
  return null;
}

/* ---- chat UI helpers ---- */

function addMsg(role, text) {
  const el = document.createElement("div");
  el.className = "msg " + role;
  el.textContent = text;
  $("chatLog").appendChild(el);
  scrollChat();
}

function addAction(label, onClick) {
  const wrap = document.createElement("div");
  wrap.className = "msg-action";
  const btn = document.createElement("button");
  btn.className = "btn-primary";
  btn.type = "button";
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  wrap.appendChild(btn);
  $("chatLog").appendChild(wrap);
  scrollChat();
}

function botSay(text, cb) {
  chat.busy = true;
  showTyping();
  setTimeout(() => {
    hideTyping();
    addMsg("bot", text);
    chat.busy = false;
    if (cb) cb();
  }, 620);
}

function showTyping() {
  hideTyping();
  const el = document.createElement("div");
  el.className = "chat-typing";
  el.id = "chatTyping";
  el.innerHTML = "<i></i><i></i><i></i>";
  $("chatLog").appendChild(el);
  scrollChat();
}

function hideTyping() { const t = $("chatTyping"); if (t) t.remove(); }
function scrollChat() { const l = $("chatLog"); l.scrollTop = l.scrollHeight; }

/* ---------- shared helpers ---------- */

function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
  $("screen-" + name).classList.remove("hidden");
  const promoterMode = name === "plogin" || name === "phome";
  document.querySelector(".topbar").style.display = promoterMode ? "none" : "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetAll() {
  clearInterval(pendingPoll);
  state.booking = null;
  state.currentVenueId = null;
  state.selectedPkgId = null;
  state.addons = {};
  renderGrid();
  showScreen("browse");
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

let toastTimer = null;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("hidden"), 2600);
}

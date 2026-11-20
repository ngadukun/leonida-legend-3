'use strict';

/* Leonida Legend — an offline GTA VI trophy guide & tracker.
   Plain browser script, no modules, no network: the trophy data is fetched
   once from data/trophies.json (a file of this app), progress lives in
   localStorage, and every view is rendered from the hash route. */

// ---------- constants ----------

const TOTAL_TROPHIES = 55;
const RING_CIRCUMFERENCE = 2 * Math.PI * 52; // matches r="52" in index.html

/* The demo state: with ?demo=1 in the URL these 12 trophies start ticked, so
   the tracker opens looking lived-in at 12 of 55 (about 22%). A normal visit
   never sees it. */
const DEMO_EARNED_IDS = [2, 3, 4, 5, 8, 16, 21, 28, 35, 46, 53, 55];

const ROADMAP_PHASES = [
  {
    title: 'Play the story, and take the one-time moments as they come',
    body: 'Chapters 1–4 and the final mission unlock on their own as you follow the story markers. While the story runs, do the missable trophies the moment their window opens: the partner trophies, the VCIA departure, the Ocean Beach cocktail, the showroom smash and the stranger strands. Missables are flagged in the tracker and listed under Watch-outs — check that page before every story chapter.',
    warn: 'Missable moments live in this phase: Hot Together · Retail Therapy · Catch Me If You Can · In The Beginning… · Capital Offense · Personal Best.',
    trophies: 'Just Like Paradise · Paradise Lost · T**s Ass Drug Money · Vice City, Baby! · Top Of The World, Ma · Trust · Break the Bank · Family Matters · DWNFALL · Hi-Jacked · Snow Storm · You Gotta Know When to Get Off',
  },
  {
    title: 'Finish every character strand',
    body: 'Andy, Kenton, Billy, Randy and Tyrone each have a final-mission trophy, and Bret has the unique-animal hunt. Take their missions as the icons appear between story missions and close each strand before the finale — the stranger strands for Strangers & Freaks belong to this phase too, and some strangers are only around during certain story stretches.',
    trophies: 'Road to Rehabilitation · This Was No Boat Accident · The Lone Rider · Supply & Demand · Spin On This! · Strangers & Freaks · Fair Game',
  },
  {
    title: 'Try every activity once, then master the ones with medals',
    body: 'One visit each to fishing, the shooting range, drone racing, races, arcade games, bowling, meditation, hunting and the WAiNK photo spots earns Master of None and opens the activity trophies: the shooting range\u2019s 42 gold medals, 250 stunts, the 14 drone-race locations, 20 race wins, the fishing challenge against Cal and 50 challenges.',
    trophies: 'Master of None · The Shootist · Cunning Stunts · Top Fun · Earn Cash, Not Kudos · Baited My Tackle · Stick Fiddler · Let\u2019s Go Bowling · One Last Thing',
  },
  {
    title: 'Sweep the collectibles in one long road trip',
    body: 'Meditation spots (18), WAiNK photo locations (100), the collectible card sets and 100 discovered vehicles all sit on the same map. Plan one route around Leonida and take them together; the trip also explores all 52 areas for The Goodtime State, and the 8 garage properties and 10 Scooter Bros registrations slot into the same drive.',
    trophies: 'Don\u2019t Touch My Deck · You WAiNKer! · Positive Mental Attitude · Whip It Good · The Goodtime State · Little Boxes · On the Spot',
  },
  {
    title: 'Do the crime and money grinds',
    body: 'The robbery ladder — a silent jewelry store, 5 bank vaults, an armored truck and one illegal operation from each of the 9 gangs — feeds the $250,000 laundering total, and ordinary spending covers the $100,000 shop total. The loose feats (5 takedowns in one Combat Focus, the Rhino, the melee drive-by, 500 counted choices, a second-try success, one strange sighting) mostly happen along the way; mop up whatever is left here.',
    trophies: 'Sneakthief · Maximum Withdrawal · A Classic Blitz Play · Pest Control · Dime on the Dollar · Treat Yo Self · Gunslinger · Challenging Tank · Ten Pin · Actions Speak Louder · Bad Luck, I Guess · The Truth Is Out There',
  },
  {
    title: 'Close out 100% and take the Platinum',
    body: 'With the story, strands, activities, collectibles and grinds done, the completion counter reaches 100% for A Long Road, and the Platinum unlocks by itself the moment the other 54 are all earned.',
    trophies: 'A Long Road · Vice Got a Price!',
  },
];

const FINALE_CHECKLIST = [
  'Hot Together done — a 4-star wanted level lost with your partner beside you.',
  'Retail Therapy done — 3 shops robbed back-to-back with your partner, wanted level kept alive.',
  'Catch Me If You Can done — the unscheduled VCIA departure taken while the airport is part of the story.',
  'In The Beginning… done — the Ocean Beach cocktail moment taken while the story is there.',
  'Capital Offense done — the showroom smash taken in its story beat, not looked for afterwards.',
  'Personal Best done — the one-time partner scene played in full, not skipped.',
  'Strangers & Freaks done — 8 full stranger strands finished; some strangers vanish as the story advances.',
  'Fair Game done — Bret\u2019s unique-animal hunt finished while his strand is still active.',
];

// ---------- state ----------

const demoMode = new URLSearchParams(window.location.search).has('demo');
const storageKey = demoMode ? 'leonida-legend-progress-demo' : 'leonida-legend-progress-v1';

let trophies = [];
let earned = loadEarned();
const filters = { search: '', tier: 'all', kind: 'all', hideEarned: false, spoilersOff: false };

function loadEarned() {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) return new Set(JSON.parse(raw));
  } catch (err) { /* storage unavailable: fall through to a fresh set */ }
  return new Set(demoMode ? DEMO_EARNED_IDS : []);
}

function saveEarned() {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify([...earned]));
  } catch (err) { /* storage unavailable: progress simply will not persist */ }
}

function setEarned(id, on) {
  if (on) earned.add(id); else earned.delete(id);
  saveEarned();
}

// ---------- small helpers ----------

function esc(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function trophyById(id) {
  return trophies.find((t) => t.id === id);
}

function isSpoilerHidden(trophy) {
  return filters.spoilersOff && trophy.kind === 'story' && !earned.has(trophy.id);
}

function tagRow(trophy) {
  const parts = [
    `<span class="badge tier-${trophy.grade}">${trophy.grade.toUpperCase()}</span>`,
    `<span class="kind-tag">${esc(trophy.kind)}</span>`,
  ];
  if (trophy.missable) parts.push('<span class="ribbon">MISSABLE</span>');
  if (trophy.hidden) parts.push('<span class="hidden-note">hidden on PlayStation</span>');
  return `<div class="card-tags">${parts.join('')}</div>`;
}

// ---------- progress ring and counts ----------

function renderProgress() {
  const done = earned.size;
  const gold = trophies.filter((t) => t.grade === 'gold' && earned.has(t.id)).length;
  const silver = trophies.filter((t) => t.grade === 'silver' && earned.has(t.id)).length;
  const missablesLeft = trophies.filter((t) => t.missable && !earned.has(t.id)).length;
  const percent = Math.round((done / TOTAL_TROPHIES) * 100);

  document.getElementById('ring-percent').textContent = `${percent}%`;
  document.getElementById('ring-fill').style.strokeDashoffset =
    String(RING_CIRCUMFERENCE * (1 - done / TOTAL_TROPHIES));
  document.getElementById('earned-line').textContent = `${done} of ${TOTAL_TROPHIES} earned`;
  document.getElementById('count-line').textContent =
    `Gold ${gold} of 2 · Silver ${silver} of 6 · Missables left ${missablesLeft}`;
}

// ---------- tracker views (full list, or missables only) ----------

function passesFilters(trophy) {
  if (filters.tier !== 'all' && trophy.grade !== filters.tier) return false;
  if (filters.kind !== 'all' && trophy.kind !== filters.kind) return false;
  if (filters.hideEarned && earned.has(trophy.id)) return false;
  if (filters.search) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.kind}`.toLowerCase();
    if (!haystack.includes(filters.search.toLowerCase())) return false;
  }
  return true;
}

function trophyCard(trophy) {
  const done = earned.has(trophy.id);
  const masked = isSpoilerHidden(trophy);
  const name = masked ? 'Hidden trophy' : trophy.name;
  const desc = masked
    ? 'Spoilers are off: this story trophy shows its name once it is earned.'
    : trophy.description;
  return `<article class="card tier-${trophy.grade}${done ? ' earned' : ''}" data-open="${trophy.id}">
    <input type="checkbox" data-toggle="${trophy.id}" ${done ? 'checked' : ''} aria-label="Mark ${esc(trophy.name)} as earned">
    <div class="card-body">
      <div class="card-top"><span class="card-name">${esc(name)}</span><span class="card-num">#${trophy.id}</span></div>
      <p class="card-desc">${esc(desc)}</p>
      ${tagRow(trophy)}
    </div>
  </article>`;
}

function renderTracker(onlyMissables) {
  const pool = onlyMissables ? trophies.filter((t) => t.missable) : trophies;
  const shown = pool.filter(passesFilters);
  const heading = onlyMissables ? 'Missable trophies — 8' : 'Trophy tracker';
  const sub = onlyMissables
    ? 'Only the 8 trophies that can be missed, with the same filters as the full tracker. Every one of them is tied to a story moment that does not come back — the Watch-outs page explains each one.'
    : 'All 55 official trophies with their grades. Tick them off as you earn them — progress is saved in this browser — and click any card to open its guide.';
  document.getElementById('view').innerHTML = `
    <h2 class="view-heading">${heading}</h2>
    <p class="view-sub">${sub}</p>
    <p class="shown-line">${shown.length} of ${pool.length} trophies shown · tick one off and it stays ticked · click a card to open its guide</p>
    <div class="cards">${shown.map(trophyCard).join('')}</div>`;
}

// ---------- trophy detail view ----------

function renderDetail(id) {
  const trophy = trophyById(id);
  const view = document.getElementById('view');
  if (!trophy) {
    view.innerHTML = `<p class="view-sub">That trophy is not on the list. <a href="#/">Back to the tracker</a></p>`;
    return;
  }
  const done = earned.has(trophy.id);
  if (isSpoilerHidden(trophy)) {
    view.innerHTML = `
      <a class="back-link" href="#/">← Back to the tracker</a>
      <section class="panel tier-${trophy.grade}">
        <h2>Hidden trophy</h2>
        ${tagRow(trophy)}
        <p class="official">Spoilers are off, and this story trophy is not earned yet — its name, official description and guide stay hidden until you earn it. Turn “Spoilers off” off in the tracker to read it now.</p>
      </section>`;
    return;
  }
  view.innerHTML = `
    <a class="back-link" href="#/">← Back to the tracker</a>
    <section class="panel tier-${trophy.grade}">
      <h2>${esc(trophy.name)}</h2>
      ${tagRow(trophy)}
      <p class="official">Official: “${esc(trophy.description)}”</p>
      <h3>GUIDE</h3>
      <p>${esc(trophy.guide)}</p>
      <h3>SOURCES</h3>
      <p>${esc(trophy.sources)}</p>
      <label class="detail-check"><input type="checkbox" data-toggle="${trophy.id}" ${done ? 'checked' : ''}> Earned</label>
    </section>`;
}

// ---------- roadmap view ----------

function renderRoadmap() {
  const phases = ROADMAP_PHASES.map((phase, i) => `
    <div class="phase">
      <div class="phase-node">${i + 1}</div>
      <div class="phase-card">
        <h3>${esc(phase.title)}</h3>
        <p>${esc(phase.body)}</p>
        ${phase.warn ? `<p class="warn">${esc(phase.warn)}</p>` : ''}
        <p class="phase-trophies"><b>Covers:</b> ${esc(phase.trophies)}</p>
      </div>
    </div>`).join('');
  document.getElementById('view').innerHTML = `
    <h2 class="view-heading">Roadmap to the Platinum</h2>
    <p class="view-sub">A recommended order, built only from the official trophy descriptions. It is a recommendation, not a rule — the story trophies unlock on their own whatever order you play in.</p>
    <div class="timeline">${phases}</div>`;
}

// ---------- watch-outs view ----------

function renderWatch() {
  const cards = trophies.filter((t) => t.missable).map((trophy) => `
    <div class="alert-card">
      <h3>${esc(trophy.name)}<span class="badge tier-${trophy.grade}">${trophy.grade.toUpperCase()}</span></h3>
      <p><b>${esc(trophy.description)}</b> ${esc(trophy.guide)}</p>
    </div>`).join('');
  const checklist = FINALE_CHECKLIST.map((item) => `<li>${esc(item)}</li>`).join('');
  document.getElementById('view').innerHTML = `
    <h2 class="view-heading">Watch-outs — the missable trophies</h2>
    <p class="view-sub">Eight trophies are tied to moments that may not come back. Do them while their window is open; everything else can be cleaned up after the story.</p>
    ${cards}
    <div class="checklist-card">
      <h3>Before you finish the story</h3>
      <ul>${checklist}</ul>
    </div>`;
}

// ---------- routing ----------

function currentRoute() {
  const hash = window.location.hash.replace(/^#/, '');
  if (hash === 'roadmap') return { name: 'roadmap' };
  if (hash === 'watch') return { name: 'watch' };
  if (hash === 'missables') return { name: 'missables' };
  const detail = hash.match(/^trophy-(\d+)$/);
  if (detail) return { name: 'detail', id: Number(detail[1]) };
  return { name: 'tracker' };
}

function route() {
  const r = currentRoute();
  const toolbar = document.getElementById('toolbar');
  const onTracker = r.name === 'tracker' || r.name === 'missables';
  toolbar.classList.toggle('hidden', !onTracker);
  document.querySelectorAll('[data-nav]').forEach((pill) => {
    pill.classList.toggle('active', pill.dataset.nav === r.name);
  });
  if (r.name === 'tracker') renderTracker(false);
  else if (r.name === 'missables') renderTracker(true);
  else if (r.name === 'detail') renderDetail(r.id);
  else if (r.name === 'roadmap') renderRoadmap();
  else if (r.name === 'watch') renderWatch();
  renderProgress();
  window.scrollTo(0, 0);
}

// ---------- export / import ----------

function exportProgress() {
  const payload = JSON.stringify({ game: 'Grand Theft Auto VI', app: 'Leonida Legend', earned: [...earned] }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-legend-progress.json';
  link.click();
  URL.revokeObjectURL(url);
}

function importProgress(file) {
  file.text().then((text) => {
    try {
      const parsed = JSON.parse(text);
      const ids = Array.isArray(parsed) ? parsed : parsed.earned;
      if (!Array.isArray(ids)) throw new Error('no earned list');
      earned = new Set(ids.filter((id) => trophyById(id)));
      saveEarned();
      route();
    } catch (err) {
      window.alert('That file does not hold Leonida Legend progress.');
    }
  });
}

// ---------- wiring ----------

function bindControls() {
  const view = document.getElementById('view');
  view.addEventListener('click', (event) => {
    if (event.target.matches('[data-toggle]')) return;
    const card = event.target.closest('[data-open]');
    if (card) window.location.hash = `#trophy-${card.dataset.open}`;
  });
  view.addEventListener('change', (event) => {
    if (event.target.matches('[data-toggle]')) {
      setEarned(Number(event.target.dataset.toggle), event.target.checked);
      route();
    }
  });

  document.getElementById('filter-search').addEventListener('input', (event) => {
    filters.search = event.target.value;
    const r = currentRoute();
    if (r.name === 'tracker' || r.name === 'missables') route();
  });
  document.getElementById('filter-tier').addEventListener('change', (event) => {
    filters.tier = event.target.value;
    route();
  });
  document.getElementById('filter-kind').addEventListener('change', (event) => {
    filters.kind = event.target.value;
    route();
  });
  document.getElementById('filter-hide-earned').addEventListener('change', (event) => {
    filters.hideEarned = event.target.checked;
    route();
  });
  document.getElementById('filter-spoilers').addEventListener('change', (event) => {
    filters.spoilersOff = event.target.checked;
    route();
  });
  document.getElementById('export-progress').addEventListener('click', exportProgress);
  document.getElementById('import-progress').addEventListener('change', (event) => {
    if (event.target.files[0]) importProgress(event.target.files[0]);
    event.target.value = '';
  });
  window.addEventListener('hashchange', route);
}

fetch('data/trophies.json')
  .then((response) => response.json())
  .then((data) => {
    trophies = data.trophies;
    bindControls();
    route();
  })
  .catch(() => {
    document.getElementById('view').innerHTML =
      '<p class="view-sub">The trophy data could not be loaded. Serve the app over HTTP (node serve.ts) rather than opening the file directly.</p>';
  });

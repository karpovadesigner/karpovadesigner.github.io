const isTouch = matchMedia('(hover: none)').matches;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- кейсы и галерея из works.js ---------- */
// картинки работ из папок лежат в media/work, остальные — в media/img
const imgSrc = it => it.work ? `media/work/${it.work}.jpg` : `media/img/${it.img}.jpg`;
function card(item, caption) {
  const el = document.createElement('div');
  el.className = 'card' + (item.wide ? ' wide' : '');
  if (item.video) {
    el.innerHTML = `<video muted loop playsinline preload="none" poster="media/poster/${item.video}.jpg" src="media/video/${item.video}.mp4"></video>`;
    el.dataset.video = item.video;
  } else {
    el.innerHTML = `<img loading="lazy" src="${imgSrc(item)}" alt="">`;
    el.dataset.full = imgSrc(item);
  }
  if (caption) el.insertAdjacentHTML('beforeend', `<div class="card-cap"><b>${caption.title}</b><span>${caption.tag}</span></div>`);
  return el;
}

// материалы берутся из папок (media.js); у проекта вся папка листается каруселью, в «Подробнее» — сеткой
const folderItems = name => (typeof MEDIA !== 'undefined' && MEDIA[name]) || [];
CASES.forEach(c => { c.media = folderItems(c.folder); c.more = []; });

/* ---------- карусель: стрелки, перетаскивание мышкой, колёсико, свайп пальцем ---------- */
const ARROWS = '<div class="cat-arrows"><button class="prev" aria-label="Назад">←</button><button class="next" aria-label="Вперёд">→</button></div>';
function carousel(box, track) {
  const bar = box.querySelector('.cat-progress i'), prev = box.querySelector('.prev'), next = box.querySelector('.next');
  const step = () => (track.querySelector('.card')?.offsetWidth || 240) * 2 + 32;
  prev.onclick = () => track.scrollBy({ left: -step(), behavior: 'smooth' });
  next.onclick = () => track.scrollBy({ left: step(), behavior: 'smooth' });
  const upd = () => {
    const max = track.scrollWidth - track.clientWidth, part = Math.min(1, track.clientWidth / track.scrollWidth);
    if (bar) { bar.style.width = part * 100 + '%'; bar.style.left = (max > 0 ? track.scrollLeft / max : 0) * (100 - part * 100) + '%'; }
    prev.disabled = track.scrollLeft <= 2; next.disabled = track.scrollLeft >= max - 2;
    box.classList.toggle('no-scroll', max <= 2);
  };
  track.addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); setTimeout(upd, 300); setTimeout(upd, 1500);
  // колёсико мыши крутит карусель вбок, пока есть куда; дальше прокручивается страница
  track.addEventListener('wheel', e => {
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY, max = track.scrollWidth - track.clientWidth;
    if ((d > 0 && track.scrollLeft < max - 2) || (d < 0 && track.scrollLeft > 2)) { e.preventDefault(); track.scrollLeft += d * 1.2; }
  }, { passive: false });
  // перетаскивание мышкой (пальцем карусель листается сама — обычной прокруткой)
  let down = false, sx = 0, sl = 0, moved = false;
  track.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || e.button !== 0) return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
  addEventListener('pointermove', e => {
    if (!down) return; const dx = e.clientX - sx;
    if (Math.abs(dx) > 6) { moved = true; track.classList.add('dragging'); }
    if (moved) track.scrollLeft = sl - dx;
  });
  addEventListener('pointerup', () => { if (!down) return; down = false; setTimeout(() => track.classList.remove('dragging'), 0); });
}
// папки без своего места в works.js тоже показываем — каруселью в конце
const used = new Set([...CASES.map(c => c.folder), ...CATEGORIES.map(c => c.folder), typeof REVIEWS_FOLDER !== 'undefined' ? REVIEWS_FOLDER : '']);
Object.keys(typeof MEDIA !== 'undefined' ? MEDIA : {}).forEach(f => { if (!used.has(f)) CATEGORIES.push({ folder: f, title: f, text: '' }); });
CATEGORIES.forEach(c => c.items = folderItems(c.folder));

const caseList = document.getElementById('case-list');
CASES.forEach((c, i) => {
  const box = document.createElement('article');
  box.className = 'case';
  box.innerHTML = `
    <div class="case-info reveal">
      <span class="case-num">${String(i + 1).padStart(2, '0')}</span>
      <h3>${c.title}</h3>
      <p class="case-tag">${c.tag}</p>
      <p>${c.text}</p>
      <ul class="case-done">${c.done.map(d => `<li>${d}</li>`).join('')}</ul>
      <button class="case-more" data-project="${c.id}">Подробнее о проекте <span>→</span></button>
    </div>
    <div class="case-side reveal">
      <div class="case-media track"></div>
      <div class="case-nav"><div class="cat-progress"><i></i></div>${ARROWS}</div>
    </div>`;
  const media = box.querySelector('.case-media');
  c.media.forEach(m => media.appendChild(card(m)));
  caseList.appendChild(box);
  carousel(box.querySelector('.case-side'), media);
});

/* ---------- направления: карусели ---------- */
const catBox = document.getElementById('categories');
CATEGORIES.filter(cat => cat.items.length).forEach(cat => {
  const sec = document.createElement('div');
  sec.className = 'cat reveal';
  sec.innerHTML = `
    <div class="cat-head">
      <div><h3>${cat.title}<sup>${cat.items.length}</sup></h3><p>${cat.text}</p></div>
      ${ARROWS}
    </div>
    <div class="track"></div>
    <div class="cat-progress"><i></i></div>`;
  const track = sec.querySelector('.track');
  cat.items.forEach(it => track.appendChild(card(it, it.title ? it : null)));
  catBox.appendChild(sec);
  carousel(sec, track);
});

/* ---------- отзывы: скриншоты из папки «отзывы», пока их нет — красивые заглушки ---------- */
const reviewBox = document.getElementById('review-list');
if (reviewBox) {
  const revs = typeof REVIEWS_FOLDER !== 'undefined' ? folderItems(REVIEWS_FOLDER) : [];
  if (revs.length) {
    reviewBox.innerHTML = `<div class="rev-wrap"><div class="track rev-track"></div><div class="case-nav"><div class="cat-progress"><i></i></div>${ARROWS}</div></div>`;
    const t = reviewBox.querySelector('.rev-track');
    revs.forEach(r => { const c = card(r); c.classList.add('rev-card'); t.appendChild(c); });
    carousel(reviewBox.querySelector('.rev-wrap'), t);
  } else {
    reviewBox.innerHTML = `<div class="rev-empty">${[1, 2, 3].map(i => `
      <div class="rev-ph reveal"><span class="q">“</span><i></i><i></i><i class="s"></i><b>Скоро здесь появятся отзывы</b></div>`).join('')}</div>`;
  }
}

/* ---------- с кем я работала ---------- */
const logoWall = document.getElementById('logo-wall');
if (logoWall && typeof CLIENT_LOGOS !== 'undefined')
  logoWall.innerHTML = CLIENT_LOGOS.map(l => `<div class="logo-item reveal${l.dark ? ' dark' : ''}"><img src="media/logo/${l.file}" alt="${l.name}" title="${l.name}" loading="lazy"></div>`).join('');
// имена без логотипов — облаком вразнобой: размер, наклон и сдвиг у каждого свои, но всегда одинаковые
const clientBox = document.getElementById('client-list');
if (clientBox) {
  const rnd = s => { const x = Math.sin(s * 9301 + 49297) * 233280; return x - Math.floor(x); };
  clientBox.innerHTML = CLIENTS.map((c, i) => {
    const size = 20 + rnd(i + 1) * 22, rot = (rnd(i + 7) - .5) * 10, dy = (rnd(i + 13) - .5) * 34, tone = ['', 'gold', 'muted'][Math.floor(rnd(i + 21) * 3)];
    return `<li class="reveal ${tone}" style="--fs:${size.toFixed(0)}px;--rot:${rot.toFixed(1)}deg;--dy:${dy.toFixed(0)}px;--d:${(rnd(i + 31) * 6).toFixed(1)}s">${c}</li>`;
  }).join('');
}

/* ---------- ролики играют, только когда видны ---------- */
const vidObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    const v = e.target;
    if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); }
    else v.pause();
  });
}, { threshold: 0.45 });
document.querySelectorAll('.card video').forEach(v => vidObs.observe(v));

/* ---------- страница проекта «Подробнее» ---------- */
const proj = document.querySelector('.project'), projInner = proj.querySelector('.project-inner');
function openProject(id, push = true) {
  const i = CASES.findIndex(c => c.id === id); if (i < 0) return;
  const c = CASES[i], next = CASES[(i + 1) % CASES.length];
  const items = [...c.media, ...(c.more || [])];
  projInner.innerHTML = `
    <div class="project-head">
      <div><p class="eyebrow">${String(i + 1).padStart(2, '0')} · ${c.tag}</p><h2>${c.title}</h2></div>
      <div><p>${c.text}</p><ul class="case-done">${c.done.map(d => `<li>${d}</li>`).join('')}</ul></div>
    </div>
    <div class="project-grid">${items.map(m => `
      <figure ${m.video ? `data-video="${m.video}"` : `data-full="${imgSrc(m)}"`}>
        ${m.video ? `<video muted loop playsinline preload="none" poster="media/poster/${m.video}.jpg" src="media/video/${m.video}.mp4"></video>`
                  : `<img loading="lazy" src="${imgSrc(m)}" alt="${m.note || c.title}">`}
        ${m.note ? `<figcaption>${m.note}</figcaption>` : ''}
      </figure>`).join('')}
    </div>
    <button class="project-next" data-project="${next.id}"><span>Следующий проект</span><b>${next.title} →</b></button>`;
  projInner.querySelectorAll('video').forEach(v => vidObs.observe(v));
  proj.scrollTop = 0;
  proj.classList.add('open'); proj.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock');
  if (push) history.pushState({ p: id }, '', '#project-' + id);
}
function closeProject(push = true) {
  proj.classList.remove('open'); proj.setAttribute('aria-hidden', 'true'); document.body.classList.remove('lock');
  projInner.querySelectorAll('video').forEach(v => v.pause());
  if (push && location.hash.startsWith('#project-')) history.pushState({}, '', location.pathname);
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-project]'); if (b) { openProject(b.dataset.project); return; }
  if (e.target.closest('.project-back')) closeProject();
});
addEventListener('popstate', () => {
  const m = location.hash.match(/^#project-(.+)/);
  m ? openProject(m[1], false) : closeProject(false);
});
if (location.hash.startsWith('#project-')) openProject(location.hash.slice(9), false);

/* ---------- заявка: окно с формой, письмо уходит на почту через FormSubmit ---------- */
const order = document.querySelector('.order'), form = order.querySelector('.lead-form'), msg = order.querySelector('.lead-msg');
function openOrder() {
  if (proj.classList.contains('open')) closeProject();
  order.classList.remove('sent'); order.classList.add('open'); order.setAttribute('aria-hidden', 'false'); document.body.classList.add('lock');
  setTimeout(() => form.querySelector('input').focus(), 300);
}
function closeOrder() { order.classList.remove('open'); order.setAttribute('aria-hidden', 'true'); if (!proj.classList.contains('open')) document.body.classList.remove('lock'); }
document.addEventListener('click', e => {
  const t = e.target.closest('.nav-cta, .open-lead, .btn-line[href="#contacts"]');
  if (t) { e.preventDefault(); openOrder(); return; }
  if (e.target === order || e.target.closest('.lead-close')) closeOrder();
});
order.querySelectorAll('.chips button').forEach(b => b.addEventListener('click', () => b.classList.toggle('on')));
form.addEventListener('submit', async e => {
  e.preventDefault(); msg.textContent = '';
  let ok = true;
  form.querySelectorAll('[required]').forEach(f => {
    const bad = f.type === 'checkbox' ? !f.checked : !f.value.trim();
    (f.type === 'checkbox' ? f.closest('label') : f).classList.toggle('bad', bad); if (bad) ok = false;
  });
  if (!ok) { msg.textContent = 'Заполните имя, контакт и отметьте согласие.'; return; }
  if (!LEAD_EMAIL) { msg.textContent = 'Почта для заявок ещё не подключена.'; return; }
  const data = Object.fromEntries(new FormData(form));
  data['Что нужно'] = [...form.querySelectorAll('.chips .on')].map(b => b.textContent).join(', ') || '—';
  data['Согласие'] = 'да';
  data._subject = 'Заявка с сайта: ' + data['Имя'];
  data._template = 'table'; data._captcha = 'false';
  const btn = form.querySelector('.lead-send'); btn.disabled = true; btn.textContent = 'Отправляю…';
  try {
    const r = await fetch('https://formsubmit.co/ajax/' + LEAD_EMAIL, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data)
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.success === 'false' || j.success === false) throw new Error(j.message || r.status);
    order.classList.add('sent'); form.reset(); order.querySelectorAll('.chips .on').forEach(b => b.classList.remove('on'));
  } catch (err) {
    msg.innerHTML = 'Не получилось отправить. Напишите, пожалуйста, в Telegram <a href="https://t.me/karpova_design" target="_blank">@karpova_design</a>.';
  } finally { btn.disabled = false; btn.textContent = 'Отправить заявку'; }
});

/* ---------- презентации: экран со слайдами ---------- */
const deckList = document.getElementById('deck-list');
DECKS.forEach(d => {
  const src = n => `media/img/${d.id}-${n}.jpg`;
  const box = document.createElement('article');
  box.className = 'case deck';
  box.innerHTML = `
    <div class="case-info reveal">
      <span class="case-num">${d.client}</span>
      <h3>${d.title}</h3>
      <p class="case-tag">${d.tag}</p>
      <p>${d.text}</p>
      <ul class="case-done">${d.done.map(x => `<li>${x}</li>`).join('')}</ul>
    </div>
    <div class="deck-view reveal">
      <div class="deck-screen" tabindex="0" aria-label="Слайды презентации, листайте стрелками">
        <div class="deck-strip">${Array.from({ length: d.slides }, (_, i) => `<img src="${src(i + 1)}" alt="Слайд ${i + 1}" ${i ? 'loading="lazy"' : ''} draggable="false">`).join('')}</div>
        <button class="deck-arrow prev" aria-label="Предыдущий слайд">←</button>
        <button class="deck-arrow next" aria-label="Следующий слайд">→</button>
        <span class="deck-count"><b>01</b> / ${String(d.slides).padStart(2, '0')}</span>
      </div>
      <div class="deck-thumbs">${Array.from({ length: d.slides }, (_, i) => `<button aria-label="Слайд ${i + 1}"><img loading="lazy" src="${src(i + 1)}" alt=""></button>`).join('')}</div>
    </div>`;
  deckList.appendChild(box);

  const screen = box.querySelector('.deck-screen'), strip = box.querySelector('.deck-strip');
  const thumbs = [...box.querySelectorAll('.deck-thumbs button')], count = box.querySelector('.deck-count b');
  let cur = 0;
  const go = n => {
    cur = (n + d.slides) % d.slides;
    strip.style.transform = `translateX(${-cur * 100}%)`;
    thumbs.forEach((t, i) => t.classList.toggle('on', i === cur));
    count.textContent = String(cur + 1).padStart(2, '0');
  };
  go(0);
  box.querySelector('.prev').addEventListener('click', e => { e.stopPropagation(); go(cur - 1); });
  box.querySelector('.next').addEventListener('click', e => { e.stopPropagation(); go(cur + 1); });
  thumbs.forEach((t, i) => t.addEventListener('click', () => go(i)));
  screen.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); });
  // свайп пальцем; простой клик — открыть слайд крупно
  let sx = null;
  screen.addEventListener('pointerdown', e => { if (!e.target.closest('.deck-arrow')) sx = e.clientX; });
  screen.addEventListener('pointerup', e => {
    if (sx === null) return; const dx = e.clientX - sx; sx = null;
    if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1));
    else { lbBody.innerHTML = `<img src="${src(cur + 1)}" alt="">`; lb.classList.add('open'); }
  });
});

/* ---------- появление при прокрутке ---------- */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revObs.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ---------- шапка при прокрутке ---------- */
const header = document.querySelector('.top');
addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 40), { passive: true });

/* ---------- первый экран: под курсором проявляется фото ---------- */
const hero = document.querySelector('.hero');
const heroMedia = document.querySelector('.hero-media'); // маска проявления общая для фото и вырезанного силуэта
let hx = innerWidth * 0.72, hy = innerHeight * 0.4, tx = hx, ty = hy, r = 0, tr = 0, inside = false, t0 = performance.now();
hero.addEventListener('mousemove', e => { const b = hero.getBoundingClientRect(); tx = e.clientX - b.left; ty = e.clientY - b.top; inside = true; });
hero.addEventListener('mouseleave', () => { inside = false; });
function heroLoop(now) {
  const w = heroMedia.clientWidth, h = heroMedia.clientHeight, mob = innerWidth <= 760; // на телефоне лицо по центру
  if (!inside) {
    // без мышки пятно само медленно гуляет по лицу
    const t = (now - t0) / 1000;
    tx = w * ((mob ? 0.5 : 0.70) + 0.07 * Math.sin(t * 0.6)); ty = h * ((mob ? 0.36 : 0.42) + 0.12 * Math.sin(t * 0.43));
  }
  tr = inside ? Math.min(w, h) * 0.32 : Math.min(w, h) * (isTouch ? 0.34 : 0.2);
  hx = lerp(hx, tx, 0.09); hy = lerp(hy, ty, 0.09); r = lerp(r, tr, 0.06);
  heroMedia.style.setProperty('--x', hx + 'px'); heroMedia.style.setProperty('--y', hy + 'px'); heroMedia.style.setProperty('--r', r + 'px');
  requestAnimationFrame(heroLoop);
}
requestAnimationFrame(heroLoop);


/* ---------- курсор ---------- */
const cur = document.querySelector('.cursor'), ring = cur.querySelector('.cursor-ring');
let mx = -100, my = -100, rx = -100, ry = -100, vx = 0, vy = 0;
addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function ringLoop() {
  // пузырь догоняет мышку с пружинкой и чуть вытягивается в движении
  vx = (vx + (mx - rx) * 0.2) * 0.62; vy = (vy + (my - ry) * 0.2) * 0.62; rx += vx; ry += vy;
  const sp = Math.min(Math.hypot(vx, vy) / 40, 0.25), ang = Math.atan2(vy, vx) * 180 / Math.PI;
  ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%) rotate(${ang}deg) scale(${1 + sp}, ${1 - sp}) rotate(${-ang}deg)`;
  requestAnimationFrame(ringLoop);
})();

/* ---------- клик: пузырь лопается брызгами ---------- */
function pop(x, y, n = 12, big = 1) {
  const p = document.createElement('div'); p.className = 'pop'; p.style.left = x + 'px'; p.style.top = y + 'px';
  if (big !== 1) p.style.transform = `scale(${big})`;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * .4, d = 30 + Math.random() * 40;
    const d2 = document.createElement('i'); d2.style.setProperty('--dx', Math.cos(a) * d + 'px'); d2.style.setProperty('--dy', Math.sin(a) * d + 'px');
    d2.style.width = d2.style.height = 3 + Math.random() * 5 + 'px'; p.appendChild(d2);
  }
  document.body.appendChild(p); setTimeout(() => p.remove(), 700);
}
addEventListener('mousedown', e => {
  cur.classList.add('is-down');
  ring.animate([{ opacity: 1 }, { opacity: 0, offset: .15 }, { opacity: 0, offset: .7 }, { opacity: 1 }], { duration: 600 });
  pop(e.clientX, e.clientY);
});
addEventListener('mouseup', () => cur.classList.remove('is-down'));

/* ---------- пузыри на фоне: всплывают, лопаются от клика ---------- */
const bubbleBox = document.querySelector('.bubbles');
function spawnBubble(first) {
  if (reduce || document.hidden) return;
  const b = document.createElement('div'); b.className = 'bubble';
  const s = 18 + Math.random() * 46, dur = 14 + Math.random() * 14, x = Math.random() * 100;
  b.style.width = b.style.height = s + 'px'; b.style.left = x + 'vw'; b.style.top = '100vh';
  bubbleBox.appendChild(b);
  const sway = (Math.random() - .5) * 160;
  const anim = b.animate([
    { transform: `translate(0, ${first ? -Math.random() * 90 : 0}vh)` },
    { transform: `translate(${sway}px, -112vh)` }
  ], { duration: dur * 1000, easing: 'linear' });
  anim.onfinish = () => b.remove();
  b.addEventListener('mousedown', e => { e.stopPropagation(); const r = b.getBoundingClientRect(); pop(r.left + r.width / 2, r.top + r.height / 2, 16, s / 34); b.remove(); });
}
for (let i = 0; i < (isTouch ? 4 : 8); i++) spawnBubble(true);
setInterval(() => { if (bubbleBox.children.length < (isTouch ? 5 : 10)) spawnBubble(false); }, 2600);

/* графика, выглядывающая из-под карточек «Почему ко мне возвращаются» — в стиле первого экрана */
const WHY_ART = [
  // 01 полный цикл — стрелка по кругу
  '<svg viewBox="0 0 120 120"><path d="M95 40 A 42 42 0 1 0 100 72"/><path d="M84 30 L96 40 L84 52"/><circle class="thin" cx="60" cy="60" r="20"/></svg>',
  // 02 печать — стопка листов с загнутым углом
  '<svg viewBox="0 0 130 120"><path d="M20 30 H85 L105 50 V110 H20 Z"/><path d="M85 30 V50 H105"/><path class="thin" d="M30 18 H95 L115 38 V98 M40 6 H105 L125 26 V86"/><path class="thin" d="M34 66 H90 M34 78 H90 M34 90 H70"/></svg>',
  // 03 технологии — кристалл с искрой
  '<svg viewBox="0 0 120 120"><path d="M30 45 L45 22 H75 L90 45 L60 100 Z"/><path class="thin" d="M30 45 H90 M45 22 L60 45 L75 22 M60 45 V100"/><path d="M100 8 C 101 16, 103 18, 111 19 C 103 20, 101 22, 100 30 C 99 22, 97 20, 89 19 C 97 18, 99 16, 100 8 Z"/></svg>',
  // 04 единый стиль — веер образцов цвета
  '<svg viewBox="0 0 140 150"><g transform="translate(20 135)"><rect x="-8" y="-120" width="22" height="120" rx="4" transform="rotate(-26)"/><rect x="-8" y="-120" width="22" height="120" rx="4" transform="rotate(-10)"/><rect x="-8" y="-120" width="22" height="120" rx="4" transform="rotate(6)"/><rect x="-8" y="-120" width="22" height="120" rx="4" transform="rotate(22)"/><circle cx="3" cy="-8" r="4"/></g></svg>',
  // 05 визуал без студии — диафрагма объектива
  '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="46"/><path class="thin" d="M60 14 L84 52 M106 60 L66 76 M83 100 L52 72 M37 100 L44 58 M14 60 L58 42 M37 20 L72 46"/><circle class="thin" cx="60" cy="60" r="16"/></svg>',
  // 06 в срок — песочные часы
  '<svg viewBox="0 0 100 130"><path d="M20 10 H80 M20 120 H80"/><path d="M28 10 C 28 45, 50 55, 50 65 C 50 75, 28 85, 28 120 M72 10 C 72 45, 50 55, 50 65 C 50 75, 72 85, 72 120"/><path class="thin" d="M38 110 C 44 98, 56 98, 62 110 Z M44 40 H56"/></svg>'
];
const WHY_POS = ['tl', 'tr', 'tr', 'bl', 'br', 'br']; // верхний ряд выглядывает сверху, нижний — снизу
document.querySelectorAll('.why-item').forEach((w, i) => {
  w.insertAdjacentHTML('afterbegin', `<div class="why-art ${WHY_POS[i % 6]}" aria-hidden="true">${WHY_ART[i % 6]}</div>`);
  w.querySelectorAll('.why-art path, .why-art rect, .why-art circle').forEach(s => s.setAttribute('pathLength', '1'));
  // у каждого рисунка своя траектория и скорость, чтобы плавали не синхронно
  const a = w.querySelector('.why-art'), r = n => (Math.sin((i + 1) * 97.13 + n * 13.7) * 0.5 + 0.5);
  [['--w1x', 1], ['--w1y', 2], ['--w2x', 3], ['--w2y', 4], ['--w3x', 5], ['--w3y', 6]].forEach(([k, n]) => a.style.setProperty(k, ((r(n) - .5) * 80).toFixed(0) + 'px'));
  a.style.setProperty('--wd', (13 + r(7) * 10).toFixed(1) + 's'); a.style.setProperty('--wdl', (-r(8) * 10).toFixed(1) + 's');
  a.dataset.depth = (14 + r(9) * 26).toFixed(0);
});
// мышка над блоком двигает рисунки с разной глубиной
const whySec = document.getElementById('why'), whyArts = whySec ? whySec.querySelectorAll('.why-art') : [];
if (whySec && !isTouch) whySec.addEventListener('mousemove', e => {
  const b = whySec.getBoundingClientRect(), dx = (e.clientX - b.left) / b.width - .5, dy = (e.clientY - b.top) / b.height - .5;
  whyArts.forEach(a => { const d = +a.dataset.depth; a.style.translate = `${-dx * d * 2}px ${-dy * d * 2}px`; });
});

/* подсветка в блоке преимуществ идёт за мышкой */
document.querySelectorAll('.why-item').forEach(w => w.addEventListener('mousemove', e => {
  const r = w.getBoundingClientRect(); w.style.setProperty('--wx', e.clientX - r.left + 'px'); w.style.setProperty('--wy', e.clientY - r.top + 'px');
}));
document.addEventListener('mouseover', e => {
  const isCard = e.target.closest('.card, .project-grid figure, .deck-strip'), isLink = e.target.closest('a, button');
  cur.classList.toggle('is-view', !!isCard); cur.classList.toggle('is-link', !isCard && !!isLink);
  ring.querySelector('span').textContent = isCard ? 'Смотреть' : '';
});

/* ---------- наклон карточек за мышкой ---------- */
if (!isTouch && !reduce) {
  document.addEventListener('mousemove', e => {
    const c = e.target.closest('.card'); if (!c) return;
    const b = c.getBoundingClientRect(), px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
    c.style.transform = `perspective(900px) rotateY(${(px - .5) * 10}deg) rotateX(${(.5 - py) * 10}deg) translateZ(0)`;
    c.style.setProperty('--gx', px * 100 + '%'); c.style.setProperty('--gy', py * 100 + '%');
  });
  document.addEventListener('mouseout', e => { const c = e.target.closest('.card'); if (c && !c.contains(e.relatedTarget)) c.style.transform = ''; });
}

/* ---------- просмотр крупно ---------- */
const lb = document.querySelector('.lightbox'), lbBody = lb.querySelector('.lb-body');
document.addEventListener('click', e => {
  const c = e.target.closest('.card, .project-grid figure'); if (!c) return;
  lbBody.innerHTML = c.dataset.video
    ? `<video src="media/video/${c.dataset.video}.mp4" autoplay loop playsinline controls></video>`
    : `<img src="${c.dataset.full}" alt="">`;
  lb.classList.add('open');
});
function closeLb() { lb.classList.remove('open'); setTimeout(() => lbBody.innerHTML = '', 400); }
lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('.lb-close')) closeLb(); });
addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (order.classList.contains('open')) closeOrder();
  else if (lb.classList.contains('open')) closeLb(); else if (proj.classList.contains('open')) closeProject();
});

/* ---------- графика за спиной: рисуется линиями и смещается за мышкой ---------- */
const arts = document.querySelectorAll('.art');
arts.forEach(a => a.querySelectorAll('path, rect, circle').forEach(s => s.setAttribute('pathLength', '1')));
hero.addEventListener('mousemove', e => {
  const dx = e.clientX / innerWidth - .5, dy = e.clientY / innerHeight - .5;
  arts.forEach(a => { const d = +a.dataset.depth; a.style.translate = `${-dx * d * 1.6}px ${-dy * d * 1.6}px`; });
});

/* ---------- золотая пыль, тянется к курсору ---------- */
const cv = document.querySelector('.dust'), ctx = cv.getContext('2d');
let W, H, dpr = Math.min(devicePixelRatio, 2);
function size() { W = cv.width = innerWidth * dpr; H = cv.height = innerHeight * dpr; }
size(); addEventListener('resize', size);
const N = reduce ? 0 : (isTouch ? 30 : 70);
const P = Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), vx: 0, vy: 0, s: Math.random() * 1.6 + .4, a: Math.random() * .5 + .15, ph: Math.random() * 6.28 }));
(function dustLoop(now) {
  ctx.clearRect(0, 0, W, H);
  const cx = mx / innerWidth, cy = my / innerHeight;
  P.forEach(p => {
    const dx = cx - p.x, dy = cy - p.y, d = Math.hypot(dx, dy);
    if (d < .18) { p.vx += dx * .00025; p.vy += dy * .00025; }
    p.vx += Math.sin(now / 3000 + p.ph) * .000012; p.vy -= .000025;
    p.vx *= .97; p.vy *= .97; p.x += p.vx; p.y += p.vy;
    if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
    if (p.x < -0.02) p.x = 1.02; if (p.x > 1.02) p.x = -0.02;
    const tw = .6 + .4 * Math.sin(now / 700 + p.ph);
    ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.s * dpr, 0, 6.283);
    ctx.fillStyle = `rgba(232,205,146,${p.a * tw})`; ctx.fill();
  });
  requestAnimationFrame(dustLoop);
})(0);

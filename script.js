/* ==========================================================
   Этот файл править не нужно.
   Всё содержимое сайта лежит в папке data/ и правится через админку:
     data/news.json         — новости
     data/schedule.json     — расписание богослужений
     data/words.json        — список отрывков для «слова дня»
     data/reflections.json  — размышления священника по датам
   ========================================================== */

// ---------- вспомогательные функции ----------
const $ = id => document.getElementById(id);

async function loadJSON(path) {
  const r = await fetch(path, { cache: "no-cache" });
  if (!r.ok) throw new Error(path + ": " + r.status);
  return r.json();
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text) e.textContent = text;
  return e;
}

// картинки из админки могут быть записаны как "/images/a.jpg" — делаем путь относительным
function imgPath(p) { return String(p || "").replace(/^\/+/, ""); }
function cssUrl(p) { return "url('" + encodeURI(imgPath(p)).replace(/'/g, "%27") + "')"; }

// разрешаем только http(s) и относительные ссылки
function safeHref(h) {
  h = String(h || "").trim();
  return /^(https?:\/\/|\/|\.|#|mailto:|tel:)/i.test(h) ? h : "";
}

function fmtDate(iso) {
  const d = new Date(iso + "T12:00:00");
  return isNaN(d) ? "" : d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function todayKey() {
  const n = new Date(), p = x => String(x).padStart(2, "0");
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
}

// ---------- меню-бургер ----------
const burger = document.querySelector(".burger");
const menu = $("menu");
if (burger && menu) {
  burger.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
  });
  menu.addEventListener("click", e => {
    if (e.target.tagName === "A") {
      menu.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  });
}

// ---------- слово дня ----------
async function initWord() {
  if (!$("word-ref")) return;
  const now = new Date();
  $("word-date").textContent =
    now.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  let words = [], notes = [];
  try { words = await loadJSON("data/words.json"); } catch (e) {}
  try { notes = await loadJSON("data/reflections.json"); } catch (e) {}

  const note = notes.find(n => n.date === todayKey());
  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const word = words.length ? words[dayOfYear % words.length] : null;

  const ownRef = note && note.ref;
  $("word-ref").textContent = ownRef || (word && word.ref) || "Слово дня";

  const text = ownRef ? "" : (word && word.text) || "";
  if (text) $("word-text").textContent = text; else $("word-text").hidden = true;

  if (note && note.text) {
    $("word-note").hidden = false;
    $("word-note-text").textContent = note.text;
    $("word-note-author").textContent = note.author || "";
  }
}

// ---------- расписание ----------
async function initSchedule() {
  const list = $("schedule-list");
  if (!list) return;
  try {
    const rows = await loadJSON("data/schedule.json");
    list.replaceChildren();
    rows.forEach(r => {
      const li = el("li");
      li.append(el("span", "when", r.day), el("span", "time", r.time), el("span", "what", r.service));
      list.append(li);
    });
    if (!rows.length) list.append(el("li", "empty", "Расписание скоро появится."));
  } catch (e) {
    list.replaceChildren(el("li", "empty", "Не удалось загрузить расписание."));
  }
}

// ---------- список новостей на главной ----------
async function initNewsList() {
  const box = $("news-list");
  if (!box) return;
  try {
    const items = (await loadJSON("data/news.json"))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 6);
    box.replaceChildren();
    items.forEach(n => {
      const card = el("article", "card");
      if (n.image) {
        const img = el("div", "card-img");
        img.style.setProperty("--photo", cssUrl(n.image));
        card.append(img);
      }
      const body = el("div", "card-body");
      body.append(el("p", "card-date", fmtDate(n.date)), el("h3", "", n.title), el("p", "", n.summary || ""));
      if (n.id) {
        const a = el("a", "link-quiet", "Читать дальше");
        a.href = "news.html?id=" + encodeURIComponent(n.id);
        body.append(a);
      }
      card.append(body);
      box.append(card);
    });
    if (!items.length) box.append(el("p", "empty", "Новостей пока нет."));
  } catch (e) {
    box.replaceChildren(el("p", "empty", "Не удалось загрузить новости."));
  }
}

// ---------- страница одной новости (news.html?id=...) ----------
async function initNewsArticle() {
  const box = $("article");
  if (!box) return;
  const id = new URLSearchParams(location.search).get("id");
  try {
    const n = (await loadJSON("data/news.json")).find(x => x.id === id);
    if (!n) throw new Error("not found");
    document.title = n.title + " — Приход святой Троицы";
    box.replaceChildren();
    box.append(el("p", "card-date", fmtDate(n.date)), el("h1", "article-title", n.title));
    if (n.image) {
      const img = el("img", "article-img");
      img.src = imgPath(n.image); img.alt = "";
      box.append(img);
    }
    String(n.body || n.summary || "").split(/\n\s*\n/).forEach(par => {
      if (par.trim()) box.append(el("p", "", par.trim()));
    });
  } catch (e) {
    box.replaceChildren(el("p", "empty", "Новость не найдена."));
  }
}

initWord(); initSchedule(); initNewsList(); initNewsArticle();

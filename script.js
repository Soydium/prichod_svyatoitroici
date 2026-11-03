/* ==========================================================
   ✏️ СЛОВО ДНЯ
   Сайт сам берёт по одному отрывку из списка в день и ходит по кругу.
   Чтобы добавить отрывок — скопируй строку { ref: "...", text: "..." },
   запятая в конце обязательна. Текст (text) можно оставить пустым: "".
   Важно: русские переводы Библии защищены авторским правом —
   вписывай только тот текст, на который у прихода есть право.
   ========================================================== */
const WORDS = [
  { ref: "Ин 3:16",  text: "" },
  { ref: "Пс 22:1",  text: "" },
  { ref: "Мф 11:28", text: "" },
  { ref: "Рим 8:28", text: "" },
  { ref: "Лк 1:37",  text: "" },
  { ref: "Флп 4:13", text: "" },
  { ref: "Ис 41:10", text: "" }
];

/* ==========================================================
   ✏️ РАЗМЫШЛЕНИЯ СВЯЩЕННИКА
   Формат: "ГГГГ-ММ-ДД": { text: "...", author: "о. Имя" },
   Если на сегодня записи нет, блок размышления просто не показывается.
   Можно также указать свой отрывок на конкретный день: ref: "Мк 1:15"
   ========================================================== */
const NOTES = {
  "2026-11-03": {
    ref: "",          // оставь пустым, чтобы использовался отрывок из списка выше
    text: "Пример размышления. Замени этот текст своим.",
    author: "о. Имя Фамилия"
  }
};

/* ---------- ниже менять не нужно ---------- */

// меню-бургер
const burger = document.querySelector(".burger");
const menu = document.getElementById("menu");
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

// слово дня
(function () {
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  const key = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;

  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const word = WORDS[dayOfYear % WORDS.length];
  const note = NOTES[key];

  document.getElementById("word-date").textContent =
    now.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  document.getElementById("word-ref").textContent = (note && note.ref) || word.ref;

  const textEl = document.getElementById("word-text");
  const text = (note && note.ref) ? "" : word.text;
  if (text) { textEl.textContent = text; } else { textEl.hidden = true; }

  if (note && note.text) {
    document.getElementById("word-note").hidden = false;
    document.getElementById("word-note-text").textContent = note.text;
    document.getElementById("word-note-author").textContent = note.author || "";
  }
})();

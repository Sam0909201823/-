const STORAGE_KEY = "bibleSlotHistoryV2";

const elements = {
  bookSlot: document.getElementById("bookSlot"),
  chapterSlot: document.getElementById("chapterSlot"),
  verseSlot: document.getElementById("verseSlot"),
  drawButton: document.getElementById("drawButton"),
  clearButton: document.getElementById("clearButton"),
  statusMessage: document.getElementById("statusMessage"),
  result: document.getElementById("result"),
  resultText: document.getElementById("resultText"),
  historyList: document.getElementById("historyList"),
  emptyHistory: document.getElementById("emptyHistory"),
  historySearch: document.getElementById("historySearch"),
  usedCount: document.getElementById("usedCount"),
  remainingCount: document.getElementById("remainingCount"),
  totalCount: document.getElementById("totalCount"),
  versePanel: document.getElementById("versePanel"),
  verseReference: document.getElementById("verseReference"),
  verseMask: document.getElementById("verseMask"),
  verseText: document.getElementById("verseText"),
  verseStatus: document.getElementById("verseStatus"),
  revealVerseButton: document.getElementById("revealVerseButton")
};

let bibleBooks = [];
let allReferences = [];
let history = loadHistory();
let isDrawing = false;
let currentReference = null;
let currentVerseLoaded = false;

initialize();

async function initialize() {
  disableControls(true);
  renderHistory();
  updateStats();

  try {
    bibleBooks = await loadBibleData();
    allReferences = buildAllReferences(bibleBooks);

    elements.statusMessage.textContent = "完整節數資料載入完成，可以開始抽經文。";
    updateStats();
    disableControls(false);
  } catch (error) {
    console.error(error);
    elements.statusMessage.textContent =
      "離線資料載入失敗，請重新整理頁面。";
    elements.statusMessage.classList.add("error");
    elements.drawButton.disabled = true;
    elements.clearButton.disabled = false;
  }
}

function buildAllReferences(books) {
  const references = [];

  books.forEach((book) => {
    book.verseCounts.forEach((verseCount, chapterIndex) => {
      const chapter = chapterIndex + 1;

      for (let verse = 1; verse <= verseCount; verse += 1) {
        references.push({
          book: book.chinese,
          chapter,
          verse,
          key: createReferenceKey(book.chinese, chapter, verse)
        });
      }
    });
  });

  return references;
}

async function drawReference() {
  if (isDrawing || allReferences.length === 0) {
    return;
  }

  const usedKeys = new Set(history.map((item) => item.key));
  const availableReferences = allReferences.filter(
    (reference) => !usedKeys.has(reference.key)
  );

  if (availableReferences.length === 0) {
    elements.statusMessage.textContent = "全部經文都已抽完！";
    elements.statusMessage.classList.add("error");
    return;
  }

  isDrawing = true;
  disableControls(true);
  elements.result.hidden = true;
  elements.statusMessage.classList.remove("error");
  elements.statusMessage.textContent = "老虎機轉動中……";

  const finalReference = randomItem(availableReferences);

  addSpinningClass(true);

  const bookTimer = window.setInterval(() => {
    elements.bookSlot.textContent = randomItem(bibleBooks).chinese;
  }, 70);

  const chapterTimer = window.setInterval(() => {
    const randomBook = randomItem(bibleBooks);
    const chapter = randomInteger(1, randomBook.verseCounts.length);
    elements.chapterSlot.textContent = `${chapter}章`;
  }, 62);

  const verseTimer = window.setInterval(() => {
    elements.verseSlot.textContent = `${randomInteger(1, 176)}節`;
  }, 54);

  await wait(1100);
  window.clearInterval(bookTimer);
  elements.bookSlot.textContent = finalReference.book;
  elements.bookSlot.classList.remove("spinning");

  await wait(500);
  window.clearInterval(chapterTimer);
  elements.chapterSlot.textContent = `${finalReference.chapter}章`;
  elements.chapterSlot.classList.remove("spinning");

  await wait(500);
  window.clearInterval(verseTimer);
  elements.verseSlot.textContent = `${finalReference.verse}節`;
  elements.verseSlot.classList.remove("spinning");

  saveReference(finalReference);
  showResult(finalReference);
  prepareVerseReveal(finalReference);

  elements.statusMessage.textContent = "抽選完成！";
  isDrawing = false;
  disableControls(false);
}

function saveReference(reference) {
  history.unshift({
    ...reference,
    drawnAt: new Date().toISOString()
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  renderHistory();
  updateStats();
}

function loadHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (!Array.isArray(saved)) {
      return [];
    }

    return saved.filter((item) =>
      item &&
      typeof item.book === "string" &&
      Number.isInteger(item.chapter) &&
      Number.isInteger(item.verse)
    ).map((item) => ({
      ...item,
      key: item.key || createReferenceKey(
        item.book,
        item.chapter,
        item.verse
      )
    }));
  } catch (error) {
    console.warn("無法讀取舊紀錄，已改用空白紀錄。", error);
    return [];
  }
}

function renderHistory() {
  const keyword = elements.historySearch.value.trim().toLowerCase();

  const filteredHistory = history.filter((item) =>
    formatReference(item).toLowerCase().includes(keyword)
  );

  elements.historyList.innerHTML = "";

  filteredHistory.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = `✅ ${formatReference(item)}`;
    elements.historyList.appendChild(listItem);
  });

  elements.emptyHistory.hidden = filteredHistory.length > 0;

  if (history.length > 0 && filteredHistory.length === 0) {
    elements.emptyHistory.hidden = false;
    elements.emptyHistory.textContent = "找不到符合搜尋條件的紀錄。";
  } else {
    elements.emptyHistory.textContent = "還沒有抽選紀錄。";
  }
}

function clearHistory() {
  if (history.length === 0) {
    elements.statusMessage.textContent = "目前沒有紀錄需要清除。";
    return;
  }

  const confirmed = window.confirm(
    "確定要清除全部已抽紀錄嗎？清除後將無法復原。"
  );

  if (!confirmed) {
    return;
  }

  history = [];
  localStorage.removeItem(STORAGE_KEY);

  elements.bookSlot.textContent = "準備";
  elements.chapterSlot.textContent = "—";
  elements.verseSlot.textContent = "—";
  elements.result.hidden = true;
  elements.versePanel.hidden = true;
  elements.verseMask.classList.remove("revealed");
  elements.historySearch.value = "";
  currentReference = null;
  currentVerseLoaded = false;
  elements.statusMessage.textContent = "已清除全部紀錄，可以重新開始。";

  renderHistory();
  updateStats();
}

function updateStats() {
  const total = allReferences.length;
  const used = history.length;
  const remaining = Math.max(total - used, 0);

  elements.usedCount.textContent = used.toLocaleString("zh-TW");
  elements.totalCount.textContent =
    total > 0 ? total.toLocaleString("zh-TW") : "—";
  elements.remainingCount.textContent =
    total > 0 ? remaining.toLocaleString("zh-TW") : "—";
}


async function prepareVerseReveal(reference) {
  currentReference = reference;
  currentVerseLoaded = false;

  elements.versePanel.hidden = false;
  elements.verseReference.textContent = formatReference(reference);
  elements.verseText.textContent = "經文載入中……";
  elements.verseStatus.textContent =
    "經文會先以馬賽克遮住，按「顯示經文」後才會揭曉。";
  elements.verseStatus.classList.remove("error");
  elements.verseMask.classList.remove("revealed");
  elements.revealVerseButton.disabled = true;
  elements.revealVerseButton.textContent = "⏳ 載入中";

  try {
    const verseText = await loadVerseText(reference);

    if (
      !currentReference ||
      currentReference.key !== reference.key
    ) {
      return;
    }

    elements.verseText.textContent = verseText;
    currentVerseLoaded = true;
    elements.revealVerseButton.disabled = false;
    elements.revealVerseButton.textContent = "👁 顯示經文";
  } catch (error) {
    console.error(error);

    if (
      !currentReference ||
      currentReference.key !== reference.key
    ) {
      return;
    }

    elements.verseText.textContent = "目前無法取得經文內容。";
    elements.verseStatus.textContent =
      "經文內容需要網路連線；請確認網路後重新抽選。";
    elements.verseStatus.classList.add("error");
    elements.revealVerseButton.disabled = true;
    elements.revealVerseButton.textContent = "載入失敗";
  }
}

async function loadVerseText(reference) {
  const cacheKey = `bibleVerseText:${reference.key}`;
  const cachedText = localStorage.getItem(cacheKey);

  if (cachedText) {
    return cachedText;
  }

  const book = bibleBooks.find(
    (item) => item.chinese === reference.book
  );

  if (!book || !book.english) {
    throw new Error("找不到英文書卷名稱");
  }

  const passage =
    `${book.english} ${reference.chapter}:${reference.verse}`;
  const url =
    `https://bible-api.com/${encodeURIComponent(passage)}?translation=cuv`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`經文 API 回應錯誤：${response.status}`);
  }

  const data = await response.json();
  const text = String(data.text || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    throw new Error("API 沒有回傳經文內容");
  }

  localStorage.setItem(cacheKey, text);
  return text;
}

function revealVerse() {
  if (!currentVerseLoaded) {
    return;
  }

  const isRevealed =
    elements.verseMask.classList.toggle("revealed");

  elements.revealVerseButton.textContent =
    isRevealed ? "🙈 隱藏經文" : "👁 顯示經文";

  elements.verseStatus.textContent =
    isRevealed
      ? "經文已揭曉。"
      : "經文已重新遮住。";
}

function showResult(reference) {
  elements.resultText.textContent = formatReference(reference);
  elements.result.hidden = false;
}

function formatReference(reference) {
  return `${reference.book} ${reference.chapter}章 ${reference.verse}節`;
}

function createReferenceKey(book, chapter, verse) {
  return `${book}|${chapter}|${verse}`;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function wait(milliseconds) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function addSpinningClass(active) {
  [
    elements.bookSlot,
    elements.chapterSlot,
    elements.verseSlot
  ].forEach((element) => {
    element.classList.toggle("spinning", active);
  });
}

function disableControls(disabled) {
  elements.drawButton.disabled = disabled;
  elements.clearButton.disabled = disabled && isDrawing;
}

elements.drawButton.addEventListener("click", drawReference);
elements.clearButton.addEventListener("click", clearHistory);
elements.historySearch.addEventListener("input", renderHistory);
elements.revealVerseButton.addEventListener("click", revealVerse);

document.addEventListener("keydown", (event) => {
  if (
    event.code === "Space" &&
    event.target.tagName !== "INPUT" &&
    !elements.drawButton.disabled
  ) {
    event.preventDefault();
    drawReference();
  }
});

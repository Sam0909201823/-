const STORAGE_KEY = "bibleSlotHistoryV2";

const elements = {
  bookReel: document.getElementById("bookReel"),
  chapterReel: document.getElementById("chapterReel"),
  verseReel: document.getElementById("verseReel"),
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
  totalCount: document.getElementById("totalCount")
};

let bibleBooks = [];
let allReferences = [];
let history = loadHistory();
let isDrawing = false;

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

  const bookItems = createBookSequence(finalReference.book, 34);
  const chapterItems = createNumberSequence(
    `${finalReference.chapter}章`, 1, 150, 38, "章"
  );
  const verseItems = createNumberSequence(
    `${finalReference.verse}節`, 1, 176, 42, "節"
  );

  prepareReel(elements.bookReel, bookItems);
  prepareReel(elements.chapterReel, chapterItems);
  prepareReel(elements.verseReel, verseItems);

  elements.bookReel.classList.add("spinning");
  elements.chapterReel.classList.add("spinning");
  elements.verseReel.classList.add("spinning");

  const bookAnimation = spinReel(elements.bookReel, bookItems.length, 1500);
  const chapterAnimation = spinReel(elements.chapterReel, chapterItems.length, 2050);
  const verseAnimation = spinReel(elements.verseReel, verseItems.length, 2550);

  await bookAnimation;
  elements.bookReel.classList.remove("spinning");
  elements.bookReel.classList.add("stopping");

  await chapterAnimation;
  elements.chapterReel.classList.remove("spinning");
  elements.chapterReel.classList.add("stopping");

  await verseAnimation;
  elements.verseReel.classList.remove("spinning");
  elements.verseReel.classList.add("stopping");

  saveReference(finalReference);
  showResult(finalReference);

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

  setSingleReelValue(elements.bookReel, "準備");
  setSingleReelValue(elements.chapterReel, "—");
  setSingleReelValue(elements.verseReel, "—");
  elements.result.hidden = true;
  elements.historySearch.value = "";
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

function createBookSequence(finalBook, length) {
  const values = [];

  for (let index = 0; index < length - 1; index += 1) {
    values.push(randomItem(bibleBooks).chinese);
  }

  values.push(finalBook);
  return values;
}

function createNumberSequence(finalValue, min, max, length, suffix) {
  const values = [];

  for (let index = 0; index < length - 1; index += 1) {
    values.push(`${randomInteger(min, max)}${suffix}`);
  }

  values.push(finalValue);
  return values;
}

function prepareReel(reel, values) {
  reel.innerHTML = "";

  values.forEach((value) => {
    const item = document.createElement("div");
    item.className = "slot-item";
    item.textContent = value;
    reel.appendChild(item);
  });

  reel.style.transition = "none";
  reel.style.transform = "translateY(0)";
  reel.getBoundingClientRect();
}

function spinReel(reel, itemCount, duration) {
  const itemHeight = getReelItemHeight(reel);
  const finalOffset = -((itemCount - 1) * itemHeight);

  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      reel.style.transition =
        `transform ${duration}ms cubic-bezier(0.12, 0.72, 0.18, 1)`;
      reel.style.transform = `translateY(${finalOffset}px)`;
    });

    window.setTimeout(() => {
      const finalText = reel.lastElementChild?.textContent || "";
      setSingleReelValue(reel, finalText);
      resolve();
    }, duration + 40);
  });
}

function getReelItemHeight(reel) {
  const item = reel.querySelector(".slot-item");
  return item ? item.getBoundingClientRect().height : 116;
}

function setSingleReelValue(reel, value) {
  reel.classList.remove("spinning", "stopping");
  reel.style.transition = "none";
  reel.style.transform = "translateY(0)";
  reel.innerHTML = "";

  const item = document.createElement("div");
  item.className = "slot-item";
  item.textContent = value;
  reel.appendChild(item);
}


function disableControls(disabled) {
  elements.drawButton.disabled = disabled;
  elements.clearButton.disabled = disabled && isDrawing;
}

elements.drawButton.addEventListener("click", drawReference);
elements.clearButton.addEventListener("click", clearHistory);
elements.historySearch.addEventListener("input", renderHistory);

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

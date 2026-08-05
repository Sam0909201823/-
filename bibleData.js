/*
  翻聖經大賽 Bible Data 1.0
  ---------------------------------
  這個檔案提供：
  1. 66 卷中文卷名
  2. 與英文資料名稱的對照
  3. 每卷章數
  4. 從公開資料載入每章正確節數

  節數資料來源：
  https://github.com/bkuhl/bible-verse-counts-per-chapter
*/

const BIBLE_DATA_URL =
  "https://raw.githubusercontent.com/bkuhl/bible-verse-counts-per-chapter/master/bible.json";

const BIBLE_BOOKS = [
  { english: "Genesis", chinese: "創世記", chapters: 50 },
  { english: "Exodus", chinese: "出埃及記", chapters: 40 },
  { english: "Leviticus", chinese: "利未記", chapters: 27 },
  { english: "Numbers", chinese: "民數記", chapters: 36 },
  { english: "Deuteronomy", chinese: "申命記", chapters: 34 },
  { english: "Joshua", chinese: "約書亞記", chapters: 24 },
  { english: "Judges", chinese: "士師記", chapters: 21 },
  { english: "Ruth", chinese: "路得記", chapters: 4 },
  { english: "1 Samuel", chinese: "撒母耳記上", chapters: 31 },
  { english: "2 Samuel", chinese: "撒母耳記下", chapters: 24 },
  { english: "1 Kings", chinese: "列王紀上", chapters: 22 },
  { english: "2 Kings", chinese: "列王紀下", chapters: 25 },
  { english: "1 Chronicles", chinese: "歷代志上", chapters: 29 },
  { english: "2 Chronicles", chinese: "歷代志下", chapters: 36 },
  { english: "Ezra", chinese: "以斯拉記", chapters: 10 },
  { english: "Nehemiah", chinese: "尼希米記", chapters: 13 },
  { english: "Esther", chinese: "以斯帖記", chapters: 10 },
  { english: "Job", chinese: "約伯記", chapters: 42 },
  { english: "Psalms", chinese: "詩篇", chapters: 150 },
  { english: "Proverbs", chinese: "箴言", chapters: 31 },
  { english: "Ecclesiastes", chinese: "傳道書", chapters: 12 },
  { english: "Song of Solomon", chinese: "雅歌", chapters: 8 },
  { english: "Isaiah", chinese: "以賽亞書", chapters: 66 },
  { english: "Jeremiah", chinese: "耶利米書", chapters: 52 },
  { english: "Lamentations", chinese: "耶利米哀歌", chapters: 5 },
  { english: "Ezekiel", chinese: "以西結書", chapters: 48 },
  { english: "Daniel", chinese: "但以理書", chapters: 12 },
  { english: "Hosea", chinese: "何西阿書", chapters: 14 },
  { english: "Joel", chinese: "約珥書", chapters: 3 },
  { english: "Amos", chinese: "阿摩司書", chapters: 9 },
  { english: "Obadiah", chinese: "俄巴底亞書", chapters: 1 },
  { english: "Jonah", chinese: "約拿書", chapters: 4 },
  { english: "Micah", chinese: "彌迦書", chapters: 7 },
  { english: "Nahum", chinese: "那鴻書", chapters: 3 },
  { english: "Habakkuk", chinese: "哈巴谷書", chapters: 3 },
  { english: "Zephaniah", chinese: "西番雅書", chapters: 3 },
  { english: "Haggai", chinese: "哈該書", chapters: 2 },
  { english: "Zechariah", chinese: "撒迦利亞書", chapters: 14 },
  { english: "Malachi", chinese: "瑪拉基書", chapters: 4 },
  { english: "Matthew", chinese: "馬太福音", chapters: 28 },
  { english: "Mark", chinese: "馬可福音", chapters: 16 },
  { english: "Luke", chinese: "路加福音", chapters: 24 },
  { english: "John", chinese: "約翰福音", chapters: 21 },
  { english: "Acts", chinese: "使徒行傳", chapters: 28 },
  { english: "Romans", chinese: "羅馬書", chapters: 16 },
  { english: "1 Corinthians", chinese: "哥林多前書", chapters: 16 },
  { english: "2 Corinthians", chinese: "哥林多後書", chapters: 13 },
  { english: "Galatians", chinese: "加拉太書", chapters: 6 },
  { english: "Ephesians", chinese: "以弗所書", chapters: 6 },
  { english: "Philippians", chinese: "腓立比書", chapters: 4 },
  { english: "Colossians", chinese: "歌羅西書", chapters: 4 },
  { english: "1 Thessalonians", chinese: "帖撒羅尼迦前書", chapters: 5 },
  { english: "2 Thessalonians", chinese: "帖撒羅尼迦後書", chapters: 3 },
  { english: "1 Timothy", chinese: "提摩太前書", chapters: 6 },
  { english: "2 Timothy", chinese: "提摩太後書", chapters: 4 },
  { english: "Titus", chinese: "提多書", chapters: 3 },
  { english: "Philemon", chinese: "腓利門書", chapters: 1 },
  { english: "Hebrews", chinese: "希伯來書", chapters: 13 },
  { english: "James", chinese: "雅各書", chapters: 5 },
  { english: "1 Peter", chinese: "彼得前書", chapters: 5 },
  { english: "2 Peter", chinese: "彼得後書", chapters: 3 },
  { english: "1 John", chinese: "約翰一書", chapters: 5 },
  { english: "2 John", chinese: "約翰二書", chapters: 1 },
  { english: "3 John", chinese: "約翰三書", chapters: 1 },
  { english: "Jude", chinese: "猶大書", chapters: 1 },
  { english: "Revelation", chinese: "啟示錄", chapters: 22 }
];

async function loadBibleData() {
  const response = await fetch(BIBLE_DATA_URL, { cache: "force-cache" });

  if (!response.ok) {
    throw new Error(`聖經資料下載失敗：${response.status}`);
  }

  const source = await response.json();
  const sourceByName = new Map(
    source.map((book) => [book.book, book])
  );

  const completeBooks = BIBLE_BOOKS.map((book) => {
    const sourceBook = sourceByName.get(book.english);

    if (!sourceBook) {
      throw new Error(`找不到 ${book.english} 的節數資料`);
    }

    const verseCounts = sourceBook.chapters.map((chapter) =>
      Number(chapter.verses)
    );

    if (verseCounts.length !== book.chapters) {
      throw new Error(`${book.chinese} 的章數資料不一致`);
    }

    return {
      ...book,
      verseCounts
    };
  });

  return completeBooks;
}

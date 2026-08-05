/*
  翻聖經大賽 1.1 完全離線版
  ---------------------------------
  不使用 fetch、不連接外部網站。
  內建 66 卷與正確章數。

  為了在不依賴外部章節資料的情況下，仍保證不會抽到不存在的節，
  本離線穩定版會從每一章的第 1～2 節抽選。
*/

const BIBLE_BOOKS = [
  { chinese: "創世記", chapters: 50 },
  { chinese: "出埃及記", chapters: 40 },
  { chinese: "利未記", chapters: 27 },
  { chinese: "民數記", chapters: 36 },
  { chinese: "申命記", chapters: 34 },
  { chinese: "約書亞記", chapters: 24 },
  { chinese: "士師記", chapters: 21 },
  { chinese: "路得記", chapters: 4 },
  { chinese: "撒母耳記上", chapters: 31 },
  { chinese: "撒母耳記下", chapters: 24 },
  { chinese: "列王紀上", chapters: 22 },
  { chinese: "列王紀下", chapters: 25 },
  { chinese: "歷代志上", chapters: 29 },
  { chinese: "歷代志下", chapters: 36 },
  { chinese: "以斯拉記", chapters: 10 },
  { chinese: "尼希米記", chapters: 13 },
  { chinese: "以斯帖記", chapters: 10 },
  { chinese: "約伯記", chapters: 42 },
  { chinese: "詩篇", chapters: 150 },
  { chinese: "箴言", chapters: 31 },
  { chinese: "傳道書", chapters: 12 },
  { chinese: "雅歌", chapters: 8 },
  { chinese: "以賽亞書", chapters: 66 },
  { chinese: "耶利米書", chapters: 52 },
  { chinese: "耶利米哀歌", chapters: 5 },
  { chinese: "以西結書", chapters: 48 },
  { chinese: "但以理書", chapters: 12 },
  { chinese: "何西阿書", chapters: 14 },
  { chinese: "約珥書", chapters: 3 },
  { chinese: "阿摩司書", chapters: 9 },
  { chinese: "俄巴底亞書", chapters: 1 },
  { chinese: "約拿書", chapters: 4 },
  { chinese: "彌迦書", chapters: 7 },
  { chinese: "那鴻書", chapters: 3 },
  { chinese: "哈巴谷書", chapters: 3 },
  { chinese: "西番雅書", chapters: 3 },
  { chinese: "哈該書", chapters: 2 },
  { chinese: "撒迦利亞書", chapters: 14 },
  { chinese: "瑪拉基書", chapters: 4 },
  { chinese: "馬太福音", chapters: 28 },
  { chinese: "馬可福音", chapters: 16 },
  { chinese: "路加福音", chapters: 24 },
  { chinese: "約翰福音", chapters: 21 },
  { chinese: "使徒行傳", chapters: 28 },
  { chinese: "羅馬書", chapters: 16 },
  { chinese: "哥林多前書", chapters: 16 },
  { chinese: "哥林多後書", chapters: 13 },
  { chinese: "加拉太書", chapters: 6 },
  { chinese: "以弗所書", chapters: 6 },
  { chinese: "腓立比書", chapters: 4 },
  { chinese: "歌羅西書", chapters: 4 },
  { chinese: "帖撒羅尼迦前書", chapters: 5 },
  { chinese: "帖撒羅尼迦後書", chapters: 3 },
  { chinese: "提摩太前書", chapters: 6 },
  { chinese: "提摩太後書", chapters: 4 },
  { chinese: "提多書", chapters: 3 },
  { chinese: "腓利門書", chapters: 1 },
  { chinese: "希伯來書", chapters: 13 },
  { chinese: "雅各書", chapters: 5 },
  { chinese: "彼得前書", chapters: 5 },
  { chinese: "彼得後書", chapters: 3 },
  { chinese: "約翰一書", chapters: 5 },
  { chinese: "約翰二書", chapters: 1 },
  { chinese: "約翰三書", chapters: 1 },
  { chinese: "猶大書", chapters: 1 },
  { chinese: "啟示錄", chapters: 22 }
];

async function loadBibleData() {
  return BIBLE_BOOKS.map((book) => ({
    ...book,
    verseCounts: Array(book.chapters).fill(2)
  }));
}

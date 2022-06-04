import { readLines } from "https://deno.land/std/io/mod.ts";

// https://babu-babu-baboo.hateblo.jp/entry/20091114/1258161477
// https://ja.wikipedia.org/wiki/ローマ字
// ヘボン式になるように改良 (ただし、を[wo] を除く)
function toRoman(str) {
  const roman = {
    "１": "1",
    "２": "2",
    "３": "3",
    "４": "4",
    "５": "5",
    "６": "6",
    "７": "7",
    "８": "8",
    "９": "9",
    "０": "0",
    "！": "!",
    "”": '"',
    "＃": "#",
    "＄": "$",
    "％": "%",
    "＆": "&",
    "’": "'",
    "（": "(",
    "）": ")",
    "＝": "=",
    "〜": "~",
    "｜": "|",
    "＠": "@",
    "‘": "`",
    "＋": "+",
    "＊": "*",
    "；": ";",
    "：": ":",
    "＜": "<",
    "＞": ">",
    "、": ",",
    "。": ".",
    "／": "/",
    "？": "?",
    "＿": "_",
    "・": "･",
    "「": "[",
    "」": "]",
    "｛": "{",
    "｝": "}",
    "￥": "\\",
    "＾": "^",
    "ふぁ": "fa",
    "ふぃ": "fi",
    "ふぇ": "fe",
    "ふぉ": "fo",
    "きゃ": "kya",
    "きゅ": "kyu",
    "きょ": "kyo",
    "しゃ": "sha",
    "しゅ": "shu",
    "しょ": "sho",
    "ちゃ": "tya",
    "ちゅ": "tyu",
    "ちょ": "tyo",
    "にゃ": "nya",
    "にゅ": "nyu",
    "にょ": "nyo",
    "ひゃ": "hya",
    "ひゅ": "hyu",
    "ひょ": "hyo",
    "みゃ": "mya",
    "みゅ": "myu",
    "みょ": "myo",
    "りゃ": "rya",
    "りゅ": "ryu",
    "りょ": "ryo",
    "ふゃ": "fya",
    "ふゅ": "fyu",
    "ふょ": "fyo",
    "ぴゃ": "pya",
    "ぴゅ": "pyu",
    "ぴょ": "pyo",
    "びゃ": "bya",
    "びゅ": "byu",
    "びょ": "byo",
    "ぢゃ": "dya",
    "ぢゅ": "dyu",
    "ぢょ": "dyo",
    "じゃ": "ja",
    "じゅ": "ju",
    "じょ": "jo",
    "ぎゃ": "gya",
    "ぎゅ": "gyu",
    "ぎょ": "gyo",
    "ゔぁ": "va",
    "ゔぃ": "vi",
    "ゔ": "vu",
    "ゔぇ": "ve",
    "ゔぉ": "vo",
    "ぱ": "pa",
    "ぴ": "pi",
    "ぷ": "pu",
    "ぺ": "pe",
    "ぽ": "po",
    "ば": "ba",
    "び": "bi",
    "ぶ": "bu",
    "べ": "be",
    "ぼ": "bo",
    "だ": "da",
    "ぢ": "di",
    "づ": "du",
    "で": "de",
    "ど": "do",
    "ざ": "za",
    "じ": "ji",
    "ず": "zu",
    "ぜ": "ze",
    "ぞ": "zo",
    "が": "ga",
    "ぎ": "gi",
    "ぐ": "gu",
    "げ": "ge",
    "ご": "go",
    "わ": "wa",
    "ゐ": "wi",
    // "う": "wu",
    "ゑ": "we",
    "を": "wo",
    "ら": "ra",
    "り": "ri",
    "る": "ru",
    "れ": "re",
    "ろ": "ro",
    "や": "ya",
    "ゆ": "yu",
    "よ": "yo",
    "ま": "ma",
    "み": "mi",
    "む": "mu",
    "め": "me",
    "も": "mo",
    "は": "ha",
    "ひ": "hi",
    "ふ": "fu",
    "へ": "he",
    "ほ": "ho",
    "な": "na",
    "に": "ni",
    "ぬ": "nu",
    "ね": "ne",
    "の": "no",
    "た": "ta",
    "ち": "chi",
    "つ": "tsu",
    "て": "te",
    "と": "to",
    "さ": "sa",
    "し": "shi",
    "す": "su",
    "せ": "se",
    "そ": "so",
    "か": "ka",
    "き": "ki",
    "く": "ku",
    "け": "ke",
    "こ": "ko",
    "あ": "a",
    "い": "i",
    "う": "u",
    "え": "e",
    "お": "o",
    "ぁ": "la",
    "ぃ": "li",
    "ぅ": "lu",
    "ぇ": "le",
    "ぉ": "lo",
    "ヶ": "ke",
    "ヵ": "ka",
    "ん": "nn",
    "ー": "-",
    "　": " ",
  };
  const regTu = /っ([bcdfghijklmnopqrstuvwyz])/gm;
  const regXtu = /っ/gm;

  let pnt = 0;
  const max = str.length;
  let s, r;
  let txt = "";

  while (pnt <= max) {
    r = roman[str.substring(pnt, pnt + 2)];
    if (r) {
      txt += r;
      pnt += 2;
    } else {
      s = str.substring(pnt, pnt + 1);
      r = roman[s];
      txt += r ? r : s;
      pnt += 1;
    }
  }
  txt = txt.replace(regTu, "$1$1");
  txt = txt.replace(regXtu, "xtu");
  return txt;
}

function kanaToHira(str) {
  return str.replace(/[\u30a1-\u30f6]/g, function (match) {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}

async function build() {
  const result = [];
  const fileReader = await Deno.open("emoji-ja.lst");
  for await (const line of readLines(fileReader)) {
    const [emoji, category, ja, jaStrict] = line.split(",");
    const roma = toRoman(kanaToHira(ja));
    const row = [emoji, category, roma, ja, jaStrict];
    result.push(row.join(","));
  }
  Deno.writeTextFileSync("src/data/ja.csv", result.join("\n"));
}

await build();

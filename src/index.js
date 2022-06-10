const remSize = parseInt(getComputedStyle(document.documentElement).fontSize);
const gamePanel = document.getElementById("gamePanel");
const playPanel = document.getElementById("playPanel");
const infoPanel = document.getElementById("infoPanel");
const countPanel = document.getElementById("countPanel");
const scorePanel = document.getElementById("scorePanel");
const aaOuter = document.getElementById("aaOuter");
const startButton = document.getElementById("startButton");
const romaNode = document.getElementById("roma");
const originalTextNode = document.getElementById("originalText");
const translatedTextNode = document.getElementById("translatedText");
const aa = document.getElementById("aa");
const gameTime = 60;
const tmpCanvas = document.createElement("canvas");
const mode = document.getElementById("mode");
const categories = [...document.getElementById("courseOption").options].map(
  (x) => x.value.toLowerCase(),
);
const problems = {};
const originalLang = document.documentElement.lang;
const ttsLang = getTTSLang();
let typeTimer;
// https://dova-s.jp/bgm/play16563.html
const bgm = new Audio("/emoji-typing/mp3/bgm.mp3");
bgm.volume = 0.4;
bgm.loop = true;
let typeIndex = 0;
let errorCount = 0;
let normalCount = 0;
let solveCount = 0;
let englishVoices = [];
let guide = true;
let keyboardAudio, correctAudio, incorrectAudio, endAudio;
loadAudios();
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
const layout104 = {
  "default": [
    "{esc} ` 1 2 3 4 5 6 7 8 9 0 -",
    "{tab} q w e r t y u i o p [ ]",
    "{lock} a s d f g h j k l ;",
    "{shift} z x c v b n m , .",
    "🌏 {altLeft} {space} {altRight}",
  ],
  "shift": [
    "{esc} ~ ! @ # $ % ^ & * ( ) _",
    "{tab} Q W E R T Y U I O P { }",
    "{lock} A S D F G H J K L :",
    "{shift} Z X C V B N M < >",
    "🌏 {altLeft} {space} {altRight}",
  ],
};
const layout109 = {
  "default": [
    "{esc} 1 2 3 4 5 6 7 8 9 0 -",
    "{tab} q w e r t y u i o p",
    "{lock} a s d f g h j k l ;",
    "{shift} z x c v b n m , .",
    "🌏 無変換 {space} 変換",
  ],
  "shift": [
    "{esc} ! \" # $ % & ' ( ) =",
    "{tab} Q W E R T Y U I O P",
    "{lock} A S D F G H J K L +",
    "{shift} Z X C V B N M < >",
    "🌏 無変換 {space} 変換",
  ],
};
const keyboardDisplay = {
  "{esc}": "Esc",
  "{tab}": "Tab",
  "{lock}": "Caps",
  "{shift}": "Shift",
  "{space}": " ",
  "{altLeft}": "Alt",
  "{altRight}": "Alt",
  "🌏": (originalLang == "ja") ? "🇯🇵" : "🇺🇸",
};
const simpleKeyboard = new SimpleKeyboard.default({
  layout: (originalLang == "ja") ? layout109 : layout104,
  display: keyboardDisplay,
  onInit: () => {
    document.getElementById("keyboard").classList.add("d-none");
  },
  onKeyPress: (input) => {
    switch (input) {
      case "{esc}":
        return typeEventKey("Escape");
      case "{space}":
        return typeEventKey(" ");
      case "無変換":
      case "{altLeft}":
        return typeEventKey("NonConvert");
      case "変換":
      case "{altRight}":
        return typeEventKey("Convert");
      case "🌏": {
        if (simpleKeyboard.options.layout == layout109) {
          keyboardDisplay["🌏"] = "🇺🇸";
          simpleKeyboard.setOptions({
            layout: layout104,
            display: keyboardDisplay,
          });
        } else {
          keyboardDisplay["🌏"] = "🇯🇵";
          simpleKeyboard.setOptions({
            layout: layout109,
            display: keyboardDisplay,
          });
        }
        break;
      }
      case "{shift}":
      case "{lock}": {
        const shiftToggle = (simpleKeyboard.options.layoutName == "default")
          ? "shift"
          : "default";
        simpleKeyboard.setOptions({ layoutName: shiftToggle });
        break;
      }
      default:
        return typeEventKey(input);
    }
  },
});
loadConfig();

function loadConfig() {
  if (localStorage.getItem("darkMode") == 1) {
    document.documentElement.dataset.theme = "dark";
  }
  if (localStorage.getItem("bgm") != 1) {
    document.getElementById("bgmOn").classList.add("d-none");
    document.getElementById("bgmOff").classList.remove("d-none");
  }
  if (originalLang == "ja") {
    if (localStorage.getItem("furigana") == 1) {
      const obj = document.getElementById("addFurigana");
      addFurigana(obj);
      obj.setAttribute("data-done", true);
    }
  }
}

function toggleBGM() {
  if (localStorage.getItem("bgm") == 1) {
    document.getElementById("bgmOn").classList.add("d-none");
    document.getElementById("bgmOff").classList.remove("d-none");
    localStorage.setItem("bgm", 0);
    bgm.pause();
  } else {
    document.getElementById("bgmOn").classList.remove("d-none");
    document.getElementById("bgmOff").classList.add("d-none");
    localStorage.setItem("bgm", 1);
    bgm.play();
  }
}

function toggleKeyboard() {
  const virtualKeyboardOn = document.getElementById("virtualKeyboardOn");
  const virtualKeyboardOff = document.getElementById("virtualKeyboardOff");
  if (virtualKeyboardOn.classList.contains("d-none")) {
    virtualKeyboardOn.classList.remove("d-none");
    virtualKeyboardOff.classList.add("d-none");
    document.getElementById("keyboard").classList.remove("d-none");
    resizeFontSize(aa);
  } else {
    virtualKeyboardOn.classList.add("d-none");
    virtualKeyboardOff.classList.remove("d-none");
    document.getElementById("keyboard").classList.add("d-none");
    document.getElementById("guideSwitch").checked = false;
    guide = false;
    resizeFontSize(aa);
  }
}

function toggleGuide() {
  if (this.checked) {
    guide = true;
  } else {
    guide = false;
  }
}

function toggleDarkMode() {
  if (localStorage.getItem("darkMode") == 1) {
    localStorage.setItem("darkMode", 0);
    delete document.documentElement.dataset.theme;
  } else {
    localStorage.setItem("darkMode", 1);
    document.documentElement.dataset.theme = "dark";
  }
}

function addFurigana() {
  if (originalLang != "ja") return;
  const obj = document.getElementById("addFurigana");
  if (obj.getAttribute("data-done")) {
    localStorage.setItem("furigana", 0);
    location.reload();
  } else {
    import("https://marmooo.github.io/yomico/yomico.min.js").then((module) => {
      module.yomico("/emoji-typing/ja/index.yomi");
    });
    localStorage.setItem("furigana", 1);
    obj.setAttribute("data-done", true);
  }
}

function changeLang() {
  const langObj = document.getElementById("lang");
  const lang = langObj.options[langObj.selectedIndex].value;
  location.href = `/emoji-typing/${lang}/`;
}

function getTTSLang() {
  switch (originalLang) {
    case "en":
      return "en-US";
    case "ja":
      return "ja-JP";
  }
}

function playAudio(audioBuffer, volume) {
  const audioSource = audioContext.createBufferSource();
  audioSource.buffer = audioBuffer;
  if (volume) {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = volume;
    gainNode.connect(audioContext.destination);
    audioSource.connect(gainNode);
    audioSource.start();
  } else {
    audioSource.connect(audioContext.destination);
    audioSource.start();
  }
}

function unlockAudio() {
  audioContext.resume();
}

function loadAudio(url) {
  return fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => {
      return new Promise((resolve, reject) => {
        audioContext.decodeAudioData(arrayBuffer, (audioBuffer) => {
          resolve(audioBuffer);
        }, (err) => {
          reject(err);
        });
      });
    });
}

function loadAudios() {
  promises = [
    loadAudio("/emoji-typing/mp3/keyboard.mp3"),
    loadAudio("/emoji-typing/mp3/correct.mp3"),
    loadAudio("/emoji-typing/mp3/cat.mp3"),
    loadAudio("/emoji-typing/mp3/end.mp3"),
  ];
  Promise.all(promises).then((audioBuffers) => {
    keyboardAudio = audioBuffers[0];
    correctAudio = audioBuffers[1];
    incorrectAudio = audioBuffers[2];
    endAudio = audioBuffers[3];
  });
}

function loadVoices() {
  // https://stackoverflow.com/questions/21513706/
  const allVoicesObtained = new Promise((resolve) => {
    let voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      let supported = false;
      speechSynthesis.addEventListener("voiceschanged", () => {
        supported = true;
        voices = speechSynthesis.getVoices();
        resolve(voices);
      });
      setTimeout(() => {
        if (!supported) {
          document.getElementById("noTTS").classList.remove("d-none");
        }
      }, 1000);
    }
  });
  allVoicesObtained.then((voices) => {
    englishVoices = voices.filter((voice) => voice.lang == ttsLang);
  });
}
loadVoices();

function loopVoice(text, n) {
  speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.voice = englishVoices[Math.floor(Math.random() * englishVoices.length)];
  msg.lang = ttsLang;
  for (let i = 0; i < n; i++) {
    speechSynthesis.speak(msg);
  }
}

function fixTypeStyle(currNode, word) {
  removeGuide(currNode);
  currNode.textContent = word;
  typeNormal(currNode);
}

function appendWord(currNode, word) {
  removeGuide(currNode);
  const span = document.createElement("span");
  span.textContent = word;
  currNode.parentNode.insertBefore(span, currNode.nextSibling);
}

// http://typingx0.net/key_l.html
function checkTypeStyle(currNode, word, key, romaNode) {
  const ie = ["i", "e"];
  const auo = ["a", "u", "o"];
  const aueo = ["a", "u", "e", "o"];
  const aiueo = ["a", "i", "u", "e", "o"];
  const nodes = romaNode.childNodes;
  const nextNode = nodes[typeIndex + 1];
  let n;
  if (nextNode) { // 最後の文字を tu --> tsu に変換しようとした時 (nextNode = null)
    n = nextNode.textContent;
  }
  let p;
  if (typeIndex != 0) {
    p = nodes[typeIndex - 1].textContent;
  }
  let nn;
  if (nodes[typeIndex + 2]) {
    nn = nodes[typeIndex + 2].textContent;
  }
  if (key == "k" && word == "c" && auo.includes(n)) { // ca, cu, co --< ka, ku, ko
    fixTypeStyle(currNode, key);
  } else if (key == "c" && word == "k" && auo.includes(n)) { // ka, ku, ko --< ca, cu, co
    fixTypeStyle(currNode, key);
  } else if (key == "h" && p == "s" && word == "i") { // si --> shi
    fixTypeStyle(currNode, key);
    appendWord(currNode, "i");
  } else if (key == "i" && p == "s" && word == "h" && n == "i") { // shi --> si
    fixTypeStyle(currNode, key);
    if (n) nextNode.remove();
  } else if (key == "c" && word == "s" && ie.includes(n)) { // si, se --> ci, ce
    fixTypeStyle(currNode, key);
  } else if (key == "s" && word == "c" && ie.includes(n)) { // ci, ce --> si, se
    fixTypeStyle(currNode, key);
  } else if (key == "j" && word == "z" && n == "i") { // zi --> ji
    fixTypeStyle(currNode, key);
  } else if (key == "z" && word == "j" && n == "i") { // ji --> zi
    fixTypeStyle(currNode, key);
  } else if (key == "c" && word == "t" && n == "i") { // ti --> chi
    fixTypeStyle(currNode, key);
    appendWord(currNode, "h");
  } else if (key == "t" && word == "c" && n == "h" && nn == "i") { // chi --> ti
    fixTypeStyle(currNode, key);
    if (n) nextNode.remove();
  } else if (key == "s" && p == "t" && word == "u") { // tu --> tsu
    fixTypeStyle(currNode, key);
    appendWord(currNode, "u");
  } else if (key == "u" && p == "t" && word == "s" && n == "u") { // tsu --> tu
    fixTypeStyle(currNode, key);
    if (n) nextNode.remove();
  } else if (key == "f" && word == "h" && n == "u") { // hu --> fu
    fixTypeStyle(currNode, key);
  } else if (key == "h" && word == "f" && n == "u") { // fu --> hu
    fixTypeStyle(currNode, key);
  } else if (key == "x" && word == "n" && n == "n") { // nn --> xn
    fixTypeStyle(currNode, key);
  } else if (key == "n" && word == "x" && n == "n") { // xn --> nn
    fixTypeStyle(currNode, key);
  } else if (key == "l" && word == "x" && aiueo.includes(n)) { // xa, xi, xu, xe, xo --> la, li, lu, le, lo
    fixTypeStyle(currNode, key);
  } else if (key == "x" && word == "l" && aiueo.includes(n)) { // la, li, lu, le, lo --> xa, xi, xu, xe, xo
    fixTypeStyle(currNode, key);
  } else if (key == "x" && word == "l" && n == "y" && auo.includes(n)) { // TODO: lyi, lye
    // lya, lyu, lyo --> xya, xyu, xyo
    fixTypeStyle(currNode, key);
  } else if (key == "h" && p == "w" && ie.includes(word)) { // wi, we --> whi, whe
    fixTypeStyle(currNode, key);
    appendWord(currNode, word);
  } else if (ie.includes(key) && p == "w" && word == "h" && ie.includes(n)) { // whi, whe --> wi, we
    fixTypeStyle(currNode, key);
    if (n) nextNode.remove();
  } else if (key == "h" && p == "s" && word == "y" && aueo.includes(n)) {
    // sya, syu, sye, syo --> sha, shu, she, sho
    fixTypeStyle(currNode, key);
  } else if (key == "y" && p == "s" && word == "h" && aueo.includes(n)) {
    // sha, shu, she, sho --> sya, syu, sye, syo
    fixTypeStyle(currNode, key);
  } else if (key == "j" && word == "z" && n == "y" && auo.includes(nn)) { // zya, zyu, zyo --> ja, ju, jo
    fixTypeStyle(currNode, key);
    if (n) nextNode.remove();
  } else if (key == "z" && word == "j" && auo.includes(n)) { // ja, ju, jo --> zya, zyu, zyo
    fixTypeStyle(currNode, key);
    appendWord(currNode, "y");
  } else if (key == "j" && word == "z" && n == "y") { // zya, zyi, zyu, zye, zyo --> jya, jyi, jyu, jye, jyo
    fixTypeStyle(currNode, key);
  } else if (auo.includes(key) && p == "j" && word == "y" && auo.includes(n)) {
    // jya, jyu, jyo --> ja, ju, jo
    fixTypeStyle(currNode, key);
    if (n) nextNode.remove();
  } else if (key == "y" && p == "j" && auo.includes(word)) { // ja, ju, jo --> jya, jyu, jyo
    fixTypeStyle(currNode, key);
    appendWord(currNode, n);
  } else if (key == "z" && word == "j" && n == "y") { // jya, jyi, jyu, jye, jyo --> zya, zyi, zyu, zye, zyo
    fixTypeStyle(currNode, key);
  } else if (key == "t" && word == "c" && n == "y") { // cya, cyi, cyu, cye, cyo --> tya, tyi, tyu, tye, tyo
    fixTypeStyle(currNode, key);
  } else if (key == "c" && word == "t" && n == "y") {
    // tya, tyi, tyu, tye, tyo --> cya, cyi, cyu, cye, cyo
    // tya, tyu, tye, tyo --> cha, chu, che, cho (chi の問題があるので cyi を採用)
    fixTypeStyle(currNode, key);
  } else if (key == "t" && word == "c" && n == "h" && aueo.includes(n)) {
    // cha, chu, che, cho --> tya, tyu, tye, tyo
    fixTypeStyle(currNode, key);
    nextNode.textContent = "y";
  } else if (key == "h" && p == "c" && word == "y" && aueo.includes(n)) {
    // cya, cyu, cye, cyo --> cha, chu, che, cho
    fixTypeStyle(currNode, key);
    nextNode.textContent = n;
  } else if (key == "y" && p == "c" && word == "h" && aueo.includes(n)) {
    // cha, chu, che, cho --> cya, cyu, cye, cyo
    fixTypeStyle(currNode, key);
    nextNode.textContent = n;
  } else {
    return false;
  }
  return true;
}

function typeNormal(currNode) {
  currNode.style.visibility = "visible";
  playAudio(keyboardAudio);
  currNode.style.color = "silver";
  typeIndex += 1;
  normalCount += 1;
}

function underlineSpace(currNode) {
  if (currNode.textContent == " ") {
    currNode.style.removeProperty("text-decoration");
  }
  const nextNode = currNode.nextElementSibling;
  if (nextNode && nextNode.textContent == " ") {
    nextNode.style.textDecoration = "underline";
  }
}

function nextProblem() {
  playAudio(correctAudio);
  typeIndex = 0;
  solveCount += 1;
  typable();
}

function removeGuide(currNode) {
  const prevNode = currNode.previousSiblingElement;
  if (prevNode) {
    const key = prevNode.textContent;
    const button = simpleKeyboard.getButtonElement(key);
    button.classList.remove("bg-info");
  }
  let key = currNode.textContent;
  if (key == " ") key = "{space}";
  const button = simpleKeyboard.getButtonElement(key);
  if (button) {
    button.classList.remove("bg-info");
  }
}

function showGuide(currNode) {
  if (guide) {
    const key = currNode.textContent;
    const button = simpleKeyboard.getButtonElement(key);
    if (button) {
      button.classList.add("bg-info");
    }
  }
}

function typeEvent(event) {
  switch (event.code) {
    case "AltLeft":
      return typeEventKey("NonConvert");
    case "AltRight":
      return typeEventKey("Convert");
    case "Space":
      event.preventDefault();
      // falls through
    default:
      return typeEventKey(event.key);
  }
}

function typeEventKey(key) {
  const currNode = romaNode.childNodes[typeIndex];
  if (/^[^0-9]$/.test(key)) {
    if (key == currNode.textContent) {
      typeNormal(currNode);
      removeGuide(currNode);
      underlineSpace(currNode);
    } else {
      const state = checkTypeStyle(
        currNode,
        currNode.textContent,
        key,
        romaNode,
      );
      if (!state) {
        playAudio(incorrectAudio, 0.3);
        errorCount += 1;
      }
    }
    if (typeIndex == romaNode.childNodes.length) {
      nextProblem();
    } else {
      showGuide(romaNode.childNodes[typeIndex]);
    }
  } else {
    switch (key) {
      case "NonConvert": {
        [...romaNode.children].forEach((span) => {
          span.style.visibility = "visible";
        });
        downTime(5);
        break;
      }
      case "Convert": {
        const text = originalTextNode.textContent;
        loopVoice(text.toLowerCase(), 1);
        break;
      }
      case "Escape":
        replay();
        break;
    }
  }
}

function resizeFontSize(node) {
  // https://stackoverflow.com/questions/118241/
  function getTextWidth(text, font) {
    // re-use canvas object for better performance
    // const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
    const context = tmpCanvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return metrics.width;
  }
  function getTextRect(text, fontSize, font, lineHeight) {
    const lines = text.split("\n");
    const fontConfig = fontSize + "px " + font;
    let maxWidth = 0;
    for (let i = 0; i < lines.length; i++) {
      const width = getTextWidth(lines[i], fontConfig);
      if (maxWidth < width) {
        maxWidth = width;
      }
    }
    return [maxWidth, fontSize * lines.length * lineHeight];
  }
  function getPaddingRect(style) {
    const width = parseFloat(style.paddingLeft) +
      parseFloat(style.paddingRight);
    const height = parseFloat(style.paddingTop) +
      parseFloat(style.paddingBottom);
    return [width, height];
  }
  const style = getComputedStyle(node);
  const font = style.fontFamily;
  const fontSize = parseFloat(style.fontSize);
  const lineHeight = parseFloat(style.lineHeight) / fontSize;
  const nodeHeight = aaOuter.offsetHeight;
  const nodeWidth = infoPanel.clientWidth;
  const nodeRect = [nodeWidth, nodeHeight];
  const textRect = getTextRect(node.textContent, fontSize, font, lineHeight);
  const paddingRect = getPaddingRect(style);

  // https://stackoverflow.com/questions/46653569/
  // Safariで正確な算出ができないので誤差ぶんだけ縮小化 (10%)
  const rowFontSize = fontSize * (nodeRect[0] - paddingRect[0]) / textRect[0] *
    0.90;
  const colFontSize = fontSize * (nodeRect[1] - paddingRect[1]) / textRect[1] *
    0.90;
  if (colFontSize < rowFontSize) {
    if (colFontSize < remSize) {
      node.style.fontSize = remSize + "px";
    } else {
      node.style.fontSize = colFontSize + "px";
    }
  } else {
    if (rowFontSize < remSize) {
      node.style.fontSize = remSize + "px";
    } else {
      node.style.fontSize = rowFontSize + "px";
    }
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function typable() {
  const course = document.getElementById("courseOption");
  const category = categories[course.selectedIndex];
  const p = problems[category];
  const problem = p[getRandomInt(0, p.length)];
  const emojis = problem[0];
  aa.textContent = emojis[getRandomInt(0, emojis.length)];
  const roma = problem[1];
  const japanese = problem[2];
  const japaneseStrict = problem[3];
  romaNode.textContent = roma;
  originalTextNode.textContent = japanese;
  translatedTextNode.textContent = japaneseStrict;
  if (mode.textContent == "EASY") {
    loopVoice(japaneseStrict, 1);
  }
  while (romaNode.firstChild) {
    romaNode.removeChild(romaNode.firstChild);
  }
  for (let i = 0; i < roma.length; i++) {
    const span = document.createElement("span");
    if (mode.textContent != "EASY") {
      span.style.visibility = "hidden";
    }
    span.textContent = roma[i];
    romaNode.appendChild(span);
  }
  resizeFontSize(aa);
  showGuide(romaNode.childNodes[0]);
}

function countdown() {
  changeUIEmoji();
  typeIndex = normalCount = errorCount = solveCount = 0;
  document.getElementById("guideSwitch").disabled = true;
  document.getElementById("virtualKeyboard").disabled = true;
  gamePanel.classList.add("d-none");
  countPanel.classList.remove("d-none");
  counter.textContent = 3;
  const timer = setInterval(() => {
    const counter = document.getElementById("counter");
    const colors = ["skyblue", "greenyellow", "violet", "tomato"];
    if (parseInt(counter.textContent) > 1) {
      const t = parseInt(counter.textContent) - 1;
      counter.style.backgroundColor = colors[t];
      counter.textContent = t;
    } else {
      clearInterval(timer);
      document.getElementById("guideSwitch").disabled = false;
      document.getElementById("virtualKeyboard").disabled = false;
      gamePanel.classList.remove("d-none");
      countPanel.classList.add("d-none");
      infoPanel.classList.remove("d-none");
      playPanel.classList.remove("d-none");
      aaOuter.classList.remove("d-none");
      scorePanel.classList.add("d-none");
      resizeFontSize(aa);
      typable();
      startTypeTimer();
      if (localStorage.getItem("bgm") == 1) {
        bgm.play();
      }
      document.addEventListener("keydown", typeEvent);
      startButton.disabled = false;
    }
  }, 1000);
}

function replay() {
  clearInterval(typeTimer);
  removeGuide(romaNode.childNodes[typeIndex]);
  document.removeEventListener("keydown", typeEvent);
  document.getElementById("time").textContent = gameTime;
  countdown();
  typeIndex = normalCount = errorCount = solveCount = 0;
  countPanel.classList.remove("d-none");
  scorePanel.classList.add("d-none");
}

function startKeyEvent(event) {
  if (event.key == " ") {
    event.preventDefault(); // ScrollLock
    document.removeEventListener("keydown", startKeyEvent);
    replay();
  }
}

function startTypeTimer() {
  const timeNode = document.getElementById("time");
  typeTimer = setInterval(() => {
    const t = parseInt(timeNode.textContent);
    if (t > 0) {
      timeNode.textContent = t - 1;
    } else {
      clearInterval(typeTimer);
      bgm.pause();
      playAudio(endAudio);
      scoring();
    }
  }, 1000);
}

function downTime(n) {
  const timeNode = document.getElementById("time");
  const t = parseInt(timeNode.textContent);
  const downedTime = t - n;
  if (downedTime < 0) {
    timeNode.textContent = 0;
  } else {
    timeNode.textContent = downedTime;
  }
}

function scoring() {
  infoPanel.classList.remove("d-none");
  playPanel.classList.add("d-none");
  aaOuter.classList.add("d-none");
  countPanel.classList.add("d-none");
  scorePanel.classList.remove("d-none");
  document.removeEventListener("keydown", typeEvent);
  let time = parseInt(document.getElementById("time").textContent);
  if (time < gameTime) {
    time = gameTime - time;
  }
  const typeSpeed = (normalCount / time).toFixed(2);
  document.getElementById("totalType").textContent = normalCount + errorCount;
  document.getElementById("typeSpeed").textContent = typeSpeed;
  document.getElementById("errorType").textContent = errorCount;
  document.addEventListener("keydown", startKeyEvent);
}

function changeMode() {
  if (this.textContent == "EASY") {
    this.textContent = "HARD";
  } else {
    this.textContent = "EASY";
  }
}

function selectRandomEmoji() {
  const category = categories[getRandomInt(0, categories.length)];
  const p = problems[category];
  const problem = p[getRandomInt(0, p.length)];
  const emojis = problem[0];
  const emoji = emojis[getRandomInt(0, emojis.length)];
  const text = problem[1];
  return [emoji, text];
}

function changeUIEmoji() {
  document.getElementById("counter-emoji").textContent = selectRandomEmoji()[0];
  document.getElementById("score-emoji").textContent = selectRandomEmoji()[0];
}

function initProblems() {
  fetch(`/emoji-typing/data/${originalLang}.csv`)
    .then((response) => response.text())
    .then((tsv) => {
      let prevEn;
      tsv.trimEnd().split("\n").forEach((line) => {
        const [emoji, category, en, ja, jaStrict] = line.split(",");
        if (category in problems === false) {
          problems[category] = [];
        }
        if (prevEn == en) {
          const p = problems[category];
          const last = p[p.length - 1];
          last[0].push(emoji);
        } else {
          if (originalLang == "en") {
            problems[category].push([[emoji], en, en, en]);
          } else {
            problems[category].push([[emoji], en, ja, jaStrict]);
          }
        }
        prevEn = en;
      });
    });
}

function setTranslation() {
  const config = {
    attributeFilter: ["lang"],
    attributes: true,
  };
  new MutationObserver(() => {
    if (originalLang == "en") {
      originalTextNode.classList.add("d-none");
    } else {
      originalTextNode.classList.remove("d-none");
    }
    const lang = document.documentElement.lang;
    if (lang == originalLang) {
      translatedTextNode.classList.add("d-none");
    } else {
      translatedTextNode.classList.remove("d-none");
    }
  }).observe(document.documentElement, config);
}

resizeFontSize(aa);
initProblems();
setTranslation();

startButton.onclick = replay;
document.getElementById("toggleDarkMode").onclick = toggleDarkMode;
const furiganaButton = document.getElementById("addFurigana");
if (furiganaButton) furiganaButton.onclick = addFurigana;
document.getElementById("toggleBGM").onclick = toggleBGM;
document.getElementById("virtualKeyboard").onclick = toggleKeyboard;
window.addEventListener("resize", () => {
  resizeFontSize(aa);
});
document.getElementById("mode").onclick = changeMode;
document.getElementById("guideSwitch").onchange = toggleGuide;
document.getElementById("lang").onchange = changeLang;
document.addEventListener("keydown", startKeyEvent);
document.addEventListener("click", unlockAudio, {
  once: true,
  useCapture: true,
});

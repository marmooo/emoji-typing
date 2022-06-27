const remSize=parseInt(getComputedStyle(document.documentElement).fontSize),gamePanel=document.getElementById("gamePanel"),playPanel=document.getElementById("playPanel"),infoPanel=document.getElementById("infoPanel"),countPanel=document.getElementById("countPanel"),scorePanel=document.getElementById("scorePanel"),aaOuter=document.getElementById("aaOuter"),startButton=document.getElementById("startButton"),romaNode=document.getElementById("roma"),originalTextNode=document.getElementById("originalText"),translatedTextNode=document.getElementById("translatedText"),aa=document.getElementById("aa"),gameTime=60,tmpCanvas=document.createElement("canvas"),mode=document.getElementById("mode"),categories=[...document.getElementById("courseOption").options].map(a=>a.value.toLowerCase()),problems={},originalLang=document.documentElement.lang,ttsLang=getTTSLang();let playing,typeTimer;const bgm=new Audio("/emoji-typing/mp3/bgm.mp3");bgm.volume=.4,bgm.loop=!0;let typeIndex=0,errorCount=0,normalCount=0,solveCount=0,englishVoices=[],guide=!0,keyboardAudio,correctAudio,incorrectAudio,endAudio;loadAudios();const AudioContext=window.AudioContext||window.webkitAudioContext,audioContext=new AudioContext,layout104={default:["{esc} ` 1 2 3 4 5 6 7 8 9 0 -","{tab} q w e r t y u i o p [ ]","{lock} a s d f g h j k l ;","{shift} z x c v b n m , .","🌏 {altLeft} {space} {altRight}"],shift:["{esc} ~ ! @ # $ % ^ & * ( ) _","{tab} Q W E R T Y U I O P { }","{lock} A S D F G H J K L :","{shift} Z X C V B N M < >","🌏 {altLeft} {space} {altRight}"]},layout109={default:["{esc} 1 2 3 4 5 6 7 8 9 0 -","{tab} q w e r t y u i o p","{lock} a s d f g h j k l ;","{shift} z x c v b n m , .","🌏 無変換 {space} 変換"],shift:["{esc} ! \" # $ % & ' ( ) =","{tab} Q W E R T Y U I O P","{lock} A S D F G H J K L +","{shift} Z X C V B N M < >","🌏 無変換 {space} 変換"]},keyboardDisplay={"{esc}":"Esc","{tab}":"Tab","{lock}":"Caps","{shift}":"Shift","{space}":" ","{altLeft}":"Alt","{altRight}":"Alt","🌏":originalLang=="ja"?"🇯🇵":"🇺🇸"},simpleKeyboard=new SimpleKeyboard.default({layout:originalLang=="ja"?layout109:layout104,display:keyboardDisplay,onInit:()=>{document.getElementById("keyboard").classList.add("d-none")},onKeyPress:a=>{switch(a){case"{esc}":return typeEventKey("Escape");case"{space}":return typeEventKey(" ");case"無変換":case"{altLeft}":return typeEventKey("NonConvert");case"変換":case"{altRight}":return typeEventKey("Convert");case"🌏":{simpleKeyboard.options.layout==layout109?(keyboardDisplay["🌏"]="🇺🇸",simpleKeyboard.setOptions({layout:layout104,display:keyboardDisplay})):(keyboardDisplay["🌏"]="🇯🇵",simpleKeyboard.setOptions({layout:layout109,display:keyboardDisplay}));break}case"{shift}":case"{lock}":{const a=simpleKeyboard.options.layoutName=="default"?"shift":"default";simpleKeyboard.setOptions({layoutName:a});break}default:return typeEventKey(a)}}});loadConfig();function loadConfig(){if(localStorage.getItem("darkMode")==1&&(document.documentElement.dataset.theme="dark"),localStorage.getItem("bgm")!=1&&(document.getElementById("bgmOn").classList.add("d-none"),document.getElementById("bgmOff").classList.remove("d-none")),originalLang=="ja")if(localStorage.getItem("furigana")==1){const a=document.getElementById("addFurigana");addFurigana(a),a.setAttribute("data-done",!0)}}function toggleBGM(){localStorage.getItem("bgm")==1?(document.getElementById("bgmOn").classList.add("d-none"),document.getElementById("bgmOff").classList.remove("d-none"),localStorage.setItem("bgm",0),bgm.pause()):(document.getElementById("bgmOn").classList.remove("d-none"),document.getElementById("bgmOff").classList.add("d-none"),localStorage.setItem("bgm",1),bgm.play())}function toggleKeyboard(){const a=document.getElementById("virtualKeyboardOn"),b=document.getElementById("virtualKeyboardOff");a.classList.contains("d-none")?(a.classList.remove("d-none"),b.classList.add("d-none"),document.getElementById("keyboard").classList.remove("d-none"),resizeFontSize(aa)):(a.classList.add("d-none"),b.classList.remove("d-none"),document.getElementById("keyboard").classList.add("d-none"),document.getElementById("guideSwitch").checked=!1,guide=!1,resizeFontSize(aa))}function toggleGuide(){this.checked?guide=!0:guide=!1}function toggleDarkMode(){localStorage.getItem("darkMode")==1?(localStorage.setItem("darkMode",0),delete document.documentElement.dataset.theme):(localStorage.setItem("darkMode",1),document.documentElement.dataset.theme="dark")}function addFurigana(){if(originalLang!="ja")return;const a=document.getElementById("addFurigana");a.getAttribute("data-done")?(localStorage.setItem("furigana",0),location.reload()):(import("https://marmooo.github.io/yomico/yomico.min.js").then(a=>{a.yomico("/emoji-typing/ja/index.yomi")}),localStorage.setItem("furigana",1),a.setAttribute("data-done",!0))}function changeLang(){const a=document.getElementById("lang"),b=a.options[a.selectedIndex].value;location.href=`/emoji-typing/${b}/`}function getTTSLang(){switch(originalLang){case"en":return"en-US";case"ja":return"ja-JP"}}function playAudio(c,b){const a=audioContext.createBufferSource();if(a.buffer=c,b){const c=audioContext.createGain();c.gain.value=b,c.connect(audioContext.destination),a.connect(c),a.start()}else a.connect(audioContext.destination),a.start()}function unlockAudio(){audioContext.resume()}function loadAudio(a){return fetch(a).then(a=>a.arrayBuffer()).then(a=>new Promise((b,c)=>{audioContext.decodeAudioData(a,a=>{b(a)},a=>{c(a)})}))}function loadAudios(){promises=[loadAudio("/emoji-typing/mp3/keyboard.mp3"),loadAudio("/emoji-typing/mp3/correct.mp3"),loadAudio("/emoji-typing/mp3/cat.mp3"),loadAudio("/emoji-typing/mp3/end.mp3")],Promise.all(promises).then(a=>{keyboardAudio=a[0],correctAudio=a[1],incorrectAudio=a[2],endAudio=a[3]})}function loadVoices(){const a=new Promise(b=>{let a=speechSynthesis.getVoices();if(a.length!==0)b(a);else{let c=!1;speechSynthesis.addEventListener("voiceschanged",()=>{c=!0,a=speechSynthesis.getVoices(),b(a)}),setTimeout(()=>{c||document.getElementById("noTTS").classList.remove("d-none")},1e3)}});a.then(a=>{englishVoices=a.filter(a=>a.lang==ttsLang)})}loadVoices();function loopVoice(b,c){speechSynthesis.cancel();const a=new SpeechSynthesisUtterance(b);a.voice=englishVoices[Math.floor(Math.random()*englishVoices.length)],a.lang=ttsLang;for(let b=0;b<c;b++)speechSynthesis.speak(a)}function fixTypeStyle(a,b){removeGuide(a),a.textContent=b,typeNormal(a)}function appendWord(a,c){removeGuide(a);const b=document.createElement("span");b.textContent=c,a.parentNode.insertBefore(b,a.nextSibling)}function checkTypeStyle(c,d,a,m){const i=["i","e"],g=["a","u","o"],h=["a","u","e","o"],l=["a","i","u","e","o"],j=m.childNodes,f=j[typeIndex+1];let b;f&&(b=f.textContent);let e;typeIndex!=0&&(e=j[typeIndex-1].textContent);let k;if(j[typeIndex+2]&&(k=j[typeIndex+2].textContent),a=="k"&&d=="c"&&g.includes(b))fixTypeStyle(c,a);else if(a=="c"&&d=="k"&&g.includes(b))fixTypeStyle(c,a);else if(a=="h"&&e=="s"&&d=="i")fixTypeStyle(c,a),appendWord(c,"i");else if(a=="i"&&e=="s"&&d=="h"&&b=="i")fixTypeStyle(c,a),b&&f.remove();else if(a=="c"&&d=="s"&&i.includes(b))fixTypeStyle(c,a);else if(a=="s"&&d=="c"&&i.includes(b))fixTypeStyle(c,a);else if(a=="j"&&d=="z"&&b=="i")fixTypeStyle(c,a);else if(a=="z"&&d=="j"&&b=="i")fixTypeStyle(c,a);else if(a=="c"&&d=="t"&&b=="i")fixTypeStyle(c,a),appendWord(c,"h");else if(a=="t"&&d=="c"&&b=="h"&&k=="i")fixTypeStyle(c,a),b&&f.remove();else if(a=="s"&&e=="t"&&d=="u")fixTypeStyle(c,a),appendWord(c,"u");else if(a=="u"&&e=="t"&&d=="s"&&b=="u")fixTypeStyle(c,a),b&&f.remove();else if(a=="f"&&d=="h"&&b=="u")fixTypeStyle(c,a);else if(a=="h"&&d=="f"&&b=="u")fixTypeStyle(c,a);else if(a=="x"&&d=="n"&&b=="n")fixTypeStyle(c,a);else if(a=="n"&&d=="x"&&b=="n")fixTypeStyle(c,a);else if(a=="l"&&d=="x"&&l.includes(b))fixTypeStyle(c,a);else if(a=="x"&&d=="l"&&l.includes(b))fixTypeStyle(c,a);else if(a=="x"&&d=="l"&&b=="y"&&g.includes(b))fixTypeStyle(c,a);else if(a=="h"&&e=="w"&&i.includes(d))fixTypeStyle(c,a),appendWord(c,d);else if(i.includes(a)&&e=="w"&&d=="h"&&i.includes(b))fixTypeStyle(c,a),b&&f.remove();else if(a=="h"&&e=="s"&&d=="y"&&h.includes(b))fixTypeStyle(c,a);else if(a=="y"&&e=="s"&&d=="h"&&h.includes(b))fixTypeStyle(c,a);else if(a=="j"&&d=="z"&&b=="y"&&g.includes(k))fixTypeStyle(c,a),b&&f.remove();else if(a=="z"&&d=="j"&&g.includes(b))fixTypeStyle(c,a),appendWord(c,"y");else if(a=="j"&&d=="z"&&b=="y")fixTypeStyle(c,a);else if(g.includes(a)&&e=="j"&&d=="y"&&g.includes(b))fixTypeStyle(c,a),b&&f.remove();else if(a=="y"&&e=="j"&&g.includes(d))fixTypeStyle(c,a),appendWord(c,b);else if(a=="z"&&d=="j"&&b=="y")fixTypeStyle(c,a);else if(a=="t"&&d=="c"&&b=="y")fixTypeStyle(c,a);else if(a=="c"&&d=="t"&&b=="y")fixTypeStyle(c,a);else if(a=="t"&&d=="c"&&b=="h"&&h.includes(b))fixTypeStyle(c,a),f.textContent="y";else if(a=="h"&&e=="c"&&d=="y"&&h.includes(b))fixTypeStyle(c,a),f.textContent=b;else if(a=="y"&&e=="c"&&d=="h"&&h.includes(b))fixTypeStyle(c,a),f.textContent=b;else return!1;return!0}function typeNormal(a){a.style.visibility="visible",playAudio(keyboardAudio),a.style.color="silver",typeIndex+=1,normalCount+=1}function underlineSpace(a){a.textContent==" "&&a.style.removeProperty("text-decoration");const b=a.nextElementSibling;b&&b.textContent==" "&&(b.style.textDecoration="underline")}function nextProblem(){playAudio(correctAudio),typeIndex=0,solveCount+=1,typable()}function removeGuide(b){const c=b.previousSiblingElement;if(c){const a=c.textContent,b=simpleKeyboard.getButtonElement(a);b.classList.remove("bg-info")}let a=b.textContent;a==" "&&(a="{space}");const d=simpleKeyboard.getButtonElement(a);d&&d.classList.remove("bg-info")}function showGuide(a){if(guide){const c=a.textContent,b=simpleKeyboard.getButtonElement(c);b&&b.classList.add("bg-info")}}function typeEvent(a){switch(a.code){case"AltLeft":return typeEventKey("NonConvert");case"AltRight":return typeEventKey("Convert");case"Space":a.preventDefault();default:return typeEventKey(a.key)}}function typeEventKey(b){switch(b){case"NonConvert":{[...romaNode.children].forEach(a=>{a.style.visibility="visible"}),downTime(5);return}case"Convert":{const a=originalTextNode.textContent;loopVoice(a.toLowerCase(),1);return}case"Escape":replay();return;case" ":if(!playing){replay();return}}const a=romaNode.childNodes[typeIndex];if(/^[^0-9]$/.test(b)){if(b==a.textContent)typeNormal(a),removeGuide(a),underlineSpace(a);else{const c=checkTypeStyle(a,a.textContent,b,romaNode);c||(playAudio(incorrectAudio,.3),errorCount+=1)}typeIndex==romaNode.childNodes.length?nextProblem():showGuide(romaNode.childNodes[typeIndex])}}function resizeFontSize(a){function n(b,c){const a=tmpCanvas.getContext("2d");a.font=c;const d=a.measureText(b);return d.width}function i(g,c,d,e){const b=g.split("\n"),f=c+"px "+d;let a=0;for(let c=0;c<b.length;c++){const d=n(b[c],f);a<d&&(a=d)}return[a,c*b.length*e]}function m(a){const b=parseFloat(a.paddingLeft)+parseFloat(a.paddingRight),c=parseFloat(a.paddingTop)+parseFloat(a.paddingBottom);return[b,c]}const b=getComputedStyle(a),l=b.fontFamily,c=parseFloat(b.fontSize),o=parseFloat(b.lineHeight)/c,j=aaOuter.offsetHeight,k=infoPanel.clientWidth,h=[k,j],f=i(a.textContent,c,l,o),g=m(b),d=c*(h[0]-g[0])/f[0]*.9,e=c*(h[1]-g[1])/f[1]*.9;e<d?e<remSize?a.style.fontSize=remSize+"px":a.style.fontSize=e+"px":d<remSize?a.style.fontSize=remSize+"px":a.style.fontSize=d+"px"}function getRandomInt(a,b){return a=Math.ceil(a),b=Math.floor(b),Math.floor(Math.random()*(b-a))+a}function typable(){const f=document.getElementById("courseOption"),h=categories[f.selectedIndex],d=problems[h],a=d[getRandomInt(0,d.length)],e=a[0];aa.textContent=e[getRandomInt(0,e.length)];const b=a[1],g=a[2],c=a[3];for(romaNode.textContent=b,originalTextNode.textContent=g,translatedTextNode.textContent=c,mode.textContent=="EASY"&&loopVoice(c,1);romaNode.firstChild;)romaNode.removeChild(romaNode.firstChild);for(let a=0;a<b.length;a++){const c=document.createElement("span");mode.textContent!="EASY"&&(c.style.visibility="hidden"),c.textContent=b[a],romaNode.appendChild(c)}resizeFontSize(aa),showGuide(romaNode.childNodes[0])}function countdown(){playing=!0,changeUIEmoji(),typeIndex=normalCount=errorCount=solveCount=0,document.getElementById("guideSwitch").disabled=!0,document.getElementById("virtualKeyboard").disabled=!0,gamePanel.classList.add("d-none"),countPanel.classList.remove("d-none"),counter.textContent=3;const a=setInterval(()=>{const b=document.getElementById("counter"),c=["skyblue","greenyellow","violet","tomato"];if(parseInt(b.textContent)>1){const a=parseInt(b.textContent)-1;b.style.backgroundColor=c[a],b.textContent=a}else clearInterval(a),document.getElementById("guideSwitch").disabled=!1,document.getElementById("virtualKeyboard").disabled=!1,gamePanel.classList.remove("d-none"),countPanel.classList.add("d-none"),infoPanel.classList.remove("d-none"),playPanel.classList.remove("d-none"),aaOuter.classList.remove("d-none"),scorePanel.classList.add("d-none"),resizeFontSize(aa),typable(),startTypeTimer(),localStorage.getItem("bgm")==1&&bgm.play(),startButton.disabled=!1},1e3)}function replay(){clearInterval(typeTimer),removeGuide(romaNode.childNodes[typeIndex]),document.getElementById("time").textContent=gameTime,countdown(),typeIndex=normalCount=errorCount=solveCount=0,countPanel.classList.remove("d-none"),scorePanel.classList.add("d-none")}function startTypeTimer(){const a=document.getElementById("time");typeTimer=setInterval(()=>{const b=parseInt(a.textContent);b>0?a.textContent=b-1:(clearInterval(typeTimer),bgm.pause(),playAudio(endAudio),scoring())},1e3)}function downTime(c){const a=document.getElementById("time"),d=parseInt(a.textContent),b=d-c;b<0?a.textContent=0:a.textContent=b}function scoring(){playing=!1,infoPanel.classList.remove("d-none"),playPanel.classList.add("d-none"),aaOuter.classList.add("d-none"),countPanel.classList.add("d-none"),scorePanel.classList.remove("d-none");let a=parseInt(document.getElementById("time").textContent);a<gameTime&&(a=gameTime-a);const b=(normalCount/a).toFixed(2);document.getElementById("totalType").textContent=normalCount+errorCount,document.getElementById("typeSpeed").textContent=b,document.getElementById("errorType").textContent=errorCount}function changeMode(){this.textContent=="EASY"?this.textContent="HARD":this.textContent="EASY"}function selectRandomEmoji(){const d=categories[getRandomInt(0,categories.length)],a=problems[d],b=a[getRandomInt(0,a.length)],c=b[0],e=c[getRandomInt(0,c.length)],f=b[1];return[e,f]}function changeUIEmoji(){document.getElementById("counter-emoji").textContent=selectRandomEmoji()[0],document.getElementById("score-emoji").textContent=selectRandomEmoji()[0]}function initProblems(){fetch(`/emoji-typing/data/${originalLang}.csv`).then(a=>a.text()).then(b=>{let a;b.trimEnd().split("\n").forEach(e=>{const[d,c,b,f,g]=e.split(",");if(c in problems===!1&&(problems[c]=[]),a==b){const a=problems[c],b=a[a.length-1];b[0].push(d)}else originalLang=="en"?problems[c].push([[d],b,b,b]):problems[c].push([[d],b,f,g]);a=b})})}function setTranslation(){const a={attributeFilter:["lang"],attributes:!0};new MutationObserver(()=>{originalLang=="en"?originalTextNode.classList.add("d-none"):originalTextNode.classList.remove("d-none");const a=document.documentElement.lang;a==originalLang?translatedTextNode.classList.add("d-none"):translatedTextNode.classList.remove("d-none")}).observe(document.documentElement,a)}resizeFontSize(aa),initProblems(),setTranslation(),startButton.onclick=replay,document.getElementById("toggleDarkMode").onclick=toggleDarkMode;const furiganaButton=document.getElementById("addFurigana");furiganaButton&&(furiganaButton.onclick=addFurigana),document.getElementById("toggleBGM").onclick=toggleBGM,document.getElementById("virtualKeyboard").onclick=toggleKeyboard,window.addEventListener("resize",()=>{resizeFontSize(aa)}),document.getElementById("mode").onclick=changeMode,document.getElementById("guideSwitch").onchange=toggleGuide,document.getElementById("lang").onchange=changeLang,document.addEventListener("keydown",typeEvent),document.addEventListener("click",unlockAudio,{once:!0,useCapture:!0})
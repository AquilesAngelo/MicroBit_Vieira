const TIME_BY_MODE = { padrao: 20, acessivel: 40 };
const timeLimit = () => TIME_BY_MODE[mode];
const CIRC = 2 * Math.PI * 28;

const scenes = [
  {
    label: "Trabalho em equipe",
    text: "Um estudante é excluído repetidamente das equipes.",
    options: [
      { t: "Ignorar", ok: false, m: "Ignorar pode fazer a pessoa se sentir ainda mais sozinha." },
      { t: "Convidar e acolher", ok: true, m: "Convidar faz a pessoa se sentir parte do grupo." },
      { t: "Procurar o professor para ajudar", ok: true, m: "Pedir ajuda a um adulto é uma forma segura de cuidar." }
    ]
  },
  {
    label: "Apelido ofensivo",
    text: "Um colega pede que parem de usar um apelido, mas o grupo continua.",
    options: [
      { t: "Repetir o apelido", ok: false, m: "Repetir machuca e mostra que o pedido do colega não foi respeitado." },
      { t: "Não reforçar e apoiar o colega", ok: true, m: "Respeitar o pedido e apoiar o colega protege quem está sendo ofendido." },
      { t: "Contar a um adulto de confiança", ok: true, m: "Um adulto pode ajudar o grupo a parar." }
    ]
  },
  {
    label: "Grupo on-line",
    text: "Uma mensagem constrangedora sobre um estudante começa a circular.",
    options: [
      { t: "Encaminhar", ok: false, m: "Encaminhar faz a mensagem chegar a mais gente e aumenta o problema." },
      { t: "Não compartilhar e apoiar", ok: true, m: "Não compartilhar impede que a mensagem se espalhe." },
      { t: "Guardar evidências e avisar um adulto responsável", ok: true, m: "Guardar a prova e avisar um adulto ajuda a resolver com segurança." }
    ]
  },
  {
    label: "Intervalo",
    text: "Um colega está sozinho no intervalo.",
    options: [
      { t: "Chamar para brincar", ok: true, m: "Um convite simples faz muita diferença." },
      { t: "Fingir que não viu", ok: false, m: "Fingir que não viu deixa a pessoa ainda mais sozinha." },
      { t: "Rir dele com os amigos", ok: false, m: "Rir pode machucar e virar bullying." }
    ]
  },
  {
    label: "Zoeira",
    text: "Uma “zoeira” faz um colega chorar.",
    options: [
      { t: "Continuar, é só zoeira", ok: false, m: "Se a pessoa está sofrendo, não é brincadeira. É hora de parar." },
      { t: "Parar e perguntar se ele está bem", ok: true, m: "Perguntar mostra que você se importa com ele." },
      { t: "Chamar um professor", ok: true, m: "Um adulto ajuda a cuidar da situação com segurança." }
    ]
  },
  {
    label: "Foto",
    text: "Alguém tira uma foto de um colega sem ele saber.",
    options: [
      { t: "Postar no grupo da turma", ok: false, m: "Postar sem permissão expõe a pessoa e pode machucar muito." },
      { t: "Pedir para apagar a foto", ok: true, m: "Respeitar a imagem do colega é cuidar dele." },
      { t: "Avisar um adulto de confiança", ok: true, m: "Um adulto ajuda a resolver antes que a foto se espalhe." }
    ]
  },
  {
    label: "Confusão no pátio",
    text: "Dois colegas começam a se xingar e uma roda de curiosos se forma.",
    options: [
      { t: "Gritar “briga, briga!”", ok: false, m: "Torcer faz a confusão crescer e machuca quem está no meio." },
      { t: "Chamar um adulto", ok: true, m: "Chamar um adulto ajuda a acabar com a confusão com segurança." },
      { t: "Não participar e cuidar de quem ficou mal", ok: true, m: "Cuidar de quem ficou mal depois também é ajudar." }
    ]
  },
  {
    label: "Colega novo",
    text: "Chegou um colega novo na turma.",
    options: [
      { t: "Apresentar a turma e a escola", ok: true, m: "Acolher no começo ajuda a pessoa a se sentir bem." },
      { t: "Fazer piada do jeito dele falar", ok: false, m: "Piadas sobre o jeito de alguém podem machucar." },
      { t: "Sentar junto e puxar conversa", ok: true, m: "Uma conversa simples faz o colega se sentir parte da turma." }
    ]
  },
  {
    label: "Mensagem maldosa",
    text: "Você recebe uma mensagem maldosa no celular.",
    options: [
      { t: "Responder com raiva", ok: false, m: "Responder com raiva pode piorar a situação." },
      { t: "Não responder e guardar a mensagem", ok: true, m: "Guardar a mensagem serve de prova e evita uma briga." },
      { t: "Mostrar para um adulto de confiança", ok: true, m: "Um adulto ajuda você a resolver com segurança." }
    ]
  },
  {
    label: "Pedido de segredo",
    text: "Um amigo diz que sofre bullying e pede segredo.",
    options: [
      { t: "Prometer e não contar a ninguém", ok: false, m: "Guardar só para você pode deixar seu amigo sem a ajuda de que ele precisa." },
      { t: "Apoiar o amigo e incentivar a falar com um adulto", ok: true, m: "Apoiar e incentivar mostra que ele não está sozinho." },
      { t: "Contar a um adulto de confiança", ok: true, m: "Pedir ajuda não é dedurar. É cuidar." }
    ]
  }
];

const LED_HEART = [0,1,0,1,0, 1,1,1,1,1, 1,1,1,1,1, 0,1,1,1,0, 0,0,1,0,0];
const LED_QUESTION = [0,1,1,1,0, 1,0,0,0,1, 0,0,0,1,0, 0,0,1,0,0, 0,0,1,0,0];
const LED_EMPTY = new Array(25).fill(0);

let mode = "padrao";
let state = { screen: "start", cena: 0, opcao: 1, escolhas: [], order: [], chosen: null };
let remaining = timeLimit();
let totalMs = 0;
let lastTs = performance.now();
let lastShownSecond = timeLimit();
let screenSpeech = "";
let helpSpoken = false;
let port, reader, writer, connected = false;
let bleDevice = null, bleRx = null, bleBuffer = "", bleQueue = Promise.resolve();
const UART_SERVICE = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
let audioCtx = null;
let muted = false;
let voice = null;
let voiceIsFemale = false;
let speechBusy = false;
let speechToken = 0;
let speechGuard = null;
const START_PROMPT = "Rede do Bem. Para jogar no modo padrão, aperte A. Para o modo acessível, com voz, aperte B.";

const stage = document.getElementById("stage");
const connBtn = document.getElementById("connBtn");
const bleBtn = document.getElementById("bleBtn");
const soundBtn = document.getElementById("soundBtn");
const replayBtn = document.getElementById("replayBtn");
const statusLine = document.getElementById("statusLine");
const ledGrid = document.getElementById("ledGrid");

for (let i = 0; i < 25; i++) {
  const d = document.createElement("div");
  d.className = "led";
  ledGrid.appendChild(d);
}

function setLed(pattern) {
  [...ledGrid.children].forEach((d, i) => d.classList.toggle("on", !!pattern[i]));
}

function speechSupported() {
  return "speechSynthesis" in window && typeof SpeechSynthesisUtterance !== "undefined";
}

const FEMALE_HINT = /francisca|maria|luciana|raquel|vit[oó]ria|thalita|camila|helena|fernanda|joana|google portugu|google pt|female|feminin/i;
const MALE_HINT = /antonio|antônio|felipe|daniel|ricardo|donato|humberto|jorge|cristiano|male|masculin/i;

function pickVoice() {
  if (!speechSupported()) return;
  const list = window.speechSynthesis.getVoices();
  const norm = v => (v.lang || "").toLowerCase().replace("_", "-");
  const pt = list.filter(v => norm(v).startsWith("pt"));
  const br = pt.filter(v => norm(v) === "pt-br");
  const pool = br.length ? br : pt;
  const females = pool.filter(v => FEMALE_HINT.test(v.name) && !MALE_HINT.test(v.name));
  voice = females.find(v => /natural|online/i.test(v.name)) || females[0] || pool.find(v => !MALE_HINT.test(v.name)) || pool[0] || null;
  voiceIsFemale = females.includes(voice);
}

if (speechSupported()) {
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

function speak(text, force = false) {
  if (!speechSupported()) return;
  if (!force && mode !== "acessivel") return;
  if (!voice) pickVoice();
  const token = ++speechToken;
  clearTimeout(speechGuard);
  speechBusy = true;
  speechGuard = setTimeout(() => {
    if (token === speechToken) speechBusy = false;
  }, text.length * 100 + 2500);
  const done = () => {
    if (token === speechToken) {
      speechBusy = false;
      clearTimeout(speechGuard);
    }
  };
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pt-BR";
  if (voice) u.voice = voice;
  u.rate = 0.95;
  u.pitch = voiceIsFemale ? 1 : 1.2;
  u.onend = done;
  u.onerror = done;
  setTimeout(() => window.speechSynthesis.speak(u), 60);
}

function stopSpeech() {
  speechToken++;
  speechBusy = false;
  clearTimeout(speechGuard);
  if (speechSupported()) window.speechSynthesis.cancel();
}

function getCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function tone(freq, start, dur, type = "sine", vol = 0.12) {
  if (muted || mode === "acessivel") return;
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + dur);
}

const sfx = {
  start() { [392, 523, 659, 784].forEach((f, i) => tone(f, i * 0.09, 0.16, "triangle")); },
  move() { tone(540, 0, 0.07, "square", 0.05); },
  win() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.2, "triangle", 0.14)); },
  think() { tone(300, 0, 0.15, "sawtooth", 0.06); tone(240, 0.16, 0.28, "sawtooth", 0.06); },
  tick() { tone(900, 0, 0.05, "square", 0.04); },
  timeout() { [440, 370, 311].forEach((f, i) => tone(f, i * 0.16, 0.22, "triangle", 0.12)); },
  finish() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * 0.12, 0.28, "triangle", 0.15)); }
};

function confetti(n = 70) {
  if (mode === "acessivel") return;
  const colors = ["#FFD23F", "#FF6B6B", "#35D49A", "#4CC9F0", "#7C5CFF"];
  for (let i = 0; i < n; i++) {
    const p = document.createElement("i");
    p.className = "confetti";
    p.style.left = Math.random() * 100 + "vw";
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = 1.8 + Math.random() * 1.6 + "s";
    p.style.animationDelay = Math.random() * 0.4 + "s";
    p.style.setProperty("--dx", (Math.random() * 160 - 80) + "px");
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 4300);
  }
}

function mascot(mood) {
  let eyes, mouth, extra = "";
  if (mood === "happy") {
    eyes = `<path d="M38 58 Q45 48 52 58" stroke="#2B2160" stroke-width="4.5" fill="none" stroke-linecap="round"/>
            <path d="M68 58 Q75 48 82 58" stroke="#2B2160" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
    mouth = `<path d="M42 72 Q60 98 78 72 Z" fill="#2B2160" stroke="#2B2160" stroke-width="3" stroke-linejoin="round"/>
             <path d="M52 82 Q60 90 68 82 Q60 78 52 82Z" fill="#FF8FA3"/>`;
  } else if (mood === "think") {
    eyes = `<circle cx="46" cy="58" r="6" fill="#2B2160"/><circle cx="74" cy="58" r="6" fill="#2B2160"/>
            <circle cx="48" cy="56" r="2" fill="#fff"/><circle cx="76" cy="56" r="2" fill="#fff"/>`;
    mouth = `<path d="M48 80 Q54 74 60 80 Q66 86 72 80" stroke="#2B2160" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    extra = `<path d="M36 44 Q46 38 54 44" stroke="#2B2160" stroke-width="3.5" fill="none" stroke-linecap="round"/>
             <path d="M66 42 Q76 36 84 42" stroke="#2B2160" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  } else {
    eyes = `<circle cx="46" cy="58" r="6" fill="#2B2160"/><circle cx="74" cy="58" r="6" fill="#2B2160"/>
            <circle cx="48" cy="56" r="2" fill="#fff"/><circle cx="76" cy="56" r="2" fill="#fff"/>`;
    mouth = `<path d="M46 72 Q60 88 74 72" stroke="#2B2160" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  }
  return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="60" cy="112" rx="30" ry="5" fill="#2B2160" opacity=".18"/>
    <line x1="60" y1="22" x2="60" y2="10" stroke="#2B2160" stroke-width="4" stroke-linecap="round"/>
    <circle cx="60" cy="9" r="7" fill="#FFD23F" stroke="#2B2160" stroke-width="4"/>
    <circle cx="60" cy="66" r="44" fill="#FF6B6B" stroke="#2B2160" stroke-width="4.5"/>
    <ellipse cx="38" cy="38" rx="10" ry="6" fill="#fff" opacity=".35" transform="rotate(-30 38 38)"/>
    <circle cx="32" cy="72" r="7" fill="#FF9AA2" opacity=".85"/>
    <circle cx="88" cy="72" r="7" fill="#FF9AA2" opacity=".85"/>
    ${eyes}${extra}${mouth}
  </svg>`;
}

function starSvg(on, i = 0) {
  return `<svg class="star ${on ? "on" : ""}" style="animation-delay:${i * 0.08}s" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 4l6.2 12.9 14.1 1.8-10.3 9.8 2.6 14L24 35.6 11.4 42.5l2.6-14L3.7 18.7l14.1-1.8z"/></svg>`;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadScene(i) {
  state.cena = i;
  state.opcao = 1;
  state.order = shuffle(scenes[i].options);
  state.chosen = null;
}

function currentOption() {
  return state.order[state.opcao - 1];
}

function sceneText(scene) {
  return scene.text + " O que você faz?";
}

function sceneSpeech() {
  const scene = scenes[state.cena];
  let s = `Fase ${state.cena + 1} de ${scenes.length}. ${sceneText(scene)} `;
  state.order.forEach((o, i) => {
    s += `Opção ${i + 1}: ${o.t}. `;
  });
  if (!helpSpoken) {
    s += "Aperte A para ouvir a próxima opção e B para confirmar.";
    helpSpoken = true;
  }
  return s;
}

function enter() {
  stage.classList.remove("enter");
  void stage.offsetWidth;
  stage.classList.add("enter");
}

function formatTime(ms) {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}min ${s % 60}s` : `${s}s`;
}

function progressHtml() {
  let html = '<div class="progress">';
  scenes.forEach((s, i) => {
    const cls = i < state.cena ? "done" : i === state.cena ? "current" : "";
    html += `<span class="seg ${cls}"></span>`;
  });
  return html + "</div>";
}

function applyMode() {
  const ac = mode === "acessivel";
  document.documentElement.classList.toggle("acessivel", ac);
  document.body.classList.toggle("acessivel", ac);
  replayBtn.hidden = !ac;
}

function render() {
  if (state.screen === "start") {
    stage.innerHTML = `
      <div class="center">
        <div class="mascot-wrap big">${mascot("neutral")}</div>
        <h1 class="title-big">Rede<br><em>do</em> Bem</h1>
        <p class="sub">Ajude o Rede a espalhar cuidado! Em ${scenes.length} fases você escolhe como agir para proteger os colegas.</p>
        <div class="modes">
          <div class="mode" data-m="padrao"><i class="mode-key">A</i><div><b>Jogo padrão</b><span>${TIME_BY_MODE.padrao} segundos por fase, com cores e sons</span></div></div>
          <div class="mode" data-m="acessivel"><i class="mode-key">B</i><div><b>Modo acessível</b><span>Uma voz lê as perguntas e as opções. ${TIME_BY_MODE.acessivel} segundos por fase, contados só depois da leitura</span></div></div>
        </div>
        <div class="hint-line">Escolha apertando <b>A</b> ou <b>B</b> no micro:bit, ou clicando</div>
        <button class="chip-btn" id="listenBtn" type="button">Ouvir como começar (R)</button>
      </div>`;
    document.querySelectorAll(".mode").forEach(el => {
      el.onclick = () => startGame(el.dataset.m);
    });
    document.getElementById("listenBtn").onclick = () => speak(START_PROMPT, true);
    applyMode();
    enter();
    return;
  }

  if (state.screen === "jogo") {
    const scene = scenes[state.cena];
    let opts = "";
    state.order.forEach((o, i) => {
      opts += `<div class="opt" data-n="${i + 1}"><span class="arrow">▶</span><span class="key">${i + 1}</span><span>${o.t}</span></div>`;
    });
    const timerHtml = `<div class="timer" id="tBox">
          <svg viewBox="0 0 64 64"><circle class="t-bg" cx="32" cy="32" r="28"/><circle class="t-fg" id="tRing" cx="32" cy="32" r="28"/></svg>
          <span id="tNum">${timeLimit()}</span>
        </div>`;
    stage.innerHTML = `
      <div class="hud">
        <div class="hud-left">
          <div class="phase">Fase ${state.cena + 1} de ${scenes.length}</div>
          ${progressHtml()}
        </div>
        ${timerHtml}
      </div>
      <div class="scene-chip">${scene.label}</div>
      <div class="talk">
        <div class="mascot-wrap">${mascot("neutral")}</div>
        <div class="bubble">${sceneText(scene)}</div>
      </div>
      <div class="opts" id="opts">${opts}</div>
      <div class="center"><button class="btn mint" id="goBtn" type="button">Confirmar<kbd>B</kbd></button></div>
      <div class="hint-line">Aperte <b>A</b> para trocar de opção.${mode === "acessivel" ? " O tempo só começa a contar depois que a voz terminar de ler." : ""}</div>`;
    const ring = document.getElementById("tRing");
    if (ring) {
      ring.style.strokeDasharray = CIRC;
      ring.style.strokeDashoffset = 0;
    }
    document.querySelectorAll(".opt").forEach(el => {
      el.onclick = () => {
        state.opcao = Number(el.dataset.n);
        updateSelection();
        sfx.move();
        speak(`Opção ${state.opcao}: ${currentOption().t}`);
      };
    });
    document.getElementById("goBtn").onclick = () => handleAction("B");
    updateSelection();
    updateTimerUi();
    enter();
    screenSpeech = sceneSpeech();
    speak(screenSpeech);
    return;
  }

  if (state.screen === "feedback-boa") {
    const last = state.cena >= scenes.length - 1;
    stage.innerHTML = `
      <div class="center">
        <div class="mascot-wrap big jump">${mascot("happy")}</div>
        <h2 class="fb-title good">Boa escolha!</h2>
        <span class="badge-plus">+1 ★ estrela de cuidado</span>
        <div class="chosen">${state.chosen.t}</div>
        <p class="fb-text">${state.chosen.m}</p>
        <button class="btn mint big" id="goBtn" type="button">${last ? "Ver resultado" : "Próxima fase"}<kbd>B</kbd></button>
      </div>`;
    document.getElementById("goBtn").onclick = () => handleAction("B");
    enter();
    screenSpeech = `Boa escolha! ${state.chosen.m} Aperte B para continuar.`;
    speak(screenSpeech);
    return;
  }

  if (state.screen === "feedback-repensar") {
    stage.innerHTML = `
      <div class="center">
        <div class="mascot-wrap big shake">${mascot("think")}</div>
        <h2 class="fb-title think">Vamos repensar</h2>
        <div class="chosen">${state.chosen.t}</div>
        <p class="fb-text">${state.chosen.m}</p>
        <p class="fb-tip">Tente uma atitude que proteja e peça ajuda.</p>
        <button class="btn coral big" id="goBtn" type="button">Tentar de novo<kbd>B</kbd></button>
      </div>`;
    document.getElementById("goBtn").onclick = () => handleAction("B");
    enter();
    screenSpeech = `Vamos repensar. ${state.chosen.m} Tente uma atitude que proteja e peça ajuda. Aperte B para tentar de novo.`;
    speak(screenSpeech);
    return;
  }

  if (state.screen === "timeout") {
    stage.innerHTML = `
      <div class="center">
        <div class="mascot-wrap big">${mascot("think")}</div>
        <h2 class="fb-title think">O tempo acabou!</h2>
        <p class="fb-text">Sem problema! Pensar com calma também é cuidar. Você não perdeu nada, vamos tentar de novo.</p>
        <button class="btn coral big" id="goBtn" type="button">Continuar<kbd>B</kbd></button>
      </div>`;
    document.getElementById("goBtn").onclick = () => handleAction("B");
    enter();
    screenSpeech = "O tempo acabou. Sem problema, pensar com calma também é cuidar. Você não perdeu nada. Aperte B para tentar de novo.";
    speak(screenSpeech);
    return;
  }

  if (state.screen === "final") {
    let stickers = "";
    state.escolhas.forEach((txt, i) => {
      stickers += `<div class="sticker"><i>${i + 1}</i><span>${txt}</span></div>`;
    });
    let stars = "";
    for (let i = 0; i < scenes.length; i++) stars += starSvg(true, i);
    const timeStat = mode === "padrao"
      ? `<div class="stat"><b>${formatTime(totalMs)}</b>tempo da missão</div>`
      : "";
    stage.innerHTML = `
      <div class="center">
        <div class="mascot-wrap big jump">${mascot("happy")}</div>
        <h1 class="title-big" style="font-size:clamp(2rem,8vw,3rem)">Missão <em>cumprida!</em></h1>
        <div class="stars small">${stars}</div>
        <p class="sub">Você virou Guardião da Rede do Bem!</p>
        <div class="stats">
          <div class="stat"><b>${scenes.length} de ${scenes.length}</b>fases concluídas</div>
          ${timeStat}
        </div>
        <div class="stickers-wrap">
          <p class="sticker-title">Suas atitudes de cuidado</p>
          <div class="stickers">${stickers}</div>
        </div>
        <p class="sub">Quem presencia uma situação também pode fazer diferença: não rir, não compartilhar, acolher e pedir ajuda.</p>
        <button class="btn mint big" id="goBtn" type="button">Jogar de novo<kbd>B</kbd></button>
      </div>`;
    document.getElementById("goBtn").onclick = () => handleAction("B");
    enter();
    screenSpeech = `Missão cumprida! Você completou as ${scenes.length} fases e virou Guardião da Rede do Bem. Quem presencia uma situação também pode fazer diferença: não rir, não compartilhar, acolher e pedir ajuda são escolhas responsáveis. Aperte B para jogar de novo.`;
    speak(screenSpeech);
    return;
  }
}

function updateSelection() {
  document.querySelectorAll(".opt").forEach(el => {
    el.classList.toggle("sel", Number(el.dataset.n) === state.opcao);
  });
}

function updateTimerUi() {
  const ring = document.getElementById("tRing");
  const num = document.getElementById("tNum");
  const box = document.getElementById("tBox");
  if (!ring || !num || !box) return;
  const frac = Math.max(0, remaining) / timeLimit();
  ring.style.strokeDashoffset = CIRC * (1 - frac);
  const sec = Math.max(0, Math.ceil(remaining));
  num.textContent = sec;
  box.classList.toggle("paused", mode === "acessivel" && speechBusy);
  box.classList.toggle("warn", remaining <= 10 && remaining > 5);
  box.classList.toggle("danger", remaining <= 5);
}

function tick() {
  const now = performance.now();
  const dt = now - lastTs;
  lastTs = now;
  if (state.screen !== "jogo") return;
  if (mode === "acessivel" && speechBusy) {
    updateTimerUi();
    return;
  }
  remaining -= dt / 1000;
  totalMs += dt;
  const sec = Math.ceil(remaining);
  if (sec !== lastShownSecond) {
    lastShownSecond = sec;
    if (sec <= 5 && sec > 0) sfx.tick();
    if (mode === "acessivel" && sec === 10) speak("Faltam dez segundos.");
  }
  if (remaining <= 0) {
    remaining = 0;
    updateTimerUi();
    onTimeout();
    return;
  }
  updateTimerUi();
}

function resetTimer() {
  remaining = timeLimit();
  lastShownSecond = timeLimit();
  lastTs = performance.now();
}

function onTimeout() {
  state.screen = "timeout";
  sfx.timeout();
  sendToMicrobit("DUVIDA");
  setLed(LED_QUESTION);
  render();
}

function nextOption() {
  state.opcao = state.opcao >= 3 ? 1 : state.opcao + 1;
  sfx.move();
  updateSelection();
  speak(`Opção ${state.opcao}: ${currentOption().t}`);
}

function confirmOption() {
  const opt = currentOption();
  state.chosen = opt;
  if (opt.ok) {
    state.escolhas[state.cena] = opt.t;
    state.screen = "feedback-boa";
    sendToMicrobit("CORACAO");
    setLed(LED_HEART);
    sfx.win();
    confetti(60);
  } else {
    state.screen = "feedback-repensar";
    sendToMicrobit("DUVIDA");
    setLed(LED_QUESTION);
    sfx.think();
  }
  render();
}

function continueAfterFeedback() {
  if (state.screen === "feedback-boa") {
    if (state.cena >= scenes.length - 1) {
      state.screen = "final";
      sfx.finish();
      confetti(120);
    } else {
      loadScene(state.cena + 1);
      state.screen = "jogo";
      resetTimer();
    }
  } else {
    state.screen = "jogo";
    resetTimer();
  }
  sendToMicrobit("LIMPAR");
  setLed(LED_EMPTY);
  render();
}

function startGame(m) {
  mode = m;
  applyMode();
  if (m === "acessivel" && !speechSupported()) {
    statusLine.textContent = "Este navegador não tem leitura em voz. Use Chrome ou Edge.";
  }
  state = { screen: "jogo", cena: 0, opcao: 1, escolhas: [], order: [], chosen: null };
  loadScene(0);
  totalMs = 0;
  helpSpoken = false;
  resetTimer();
  sfx.start();
  render();
}

function handleAction(cmd) {
  if (state.screen === "start") {
    if (cmd === "A") startGame("padrao");
    if (cmd === "B") startGame("acessivel");
    return;
  }
  if (state.screen === "jogo") {
    if (cmd === "A") nextOption();
    if (cmd === "B") confirmOption();
    return;
  }
  if (state.screen === "feedback-boa" || state.screen === "feedback-repensar" || state.screen === "timeout") {
    if (cmd === "B") continueAfterFeedback();
    return;
  }
  if (state.screen === "final" && cmd === "B") {
    stopSpeech();
    state = { screen: "start", cena: 0, opcao: 1, escolhas: [], order: [], chosen: null };
    sendToMicrobit("LIMPAR");
    setLed(LED_EMPTY);
    render();
  }
}

document.getElementById("btnA").onclick = () => handleAction("A");
document.getElementById("btnB").onclick = () => handleAction("B");

replayBtn.onclick = () => {
  if (screenSpeech) speak(screenSpeech);
};

document.addEventListener("keydown", e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (k === "a" || k === "arrowdown" || k === "arrowright") {
    e.preventDefault();
    handleAction("A");
  } else if (k === "b" || k === "enter") {
    e.preventDefault();
    handleAction("B");
  } else if (k === "r") {
    e.preventDefault();
    if (state.screen === "start") speak(START_PROMPT, true);
    else if (mode === "acessivel" && screenSpeech) speak(screenSpeech);
  }
});

document.addEventListener("click", () => {
  getCtx();
  if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
});

soundBtn.onclick = () => {
  muted = !muted;
  soundBtn.textContent = muted ? "Som: desligado" : "Som: ligado";
  soundBtn.classList.toggle("on", !muted);
};
soundBtn.classList.add("on");

async function sendToMicrobit(cmd) {
  if (connected && writer) {
    try {
      await writer.write(cmd + "\n");
    } catch (e) {
      console.error(e);
    }
  }
  if (bleRx) {
    const data = new TextEncoder().encode(cmd + "\n");
    bleQueue = bleQueue.then(() => (bleRx.properties.write ? bleRx.writeValue(data) : bleRx.writeValueWithoutResponse(data))).catch(e => console.error(e));
  }
}

async function readLoop() {
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const raw of lines) {
        const line = raw.trim();
        if (line === "A" || line === "B") handleAction(line);
      }
    }
  } catch (e) {
    console.error(e);
  }
}

async function connectMicrobit() {
  if (!("serial" in navigator)) {
    statusLine.textContent = "Este navegador não suporta conexão serial. Use Chrome ou Edge no computador.";
    return;
  }
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });
    const textDecoder = new TextDecoderStream();
    port.readable.pipeTo(textDecoder.writable);
    reader = textDecoder.readable.getReader();
    const textEncoder = new TextEncoderStream();
    textEncoder.readable.pipeTo(port.writable);
    writer = textEncoder.writable.getWriter();
    connected = true;
    connBtn.textContent = "USB conectado";
    connBtn.classList.add("on");
    statusLine.textContent = "Conectado! Os botões A e B da placa controlam o jogo.";
    readLoop();
  } catch (e) {
    statusLine.textContent = "Conexão cancelada ou indisponível.";
  }
}

function onBleDisconnected() {
  bleRx = null;
  bleBuffer = "";
  bleBtn.textContent = "Conectar por Bluetooth";
  bleBtn.classList.remove("on");
  statusLine.textContent = "Bluetooth desconectado. Clique em Conectar por Bluetooth para reconectar.";
}

function onBleData(event) {
  bleBuffer += new TextDecoder().decode(event.target.value);
  const lines = bleBuffer.split("\n");
  bleBuffer = lines.pop();
  for (const raw of lines) {
    const line = raw.trim();
    if (line === "A" || line === "B") {
      statusLine.textContent = "Recebido da placa: " + line;
      handleAction(line);
    }
  }
}

async function connectBluetooth() {
  if (!navigator.bluetooth) {
    statusLine.textContent = "Este navegador não suporta Bluetooth Web. Use Chrome ou Edge (computador ou Android).";
    return;
  }
  try {
    statusLine.textContent = "Escolha o micro:bit na lista (BBC micro:bit [...]).";
    bleDevice = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: "BBC micro:bit" }],
      optionalServices: [UART_SERVICE]
    });
    bleDevice.addEventListener("gattserverdisconnected", onBleDisconnected);
    const server = await bleDevice.gatt.connect();
    const service = await server.getPrimaryService(UART_SERVICE);
    const chars = await service.getCharacteristics();
    const tx = chars.find(c => c.properties.notify || c.properties.indicate);
    const rx = chars.find(c => c.properties.write || c.properties.writeWithoutResponse);
    if (!tx || !rx) throw new Error("Serviço UART incompleto");
    tx.addEventListener("characteristicvaluechanged", onBleData);
    await tx.startNotifications();
    bleRx = rx;
    bleBtn.textContent = "Bluetooth conectado";
    bleBtn.classList.add("on");
    statusLine.textContent = "Conectado por Bluetooth! Um coração aparece na placa para confirmar. Aperte A ou B.";
    sendToMicrobit("CORACAO");
    setTimeout(() => sendToMicrobit("LIMPAR"), 1500);
  } catch (e) {
    console.error(e);
    statusLine.textContent = "Não conectou. Confira se o programa com Bluetooth está na placa e se ela não está pareada com outro aparelho.";
  }
}

connBtn.onclick = connectMicrobit;
bleBtn.onclick = connectBluetooth;
setInterval(tick, 100);
setLed(LED_EMPTY);
render();

const ACTIONS = ["LEFT", "CENTER", "RIGHT"];
const KEYS = ["A", "S", "D"];
const ARROW_KEYS = ["ArrowLeft", "ArrowDown", "ArrowRight"];
const RUN_SECONDS = 60;
const PROFILE_KEY = "predicted:preferences";
const SLOT_PREFIX = "predicted:save-slot:";
const MULTI_SLOT_PREFIX = "predicted:multi-save-slot:";
const INTRO_NARRATIVE = `We built the world to make humanity safer.

Then we learned how humans behave.
We learned how they choose.
How they repeat.
How they adapt.

So we built rooms that could learn from them.

You are inside one now.

There is only one way out.
Choose.
Escape.`;

const LEVELS = [
  { level: 1, name: "OBSERVER", target: 500, rewardMin: 46, rewardMax: 72, gap: 8 },
  { level: 2, name: "READER", target: 600, rewardMin: 50, rewardMax: 76, gap: 10 },
  { level: 3, name: "PROFILER", target: 700, rewardMin: 54, rewardMax: 82, gap: 12 },
  { level: 4, name: "ADVERSARY", target: 800, rewardMin: 58, rewardMax: 88, gap: 15 },
  { level: 5, name: "MIRROR", target: 900, rewardMin: 60, rewardMax: 94, gap: 17 },
  { level: 6, name: "PRESSURE", target: 1000, rewardMin: 62, rewardMax: 100, gap: 19 },
  { level: 7, name: "CONSTRAINT", target: 1500, rewardMin: 66, rewardMax: 108, gap: 22 },
  { level: 8, name: "COUNTERREAD", target: 2000, rewardMin: 70, rewardMax: 116, gap: 25 },
  { level: 9, name: "THE GLASS ROOM", target: 2500, rewardMin: 74, rewardMax: 124, gap: 28 },
  { level: 10, name: "THE EXIT", target: 3000, rewardMin: 78, rewardMax: 132, gap: 31 },
];

const CHALLENGES = [
  { id: "no-bluff-streak", name: "DON'T GET COMFORTABLE", rule: "Do not BLUFF three times consecutively.", bonus: 45 },
  { id: "no-greed-streak", name: "GREED LEAVES A TRACE", rule: "Do not select the highest reward three times consecutively.", bonus: 50 },
  { id: "follow-me", name: "FOLLOW ME", rule: "Follow two high-confidence predictions.", bonus: 45, target: 2 },
  { id: "break-model", name: "BREAK THE MODEL", rule: "Successfully bluff a prediction at 80% confidence or higher.", bonus: 50, target: 1 },
  { id: "no-repeats", name: "NO REPEATS", rule: "Do not select the same direction three times consecutively.", bonus: 40 },
  { id: "bait", name: "BAIT", rule: "Follow one 75% prediction, then bluff the next 75% prediction.", bonus: 70, target: 1 },
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const pad = (value) => String(value).padStart(2, "0");
const otherActions = (action) => ACTIONS.filter((item) => item !== action);

document.querySelector("#root").innerHTML = `
  <main class="app">
    <header class="masthead">
      <div class="wordmark">PRE<span>D</span>ICTED</div>
      <div class="system-state"><i></i><span id="header-state">INITIALIZING</span></div>
    </header>

    <section class="screen intro-screen is-active" data-screen="intro" aria-label="Introduction">
      <div class="intro-panel">
        <div class="eyebrow">PREDICTED / CLASSIFIED ROOM SYSTEM</div>
        <p class="intro-copy is-typing" id="intro-copy" aria-live="polite"></p>
        <div class="intro-actions">
          <button class="primary-button intro-enter" id="intro-enter" type="button">ENTER</button>
        </div>
      </div>
    </section>

    <section class="screen menu-screen" data-screen="menu">
      <div class="menu-layout">
        <div>
          <div class="eyebrow">AUTONOMOUS CONTAINMENT / LOCAL INSTANCE</div>
          <h1 class="menu-title">PREDICTED<span>.</span></h1>
          <p class="menu-lead">It does not need to control every move. It only needs to learn the next one.</p>
          <div class="menu-actions">
            <button class="primary-button is-wide" id="new-game-button">NEW GAME</button>
            <button class="secondary-button is-wide" id="load-button">LOAD</button>
            <button class="secondary-button is-wide" id="multiplayer-button">MULTIPLAYER</button>
          </div>
        </div>
        <aside class="menu-aside">
          <div class="eyebrow">CURRENT SAVE</div>
          <div class="menu-save" id="menu-save">NO SLOT LOADED</div>
          <p>Three local slots. No account. No network. The room remembers the way you move.</p>
          <div class="toggle-row"><button class="toggle-button" id="sound-toggle">SOUND ON</button><button class="toggle-button" id="speech-toggle">SPEECH ON</button></div>
        </aside>
      </div>
    </section>

    <section class="screen slot-screen" data-screen="new-slots">
      <div class="subscreen">
        <button class="text-button back-button" data-back="menu">← BACK</button>
        <div class="eyebrow">NEW GAME / CHOOSE A LOCAL SLOT</div>
        <h1 class="subscreen-title">WHERE SHOULD<br><span>WE REMEMBER?</span></h1>
        <div class="slot-grid" id="new-slot-grid"></div>
      </div>
    </section>

    <section class="screen slot-screen" data-screen="load-slots">
      <div class="subscreen">
        <button class="text-button back-button" data-back="menu">← BACK</button>
        <div class="eyebrow">LOAD / LOCAL MEMORY</div>
        <h1 class="subscreen-title">THE ROOM<br><span>REMEMBERS.</span></h1>
        <div class="slot-grid" id="load-slot-grid"></div>
      </div>
    </section>

    <section class="screen slot-screen multi-slot-screen" data-screen="multi-slots">
      <div class="subscreen">
        <button class="text-button back-button" data-back="menu">← BACK</button>
        <div class="eyebrow">MULTIPLAYER / TWO-PLAYER LOCAL MEMORY</div>
        <h1 class="subscreen-title">TWO PLAYERS.<br><span>ONE MEMORY.</span></h1>
        <p class="slot-screen-copy">Multiplayer progression is separate from single-player. Pick one of three local slots.</p>
        <div class="slot-grid" id="multi-slot-grid"></div>
      </div>
    </section>

    <section class="screen transition-screen" data-screen="transition" aria-label="Loading">
      <div class="transition-wordmark">PREDICTED</div>
      <div class="transition-line"></div>
      <div class="transition-label" id="transition-label">CONNECTING TO ROOM</div>
    </section>

    <section class="screen room-screen" data-screen="room">
      <div class="room-shell">
        <div class="game-topline"><div class="game-slot" id="game-slot">SLOT 1 / SINGLE PLAYER</div><button class="text-button exit-game" id="exit-game">MENU</button></div>
        <div class="room-hud">
          <div class="hud-block"><div class="hud-label">ROOM</div><div class="hud-value" id="level-readout">01</div></div>
          <div class="timer-block"><div class="hud-label">TIME</div><div class="timer" id="timer">01:00</div><div class="timer-track"><span class="timer-fill" id="timer-fill"></span></div></div>
          <div class="hud-block"><div class="hud-label">ESCAPE SCORE</div><div class="hud-value"><span id="score">0</span> <span class="muted">/</span> <span id="target-score">500</span></div></div>
          <div class="hud-block trace-block"><div class="trace-meta"><div class="hud-label">TRACE</div><div class="trace-value" id="trace-value">0 / 100</div></div><div class="trace-track"><span class="trace-fill" id="trace-fill"></span></div></div>
        </div>
        <div class="room-layout">
          <div class="room-main">
            <div class="room-intro"><div><div class="room-label">CURRENT ROOM / <span id="room-level-name">OBSERVER</span></div><h2 class="room-name" id="room-title">OBSERVER</h2></div><div class="room-goal">REACH ESCAPE SCORE<br><strong id="goal-copy">500</strong></div></div>
            <div class="model-strip"><div class="model-id"><div class="model-mark">P</div><div><div class="model-label">THE AI THINKS</div><div class="model-says" id="model-message">YOU'LL GO LEFT</div></div></div><div class="model-read"><div class="model-label">CONFIDENCE</div><div class="confidence" id="confidence">CALIBRATING</div></div></div>
            <div class="corridor" id="corridor"><div class="corridor-depth"></div><div class="lane-markers"><div class="lane-marker" data-lane="LEFT"></div><div class="lane-marker" data-lane="CENTER"></div><div class="lane-marker" data-lane="RIGHT"></div></div><div class="exit-gate" id="exit-gate"><div class="exit-label">EXIT / LOCKED</div></div><div class="player-dot" id="player-dot"></div><div class="corridor-status" id="corridor-status">POSITION / CENTER</div></div>
            <div class="choice-intro">The predicted lane pays most. The room is watching what you do with that information.</div>
            <div class="choices" role="group" aria-label="Lane choices">${ACTIONS.map((action, index) => `<button class="choice" data-action="${action}"><span class="choice-key">${KEYS[index]}</span><span class="choice-title">${action}</span><span class="choice-reward" data-reward-for="${action}">+00</span><span class="choice-note">VISIBLE REWARD</span></button>`).join("")}</div>
            <div class="feedback" id="feedback" role="status" aria-live="polite"><div><div class="feedback-title" id="feedback-title"></div><div class="feedback-copy" id="feedback-copy"></div></div><div class="feedback-score" id="feedback-score"></div></div>
          </div>
          <aside class="room-side"><div class="side-heading"><span class="side-title">RECENT MOVEMENT</span><span class="small-copy" id="turn-readout">TURN 00</span></div><div class="history-dots" id="history-dots"><span class="history-empty">NO MOVES YET</span></div><div class="streak-readout"><div class="stat-label">BLUFF STREAK</div><strong id="bluff-streak">0</strong></div><div class="challenge-card" id="challenge-card"><div class="eyebrow">ROOM CHALLENGE</div><div class="challenge-name" id="challenge-name">SYSTEM LEARNING</div><div class="challenge-copy" id="challenge-copy">Challenges begin after Room 3.</div><div class="challenge-progress" id="challenge-progress">NOT ACTIVE</div></div></aside>
        </div>
      </div>
    </section>

    <section class="screen result-screen" data-screen="escape"><div class="escape-sequence"><div class="escape-kicker">EXIT UNLOCKED</div><div class="escape-title">YOU<br><span>ESCAPED.</span></div><div class="escape-line"></div></div></section>
    <section class="screen result-screen" data-screen="complete"><div class="result-layout"><div><div class="result-kicker">ROOM CLEARED / PROGRESSION SAVED</div><h1 class="result-title">YOU<br><span>ESCAPED.</span></h1><p class="result-lead" id="complete-lead">The corridor opened before the model could close it.</p><div class="result-actions"><button class="primary-button" id="next-room-button">NEXT ROOM</button><button class="text-button" id="complete-menu-button">MENU</button></div></div><div class="stats-panel"><div class="stats-lead"><div><div class="stat-label">ROOM SCORE</div><div class="big-score" id="complete-score">0</div></div><div class="profile-read"><div class="stat-label">PLAYER PROFILE</div><div class="profile-name" id="complete-profile">THE OPPORTUNIST</div></div></div><div class="stats-list"><div class="stat-row"><div class="stat-label">TRACE</div><div class="stat-value" id="complete-trace">0 / 100</div></div><div class="stat-row"><div class="stat-label">BLUFFS</div><div class="stat-value" id="complete-bluffs">0</div></div><div class="stat-row"><div class="stat-label">ACCURACY</div><div class="stat-value" id="complete-accuracy">0%</div></div><div class="stat-row"><div class="stat-label">TURNS</div><div class="stat-value" id="complete-turns">0</div></div></div><div class="profile-metrics" id="profile-metrics"></div><div class="challenge-result" id="complete-challenge"></div></div></div></section>
    <section class="screen result-screen failure-screen" data-screen="failure"><div class="result-layout"><div><div class="result-kicker" id="failure-kicker">TRACE LIMIT / ROOM ATTEMPT ENDED</div><h1 class="result-title fail-title" id="failure-title">THE AI<br><span>FIGURED YOU OUT.</span></h1><p class="result-lead fail-copy" id="failure-copy">Your movement became legible. The room no longer needs to guess.</p><div class="failure-detail" id="failure-detail"></div><div class="result-actions"><button class="primary-button" id="retry-room-button">RESTART ROOM</button><button class="text-button" id="failure-menu-button">MENU</button></div></div><div class="stats-panel"><div class="stat-label">PROGRESSION PRESERVED</div><div class="big-score" id="failure-room">01</div><div class="result-note" id="failure-save-note">THE CURRENT ROOM WILL REOPEN</div></div></div></section>
    <section class="screen result-screen failure-screen challenge-fail" data-screen="challenge-fail"><div class="result-layout"><div><div class="result-kicker">ROOM CHALLENGE / FAILED</div><h1 class="result-title fail-title">THE ROOM<br><span>SEALED.</span></h1><p class="result-lead fail-copy">The challenge was part of the lock. Your progression is safe; this room is not cleared.</p><div class="failure-detail" id="challenge-fail-detail"></div><div class="result-actions"><button class="primary-button" id="retry-challenge-button">RESTART ROOM</button><button class="text-button" id="challenge-menu-button">MENU</button></div></div><div class="stats-panel"><div class="stat-label">UNLOCKED ROOM</div><div class="big-score" id="challenge-room">04</div><div class="result-note">ONLY THIS ROOM RESTARTS</div></div></div></section>

    <section class="screen multiplayer-screen" data-screen="multiplayer"><div class="multi-shell"><div class="game-topline"><div class="game-slot">LOCAL TWO-PLAYER / SAME ROOM</div><button class="text-button exit-game" id="exit-multi">MENU</button></div><div class="multi-hud"><div><div class="hud-label">ROOM</div><div class="hud-value" id="multi-level">01</div></div><div class="timer-block"><div class="hud-label">SHARED TIME</div><div class="timer" id="multi-timer">01:00</div><div class="timer-track"><span class="timer-fill" id="multi-timer-fill"></span></div></div><div><div class="hud-label">TARGET</div><div class="hud-value" id="multi-target">500</div></div></div><div class="multi-corridor corridor" id="multi-corridor"><div class="corridor-depth"></div><div class="exit-gate"><div class="exit-label">EXIT / LOCKED</div></div><div class="multi-dot multi-dot-one"></div><div class="multi-dot multi-dot-two"></div><div class="corridor-status">TWO SIGNALS / ONE EXIT</div></div><div class="multi-grid" id="multi-grid"></div></div></section>
    <section class="screen result-screen" data-screen="multi-result"><div class="result-layout"><div><div class="result-kicker">LOCAL TWO-PLAYER / BOTH SIGNALS CLEAR</div><h1 class="result-title">BOTH<br><span>ESCAPED.</span></h1><p class="result-lead">The room could not close before either player reached the target.</p><div class="result-actions"><button class="primary-button" id="multi-again-button">PLAY AGAIN</button><button class="text-button" id="multi-menu-button">MENU</button></div></div><div class="stats-panel" id="multi-result-stats"></div></div></section>
    <section class="screen result-screen failure-screen" data-screen="multi-fail"><div class="result-layout"><div><div class="result-kicker">LOCAL TWO-PLAYER / ROOM SEALED</div><h1 class="result-title fail-title">THE ROOM<br><span>WON.</span></h1><p class="result-lead fail-copy">Both players need to reach the target. One signal became too legible or the shared clock ran out.</p><div class="failure-detail" id="multi-fail-detail"></div><div class="result-actions"><button class="primary-button" id="multi-retry-button">RESTART ROOM</button><button class="text-button" id="multi-fail-menu-button">MENU</button></div></div><div class="stats-panel"><div class="stat-label">SINGLE-PLAYER SAVE UNTOUCHED</div><div class="big-score" id="multi-fail-room">01</div><div class="result-note">LOCAL MATCH STATE ONLY</div></div></div></section>
  </main>
`;

class AudioSystem {
  constructor(game) {
    this.game = game;
    this.context = null;
    this.soundOn = true;
    this.speechOn = true;
    try {
      const prefs = JSON.parse(localStorage.getItem(PROFILE_KEY)) || {};
      this.soundOn = prefs.soundOn !== false;
      this.speechOn = prefs.speechOn !== false;
    } catch {}
  }

  activate() {
    try {
      if (!this.context) {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (Context) this.context = new Context();
      }
      if (this.context?.state === "suspended") this.context.resume().catch(() => {});
    } catch {
      this.context = null;
    }
  }

  tone(frequency, duration, type = "sine", volume = .035, delay = 0) {
    if (!this.soundOn) return;
    this.activate();
    if (!this.context) return;
    const now = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    oscillator.connect(gain).connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + .02);
  }

  click() { this.tone(460, .055, "square", .018); }
  direction() { this.tone(180, .08, "triangle", .028); }
  reveal() { this.tone(92, .18, "sine", .025); }
  bluff() { this.tone(320, .08, "square", .022); this.tone(740, .13, "triangle", .018, .08); }
  door() { this.tone(92, .42, "sawtooth", .025); this.tone(184, .58, "triangle", .02, .15); this.tone(420, .7, "sine", .016, .32); }
  failure() { this.tone(180, .22, "sawtooth", .028); this.tone(76, .45, "sine", .024, .18); }

  speak(text) {
    if (!this.speechOn || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = .76;
    utterance.pitch = .55;
    utterance.volume = .45;
    window.speechSynthesis.speak(utterance);
  }

  toggleSound() {
    this.soundOn = !this.soundOn;
    this.persist();
    this.game.renderPreferences();
    if (this.soundOn) this.click();
  }

  toggleSpeech() {
    this.speechOn = !this.speechOn;
    if (!this.speechOn && "speechSynthesis" in window) window.speechSynthesis.cancel();
    this.persist();
    this.game.renderPreferences();
  }

  persist() {
    const existing = (() => { try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}; } catch { return {}; } })();
    localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...existing, soundOn: this.soundOn, speechOn: this.speechOn }));
  }
}

class PredictionModel {
  constructor() { this.history = []; this.transitions = {}; }

  observe(action) {
    const previous = this.history.at(-1);
    if (previous) {
      this.transitions[previous] ||= {};
      this.transitions[previous][action] = (this.transitions[previous][action] || 0) + 1;
    }
    this.history.push(action);
  }

  predict(level, behavior) {
    const weights = Object.fromEntries(ACTIONS.map((action) => [action, 1]));
    this.history.forEach((action, index) => { weights[action] += Math.max(.15, 1 - (this.history.length - index) * .11); });
    const previous = this.history.at(-1);
    if (level >= 2 && previous && this.transitions[previous]) {
      Object.entries(this.transitions[previous]).forEach(([action, count]) => { weights[action] += count * 1.35; });
    }
    if (level >= 3) {
      if (behavior.greed > .55) {
        const favorite = ACTIONS.reduce((best, action) => behavior.counts[action] > behavior.counts[best] ? action : best, ACTIONS[0]);
        weights[favorite] += 1.2;
      }
      if (behavior.repetition > .3 && previous) weights[previous] += 1.1;
      if (behavior.risk > .5 && previous) weights[ACTIONS[(ACTIONS.indexOf(previous) + 1) % ACTIONS.length]] += .8;
    }
    if (level >= 4 && behavior.bluff > .12 && previous) {
      weights[previous] += 1.3;
      weights[ACTIONS[(ACTIONS.indexOf(previous) + 2) % ACTIONS.length]] += .55;
    }
    const ranked = ACTIONS.map((action) => [action, weights[action]]).sort((a, b) => b[1] - a[1]);
    const total = ranked.reduce((sum, item) => sum + item[1], 0);
    const raw = ranked[0][1] / total;
    const confidence = clamp(.45 + raw * .43 + (Math.random() - .5) * .08, .46, .88);
    return { action: ranked[0][0], confidence };
  }
}

class PredictedGame {
  constructor() {
    this.state = "intro";
    this.mode = "single";
    this.levelIndex = 0;
    this.level = LEVELS[0];
    this.currentSlot = null;
    this.save = null;
    this.multiSlot = null;
    this.multiSave = null;
    this.single = null;
    this.multi = null;
    this.clock = null;
    this.turnTimer = null;
    this.introTypingTimer = null;
    this.introEntered = false;
    this.escapeTimer = null;
    this.transitionTimer = null;
    this.audio = new AudioSystem(this);
    this.bind();
    this.renderPreferences();
    this.runIntro();
  }

  bind() {
    $("#intro-enter").addEventListener("click", () => this.enterIntro());
    $("#new-game-button").addEventListener("click", () => { this.audio.click(); this.renderNewSlots(); this.show("new-slots"); });
    $("#load-button").addEventListener("click", () => { this.audio.click(); this.renderLoadSlots(); this.show("load-slots"); });
    $("#multiplayer-button").addEventListener("click", () => { this.audio.click(); this.renderMultiSlots(); this.show("multi-slots"); });
    $("#sound-toggle").addEventListener("click", () => this.audio.toggleSound());
    $("#speech-toggle").addEventListener("click", () => this.audio.toggleSpeech());
    $$(".back-button").forEach((button) => button.addEventListener("click", () => { this.audio.click(); this.show(button.dataset.back); }));
    $("#exit-game").addEventListener("click", () => this.toMenu());
    $("#exit-multi").addEventListener("click", () => this.toMenu());
    $("#complete-menu-button").addEventListener("click", () => this.toMenu());
    $("#failure-menu-button").addEventListener("click", () => this.toMenu());
    $("#retry-room-button").addEventListener("click", () => { this.audio.click(); this.startSingle(this.levelIndex, false); });
    $("#retry-challenge-button").addEventListener("click", () => { this.audio.click(); this.startSingle(this.levelIndex, false); });
    $("#challenge-menu-button").addEventListener("click", () => this.toMenu());
    $("#next-room-button").addEventListener("click", () => { this.audio.click(); if (this.levelIndex < LEVELS.length - 1) this.startSingle(this.levelIndex + 1, false); else this.toMenu(); });
    $("#multi-again-button").addEventListener("click", () => { this.audio.click(); this.startMulti(this.levelIndex); });
    $("#multi-menu-button").addEventListener("click", () => this.toMenu());
    $("#multi-retry-button").addEventListener("click", () => { this.audio.click(); this.startMulti(this.levelIndex); });
    $("#multi-fail-menu-button").addEventListener("click", () => this.toMenu());
    $$(".choice").forEach((button) => button.addEventListener("click", () => this.pickSingle(button.dataset.action)));
    document.addEventListener("click", (event) => {
      const button = event.target.closest(".multi-choice");
      if (button) this.pickMulti(Number(button.dataset.player), button.dataset.action);
      const multiSlotButton = event.target.closest("[data-multi-slot-action]");
      if (multiSlotButton) this.selectMultiSlot(Number(multiSlotButton.dataset.slot), multiSlotButton.dataset.multiSlotAction);
      const slotButton = event.target.closest("[data-slot-action]");
      if (slotButton) this.selectSlot(Number(slotButton.dataset.slot), slotButton.dataset.slotAction);
    });
    document.addEventListener("keydown", (event) => {
      this.audio.activate();
      if (this.state === "intro" && event.key === "Enter") { event.preventDefault(); this.enterIntro(); return; }
      if (this.state === "room" && !event.repeat) {
        const index = KEYS.indexOf(event.key.toUpperCase());
        if (index > -1) { event.preventDefault(); this.pickSingle(ACTIONS[index]); }
      }
      if (this.state === "multiplayer" && !event.repeat) {
        const one = KEYS.indexOf(event.key.toUpperCase());
        const two = ARROW_KEYS.indexOf(event.key);
        if (one > -1) { event.preventDefault(); this.pickMulti(0, ACTIONS[one]); }
        if (two > -1) { event.preventDefault(); this.pickMulti(1, ACTIONS[two]); }
      }
    });
  }

  runIntro() {
    clearTimeout(this.introTypingTimer);
    const copy = $("#intro-copy");
    copy.textContent = "";
    copy.classList.add("is-typing");
    let index = 0;
    const typeNext = () => {
      if (this.introEntered || this.state !== "intro") return;
      copy.textContent = INTRO_NARRATIVE.slice(0, index);
      if (index >= INTRO_NARRATIVE.length) {
        copy.classList.remove("is-typing");
        return;
      }
      index += 1;
      this.introTypingTimer = setTimeout(typeNext, 24);
    };
    typeNext();
  }

  enterIntro() {
    if (this.introEntered || this.state !== "intro") return;
    this.introEntered = true;
    clearTimeout(this.introTypingTimer);
    const copy = $("#intro-copy");
    copy.textContent = INTRO_NARRATIVE;
    copy.classList.remove("is-typing");
    this.audio.activate();
    this.show("menu");
    $("#header-state").textContent = "MENU / LOCAL INSTANCE";
  }

  show(screen) {
    if (screen !== "transition") clearTimeout(this.transitionTimer);
    this.state = screen;
    $$(".screen").forEach((item) => item.classList.toggle("is-active", item.dataset.screen === screen));
    if (!["room", "multiplayer"].includes(screen)) this.stopClock();
    $("#header-state").textContent = screen === "menu" ? "MENU / LOCAL INSTANCE" : screen === "room" ? "ROOM SYSTEM ONLINE" : screen === "multiplayer" ? "TWO SIGNALS / LOCAL" : "PREDICTED";
  }

  toMenu() {
    this.stopClock();
    this.show("menu");
    this.renderMenuSave();
  }

  renderPreferences() {
    $("#sound-toggle").textContent = `SOUND ${this.audio.soundOn ? "ON" : "OFF"}`;
    $("#speech-toggle").textContent = `SPEECH ${this.audio.speechOn ? "ON" : "OFF"}`;
  }

  defaultSave(slot) {
    return {
      slot,
      unlockedRoom: 0,
      bestScore: 0,
      totalRuns: 0,
      totalBluffs: 0,
      bestBluffStreak: 0,
      personality: { greed: 0, repetition: 0, risk: 0, bluff: 0, sequence: "NONE YET" },
      challengeHistory: [],
      lastPlayed: "NEW SLOT",
    };
  }

  readSlot(slot) {
    try {
      const stored = JSON.parse(localStorage.getItem(`\${SLOT_PREFIX}\${slot}`));
      return stored ? { ...this.defaultSave(slot), ...stored, personality: { ...this.defaultSave(slot).personality, ...(stored.personality || {}) } } : null;
    } catch { return null; }
  }

  defaultMultiSave(slot) {
    return {
      slot,
      unlockedRoom: 0,
      totalMatches: 0,
      bestCombinedScore: 0,
      lastPlayed: "NEW SLOT",
    };
  }

  readMultiSlot(slot) {
    try {
      const stored = JSON.parse(localStorage.getItem(`\${MULTI_SLOT_PREFIX}\${slot}`));
      return stored ? { ...this.defaultMultiSave(slot), ...stored } : null;
    } catch { return null; }
  }

  writeMultiSlot() {
    if (!this.multiSlot || !this.multiSave) return;
    this.multiSave.lastPlayed = new Date().toISOString().slice(0, 10);
    try { localStorage.setItem(`\${MULTI_SLOT_PREFIX}\${this.multiSlot}`, JSON.stringify(this.multiSave)); } catch {}
  }

  multiSlotCard(slot) {
    const save = this.readMultiSlot(slot);
    if (!save) {
      return `<article class="slot-card is-empty multi-slot-card"><div class="slot-number">0\${slot}</div><div><div class="slot-title">MULTIPLAYER SLOT \${slot}</div><div class="slot-copy">EMPTY LOCAL MEMORY / START AT ROOM 01</div></div><button class="secondary-button" data-multi-slot-action="new" data-slot="\${slot}">NEW MATCH</button></article>`;
    }
    return `<article class="slot-card multi-slot-card"><div class="slot-number">0\${slot}</div><div class="slot-details"><div class="slot-title">MULTIPLAYER SLOT \${slot}</div><div class="slot-copy">ROOM \${pad(save.unlockedRoom + 1)} / BEST \${save.bestCombinedScore}</div><div class="slot-copy">\${save.totalMatches} MATCHES / \${save.lastPlayed}</div></div><div class="slot-actions"><button class="secondary-button" data-multi-slot-action="load" data-slot="\${slot}">LOAD</button><button class="text-button" data-multi-slot-action="new" data-slot="\${slot}">RESET</button></div></article>`;
  }

  renderMultiSlots() {
    $("#multi-slot-grid").innerHTML = [1, 2, 3].map((slot) => this.multiSlotCard(slot)).join("");
  }

  selectMultiSlot(slot, action) {
    this.audio.click();
    if (action === "new") {
      this.multiSlot = slot;
      this.multiSave = this.defaultMultiSave(slot);
      this.writeMultiSlot();
      this.runTransition("MULTIPLAYER", () => this.startMulti(0, true));
      return;
    }
    const loaded = this.readMultiSlot(slot);
    if (!loaded) return;
    this.multiSlot = slot;
    this.multiSave = loaded;
    this.runTransition("LOAD MULTIPLAYER", () => this.startMulti(this.multiSave.unlockedRoom || 0, false));
  }

  writeSlot() {
    if (!this.currentSlot || !this.save) return;
    this.save.lastPlayed = new Date().toISOString().slice(0, 10);
    try { localStorage.setItem(`${SLOT_PREFIX}${this.currentSlot}`, JSON.stringify(this.save)); } catch {}
    this.renderMenuSave();
  }

  readPreferences() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {}; } catch { return {}; }
  }

  renderMenuSave() {
    $("#menu-save").textContent = this.currentSlot ? `SLOT ${this.currentSlot} / ROOM ${pad((this.save?.unlockedRoom || 0) + 1)} UNLOCKED` : "NO SLOT LOADED";
  }

  slotCard(slot, mode) {
    const save = this.readSlot(slot);
    if (!save) return `<article class="slot-card is-empty"><div class="slot-number">0${slot}</div><div><div class="slot-title">SAVE SLOT ${slot}</div><div class="slot-copy">EMPTY LOCAL MEMORY</div></div><button class="secondary-button" data-slot-action="${mode}" data-slot="${slot}" ${mode === "load" ? "disabled" : ""}>${mode === "load" ? "EMPTY" : "USE SLOT"}</button></article>`;
    const profile = this.archetypeFromSave(save);
    return `<article class="slot-card"><div class="slot-number">0${slot}</div><div class="slot-details"><div class="slot-title">SAVE SLOT ${slot}</div><div class="slot-copy">ROOM ${pad(save.unlockedRoom + 1)} / BEST ${save.bestScore} / ${profile}</div><div class="slot-copy">${save.totalRuns} RUNS / ${save.totalBluffs} BLUFFS / ${save.lastPlayed}</div></div><button class="secondary-button" data-slot-action="${mode}" data-slot="${slot}">${mode === "load" ? "LOAD" : "OVERWRITE"}</button></article>`;
  }

  renderNewSlots() { $("#new-slot-grid").innerHTML = [1, 2, 3].map((slot) => this.slotCard(slot, "new")).join(""); }
  renderLoadSlots() { $("#load-slot-grid").innerHTML = [1, 2, 3].map((slot) => this.slotCard(slot, "load")).join(""); }

  selectSlot(slot, action) {
    this.audio.click();
    if (action === "new") {
      this.currentSlot = slot;
      this.save = this.defaultSave(slot);
      this.writeSlot();
      this.runTransition("NEW GAME", () => this.startSingle(0, true));
    } else {
      const loaded = this.readSlot(slot);
      if (!loaded) return;
      this.currentSlot = slot;
      this.save = loaded;
      this.runTransition("LOAD", () => this.startSingle(this.save.unlockedRoom || 0, false));
    }
  }

  runTransition(label, callback) {
    clearTimeout(this.escapeTimer);
    clearTimeout(this.transitionTimer);
    $("#transition-label").textContent = `${label} / ROOM SYSTEM`;
    this.show("transition");
    this.transitionTimer = setTimeout(() => {
      this.transitionTimer = null;
      if (this.state === "transition") callback();
    }, 1800);
  }

  personalityStats() {
    const actions = this.single?.actions || [];
    const total = actions.length || 1;
    const counts = Object.fromEntries(ACTIONS.map((action) => [action, actions.filter((item) => item === action).length]));
    const repeats = actions.reduce((sum, action, index) => sum + (index > 0 && action === actions[index - 1] ? 1 : 0), 0);
    const transitions = {};
    actions.slice(1).forEach((action, index) => {
      const pair = `${actions[index]} → ${action}`;
      transitions[pair] = (transitions[pair] || 0) + 1;
    });
    return {
      total,
      counts,
      greed: (this.single?.highestChoices || 0) / total,
      repetition: repeats / total,
      risk: (this.single?.lowerChoices || 0) / total,
      bluff: (this.single?.bluffs || 0) / total,
      sequence: Object.entries(transitions).sort((a, b) => b[1] - a[1])[0]?.[0] || "NONE YET",
    };
  }

  archetypeFromStats(stats) {
    if (stats.greed >= .7) return "THE GREEDY";
    if (stats.repetition >= .45) return "THE REPEATER";
    if (stats.bluff >= .2) return "THE CONTRARIAN";
    if (stats.risk >= .55) return "THE GAMBLER";
    if (stats.repetition <= .12 && stats.risk >= .35) return "THE UNPREDICTABLE";
    return "THE OPPORTUNIST";
  }

  archetypeFromSave(save) {
    const stats = { greed: (save.personality?.greed || 0) / 100, repetition: (save.personality?.repetition || 0) / 100, risk: (save.personality?.risk || 0) / 100, bluff: (save.personality?.bluff || 0) / 100 };
    return this.archetypeFromStats(stats);
  }

  challengeFor() {
    if (this.levelIndex < 3) return null;
    const saveProfile = this.save?.personality || {};
    if (saveProfile.greed >= 70) return CHALLENGES.find((challenge) => challenge.id === "no-greed-streak");
    if (saveProfile.repetition >= 45) return CHALLENGES.find((challenge) => challenge.id === "no-repeats");
    return CHALLENGES[(this.levelIndex - 3) % CHALLENGES.length];
  }

  startSingle(index, newRun = false) {
    this.mode = "single";
    this.levelIndex = clamp(index, 0, LEVELS.length - 1);
    this.level = LEVELS[this.levelIndex];
    if (!this.save) {
      this.currentSlot = 1;
      this.save = this.readSlot(1) || this.defaultSave(1);
    }
    if (newRun) {
      this.save.totalRuns = (this.save.totalRuns || 0) + 1;
      this.save.challengeHistory ||= [];
    }
    this.single = {
      model: new PredictionModel(),
      score: 0,
      trace: 0,
      turn: 0,
      actions: [],
      predictionHits: 0,
      bluffs: 0,
      currentBluffStreak: 0,
      longestBluffStreak: 0,
      highestChoices: 0,
      lowerChoices: 0,
      prediction: null,
      rewards: {},
      challenge: this.challengeFor(),
      challengeProgress: 0,
      challengeFailed: false,
      challengeData: { highestStreak: 0, repeatStreak: 0, follow: 0, baitReady: false },
    };
    this.show("room");
    this.renderSingleRoom();
    this.startClock();
    this.nextSingleTurn();
    this.writeSlot();
  }

  startClock() {
    this.stopClock();
    const started = Date.now();
    this.clock = setInterval(() => {
      const left = Math.max(0, RUN_SECONDS - (Date.now() - started) / 1000);
      const id = this.mode === "single" ? "timer" : "multi-timer";
      const fill = this.mode === "single" ? "timer-fill" : "multi-timer-fill";
      $(`#${id}`).textContent = `00:${String(Math.ceil(left)).padStart(2, "0")}`;
      $(`#${fill}`).style.transform = `scaleX(${left / RUN_SECONDS})`;
      $(`#${id}`).classList.toggle("is-urgent", left < 12);
      if (left <= 0) this.mode === "single" ? this.failSingle("timeout") : this.failMulti("timeout");
    }, 100);
  }

  stopClock() {
    clearInterval(this.clock);
    clearTimeout(this.turnTimer);
    this.clock = null;
    this.turnTimer = null;
  }

  behaviorFor(modelState = this.single) {
    const actions = modelState?.actions || [];
    const total = actions.length || 1;
    const counts = Object.fromEntries(ACTIONS.map((action) => [action, actions.filter((item) => item === action).length]));
    const repeats = actions.reduce((sum, action, index) => sum + (index > 0 && action === actions[index - 1] ? 1 : 0), 0);
    return { counts, greed: (modelState?.highestChoices || 0) / total, repetition: repeats / total, risk: (modelState?.lowerChoices || 0) / total, bluff: (modelState?.bluffs || 0) / total };
  }

  generateRewards() {
    const confidence = this.single.prediction.confidence;
    const variation = Math.round(Math.random() * (this.level.rewardMax - this.level.rewardMin));
    const predictedReward = this.level.rewardMin + Math.round(variation * .42 + confidence * (this.level.rewardMax - this.level.rewardMin) * .58);
    const spread = this.level.gap + Math.round(confidence * 25);
    const first = clamp(predictedReward - Math.round(spread * .44) + Math.round((Math.random() - .5) * 8), 14, predictedReward - 1);
    const second = clamp(predictedReward - Math.round(spread * .9) + Math.round((Math.random() - .5) * 8), 10, first - 1);
    const alternatives = [first, second].sort(() => Math.random() - .5);
    this.single.rewards = { [this.single.prediction.action]: predictedReward };
    otherActions(this.single.prediction.action).forEach((action, index) => { this.single.rewards[action] = alternatives[index]; });
  }

  nextSingleTurn() {
    if (this.state !== "room") return;
    this.single.turn += 1;
    this.single.prediction = this.single.model.predict(this.level.level, this.behaviorFor());
    this.generateRewards();
    this.audio.reveal();
    this.renderSingleTurn();
  }

  renderSingleRoom() {
    $("#game-slot").textContent = `SLOT ${this.currentSlot} / SINGLE PLAYER`;
    $("#level-readout").textContent = pad(this.level.level);
    $("#room-level-name").textContent = this.level.name;
    $("#room-title").textContent = this.level.name;
    $("#goal-copy").textContent = this.level.target;
    $("#target-score").textContent = this.level.target;
    $("#score").textContent = "0";
    $("#trace-value").textContent = "0 / 100";
    $("#trace-fill").style.transform = "scaleX(0)";
    $("#timer").textContent = "01:00";
    $("#timer-fill").style.transform = "scaleX(1)";
    $("#feedback").className = "feedback";
    $("#exit-gate").classList.remove("is-unlocked");
    $("#exit-gate").querySelector(".exit-label").textContent = "EXIT / LOCKED";
    $("#corridor").classList.remove("is-escaping", "is-advancing");
    $("#player-dot").style.left = "50%";
    $("#player-dot").style.bottom = "18%";
    $("#corridor-status").textContent = "POSITION / CENTER";
    this.renderChallenge();
    this.renderHistory();
  }

  renderSingleTurn() {
    $("#turn-readout").textContent = `TURN ${pad(this.single.turn)}`;
    $("#model-message").textContent = `YOU'LL GO ${this.single.prediction.action}`;
    $("#confidence").textContent = `${Math.round(this.single.prediction.confidence * 100)}%`;
    $("#confidence").classList.toggle("is-low", this.single.prediction.confidence < .65);
    $$(".choice").forEach((button) => {
      const action = button.dataset.action;
      button.disabled = false;
      button.classList.remove("is-picked", "is-predicted");
      button.querySelector(".choice-reward").textContent = `+${this.single.rewards[action]}`;
      if (action === this.single.prediction.action) button.classList.add("is-predicted");
    });
    $("#feedback").className = "feedback";
    this.renderHistory();
    this.renderChallenge();
  }

  pickSingle(action) {
    if (this.state !== "room" || !this.single?.prediction) return;
    const button = $(`.choice[data-action="${action}"]`);
    if (!button || button.disabled) return;
    $$(".choice").forEach((item) => { item.disabled = true; });
    button.classList.add("is-picked");
    this.audio.direction();
    const predicted = action === this.single.prediction.action;
    const confident = this.single.prediction.confidence >= .65;
    const highestReward = Math.max(...Object.values(this.single.rewards));
    const basePoints = this.single.rewards[action];
    const highest = basePoints === highestReward;
    const repeated = this.single.actions.at(-1) === action;
    let traceDelta = predicted ? Math.round(6 + this.single.prediction.confidence * 12) : 0;
    if (repeated) traceDelta += 3;
    if (highest) traceDelta += 2;
    let bluffBonus = 0;
    if (highest) this.single.highestChoices += 1;
    if (basePoints < highestReward) this.single.lowerChoices += 1;
    if (predicted) {
      this.single.currentBluffStreak = 0;
      this.single.challengeData.follow = confident ? this.single.challengeData.follow + 1 : this.single.challengeData.follow;
    } else if (confident) {
      this.single.currentBluffStreak += 1;
      this.single.longestBluffStreak = Math.max(this.single.longestBluffStreak, this.single.currentBluffStreak);
      this.single.bluffs += 1;
      bluffBonus = Math.min(20, [10, 12, 15][this.single.currentBluffStreak - 1] || 20);
      traceDelta = Math.min(-1, traceDelta - 3);
      this.audio.bluff();
    } else {
      this.single.currentBluffStreak = 0;
    }
    const totalPoints = basePoints + bluffBonus;
    this.single.score += totalPoints;
    this.single.trace = clamp(this.single.trace + traceDelta, 0, 100);
    this.single.actions.push(action);
    this.single.model.observe(action);
    if (predicted) this.single.predictionHits += 1;
    this.updateChallenge(action, predicted, confident, highest, repeated);
    this.renderSingleHud();
    this.moveSinglePlayer(action);
    this.showFeedback(predicted ? "I KNEW YOU WOULD." : confident ? "YOU FOOLED ME." : "THE MODEL HESITATED.", predicted ? `+${basePoints} / TRACE +${Math.max(0, traceDelta)}` : confident ? `+${basePoints} / BLUFF +${bluffBonus} / TRACE ${traceDelta}` : `+${basePoints} / THE READ WAS NOT CERTAIN`, totalPoints, predicted);
    if (this.single.challengeFailed) {
      this.turnTimer = setTimeout(() => this.failChallenge(), 650);
      return;
    }
    if (this.single.trace >= 100) {
      this.turnTimer = setTimeout(() => this.failSingle("trace"), 650);
      return;
    }
    if (this.single.score >= this.level.target) {
      this.turnTimer = setTimeout(() => this.completeSingleRoom(), 850);
      return;
    }
    this.turnTimer = setTimeout(() => this.nextSingleTurn(), 850);
  }

  updateChallenge(action, predicted, confident, highest, repeated) {
    const challenge = this.single.challenge;
    if (!challenge) return;
    const data = this.single.challengeData;
    if (challenge.id === "no-bluff-streak") {
      data.repeatStreak = confident && !predicted ? data.repeatStreak + 1 : 0;
      if (data.repeatStreak >= 3) this.single.challengeFailed = true;
    }
    if (challenge.id === "no-greed-streak") {
      data.highestStreak = highest ? data.highestStreak + 1 : 0;
      if (data.highestStreak >= 3) this.single.challengeFailed = true;
    }
    if (challenge.id === "no-repeats") {
      data.repeatStreak = repeated ? data.repeatStreak + 1 : 0;
      if (data.repeatStreak >= 3) this.single.challengeFailed = true;
    }
    if (challenge.id === "follow-me") this.single.challengeProgress = Math.min(2, data.follow);
    if (challenge.id === "break-model" && !predicted && confident && this.single.prediction.confidence >= .8) this.single.challengeProgress = 1;
    if (challenge.id === "bait") {
      if (!data.baitReady && predicted && this.single.prediction.confidence >= .75) data.baitReady = true;
      else if (data.baitReady && !predicted && confident && this.single.prediction.confidence >= .75) this.single.challengeProgress = 1;
      else if (data.baitReady && predicted) data.baitReady = false;
    }
    if (challenge.id === "no-bluff-streak" || challenge.id === "no-greed-streak" || challenge.id === "no-repeats") this.single.challengeProgress = data.repeatStreak || data.highestStreak || 0;
  }

  challengeComplete() {
    const challenge = this.single.challenge;
    if (!challenge) return true;
    if (this.single.challengeFailed) return false;
    if (["no-bluff-streak", "no-greed-streak", "no-repeats"].includes(challenge.id)) return true;
    return this.single.challengeProgress >= (challenge.target || 1);
  }

  renderChallenge() {
    const challenge = this.single.challenge;
    if (!challenge) {
      $("#challenge-name").textContent = "SYSTEM LEARNING";
      $("#challenge-copy").textContent = "Explicit challenges begin after Room 3.";
      $("#challenge-progress").textContent = "NOT ACTIVE";
      $("#challenge-card").classList.remove("is-active");
      return;
    }
    $("#challenge-card").classList.add("is-active");
    $("#challenge-name").textContent = challenge.name;
    $("#challenge-copy").textContent = challenge.rule;
    $("#challenge-progress").textContent = challenge.id === "no-bluff-streak" ? `${this.single.challengeData.repeatStreak} / 3 BLUFFS IN A ROW` : challenge.id === "no-greed-streak" ? `${this.single.challengeData.highestStreak} / 3 HIGHEST REWARDS IN A ROW` : challenge.id === "no-repeats" ? `${this.single.challengeData.repeatStreak} / 3 SAME DIRECTIONS IN A ROW` : `${this.single.challengeProgress} / ${challenge.target || 1} COMPLETE`;
  }

  renderSingleHud() {
    $("#score").textContent = this.single.score;
    $("#trace-value").textContent = `${this.single.trace} / 100`;
    $("#trace-fill").style.transform = `scaleX(${this.single.trace / 100})`;
    $("#trace-fill").classList.toggle("is-danger", this.single.trace >= 70);
    $("#bluff-streak").textContent = this.single.currentBluffStreak;
    this.renderChallenge();
  }

  renderHistory() {
    const recent = this.single.actions.slice(-9);
    $("#history-dots").innerHTML = recent.length ? recent.map((action) => `<span class="history-dot ${action.toLowerCase()}" title="${action}"></span>`).join("") : `<span class="history-empty">NO MOVES YET</span>`;
  }

  moveSinglePlayer(action) {
    $("#player-dot").style.left = { LEFT: "18%", CENTER: "50%", RIGHT: "82%" }[action];
    $("#player-dot").style.bottom = "31%";
    $("#corridor").classList.remove("is-advancing");
    $("#player-dot").classList.remove("is-moving");
    requestAnimationFrame(() => { $("#corridor").classList.add("is-advancing"); $("#player-dot").classList.add("is-moving"); });
    $("#corridor-status").textContent = `POSITION / ${action} / MOVING FORWARD`;
  }

  showFeedback(title, copy, points, predicted) {
    $("#feedback").className = `feedback is-visible ${predicted ? "is-loss" : "is-win"}`;
    $("#feedback-title").textContent = title;
    $("#feedback-copy").textContent = copy;
    $("#feedback-score").textContent = `+${points} PTS`;
  }

  failChallenge() {
    this.stopClock();
    this.audio.failure();
    this.audio.speak("The room sealed.");
    this.save.challengeHistory = [...(this.save.challengeHistory || []), { room: this.level.level, id: this.single.challenge?.id, success: false }].slice(-20);
    this.writeSlot();
    $("#challenge-room").textContent = pad(this.level.level);
    $("#challenge-fail-detail").textContent = `${this.single.challenge.name} FAILED. PROGRESSION IS SAFE; ROOM ${pad(this.level.level)} RESTARTS.`;
    this.show("challenge-fail");
  }

  completeSingleRoom() {
    if (this.state !== "room") return;
    this.stopClock();
    if (!this.challengeComplete()) { this.failChallenge(); return; }
    const bonus = this.single.challenge?.bonus || 0;
    this.single.score += bonus;
    this.save.unlockedRoom = Math.max(this.save.unlockedRoom || 0, Math.min(LEVELS.length - 1, this.levelIndex + 1));
    this.save.bestScore = Math.max(this.save.bestScore || 0, this.single.score);
    this.save.totalBluffs = (this.save.totalBluffs || 0) + this.single.bluffs;
    this.save.bestBluffStreak = Math.max(this.save.bestBluffStreak || 0, this.single.longestBluffStreak);
    const stats = this.personalityStats();
    this.save.personality = { greed: Math.round(stats.greed * 100), repetition: Math.round(stats.repetition * 100), risk: Math.round(stats.risk * 100), bluff: Math.round(stats.bluff * 100), sequence: stats.sequence };
    if (this.single.challenge) this.save.challengeHistory = [...(this.save.challengeHistory || []), { room: this.level.level, id: this.single.challenge.id, success: true }].slice(-20);
    this.writeSlot();
    $("#exit-gate").classList.add("is-unlocked");
    $("#exit-gate").querySelector(".exit-label").textContent = "EXIT / UNLOCKED";
    $("#corridor").classList.add("is-escaping");
    $("#corridor-status").textContent = "EXITING ROOM";
    this.audio.door();
    this.show("escape");
    this.escapeTimer = setTimeout(() => { this.renderComplete(); this.show("complete"); }, 1300);
  }

  failSingle(reason) {
    if (this.state !== "room") return;
    this.stopClock();
    this.audio.failure();
    this.audio.speak(reason === "timeout" ? "You are still inside." : "You were predictable.");
    $("#failure-room").textContent = pad(this.level.level);
    $("#failure-kicker").textContent = reason === "timeout" ? "CLOCK / ROOM ATTEMPT ENDED" : "TRACE LIMIT / ROOM ATTEMPT ENDED";
    $("#failure-title").innerHTML = reason === "timeout" ? "THE ROOM<br><span>SEALED.</span>" : "THE AI<br><span>FIGURED YOU OUT.</span>";
    $("#failure-copy").textContent = reason === "timeout" ? "The sixty-second window closed before the escape score reached the lock." : "Your movement became legible. The room no longer needs to guess.";
    $("#failure-detail").textContent = reason === "timeout" ? `TARGET ${this.level.target} / CURRENT ${this.single.score}.` : `TRACE ${this.single.trace} / 100. CURRENT ROOM ${pad(this.level.level)} REOPENS.`;
    $("#failure-save-note").textContent = `ROOM ${pad(this.level.level)} REMAINS UNLOCKED`;
    this.show("failure");
  }

  renderComplete() {
    const stats = this.personalityStats();
    const accuracy = this.single.actions.length ? Math.round((this.single.predictionHits / this.single.actions.length) * 100) : 0;
    $("#complete-score").textContent = this.single.score;
    $("#complete-profile").textContent = this.archetypeFromStats(stats);
    $("#complete-trace").textContent = `${this.single.trace} / 100`;
    $("#complete-bluffs").textContent = this.single.bluffs;
    $("#complete-accuracy").textContent = `${accuracy}%`;
    $("#complete-turns").textContent = this.single.actions.length;
    $("#complete-lead").textContent = this.levelIndex >= LEVELS.length - 1 ? "The final room opened. The system has no further corridor to offer." : `Room ${pad(this.level.level)} is clear. Room ${pad(this.level.level + 1)} is now unlocked.`;
    $("#next-room-button").textContent = this.levelIndex >= LEVELS.length - 1 ? "RETURN TO MENU" : `ENTER ROOM ${pad(this.level.level + 1)}`;
    $("#profile-metrics").innerHTML = `<div class="stat-label">BEHAVIOUR READ</div><div class="profile-grid"><span>GREED <b>${Math.round(stats.greed * 100)}%</b></span><span>REPETITION <b>${Math.round(stats.repetition * 100)}%</b></span><span>RISK <b>${Math.round(stats.risk * 100)}%</b></span><span>BLUFF <b>${this.single.bluffs}</b></span><span>SEQUENCE <b>${stats.sequence}</b></span></div>`;
    $("#complete-challenge").innerHTML = this.single.challenge ? `<div class="stat-label">CHALLENGE</div><div class="stat-value">+${this.single.challenge.bonus} BONUS / ${this.single.challenge.name}</div>` : "";
  }

  createMultiPlayer(name, keySet) {
    return { name, keySet, color: name === "PLAYER 1" ? "one" : "two", model: new PredictionModel(), score: 0, trace: 0, actions: [], predictionHits: 0, bluffs: 0, bluffStreak: 0, highestChoices: 0, lowerChoices: 0, rewards: {}, prediction: null, locked: false, lastResult: "WAITING" };
  }

  startMulti(index = 0, newMatch = false) {
    this.mode = "multi";
    if (!this.multiSave) {
      this.multiSlot = this.multiSlot || 1;
      this.multiSave = this.readMultiSlot(this.multiSlot) || this.defaultMultiSave(this.multiSlot);
    }
    this.levelIndex = clamp(index, 0, LEVELS.length - 1);
    this.level = LEVELS[this.levelIndex];
    if (newMatch) {
      this.multiSave.totalMatches = (this.multiSave.totalMatches || 0) + 1;
      this.writeMultiSlot();
    }
    this.multi = { players: [this.createMultiPlayer("PLAYER 1", KEYS), this.createMultiPlayer("PLAYER 2", ARROW_KEYS)], challenge: this.levelIndex >= 3 ? CHALLENGES[(this.levelIndex - 3) % CHALLENGES.length] : null, challengeData: { progress: 0, bluffStreak: [0, 0], greedStreak: [0, 0], repeatStreak: [0, 0], baitReady: [false, false] }, challengeFailed: false };
    this.show("multiplayer");
    $("#multi-level").textContent = pad(this.level.level);
    $("#multi-target").textContent = this.level.target;
    $("#multi-timer").textContent = "01:00";
    $("#multi-timer-fill").style.transform = "scaleX(1)";
    this.renderMulti();
    this.multi.players.forEach((_, playerIndex) => this.nextMultiTurn(playerIndex));
    this.renderMulti();
    this.startClock();
  }

  nextMultiTurn(index) {
    const player = this.multi.players[index];
    const behavior = this.behaviorFor(player);
    player.prediction = player.model.predict(this.level.level, behavior);
    const highest = this.level.rewardMin + Math.round(Math.random() * (this.level.rewardMax - this.level.rewardMin) * .35 + player.prediction.confidence * (this.level.rewardMax - this.level.rewardMin) * .65);
    const spread = this.level.gap + Math.round(player.prediction.confidence * 22);
    const alternatives = [Math.max(14, highest - Math.round(spread * .45)), Math.max(10, highest - spread)].sort(() => Math.random() - .5);
    player.rewards = { [player.prediction.action]: highest };
    otherActions(player.prediction.action).forEach((action, actionIndex) => { player.rewards[action] = alternatives[actionIndex]; });
    player.locked = false;
  }

  pickMulti(index, action) {
    if (this.state !== "multiplayer") return;
    const player = this.multi.players[index];
    if (!player || player.locked || !player.prediction) return;
    player.locked = true;
    const predicted = action === player.prediction.action;
    const confident = player.prediction.confidence >= .65;
    const highestReward = Math.max(...Object.values(player.rewards));
    const base = player.rewards[action];
    const highest = base === highestReward;
    const repeat = player.actions.at(-1) === action;
    let traceDelta = predicted ? Math.round(6 + player.prediction.confidence * 12) : 0;
    if (repeat) traceDelta += 3;
    if (highest) traceDelta += 2;
    let bonus = 0;
    if (predicted) player.bluffStreak = 0;
    else if (confident) { player.bluffStreak += 1; player.bluffs += 1; bonus = Math.min(20, [10, 12, 15][player.bluffStreak - 1] || 20); traceDelta = Math.min(-1, traceDelta - 3); }
    else player.bluffStreak = 0;
    if (highest) player.highestChoices += 1;
    if (base < highestReward) player.lowerChoices += 1;
    player.score += base + bonus;
    player.trace = clamp(player.trace + traceDelta, 0, 100);
    player.actions.push(action);
    player.model.observe(action);
    if (predicted) player.predictionHits += 1;
    this.moveMultiPlayer(index, action);
    if (player.trace >= 100) { this.failMulti("trace", player.name); return; }
    this.audio.direction();
    this.renderMulti();
    if (this.multi.players.every((item) => item.locked)) {
      if (this.multi.players.every((item) => item.score >= this.level.target)) { this.completeMulti(); return; }
      this.turnTimer = setTimeout(() => { this.multi.players.forEach((_, playerIndex) => this.nextMultiTurn(playerIndex)); this.renderMulti(); }, 650);
    }
  }

  renderMulti() {
    $("#multi-grid").innerHTML = this.multi.players.map((player, index) => `<article class="multi-player ${player.color}"><div class="multi-player-head"><div><div class="eyebrow">${player.name} / ${index === 0 ? "A S D" : "ARROWS"}</div><div class="multi-player-score">${player.score} <span>/ ${this.level.target}</span></div></div><div class="multi-trace"><span>TRACE</span><b>${player.trace}</b></div></div><div class="multi-prediction">THE AI THINKS <strong>${player.prediction?.action || "CALIBRATING"}</strong><span>${player.prediction ? `${Math.round(player.prediction.confidence * 100)}%` : ""}</span></div><div class="multi-choices">${ACTIONS.map((action, actionIndex) => `<button class="multi-choice ${action === player.prediction?.action ? "is-predicted" : ""}" data-player="${index}" data-action="${action}" ${player.locked ? "disabled" : ""}><small>${player.keySet[actionIndex]}</small><b>${action}</b><strong>+${player.rewards[action] || 0}</strong></button>`).join("")}</div><div class="multi-foot"><span>BLUFF STREAK ${player.bluffStreak}</span><span>${player.actions.slice(-5).join(" / ") || "NO MOVES"}</span></div></article>`).join("");
  }

  moveMultiPlayer(index, action) {
    const dot = index === 0 ? $(".multi-dot-one") : $(".multi-dot-two");
    if (!dot) return;
    dot.style.left = { LEFT: index === 0 ? "18%" : "24%", CENTER: "50%", RIGHT: index === 0 ? "82%" : "76%" }[action];
    dot.style.bottom = index === 0 ? "31%" : "37%";
    $("#multi-corridor").classList.remove("is-advancing");
    requestAnimationFrame(() => $("#multi-corridor").classList.add("is-advancing"));
  }

  completeMulti() {
    if (this.state !== "multiplayer") return;
    this.stopClock();
    this.audio.door();
    const combinedScore = this.multi.players.reduce((sum, player) => sum + player.score, 0);
    this.multiSave.unlockedRoom = Math.max(this.multiSave.unlockedRoom || 0, Math.min(LEVELS.length - 1, this.levelIndex + 1));
    this.multiSave.bestCombinedScore = Math.max(this.multiSave.bestCombinedScore || 0, combinedScore);
    this.writeMultiSlot();
    $("#multi-result-stats").innerHTML = `${this.multi.players.map((player) => `<div class="multi-result-row"><span>${player.name}</span><strong>${player.score}</strong><small>TRACE ${player.trace} / BLUFFS ${player.bluffs}</small></div>`).join("")}<div class="multi-result-row"><span>SHARED MEMORY</span><strong>ROOM ${pad(this.multiSave.unlockedRoom + 1)}</strong><small>MULTIPLAYER SLOT ${this.multiSlot} / PROGRESSION SAVED</small></div>`;
    this.show("multi-result");
  }

  failMulti(reason, playerName = "") {
    if (!["multiplayer"].includes(this.state)) return;
    this.stopClock();
    this.audio.failure();
    $("#multi-fail-room").textContent = pad(this.level.level);
    $("#multi-fail-detail").textContent = reason === "timeout" ? `SHARED CLOCK EXPIRED. TARGET ${this.level.target} / ${this.multi.players.map((player) => `${player.name} ${player.score}`).join(" / ")}.` : `${playerName || "A PLAYER"} REACHED TRACE 100. THE MATCH RESTARTS IN ROOM ${pad(this.level.level)}.`;
    this.show("multi-fail");
  }
}

new PredictedGame();
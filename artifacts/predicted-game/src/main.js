const ACTIONS = ["LEFT", "CENTER", "RIGHT"];
const KEYS = ["A", "S", "D"];
const STORAGE_KEY = "predicted:profile";
const LAST_RUN_KEY = "predicted:last-run";
const RUN_SECONDS = 60;
const REWARDS = [10, 20, 35];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const choice = (items) => items[Math.floor(Math.random() * items.length)];

document.querySelector("#root").innerHTML = `
  <main class="app">
    <header class="masthead">
      <div class="wordmark" data-testid="text-wordmark">PRE<span>D</span>ICTED</div>
      <div class="status-chip" data-testid="status-system">model online</div>
    </header>

    <section class="screen is-active" data-screen="start" aria-labelledby="start-title">
      <div class="start-grid">
        <div class="start-copy">
          <div class="eyebrow">a decision game / 01</div>
          <h1 id="start-title">Can you<br><em>fool it?</em></h1>
           <p class="lead">Make choices. Watch what I learn. Three directions, one imperfect model, and sixty seconds to become someone it cannot predict.</p>
          <div class="start-actions">
            <button class="primary-button" id="start-button" data-testid="button-start">Begin the test</button>
            <div class="micro">60 seconds / no reset</div>
          </div>
        </div>
        <aside class="brief">
          <h2>It does not need to be right.</h2>
          <p>It only needs to be right often enough that you start playing against yourself.</p>
          <ul class="brief-list">
            <li><strong>A</strong> LEFT</li>
            <li><strong>S</strong> CENTER</li>
            <li><strong>D</strong> RIGHT</li>
          </ul>
        </aside>
      </div>
    </section>

    <section class="screen" data-screen="game" aria-labelledby="game-title">
      <div class="game-top">
        <div class="round-wrap">
          <div class="round-label">turn</div>
          <div class="round-number" id="round" data-testid="text-round">00</div>
        </div>
        <div class="timer-wrap">
          <div class="timer" id="timer" data-testid="status-timer">01:00</div>
          <div class="progress-track" aria-hidden="true"><span class="progress-bar"></span></div>
        </div>
        <div class="score-wrap">
          <div class="score" id="score" data-testid="text-score">000</div>
          <div class="score-label">score</div>
        </div>
      </div>
      <div class="model-strip">
         <div class="model-copy">
          <div class="model-mark" aria-hidden="true">P</div>
           <div>
             <div class="model-label">prediction</div>
             <p id="model-prediction" data-testid="status-prediction">—</p>
           </div>
        </div>
         <div class="model-read">
           <p id="model-message" data-testid="status-model-message">The model is watching.</p>
           <div class="confidence" id="model-confidence" data-testid="status-confidence">CONFIDENCE CALIBRATING</div>
         </div>
      </div>
      <div class="play-area">
        <h2 id="game-title">Make a move.</h2>
        <p class="play-prompt">Choose the direction it thinks you will avoid.</p>
        <div class="choices" role="group" aria-label="Direction choices">
          <button class="choice" data-action="LEFT" data-testid="button-choice-left">
             <span class="choice-key">A</span><span class="choice-title">LEFT</span><span class="choice-reward" data-reward-for="LEFT">+00</span><span class="choice-note">quiet edge</span>
          </button>
          <button class="choice" data-action="CENTER" data-testid="button-choice-center">
             <span class="choice-key">S</span><span class="choice-title">CENTER</span><span class="choice-reward" data-reward-for="CENTER">+00</span><span class="choice-note">safe ground</span>
          </button>
          <button class="choice" data-action="RIGHT" data-testid="button-choice-right">
             <span class="choice-key">D</span><span class="choice-title">RIGHT</span><span class="choice-reward" data-reward-for="RIGHT">+00</span><span class="choice-note">sharp turn</span>
          </button>
        </div>
         <div class="history-panel">
           <div class="history-heading">
             <div class="eyebrow">recent decisions</div>
             <p id="streak-readout">bluff streak 0</p>
           </div>
           <div class="history-dots" id="history-dots" aria-label="Recent decisions"></div>
         </div>
        <div class="feedback" role="status" aria-live="polite">
          <div><div class="feedback-title" id="feedback-title"></div><div class="feedback-copy" id="feedback-copy"></div></div>
          <div class="feedback-score" id="feedback-score"></div>
        </div>
      </div>
    </section>

    <section class="screen" data-screen="end" aria-labelledby="end-title">
      <div class="end-grid">
        <div class="end-copy">
           <div class="end-kicker">THE MACHINE HAS LEARNED YOU.</div>
          <h1 id="end-title">It saw<br><span>enough.</span></h1>
          <p id="archetype-description" data-testid="text-archetype-description">Your decisions left a shape in the noise.</p>
          <div class="challenge">
            <div class="eyebrow">the next challenge</div>
            <p id="challenge-copy" data-testid="text-challenge"></p>
          </div>
          <div class="end-actions">
            <button class="primary-button" id="again-button" data-testid="button-play-again">Run it again</button>
            <button class="text-button" id="home-button" data-testid="button-back-home">Back to brief</button>
          </div>
          <div class="history-note" id="history-note" data-testid="text-history"></div>
        </div>
        <div class="stats-panel">
          <div class="stat-lead">
            <div><div class="stat-label">final score</div><div class="big-score" id="final-score" data-testid="text-final-score">0</div></div>
            <div class="archetype"><div class="stat-label">profile</div><div class="archetype-name" id="archetype-name" data-testid="text-archetype">The Wildcard</div></div>
          </div>
          <div class="stats-list">
             <div class="stat-row"><div class="stat-label">choices made</div><div class="stat-value" id="stat-choices" data-testid="stat-choices">0</div></div>
             <div class="stat-row"><div class="stat-label">prediction accuracy</div><div class="stat-value" id="stat-accuracy" data-testid="stat-accuracy">0%</div></div>
             <div class="stat-row"><div class="stat-label">successful bluffs</div><div class="stat-value" id="stat-bluffs" data-testid="stat-bluffs">0</div></div>
             <div class="stat-row"><div class="stat-label">bluff streak</div><div class="stat-value" id="stat-streak" data-testid="stat-streak">0</div></div>
            <div class="stat-row"><div class="stat-label">best score</div><div class="stat-value" id="stat-best" data-testid="stat-best">0</div></div>
          </div>
        </div>
      </div>
    </section>
  </main>
`;

function getProfile() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { runs: 0, best: 0 }; }
  catch { return { runs: 0, best: 0 }; }
}

function saveProfile(profile) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)); } catch { /* static host may deny storage */ }
}

class PredictionModel {
  constructor() {
    this.history = [];
    this.lastAt = {};
    this.transitions = {};
  }

  observe(action) {
    const previous = this.history.at(-1);
    if (previous) {
      this.transitions[previous] ||= {};
      this.transitions[previous][action] = (this.transitions[previous][action] || 0) + 1;
    }
    this.history.push(action);
    this.lastAt[action] = this.history.length - 1;
  }

  predict(caution = 0) {
    const counts = Object.fromEntries(ACTIONS.map((action) => [action, 1]));
    this.history.forEach((action, index) => {
      const age = this.history.length - index;
      counts[action] += Math.max(.12, 1 - age * .12);
    });
    const previous = this.history.at(-1);
    if (previous && this.transitions[previous]) {
      Object.entries(this.transitions[previous]).forEach(([action, count]) => {
        counts[action] += count * 1.55;
      });
    }
    if (previous && (this.history.filter((item) => item === previous).length >= 3)) {
      counts[previous] += 2.2 + caution;
    }
    const ranked = ACTIONS.map((action) => [action, counts[action]]).sort((a, b) => b[1] - a[1]);
    const total = ranked.reduce((sum, item) => sum + item[1], 0);
    const top = ranked[0];
    const rawConfidence = top[1] / total;
    const confidence = clamp(.38 + rawConfidence * .58 + (Math.random() - .5) * .12, .42, .88);
    const isCorrect = Math.random() > .16;
    return { action: isCorrect ? top[0] : choice(ACTIONS.filter((item) => item !== top[0])), confidence, ranked };
  }
}

class PredictedGame {
  constructor() {
    this.profile = getProfile();
    this.model = new PredictionModel();
    this.state = "start";
    this.timer = null;
    this.startTime = 0;
    this.round = 0;
    this.score = 0;
    this.streak = 0;
    this.longestStreak = 0;
    this.bluffs = 0;
    this.predictionsDefeated = 0;
   this.predictionHits = 0;
    this.betrayals = 0;
    this.actions = [];
   this.rewards = {};
    this.prediction = null;
    this.lastFeedback = null;
    this.bind();
    this.renderHistory();
  }

  bind() {
    $("#start-button").addEventListener("click", () => this.start());
    $("#again-button").addEventListener("click", () => this.start());
    $("#home-button").addEventListener("click", () => this.show("start"));
    $$(".choice").forEach((button) => button.addEventListener("click", () => this.pick(button.dataset.action)));
    document.addEventListener("keydown", (event) => {
      if (this.state !== "game") return;
      const index = KEYS.indexOf(event.key.toUpperCase());
      if (index >= 0) {
        event.preventDefault();
        this.pick(ACTIONS[index]);
      }
    });
    window.addEventListener("beforeunload", () => this.persistLastRun());
  }

  show(state) {
    this.state = state;
    $$(".screen").forEach((screen) => screen.classList.toggle("is-active", screen.dataset.screen === state));
    if (state !== "game") this.stopTimer();
  }

  start() {
    this.model = new PredictionModel();
    this.round = 0;
    this.score = 0;
    this.streak = 0;
    this.longestStreak = 0;
    this.bluffs = 0;
    this.predictionsDefeated = 0;
   this.predictionHits = 0;
    this.betrayals = 0;
    this.actions = [];
   this.rewards = {};
    this.startTime = Date.now();
    this.show("game");
    this.updateScore();
    this.startTimer();
    this.nextTurn();
  }

  startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      const elapsed = (Date.now() - this.startTime) / 1000;
      const left = Math.max(0, RUN_SECONDS - elapsed);
      $("#timer").textContent = `00:${String(Math.ceil(left)).padStart(2, "0")}`;
      $(".progress-bar").style.transform = `scaleX(${left / RUN_SECONDS})`;
      $(".progress-bar").style.backgroundColor = left < 12 ? "var(--warm)" : "var(--signal)";
      $("#timer").classList.toggle("is-urgent", left < 12);
      if (left <= 0) this.finish();
    }, 100);
  }

  stopTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  nextTurn() {
    if (this.state !== "game") return;
    this.round += 1;
    this.prediction = this.model.predict(this.betrayals >= 2 ? .12 : 0);
    const shuffledRewards = [...REWARDS].sort(() => Math.random() - .5);
    this.rewards = Object.fromEntries(ACTIONS.map((action, index) => [action, shuffledRewards[index]]));
    this.renderTurn();
  }

  renderTurn() {
    $("#round").textContent = String(this.round).padStart(2, "0");
    $("#model-prediction").textContent = this.prediction.action;
    $("#model-confidence").textContent = this.round <= 2
      ? "CONFIDENCE CALIBRATING"
      : `CONFIDENCE ${(this.prediction.confidence * 100).toFixed(0)}%`;
    $("#model-message").textContent = this.round <= 2
      ? "The model is watching."
      : this.prediction.confidence >= .6
        ? "The model has a strong read on you."
        : "The model is watching, but uncertain.";
    $$(".choice-reward").forEach((label) => {
      label.textContent = `+${this.rewards[label.dataset.rewardFor]}`;
    });
    $(".feedback").classList.remove("is-visible", "is-win", "is-loss");
    $$(".choice").forEach((button) => {
      button.disabled = false;
      button.classList.remove("is-picked");
    });
    this.renderHistory();
  }

  pick(action) {
    if (this.state !== "game" || !this.prediction) return;
    const button = $(`.choice[data-action="${action}"]`);
    if (!button || button.disabled) return;
    $$(".choice").forEach((item) => { item.disabled = true; });
    button.classList.add("is-picked");
    const defeated = action !== this.prediction.action;
    const highConfidence = this.prediction.confidence >= .6;
    let points = this.rewards[action];
    let headline = defeated ? "Prediction defeated." : "The model was right.";
    let copy = defeated
      ? `You chose ${action}. It expected ${this.prediction.action}.`
      : `You chose ${action}. The model called it.`;
    copy += ` Base reward: +${points}.`;
    if (defeated && highConfidence) {
      const bonus = Math.round(8 + (this.prediction.confidence - .6) * 25);
      points += bonus;
      this.bluffs += 1;
      this.predictionsDefeated += 1;
      headline = "Clean bluff.";
      copy += ` You broke a ${(this.prediction.confidence * 100).toFixed(0)}% read.`;
    }
    if (!defeated) this.predictionHits += 1;
    if (defeated && highConfidence) this.betrayals += 1;
    this.score += points;
    this.streak = defeated ? this.streak + 1 : 0;
    this.longestStreak = Math.max(this.longestStreak, this.streak);
    this.actions.push(action);
    this.model.observe(action);
    this.updateScore();
    this.renderHistory();
    this.showFeedback({ headline, copy, points, defeated });
    setTimeout(() => this.nextTurn(), 1100);
  }

  showFeedback({ headline, copy, points, defeated }) {
    const feedback = $(".feedback");
    feedback.className = `feedback is-visible ${defeated ? "is-win" : "is-loss"}`;
    $("#feedback-title").textContent = headline;
    $("#feedback-copy").textContent = copy;
    $("#feedback-score").textContent = `+${points} pts`;
  }

  updateScore() {
    $("#score").textContent = String(this.score).padStart(3, "0");
  }

  finish() {
    if (this.state !== "game") return;
    this.stopTimer();
    this.state = "end";
    this.profile.runs += 1;
    this.profile.best = Math.max(this.profile.best || 0, this.score);
    saveProfile(this.profile);
    this.persistLastRun();
    this.renderEnd();
    this.show("end");
  }

  archetype() {
    const counts = Object.fromEntries(ACTIONS.map((action) => [action, this.actions.filter((item) => item === action).length]));
    const repeats = this.actions.reduce((sum, action, index) => sum + (index && action === this.actions[index - 1] ? 1 : 0), 0);
    const accuracy = this.actions.length ? this.predictionHits / this.actions.length : 0;
    if (repeats >= 5) return ["THE REPEATER", "You gave the model a rhythm and kept returning to it."];
    if (this.bluffs >= Math.max(2, Math.floor(this.actions.length * .15))) {
      return ["THE CONTRARIAN", "You waited for certainty, then moved against it."];
    }
    if (accuracy >= .68) return ["THE CAUTIOUS", "You trusted the read more often than you challenged it."];
    if (new Set(this.actions).size === 3 && this.longestStreak >= 3) {
      return ["THE OPPORTUNIST", "You moved between openings whenever the model overcommitted."];
    }
    return ["THE GAMBLER", "You kept choosing the live wire instead of the safe read."];
  }

  challenge() {
    const repeats = this.actions.reduce((sum, action, index) => sum + (index && action === this.actions[index - 1] ? 1 : 0), 0);
    if (this.bluffs >= 3) return "Defeat 3 high-confidence predictions.";
    if (repeats >= 5) return "Break your pattern 5 times.";
    if (this.predictionHits >= 3) return "Follow the prediction 3 times.";
    return "Avoid the highest reward 5 times.";
  }

  renderEnd() {
    const [name, description] = this.archetype();
    const accuracy = this.actions.length ? Math.round((this.predictionHits / this.actions.length) * 100) : 0;
    const stats = {
      choices: this.actions.length,
      accuracy,
      bluffs: this.bluffs,
      streak: this.longestStreak,
    };
    $("#final-score").textContent = this.score;
    $("#archetype-name").textContent = name;
    $("#archetype-description").textContent = description;
    $("#stat-choices").textContent = stats.choices;
    $("#stat-accuracy").textContent = `${stats.accuracy}%`;
    $("#stat-bluffs").textContent = stats.bluffs;
    $("#stat-streak").textContent = stats.streak;
    $("#stat-best").textContent = this.profile.best;
    $("#challenge-copy").textContent = this.challenge();
    this.profile.lastArchetype = name;
    this.profile.lastStats = stats;
    this.profile.challenge = this.challenge();
    saveProfile(this.profile);
    $("#history-note").textContent = `${this.profile.runs} run${this.profile.runs === 1 ? "" : "s"} logged locally.`;
  }

  persistLastRun() {
    try {
      localStorage.setItem(LAST_RUN_KEY, JSON.stringify({ score: this.score, actions: this.actions, savedAt: Date.now() }));
    } catch { /* optional persistence */ }
  }

  renderHistory() {
    const recent = this.actions.slice(-8);
    $("#history-dots").innerHTML = recent.length
      ? recent.map((action) => `<span class="history-dot ${action.toLowerCase()}" title="${action}"></span>`).join("")
      : `<span class="history-empty">no moves yet</span>`;
    $("#streak-readout").textContent = `bluff streak ${this.streak}`;
    if (this.profile.runs) {
      $("#history-note").textContent = `${this.profile.runs} run${this.profile.runs === 1 ? "" : "s"} logged locally. Best ${this.profile.best}.`;
    }
  }
}

new PredictedGame();
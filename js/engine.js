/* ============================================================
   AI × MATH = FUN — Core Engine
   Router, Game State, Leaderboard, Landing Animation, Utils
   ============================================================ */

// ── Challenge Metadata ────────────────────────────
const CHALLENGES = [
  {
    id: 'dimensionality',
    emoji: '🍊',
    title: 'The Impossible Orange',
    concept: 'Curse of Dimensionality',
    teaser: "99.99% of a 100D orange is skin. Where did the juice go?",
    gradient: 'linear-gradient(135deg, #F97316, #EF4444)',
    color: '#F97316'
  },
  {
    id: 'adversarial',
    emoji: '🎭',
    title: 'Fool the AI',
    concept: 'Adversarial Examples',
    teaser: "Change 0.01% of an image and make AI see something completely different.",
    gradient: 'linear-gradient(135deg, #EF4444, #EC4899)',
    color: '#EF4444'
  },
  {
    id: 'embeddings',
    emoji: '👑',
    title: 'King − Man + Woman = ?',
    concept: 'Word Embeddings',
    teaser: "Words are points in space. Subtraction and addition on words... makes sense.",
    gradient: 'linear-gradient(135deg, #8B5CF6, #6366F1)',
    color: '#8B5CF6'
  },
  {
    id: 'kernel',
    emoji: '🔵',
    title: 'Separate the Unseparable',
    concept: 'Kernel Trick (SVM)',
    teaser: "These dots are impossible to separate. Unless you change dimensions...",
    gradient: 'linear-gradient(135deg, #2563EB, #06B6D4)',
    color: '#2563EB'
  },
  {
    id: 'eigenfaces',
    emoji: '👻',
    title: 'Ghost in the Matrix',
    concept: 'Eigenfaces & PCA',
    teaser: "Every face is a weighted sum of ghost faces. You are a linear combination.",
    gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
    color: '#6366F1'
  },
  {
    id: 'benford',
    emoji: '🔍',
    title: 'Data Detective',
    concept: "Benford's Law",
    teaser: "30% of all numbers start with 1. Fraudsters don't know this. Can you?",
    gradient: 'linear-gradient(135deg, #10B981, #06B6D4)',
    color: '#10B981'
  },
  {
    id: 'entropy',
    emoji: '🧠',
    title: 'The Optimal Question',
    concept: 'Information Entropy',
    teaser: "What is surprise, mathematically? Can you ask the perfect question?",
    gradient: 'linear-gradient(135deg, #06B6D4, #2563EB)',
    color: '#06B6D4'
  },
  {
    id: 'diffusion',
    emoji: '🎨',
    title: 'Art from Chaos',
    concept: 'Diffusion Models',
    teaser: "Can you reverse entropy? Turn pure noise into a painting?",
    gradient: 'linear-gradient(135deg, #EC4899, #F97316)',
    color: '#EC4899'
  }
];

// ── Game State ────────────────────────────────────
const GameState = {
  playerName: '',
  totalScore: 0,
  challengeScores: {},      // { challengeId: score }
  completedChallenges: [],
  currentChallenge: null,
  timerStart: 0,
  timerInterval: null,

  init() {
    const saved = localStorage.getItem('mdm-game-state');
    if (saved) {
      try {
        const s = JSON.parse(saved);
        this.playerName = s.playerName || '';
        this.totalScore = s.totalScore || 0;
        this.challengeScores = s.challengeScores || {};
        this.completedChallenges = s.completedChallenges || [];
      } catch(e) {}
    }
  },

  save() {
    localStorage.setItem('mdm-game-state', JSON.stringify({
      playerName: this.playerName,
      totalScore: this.totalScore,
      challengeScores: this.challengeScores,
      completedChallenges: this.completedChallenges
    }));
  },

  addScore(challengeId, score) {
    this.challengeScores[challengeId] = score;
    if (!this.completedChallenges.includes(challengeId)) {
      this.completedChallenges.push(challengeId);
    }
    this.totalScore = Object.values(this.challengeScores).reduce((a,b) => a+b, 0);
    this.save();
    Leaderboard.updateEntry(this.playerName, this.totalScore, this.completedChallenges.length);
  },

  isCompleted(challengeId) {
    return this.completedChallenges.includes(challengeId);
  },

  reset() {
    this.playerName = '';
    this.totalScore = 0;
    this.challengeScores = {};
    this.completedChallenges = [];
    this.currentChallenge = null;
    this.save();
  }
};

// ── Leaderboard ────────────────────────────────────
const Leaderboard = {
  getEntries() {
    try {
      return JSON.parse(localStorage.getItem('mdm-leaderboard') || '[]');
    } catch(e) { return []; }
  },

  updateEntry(name, score, challenges) {
    let entries = this.getEntries();
    const idx = entries.findIndex(e => e.name === name);
    if (idx >= 0) {
      entries[idx].score = score;
      entries[idx].challenges = challenges;
    } else {
      entries.push({ name, score, challenges });
    }
    entries.sort((a,b) => b.score - a.score);
    localStorage.setItem('mdm-leaderboard', JSON.stringify(entries));
  },

  render() {
    const list = document.getElementById('leaderboard-list');
    const entries = this.getEntries();
    if (entries.length === 0) {
      list.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:40px;">No players yet. Be the first!</p>';
      return;
    }
    list.innerHTML = entries.slice(0, 20).map((e, i) => {
      const medals = ['🥇', '🥈', '🥉'];
      const isCurrent = e.name === GameState.playerName;
      return `
        <div class="lb-entry ${isCurrent ? 'current' : ''}">
          <span class="lb-rank">${medals[i] || (i+1)}</span>
          <span class="lb-name">${escapeHtml(e.name)}</span>
          <span class="lb-challenges">${e.challenges}/8</span>
          <span class="lb-score">${e.score}</span>
        </div>
      `;
    }).join('');
  }
};

// ── App Controller ────────────────────────────────
const App = {
  currentSection: 'landing',

  init() {
    GameState.init();
    this.initLanding();
    // If player exists, could go to hub
    if (GameState.playerName) {
      // Stay on landing anyway for the wow
    }
  },

  showSection(id) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(s => s.classList.remove('active'));

    const target = document.getElementById(id);
    if (target) {
      target.classList.add('active');
      this.currentSection = id;
    }

    // Section-specific init
    if (id === 'hub') this.renderHub();
    if (id === 'leaderboard') Leaderboard.render();
    if (id === 'finale') Finale.init();
  },

  registerPlayer() {
    const input = document.getElementById('player-name');
    const error = document.getElementById('register-error');
    const name = input.value.trim();

    if (!name) {
      error.textContent = 'Please enter your name!';
      input.focus();
      return;
    }
    if (name.length < 2) {
      error.textContent = 'Name must be at least 2 characters.';
      return;
    }

    GameState.playerName = name;
    GameState.save();
    Leaderboard.updateEntry(name, 0, 0);
    this.showSection('hub');
  },

  renderHub() {
    // Update player info
    document.getElementById('hub-avatar').textContent = GameState.playerName.charAt(0).toUpperCase();
    document.getElementById('hub-player-name').textContent = GameState.playerName;
    document.getElementById('hub-score').textContent = GameState.totalScore;

    // Progress
    const completed = GameState.completedChallenges.length;
    document.getElementById('hub-progress').style.width = `${(completed/8)*100}%`;
    document.getElementById('hub-progress-text').textContent = `${completed} / 8 completed`;

    // Challenge cards
    const grid = document.getElementById('challenge-grid');
    grid.innerHTML = CHALLENGES.map((c, i) => {
      const done = GameState.isCompleted(c.id);
      const score = GameState.challengeScores[c.id];
      return `
        <div class="challenge-card ${done ? 'completed' : ''}"
             style="--card-gradient: ${c.gradient}; animation-delay: ${i * 0.05}s"
             onclick="App.startChallenge('${c.id}')">
          <span class="card-emoji">${c.emoji}</span>
          <h3 class="card-title">${c.title}</h3>
          <p class="card-concept">${c.concept}</p>
          <p class="card-teaser">${c.teaser}</p>
          <div class="card-score">
            ${done
              ? `✓ Score: ${score} pts`
              : '<span class="card-score-empty">Not attempted</span>'}
          </div>
        </div>
      `;
    }).join('');

    // Finale unlock
    const finaleBtn = document.getElementById('finale-unlock');
    finaleBtn.style.display = completed >= 3 ? 'block' : 'none';
  },

  startChallenge(challengeId) {
    GameState.currentChallenge = challengeId;
    const idx = CHALLENGES.findIndex(c => c.id === challengeId);
    document.getElementById('challenge-number').textContent = `${idx+1}/8`;

    // Reset footer
    document.getElementById('challenge-footer').style.display = 'none';

    // Start timer
    GameState.timerStart = Date.now();
    clearInterval(GameState.timerInterval);
    GameState.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - GameState.timerStart) / 1000);
      const mins = Math.floor(elapsed / 60);
      const secs = elapsed % 60;
      document.getElementById('timer-display').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }, 1000);

    this.showSection('challenge-view');

    // Initialize the specific challenge
    if (typeof Challenges !== 'undefined' && Challenges[challengeId]) {
      Challenges[challengeId].init();
    }
  },

  completeChallenge(score) {
    clearInterval(GameState.timerInterval);
    const elapsed = Math.floor((Date.now() - GameState.timerStart) / 1000);

    // Speed bonus: up to 50 extra points if fast
    const speedBonus = Math.max(0, Math.floor(50 * (1 - elapsed / 180)));
    const totalScore = score + speedBonus;

    GameState.addScore(GameState.currentChallenge, totalScore);

    // Show result
    const challengeData = CHALLENGES.find(c => c.id === GameState.currentChallenge);
    const footer = document.getElementById('challenge-footer');
    const result = document.getElementById('challenge-result');
    const explanation = document.getElementById('challenge-explanation');

    result.innerHTML = `
      <div class="result-score">${totalScore} pts</div>
      <div class="result-label">${score} base + ${speedBonus} speed bonus</div>
    `;

    // Get explanation from challenge module
    if (Challenges[GameState.currentChallenge] && Challenges[GameState.currentChallenge].getExplanation) {
      const exp = Challenges[GameState.currentChallenge].getExplanation();
      explanation.innerHTML = `
        <div class="explanation-title">${exp.title}</div>
        <div class="explanation-text">${exp.text}</div>
      `;
    }

    footer.style.display = 'block';
  },

  finishChallenge() {
    this.showSection('hub');
  },

  resetGame() {
    GameState.reset();
    this.showSection('landing');
  },

  // ── Landing Animation ────────────────────────────
  initLanding() {
    const canvas = document.getElementById('landing-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: 0, y: 0 };
    let animId;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Math symbols floating as particles
    const symbols = ['∑', '∫', '∇', 'π', 'θ', 'λ', '∂', 'Δ', '∞', 'φ', 'σ', 'μ', '⊗', '⊕', '∈', 'ℝ', '→', '√', 'α', 'β'];

    class Particle {
      constructor() {
        this.reset();
      }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.symbol = symbols[Math.floor(Math.random() * symbols.length)];
        this.size = 12 + Math.random() * 18;
        this.opacity = 0.04 + Math.random() * 0.08;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.01;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotSpeed;

        // Subtle mouse repulsion
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 150) {
          this.x += dx / dist * 0.5;
          this.y += dy / dist * 0.5;
        }

        if (this.x < -50 || this.x > canvas.width + 50 ||
            this.y < -50 || this.y > canvas.height + 50) {
          this.reset();
        }
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.font = `${this.size}px 'JetBrains Mono', monospace`;
        ctx.fillStyle = `rgba(37, 99, 235, ${this.opacity})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.symbol, 0, 0);
        ctx.restore();
      }
    }

    // Create particles
    const count = Math.min(60, Math.floor(canvas.width * canvas.height / 20000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    // Draw connecting lines between nearby particles
    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 200) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${0.03 * (1 - dist/200)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      animId = requestAnimationFrame(animate);
    }

    canvas.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    animate();

    // Typewriter effect for the result word
    const words = ['Intelligence ✨', 'Discovery 🔬', 'Revolution 🚀', 'Life-Saving 💓', 'FUN 🎮'];
    let wordIdx = 0;
    let charIdx = 0;
    let deleting = false;
    const resultEl = document.getElementById('landing-result');

    function typewrite() {
      const currentWord = words[wordIdx];

      if (!deleting) {
        charIdx++;
        if (charIdx > currentWord.length) {
          setTimeout(() => { deleting = true; typewrite(); }, 2000);
          return;
        }
      } else {
        charIdx--;
        if (charIdx < 0) {
          deleting = false;
          wordIdx = (wordIdx + 1) % words.length;
          charIdx = 0;
          setTimeout(typewrite, 400);
          return;
        }
      }

      resultEl.textContent = currentWord.substring(0, charIdx);
      setTimeout(typewrite, deleting ? 40 : 80);
    }

    setTimeout(typewrite, 1200);
  }
};

// ── Utility Functions ─────────────────────────────
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function lerp(a, b, t) { return a + (b - a) * t; }

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function easeInOutCubic(t) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2;
}

function gaussianRandom(mean = 0, std = 1) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * std + mean;
}

function animateValue(el, start, end, duration, suffix = '') {
  const startTime = performance.now();
  function update(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const val = Math.round(lerp(start, end, easeOutCubic(t)));
    el.textContent = val + suffix;
    if (t < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

function hslToString(h, s, l, a = 1) {
  return `hsla(${h}, ${s}%, ${l}%, ${a})`;
}

// Color map for visualizations
function valueToColor(v, scheme = 'viridis') {
  v = clamp(v, 0, 1);
  if (scheme === 'viridis') {
    const r = Math.round(68 + v * (253 - 68));
    const g = Math.round(1 + v * (231 - 1));
    const b = Math.round(84 + v * (37 - 84));
    return `rgb(${r},${g},${b})`;
  }
  if (scheme === 'plasma') {
    const r = Math.round(13 + v * (240 - 13));
    const g = Math.round(8 + v * (249 - 8));
    const b = Math.round(135 + v * (33 - 135));
    return `rgb(${r},${g},${b})`;
  }
  if (scheme === 'hot') {
    const r = Math.round(v * 255);
    const g = Math.round(Math.max(0, (v - 0.33) / 0.67) * 255);
    const b = Math.round(Math.max(0, (v - 0.67) / 0.33) * 255);
    return `rgb(${r},${g},${b})`;
  }
  // Default blue-red
  const r = Math.round(v * 255);
  const b = Math.round((1-v) * 255);
  return `rgb(${r},50,${b})`;
}

// ── Initialize on Load ────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

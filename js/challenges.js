/* ============================================================
   AI × MATH = FUN — Challenges (Part 1: Challenges 1-4)
   ============================================================ */

const Challenges = {};

// ══════════════════════════════════════════════════
// CHALLENGE 1: CURSE OF DIMENSIONALITY
// ══════════════════════════════════════════════════
Challenges.dimensionality = {
  guesses: [],
  currentDim: 2,
  targetDims: [3, 5, 10, 50, 100],
  phase: 0,
  canvas: null, ctx: null,

  init() {
    const body = document.getElementById('challenge-body');
    body.innerHTML = `
      <div class="challenge-intro">
        <span class="challenge-emoji">🍊</span>
        <h2>The Impossible Orange</h2>
        <div class="enigma">
          An orange has a thin skin and juicy interior. In 3D, about 20% of the volume is skin (outer 3mm of a 30mm radius orange).<br><br>
          <strong>What happens in higher dimensions?</strong><br>
          As dimensions increase, what percentage of the orange's volume is in the skin?
        </div>
      </div>
      <div class="challenge-canvas-container">
        <canvas id="dim-canvas" width="700" height="350"></canvas>
      </div>
      <div class="challenge-controls">
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-number" id="dim-current" style="color:var(--accent-blue)">3</span>
            <span class="stat-label">Dimensions</span>
          </div>
          <div class="stat-item">
            <span class="stat-number" id="dim-actual" style="color:var(--accent-coral)">—</span>
            <span class="stat-label">Actual Skin %</span>
          </div>
          <div class="stat-item">
            <span class="stat-number" id="dim-score-display" style="color:var(--accent-green)">0</span>
            <span class="stat-label">Points</span>
          </div>
        </div>
        <p id="dim-prompt" style="font-size:1.05rem;text-align:center;margin-bottom:8px;">
          In <strong><span id="dim-target">5</span>D</strong>, what % of the orange is skin?
        </p>
        <div class="guess-input-group">
          <input type="number" id="dim-guess" min="0" max="100" placeholder="%" />
          <button class="btn btn-primary" id="dim-submit" onclick="Challenges.dimensionality.submitGuess()">Guess</button>
        </div>
        <p class="visual-feedback" id="dim-feedback"></p>
      </div>
    `;
    this.canvas = document.getElementById('dim-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.guesses = [];
    this.phase = 0;
    this.drawVisualization(3, 0.27);
    document.getElementById('dim-target').textContent = this.targetDims[0];
    document.getElementById('dim-guess').addEventListener('keydown', e => {
      if (e.key === 'Enter') this.submitGuess();
    });
  },

  skinPercent(n, ratio) {
    ratio = ratio || 0.9; // inner radius / outer radius
    return (1 - Math.pow(ratio, n)) * 100;
  },

  submitGuess() {
    const input = document.getElementById('dim-guess');
    const guess = parseFloat(input.value);
    if (isNaN(guess) || guess < 0 || guess > 100) {
      document.getElementById('dim-feedback').textContent = 'Enter a number between 0 and 100!';
      return;
    }

    const dim = this.targetDims[this.phase];
    const actual = this.skinPercent(dim);
    const error = Math.abs(guess - actual);
    const pts = Math.max(0, Math.round(40 - error * 2));
    this.guesses.push({ dim, guess, actual, pts });

    document.getElementById('dim-actual').textContent = actual.toFixed(1) + '%';
    document.getElementById('dim-feedback').innerHTML = 
      error < 5 ? '🎯 Incredible intuition!' :
      error < 15 ? '👍 Not bad!' :
      '🤯 Surprising, right?';

    this.drawVisualization(dim, actual / 100);

    let totalPts = this.guesses.reduce((s,g) => s + g.pts, 0);
    document.getElementById('dim-score-display').textContent = totalPts;

    this.phase++;
    input.value = '';

    if (this.phase < this.targetDims.length) {
      document.getElementById('dim-target').textContent = this.targetDims[this.phase];
      document.getElementById('dim-current').textContent = this.targetDims[this.phase];
      document.getElementById('dim-prompt').innerHTML = 
        `In <strong>${this.targetDims[this.phase]}D</strong>, what % of the orange is skin?`;
    } else {
      document.getElementById('dim-submit').disabled = true;
      document.getElementById('dim-prompt').innerHTML = '<strong>All rounds complete!</strong>';
      input.style.display = 'none';
      setTimeout(() => App.completeChallenge(totalPts), 1500);
    }
  },

  drawVisualization(dim, skinPct) {
    const c = this.canvas, ctx = this.ctx;
    const w = c.width, h = c.height;
    ctx.clearRect(0, 0, w, h);

    // Draw bar chart of skin % vs dimension
    const data = [];
    for (let d = 2; d <= Math.max(dim, 100); d++) {
      if (d <= 10 || d % 10 === 0) data.push({ d, pct: this.skinPercent(d) });
    }

    const barW = Math.max(8, Math.min(40, (w - 100) / data.length - 4));
    const chartH = h - 80;
    const startX = 60;

    // Axis
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startX, 20);
    ctx.lineTo(startX, chartH + 20);
    ctx.lineTo(w - 20, chartH + 20);
    ctx.stroke();

    // Y labels
    ctx.fillStyle = '#8896AB';
    ctx.font = '11px JetBrains Mono';
    ctx.textAlign = 'right';
    for (let p = 0; p <= 100; p += 25) {
      const y = chartH + 20 - (p / 100) * chartH;
      ctx.fillText(p + '%', startX - 8, y + 4);
      ctx.beginPath();
      ctx.moveTo(startX, y);
      ctx.lineTo(w - 20, y);
      ctx.strokeStyle = '#F1F5F9';
      ctx.stroke();
    }

    // Bars
    data.forEach((item, i) => {
      const x = startX + 15 + i * (barW + 4);
      const barH = (item.pct / 100) * chartH;
      const y = chartH + 20 - barH;

      const highlight = item.d === dim;
      const grad = ctx.createLinearGradient(x, y, x, chartH + 20);
      if (highlight) {
        grad.addColorStop(0, '#F97316');
        grad.addColorStop(1, '#EF4444');
      } else {
        grad.addColorStop(0, '#93C5FD');
        grad.addColorStop(1, '#2563EB');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
      ctx.fill();

      // Label
      ctx.fillStyle = highlight ? '#F97316' : '#8896AB';
      ctx.font = highlight ? 'bold 10px JetBrains Mono' : '10px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(item.d + 'D', x + barW/2, chartH + 36);

      if (highlight) {
        ctx.fillStyle = '#F97316';
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.fillText(item.pct.toFixed(1) + '%', x + barW/2, y - 8);
      }
    });
  },

  getExplanation() {
    return {
      title: '🍊 The Curse of Dimensionality — Why AI Struggles',
      text: `<strong>Volume of skin = 1 − (r_inner/r_outer)^n</strong><br><br>
        As dimensions n increase, this ratio approaches 1 exponentially. In 100D, <strong>99.99%</strong> of the volume is in the thin skin. The "interior" essentially vanishes.<br><br>
        <strong>Why this matters for AI:</strong> In high-dimensional spaces, ALL data points become "surface" points — equally far from the center and from each other. This is why AI needs dimensionality reduction (PCA, t-SNE) to work with real data. Without it, distances become meaningless and learning breaks down.`
    };
  }
};

// ══════════════════════════════════════════════════
// CHALLENGE 2: ADVERSARIAL EXAMPLES
// ══════════════════════════════════════════════════
Challenges.adversarial = {
  canvas: null, ctx: null,
  originalPixels: null,
  perturbation: 0,
  imageType: 0,
  score: 0,
  found: false,

  // Simple pixel art patterns (8x8)
  patterns: [
    { name: 'Cat', labelA: 'Cat', labelB: 'Dog',
      grid: [
        0,0,1,0,0,1,0,0,
        0,1,1,0,0,1,1,0,
        0,1,1,1,1,1,1,0,
        0,1,0,1,1,0,1,0,
        0,1,1,1,1,1,1,0,
        0,0,1,0,0,1,0,0,
        0,0,1,1,1,1,0,0,
        0,0,0,1,1,0,0,0,
      ]},
    { name: 'Three', labelA: '3', labelB: '8',
      grid: [
        0,1,1,1,1,1,0,0,
        0,0,0,0,0,1,0,0,
        0,0,0,0,0,1,0,0,
        0,0,1,1,1,1,0,0,
        0,0,0,0,0,1,0,0,
        0,0,0,0,0,1,0,0,
        0,1,1,1,1,1,0,0,
        0,0,0,0,0,0,0,0,
      ]},
    { name: 'Stop', labelA: 'Stop Sign', labelB: 'Speed Limit',
      grid: [
        0,0,1,1,1,1,0,0,
        0,1,1,1,1,1,1,0,
        1,1,0,1,1,0,1,1,
        1,1,1,1,1,1,1,1,
        1,1,1,1,1,1,1,1,
        1,1,0,1,1,0,1,1,
        0,1,1,1,1,1,1,0,
        0,0,1,1,1,1,0,0,
      ]},
  ],

  init() {
    const body = document.getElementById('challenge-body');
    body.innerHTML = `
      <div class="challenge-intro">
        <span class="challenge-emoji">🎭</span>
        <h2>Fool the AI</h2>
        <div class="enigma">
          An AI classifier sees the image below and confidently says what it is.<br>
          Your mission: add the <strong>minimum</strong> noise to make the AI see something completely different.<br><br>
          The twist? The change must be <strong>invisible to humans.</strong>
        </div>
      </div>
      <div class="image-display">
        <div class="image-frame">
          <canvas id="adv-original" width="200" height="200"></canvas>
          <p>Original Image</p>
        </div>
        <div class="image-frame">
          <canvas id="adv-perturbed" width="200" height="200"></canvas>
          <p>Perturbed Image</p>
        </div>
        <div class="image-frame">
          <canvas id="adv-noise" width="200" height="200"></canvas>
          <p>Noise (amplified 10×)</p>
        </div>
      </div>
      <div class="confidence-bar-container">
        <div class="confidence-label-row">
          <span id="adv-label-a">Cat (98%)</span>
          <span id="adv-label-b">Dog (2%)</span>
        </div>
        <div class="confidence-bar">
          <div class="confidence-fill-a" id="adv-conf-a" style="width:98%"></div>
          <div class="confidence-fill-b" id="adv-conf-b" style="width:2%"></div>
        </div>
      </div>
      <div class="challenge-controls">
        <div class="slider-group">
          <div class="slider-label">
            <span>Perturbation Strength</span>
            <span class="slider-value" id="adv-eps-val">ε = 0.00</span>
          </div>
          <input type="range" id="adv-slider" min="0" max="100" value="0"
                 oninput="Challenges.adversarial.onSlider(this.value)">
        </div>
        <p class="visual-feedback" id="adv-feedback">Drag the slider to add perturbation...</p>
        <button class="btn btn-primary" id="adv-lock" onclick="Challenges.adversarial.lockIn()" style="display:none;">
          🎯 Lock In My Answer
        </button>
      </div>
    `;
    this.imageType = 0;
    this.found = false;
    this.score = 0;
    this.drawPattern(0);
  },

  drawPattern(eps) {
    const pat = this.patterns[this.imageType];
    const origCanvas = document.getElementById('adv-original');
    const pertCanvas = document.getElementById('adv-perturbed');
    const noiseCanvas = document.getElementById('adv-noise');
    const origCtx = origCanvas.getContext('2d');
    const pertCtx = pertCanvas.getContext('2d');
    const noiseCtx = noiseCanvas.getContext('2d');
    const size = 200, grid = 8, cell = size / grid;

    // Seed random for consistent noise
    let seed = 42;
    function seededRand() { seed = (seed * 16807 + 0) % 2147483647; return seed / 2147483647; }

    origCtx.clearRect(0, 0, size, size);
    pertCtx.clearRect(0, 0, size, size);
    noiseCtx.fillStyle = '#808080';
    noiseCtx.fillRect(0, 0, size, size);

    for (let y = 0; y < grid; y++) {
      for (let x = 0; x < grid; x++) {
        const v = pat.grid[y * grid + x];
        const baseR = v ? 50 : 220;
        const baseG = v ? 100 : 225;
        const baseB = v ? 180 : 230;

        origCtx.fillStyle = `rgb(${baseR},${baseG},${baseB})`;
        origCtx.fillRect(x*cell, y*cell, cell, cell);

        // Add perturbation
        const noiseR = (seededRand() - 0.5) * 2 * eps * 255;
        const noiseG = (seededRand() - 0.5) * 2 * eps * 255;
        const noiseB = (seededRand() - 0.5) * 2 * eps * 255;

        pertCtx.fillStyle = `rgb(${clamp(baseR+noiseR,0,255)},${clamp(baseG+noiseG,0,255)},${clamp(baseB+noiseB,0,255)})`;
        pertCtx.fillRect(x*cell, y*cell, cell, cell);

        // Amplified noise visualization
        const nv = 128 + noiseR * 10;
        noiseCtx.fillStyle = `rgb(${clamp(nv,0,255)},${clamp(128+noiseG*10,0,255)},${clamp(128+noiseB*10,0,255)})`;
        noiseCtx.fillRect(x*cell, y*cell, cell, cell);
      }
    }

    // Simulate AI confidence shift
    const confA = Math.max(1, 98 - eps * 400);
    const confB = Math.min(99, 2 + eps * 400);
    const flipped = confB > confA;

    document.getElementById('adv-conf-a').style.width = (flipped ? confB : confA) + '%';
    document.getElementById('adv-conf-b').style.width = (flipped ? confA : confB) + '%';
    document.getElementById('adv-label-a').textContent = `${pat.labelA} (${Math.round(flipped ? confB : confA)}%)`;
    document.getElementById('adv-label-b').textContent = `${pat.labelB} (${Math.round(flipped ? confA : confB)}%)`;

    if (flipped) {
      document.getElementById('adv-conf-a').style.background = 'var(--gradient-warm)';
      document.getElementById('adv-conf-b').style.background = 'var(--gradient-blue)';
    } else {
      document.getElementById('adv-conf-a').style.background = 'var(--gradient-blue)';
      document.getElementById('adv-conf-b').style.background = 'var(--gradient-warm)';
    }

    return flipped;
  },

  onSlider(val) {
    const eps = val / 100 * 0.5; // 0 to 0.5
    this.perturbation = eps;
    document.getElementById('adv-eps-val').textContent = `ε = ${eps.toFixed(3)}`;

    const flipped = this.drawPattern(eps);

    if (flipped && !this.found) {
      document.getElementById('adv-feedback').innerHTML = '🎭 <strong>The AI is fooled!</strong> Can you find a lower ε?';
      document.getElementById('adv-lock').style.display = 'inline-flex';
    } else if (!flipped) {
      document.getElementById('adv-feedback').textContent = 'AI still sees the original. Add more noise...';
    }
  },

  lockIn() {
    const eps = this.perturbation;
    // Score: lower epsilon = higher score (max 150 at eps ~0.12)
    const score = Math.max(10, Math.round(150 * (1 - eps / 0.5)));
    this.score = score;
    App.completeChallenge(score);
  },

  getExplanation() {
    return {
      title: '🎭 Adversarial Examples — The Achilles Heel of AI',
      text: `<strong>x_adversarial = x + ε · sign(∇ₓ Loss)</strong><br><br>
        By computing the gradient of the AI's loss function with respect to input pixels, we find the direction that maximally confuses the classifier. A tiny step in that direction — invisible to humans — completely flips the prediction.<br><br>
        <strong>Why this matters:</strong> Self-driving cars, medical imaging, security systems — all vulnerable to adversarial attacks. This is why <strong>AI safety research</strong> is one of the most critical fields today. The math of gradients reveals that AI "sees" in a fundamentally different mathematical space than humans.`
    };
  }
};

// ══════════════════════════════════════════════════
// CHALLENGE 3: WORD EMBEDDINGS
// ══════════════════════════════════════════════════
Challenges.embeddings = {
  canvas: null, ctx: null,
  puzzles: [
    { a: 'King', b: 'Man', c: 'Woman', answer: 'Queen', options: ['Queen', 'Princess', 'Duchess', 'Empress'] },
    { a: 'Paris', b: 'France', c: 'Japan', answer: 'Tokyo', options: ['Tokyo', 'Osaka', 'Kyoto', 'Beijing'] },
    { a: 'Puppy', b: 'Dog', c: 'Cat', answer: 'Kitten', options: ['Kitten', 'Cub', 'Foal', 'Chick'] },
    { a: 'Good', b: 'Best', c: 'Worst', answer: 'Bad', options: ['Bad', 'Evil', 'Terrible', 'Poor'] },
    { a: 'Walking', b: 'Walked', c: 'Swam', answer: 'Swimming', options: ['Swimming', 'Running', 'Diving', 'Floating'] },
  ],
  current: 0,
  correct: 0,
  total: 0,

  // Simplified 2D word positions for visualization
  wordPositions: {
    'King': [0.7, 0.2], 'Queen': [0.7, 0.7], 'Man': [0.3, 0.2], 'Woman': [0.3, 0.7],
    'Prince': [0.6, 0.15], 'Princess': [0.6, 0.75],
    'Paris': [0.3, 0.3], 'France': [0.2, 0.4], 'Tokyo': [0.75, 0.35], 'Japan': [0.65, 0.45],
    'Puppy': [0.25, 0.25], 'Dog': [0.35, 0.35], 'Cat': [0.65, 0.35], 'Kitten': [0.55, 0.25],
  },

  init() {
    const body = document.getElementById('challenge-body');
    body.innerHTML = `
      <div class="challenge-intro">
        <span class="challenge-emoji">👑</span>
        <h2>King − Man + Woman = ?</h2>
        <div class="enigma">
          In the world of AI, every word is a point in high-dimensional space. And incredibly,
          <strong>vector arithmetic on words captures meaning</strong>.<br><br>
          King − Man + Woman = Queen. It's not magic — it's linear algebra.
        </div>
      </div>
      <div class="challenge-canvas-container">
        <canvas id="emb-canvas" width="700" height="350"></canvas>
      </div>
      <div class="challenge-controls">
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-number" id="emb-round" style="color:var(--accent-purple)">1/5</span>
            <span class="stat-label">Puzzle</span>
          </div>
          <div class="stat-item">
            <span class="stat-number" id="emb-correct" style="color:var(--accent-green)">0</span>
            <span class="stat-label">Correct</span>
          </div>
        </div>
        <div class="analogy-display" id="emb-analogy"></div>
        <div class="answer-buttons" id="emb-options"></div>
        <p class="visual-feedback" id="emb-feedback"></p>
      </div>
    `;
    this.canvas = document.getElementById('emb-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.current = 0;
    this.correct = 0;
    this.showPuzzle();
  },

  showPuzzle() {
    const p = this.puzzles[this.current];
    document.getElementById('emb-round').textContent = `${this.current+1}/5`;
    document.getElementById('emb-analogy').innerHTML = `
      <span class="analogy-word">${p.a}</span>
      <span class="analogy-op">−</span>
      <span class="analogy-word">${p.b}</span>
      <span class="analogy-op">+</span>
      <span class="analogy-word">${p.c}</span>
      <span class="analogy-op">=</span>
      <span class="analogy-blank">?</span>
    `;

    // Shuffle options
    const opts = [...p.options].sort(() => Math.random() - 0.5);
    document.getElementById('emb-options').innerHTML = opts.map(o =>
      `<button class="answer-btn" onclick="Challenges.embeddings.answer('${o}')">${o}</button>`
    ).join('');
    document.getElementById('emb-feedback').textContent = '';

    this.drawEmbeddingSpace(p);
  },

  answer(choice) {
    const p = this.puzzles[this.current];
    const buttons = document.querySelectorAll('#emb-options .answer-btn');
    buttons.forEach(btn => {
      btn.disabled = true;
      if (btn.textContent === p.answer) btn.classList.add('correct');
      if (btn.textContent === choice && choice !== p.answer) btn.classList.add('wrong');
    });

    if (choice === p.answer) {
      this.correct++;
      document.getElementById('emb-feedback').innerHTML = '✅ <strong>Correct!</strong> The vector arithmetic works!';
      document.getElementById('emb-correct').textContent = this.correct;
    } else {
      document.getElementById('emb-feedback').innerHTML = `❌ It's <strong>${p.answer}</strong>! The vectors pointed there.`;
    }

    this.current++;
    if (this.current < this.puzzles.length) {
      setTimeout(() => this.showPuzzle(), 1500);
    } else {
      const score = this.correct * 30;
      setTimeout(() => App.completeChallenge(score), 2000);
    }
  },

  drawEmbeddingSpace(puzzle) {
    const c = this.canvas, ctx = this.ctx;
    const w = c.width, h = c.height;
    ctx.clearRect(0, 0, w, h);

    // Background grid
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y = 0; y < h; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

    // Draw word dots and labels
    const words = [puzzle.a, puzzle.b, puzzle.c, puzzle.answer];
    const positions = {};
    words.forEach(word => {
      const p = this.wordPositions[word] || [Math.random()*0.6+0.2, Math.random()*0.6+0.2];
      positions[word] = { x: p[0] * w, y: p[1] * h };
    });

    // Draw the vector arrows: A-B arrow and C-? arrow (parallel)
    const drawArrow = (x1,y1,x2,y2,color,dashed) => {
      ctx.beginPath();
      ctx.setLineDash(dashed ? [6,4] : []);
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.setLineDash([]);
      // Arrowhead
      const angle = Math.atan2(y2-y1, x2-x1);
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2-10*Math.cos(angle-0.4), y2-10*Math.sin(angle-0.4));
      ctx.lineTo(x2-10*Math.cos(angle+0.4), y2-10*Math.sin(angle+0.4));
      ctx.fillStyle = color;
      ctx.fill();
    };

    // A → B vector (relationship)
    if (positions[puzzle.a] && positions[puzzle.b]) {
      drawArrow(positions[puzzle.a].x, positions[puzzle.a].y,
                positions[puzzle.b].x, positions[puzzle.b].y, '#2563EB', false);
    }
    // C → Answer vector (same relationship)
    if (positions[puzzle.c] && positions[puzzle.answer]) {
      drawArrow(positions[puzzle.c].x, positions[puzzle.c].y,
                positions[puzzle.answer].x, positions[puzzle.answer].y, '#8B5CF6', true);
    }

    // Draw word dots
    Object.entries(positions).forEach(([word, pos]) => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 8, 0, Math.PI*2);
      ctx.fillStyle = word === puzzle.answer ? '#8B5CF6' : '#2563EB';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#0A1628';
      ctx.font = 'bold 14px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.fillText(word, pos.x, pos.y - 16);
    });

    // Label
    ctx.fillStyle = '#8896AB';
    ctx.font = '12px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('2D projection of word embedding space', 10, h - 10);
  },

  getExplanation() {
    return {
      title: '👑 Word Embeddings — Meaning IS Geometry',
      text: `<strong>vec("King") − vec("Man") + vec("Woman") ≈ vec("Queen")</strong><br><br>
        AI models like Word2Vec and GPT learn to represent every word as a vector in high-dimensional space (typically 300-1000 dimensions). Words with similar meanings cluster together, and the <strong>directions</strong> between words encode semantic relationships.<br><br>
        <strong>The math:</strong> Cosine similarity cos(θ) = (A·B)/(|A||B|) measures how close two word-meanings are. Vector arithmetic captures analogies because the relationship "male→female" is a consistent direction in this space.<br><br>
        <strong>Impact:</strong> This is the foundation of ChatGPT, Google Translate, and every modern language AI.`
    };
  }
};

// ══════════════════════════════════════════════════
// CHALLENGE 4: KERNEL TRICK (SVM)
// ══════════════════════════════════════════════════
Challenges.kernel = {
  canvas: null, ctx: null,
  points: [],
  is3D: false,
  rotAngle: 0,
  animFrame: null,
  separated: false,

  init() {
    const body = document.getElementById('challenge-body');
    body.innerHTML = `
      <div class="challenge-intro">
        <span class="challenge-emoji">🔵</span>
        <h2>Separate the Unseparable</h2>
        <div class="enigma">
          Below are red dots and blue dots. Your task: draw a single straight line to perfectly separate them.<br><br>
          <strong>Spoiler: it's impossible.</strong> In 2D, no line can separate them.<br>
          But what if you could... <em>change the rules</em>?
        </div>
      </div>
      <div class="challenge-canvas-container">
        <canvas id="kernel-canvas" width="600" height="400"></canvas>
      </div>
      <div class="challenge-controls">
        <p class="visual-feedback" id="kernel-feedback">Try to imagine a line separating them... 🤔</p>
        <button class="btn btn-primary" id="kernel-lift-btn" onclick="Challenges.kernel.liftTo3D()">
          🚀 Lift to Higher Dimension!
        </button>
        <button class="btn btn-primary" id="kernel-separate-btn" onclick="Challenges.kernel.showSeparation()" style="display:none;">
          ✂️ Separate with a Plane!
        </button>
      </div>
    `;
    this.canvas = document.getElementById('kernel-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.is3D = false;
    this.separated = false;
    this.generatePoints();
    this.draw2D();
  },

  generatePoints() {
    this.points = [];
    // Inner circle (blue)
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * 80;
      this.points.push({
        x: 300 + Math.cos(angle) * r,
        y: 200 + Math.sin(angle) * r,
        color: 'blue',
        cls: 0
      });
    }
    // Outer ring (red)
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 130 + Math.random() * 70;
      this.points.push({
        x: 300 + Math.cos(angle) * r,
        y: 200 + Math.sin(angle) * r,
        color: 'red',
        cls: 1
      });
    }
  },

  draw2D() {
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = '#F1F5F9';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
    for (let y = 0; y < h; y += 30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }

    // Dots
    this.points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI*2);
      ctx.fillStyle = p.cls === 0 ? '#2563EB' : '#EF4444';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    ctx.fillStyle = '#8896AB';
    ctx.font = '12px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('2D Space — No line can separate these!', 10, h-10);
  },

  liftTo3D() {
    document.getElementById('kernel-lift-btn').style.display = 'none';
    document.getElementById('kernel-feedback').innerHTML = '🚀 <strong>Applying kernel φ(x,y) = (x², y², √2·xy)</strong> — lifting to 3D!';

    this.is3D = true;
    this.rotAngle = 0;
    const animate = () => {
      this.rotAngle += 0.008;
      this.draw3D();
      if (this.rotAngle < Math.PI * 4 && !this.separated) {
        this.animFrame = requestAnimationFrame(animate);
      } else {
        document.getElementById('kernel-separate-btn').style.display = 'inline-flex';
        document.getElementById('kernel-feedback').innerHTML = '✨ In 3D, the points are separable! Click to see the separating plane.';
      }
    };
    animate();
  },

  draw3D() {
    const ctx = this.ctx;
    const w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Project points to pseudo-3D
    const cos = Math.cos(this.rotAngle), sin = Math.sin(this.rotAngle);
    const cx = 300, cy = 200;

    // Calculate Z value based on distance from center (the kernel lift)
    const projected = this.points.map(p => {
      const dx = (p.x - cx) / 200;
      const dy = (p.y - cy) / 200;
      const z = (dx*dx + dy*dy) * 150; // φ: radial basis lift

      // 3D rotation around Y axis
      const rx = dx * 200 * cos - z * sin;
      const rz = dx * 200 * sin + z * cos;
      const ry = dy * 200;

      // Perspective projection
      const scale = 400 / (400 + rz);
      return {
        sx: cx + rx * scale,
        sy: cy + ry * scale,
        sz: rz,
        scale,
        cls: p.cls
      };
    });

    // Sort by depth
    projected.sort((a,b) => a.sz - b.sz);

    // Draw separating plane if shown
    if (this.separated) {
      ctx.fillStyle = 'rgba(37, 99, 235, 0.08)';
      ctx.fillRect(0, cy - 30, w, 60);
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.3)';
      ctx.setLineDash([8, 4]);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw points
    projected.forEach(p => {
      const r = 5 * p.scale;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, Math.max(2, r), 0, Math.PI*2);
      ctx.fillStyle = p.cls === 0 ? `rgba(37,99,235,${0.4+p.scale*0.6})` : `rgba(239,68,68,${0.4+p.scale*0.6})`;
      ctx.fill();
    });

    ctx.fillStyle = '#8896AB';
    ctx.font = '12px Inter';
    ctx.fillText('3D Space — Kernel φ(x,y) = (x², y², √2xy)', 10, h-10);
  },

  showSeparation() {
    this.separated = true;
    document.getElementById('kernel-separate-btn').style.display = 'none';
    document.getElementById('kernel-feedback').innerHTML = '🎉 <strong>A flat plane perfectly separates them in 3D!</strong> The kernel trick works!';

    // Continue rotation briefly
    let frames = 0;
    const finalAnim = () => {
      this.rotAngle += 0.008;
      this.draw3D();
      frames++;
      if (frames < 180) {
        requestAnimationFrame(finalAnim);
      } else {
        App.completeChallenge(120);
      }
    };
    finalAnim();
  },

  getExplanation() {
    return {
      title: '🔵 The Kernel Trick — Dimensions Are Your Friend',
      text: `<strong>K(x, y) = φ(x) · φ(y)</strong><br><br>
        The kernel trick maps data to a higher-dimensional space where it becomes linearly separable. The genius: you never actually compute the high-dimensional coordinates! The kernel function gives you the dot product directly.<br><br>
        <strong>The math:</strong> For radial data, φ(x,y) = (x², y², √2xy) lifts a circle into a paraboloid in 3D, where a plane can slice between inner and outer points.<br><br>
        <strong>AI connection:</strong> Support Vector Machines (SVMs) used this trick to dominate machine learning for decades. The idea that <em>higher dimensions make problems easier</em> is counterintuitive — and powerful.`
    };
  }
};

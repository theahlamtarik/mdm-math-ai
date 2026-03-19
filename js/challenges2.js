/* ============================================================
   AI × MATH = FUN — Challenges (Part 2: Challenges 5-8)
   ============================================================ */

// ══════════════════════════════════════════════════
// CHALLENGE 5: EIGENFACES (PCA)
// ══════════════════════════════════════════════════
Challenges.eigenfaces = {
  canvas: null, ctx: null,
  targetCanvas: null,
  basisFaces: [],
  targetWeights: [],
  currentWeights: [],
  numBasis: 6,

  init() {
    const body = document.getElementById('challenge-body');
    body.innerHTML = `
      <div class="challenge-intro">
        <span class="challenge-emoji">👻</span>
        <h2>Ghost in the Matrix</h2>
        <div class="enigma">
          Every human face is a <strong>weighted sum of "ghost faces"</strong> — mathematical basis patterns called eigenfaces.<br><br>
          Use the sliders to mix ghost faces and reconstruct the target face. How few components do you need?
        </div>
      </div>
      <div class="image-display">
        <div class="image-frame">
          <canvas id="eigen-target" width="150" height="150"></canvas>
          <p>Target Face</p>
        </div>
        <div class="image-frame">
          <canvas id="eigen-result" width="150" height="150"></canvas>
          <p>Your Reconstruction</p>
        </div>
        <div class="image-frame">
          <div id="eigen-similarity" style="font-size:2rem;font-weight:700;font-family:var(--font-mono);padding:40px 20px;">0%</div>
          <p>Similarity</p>
        </div>
      </div>
      <div class="challenge-controls" style="max-width:700px;">
        <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:8px;">Adjust eigenface weights:</p>
        <div id="eigen-sliders"></div>
        <button class="btn btn-primary" onclick="Challenges.eigenfaces.submit()" style="margin-top:16px;">
          Submit Reconstruction
        </button>
      </div>
    `;
    this.generateBasisFaces();
    this.generateTarget();
    this.createSliders();
    this.drawResult();
  },

  generateBasisFaces() {
    this.basisFaces = [];
    const size = 15;
    // Generate procedural eigenface-like patterns
    const patterns = [
      (x,y) => Math.sin(x*0.5)*0.8, // horizontal gradient
      (x,y) => Math.sin(y*0.5)*0.8, // vertical gradient
      (x,y) => Math.sin(x*0.4+y*0.4)*0.7, // diagonal
      (x,y) => Math.cos(Math.sqrt((x-7)*(x-7)+(y-7)*(y-7))*0.6)*0.6, // radial
      (x,y) => Math.sin(x*0.8)*Math.sin(y*0.8)*0.5, // grid
      (x,y) => (y < 7 ? -0.4 : 0.4) * Math.cos(x*0.5), // top/bottom split
    ];
    for (let i = 0; i < this.numBasis; i++) {
      const face = [];
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          face.push(patterns[i](x,y));
        }
      }
      this.basisFaces.push(face);
    }
  },

  generateTarget() {
    // Random target weights
    this.targetWeights = [];
    for (let i = 0; i < this.numBasis; i++) {
      this.targetWeights.push(Math.round((Math.random()*2-1)*50)/50);
    }
    this.currentWeights = new Array(this.numBasis).fill(0);
    this.drawFace('eigen-target', this.targetWeights);
  },

  createSliders() {
    const container = document.getElementById('eigen-sliders');
    const labels = ['Horizontal', 'Vertical', 'Diagonal', 'Radial', 'Grid', 'Symmetry'];
    container.innerHTML = this.basisFaces.map((_, i) => `
      <div class="slider-group" style="margin-bottom:8px;">
        <div class="slider-label">
          <span>Ghost Face ${i+1} (${labels[i]})</span>
          <span class="slider-value" id="eigen-val-${i}">0.00</span>
        </div>
        <input type="range" min="-100" max="100" value="0" 
               oninput="Challenges.eigenfaces.onSlider(${i}, this.value)">
      </div>
    `).join('');
  },

  onSlider(idx, val) {
    this.currentWeights[idx] = val / 100;
    document.getElementById(`eigen-val-${idx}`).textContent = (val/100).toFixed(2);
    this.drawResult();
  },

  computeFace(weights) {
    const size = 15;
    const pixels = new Array(size*size).fill(0);
    for (let i = 0; i < this.numBasis; i++) {
      for (let j = 0; j < pixels.length; j++) {
        pixels[j] += weights[i] * this.basisFaces[i][j];
      }
    }
    return pixels;
  },

  drawFace(canvasId, weights) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const size = 15, cellSize = canvas.width / size;
    const pixels = this.computeFace(weights);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const v = clamp(pixels[y*size+x]*0.5 + 0.5, 0, 1);
        const r = Math.round(40 + v * 180);
        const g = Math.round(60 + v * 160);
        const b = Math.round(120 + v * 135);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x*cellSize, y*cellSize, cellSize+1, cellSize+1);
      }
    }
  },

  drawResult() {
    this.drawFace('eigen-result', this.currentWeights);
    // Compute similarity
    const target = this.computeFace(this.targetWeights);
    const current = this.computeFace(this.currentWeights);
    let dotProd = 0, magA = 0, magB = 0;
    for (let i = 0; i < target.length; i++) {
      dotProd += target[i] * current[i];
      magA += target[i] * target[i];
      magB += current[i] * current[i];
    }
    const similarity = magA > 0 && magB > 0 ? Math.max(0, dotProd / (Math.sqrt(magA)*Math.sqrt(magB))) * 100 : 0;
    const el = document.getElementById('eigen-similarity');
    el.textContent = Math.round(similarity) + '%';
    el.style.color = similarity > 80 ? 'var(--accent-green)' : similarity > 50 ? 'var(--accent-coral)' : 'var(--accent-red)';
  },

  submit() {
    const target = this.computeFace(this.targetWeights);
    const current = this.computeFace(this.currentWeights);
    let dotProd = 0, magA = 0, magB = 0;
    for (let i = 0; i < target.length; i++) {
      dotProd += target[i]*current[i]; magA += target[i]*target[i]; magB += current[i]*current[i];
    }
    const similarity = magA > 0 && magB > 0 ? Math.max(0, dotProd/(Math.sqrt(magA)*Math.sqrt(magB)))*100 : 0;
    const score = Math.round(similarity * 1.5);
    App.completeChallenge(Math.min(150, score));
  },

  getExplanation() {
    return {
      title: '👻 Eigenfaces — Face = Linear Algebra',
      text: `<strong>Face = w₁·EigenFace₁ + w₂·EigenFace₂ + ... + wₙ·EigenFaceₙ</strong><br><br>
        PCA (Principal Component Analysis) finds the "most important directions" in a dataset. For faces, these directions are eigenfaces — spooky basis patterns that capture the most variance.<br><br>
        <strong>The math:</strong> Compute the covariance matrix of all face images, then find its eigenvectors. These eigenvectors ARE the eigenfaces. Each face is reconstructed as a weighted sum.<br><br>
        <strong>AI connection:</strong> This was the first face recognition system (1991). Today, PCA remains essential for dimensionality reduction in all ML — reducing 10⁶ features to the few that matter.`
    };
  }
};

// ══════════════════════════════════════════════════
// CHALLENGE 6: BENFORD'S LAW
// ══════════════════════════════════════════════════
Challenges.benford = {
  datasets: [],
  fakeIndex: -1,
  selectedDataset: 0,
  answered: false,

  init() {
    this.generateDatasets();
    const body = document.getElementById('challenge-body');
    body.innerHTML = `
      <div class="challenge-intro">
        <span class="challenge-emoji">🔍</span>
        <h2>Data Detective</h2>
        <div class="enigma">
          <strong>Benford's Law:</strong> In real-world datasets, ~30% of numbers start with "1", ~17% with "2", and only ~4.6% with "9".<br><br>
          Below are 3 datasets. <strong>One is AI-generated fake data.</strong> Can you spot which one violates Benford's Law?
        </div>
      </div>
      <div class="dataset-tabs" id="benford-tabs"></div>
      <div class="bar-chart" id="benford-chart"></div>
      <div class="challenge-controls">
        <p style="font-size:0.9rem;color:var(--text-muted);margin-bottom:8px;text-align:center;">
          The <span style="color:var(--accent-purple)">purple line</span> shows Benford's theoretical distribution
        </p>
        <p style="text-align:center;font-weight:600;margin-bottom:12px;">Which dataset is FAKE?</p>
        <div class="answer-buttons" id="benford-answers"></div>
        <p class="visual-feedback" id="benford-feedback"></p>
      </div>
    `;
    this.renderTabs();
    this.renderChart(0);
    this.renderAnswerButtons();
  },

  benfordExpected(d) {
    return Math.log10(1 + 1/d);
  },

  generateDatasets() {
    this.datasets = [];
    this.fakeIndex = Math.floor(Math.random() * 3);
    const names = ['City Populations', 'River Lengths (km)', 'Company Revenues ($)'];
    for (let ds = 0; ds < 3; ds++) {
      const counts = new Array(9).fill(0);
      const total = 500;
      if (ds === this.fakeIndex) {
        // Fake: roughly uniform first digits
        for (let i = 0; i < total; i++) {
          const d = Math.floor(Math.random()*9);
          counts[d]++;
        }
      } else {
        // Real: follows Benford's Law with some noise
        for (let i = 0; i < total; i++) {
          const r = Math.random();
          let cumulative = 0;
          for (let d = 1; d <= 9; d++) {
            cumulative += this.benfordExpected(d);
            if (r <= cumulative) { counts[d-1]++; break; }
          }
        }
      }
      // Normalize to percentages
      const pcts = counts.map(c => c / total * 100);
      this.datasets.push({ name: names[ds], pcts, isFake: ds === this.fakeIndex });
    }
  },

  renderTabs() {
    document.getElementById('benford-tabs').innerHTML = this.datasets.map((ds, i) =>
      `<button class="dataset-tab ${i===0?'active':''}" onclick="Challenges.benford.selectDataset(${i})">${ds.name}</button>`
    ).join('');
  },

  selectDataset(idx) {
    this.selectedDataset = idx;
    document.querySelectorAll('.dataset-tab').forEach((t,i) => t.classList.toggle('active', i===idx));
    this.renderChart(idx);
  },

  renderChart(idx) {
    const ds = this.datasets[idx];
    const container = document.getElementById('benford-chart');
    const maxPct = 40;
    container.innerHTML = ds.pcts.map((pct, i) => {
      const expected = this.benfordExpected(i+1) * 100;
      const h = (pct / maxPct) * 160;
      const expectedH = (expected / maxPct) * 160;
      const deviation = Math.abs(pct - expected);
      const barColor = deviation > 8 ? 'var(--accent-red)' : deviation > 4 ? 'var(--accent-coral)' : 'var(--accent-blue)';
      return `
        <div class="bar-wrapper" style="position:relative;">
          <span class="bar-value">${pct.toFixed(1)}%</span>
          <div class="bar" style="height:${h}px;background:${barColor};"></div>
          <div style="position:absolute;bottom:24px;left:50%;transform:translateX(-50%);width:28px;height:3px;background:var(--accent-purple);border-radius:2px;bottom:${expectedH+24}px;"></div>
          <span class="bar-label">${i+1}</span>
        </div>
      `;
    }).join('');
  },

  renderAnswerButtons() {
    document.getElementById('benford-answers').innerHTML = this.datasets.map((ds, i) =>
      `<button class="answer-btn" onclick="Challenges.benford.answer(${i})">${ds.name}</button>`
    ).join('');
  },

  answer(idx) {
    if (this.answered) return;
    this.answered = true;
    const buttons = document.querySelectorAll('#benford-answers .answer-btn');
    buttons.forEach((btn, i) => {
      btn.disabled = true;
      if (i === this.fakeIndex) btn.classList.add('correct');
      if (i === idx && i !== this.fakeIndex) btn.classList.add('wrong');
    });

    const correct = idx === this.fakeIndex;
    document.getElementById('benford-feedback').innerHTML = correct
      ? '🎯 <strong>Correct!</strong> The uniform digit distribution gave it away!'
      : `❌ Not quite! <strong>${this.datasets[this.fakeIndex].name}</strong> was the fake — notice the nearly uniform distribution.`;

    // Show fake dataset
    this.selectDataset(this.fakeIndex);

    const score = correct ? 130 : 40;
    setTimeout(() => App.completeChallenge(score), 2000);
  },

  getExplanation() {
    return {
      title: "🔍 Benford's Law — Nature's Hidden Fingerprint",
      text: `<strong>P(d) = log₁₀(1 + 1/d)</strong><br><br>
        Real-world data spanning multiple orders of magnitude (populations, financial data, physical constants) follows this distribution. The digit "1" appears ~30.1% of the time, while "9" appears only ~4.6%.<br><br>
        <strong>Why:</strong> It's a consequence of scale invariance and the logarithmic nature of growth. Data that grows exponentially spends more "time" with leading digit 1.<br><br>
        <strong>AI connection:</strong> Benford's Law is used to detect fraud, fake financial data, manipulated elections, and now — <strong>AI-generated content</strong>. GANs often produce data that violates Benford's Law, revealing their synthetic origin.`
    };
  }
};

// ══════════════════════════════════════════════════
// CHALLENGE 7: INFORMATION ENTROPY
// ══════════════════════════════════════════════════
Challenges.entropy = {
  target: 0,
  low: 1, high: 100,
  questions: 0,
  optimalQuestions: 0,
  gameOver: false,
  history: [],

  init() {
    this.target = Math.floor(Math.random() * 100) + 1;
    this.low = 1;
    this.high = 100;
    this.questions = 0;
    this.optimalQuestions = Math.ceil(Math.log2(100));
    this.gameOver = false;
    this.history = [];

    const body = document.getElementById('challenge-body');
    body.innerHTML = `
      <div class="challenge-intro">
        <span class="challenge-emoji">🧠</span>
        <h2>The Optimal Question</h2>
        <div class="enigma">
          I'm thinking of a number between 1 and 100.<br>
          You can ask <strong>yes/no questions</strong> ("Is it ≥ 50?").<br><br>
          The <strong>information-theoretically optimal</strong> strategy finds it in exactly ⌈log₂(100)⌉ = <strong>7 questions</strong>.<br>
          Can <em>you</em> match the math?
        </div>
      </div>
      <div class="challenge-controls">
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-number" id="ent-questions" style="color:var(--accent-cyan)">0</span>
            <span class="stat-label">Questions Asked</span>
          </div>
          <div class="stat-item">
            <span class="stat-number" style="color:var(--accent-purple)">7</span>
            <span class="stat-label">Optimal (log₂100)</span>
          </div>
          <div class="stat-item">
            <span class="stat-number" id="ent-range" style="color:var(--accent-coral)">1-100</span>
            <span class="stat-label">Remaining Range</span>
          </div>
        </div>
        <div class="entropy-question-display" id="ent-info-display">
          H = log₂(100) = 6.64 bits of uncertainty
        </div>
        <div id="ent-history" style="max-height:150px;overflow-y:auto;margin-bottom:16px;"></div>
        <div class="guess-input-group" id="ent-input-area">
          <span style="font-weight:500;">Is it ≥</span>
          <input type="number" id="ent-threshold" min="1" max="100" placeholder="?" />
          <span>?</span>
          <button class="btn btn-primary" onclick="Challenges.entropy.askQuestion()">Ask</button>
        </div>
        <p style="text-align:center;margin-top:8px;font-size:0.85rem;color:var(--text-muted);">Or guess directly:</p>
        <div class="guess-input-group">
          <input type="number" id="ent-final-guess" min="1" max="100" placeholder="Final answer" />
          <button class="btn btn-primary" onclick="Challenges.entropy.finalGuess()" style="background:var(--gradient-green);">Guess!</button>
        </div>
        <p class="visual-feedback" id="ent-feedback"></p>
      </div>
    `;
    document.getElementById('ent-threshold').addEventListener('keydown', e => {
      if (e.key === 'Enter') this.askQuestion();
    });
    document.getElementById('ent-final-guess').addEventListener('keydown', e => {
      if (e.key === 'Enter') this.finalGuess();
    });
  },

  askQuestion() {
    if (this.gameOver) return;
    const input = document.getElementById('ent-threshold');
    const threshold = parseInt(input.value);
    if (isNaN(threshold) || threshold < this.low || threshold > this.high) {
      document.getElementById('ent-feedback').textContent = `Enter a number between ${this.low} and ${this.high}!`;
      return;
    }
    this.questions++;
    const answer = this.target >= threshold;
    if (answer) {
      this.low = threshold;
    } else {
      this.high = threshold - 1;
    }
    this.history.push({ q: `Is it ≥ ${threshold}?`, a: answer ? 'Yes ✓' : 'No ✗' });
    
    input.value = '';
    document.getElementById('ent-questions').textContent = this.questions;
    document.getElementById('ent-range').textContent = `${this.low}-${this.high}`;

    const remaining = this.high - this.low + 1;
    const entropy = Math.log2(remaining).toFixed(2);
    document.getElementById('ent-info-display').textContent = remaining > 1
      ? `H = log₂(${remaining}) = ${entropy} bits remaining`
      : `H = 0 bits — you know the answer!`;

    document.getElementById('ent-history').innerHTML = this.history.map(h =>
      `<div style="display:flex;justify-content:space-between;padding:4px 8px;font-size:0.85rem;border-bottom:1px solid var(--border);">
        <span>${h.q}</span><span style="font-weight:600;color:${h.a.includes('Yes')?'var(--accent-green)':'var(--accent-red)'}">${h.a}</span>
      </div>`
    ).join('');

    if (this.low === this.high) {
      this.gameOver = true;
      document.getElementById('ent-feedback').innerHTML = `🎉 The number was <strong>${this.target}</strong>! Found in ${this.questions} questions.`;
      const score = Math.max(20, 150 - (this.questions - this.optimalQuestions) * 20);
      setTimeout(() => App.completeChallenge(score), 1500);
    }
  },

  finalGuess() {
    if (this.gameOver) return;
    const guess = parseInt(document.getElementById('ent-final-guess').value);
    if (isNaN(guess)) return;
    this.questions++;
    this.gameOver = true;

    if (guess === this.target) {
      document.getElementById('ent-feedback').innerHTML = `🎉 <strong>Correct!</strong> The number was ${this.target}! Found in ${this.questions} questions.`;
      const score = Math.max(20, 150 - (this.questions - this.optimalQuestions) * 20);
      setTimeout(() => App.completeChallenge(score), 1500);
    } else {
      document.getElementById('ent-feedback').innerHTML = `❌ Wrong! The number was <strong>${this.target}</strong>. You had it narrowed to ${this.low}-${this.high}.`;
      setTimeout(() => App.completeChallenge(20), 1500);
    }
  },

  getExplanation() {
    return {
      title: '🧠 Information Entropy — The Math of Surprise',
      text: `<strong>H(X) = -Σ p(x) · log₂(p(x))</strong><br><br>
        Shannon's entropy measures the "average surprise" of a random variable. Binary search is optimal because each question eliminates exactly <strong>1 bit</strong> of uncertainty — cutting the range in half.<br><br>
        <strong>The magic:</strong> log₂(100) ≈ 6.64, so 7 questions suffice. Every question that doesn't split the range evenly wastes information.<br><br>
        <strong>AI connection:</strong> Cross-entropy loss — the most common training objective in deep learning — is literally this formula. When AI "learns," it's minimizing entropy: reducing surprise between its predictions and reality. Decision trees use information gain (entropy reduction) to choose the best split at each node.`
    };
  }
};

// ══════════════════════════════════════════════════
// CHALLENGE 8: DIFFUSION MODELS
// ══════════════════════════════════════════════════
Challenges.diffusion = {
  canvas: null, ctx: null,
  originalPixels: [],
  currentPixels: [],
  noiseLevel: 1.0,
  steps: 0,
  size: 32,
  maxSteps: 20,

  init() {
    const body = document.getElementById('challenge-body');
    body.innerHTML = `
      <div class="challenge-intro">
        <span class="challenge-emoji">🎨</span>
        <h2>Art from Chaos</h2>
        <div class="enigma">
          <strong>Diffusion models</strong> create art by learning to reverse noise. Start with pure random static, then step-by-step, remove the noise to reveal a hidden image.<br><br>
          You control the denoising: each step removes a layer of Gaussian noise. Can you reveal the image in the <strong>fewest steps</strong>?
        </div>
      </div>
      <div class="image-display">
        <div class="image-frame">
          <canvas id="diff-noisy" width="256" height="256"></canvas>
          <p>Current State (t=<span id="diff-t">20</span>)</p>
        </div>
        <div class="image-frame">
          <canvas id="diff-clean" width="256" height="256" style="filter:blur(10px);opacity:0.3;"></canvas>
          <p>Hidden Target (blurred)</p>
        </div>
      </div>
      <div class="challenge-controls">
        <div class="stat-row">
          <div class="stat-item">
            <span class="stat-number" id="diff-steps" style="color:var(--accent-pink)">0</span>
            <span class="stat-label">Denoise Steps</span>
          </div>
          <div class="stat-item">
            <span class="stat-number" id="diff-noise-pct" style="color:var(--accent-coral)">100%</span>
            <span class="stat-label">Noise Level</span>
          </div>
          <div class="stat-item">
            <span class="stat-number" id="diff-similarity" style="color:var(--accent-green)">0%</span>
            <span class="stat-label">Similarity</span>
          </div>
        </div>
        <div class="slider-group">
          <div class="slider-label">
            <span>Denoise Strength per Step</span>
            <span class="slider-value" id="diff-strength-val">5%</span>
          </div>
          <input type="range" id="diff-strength" min="1" max="20" value="5" 
                 oninput="document.getElementById('diff-strength-val').textContent=this.value+'%'">
        </div>
        <button class="btn btn-primary" id="diff-step-btn" onclick="Challenges.diffusion.denoiseStep()">
          🔧 Denoise One Step
        </button>
        <p class="visual-feedback" id="diff-feedback">Click to start removing noise layer by layer...</p>
        <button class="btn btn-primary" id="diff-done-btn" onclick="Challenges.diffusion.submit()" style="display:none;background:var(--gradient-green);">
          ✅ I can see it! Submit
        </button>
      </div>
    `;
    this.generateImage();
    this.steps = 0;
    this.noiseLevel = 1.0;
    this.addFullNoise();
  },

  generateImage() {
    const s = this.size;
    this.originalPixels = [];
    // Generate a simple geometric pattern (circle, square, star pattern)
    const pattern = Math.floor(Math.random() * 3);
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        let r, g, b;
        const cx = s/2, cy = s/2;
        const dx = x-cx, dy = y-cy;
        const dist = Math.sqrt(dx*dx+dy*dy);
        
        if (pattern === 0) { // Colorful circle gradient
          const angle = Math.atan2(dy, dx);
          const inCircle = dist < s*0.4;
          r = inCircle ? Math.round(128 + 127*Math.sin(angle)) : 240;
          g = inCircle ? Math.round(128 + 127*Math.sin(angle+2.1)) : 242;
          b = inCircle ? Math.round(128 + 127*Math.sin(angle+4.2)) : 245;
        } else if (pattern === 1) { // Gradient cross
          const cross = Math.abs(dx) < 4 || Math.abs(dy) < 4;
          r = cross ? Math.round(50 + (y/s)*200) : 235;
          g = cross ? Math.round(100 + (x/s)*100) : 238;
          b = cross ? 200 : 240;
        } else { // Concentric rings
          const ring = Math.floor(dist / 3) % 2;
          r = ring ? 60 : 200;
          g = ring ? 120 + Math.round(dist*3) : 220;
          b = ring ? 200 : 240;
        }
        this.originalPixels.push(clamp(r,0,255), clamp(g,0,255), clamp(b,0,255));
      }
    }
    // Draw clean version (blurred)
    this.drawToCanvas('diff-clean', this.originalPixels);
  },

  addFullNoise() {
    this.currentPixels = this.originalPixels.map(v => {
      return clamp(Math.round(v * 0.0 + (Math.random()*255) * 1.0), 0, 255);
    });
    this.drawToCanvas('diff-noisy', this.currentPixels);
  },

  denoiseStep() {
    const strength = parseInt(document.getElementById('diff-strength').value) / 100;
    this.steps++;
    this.noiseLevel = Math.max(0, this.noiseLevel - strength);

    // Interpolate between noisy and original
    this.currentPixels = this.originalPixels.map((orig, i) => {
      const noise = (Math.random() - 0.5) * 255 * this.noiseLevel;
      return clamp(Math.round(orig + noise), 0, 255);
    });

    this.drawToCanvas('diff-noisy', this.currentPixels);
    document.getElementById('diff-steps').textContent = this.steps;
    document.getElementById('diff-t').textContent = Math.round(this.noiseLevel * 20);
    document.getElementById('diff-noise-pct').textContent = Math.round(this.noiseLevel*100) + '%';

    // Calculate similarity
    let mse = 0;
    for (let i = 0; i < this.originalPixels.length; i++) {
      const diff = this.currentPixels[i] - this.originalPixels[i];
      mse += diff*diff;
    }
    mse /= this.originalPixels.length;
    const similarity = Math.max(0, Math.round((1 - Math.sqrt(mse)/128)*100));
    document.getElementById('diff-similarity').textContent = similarity + '%';

    if (this.noiseLevel < 0.3) {
      document.getElementById('diff-done-btn').style.display = 'inline-flex';
      document.getElementById('diff-feedback').innerHTML = '👀 Can you see the image emerging?';
    }
    if (this.noiseLevel <= 0.01) {
      document.getElementById('diff-feedback').innerHTML = '🎨 <strong>The image is fully revealed!</strong>';
      document.getElementById('diff-step-btn').disabled = true;
    }
  },

  submit() {
    // Score: fewer steps = higher score
    const score = Math.max(30, Math.round(150 * (1 - this.steps / this.maxSteps)));
    App.completeChallenge(score);
  },

  drawToCanvas(canvasId, pixels) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const scale = canvas.width / this.size;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const idx = (y * this.size + x) * 3;
        ctx.fillStyle = `rgb(${pixels[idx]},${pixels[idx+1]},${pixels[idx+2]})`;
        ctx.fillRect(x*scale, y*scale, scale+1, scale+1);
      }
    }
  },

  getExplanation() {
    return {
      title: '🎨 Diffusion Models — Creation IS Destruction in Reverse',
      text: `<strong>q(xₜ|xₜ₋₁) = N(xₜ; √(1-βₜ)·xₜ₋₁, βₜI)</strong><br><br>
        Diffusion models work in two phases:<br>
        1. <strong>Forward process:</strong> Gradually add Gaussian noise until the image becomes pure static<br>
        2. <strong>Reverse process:</strong> Learn to denoise step-by-step, recovering the original image<br><br>
        The neural network learns to predict the noise at each step, using a score function ∇ₓ log p(x).<br><br>
        <strong>AI connection:</strong> DALL-E 2, Midjourney, and Stable Diffusion — the AI art revolution worth $10B+ — all use this exact mathematics. Every AI-generated image you've seen was created by starting from random noise and mathematically removing it, one step at a time.`
    };
  }
};

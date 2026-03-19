/* ============================================================
   AI × MATH = FUN — Grand Finale
   "Math Saves Lives" — ECG Pipeline, T-MECA, Impact Wall
   ============================================================ */

const Finale = {
  ecgAnimFrame: null,
  ecgPhase: 0,
  ecgData: [],
  transformsShown: 0,

  init() {
    // Reset all phases
    document.querySelectorAll('.finale-phase').forEach(p => p.style.display = 'none');
    document.getElementById('finale-reveal').style.display = 'block';
    this.populateConnections();
    this.populateImpactWall();
  },

  showPhase(phase) {
    document.querySelectorAll('.finale-phase').forEach(p => p.style.display = 'none');
    const el = document.getElementById('finale-' + phase);
    if (el) {
      el.style.display = 'block';
      el.style.animation = 'none';
      el.offsetHeight; // trigger reflow
      el.style.animation = 'fadeInUp 0.6s var(--ease-out)';
    }
    if (phase === 'ecg') this.startECGDemo();
    if (phase === 'tmeca') this.animateAccuracy();
  },

  populateConnections() {
    const connections = [
      { emoji: '🍊', title: 'Dimensionality Reduction', desc: 'Used in medical imaging to extract features from high-dimensional scans' },
      { emoji: '🎭', title: 'Adversarial Robustness', desc: 'Critical for safety in AI-powered medical diagnosis systems' },
      { emoji: '👑', title: 'Embeddings', desc: 'Powers clinical text understanding and patient record analysis' },
      { emoji: '🔵', title: 'Kernel Methods', desc: 'Used in drug discovery and protein structure classification' },
      { emoji: '👻', title: 'PCA / Eigendecomposition', desc: 'Heart of ECG signal analysis — decomposing heartbeats into basis patterns' },
      { emoji: '🔍', title: 'Statistical Forensics', desc: 'Detecting anomalies and fraud in clinical trial data' },
      { emoji: '🧠', title: 'Information Theory', desc: 'Foundation of the cross-entropy loss that trains every medical AI' },
      { emoji: '🎨', title: 'Generative Models', desc: 'Creating synthetic medical data for training when real data is scarce' },
    ];

    const container = document.getElementById('finale-connections');
    container.innerHTML = connections.map((c, i) => `
      <div class="finale-connection" style="--delay: ${i * 0.1}s">
        <span class="connection-emoji">${c.emoji}</span>
        <div class="connection-text">
          <strong>${c.title}</strong>
          <span>${c.desc}</span>
        </div>
      </div>
    `).join('');
  },

  // ── ECG DEMO ────────────────────────────────
  startECGDemo() {
    this.generateECG();
    this.transformsShown = 0;
    document.querySelectorAll('.transform-card').forEach(c => c.classList.remove('visible'));
    this.animateECG();

    // Stagger transform reveals
    setTimeout(() => this.showTransform('gaf', 0), 2000);
    setTimeout(() => this.showTransform('rp', 1), 3500);
    setTimeout(() => this.showTransform('mtf', 2), 5000);
    setTimeout(() => this.showTransform('cwt', 3), 6500);
  },

  generateECG() {
    // Generate realistic-looking ECG waveform (PQRST complex)
    this.ecgData = [];
    for (let i = 0; i < 800; i++) {
      const t = i / 800;
      let y = 0;
      // Generate multiple heartbeat cycles
      for (let beat = 0; beat < 4; beat++) {
        const bt = (t - beat * 0.25) * 4; // normalized within beat
        if (bt >= 0 && bt < 1) {
          // P wave
          y += 0.15 * Math.exp(-Math.pow((bt-0.12)*30, 2));
          // Q wave
          y -= 0.08 * Math.exp(-Math.pow((bt-0.28)*50, 2));
          // R wave (tall spike)
          y += 0.8 * Math.exp(-Math.pow((bt-0.32)*40, 2));
          // S wave
          y -= 0.15 * Math.exp(-Math.pow((bt-0.38)*45, 2));
          // T wave
          y += 0.2 * Math.exp(-Math.pow((bt-0.55)*20, 2));
        }
      }
      // Add slight noise
      y += (Math.random() - 0.5) * 0.02;
      this.ecgData.push(y);
    }
  },

  animateECG() {
    const canvas = document.getElementById('ecg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    let drawIndex = 0;

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 22, 40, 0.05)';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.1)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // ECG trace
      ctx.beginPath();
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 8;

      const visiblePoints = Math.min(drawIndex, this.ecgData.length);
      for (let i = Math.max(0, visiblePoints - w); i < visiblePoints; i++) {
        const x = i - Math.max(0, visiblePoints - w);
        const y = h / 2 - this.ecgData[i % this.ecgData.length] * (h * 0.4);
        if (i === Math.max(0, visiblePoints - w)) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      drawIndex += 3;
      if (drawIndex < this.ecgData.length * 2) {
        this.ecgAnimFrame = requestAnimationFrame(draw);
      }
    };

    ctx.fillStyle = '#0A1628';
    ctx.fillRect(0, 0, w, h);
    draw();
  },

  showTransform(type, index) {
    const card = document.getElementById('transform-' + type);
    if (!card) return;
    card.classList.add('visible');
    const canvas = card.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const size = 200;

    // Generate mathematical transform visualization
    const imageData = ctx.createImageData(size, size);
    const data = imageData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const nx = x / size, ny = y / size;
        let r, g, b;

        if (type === 'gaf') {
          // Gramian Angular Field — trigonometric patterns
          const val = Math.cos(this.ecgData[Math.floor(nx*this.ecgData.length/2)] * Math.PI +
                               this.ecgData[Math.floor(ny*this.ecgData.length/2)] * Math.PI);
          const v = (val + 1) / 2;
          r = Math.round(68 + v * 185);
          g = Math.round(1 + v * 230);
          b = Math.round(84 + (1-v) * 47);
        } else if (type === 'rp') {
          // Recurrence Plot — distance matrix
          const i1 = Math.floor(nx * this.ecgData.length / 2);
          const i2 = Math.floor(ny * this.ecgData.length / 2);
          const dist = Math.abs(this.ecgData[i1] - this.ecgData[i2]);
          const v = 1 - Math.min(dist * 3, 1);
          r = Math.round(v * 50);
          g = Math.round(v * 100);
          b = Math.round(80 + v * 175);
        } else if (type === 'mtf') {
          // Markov Transition Field — probability patterns
          const i1 = Math.floor(nx * this.ecgData.length / 2);
          const i2 = Math.floor(ny * this.ecgData.length / 2);
          const q1 = Math.floor((this.ecgData[i1]+0.5) * 4);
          const q2 = Math.floor((this.ecgData[i2]+0.5) * 4);
          const v = (q1 === q2 ? 0.8 : 0.2) + Math.sin(nx*20)*0.1;
          r = Math.round(13 + v * 227);
          g = Math.round(8 + v * 241);
          b = Math.round(135 + (1-v) * (-102));
        } else { // cwt
          // Continuous Wavelet Transform — time-frequency
          const freq = 1 + ny * 20;
          const ecgIdx = Math.floor(nx * this.ecgData.length / 2);
          let sum = 0;
          for (let k = -10; k <= 10; k++) {
            const ii = clamp(ecgIdx + k, 0, this.ecgData.length-1);
            sum += this.ecgData[ii] * Math.cos(freq * k * 0.3) * Math.exp(-k*k/(2*freq));
          }
          const v = (Math.tanh(sum * 2) + 1) / 2;
          r = Math.round(v * 255);
          g = Math.round(Math.max(0, (v-0.33)/0.67) * 255);
          b = Math.round(Math.max(0, (v-0.67)/0.33) * 255);
        }

        data[idx] = clamp(r, 0, 255);
        data[idx+1] = clamp(g, 0, 255);
        data[idx+2] = clamp(b, 0, 255);
        data[idx+3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  },

  animateAccuracy() {
    const el = document.getElementById('tmeca-accuracy');
    if (!el) return;
    animateValue(el, 0, 98.41, 2000);
    // After a brief delay, show decimal
    setTimeout(() => {
      el.textContent = '98.41';
    }, 2200);
  },

  populateImpactWall() {
    const impacts = [
      { emoji: '🫀', title: 'Cardiac Arrhythmia Detection', desc: 'T-MECA classifies dangerous heart rhythms with 98.41% accuracy using signal transforms + deep learning.' },
      { emoji: '🔬', title: 'Tumor Detection', desc: 'CNNs trained with the same math detect cancerous cells in pathology slides, saving months of analysis.' },
      { emoji: '👁️', title: 'Diabetic Retinopathy', desc: 'Deep learning screens eye images, preventing blindness in millions of diabetic patients worldwide.' },
      { emoji: '🦠', title: 'Sepsis Prediction', desc: 'AI models predict life-threatening sepsis 6 hours before clinical symptoms appear.' },
      { emoji: '🧬', title: 'Drug Discovery', desc: 'Kernel methods and embeddings find new drug candidates in molecular space, cutting discovery time by years.' },
      { emoji: '🏥', title: 'Medical Imaging', desc: 'PCA, CNNs, and diffusion models analyze X-rays, MRIs, and CT scans faster than radiologists.' },
    ];

    const container = document.getElementById('impact-grid');
    if (!container) return;
    container.innerHTML = impacts.map(imp => `
      <div class="impact-card">
        <span class="impact-card-emoji">${imp.emoji}</span>
        <h4>${imp.title}</h4>
        <p>${imp.desc}</p>
      </div>
    `).join('');
  }
};

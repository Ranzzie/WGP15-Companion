// WGP15 Controller Companion - High Precision Input & Circularity Engine
// Supports 60fps / 120fps / 144fps polling via requestAnimationFrame

let activeGamepadIndex = null;

// Stick Tracking & Circularity Benchmark Data
const stickData = {
  left: {
    history: [],
    maxPoints: 800,
    deadzone: 0.05
  },
  right: {
    history: [],
    maxPoints: 800,
    deadzone: 0.05
  }
};

// Canvas Setup
const canvasLeft = document.getElementById('canvasLeftStick');
const ctxLeft = canvasLeft.getContext('2d');
const canvasRight = document.getElementById('canvasRightStick');
const ctxRight = canvasRight.getContext('2d');

// UI Elements
const statusPill = document.getElementById('statusPill');
const statusText = document.getElementById('statusText');
const deviceName = document.getElementById('deviceName');

// Reset Button
document.getElementById('btnResetBenchmark').addEventListener('click', () => {
  stickData.left.history = [];
  stickData.right.history = [];
  document.getElementById('lblLeftAvgErr').textContent = '0.0%';
  document.getElementById('lblLeftMaxErr').textContent = '0.0%';
  document.getElementById('lblRightAvgErr').textContent = '0.0%';
  document.getElementById('lblRightMaxErr').textContent = '0.0%';
});

// Window Gamepad Listeners
window.addEventListener('gamepadconnected', (e) => {
  console.log('Gamepad connected:', e.gamepad);
  activeGamepadIndex = e.gamepad.index;
  updateStatus(true, e.gamepad.id);
});

window.addEventListener('gamepaddisconnected', (e) => {
  console.log('Gamepad disconnected:', e.gamepad);
  if (activeGamepadIndex === e.gamepad.index) {
    activeGamepadIndex = null;
    updateStatus(false);
  }
});

function updateStatus(connected, name = '') {
  if (connected) {
    statusPill.classList.add('active');
    statusText.textContent = 'ONLINE (Aktif)';
    deviceName.textContent = name || 'Gamepad Terdeteksi';
  } else {
    statusPill.classList.remove('active');
    statusText.textContent = 'Menunggu Gamepad...';
    deviceName.textContent = 'Tidak ada perangkat aktif';
  }
}

// Button Mapping Standard W3C Gamepad:
// 0: A, 1: B, 2: X, 3: Y
// 4: LB, 5: RB, 6: LT, 7: RT
// 8: Back/View, 9: Start/Menu
// 10: L3, 11: R3
// 12: D-Up, 13: D-Down, 14: D-Left, 15: D-Right
// 16: Home / Logo

function pollGamepad() {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  let gp = null;

  if (activeGamepadIndex !== null && gamepads[activeGamepadIndex]) {
    gp = gamepads[activeGamepadIndex];
  } else {
    for (let i = 0; i < gamepads.length; i++) {
      if (gamepads[i]) {
        gp = gamepads[i];
        activeGamepadIndex = i;
        updateStatus(true, gp.id);
        break;
      }
    }
  }

  if (gp) {
    processButtons(gp);
    processAxes(gp);
  } else {
    drawRadar(ctxLeft, 0, 0, stickData.left.history);
    drawRadar(ctxRight, 0, 0, stickData.right.history);
  }

  requestAnimationFrame(pollGamepad);
}

function processButtons(gp) {
  // Helpers
  const isPressed = (idx) => {
    if (!gp.buttons[idx]) return false;
    return typeof gp.buttons[idx] === 'object' ? gp.buttons[idx].pressed : gp.buttons[idx] > 0.5;
  };

  const getVal = (idx) => {
    if (!gp.buttons[idx]) return 0;
    return typeof gp.buttons[idx] === 'object' ? gp.buttons[idx].value : gp.buttons[idx];
  };

  // ABXY
  toggleBtn('btn-a', isPressed(0));
  toggleBtn('btn-b', isPressed(1));
  toggleBtn('btn-x', isPressed(2));
  toggleBtn('btn-y', isPressed(3));

  // Bumpers & Sticks
  toggleBtn('btn-lb', isPressed(4));
  toggleBtn('btn-rb', isPressed(5));
  toggleBtn('thumb-lstick', isPressed(10));
  toggleBtn('thumb-rstick', isPressed(11));

  // Triggers (Analog & Visual Bars)
  const ltVal = getVal(6);
  const rtVal = getVal(7);

  updateTrigger('bar-lt', 'val-lt', 'gaugeLt', 'numLt', 'tagLtMode', ltVal);
  updateTrigger('bar-rt', 'val-rt', 'gaugeRt', 'numRt', 'tagRtMode', rtVal);

  // System
  toggleBtn('btn-back', isPressed(8));
  toggleBtn('btn-start', isPressed(9));
  toggleBtn('btn-home', isPressed(16));

  // D-Pad
  toggleBtn('btn-du', isPressed(12));
  toggleBtn('btn-dd', isPressed(13));
  toggleBtn('btn-dl', isPressed(14));
  toggleBtn('btn-dr', isPressed(15));
}

function toggleBtn(id, active) {
  const el = document.getElementById(id);
  if (!el) return;
  if (active) {
    el.classList.add('active');
  } else {
    el.classList.remove('active');
  }
}

function updateTrigger(barId, valId, gaugeId, numId, tagId, val) {
  const pct = (val * 100).toFixed(1);
  const formattedVal = val.toFixed(3);

  const bar = document.getElementById(barId);
  const valEl = document.getElementById(valId);
  const gauge = document.getElementById(gaugeId);
  const num = document.getElementById(numId);
  const tag = document.getElementById(tagId);

  if (bar) bar.style.width = `${pct}%`;
  if (valEl) valEl.textContent = val.toFixed(2);
  if (gauge) gauge.style.width = `${pct}%`;
  if (num) num.textContent = `${pct}% (${formattedVal})`;

  // Hair-Trigger detection (if it stops reaching 100% or reaches 100% instantly)
  if (tag) {
    if (val > 0.05 && val < 0.85) {
      tag.textContent = 'Analog (Linear)';
      tag.style.color = 'var(--accent-cyan)';
    } else if (val >= 0.85) {
      tag.textContent = 'Hair-Trigger / Full';
      tag.style.color = 'var(--accent-gold)';
    } else {
      tag.textContent = 'Idle (0.00)';
      tag.style.color = 'var(--text-muted)';
    }
  }
}

function processAxes(gp) {
  // Left Stick: Axes 0 (X), 1 (Y)
  // Right Stick: Axes 2 (X), 3 (Y)
  const lx = gp.axes[0] || 0;
  const ly = gp.axes[1] || 0;
  const rx = gp.axes[2] || 0;
  const ry = gp.axes[3] || 0;

  // Move Visual Stick Thumbnails
  moveStickThumb('thumb-lstick', lx, ly);
  moveStickThumb('thumb-rstick', rx, ry);

  // Update Left Stick Radar & Benchmark
  updateStickBenchmark('left', lx, ly, ctxLeft, 'lblLeftXY', 'lblLeftAvgErr', 'lblLeftMaxErr');
  // Update Right Stick Radar & Benchmark
  updateStickBenchmark('right', rx, ry, ctxRight, 'lblRightXY', 'lblRightAvgErr', 'lblRightMaxErr');
}

function moveStickThumb(id, x, y) {
  const el = document.getElementById(id);
  if (!el) return;
  const maxDisplacement = 22; // px
  const dx = x * maxDisplacement;
  const dy = y * maxDisplacement;
  el.style.transform = `translate(${dx}px, ${dy}px)`;
}

function updateStickBenchmark(side, x, y, ctx, xyLblId, avgLblId, maxLblId) {
  const obj = stickData[side];
  const mag = Math.sqrt(x * x + y * y);

  // Update Label
  document.getElementById(xyLblId).textContent = `${x.toFixed(2)}, ${y.toFixed(2)}`;

  // Record point if outside deadzone
  if (mag > 0.35) {
    obj.history.push({ x, y, mag });
    if (obj.history.length > obj.maxPoints) {
      obj.history.shift();
    }
  }

  // Draw Radar
  drawRadar(ctx, x, y, obj.history);

  // Calculate Circularity Error
  calculateCircularity(obj.history, avgLblId, maxLblId);
}

function drawRadar(ctx, curX, curY, history) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const maxR = w * 0.42;

  ctx.clearRect(0, 0, w, h);

  // Background Grid Rings
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
  ctx.lineWidth = 1;

  // Outer reference circle (1.00 magnitude)
  ctx.beginPath();
  ctx.arc(cx, cy, maxR, 0, Math.PI * 2);
  ctx.stroke();

  // 50% reference circle
  ctx.beginPath();
  ctx.arc(cx, cy, maxR * 0.5, 0, Math.PI * 2);
  ctx.stroke();

  // Deadzone ring (5%)
  ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
  ctx.beginPath();
  ctx.arc(cx, cy, maxR * 0.08, 0, Math.PI * 2);
  ctx.stroke();

  // Axis Crosshair
  ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
  ctx.beginPath();
  ctx.moveTo(cx, 10); ctx.lineTo(cx, h - 10);
  ctx.moveTo(10, cy); ctx.lineTo(w - 10, cy);
  ctx.stroke();

  // History Dots
  for (let i = 0; i < history.length; i++) {
    const pt = history[i];
    const px = cx + pt.x * maxR;
    const py = cy + pt.y * maxR;
    const alpha = (i / history.length) * 0.6 + 0.1;

    // Error relative to ideal radius (1.0)
    const err = Math.abs(pt.mag - 1.0);
    ctx.fillStyle = err > 0.15 ? `rgba(239, 68, 68, ${alpha})` : `rgba(0, 240, 180, ${alpha})`;
    ctx.fillRect(px - 1, py - 1, 2, 2);
  }

  // Current Position Pointer
  const curPx = cx + curX * maxR;
  const curPy = cy + curY * maxR;

  // Glow
  ctx.shadowColor = '#00f0b4';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#00f0b4';
  ctx.beginPath();
  ctx.arc(curPx, curPy, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function calculateCircularity(history, avgId, maxId) {
  if (history.length < 30) return;

  let totalErr = 0;
  let maxErr = 0;
  let outerCount = 0;

  for (const pt of history) {
    if (pt.mag > 0.7) {
      const err = Math.abs(pt.mag - 1.0) * 100;
      totalErr += err;
      if (err > maxErr) maxErr = err;
      outerCount++;
    }
  }

  if (outerCount > 10) {
    const avg = (totalErr / outerCount).toFixed(1);
    const max = maxErr.toFixed(1);

    const avgEl = document.getElementById(avgId);
    const maxEl = document.getElementById(maxId);

    avgEl.textContent = `${avg}%`;
    maxEl.textContent = `${max}%`;

    // Visual Rating
    if (parseFloat(avg) <= 5.0) {
      avgEl.className = 'good';
    } else {
      avgEl.className = '';
    }
  }
}

// Vibration / Rumble Actuator
async function triggerRumble(weakMag, strongMag, durationMs) {
  const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
  if (activeGamepadIndex === null || !gamepads[activeGamepadIndex]) {
    alert('Gamepad belum terhubung atau tombol belum ditekan.');
    return;
  }
  const gp = gamepads[activeGamepadIndex];
  if (gp.vibrationActuator && typeof gp.vibrationActuator.playEffect === 'function') {
    try {
      await gp.vibrationActuator.playEffect('dual-rumble', {
        startDelay: 0,
        duration: durationMs,
        weakMagnitude: weakMag,
        strongMagnitude: strongMag
      });
    } catch (e) {
      console.warn('Vibration playEffect error:', e);
    }
  } else {
    alert('Browser atau driver stik saat ini belum mengaktifkan Gamepad Vibration Actuator.');
  }
}

async function triggerPulseRumble() {
  await triggerRumble(0.2, 0.2, 100);
  setTimeout(async () => {
    await triggerRumble(0.5, 0.5, 120);
    setTimeout(async () => {
      await triggerRumble(1.0, 1.0, 200);
    }, 180);
  }, 150);
}

// Start Main Loop
requestAnimationFrame(pollGamepad);

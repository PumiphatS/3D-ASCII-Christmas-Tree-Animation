const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const hudStats = document.getElementById("hud-stats");

const btnReplay = document.getElementById("btn-replay");
const btnSanta = document.getElementById("btn-santa");
const btnSnow = document.getElementById("btn-snow");
const btnMusic = document.getElementById("btn-music");
const bgAudio = document.getElementById("bg-audio");
const spinSlider = document.getElementById("spin-speed");
const countdownEl = document.getElementById("countdown-timer");

let width = 0;
let height = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

const CELL_W = 8.5;
const CELL_H = 14;
let cols = 0;
let rows = 0;

let rotY = 0.35;
let pitchX = 0.08;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let spinSpeed = 0.7;

const BUILD_DURATION = 7.5;
let startTime = performance.now();
let snowEnabled = true;
let santaActive = false;
let santaProgress = 0;
let santaAutoTriggered = false;
let musicPlaying = false;

const LIGHT = normalize3({ x: 0.55, y: 0.72, z: 0.65 });

const RAMP_FOLIAGE = ".,:;+=*#%@";
const RAMP_SOLID = ".:-=+*#%@";
const RAMP_GLOW = "+*#%@";

function normalize3(v) {
  const len = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function dot3(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

const MIN_Y = -16.0;
const MAX_Y = 21.5;
const staticVoxels = [];

function addVoxel(x, y, z, nx, ny, nz, type, extra = {}) {
  const n = normalize3({ x: nx, y: ny, z: nz });
  staticVoxels.push({
    x,
    y,
    z,
    nx: n.x,
    ny: n.y,
    nz: n.z,
    type,
    buildOrder: (y - MIN_Y) / (MAX_Y - MIN_Y),
    ...extra
  });
}

function generateTreeVoxels() {
  staticVoxels.length = 0;

  for (let y = -16.0; y <= -9.5; y += 0.55) {
    const r = 1.65;
    const steps = 20;
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      addVoxel(x, y, z, Math.cos(a), 0.08, Math.sin(a), "trunk");
    }
  }

  const tiers = [
    { yBottom: -10.8, yTop: -4.2, rBottom: 10.6, rTop: 5.2 },
    { yBottom: -6.2,  yTop: 0.2,  rBottom: 9.2,  rTop: 4.3 },
    { yBottom: -1.6,  yTop: 4.6,  rBottom: 7.8,  rTop: 3.4 },
    { yBottom: 2.8,   yTop: 8.6,  rBottom: 6.3,  rTop: 2.5 },
    { yBottom: 6.8,   yTop: 12.2, rBottom: 4.8,  rTop: 1.7 },
    { yBottom: 10.6,  yTop: 15.2, rBottom: 3.4,  rTop: 0.9 },
    { yBottom: 13.8,  yTop: 17.8, rBottom: 2.0,  rTop: 0.12 }
  ];

  tiers.forEach((tier, tIdx) => {
    const yStep = 0.52;
    for (let y = tier.yBottom; y <= tier.yTop; y += yStep) {
      const t = (y - tier.yBottom) / (tier.yTop - tier.yBottom);
      const baseR = tier.rBottom * (1 - t) + tier.rTop * t;

      if (baseR > 1.8) {
        const innerR = baseR * 0.72;
        const innerSteps = Math.max(12, Math.floor(innerR * 5));
        for (let i = 0; i < innerSteps; i++) {
          const a = (i / innerSteps) * Math.PI * 2;
          addVoxel(
            Math.cos(a) * innerR,
            y,
            Math.sin(a) * innerR,
            Math.cos(a) * 0.4,
            -0.3,
            Math.sin(a) * 0.4,
            "core"
          );
        }
      }

      const lobes = 7 + (tIdx % 3);
      const circumSteps = Math.max(18, Math.floor(baseR * 8.2));
      for (let i = 0; i < circumSteps; i++) {
        const a = (i / circumSteps) * Math.PI * 2 + tIdx * 0.45;
        const scallop = 1 + 0.14 * Math.sin(a * lobes + y * 0.7) * (1 - t * 0.5);
        const r = baseR * scallop;
        const droop = -0.32 * (1 - t) * Math.abs(Math.sin(a * lobes));

        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        const vy = y + droop;

        const nx = Math.cos(a) * 0.85 + 0.2 * Math.cos(a * lobes);
        const nz = Math.sin(a) * 0.85 + 0.2 * Math.sin(a * lobes);
        const ny = 0.48 - 0.15 * (1 - t);

        addVoxel(x, vy, z, nx, ny, nz, "foliage");
      }
    }
  });

  const garlandSteps = 210;
  for (let i = 0; i < garlandSteps; i++) {
    const t = i / garlandSteps;
    const y = -10.2 + t * 27.2;
    const coneR = 10.6 * (1 - t * 0.96) + 0.35;
    const a = t * Math.PI * 2 * 5.2;
    const x = Math.cos(a) * coneR;
    const z = Math.sin(a) * coneR;
    addVoxel(x, y, z, Math.cos(a), 0.4, Math.sin(a), "garland", { phase: i * 0.35 });
  }

  const baubleCount = 46;
  for (let b = 0; b < baubleCount; b++) {
    const t = (b + 0.5) / baubleCount;
    const yCenter = -9.8 + t * 25.5;
    const coneR = 10.4 * (1 - t * 0.93) + 0.45;
    const angle = b * 2.39996;

    const bx = Math.cos(angle) * (coneR + 0.25);
    const bz = Math.sin(angle) * (coneR + 0.25);
    const isRed = b % 3 !== 0;
    const ballR = 0.68;

    const latSteps = 5;
    const lonSteps = 8;
    for (let la = 0; la <= latSteps; la++) {
      const phi = (la / latSteps) * Math.PI;
      const sinP = Math.sin(phi);
      const cosP = Math.cos(phi);
      for (let lo = 0; lo < lonSteps; lo++) {
        if ((la === 0 || la === latSteps) && lo > 0) continue;
        const theta = (lo / lonSteps) * Math.PI * 2;
        const sx = sinP * Math.cos(theta);
        const sy = cosP;
        const sz = sinP * Math.sin(theta);

        addVoxel(
          bx + sx * ballR,
          yCenter + sy * ballR,
          bz + sz * ballR,
          sx,
          sy,
          sz,
          isRed ? "bauble_red" : "bauble_gold",
          { phase: b * 0.7 }
        );
      }
    }
  }

  const gifts = [
    { cx: -7.8, cz: 5.2,  sx: 2.3, sy: 1.9, sz: 2.1, rot: 0.35,  boxType: "gift_red",  ribType: "ribbon_gold" },
    { cx: 8.2,  cz: 4.5,  sx: 2.5, sy: 2.1, sz: 2.3, rot: -0.45, boxType: "gift_blue", ribType: "ribbon_white" },
    { cx: -6.5, cz: -6.8, sx: 2.1, sy: 1.7, sz: 2.0, rot: 0.7,   boxType: "gift_gold", ribType: "ribbon_red" },
    { cx: 7.4,  cz: -6.2, sx: 2.0, sy: 2.3, sz: 1.9, rot: -0.25, boxType: "gift_red",  ribType: "ribbon_white" },
    { cx: 0.8,  cz: 9.2,  sx: 1.8, sy: 1.4, sz: 1.7, rot: 0.18,  boxType: "gift_blue", ribType: "ribbon_gold" }
  ];

  gifts.forEach((g) => {
    const cosR = Math.cos(g.rot);
    const sinR = Math.sin(g.rot);
    const step = 0.44;
    const baseY = -16.0;

    for (let lx = -g.sx; lx <= g.sx; lx += step) {
      for (let ly = 0; ly <= g.sy * 2; ly += step) {
        for (let lz = -g.sz; lz <= g.sz; lz += step) {
          const onX = Math.abs(Math.abs(lx) - g.sx) < step * 0.65;
          const onYTop = Math.abs(ly - g.sy * 2) < step * 0.65;
          const onZ = Math.abs(Math.abs(lz) - g.sz) < step * 0.65;
          if (!onX && !onYTop && !onZ) continue;

          const isRibbon = Math.abs(lx) < 0.38 || Math.abs(lz) < 0.38;

          let lnx = 0, lny = 0, lnz = 0;
          if (onYTop) lny = 1;
          else if (onX) lnx = Math.sign(lx);
          else if (onZ) lnz = Math.sign(lz);

          const wx = g.cx + lx * cosR - lz * sinR;
          const wz = g.cz + lx * sinR + lz * cosR;
          const wy = baseY + ly;

          const wnx = lnx * cosR - lnz * sinR;
          const wnz = lnx * sinR + lnz * cosR;

          addVoxel(
            wx,
            wy,
            wz,
            wnx,
            lny,
            wnz,
            isRibbon ? g.ribType : g.boxType
          );
        }
      }
    }

    const bowY = baseY + g.sy * 2 + 0.45;
    for (let bAngle = 0; bAngle < Math.PI * 2; bAngle += 0.45) {
      const loopR = 0.65 * Math.abs(Math.sin(bAngle * 2));
      const lx = Math.cos(bAngle) * loopR;
      const lz = Math.sin(bAngle) * loopR * 0.45;
      const ly = Math.abs(Math.sin(bAngle * 2)) * 0.42;

      const wx = g.cx + lx * cosR - lz * sinR;
      const wz = g.cz + lx * sinR + lz * cosR;
      addVoxel(wx, bowY + ly, wz, 0, 1, 0, g.ribType);
    }
  });

  const starY = 19.3;
  const starOuterR = 2.25;
  const starInnerR = 0.92;
  const starDepth = 0.65;

  for (let side of [-1, 1]) {
    addVoxel(0, starY, side * starDepth, 0, 0, side, "star");

    for (let p = 0; p < 10; p++) {
      const a1 = (p / 10) * Math.PI * 2 - Math.PI / 2;
      const r1 = p % 2 === 0 ? starOuterR : starInnerR;
      const vx = Math.cos(a1) * r1;
      const vy = starY - Math.sin(a1) * r1;

      for (let f = 0.25; f <= 1.0; f += 0.25) {
        const px = vx * f;
        const py = starY + (vy - starY) * f;
        const pz = side * starDepth * (1 - f * 0.85);
        addVoxel(px, py, pz, px * 0.25, (py - starY) * 0.25, side, "star");
      }
    }
  }
}

function getSantaVoxels(progress, time) {
  const voxels = [];
  const angle = (progress - 0.5) * Math.PI * 1.45;
  const orbitR = 17.5;
  const cx = Math.sin(angle) * orbitR * 1.35;
  const cz = Math.cos(angle) * orbitR;
  const cy = 6.5 + Math.sin(progress * Math.PI * 2) * 2.2;

  const dirX = Math.cos(angle) * 1.35;
  const dirZ = -Math.sin(angle);
  const hLen = Math.hypot(dirX, dirZ) || 1;
  const fx = dirX / hLen;
  const fz = dirZ / hLen;
  const rx = -fz;
  const rz = fx;

  function addLocalSanta(localFwd, localUp, localRight, nx, ny, nz, type) {
    const wx = cx + fx * localFwd + rx * localRight;
    const wy = cy + localUp;
    const wz = cz + fz * localFwd + rz * localRight;

    const wnx = fx * nx + rx * nz;
    const wnz = fz * nx + rz * nz;
    const n = normalize3({ x: wnx, y: ny, z: wnz });

    voxels.push({ x: wx, y: wy, z: wz, nx: n.x, ny: n.y, nz: n.z, type });
  }

  for (let f = -2.4; f <= 1.8; f += 0.45) {
    for (let r = -0.9; r <= 0.9; r += 0.45) {
      if (Math.abs(Math.abs(r) - 0.9) < 0.25) {
        const curl = f > 1.2 ? Math.pow(f - 1.2, 2) * 1.4 : 0;
        addLocalSanta(f, -1.35 + curl, r, 0, -0.5, Math.sign(r), "santa_gold");
      }
      addLocalSanta(f, -0.7, r, 0, 1, 0, "santa_red");
      if (Math.abs(Math.abs(r) - 0.9) < 0.25) {
        const wallH = f < -1.2 ? 0.8 : 0.25;
        for (let u = -0.7; u <= wallH; u += 0.42) {
          addLocalSanta(f, u, r, 0, 0.2, Math.sign(r), "santa_red");
        }
        addLocalSanta(f, wallH + 0.35, r, 0, 1, Math.sign(r), "santa_gold");
      }
    }
  }

  for (let dy = -0.3; dy <= 0.9; dy += 0.4) {
    for (let da = 0; da < Math.PI * 2; da += 0.9) {
      addLocalSanta(-1.3 + Math.cos(da) * 0.55, dy, Math.sin(da) * 0.55, Math.cos(da), 0.3, Math.sin(da), "gift_gold");
    }
  }
  for (let u = -0.2; u <= 0.8; u += 0.4) {
    for (let da = 0; da < Math.PI * 2; da += 0.8) {
      addLocalSanta(0.2 + Math.cos(da) * 0.55, u, Math.sin(da) * 0.55, Math.cos(da), 0.2, Math.sin(da), "santa_red");
    }
  }
  addLocalSanta(0.65, 1.15, 0, 1, 0, 0, "ribbon_white");
  addLocalSanta(0.25, 1.25, 0, 0, 0.5, 0, "santa_red");
  addLocalSanta(0.1, 1.65, 0, 0, 1, 0, "santa_red");
  addLocalSanta(-0.25, 1.75, 0, -1, 0.5, 0, "ribbon_white");

  for (let pair = 0; pair < 3; pair++) {
    const baseFwd = 4.2 + pair * 3.1;
    const gallop = Math.sin(time * 9 + pair * 1.1) * 0.45;

    for (let rf = 1.8; rf <= baseFwd; rf += 0.7) {
      addLocalSanta(rf, -0.1 + gallop * 0.25, -0.55, 0, 1, 0, "santa_gold");
      addLocalSanta(rf, -0.1 + gallop * 0.25, 0.55, 0, 1, 0, "santa_gold");
    }

    for (let side of [-0.68, 0.68]) {
      for (let bf = -0.7; bf <= 0.7; bf += 0.42) {
        addLocalSanta(baseFwd + bf, 0.0 + gallop, side, 0, 0.8, Math.sign(side) * 0.4, "reindeer");
      }
      const legSwing = Math.cos(time * 9 + pair * 1.1) * 0.35;
      addLocalSanta(baseFwd - 0.5 - legSwing, -0.65 + gallop, side, -0.5, -0.5, 0, "reindeer");
      addLocalSanta(baseFwd + 0.5 + legSwing, -0.65 + gallop, side, 0.5, -0.5, 0, "reindeer");

      addLocalSanta(baseFwd + 0.85, 0.55 + gallop, side, 0.6, 0.6, 0, "reindeer");
      addLocalSanta(baseFwd + 1.15, 0.85 + gallop, side, 1, 0.3, 0, "reindeer");

      addLocalSanta(baseFwd + 0.9, 1.35 + gallop, side - 0.2, 0, 1, -0.4, "santa_gold");
      addLocalSanta(baseFwd + 0.9, 1.35 + gallop, side + 0.2, 0, 1, 0.4, "santa_gold");

      if (pair === 2 && side > 0) {
        addLocalSanta(baseFwd + 1.48, 0.85 + gallop, side, 1, 0, 0, "rudolph_nose");
      }
    }
  }

  return voxels;
}

const snowflakeGlyphs = ["*", "❄", "❅", "❆", "✳", "✶", "·"];
const snowflakes = Array.from({ length: 120 }, () => ({
  x: (Math.random() - 0.5) * 58,
  y: Math.random() * 46 - 20,
  z: (Math.random() - 0.5) * 58,
  speed: 1.0 + Math.random() * 2.5,
  drift: Math.random() * Math.PI * 2,
  glyph: snowflakeGlyphs[Math.floor(Math.random() * snowflakeGlyphs.length)],
  brightness: 0.5 + Math.random() * 0.5
}));

function shadeVoxel(v, time) {
  const diff = Math.max(0, dot3({ x: v.nx, y: v.ny, z: v.nz }, LIGHT));
  const rim = Math.pow(1 - Math.abs(v.viewNz || 0), 2) * 0.28;
  const shade = Math.min(1, 0.18 + diff * 0.78 + rim);

  switch (v.type) {
    case "core":
      return { ch: ":", color: "#052e16", glow: 0 };
    case "trunk": {
      const idx = Math.min(RAMP_SOLID.length - 1, Math.floor(shade * RAMP_SOLID.length));
      const color = shade > 0.55 ? "#92400e" : shade > 0.3 ? "#78350f" : "#451a03";
      return { ch: RAMP_SOLID[idx], color, glow: 0 };
    }
    case "foliage": {
      const idx = Math.min(RAMP_FOLIAGE.length - 1, Math.floor(shade * RAMP_FOLIAGE.length));
      let color = "#15803d";
      if (shade > 0.78) color = "#4ade80";
      else if (shade > 0.56) color = "#22c55e";
      else if (shade > 0.34) color = "#16a34a";
      else color = "#14532d";
      return { ch: RAMP_FOLIAGE[idx], color, glow: 0 };
    }
    case "bauble_red": {
      const pulse = 0.85 + 0.15 * Math.sin(time * 4 + (v.phase || 0));
      const spec = shade > 0.82;
      const idx = Math.min(RAMP_SOLID.length - 1, Math.floor(shade * RAMP_SOLID.length));
      return {
        ch: spec ? "@" : RAMP_SOLID[idx],
        color: spec ? "#fecdd3" : shade > 0.45 ? "#ff2a4b" : "#9f1239",
        glow: spec ? 10 * pulse : 5 * pulse
      };
    }
    case "bauble_gold": {
      const spec = shade > 0.82;
      const idx = Math.min(RAMP_SOLID.length - 1, Math.floor(shade * RAMP_SOLID.length));
      return {
        ch: spec ? "@" : RAMP_SOLID[idx],
        color: spec ? "#fef9c3" : shade > 0.45 ? "#facc15" : "#a16207",
        glow: spec ? 9 : 4
      };
    }
    case "garland": {
      const twinkle = 0.5 + 0.5 * Math.sin(time * 5 + (v.phase || 0));
      return {
        ch: twinkle > 0.55 ? "*" : "+",
        color: twinkle > 0.55 ? "#fef08a" : "#f59e0b",
        glow: twinkle > 0.55 ? 8 : 3
      };
    }
    case "star": {
      const pulse = 0.75 + 0.25 * Math.sin(time * 6);
      const idx = Math.min(RAMP_GLOW.length - 1, Math.floor(shade * RAMP_GLOW.length));
      return {
        ch: RAMP_GLOW[idx],
        color: shade > 0.65 ? "#fef9c3" : "#facc15",
        glow: 14 * pulse
      };
    }
    case "gift_red": {
      const idx = Math.min(RAMP_SOLID.length - 1, Math.floor(shade * RAMP_SOLID.length));
      return { ch: RAMP_SOLID[idx], color: shade > 0.65 ? "#f87171" : shade > 0.38 ? "#dc2626" : "#7f1d1d", glow: 0 };
    }
    case "gift_blue": {
      const idx = Math.min(RAMP_SOLID.length - 1, Math.floor(shade * RAMP_SOLID.length));
      return { ch: RAMP_SOLID[idx], color: shade > 0.65 ? "#60a5fa" : shade > 0.38 ? "#2563eb" : "#1e3a8a", glow: 0 };
    }
    case "gift_gold": {
      const idx = Math.min(RAMP_SOLID.length - 1, Math.floor(shade * RAMP_SOLID.length));
      return { ch: RAMP_SOLID[idx], color: shade > 0.65 ? "#fde047" : shade > 0.38 ? "#eab308" : "#854d0e", glow: 0 };
    }
    case "ribbon_gold": return { ch: "#", color: "#fef08a", glow: 4 };
    case "ribbon_white": return { ch: "#", color: "#f8fafc", glow: 3 };
    case "ribbon_red": return { ch: "#", color: "#ff2a4b", glow: 4 };
    case "santa_red": return { ch: "@", color: shade > 0.45 ? "#ff2a4b" : "#b91c1c", glow: 5 };
    case "santa_gold": return { ch: "*", color: "#fde047", glow: 6 };
    case "reindeer": return { ch: shade > 0.5 ? "#" : "=", color: shade > 0.5 ? "#d97706" : "#92400e", glow: 0 };
    case "rudolph_nose": return { ch: "@", color: "#ff1e42", glow: 14 };
    case "snowflake":
      return { ch: v.glyph, color: v.brightness > 0.75 ? "#ffffff" : "#93c5fd", glow: v.brightness > 0.75 ? 6 : 2 };
    default: return { ch: ".", color: "#cbd5e1", glow: 0 };
  }
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  cols = Math.floor(width / CELL_W);
  rows = Math.floor(height / CELL_H);
}

window.addEventListener("resize", resize);

canvas.addEventListener("pointerdown", (e) => {
  isDragging = true;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
});

window.addEventListener("pointermove", (e) => {
  if (!isDragging) return;
  const dx = e.clientX - lastMouseX;
  const dy = e.clientY - lastMouseY;
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;

  rotY += dx * 0.008;
  pitchX = Math.max(-0.45, Math.min(0.65, pitchX + dy * 0.006));
});

window.addEventListener("pointerup", () => {
  isDragging = false;
});

btnReplay.addEventListener("click", () => {
  startTime = performance.now();
  santaActive = false;
  santaProgress = 0;
  santaAutoTriggered = false;
});

btnSanta.addEventListener("click", () => {
  santaActive = true;
  santaProgress = 0;
});

btnSnow.addEventListener("click", () => {
  snowEnabled = !snowEnabled;
  btnSnow.textContent = snowEnabled ? "Snow: ON" : "Snow: OFF";
});

btnMusic.addEventListener("click", () => {
  musicPlaying = !musicPlaying;
  if (musicPlaying) {
    bgAudio.play().then(() => {
      btnMusic.textContent = "Music: ON";
      btnMusic.style.borderColor = "#4ade80";
      btnMusic.style.boxShadow = "0 0 12px rgba(74, 222, 128, 0.45)";
    }).catch(err => {
      console.log("Audio autoplay prevented:", err);
      musicPlaying = false;
    });
  } else {
    bgAudio.pause();
    btnMusic.textContent = "Music: OFF";
    btnMusic.style.borderColor = "rgba(148, 163, 184, 0.25)";
    btnMusic.style.boxShadow = "none";
  }
});

spinSlider.addEventListener("input", (e) => {
  spinSpeed = parseFloat(e.target.value);
});

function updateCountdown() {
  const now = new Date();
  let year = now.getFullYear();
  let christmas = new Date(year, 11, 25);

  if (now > christmas) {
    christmas = new Date(year + 1, 11, 25);
  }

  const diff = christmas - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  if (countdownEl) {
    countdownEl.textContent = `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
  }
}

setInterval(updateCountdown, 1000);
updateCountdown();

let prevFrameTime = performance.now();

function render(now) {
  const dt = Math.min(0.05, (now - prevFrameTime) / 1000);
  prevFrameTime = now;

  const elapsed = (now - startTime) / 1000;
  const buildProgress = Math.min(1, elapsed / BUILD_DURATION);

  if (!isDragging) {
    rotY += spinSpeed * dt;
  }

  if (buildProgress >= 1 && !santaAutoTriggered) {
    santaAutoTriggered = true;
    santaActive = true;
    santaProgress = 0;
  }

  if (santaActive) {
    santaProgress += dt * 0.14;
    if (santaProgress > 1.15) {
      santaActive = false;
    }
  }

  ctx.fillStyle = "#030712";
  ctx.fillRect(0, 0, width, height);

  const totalCells = cols * rows;
  const zBuffer = new Float32Array(totalCells);
  zBuffer.fill(-Infinity);
  const cellBuffer = new Array(totalCells);

  const cosY = Math.cos(rotY);
  const sinY = Math.sin(rotY);
  const cosP = Math.cos(pitchX);                                                                                    
  const sinP = Math.sin(pitchX);

  const cameraDist = 50
  const fovScale = Math.min(width, height) * 0.72;
  const centerX = width * 0.5;
  const centerY = height * 0.54;

  function projectAndPlot(v, applyTreeSpin) {
    let x = v.x;
    let y = v.y;
    let z = v.z;
    let nx = v.nx;
    let ny = v.ny;
    let nz = v.nz;

    if (applyTreeSpin) {
      const rx = x * cosY - z * sinY;
      const rz = x * sinY + z * cosY;
      x = rx;
      z = rz;

      const rnx = nx * cosY - nz * sinY;
      const rnz = nx * sinY + nz * cosY;
      nx = rnx;
      nz = rnz;
    }

    const py = y * cosP - z * sinP;
    const pz = y * sinP + z * cosP;
    const pny = ny * cosP - nz * sinP;
    const pnz = ny * sinP + nz * cosP;

    const depth = cameraDist - pz;
    if (depth <= 2) return;

    const invDepth = fovScale / depth;
    const sx = centerX + x * invDepth;
    const sy = centerY - py * invDepth;

    const col = Math.floor(sx / CELL_W);
    const row = Math.floor(sy / CELL_H);

    if (col < 0 || col >= cols || row < 0 || row >= rows) return;

    const idx = row * cols + col;
    if (pz > zBuffer[idx]) {
      zBuffer[idx] = pz;
      cellBuffer[idx] = {
        ...v,
        nx,
        ny: pny,
        nz: pnz,
        viewNz: pnz
      };
    }
  }

  let visibleCount = 0;
  for (let i = 0; i < staticVoxels.length; i++) {
    const v = staticVoxels[i];
    if (v.buildOrder <= buildProgress) {
      visibleCount++;
      projectAndPlot(v, true);
    }
  }

  if (santaActive) {
    const santaVoxels = getSantaVoxels(santaProgress, elapsed);
    for (let i = 0; i < santaVoxels.length; i++) {
      projectAndPlot(santaVoxels[i], false);
    }
  }

  if (snowEnabled) {
    for (let i = 0; i < snowflakes.length; i++) {
      const s = snowflakes[i];
      s.y -= s.speed * dt;
      s.x += Math.sin(elapsed * 1.5 + s.drift) * 0.6 * dt;
      s.z += Math.cos(elapsed * 1.2 + s.drift) * 0.4 * dt;
      if (s.y < -20) {
        s.y = 26;
        s.x = (Math.random() - 0.5) * 58;
        s.z = (Math.random() - 0.5) * 58;
      }
      projectAndPlot({ x: s.x, y: s.y, z: s.z, nx: 0, ny: 1, nz: 0, type: "snowflake", glyph: s.glyph, brightness: s.brightness }, false);
    }
  }

  ctx.font = `600 ${CELL_H - 1}px "JetBrains Mono", "Fira Code", Consolas, monospace`;
  ctx.textBaseline = "top";

  for (let r = 0; r < rows; r++) {
    const drawY = r * CELL_H;
    for (let c = 0; c < cols; c++) {
      const cell = cellBuffer[r * cols + c];
      if (!cell) continue;

      const styled = shadeVoxel(cell, elapsed);
      ctx.fillStyle = styled.color;
      if (styled.glow > 0) {
        ctx.shadowColor = styled.color;
        ctx.shadowBlur = styled.glow;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.fillText(styled.ch, c * CELL_W, drawY);
    }
  }
  ctx.shadowBlur = 0;

  const deg = Math.round(((rotY * 180) / Math.PI) % 360);
  const pct = Math.round(buildProgress * 100);
  hudStats.textContent = `t: ${elapsed.toFixed(2)}s | build: ${pct}% | voxels: ${visibleCount} | rot: ${deg}°`;

  requestAnimationFrame(render);
}

generateTreeVoxels();
resize();
requestAnimationFrame(render);

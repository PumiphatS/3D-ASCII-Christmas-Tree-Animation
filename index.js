const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");
const hudStats = document.getElementById("hud-stats");

const btnReplay = document.getElementById("btn-replay");
const btnSanta = document.getElementById("btn-santa");
const btnSnoopy = document.getElementById("btn-snoopy");
const btnPooh = document.getElementById("btn-pooh");
const btnSnow = document.getElementById("btn-snow");
const btnMusic = document.getElementById("btn-music");
const bgAudio = document.getElementById("bg-audio");
const audioSource = document.getElementById("audio-source");
const songSelect = document.getElementById("song-select");
const spinSlider = document.getElementById("spin-speed");
const countdownEl = document.getElementById("countdown-timer");

let width = 0;
let height = 0;
let dpr = Math.min(window.devicePixelRatio || 1, 2);

// Ultra-Fine Terminal ASCII Matrix for Maximum Sharpness matching reference style
const CELL_W = 3.8;
const CELL_H = 6.8;
let cols = 0;
let rows = 0;

let rotY = 0.35;
let pitchX = 0.08;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let spinSpeed = 0.6;

const BUILD_DURATION = 8.5;
let startTime = performance.now();
let snowEnabled = true;
let snoopyEnabled = false;
let poohEnabled = false;
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

const MIN_Y = -18.5;
const MAX_Y = 24.5;
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

<<<<<<< HEAD
  for (let gx = -20; gx <= 20; gx += 0.75) {
    for (let gz = -20; gz <= 20; gz += 0.75) {
      const distFromCenter = Math.hypot(gx, gz);
      if (distFromCenter <= 22) {
        const gy = -18.7 - Math.sin(gx * 0.25) * Math.cos(gz * 0.25) * 0.5;
        addVoxel(gx, gy, gz, 0, 1, 0, distFromCenter < 14 ? "ground_snow" : "ground_ice", { phase: distFromCenter });
=======
  
  // Natural snowy winter floor
  for (let gx = -40; gx <= 40; gx += 0.5) {
    for (let gz = -40; gz <= 40; gz += 0.5) {
      const dist = Math.hypot(gx, gz);
      const angle = Math.atan2(gz, gx);

      // Slightly irregular outer edge instead of a perfect circle
      const edgeRadius =
        38 +
        Math.sin(angle * 5) * 0.7 +
        Math.cos(angle * 9) * 0.35;

      if (dist <= edgeRadius) {
        // Gentle natural snow surface
        const gy =
          -18.7 +
          Math.sin(gx * 0.16) * Math.cos(gz * 0.14) * 0.12 +
          Math.sin((gx + gz) * 0.08) * 0.08;

        // Irregular icy patches
        const icePattern =
          Math.sin(gx * 0.18 + 1.4) *
          Math.cos(gz * 0.21 - 0.7);

        const isIce =
          dist > 11.5 &&
          (icePattern > 0.76 || dist > 35.5);

        addVoxel(
          gx,
          gy,
          gz,
          0,
          1,
          0,
          isIce ? "ground_ice" : "ground_snow",
          { phase: gx * 0.17 + gz * 0.11 }
        );
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
      }
    }
  }

<<<<<<< HEAD
  for (let y = -18.5; y <= -11.0; y += 0.5) {
    const r = 2.1;
    const steps = 24;
=======

  for (let y = -18.5; y <= -11.0; y += 0.22) {
    const r = 2.15;
    const steps = 48;
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const barkRidge = 1 + 0.06 * Math.sin(a * 14 + y * 1.5);
      const x = Math.cos(a) * r * barkRidge;
      const z = Math.sin(a) * r * barkRidge;
      addVoxel(x, y, z, Math.cos(a), 0.08, Math.sin(a), "trunk");
    }
  }

  const tiers = [
<<<<<<< HEAD
    { yBottom: -12.5, yTop: -5.5, rBottom: 13.2, rTop: 6.8 },
    { yBottom: -7.5,  yTop: -0.5, rBottom: 11.6, rTop: 5.6 },
    { yBottom: -2.5,  yTop: 4.5,  rBottom: 9.8,  rTop: 4.5 },
    { yBottom: 2.5,   yTop: 9.5,  rBottom: 8.0,  rTop: 3.5 },
    { yBottom: 7.5,   yTop: 14.0, rBottom: 6.2,  rTop: 2.6 },
    { yBottom: 12.0,  yTop: 17.5, rBottom: 4.5,  rTop: 1.8 },
    { yBottom: 15.5,  yTop: 20.2, rBottom: 2.9,  rTop: 1.0 },
    { yBottom: 18.5,  yTop: 22.0, rBottom: 1.5,  rTop: 0.15 }
  ];

  tiers.forEach((tier, tIdx) => {
    const yStep = 0.48;
=======
    { yBottom: -12.5, yTop: -5.5, rBottom: 13.5, rTop: 7.0 },
    { yBottom: -7.5,  yTop: -0.5, rBottom: 11.8, rTop: 5.8 },
    { yBottom: -2.5,  yTop: 4.5,  rBottom: 10.0, rTop: 4.6 },
    { yBottom: 2.5,   yTop: 9.5,  rBottom: 8.2,  rTop: 3.6 },
    { yBottom: 7.5,   yTop: 14.0, rBottom: 6.4,  rTop: 2.7 },
    { yBottom: 12.0,  yTop: 17.5, rBottom: 4.6,  rTop: 1.9 },
    { yBottom: 15.5,  yTop: 20.2, rBottom: 3.0,  rTop: 1.1 },
    { yBottom: 18.5,  yTop: 22.0, rBottom: 1.6,  rTop: 0.15 }
  ];

  tiers.forEach((tier, tIdx) => {
    const yStep = 0.22;
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
    for (let y = tier.yBottom; y <= tier.yTop; y += yStep) {
      const t = (y - tier.yBottom) / (tier.yTop - tier.yBottom);
      const baseR = tier.rBottom * (1 - t) + tier.rTop * t;

<<<<<<< HEAD
      if (baseR > 2.0) {
        const innerR = baseR * 0.72;
        const innerSteps = Math.max(14, Math.floor(innerR * 5.5));
=======
      if (baseR > 1.3) {
        const innerR = baseR * 0.8;
        const innerSteps = Math.max(24, Math.floor(innerR * 11.0));
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
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

<<<<<<< HEAD
      const lobes = 8 + (tIdx % 3);
      const circumSteps = Math.max(22, Math.floor(baseR * 9.0));
=======
      const lobes = 10 + (tIdx % 3);
      const circumSteps = Math.max(42, Math.floor(baseR * 18.0));
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
      for (let i = 0; i < circumSteps; i++) {
        const a = (i / circumSteps) * Math.PI * 2 + tIdx * 0.4;
        const scallop = 1 + 0.16 * Math.sin(a * lobes + y * 0.65) * (1 - t * 0.45);
        const r = baseR * scallop;
        const droop = -0.38 * (1 - t) * Math.abs(Math.sin(a * lobes));

        const x = Math.cos(a) * r;
        const z = Math.sin(a) * r;
        const vy = y + droop;

        const nx = Math.cos(a) * 0.85 + 0.2 * Math.cos(a * lobes);
        const nz = Math.sin(a) * 0.85 + 0.2 * Math.sin(a * lobes);
        const ny = 0.5 - 0.15 * (1 - t);

        addVoxel(x, vy, z, nx, ny, nz, "foliage");
      }
    }
  });

<<<<<<< HEAD
  const garlandSteps = 280;
  for (let i = 0; i < garlandSteps; i++) {
    const t = i / garlandSteps;
    const y = -11.5 + t * 31.5;
    const coneR = 13.0 * (1 - t * 0.95) + 0.4;
    const a = t * Math.PI * 2 * 6.5;
    const x = Math.cos(a) * coneR;
    const z = Math.sin(a) * coneR;
    addVoxel(x, y, z, Math.cos(a), 0.4, Math.sin(a), "garland", { phase: i * 0.3 });
  }

  const baubleCount = 68;
  for (let b = 0; b < baubleCount; b++) {
    const t = (b + 0.5) / baubleCount;
    const yCenter = -11.0 + t * 30.0;
    const coneR = 12.6 * (1 - t * 0.92) + 0.5;
=======
  const garlandSteps = 620;
  for (let i = 0; i < garlandSteps; i++) {
    const t = i / garlandSteps;
    const y = -11.5 + t * 31.5;
    const coneR = 13.2 * (1 - t * 0.95) + 0.42;
    const a = t * Math.PI * 2 * 6.5;
    const x = Math.cos(a) * coneR;
    const z = Math.sin(a) * coneR;
    addVoxel(x, y, z, Math.cos(a), 0.4, Math.sin(a), "garland", { phase: i * 0.2 });
    addVoxel(x * 0.99, y + 0.2, z * 0.99, Math.cos(a), 0.5, Math.sin(a), "garland", { phase: i * 0.2 + 1.5 });
  }

  const baubleCount = 96;
  for (let b = 0; b < baubleCount; b++) {
    const t = (b + 0.5) / baubleCount;
    const yCenter = -11.0 + t * 30.0;
    const coneR = 12.8 * (1 - t * 0.92) + 0.5;
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
    const angle = b * 2.39996;

    const bx = Math.cos(angle) * (coneR + 0.3);
    const bz = Math.sin(angle) * (coneR + 0.3);
    const isRed = b % 3 !== 0;
<<<<<<< HEAD
    const ballR = 0.78;

    const latSteps = 6;
    const lonSteps = 10;
=======
    const ballR = 0.85;

    const latSteps = 12;
    const lonSteps = 18;
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
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
          { phase: b * 0.6 }
        );
      }
    }
  }

  const gifts = [
<<<<<<< HEAD
    { cx: -9.2, cz: 6.2,  sx: 2.8, sy: 2.3, sz: 2.6, rot: 0.35,  boxType: "gift_red",  ribType: "ribbon_gold" },
    { cx: 9.8,  cz: 5.5,  sx: 3.1, sy: 2.6, sz: 2.8, rot: -0.45, boxType: "gift_blue", ribType: "ribbon_white" },
    { cx: -7.8, cz: -8.2, sx: 2.6, sy: 2.1, sz: 2.5, rot: 0.7,   boxType: "gift_gold", ribType: "ribbon_red" },
    { cx: 8.8,  cz: -7.5, sx: 2.5, sy: 2.8, sz: 2.4, rot: -0.25, boxType: "gift_red",  ribType: "ribbon_white" },
    { cx: 1.0,  cz: 11.2, sx: 2.3, sy: 1.8, sz: 2.2, rot: 0.18,  boxType: "gift_blue", ribType: "ribbon_gold" },
    { cx: -4.5, cz: 10.2, sx: 2.2, sy: 2.2, sz: 2.1, rot: -0.6,  boxType: "gift_gold", ribType: "ribbon_blue" }
=======
    { cx: -7.5, cz: -6.8, sx: 2.6, sy: 2.1, sz: 2.5, rot: 0.35,  boxType: "gift_red",  ribType: "ribbon_gold" },
    { cx: 9.8,  cz: 5.5,  sx: 3.1, sy: 2.6, sz: 2.8, rot: -0.45, boxType: "gift_blue", ribType: "ribbon_white" },
    { cx: 8.8,  cz: -7.5, sx: 2.5, sy: 2.8, sz: 2.4, rot: -0.25, boxType: "gift_red",  ribType: "ribbon_white" },
    { cx: 2.5,  cz: 11.2, sx: 2.3, sy: 1.8, sz: 2.2, rot: 0.18,  boxType: "gift_blue", ribType: "ribbon_gold" },
    { cx: 5.5,  cz: 9.2,  sx: 2.2, sy: 2.2, sz: 2.1, rot: -0.6,  boxType: "gift_gold", ribType: "ribbon_blue" }
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
  ];

  gifts.forEach((g) => {
    const cosR = Math.cos(g.rot);
    const sinR = Math.sin(g.rot);
<<<<<<< HEAD
    const step = 0.42;
=======
    const step = 0.2;
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
    const baseY = -18.5;

    for (let lx = -g.sx; lx <= g.sx; lx += step) {
      for (let ly = 0; ly <= g.sy * 2; ly += step) {
        for (let lz = -g.sz; lz <= g.sz; lz += step) {
          const onX = Math.abs(Math.abs(lx) - g.sx) < step * 0.65;
          const onYTop = Math.abs(ly - g.sy * 2) < step * 0.65;
          const onZ = Math.abs(Math.abs(lz) - g.sz) < step * 0.65;
          if (!onX && !onYTop && !onZ) continue;

<<<<<<< HEAD
          const isRibbon = Math.abs(lx) < 0.42 || Math.abs(lz) < 0.42;
=======
          const isRibbon = Math.abs(lx) < 0.35 || Math.abs(lz) < 0.35;
>>>>>>> 87f00e2 (Update character toggles and snowy floor)

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

<<<<<<< HEAD
    const bowY = baseY + g.sy * 2 + 0.5;
    for (let bAngle = 0; bAngle < Math.PI * 2; bAngle += 0.4) {
      const loopR = 0.75 * Math.abs(Math.sin(bAngle * 2));
      const lx = Math.cos(bAngle) * loopR;
      const lz = Math.sin(bAngle) * loopR * 0.45;
      const ly = Math.abs(Math.sin(bAngle * 2)) * 0.48;
=======
    const bowY = baseY + g.sy * 2 + 0.32;
    for (let bAngle = 0; bAngle < Math.PI * 2; bAngle += 0.18) {
      const loopR = 0.88 * Math.abs(Math.sin(bAngle * 2));
      for (let radScale = 0.35; radScale <= 1.0; radScale += 0.25) {
        const lx = Math.cos(bAngle) * loopR * radScale;
        const lz = Math.sin(bAngle) * loopR * 0.48 * radScale;
        const ly = Math.abs(Math.sin(bAngle * 2)) * 0.55 * radScale;
>>>>>>> 87f00e2 (Update character toggles and snowy floor)

        const wx = g.cx + lx * cosR - lz * sinR;
        const wz = g.cz + lx * sinR + lz * cosR;
        addVoxel(wx, bowY + ly, wz, 0, 1, 0, g.ribType);
      }
    }
  });

<<<<<<< HEAD
  const starY = 22.0;
  const starOuterR = 2.65;
  const starInnerR = 1.1;
  const starDepth = 0.75;
=======
  const starY = 22.1;
  const starOuterR = 2.95;
  const starInnerR = 1.2;
  const starDepth = 0.85;
>>>>>>> 87f00e2 (Update character toggles and snowy floor)

  for (let side of [-1, 1]) {
    addVoxel(0, starY, side * starDepth, 0, 0, side, "star");

    for (let p = 0; p < 10; p++) {
      const a1 = (p / 10) * Math.PI * 2 - Math.PI / 2;
      const a2 = ((p + 1) / 10) * Math.PI * 2 - Math.PI / 2;
      const r1 = p % 2 === 0 ? starOuterR : starInnerR;
      const r2 = (p + 1) % 2 === 0 ? starOuterR : starInnerR;

      const vx1 = Math.cos(a1) * r1;
      const vy1 = starY - Math.sin(a1) * r1;
      const vx2 = Math.cos(a2) * r2;
      const vy2 = starY - Math.sin(a2) * r2;

      for (let edgeT = 0; edgeT <= 1.0; edgeT += 0.14) {
        const ex = vx1 * (1 - edgeT) + vx2 * edgeT;
        const ey = vy1 * (1 - edgeT) + vy2 * edgeT;
        for (let f = 0.12; f <= 1.0; f += 0.12) {
          const px = ex * f;
          const py = starY + (ey - starY) * f;
          const pz = side * starDepth * (1 - f * 0.88);
          addVoxel(px, py, pz, px * 0.25, (py - starY) * 0.25, side, "star");
        }
      }
    }
  }
}

function getSnoopyAndWoodstockVoxels(time) {
  const voxels = [];
  const sx0 = -24.0;
  const sz0 = 5.0;
  const groundY = -18.5;

  const playBeat = time * 4.8;
  const bounce = Math.abs(Math.sin(playBeat)) * 0.75;
  const sway = Math.sin(playBeat * 0.5) * 0.35;

  const yaw = 0.55 + Math.sin(playBeat * 0.5) * 0.15;
  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);

  function addS(lx, ly, lz, nx, ny, nz, type) {
    const rx = lx * cosY + lz * sinY;
    const rz = -lx * sinY + lz * cosY;
    const rnx = nx * cosY + nz * sinY;
    const rnz = -nx * sinY + nz * cosY;
    const n = normalize3({ x: rnx, y: ny, z: rnz });

    voxels.push({
      x: sx0 + rx + sway,
      y: groundY + ly + bounce,
      z: sz0 + rz,
      nx: n.x,
      ny: n.y,
      nz: n.z,
      type
    });
  }

  for (let side of [-1, 1]) {
    const footLift = side === 1 ? Math.max(0, Math.sin(playBeat)) * 0.65 : Math.max(0, -Math.sin(playBeat)) * 0.65;
    for (let fx = -0.6; fx <= 1.55; fx += 0.18) {
      for (let fz = -0.58; fz <= 0.58; fz += 0.18) {
        for (let fy = 0.0; fy <= 0.72; fy += 0.18) {
          if (Math.hypot((fx - 0.45) / 1.15, fz / 0.65) <= 1.02) {
            addS(fx, fy + footLift, side * 1.15 + fz, fx * 0.3, fy > 0.4 ? 1 : 0.2, side * 0.4, "snoopy_white");
          }
        }
      }
    }
    addS(1.52, 0.35 + footLift, side * 1.15 - 0.24, 1, 0, 0, "snoopy_black");
    addS(1.52, 0.35 + footLift, side * 1.15 + 0.24, 1, 0, 0, "snoopy_black");
  }

  for (let side of [-1, 1]) {
    const footLift = side === 1 ? Math.max(0, Math.sin(playBeat)) * 0.55 : Math.max(0, -Math.sin(playBeat)) * 0.55;
    for (let ly = 0.7; ly <= 2.5; ly += 0.18) {
      const legR = 0.58;
      for (let a = 0; a < Math.PI * 2; a += 0.32) {
        addS(Math.cos(a) * legR, ly + footLift * (1 - ly / 2.6), side * 1.05 + Math.sin(a) * legR, Math.cos(a), 0, Math.sin(a), "snoopy_white");
      }
    }
  }

  for (let ty = 2.3; ty <= 6.2; ty += 0.18) {
    const t = (ty - 2.3) / 3.9;
    const rx = 1.65 * (1 - t * 0.42);
    const rz = 1.75 * (1 - t * 0.42);
    const steps = 32;
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const lx = Math.cos(a) * rx;
      const lz = Math.sin(a) * rz;
      const isBackSpot = (lx < -0.62 && ty > 3.25 && ty < 5.35 && Math.abs(lz) < 1.08);
      addS(lx, ty, lz, Math.cos(a), 0.1, Math.sin(a), isBackSpot ? "snoopy_black" : "snoopy_white");
    }
  }

  for (let a = 0; a < Math.PI * 2; a += 0.18) {
    addS(Math.cos(a) * 1.03, 6.22, Math.sin(a) * 1.06, Math.cos(a), 0.2, Math.sin(a), "snoopy_collar");
    addS(Math.cos(a) * 1.01, 6.36, Math.sin(a) * 1.04, Math.cos(a), 0.2, Math.sin(a), "snoopy_collar");
  }

  const tailWag = Math.sin(time * 16) * 0.65;
  for (let ti = 0; ti <= 10; ti++) {
    const tf = ti / 10;
    addS(-1.55 - tf * 1.15, 2.7 + tf * 1.35, tailWag * tf, -0.7, 0.7, tailWag, ti >= 7 ? "snoopy_black" : "snoopy_white");
  }

  for (let side of [-1, 1]) {
    const armWave = side === 1 ? Math.sin(playBeat * 1.8) * 0.65 : -Math.cos(playBeat * 1.8) * 0.55;
    for (let ai = 0; ai <= 10; ai++) {
      const af = ai / 10;
      const ax = 0.45 + af * 1.48;
      const ay = 5.4 + af * (0.85 + armWave);
      const az = side * (1.15 + af * 0.65);
      for (let r = 0; r < Math.PI * 2; r += 0.6) {
        addS(ax, ay + Math.sin(r) * 0.34, az + Math.cos(r) * 0.34, 0.3, Math.sin(r), Math.cos(r), "snoopy_white");
      }
    }
  }

  const headCenterY = 8.15;
  for (let la = 0; la <= 14; la++) {
    const phi = (la / 14) * Math.PI;
    const sinP = Math.sin(phi);
    const cosP = Math.cos(phi);
    for (let lo = 0; lo < 28; lo++) {
      const theta = (lo / 28) * Math.PI * 2;
      const hx = sinP * Math.cos(theta) * 1.55 - 0.25;
      const hy = cosP * 1.55;
      const hz = sinP * Math.sin(theta) * 1.50;
      addS(hx, headCenterY + hy, hz, hx + 0.25, hy, hz, "snoopy_white");
    }
  }

  for (let sx = 0.6; sx <= 3.05; sx += 0.16) {
    const st = (sx - 0.6) / 2.45;
    const sRadY = 1.15 * (1 - st * 0.15);
    const sRadZ = 1.22 * (1 - st * 0.15);
    for (let a = 0; a < Math.PI * 2; a += 0.2) {
      const sy = Math.sin(a) * sRadY - 0.18;
      const sz = Math.cos(a) * sRadZ;
      const isSmile = (sx > 1.0 && sx < 2.35 && Math.abs(sy + 0.55 - Math.pow((sx - 1.65) * 0.65, 2)) < 0.16 && Math.abs(sz) > 0.85);
      addS(sx, headCenterY + sy, sz, 0.35, Math.sin(a), Math.cos(a), isSmile ? "snoopy_black" : "snoopy_white");
    }
  }
  for (let a = 0; a < Math.PI * 2; a += 0.25) {
    for (let r = 0.15; r <= 0.92; r += 0.16) {
      addS(3.12, headCenterY - 0.18 + Math.sin(a) * r, Math.cos(a) * r, 1, Math.sin(a) * 0.3, Math.cos(a) * 0.3, "snoopy_white");
    }
  }

  for (let la = 0; la <= 6; la++) {
    const phi = (la / 6) * Math.PI;
    for (let lo = 0; lo < 12; lo++) {
      const theta = (lo / 12) * Math.PI * 2;
      addS(
        3.25 + Math.sin(phi) * Math.cos(theta) * 0.46,
        headCenterY + 0.35 + Math.cos(phi) * 0.44,
        Math.sin(phi) * Math.sin(theta) * 0.46,
        1, 0.4, 0,
        "snoopy_black"
      );
    }
  }

  for (let side of [-1, 1]) {
    addS(1.15, headCenterY + 0.68, side * 1.19, 0.4, 0.4, side, "snoopy_black");
    addS(1.15, headCenterY + 0.88, side * 1.17, 0.4, 0.5, side, "snoopy_black");
    addS(0.95, headCenterY + 1.25, side * 1.03, 0.3, 0.7, side, "snoopy_black");
    addS(1.08, headCenterY + 1.28, side * 1.03, 0.3, 0.7, side, "snoopy_black");
  }

  const earFlap = Math.sin(playBeat * 2) * 0.35;
  for (let side of [-1, 1]) {
    for (let ex = -1.1; ex <= 0.15; ex += 0.15) {
      for (let ey = -1.65; ey <= 0.15; ey += 0.15) {
        if (Math.hypot((ex + 0.48) / 0.72, (ey + 0.75) / 1.0) <= 1.04) {
          addS(
            ex - 0.35,
            headCenterY + ey,
            side * (1.52 - ey * 0.18 + earFlap),
            0, -0.2, side,
            "snoopy_black"
          );
        }
      }
    }
  }

  for (let h = 0; h <= 1.68; h += 0.16) {
    const hr = 0.94 * (1 - h / 1.85);
    for (let a = 0; a < Math.PI * 2; a += 0.28) {
      addS(
        -0.3 - h * 0.55 + Math.cos(a) * hr,
        headCenterY + 1.48 + h,
        Math.sin(a) * hr,
        Math.cos(a) * 0.4, 1, Math.sin(a) * 0.4,
        h < 0.32 ? "ribbon_white" : "santa_red"
      );
    }
  }
  for (let la = 0; la <= 4; la++) {
    const phi = (la / 4) * Math.PI;
    for (let lo = 0; lo < 8; lo++) {
      const theta = (lo / 8) * Math.PI * 2;
      addS(
        -1.35 + Math.sin(phi) * Math.cos(theta) * 0.34,
        headCenterY + 3.12 + Math.cos(phi) * 0.34,
        Math.sin(phi) * Math.sin(theta) * 0.34,
        -0.5, 1, 0,
        "ribbon_white"
      );
    }
  }

  const wx0 = sx0 + 4.8;
  const wz0 = sz0 + 2.4;
  const woodHop = Math.abs(Math.cos(playBeat * 1.4)) * 1.3;

  function addW(lx, ly, lz, nx, ny, nz, type) {
    const n = normalize3({ x: nx, y: ny, z: nz });
    voxels.push({
      x: wx0 + lx,
      y: groundY + ly + woodHop,
      z: wz0 + lz,
      nx: n.x,
      ny: n.y,
      nz: n.z,
      type
    });
  }

  for (let fx = -0.25; fx <= 0.25; fx += 0.12) {
    addW(fx, 0.1, -0.35, 0, 1, 0, "woodstock_yellow");
    addW(fx, 0.1, 0.35, 0, 1, 0, "woodstock_yellow");
  }

  for (let wy = 0.45; wy <= 2.95; wy += 0.16) {
    const isHead = wy > 1.65;
    const rad = isHead ? 0.86 * Math.sin(((wy - 1.55) / 1.5) * Math.PI) : 0.68 * Math.sin(((wy - 0.35) / 1.45) * Math.PI);
    const r = Math.max(0.24, rad);
    for (let a = 0; a < Math.PI * 2; a += 0.3) {
      addW(Math.cos(a) * r, wy, Math.sin(a) * r, Math.cos(a), 0.2, Math.sin(a), "woodstock_yellow");
    }
  }
  for (let f = 0; f <= 0.55; f += 0.14) {
    addW(0.0, 3.0 + f, 0, 0, 1, 0, "woodstock_yellow");
    addW(-0.22 - f * 0.3, 3.0 + f * 0.9, 0.12, -0.4, 1, 0.2, "woodstock_yellow");
    addW(0.18 + f * 0.3, 3.0 + f * 0.9, -0.12, 0.4, 1, -0.2, "woodstock_yellow");
  }

  for (let bx = -0.82; bx >= -1.25; bx -= 0.12) {
    addW(bx, 2.22, 0, -1, 0.2, 0, "woodstock_yellow");
    addW(bx, 2.12, 0, -1, -0.2, 0, "woodstock_yellow");
  }
  addW(-0.58, 2.45, 0.48, -0.5, 0.3, 1, "snoopy_black");
  addW(-0.58, 2.45, -0.48, -0.5, 0.3, -1, "snoopy_black");

  const wingFlap = Math.sin(time * 20) * 0.55;
  for (let side of [-1, 1]) {
    for (let wi = 0.2; wi <= 1.0; wi += 0.15) {
      addW(0.1, 1.35 + wingFlap * wi, side * (0.65 + wi * 0.55), 0, 0.5, side, "woodstock_yellow");
    }
  }

  const ballT = (Math.sin(playBeat) + 1) * 0.5;
  const bx = wx0 - 1.2 - ballT * 2.2;
  const bz = wz0 - 0.6 - ballT * 0.8;
  const by = groundY + 2.5 + Math.sin(ballT * Math.PI) * 3.0;
  const ballR = 0.62;
  for (let la = 0; la <= 8; la++) {
    const phi = (la / 8) * Math.PI;
    for (let lo = 0; lo < 14; lo++) {
      const theta = (lo / 14) * Math.PI * 2;
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.cos(phi);
      const nz = Math.sin(phi) * Math.sin(theta);
      const n = normalize3({ x: nx, y: ny, z: nz });
      voxels.push({
        x: bx + nx * ballR,
        y: by + ny * ballR,
        z: bz + nz * ballR,
        nx: n.x,
        ny: n.y,
        nz: n.z,
        type: "bauble_red",
        phase: 1.2
      });
    }
  }

  return voxels;
}

function getSantaVoxels(progress, time) {
  const voxels = [];
  const angle = (progress - 0.5) * Math.PI * 1.5;
  const orbitR = 19.5;
  const cx = Math.sin(angle) * orbitR * 1.4;
  const cz = Math.cos(angle) * orbitR;
  const cy = 7.5 + Math.sin(progress * Math.PI * 2) * 2.5;

  const dirX = Math.cos(angle) * 1.4;
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

<<<<<<< HEAD
  for (let f = -3.2; f <= 2.2; f += 0.4) {
    for (let r = -1.2; r <= 1.2; r += 0.4) {
      if (Math.abs(Math.abs(r) - 1.2) < 0.2) {
        const curl = f > 1.4 ? Math.pow(f - 1.4, 2) * 1.8 : 0;
        addLocalSanta(f, -1.6 + curl, r, 0, -0.6, Math.sign(r), "santa_gold");
      }
      addLocalSanta(f, -0.9, r, 0, 1, 0, "santa_red");
      if (Math.abs(Math.abs(r) - 1.2) < 0.2) {
        const wallH = f < -1.6 ? 1.1 : 0.4;
        for (let u = -0.8; u <= wallH; u += 0.35) {
          addLocalSanta(f, u, r, 0, 0.2, Math.sign(r), "santa_red");
        }
        addLocalSanta(f, wallH + 0.4, r, 0, 1, Math.sign(r), "santa_gold");
=======
  for (let f = -3.4; f <= 2.3; f += 0.18) {
    for (let r = -1.25; r <= 1.25; r += 0.18) {
      if (Math.abs(Math.abs(r) - 1.22) < 0.12) {
        const curl = f > 1.4 ? Math.pow(f - 1.4, 2) * 1.9 : 0;
        addLocalSanta(f, -1.6 + curl, r, 0, -0.6, Math.sign(r), "santa_gold");
      }
      addLocalSanta(f, -0.9, r, 0, 1, 0, "santa_red");
      if (Math.abs(Math.abs(r) - 1.22) < 0.12) {
        const wallH = f < -1.6 ? 1.15 : 0.45;
        for (let u = -0.85; u <= wallH; u += 0.18) {
          addLocalSanta(f, u, r, 0, 0.2, Math.sign(r), "santa_red");
        }
        addLocalSanta(f, wallH + 0.25, r, 0, 1, Math.sign(r), "santa_gold");
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
      }
    }
  }

<<<<<<< HEAD
  for (let dy = -0.4; dy <= 1.2; dy += 0.35) {
    for (let da = 0; da < Math.PI * 2; da += 0.75) {
      addLocalSanta(-1.9 + Math.cos(da) * 0.75, dy, Math.sin(da) * 0.75, Math.cos(da), 0.3, Math.sin(da), "gift_gold");
    }
  }

  for (let u = -0.3; u <= 1.0; u += 0.35) {
    for (let da = 0; da < Math.PI * 2; da += 0.7) {
      addLocalSanta(0.3 + Math.cos(da) * 0.65, u, Math.sin(da) * 0.65, Math.cos(da), 0.2, Math.sin(da), "santa_red");
    }
  }
  addLocalSanta(0.85, 1.3, 0, 1, 0, 0, "ribbon_white");
  addLocalSanta(0.35, 1.45, 0, 0, 0.5, 0, "santa_red");
  addLocalSanta(0.2, 1.9, 0, 0, 1, 0, "santa_red");
  addLocalSanta(-0.35, 2.15, 0, -1, 0.6, 0, "ribbon_white");
=======
  for (let dy = -0.4; dy <= 1.3; dy += 0.18) {
    for (let da = 0; da < Math.PI * 2; da += 0.35) {
      addLocalSanta(-1.95 + Math.cos(da) * 0.82, dy, Math.sin(da) * 0.82, Math.cos(da), 0.3, Math.sin(da), "gift_gold");
    }
  }

  for (let u = -0.35; u <= 1.05; u += 0.18) {
    for (let da = 0; da < Math.PI * 2; da += 0.35) {
      addLocalSanta(0.3 + Math.cos(da) * 0.7, u, Math.sin(da) * 0.7, Math.cos(da), 0.2, Math.sin(da), "santa_red");
    }
  }
  for (let da = -0.9; da <= 0.9; da += 0.25) {
    addLocalSanta(0.92, 1.15, da * 0.45, 1, -0.2, da * 0.3, "ribbon_white");
    addLocalSanta(0.96, 1.38, da * 0.42, 1, 0, da * 0.3, "ribbon_white");
  }
  for (let hu = 1.55; hu <= 2.15; hu += 0.16) {
    const hr = 0.55 * (1 - (hu - 1.55) / 0.75);
    for (let da = 0; da < Math.PI * 2; da += 0.45) {
      addLocalSanta(0.25 - (hu - 1.55) * 0.7 + Math.cos(da) * hr, hu, Math.sin(da) * hr, 0, 1, 0, hu < 1.7 ? "ribbon_white" : "santa_red");
    }
  }
  addLocalSanta(-0.35, 2.22, 0, -1, 0.6, 0, "ribbon_white");
>>>>>>> 87f00e2 (Update character toggles and snowy floor)

  for (let pair = 0; pair < 4; pair++) {
    const baseFwd = 4.8 + pair * 3.2;
    const gallop = Math.sin(time * 11 + pair * 1.1) * 0.45;

<<<<<<< HEAD
    for (let rf = 2.4; rf <= baseFwd; rf += 0.6) {
=======
    for (let rf = 2.4; rf <= baseFwd; rf += 0.3) {
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
      addLocalSanta(rf, -0.1 + gallop * 0.25, -0.7, 0, 1, 0, "santa_gold");
      addLocalSanta(rf, -0.1 + gallop * 0.25, 0.7, 0, 1, 0, "santa_gold");
    }

<<<<<<< HEAD
    for (let side of [-0.82, 0.82]) {
      for (let bf = -0.8; bf <= 0.8; bf += 0.38) {
        addLocalSanta(baseFwd + bf, 0.0 + gallop, side, 0, 0.8, Math.sign(side) * 0.4, "reindeer");
      }
      const legSwing = Math.cos(time * 11 + pair * 1.1) * 0.4;
      addLocalSanta(baseFwd - 0.6 - legSwing, -0.8 + gallop, side, -0.5, -0.5, 0, "reindeer");
      addLocalSanta(baseFwd + 0.6 + legSwing, -0.8 + gallop, side, 0.5, -0.5, 0, "reindeer");

      addLocalSanta(baseFwd + 1.0, 0.6 + gallop, side, 0.6, 0.6, 0, "reindeer");
      addLocalSanta(baseFwd + 1.4, 1.0 + gallop, side, 1, 0.3, 0, "reindeer");

      addLocalSanta(baseFwd + 1.1, 1.55 + gallop, side - 0.28, 0, 1, -0.5, "santa_gold");
      addLocalSanta(baseFwd + 1.1, 1.55 + gallop, side + 0.28, 0, 1, 0.5, "santa_gold");

      if (pair === 3 && side > 0) {
        addLocalSanta(baseFwd + 1.8, 1.0 + gallop, side, 1, 0, 0, "rudolph_nose");
=======
    for (let side of [-0.85, 0.85]) {
      for (let bf = -0.85; bf <= 0.85; bf += 0.18) {
        for (let a = 0; a < Math.PI * 2; a += 0.7) {
          addLocalSanta(baseFwd + bf, 0.0 + gallop + Math.sin(a) * 0.28, side + Math.cos(a) * 0.26, 0, Math.sin(a), Math.cos(a), "reindeer");
        }
      }
      const legSwing = Math.cos(time * 11 + pair * 1.1) * 0.42;
      for (let ly = -0.2; ly >= -0.9; ly -= 0.18) {
        const lt = (-ly - 0.2) / 0.7;
        addLocalSanta(baseFwd - 0.65 - legSwing * lt, ly + gallop, side, -0.5, -0.5, 0, "reindeer");
        addLocalSanta(baseFwd + 0.65 + legSwing * lt, ly + gallop, side, 0.5, -0.5, 0, "reindeer");
      }

      addLocalSanta(baseFwd + 1.0, 0.55 + gallop, side, 0.6, 0.6, 0, "reindeer");
      addLocalSanta(baseFwd + 1.25, 0.85 + gallop, side, 0.8, 0.4, 0, "reindeer");
      addLocalSanta(baseFwd + 1.5, 1.02 + gallop, side, 1, 0.3, 0, "reindeer");

      addLocalSanta(baseFwd + 1.15, 1.38 + gallop, side - 0.25, 0, 1, -0.5, "santa_gold");
      addLocalSanta(baseFwd + 1.1,  1.65 + gallop, side - 0.35, 0, 1, -0.5, "santa_gold");
      addLocalSanta(baseFwd + 1.15, 1.38 + gallop, side + 0.25, 0, 1, 0.5, "santa_gold");
      addLocalSanta(baseFwd + 1.1,  1.65 + gallop, side + 0.35, 0, 1, 0.5, "santa_gold");

      if (pair === 3 && side > 0) {
        addLocalSanta(baseFwd + 1.82, 1.02 + gallop, side, 1, 0, 0, "rudolph_nose");
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
      }
    }
  }

  return voxels;
}


function getPoohAndPigletVoxels(time) {
  const voxels = [];
  const groundY = -18.5;
  const play = time * 3.2;
  const bounce = Math.abs(Math.sin(play)) * 0.55;

  function makeCharacter(cx, cz, scale, isPiglet, phase) {
    const bob = Math.abs(Math.sin(play + phase)) *
      (isPiglet ? 0.75 : 0.45);

    const armSwing = Math.sin(play * 1.5 + phase) * 0.8;
    const shirt = isPiglet ? "piglet_pink" : "pooh_red";
    const body = isPiglet ? "piglet_pink" : "pooh_yellow";
    const face = body;

    function add(lx, ly, lz, nx, ny, nz, type) {
      const n = normalize3({ x: nx, y: ny, z: nz });

      voxels.push({
        x: cx + lx * scale,
        y: groundY + (ly + bob) * scale,
        z: cz + lz * scale,
        nx: n.x,
        ny: n.y,
        nz: n.z,
        type
      });
    }

    function ellipsoid(x, y, z, rx, ry, rz, type, step = 0.28) {
      const latSteps = Math.ceil(Math.PI / step);
      const lonSteps = Math.ceil((Math.PI * 2) / step);

      for (let lat = 0; lat <= latSteps; lat++) {
        const phi = (lat / latSteps) * Math.PI;

        for (let lon = 0; lon < lonSteps; lon++) {
          const theta = (lon / lonSteps) * Math.PI * 2;

          const nx = Math.sin(phi) * Math.cos(theta);
          const ny = Math.cos(phi);
          const nz = Math.sin(phi) * Math.sin(theta);

          add(
            x + nx * rx,
            y + ny * ry,
            z + nz * rz,
            nx, ny, nz,
            type
          );
        }
      }
    }

    function tube(ax, ay, az, bx, by, bz, radius, type) {
      const dx = bx - ax;
      const dy = by - ay;
      const dz = bz - az;
      const len = Math.hypot(dx, dy, dz) || 1;
      const steps = Math.ceil(len / 0.16);

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;

        const px = ax + dx * t;
        const py = ay + dy * t;
        const pz = az + dz * t;

        ellipsoid(
          px, py, pz,
          radius, radius, radius,
          type, 0.55
        );
      }
    }

    // Body and shirt
    ellipsoid(
      0, 3.45, 0,
      isPiglet ? 1.05 : 1.55,
      isPiglet ? 1.35 : 1.8,
      isPiglet ? 0.9 : 1.25,
      body
    );

    if (!isPiglet) {
      ellipsoid(0, 4.25, 0, 1.62, 0.92, 1.28, shirt);
    } else {
      // Piglet's striped outfit
      for (let yy = 3.0; yy <= 4.5; yy += 0.42) {
        const rx = 1.05 * Math.sqrt(
          Math.max(0.1, 1 - Math.pow((yy - 3.45) / 1.4, 2))
        );

        for (let a = 0; a < Math.PI * 2; a += 0.18) {
          add(
            Math.cos(a) * rx,
            yy,
            Math.sin(a) * 0.9,
            Math.cos(a), 0, Math.sin(a),
            "piglet_stripe"
          );
        }
      }
    }

    // Legs and feet
    for (const side of [-1, 1]) {
      tube(
        side * 0.72, 2.55, 0,
        side * 0.82, 0.65, 0.05,
        isPiglet ? 0.32 : 0.42,
        body
      );

      ellipsoid(
        side * 0.88, 0.48, 0.22,
        0.55, 0.3, 0.55,
        body
      );
    }

    // Head
    ellipsoid(
      0, 7.25, 0,
      isPiglet ? 1.35 : 1.75,
      isPiglet ? 1.45 : 1.7,
      isPiglet ? 1.12 : 1.35,
      face
    );

    if (isPiglet) {
      // Piglet's long ears
      tube(-0.72, 8.15, 0, -1.12, 10.0, 0.05, 0.38, "piglet_pink");
      tube(0.72, 8.15, 0, 1.12, 10.0, 0.05, 0.38, "piglet_pink");

      ellipsoid(-1.12, 10.0, 0.05, 0.38, 0.62, 0.28, "piglet_ear");
      ellipsoid(1.12, 10.0, 0.05, 0.38, 0.62, 0.28, "piglet_ear");

      // Snout
      ellipsoid(0, 6.95, 1.0, 0.72, 0.48, 0.38, "piglet_snout");

      ellipsoid(-0.23, 7.0, 1.32, 0.12, 0.13, 0.08, "pooh_dark");
      ellipsoid(0.23, 7.0, 1.32, 0.12, 0.13, 0.08, "pooh_dark");
    } else {
      // Pooh's ears
      ellipsoid(-1.35, 8.25, 0, 0.42, 0.62, 0.38, "pooh_yellow");
      ellipsoid(1.35, 8.25, 0, 0.42, 0.62, 0.38, "pooh_yellow");

      // Pooh's muzzle and nose
      ellipsoid(0, 6.85, 1.05, 0.9, 0.62, 0.48, "pooh_yellow");
      ellipsoid(0, 7.05, 1.48, 0.22, 0.18, 0.12, "pooh_dark");
    }

    // Eyes and smile
    for (const side of [-1, 1]) {
      ellipsoid(
        side * 0.55, 7.65, 1.05,
        0.13, 0.18, 0.1,
        "pooh_dark", 0.4
      );
    }

    for (let i = 0; i <= 8; i++) {
      const a = (i / 8) * Math.PI;

      add(
        Math.cos(a) * 0.42,
        6.55 - Math.sin(a) * 0.18,
        1.25,
        0, -0.2, 1,
        "pooh_dark"
      );
    }

    // Moving arms
    for (const side of [-1, 1]) {
      const lift = armSwing * (side === 1 ? 1 : -0.7);

      const shoulderX = side * (isPiglet ? 0.85 : 1.25);
      const shoulderY = 4.9;

      const handX = shoulderX + side * 0.75;
      const handY = 6.2 + lift;

      tube(
        shoulderX, shoulderY, 0,
        handX, handY, 0.25,
        isPiglet ? 0.25 : 0.38,
        shirt
      );

      ellipsoid(
        handX, handY, 0.28,
        isPiglet ? 0.28 : 0.38,
        isPiglet ? 0.28 : 0.38,
        0.3,
        body
      );
    }
  }

  // Pooh on the left, Piglet on the right
  makeCharacter(22.5, 5.0, 1.0, false, 0);
  makeCharacter(32.0, 5.8, 0.78, true, 1.2);

  // Snowball moving between them
  const toss = (Math.sin(play * 0.75) + 1) * 0.5;

  const ballX = 25.0 + toss * 5.3;
  const ballY = groundY + 7.2 +
    Math.sin(toss * Math.PI) * 3.2 +
    bounce * 0.25;

  const ballZ = 7.0 + Math.sin(play) * 0.45;

  for (let lat = 0; lat <= 8; lat++) {
    const phi = (lat / 8) * Math.PI;

    for (let lon = 0; lon < 16; lon++) {
      const theta = (lon / 16) * Math.PI * 2;

      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.cos(phi);
      const nz = Math.sin(phi) * Math.sin(theta);

      voxels.push({
        x: ballX + nx * 0.62,
        y: ballY + ny * 0.62,
        z: ballZ + nz * 0.62,
        nx, ny, nz,
        type: "snowball"
      });
    }
  }

  return voxels;
}

const snowflakeGlyphs = ["*", "❄", "❅", "❆", "✳", "✶", "·"];
<<<<<<< HEAD
const snowflakes = Array.from({ length: 140 }, () => ({
  x: (Math.random() - 0.5) * 64,
  y: Math.random() * 50 - 22,
  z: (Math.random() - 0.5) * 64,
=======
const snowflakes = Array.from({ length: 200 }, () => ({
  x: (Math.random() - 0.5) * 72,
  y: Math.random() * 55 - 22,
  z: (Math.random() - 0.5) * 72,
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
  speed: 1.1 + Math.random() * 2.8,
  drift: Math.random() * Math.PI * 2,
  glyph: snowflakeGlyphs[Math.floor(Math.random() * snowflakeGlyphs.length)],
  brightness: 0.5 + Math.random() * 0.5
}));

function shadeVoxel(v, time) {
  const diff = Math.max(0, dot3({ x: v.nx, y: v.ny, z: v.nz }, LIGHT));
  const rim = Math.pow(1 - Math.abs(v.viewNz || 0), 2) * 0.28;
  const shade = Math.min(1, 0.18 + diff * 0.78 + rim);

  switch (v.type) {
<<<<<<< HEAD
    case "ground_snow": {
      const idx = Math.min(RAMP_SOLID.length - 1, Math.floor(shade * RAMP_SOLID.length));
      return { ch: RAMP_SOLID[idx], color: shade > 0.5 ? "#e2e8f0" : "#94a3b8", glow: 0 };
    }
    case "ground_ice": {
      return { ch: ".", color: "#38bdf8", glow: 2 };
    }
=======

    case "ground_snow": {
    const sparkle = Math.sin(v.phase * 5 + time * 0.25);

    return {
        ch: sparkle > 0.82 ? "*" : sparkle < -0.75 ? "," : ".",
        color: shade > 0.55 ? "#f8fafc" : "#cbdff0",
        glow: sparkle > 0.92 ? 1 : 0
    };
    }

    case "ground_ice": {
    return {
        ch: ".",
        color: shade > 0.5 ? "#7dd3fc" : "#38bdf8",
        glow: 2
    };
    }

>>>>>>> 87f00e2 (Update character toggles and snowy floor)
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
        glow: spec ? 9 * pulse : 4 * pulse
      };
    }
    case "bauble_gold": {
      const spec = shade > 0.82;
      const idx = Math.min(RAMP_SOLID.length - 1, Math.floor(shade * RAMP_SOLID.length));
      return {
        ch: spec ? "@" : RAMP_SOLID[idx],
        color: spec ? "#fef9c3" : shade > 0.45 ? "#facc15" : "#a16207",
        glow: spec ? 8 : 3
      };
    }
    case "garland": {
      const twinkle = 0.5 + 0.5 * Math.sin(time * 5 + (v.phase || 0));
      return {
        ch: twinkle > 0.55 ? "*" : "+",
        color: twinkle > 0.55 ? "#fef08a" : "#f59e0b",
        glow: twinkle > 0.55 ? 7 : 2
      };
    }
    case "star": {
      const pulse = 0.75 + 0.25 * Math.sin(time * 6);
      const idx = Math.min(RAMP_GLOW.length - 1, Math.floor(shade * RAMP_GLOW.length));
      return {
        ch: RAMP_GLOW[idx],
        color: shade > 0.65 ? "#fef9c3" : "#facc15",
<<<<<<< HEAD
        glow: 15 * pulse
=======
        glow: 13 * pulse
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
      };
    }

    case "pooh_yellow":
    return {
        ch: shade > 0.58 ? "@" : RAMP_SOLID[
        Math.min(RAMP_SOLID.length - 1,
        Math.floor(shade * RAMP_SOLID.length))
        ],
        color: shade > 0.45 ? "#facc15" : "#ca8a04",
        glow: 2
    };

    case "pooh_red":
    return {
        ch: "#",
        color: shade > 0.45 ? "#ef4444" : "#991b1b",
        glow: 1
    };

    case "pooh_dark":
    return { ch: "@", color: "#292524", glow: 0 };

    case "piglet_pink":
    return {
        ch: shade > 0.55 ? "@" : "+",
        color: shade > 0.45 ? "#f9a8d4" : "#db2777",
        glow: 2
    };

    case "piglet_ear":
    return { ch: "^", color: "#f472b6", glow: 2 };

    case "piglet_snout":
    return { ch: "@", color: "#fda4af", glow: 2 };

    case "piglet_stripe":
    return { ch: "=", color: "#fce7f3", glow: 1 };

    case "snowball":
    return { ch: "@", color: "#ffffff", glow: 5 };

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
<<<<<<< HEAD
    case "ribbon_gold": return { ch: "#", color: "#fef08a", glow: 4 };
    case "ribbon_white": return { ch: "#", color: "#f8fafc", glow: 3 };
    case "ribbon_red": return { ch: "#", color: "#ff2a4b", glow: 4 };
    case "santa_red": return { ch: "@", color: shade > 0.45 ? "#ff2a4b" : "#b91c1c", glow: 6 };
    case "santa_gold": return { ch: "*", color: "#fde047", glow: 7 };
=======
    case "ribbon_gold": return { ch: "#", color: "#fef08a", glow: 3 };
    case "ribbon_white": return { ch: "#", color: "#f8fafc", glow: 2 };
    case "ribbon_red": return { ch: "#", color: "#ff2a4b", glow: 3 };
    case "ribbon_blue": return { ch: "#", color: "#60a5fa", glow: 3 };
    case "snoopy_white": {
      const idx = Math.min(RAMP_SOLID.length - 1, Math.floor(shade * RAMP_SOLID.length));
      return { ch: shade > 0.58 ? "@" : RAMP_SOLID[idx], color: shade > 0.42 ? "#ffffff" : "#cbd5e1", glow: 3 };
    }
    case "snoopy_black":
      return { ch: "#", color: "#1e293b", glow: 1 };
    case "snoopy_collar":
      return { ch: "@", color: "#ff2a4b", glow: 5 };
    case "woodstock_yellow": {
      const idx = Math.min(RAMP_SOLID.length - 1, Math.floor(shade * RAMP_SOLID.length));
      return { ch: shade > 0.55 ? "@" : RAMP_SOLID[idx], color: shade > 0.45 ? "#facc15" : "#eab308", glow: 5 };
    }
    case "santa_red": return { ch: "@", color: shade > 0.45 ? "#ff2a4b" : "#b91c1c", glow: 5 };
    case "santa_gold": return { ch: "*", color: "#fde047", glow: 6 };
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
    case "reindeer": return { ch: shade > 0.5 ? "#" : "=", color: shade > 0.5 ? "#d97706" : "#92400e", glow: 0 };
    case "rudolph_nose": return { ch: "@", color: "#ff1e42", glow: 16 };
    case "snowflake":
      return { ch: v.glyph, color: v.brightness > 0.75 ? "#ffffff" : "#93c5fd", glow: v.brightness > 0.75 ? 5 : 1 };
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

btnSnoopy.addEventListener("click", () => {
  snoopyEnabled = !snoopyEnabled;

  btnSnoopy.textContent = snoopyEnabled
    ? "Snoopy: ON"
    : "Snoopy: OFF";
});

// Winnie the Pooh and Piglet toggle
btnPooh.addEventListener("click", () => {
  poohEnabled = !poohEnabled;

  btnPooh.textContent = poohEnabled
    ? "Pooh & Piglet: ON"
    : "Pooh & Piglet: OFF";
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

songSelect.addEventListener("change", (e) => {
  const selectedSong = e.target.value;
  audioSource.src = selectedSong;
  bgAudio.load();
  if (musicPlaying) {
    bgAudio.play().catch(err => console.log("Audio play error:", err));
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
    santaProgress += dt * 0.13;
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

  const cameraDist = 66;
<<<<<<< HEAD
  const fovScale = Math.min(width, height) * 0.75;
=======
  const fovScale = Math.min(width, height) * 0.78;
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
  const centerX = width * 0.5;
  const centerY = height * 0.53;

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
        v,
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

// Render Snoopy only when enabled
    if (snoopyEnabled) {
    const snoopyVoxels = getSnoopyAndWoodstockVoxels(elapsed);

    for (let i = 0; i < snoopyVoxels.length; i++) {
        projectAndPlot(snoopyVoxels[i], false);
    }
    }

    // Render Pooh and Piglet only when enabled
    if (poohEnabled) {
    const poohAndPigletVoxels = getPoohAndPigletVoxels(elapsed);

        for (let i = 0; i < poohAndPigletVoxels.length; i++) {
            projectAndPlot(poohAndPigletVoxels[i], false);
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
      if (s.y < -22) {
        s.y = 28;
<<<<<<< HEAD
        s.x = (Math.random() - 0.5) * 64;
        s.z = (Math.random() - 0.5) * 64;
=======
        s.x = (Math.random() - 0.5) * 72;
        s.z = (Math.random() - 0.5) * 72;
>>>>>>> 87f00e2 (Update character toggles and snowy floor)
      }
      projectAndPlot({ x: s.x, y: s.y, z: s.z, nx: 0, ny: 1, nz: 0, type: "snowflake", glyph: s.glyph, brightness: s.brightness }, false);
    }
  }

  ctx.font = `700 ${Math.round(CELL_H * 1.05)}px "JetBrains Mono", "Fira Code", Consolas, monospace`;
  ctx.textBaseline = "top";

  let lastColor = "";
  let lastGlow = -1;

  for (let r = 0; r < rows; r++) {
    const drawY = r * CELL_H;
    for (let c = 0; c < cols; c++) {
      const slot = cellBuffer[r * cols + c];
      if (!slot) continue;

      const v = slot.v;
      const styled = shadeVoxel({
        type: v.type,
        phase: v.phase,
        glyph: v.glyph,
        brightness: v.brightness,
        nx: slot.nx,
        ny: slot.ny,
        nz: slot.nz,
        viewNz: slot.viewNz
      }, elapsed);

      if (styled.color !== lastColor) {
        ctx.fillStyle = styled.color;
        lastColor = styled.color;
      }
      if (styled.glow !== lastGlow) {
        if (styled.glow > 0) {
          ctx.shadowColor = styled.color;
          ctx.shadowBlur = styled.glow;
        } else {
          ctx.shadowBlur = 0;
        }
        lastGlow = styled.glow;
      } else if (styled.glow > 0 && styled.color !== lastColor) {
        ctx.shadowColor = styled.color;
      }

      ctx.fillText(styled.ch, c * CELL_W, drawY);
    }
  }
  ctx.shadowBlur = 0;

  const deg = Math.round(((rotY * 180) / Math.PI) % 360);
  const pct = Math.round(buildProgress * 100);
  hudStats.textContent = `t: ${elapsed.toFixed(2)}s | build: ${pct}% | matrix: ${cols}x${rows} | voxels: ${visibleCount} | rot: ${deg}°`;

  requestAnimationFrame(render);
}

generateTreeVoxels();
resize();
requestAnimationFrame(render);
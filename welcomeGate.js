
/* =====================================================
   CHRISTMAS WONDERLAND - OPTIMIZED 3D ASCII GATEHOUSE

   High Detail Preset:
   ASCII Grid: 140 x 75
   Target FPS: 45

   Features:
   - 3D ASCII voxel cottage
   - Z-buffer depth rendering
   - Cached glyph texture atlas
   - Smooth 3D rotation
   - Snowy roof and chimney
   - Glowing windows and double doors
   - Christmas trees and snow
   - Welcome screen and Enter button

   Standalone welcomeGate.js
===================================================== */

(() => {
  "use strict";

  // Prevent duplicate welcome screens
  if (document.getElementById("wonderland-welcome")) {
    return;
  }

  // =====================================================
  // CONFIGURATION
  // =====================================================

  const CONFIG = {
    gridCols: 140,
    gridRows: 75,
    targetFPS: 45,

    rotationSpeed: 0.32,
    rotationAmount: 0.43,

    floatSpeed: 0.75,
    floatAmount: 0.07,

    cameraDistance: 18,
    snowCount: 110,

    background: "#06111d"
  };

  const FRAME_INTERVAL = 1000 / CONFIG.targetFPS;

  // =====================================================
  // COLORS
  // =====================================================

  const COLORS = {
    wall: "#d9b58b",
    wallShadow: "#a77b58",
    wallTrim: "#f0d5aa",

    roof: "#bd4548",
    roofDark: "#832e38",
    snow: "#e5f7ff",
    snowShadow: "#a9d5e8",

    chimney: "#aa5149",

    window: "#ffd56b",
    windowBright: "#fff2aa",
    windowFrame: "#704b36",

    door: "#74452f",
    doorDark: "#4a2c25",
    doorTrim: "#f3d28a",

    tree: "#27885e",
    treeLight: "#4fd29a",
    ornamentGold: "#ffd166",
    ornamentRed: "#ff7070",

    trunk: "#77513c",
    ground: "#c9e8f2",
    pathway: "#b6d6df",

    star: "#fff2aa"
  };

  // =====================================================
  // STYLES
  // =====================================================

  const style = document.createElement("style");

  style.textContent = `
    #wonderland-welcome {
      position: fixed;
      inset: 0;
      z-index: 99999;

      display: flex;
      justify-content: center;
      align-items: center;

      overflow: hidden;

      background:
        radial-gradient(
          ellipse at 50% 55%,
          #17413d 0%,
          #0a2331 45%,
          #020610 100%
        );

      color: white;

      opacity: 1;

      transition:
        opacity 1.2s ease,
        visibility 1.2s ease;
    }

    #wonderland-welcome.gate-hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    #welcome-3d-canvas {
      position: absolute;
      inset: 0;

      width: 100%;
      height: 100%;

      pointer-events: none;
    }

    .wonderland-ui {
      position: relative;
      z-index: 2;

      width: 100%;
      height: 100%;

      display: flex;
      flex-direction: column;
      align-items: center;

      padding: 5vh 12px 4vh;

      pointer-events: none;
    }

    .wonderland-kicker {
      font-family: "Courier New", monospace;
      font-size: 11px;
      letter-spacing: 4px;
      color: #b3dce7;
      text-align: center;
    }

    .wonderland-heading {
      margin: 12px 0 0;

      font-family: Georgia, serif;
      font-size: clamp(23px, 4vw, 48px);
      font-weight: bold;

      color: #ffe7a5;
      text-align: center;

      text-shadow:
        0 0 12px rgba(255, 200, 90, 0.8),
        0 0 30px rgba(255, 200, 90, 0.3);
    }

    .wonderland-subtitle {
      margin-top: 10px;

      font-family: Georgia, serif;
      font-size: clamp(12px, 1.8vw, 17px);
      font-style: italic;

      color: #c6dfe4;
      text-align: center;
    }

    .wonderland-bottom {
      margin-top: auto;

      display: flex;
      flex-direction: column;
      align-items: center;

      gap: 12px;
      padding-bottom: 3vh;

      pointer-events: auto;
    }

    #wonderland-enter {
      padding: 15px 34px;

      border: 1px solid #facc15;
      border-radius: 30px;

      background: rgba(250, 204, 21, 0.12);
      color: #ffe7a5;

      font-family: "Courier New", monospace;
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 2px;

      cursor: pointer;

      transition:
        background 0.3s,
        color 0.3s,
        transform 0.3s,
        box-shadow 0.3s;

      box-shadow:
        0 0 20px rgba(250, 204, 21, 0.2);
    }

    #wonderland-enter:hover {
      background: #facc15;
      color: #10201c;

      transform: scale(1.06);

      box-shadow:
        0 0 35px rgba(250, 204, 21, 0.65);
    }

    #wonderland-enter:disabled {
      opacity: 0.6;
      cursor: default;
    }

    .wonderland-hint {
      color: #91a9b9;

      font-family: "Courier New", monospace;
      font-size: 11px;

      text-align: center;
    }

    @media (max-width: 600px) {
      .wonderland-ui {
        padding-top: 8vh;
      }

      .wonderland-kicker {
        font-size: 9px;
        letter-spacing: 2px;
      }

      #wonderland-enter {
        font-size: 12px;
        padding: 13px 22px;
      }
    }
  `;

  document.head.appendChild(style);

  // =====================================================
  // BUILD WELCOME SCREEN
  // =====================================================

  const welcome = document.createElement("div");
  welcome.id = "wonderland-welcome";

  const canvas = document.createElement("canvas");
  canvas.id = "welcome-3d-canvas";

  const ui = document.createElement("div");
  ui.className = "wonderland-ui";

  const kicker = document.createElement("div");
  kicker.className = "wonderland-kicker";
  kicker.textContent = "✦ A MAGICAL CHRISTMAS JOURNEY ✦";

  const heading = document.createElement("h1");
  heading.className = "wonderland-heading";
  heading.textContent = "Welcome to the Wonderland...";

  const subtitle = document.createElement("p");
  subtitle.className = "wonderland-subtitle";
  subtitle.textContent =
    "Beyond these gates, a little Christmas magic is waiting for you Fimmi.";

  const bottom = document.createElement("div");
  bottom.className = "wonderland-bottom";

  const enterButton = document.createElement("button");
  enterButton.id = "wonderland-enter";
  enterButton.textContent = "✦ ENTER WONDERLAND ✦";

  const hint = document.createElement("div");
  hint.className = "wonderland-hint";
  hint.textContent =
    "♫ Enter to begin your Christmas journey";

  bottom.append(enterButton, hint);
  ui.append(kicker, heading, subtitle, bottom);

  welcome.append(canvas, ui);
  document.body.appendChild(welcome);

  const ctx = canvas.getContext("2d", {
    alpha: true
  });

  // =====================================================
  // 3D GEOMETRY STORAGE
  // =====================================================

  const voxels = [];

  const palette = [];
  const colorLookup = new Map();

  function getColorId(color) {
    if (!colorLookup.has(color)) {
      const id = palette.length;
      palette.push(color);
      colorLookup.set(color, id);
    }

    return colorLookup.get(color);
  }

  function voxel(x, y, z, color, char = "#") {
    voxels.push({
      x,
      y,
      z,
      colorId: getColorId(color),
      char
    });
  }

  // Create only surface voxels rather than filling
  // the entire volume with unnecessary points.
  function box(
    x1, x2,
    y1, y2,
    z1, z2,
    color,
    char = "#",
    step = 0.22
  ) {
    const nx = Math.max(1, Math.ceil((x2 - x1) / step));
    const ny = Math.max(1, Math.ceil((y2 - y1) / step));
    const nz = Math.max(1, Math.ceil((z2 - z1) / step));

    function add(x, y, z) {
      voxel(x, y, z, color, char);
    }

    // Front and back faces
    for (let ix = 0; ix <= nx; ix++) {
      const x = x1 + (x2 - x1) * ix / nx;

      for (let iy = 0; iy <= ny; iy++) {
        const y = y1 + (y2 - y1) * iy / ny;

        add(x, y, z1);
        add(x, y, z2);
      }
    }

    // Left and right faces
    for (let iz = 1; iz < nz; iz++) {
      const z = z1 + (z2 - z1) * iz / nz;

      for (let iy = 0; iy <= ny; iy++) {
        const y = y1 + (y2 - y1) * iy / ny;

        add(x1, y, z);
        add(x2, y, z);
      }
    }

    // Top and bottom faces
    for (let ix = 1; ix < nx; ix++) {
      const x = x1 + (x2 - x1) * ix / nx;

      for (let iz = 1; iz < nz; iz++) {
        const z = z1 + (z2 - z1) * iz / nz;

        add(x, y1, z);
        add(x, y2, z);
      }
    }
  }

  // =====================================================
  // MAIN COTTAGE WALLS
  // =====================================================

  box(
    -2.8, 2.8,
    -1.9, 1.25,
    -1.7, 1.7,
    COLORS.wall,
    "#",
    0.18
  );

  // Decorative corner pillars
  for (const x of [-2.8, 2.8]) {
    for (const z of [-1.7, 1.7]) {
      box(
        x - 0.11, x + 0.11,
        -1.9, 1.25,
        z - 0.11, z + 0.11,
        COLORS.wallShadow,
        "|",
        0.18
      );
    }
  }

  // Horizontal wall trim
  for (let x = -2.8; x <= 2.8; x += 0.12) {
    voxel(x, -1.72, 1.79, COLORS.wallTrim, "=");
    voxel(x, 1.12, 1.79, COLORS.wallTrim, "=");
  }

  // =====================================================
  // SNOW-COVERED ROOF
  // =====================================================

  for (let x = -3.25; x <= 3.25; x += 0.11) {
    const roofY = 3.2 - Math.abs(x) * 0.58;

    for (let z = -2.1; z <= 2.1; z += 0.12) {
      const pattern =
        Math.sin(x * 7 + z * 4) +
        Math.cos(z * 9 - x * 2);

      const snowy = pattern > -0.45;

      voxel(
        x,
        roofY,
        z,
        snowy ? COLORS.snow : COLORS.roof,
        snowy ? "*" : "^"
      );
    }
  }

  // Roof ridge
  for (let z = -2.1; z <= 2.1; z += 0.1) {
    voxel(
      0,
      3.24,
      z,
      COLORS.snow,
      "*"
    );
  }

  // Snowy eaves
  for (let z = -2.1; z <= 2.1; z += 0.1) {
    voxel(
      -3.25,
      1.31,
      z,
      COLORS.snow,
      "*"
    );

    voxel(
      3.25,
      1.31,
      z,
      COLORS.snow,
      "*"
    );
  }

  // =====================================================
  // CHIMNEY
  // =====================================================

  box(
    1.35, 1.9,
    2.15, 3.75,
    -0.9, -0.35,
    COLORS.chimney,
    "#",
    0.14
  );

  box(
    1.25, 2.0,
    3.75, 3.85,
    -1.0, -0.25,
    COLORS.snow,
    "*",
    0.13
  );

  // =====================================================
  // FRONT DOUBLE DOORS
  // =====================================================

  // Outer door trim
  box(
    -0.95, 0.95,
    -1.9, 0.8,
    1.74, 1.84,
    COLORS.doorTrim,
    "+",
    0.13
  );

  // Left door
  box(
    -0.78, -0.04,
    -1.9, 0.64,
    1.86, 1.96,
    COLORS.door,
    "|",
    0.13
  );

  // Right door
  box(
    0.04, 0.78,
    -1.9, 0.64,
    1.86, 1.96,
    COLORS.door,
    "|",
    0.13
  );

  // Door panels
  for (const centerX of [-0.41, 0.41]) {
    for (const panelY of [-1.2, -0.1]) {
      box(
        centerX - 0.23,
        centerX + 0.23,
        panelY - 0.37,
        panelY + 0.37,
        1.98,
        2.01,
        COLORS.doorDark,
        "+",
        0.1
      );
    }
  }

  // Golden handles
  voxel(
    -0.16,
    -0.62,
    2.08,
    COLORS.windowBright,
    "o"
  );

  voxel(
    0.16,
    -0.62,
    2.08,
    COLORS.windowBright,
    "o"
  );

  // =====================================================
  // FRONT WINDOWS
  // =====================================================

  function addFrontWindow(cx) {
    box(
      cx - 0.5,
      cx + 0.5,
      -0.3,
      0.9,
      1.78,
      1.87,
      COLORS.windowFrame,
      "+",
      0.12
    );

    box(
      cx - 0.36,
      cx + 0.36,
      -0.15,
      0.75,
      1.89,
      1.94,
      COLORS.window,
      "*",
      0.11
    );

    // Vertical window cross
    for (let y = -0.15; y <= 0.75; y += 0.08) {
      voxel(
        cx,
        y,
        2.02,
        COLORS.windowFrame,
        "|"
      );
    }

    // Horizontal window cross
    for (
      let x = cx - 0.36;
      x <= cx + 0.36;
      x += 0.08
    ) {
      voxel(
        x,
        0.3,
        2.02,
        COLORS.windowFrame,
        "-"
      );
    }

    // Snow on windowsill
    for (
      let x = cx - 0.55;
      x <= cx + 0.55;
      x += 0.09
    ) {
      voxel(
        x,
        -0.34,
        1.99,
        COLORS.snow,
        "*"
      );
    }
  }

  addFrontWindow(-1.85);
  addFrontWindow(1.85);

  // =====================================================
  // SIDE WINDOWS
  // =====================================================

  for (const sideX of [-2.88, 2.88]) {
    for (const z of [-0.65, 0.65]) {
      box(
        sideX - 0.03,
        sideX + 0.03,
        -0.15,
        0.78,
        z - 0.36,
        z + 0.36,
        COLORS.window,
        "*",
        0.13
      );
    }
  }

  // =====================================================
  // CHRISTMAS WREATH ABOVE DOOR
  // =====================================================

  for (
    let a = 0;
    a < Math.PI * 2;
    a += 0.18
  ) {
    const x = Math.cos(a) * 0.29;
    const y = 0.96 + Math.sin(a) * 0.29;

    voxel(
      x,
      y,
      2.03,
      COLORS.tree,
      "+"
    );
  }

  voxel(
    0,
    0.65,
    2.07,
    COLORS.ornamentRed,
    "*"
  );

  // =====================================================
  // CHRISTMAS TREES
  // =====================================================

  function addTree(cx, cz, size = 1) {
    const baseY = -1.9;

    // Tree trunk
    box(
      cx - 0.12 * size,
      cx + 0.12 * size,
      baseY,
      baseY + 0.65 * size,
      cz - 0.12 * size,
      cz + 0.12 * size,
      COLORS.trunk,
      "|",
      0.12
    );

    const treeHeight = 2.6 * size;

    for (
      let y = 0;
      y <= treeHeight;
      y += 0.12
    ) {
      const radius =
        (1 - y / treeHeight) *
        0.95 *
        size;

      for (
        let a = 0;
        a < Math.PI * 2;
        a += 0.19
      ) {
        const x =
          cx + Math.cos(a) * radius;

        const z =
          cz + Math.sin(a) * radius;

        const pattern =
          Math.sin(a * 7 + y * 11);

        let color = COLORS.tree;
        let char = "+";

        if (pattern > 0.92) {
          color = COLORS.ornamentGold;
          char = "*";
        } else if (pattern < -0.94) {
          color = COLORS.ornamentRed;
          char = "o";
        } else if (pattern > 0.65) {
          color = COLORS.treeLight;
        }

        voxel(
          x,
          baseY + 0.55 * size + y,
          z,
          color,
          char
        );
      }
    }

    // Tree topper
    voxel(
      cx,
      baseY + 0.55 * size + treeHeight + 0.1,
      cz,
      COLORS.star,
      "*"
    );
  }

  addTree(-4.35, 2.1, 1.05);
  addTree(4.35, 2.1, 1.05);

  // =====================================================
  // SNOWY WALKWAY
  // =====================================================

  for (
    let z = 2;
    z <= 5.2;
    z += 0.14
  ) {
    for (
      let x = -1.2;
      x <= 1.2;
      x += 0.14
    ) {
      const pattern =
        Math.sin(x * 8 + z * 5);

      voxel(
        x,
        -1.95,
        z,
        pattern > 0.3
          ? COLORS.snow
          : COLORS.pathway,
        "."
      );
    }
  }

  // =====================================================
  // ASCII GRID + DEPTH BUFFER
  // =====================================================

  const COLS = CONFIG.gridCols;
  const ROWS = CONFIG.gridRows;
  const CELL_COUNT = COLS * ROWS;

  const depthBuffer = new Float32Array(CELL_COUNT);
  const charBuffer = new Array(CELL_COUNT);
  const colorBuffer = new Int16Array(CELL_COUNT);

  function clearBuffers() {
    depthBuffer.fill(-Infinity);
    charBuffer.fill("");
    colorBuffer.fill(-1);
  }

  // =====================================================
  // GLYPH ATLAS CACHE
  // =====================================================

  const GLYPHS = [
    "#",
    "*",
    "^",
    "+",
    "|",
    "-",
    "=",
    "o",
    "."
  ];

  const ATLAS_CELL = 32;
  const atlas = document.createElement("canvas");

  atlas.width = ATLAS_CELL * GLYPHS.length;
  atlas.height = ATLAS_CELL * palette.length;

  const atlasCtx = atlas.getContext("2d");

  atlasCtx.textAlign = "center";
  atlasCtx.textBaseline = "middle";
  atlasCtx.font = "bold 25px monospace";

  const glyphIndex = new Map();

  GLYPHS.forEach((char, index) => {
    glyphIndex.set(char, index);
  });

  for (
    let colorId = 0;
    colorId < palette.length;
    colorId++
  ) {
    atlasCtx.fillStyle = palette[colorId];

    for (
      let glyphId = 0;
      glyphId < GLYPHS.length;
      glyphId++
    ) {
      atlasCtx.fillText(
        GLYPHS[glyphId],
        glyphId * ATLAS_CELL + ATLAS_CELL / 2,
        colorId * ATLAS_CELL + ATLAS_CELL / 2
      );
    }
  }

  // =====================================================
  // SNOW PARTICLES
  // =====================================================

  const snowflakes = Array.from(
    { length: CONFIG.snowCount },
    () => ({
      x: Math.random(),
      y: Math.random(),

      speed:
        0.025 + Math.random() * 0.055,

      drift:
        Math.random() * 0.02 - 0.01,

      radius:
        0.5 + Math.random() * 1.5,

      alpha:
        0.2 + Math.random() * 0.65
    })
  );

  // =====================================================
  // CANVAS SIZE
  // =====================================================

  let width = 0;
  let height = 0;
  let cellW = 0;
  let cellH = 0;

  let running = true;
  let frameId = 0;
  let lastFrame = 0;
  let startTime = performance.now();

  function resize() {
    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    cellW = width / COLS;
    cellH = height / ROWS;
  }

  // =====================================================
  // 3D PROJECTION
  // =====================================================

  function projectVoxel(
    p,
    cosA,
    sinA,
    scale,
    centerX,
    centerY
  ) {
    const rx =
      p.x * cosA - p.z * sinA;

    const rz =
      p.x * sinA + p.z * cosA;

    const depth =
      CONFIG.cameraDistance - rz;

    if (depth <= 0.1) {
      return null;
    }

    const perspective =
      CONFIG.cameraDistance / depth;

    return {
      x:
        centerX + rx * scale * perspective,

      y:
        centerY - p.y * scale * perspective,

      depth: rz
    };
  }

  // =====================================================
  // RENDER HOUSE INTO Z-BUFFER
  // =====================================================

  function renderHouse(time) {
    clearBuffers();

    const t =
      (time - startTime) * 0.001;

    // Smooth rotation
    const angle =
      Math.sin(t * CONFIG.rotationSpeed) *
      CONFIG.rotationAmount;

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    // Gentle floating movement
    const floatY =
      Math.sin(t * CONFIG.floatSpeed) *
      CONFIG.floatAmount;

    const scale = Math.min(
      width / 12.5,
      height / 11.5,
      70
    );

    const centerX = width / 2;

    const centerY =
      height * 0.56 +
      floatY * scale;

    // Project each 3D voxel into ASCII grid
    for (let i = 0; i < voxels.length; i++) {
      const p = voxels[i];

      const projected = projectVoxel(
        p,
        cosA,
        sinA,
        scale,
        centerX,
        centerY
      );

      if (!projected) continue;

      const col = Math.floor(
        projected.x / cellW
      );

      const row = Math.floor(
        projected.y / cellH
      );

      if (
        col < 0 ||
        col >= COLS ||
        row < 0 ||
        row >= ROWS
      ) {
        continue;
      }

      const index =
        row * COLS + col;

      if (
        projected.depth >
        depthBuffer[index]
      ) {
        depthBuffer[index] =
          projected.depth;

        charBuffer[index] = p.char;
        colorBuffer[index] = p.colorId;
      }
    }
  }

  // =====================================================
  // DRAW CACHED ASCII GLYPHS
  // =====================================================

  function drawAsciiGrid() {
    ctx.imageSmoothingEnabled = true;

    const drawW = cellW * 1.15;
    const drawH = cellH * 1.15;

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const index =
          row * COLS + col;

        const char = charBuffer[index];

        if (!char) continue;

        const colorId =
          colorBuffer[index];

        const glyphId =
          glyphIndex.get(char);

        if (glyphId === undefined) continue;

        const sourceX =
          glyphId * ATLAS_CELL;

        const sourceY =
          colorId * ATLAS_CELL;

        const destX =
          col * cellW;

        const destY =
          row * cellH;

        ctx.drawImage(
          atlas,
          sourceX,
          sourceY,
          ATLAS_CELL,
          ATLAS_CELL,
          destX,
          destY,
          drawW,
          drawH
        );
      }
    }
  }

  // =====================================================
  // DRAW FALLING SNOW
  // =====================================================

  function drawSnow(deltaSeconds, time) {
    ctx.fillStyle = "#e4f6ff";

    for (const flake of snowflakes) {
      flake.y +=
        flake.speed * deltaSeconds;

      flake.x +=
        flake.drift * deltaSeconds;

      if (flake.y > 1) {
        flake.y = 0;
        flake.x = Math.random();
      }

      if (flake.x > 1) flake.x = 0;
      if (flake.x < 0) flake.x = 1;

      const x =
        flake.x * width +
        Math.sin(
          time * 0.0004 +
          flake.y * 9
        ) * 8;

      const y =
        flake.y * height;

      ctx.globalAlpha = flake.alpha;

      ctx.beginPath();
      ctx.arc(
        x,
        y,
        flake.radius,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  }

  // =====================================================
  // MAIN ANIMATION LOOP
  // =====================================================

  function animate(time) {
    if (!running) return;

    frameId = requestAnimationFrame(animate);

    const elapsed =
      time - lastFrame;

    if (elapsed < FRAME_INTERVAL) {
      return;
    }

    const deltaSeconds =
      Math.min(elapsed / 1000, 0.05);

    lastFrame = time;

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    renderHouse(time);
    drawAsciiGrid();
    drawSnow(deltaSeconds, time);
  }

  // =====================================================
  // START ANIMATION
  // =====================================================

  window.addEventListener("resize", resize);

  resize();

  frameId = requestAnimationFrame(animate);

  // =====================================================
  // ENTER WONDERLAND
  // =====================================================

  enterButton.addEventListener("click", () => {
    enterButton.disabled = true;

    enterButton.textContent =
      "✦ OPENING THE GATES... ✦";

    // Notify index.js to start the Christmas scene
    document.dispatchEvent(
      new CustomEvent("wonderland:enter")
    );

    // Fade out the welcome screen
    welcome.classList.add("gate-hidden");

    setTimeout(() => {
      running = false;

      cancelAnimationFrame(frameId);

      window.removeEventListener(
        "resize",
        resize
      );

      welcome.remove();
      style.remove();
    }, 1200);
  });

})();

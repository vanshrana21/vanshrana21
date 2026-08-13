/**
 * Terminal banner for the profile README, drawn from live account data.
 *
 * Rendered as an <img>, so: no external fonts, no scripts, no CSS files.
 * Motion is SMIL (<animate> / <animateTransform>) — that's what survives
 * being loaded as an image. Depth comes from stacked offset layers plus
 * feGaussianBlur glow; there is no real 3D, it's painted.
 */

const F = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const W = 1000;
const H = 520;

// 5-row block art: V A N S H
const ART = [
  "█   █  ███  █   █  ████ █   █",
  "█   █ █   █ ██  █ █     █   █",
  "█   █ █████ █ █ █  ███  █████",
  " █ █  █   █ █  ██     █ █   █",
  "  █   █   █ █   █ ████  █   █",
];

const CELL = 16;
const ART_X = 44;
const ART_Y = 104;

/** Every filled cell of the block art, as [x, y] pairs. */
const CELLS: [number, number][] = ART.flatMap((row, r) =>
  [...row].flatMap((ch, col) =>
    ch === "█"
      ? ([[ART_X + col * CELL, ART_Y + r * CELL]] as [number, number][])
      : [],
  ),
);

/**
 * One extrusion layer of the block art, offset diagonally.
 *
 * Cells overlap by 0.6px and render crisp: tiled rects otherwise leave
 * antialiased hairline seams, and the darker layer beneath shows through
 * them, which reads as stripes across every letter.
 */
function artLayer(dx: number, dy: number, fill: string, extra = ""): string {
  const S = CELL + 0.6;
  return CELLS.map(
    ([x, y]) =>
      `<rect x="${x + dx}" y="${y + dy}" width="${S}" height="${S}" fill="${fill}" shape-rendering="crispEdges"${extra}/>`,
  ).join("");
}

/** Sine-ish wave built from alternating quadratic humps, tiled to `total`. */
function wavePath(y: number, amp: number, wl: number, total: number): string {
  let d = `M 0 ${y}`;
  for (let x = 0; x < total; x += wl) {
    d += ` q ${wl / 4} ${-amp} ${wl / 2} 0 q ${wl / 4} ${amp} ${wl / 2} 0`;
  }
  return d;
}

function wave(
  y: number,
  amp: number,
  wl: number,
  color: string,
  dur: number,
  opacity: number,
): string {
  return `<path d="${wavePath(y, amp, wl, 2400)}" fill="none" stroke="${color}" stroke-width="1.6" opacity="${opacity}" filter="url(#soft)">
      <animateTransform attributeName="transform" type="translate" from="0 0" to="-${wl} 0" dur="${dur}s" repeatCount="indefinite"/>
    </path>`;
}

export function buildHeader(u: any, today: string): string {
  const c = u.contributionsCollection;

  const modules: [string, number, string][] = [
    ["Python / FastAPI", 0.85, "Juris AI, KAVACH detection engine"],
    ["TypeScript / Bun", 0.75, "ScopeGuard, tooling, this README"],
    ["Luau / Roblox", 0.8, "game systems + progression"],
    ["Security / Guardrails", 0.7, "prompt-injection defence, phishing"],
  ];

  const modLines = modules
    .map(([name, frac, note], i) => {
      const y = 256 + i * 30;
      const BW = 150;
      const fill = Math.round(BW * frac);
      return `<text x="46" y="${y + 8}" font-family="${F}" font-size="13" fill="#cbb9f2">&gt; ${name}</text>
    <text x="240" y="${y + 8}" font-family="${F}" font-size="13" fill="#6d5b95">[</text>
    <rect x="252" y="${y}" width="${BW}" height="9" rx="2" fill="#1d1236"/>
    <rect x="252" y="${y}" width="${fill}" height="9" rx="2" fill="url(#bar)" filter="url(#soft)">
      <animate attributeName="width" values="0;${fill}" keyTimes="0;1" calcMode="spline" keySplines="0.2 0.8 0.2 1" dur="1.5s" begin="0.4s" fill="freeze"/>
    </rect>
    <text x="408" y="${y + 8}" font-family="${F}" font-size="13" fill="#6d5b95">]</text>
    <text x="428" y="${y + 8}" font-family="${F}" font-size="12" fill="#6f5f93">// ${note}</text>`;
    })
    .join("\n    ");

  const diag: [string, string][] = [
    ["NODE", "vanshrana21"],
    ["ACTIVE MODULES", String(u.repositories.totalCount)],
    ["CONTRIBUTIONS", String(c.contributionCalendar.totalContributions)],
    ["LAST SYNC", today],
  ];
  const diagLines = diag
    .map(
      ([k, v], i) =>
        `<text x="666" y="${150 + i * 24}" font-family="${F}" font-size="12" fill="#6f5f93">${k}:</text>
    <text x="946" y="${150 + i * 24}" font-family="${F}" font-size="12" fill="#cbb9f2" text-anchor="end">${v}</text>`,
    )
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Vansh Rana — terminal banner">
  <defs>
    <!-- userSpaceOnUse: with the default objectBoundingBox every single
         16px cell paints the whole ramp, which reads as diagonal stripes
         across the letters instead of one gradient over the word. -->
    <linearGradient id="art" gradientUnits="userSpaceOnUse"
      x1="${ART_X}" y1="${ART_Y}" x2="${ART_X + 29 * CELL}" y2="${ART_Y + 5 * CELL}">
      <stop offset="0%" stop-color="#e9d5ff"/>
      <stop offset="45%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#67e8f9"/>
    </linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#d8b4fe"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="50%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#3b0764"/>
    </linearGradient>
    <radialGradient id="spot" cx="32%" cy="34%" r="52%">
      <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.42"/>
      <stop offset="55%" stop-color="#4c1d95" stop-opacity="0.14"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vig" cx="50%" cy="50%" r="75%">
      <stop offset="60%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.55"/>
    </radialGradient>

    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="7" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="2.4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>

    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="#ffffff" opacity="0.035"/>
    </pattern>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0 L0 0 0 40" fill="none" stroke="#a855f7" stroke-width="0.5" opacity="0.07"/>
    </pattern>

    <clipPath id="body"><rect x="3" y="3" width="${W - 6}" height="${H - 6}" rx="14"/></clipPath>
  </defs>

  <rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="14" fill="#07040f" stroke="url(#edge)" stroke-width="2"/>

  <g clip-path="url(#body)">
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#grid)"/>
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#spot)">
      <animate attributeName="opacity" values="0.75;1;0.75" dur="6s" repeatCount="indefinite"/>
    </rect>

    <!-- flowing depth band -->
    <g>
      ${wave(452, 15, 240, "#22d3ee", 9, 0.5)}
      ${wave(462, 11, 190, "#c084fc", 7, 0.45)}
      ${wave(444, 8, 300, "#f472b6", 13, 0.3)}
    </g>

    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#scan)"/>
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#vig)"/>
  </g>

  <!-- title bar -->
  <path d="M2 16 A14 14 0 0 1 16 2 L${W - 16} 2 A14 14 0 0 1 ${W - 2} 16 L${W - 2} 40 L2 40 Z" fill="#160d29"/>
  <line x1="2" y1="40" x2="${W - 2}" y2="40" stroke="#3b2a63" stroke-width="1"/>
  <circle cx="28" cy="21" r="6" fill="#f87171"/>
  <circle cx="50" cy="21" r="6" fill="#fbbf24"/>
  <circle cx="72" cy="21" r="6" fill="#34d399"/>
  <text x="${W / 2}" y="26" font-family="${F}" font-size="12.5" fill="#8b7bb8" text-anchor="middle">vanshrana21@VANSH-Terminal:~ (uplink: stable · mumbai)</text>

  <text x="44" y="76" font-family="${F}" font-size="14" fill="#67e8f9" filter="url(#soft)">&gt; Initializing VANSH-OS v2.6 ...</text>

  <!-- extruded block art: deep shadow -> mid -> lit face -->
  <g opacity="0.9">${artLayer(11, 11, "#1b0b38")}</g>
  <g opacity="0.95">${artLayer(7, 7, "#3b1a70")}</g>
  <g>${artLayer(3, 3, "#6d28d9")}</g>
  <g filter="url(#glow)">${artLayer(0, 0, "url(#art)")}</g>

  <rect x="650" y="100" width="310" height="126" rx="8" fill="#0f0a1c" fill-opacity="0.92" stroke="#4c2a86" stroke-width="1.5">
    <animate attributeName="stroke" values="#4c2a86;#a855f7;#4c2a86" dur="5s" repeatCount="indefinite"/>
  </rect>
  <text x="666" y="126" font-family="${F}" font-size="12.5" fill="#c084fc" filter="url(#soft)">[SYSTEM DIAGNOSTICS]</text>
  ${diagLines}

  <text x="44" y="232" font-family="${F}" font-size="14" fill="#f472b6" filter="url(#soft)">&gt;_ core_modules_loaded</text>
  ${modLines}

  <text x="44" y="398" font-family="${F}" font-size="14" fill="#f472b6" filter="url(#soft)">&gt;_ connected_nodes</text>
  <text x="46" y="422" font-family="${F}" font-size="12.5" fill="#cbb9f2">&gt; KAVACH    github.com/vanshrana21/kavach</text>
  <text x="520" y="422" font-family="${F}" font-size="12.5" fill="#cbb9f2">&gt; LinkedIn  in/vansh-rana-bb29a0385</text>

  <text x="44" y="500" font-family="${F}" font-size="13" fill="#9d8cc4">vanshrana21@vansh:~$ ship --and --keep-shipping</text>
  <rect x="430" y="490" width="8" height="13" fill="#d8b4fe" filter="url(#soft)">
    <animate attributeName="opacity" values="1;1;0;0" dur="1.15s" repeatCount="indefinite"/>
  </rect>
</svg>
`;
}

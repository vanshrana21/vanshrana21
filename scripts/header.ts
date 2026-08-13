/**
 * Terminal banner for the profile README, drawn from live account data.
 *
 * Rendered as an <img>, so: no external fonts, no scripts, no CSS files.
 * Motion is SMIL + internal CSS keyframes; both run in <img>-embedded SVG.
 *
 * Depth is a CRT simulation rather than SVG filters: a metallic bezel, an
 * inset screen, corner curvature, and a diagonal glass reflection. Glow is
 * CSS text-shadow / drop-shadow — feGaussianBlur blurs the source and comes
 * out muddy, which is what made the first version look flat.
 */

const F = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const W = 1000;
const H = 530;

// screen inset within the bezel
const SX = 15;
const SY = 15;
const SW = W - 30;
const SH = H - 30;

const ART = [
  "█   █  ███  █   █  ████ █   █",
  "█   █ █   █ ██  █ █     █   █",
  "█   █ █████ █ █ █  ███  █████",
  " █ █  █   █ █  ██     █ █   █",
  "  █   █   █ █   █ ████  █   █",
];

const CELL = 16;
const ART_X = 48;
const ART_Y = 112;

const CELLS: [number, number][] = ART.flatMap((row, r) =>
  [...row].flatMap((ch, col) =>
    ch === "█"
      ? ([[ART_X + col * CELL, ART_Y + r * CELL]] as [number, number][])
      : [],
  ),
);

/** One extrusion layer of the block art, offset diagonally. */
function artLayer(dx: number, dy: number, fill: string): string {
  const S = CELL + 0.6; // overlap kills antialiased seams between cells
  return CELLS.map(
    ([x, y]) =>
      `<rect x="${x + dx}" y="${y + dy}" width="${S}" height="${S}" fill="${fill}" shape-rendering="crispEdges"/>`,
  ).join("");
}

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
  return `<path d="${wavePath(y, amp, wl, 2600)}" fill="none" stroke="${color}" stroke-width="1.5" opacity="${opacity}">
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
      const y = 262 + i * 30;
      const BW = 150;
      const fill = Math.round(BW * frac);
      return `<text x="50" y="${y + 8}" class="mono s13 fg">&gt; ${name}</text>
    <text x="244" y="${y + 8}" class="mono s13 dim">[</text>
    <rect x="256" y="${y}" width="${BW}" height="9" rx="2" fill="#1b1033"/>
    <rect x="256" y="${y}" width="${fill}" height="9" rx="2" fill="url(#bar)" class="barGlow">
      <animate attributeName="width" values="0;${fill}" keyTimes="0;1" calcMode="spline" keySplines="0.2 0.8 0.2 1" dur="1.5s" begin="0.3s" fill="freeze"/>
    </rect>
    <text x="412" y="${y + 8}" class="mono s13 dim">]</text>
    <text x="432" y="${y + 8}" class="mono s12 dim">// ${note}</text>`;
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
        `<text x="672" y="${158 + i * 24}" class="mono s12 dim">${k}:</text>
    <text x="944" y="${158 + i * 24}" class="mono s12 fg" text-anchor="end">${v}</text>`,
    )
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Vansh Rana — terminal banner">
  <defs>
    <style>
      .mono { font-family: ${F}; }
      .s12 { font-size: 12px } .s13 { font-size: 13px } .s14 { font-size: 14px }
      .fg   { fill: #cbb9f2 }
      .dim  { fill: #6f5f93 }
      .cyan { fill: #67e8f9; text-shadow: 0 0 5px rgba(103,232,249,.8), 0 0 14px rgba(103,232,249,.35) }
      .pink { fill: #f472b6; text-shadow: 0 0 5px rgba(244,114,182,.75), 0 0 16px rgba(244,114,182,.3) }
      .lav  { fill: #c084fc; text-shadow: 0 0 5px rgba(192,132,252,.7) }
      .barGlow { filter: drop-shadow(0 0 4px rgba(168,85,247,.75)) }
      .artFace { filter: drop-shadow(0 0 12px rgba(168,85,247,.55)) drop-shadow(0 0 30px rgba(103,232,249,.22)) }
      @keyframes blink { 0%,49% { opacity: 1 } 50%,100% { opacity: 0 } }
      .cursor { animation: blink 1.1s steps(1) infinite }
      @keyframes breathe { 0%,100% { opacity: .70 } 50% { opacity: 1 } }
      .breathe { animation: breathe 6s ease-in-out infinite }
    </style>

    <!-- monitor housing: lit along the top, falling into shadow -->
    <linearGradient id="bezel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3a1a55"/>
      <stop offset="45%" stop-color="#1a0c2c"/>
      <stop offset="100%" stop-color="#0a0413"/>
    </linearGradient>

    <!-- one ramp across the whole word; objectBoundingBox would repeat it per cell -->
    <linearGradient id="art" gradientUnits="userSpaceOnUse"
      x1="${ART_X}" y1="${ART_Y}" x2="${ART_X + 29 * CELL}" y2="${ART_Y + 5 * CELL}">
      <stop offset="0%" stop-color="#f0d9ff"/>
      <stop offset="42%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#67e8f9"/>
    </linearGradient>

    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#e9d5ff"/>
    </linearGradient>

    <radialGradient id="spot" cx="30%" cy="32%" r="55%">
      <stop offset="0%" stop-color="#7c3aed" stop-opacity="0.38"/>
      <stop offset="60%" stop-color="#4c1d95" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0"/>
    </radialGradient>

    <!-- CRT corner falloff -->
    <radialGradient id="curve" cx="50%" cy="50%" r="62%">
      <stop offset="80%" stop-color="#000" stop-opacity="0"/>
      <stop offset="95%" stop-color="#000" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.42"/>
    </radialGradient>

    <!-- glare across the glass -->
    <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.11"/>
      <stop offset="26%" stop-color="#fff" stop-opacity="0.035"/>
      <stop offset="27%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>

    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="1" fill="#fff" opacity="0.03"/>
    </pattern>
    <pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse">
      <path d="M42 0 L0 0 0 42" fill="none" stroke="#a855f7" stroke-width="0.5" opacity="0.06"/>
    </pattern>

    <clipPath id="screen"><rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="10"/></clipPath>
  </defs>

  <!-- housing -->
  <rect x="0" y="0" width="${W}" height="${H}" rx="18" fill="url(#bezel)"/>
  <rect x="0.75" y="0.75" width="${W - 1.5}" height="${H - 1.5}" rx="18" fill="none" stroke="#c084fc" stroke-width="1.5" opacity="0.55"/>
  <path d="M18 1 L${W - 18} 1" stroke="#e9d5ff" stroke-width="1" opacity="0.35"/>

  <!-- screen -->
  <rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" rx="10" fill="#08040f"/>

  <g clip-path="url(#screen)">
    <rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="url(#grid)"/>
    <rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="url(#spot)" class="breathe"/>

    <g>
      ${wave(462, 15, 240, "#22d3ee", 9, 0.5)}
      ${wave(472, 11, 190, "#c084fc", 7, 0.45)}
      ${wave(454, 8, 300, "#f472b6", 13, 0.28)}
    </g>

    <!-- title bar -->
    <rect x="${SX}" y="${SY}" width="${SW}" height="34" fill="#170e2a"/>
    <line x1="${SX}" y1="${SY + 34}" x2="${SX + SW}" y2="${SY + 34}" stroke="#3b2a63" stroke-width="1"/>
    <circle cx="38" cy="32" r="5.5" fill="#f87171"/>
    <circle cx="58" cy="32" r="5.5" fill="#fbbf24"/>
    <circle cx="78" cy="32" r="5.5" fill="#34d399"/>
    <text x="${W / 2}" y="36" class="mono s12 dim" text-anchor="middle">vanshrana21@VANSH-Terminal:~ (uplink: stable · mumbai)</text>

    <text x="48" y="84" class="mono s14 cyan">&gt; Initializing VANSH-OS v2.6 ...</text>

    <!-- extruded block art: shadow -> mid -> lit face -->
    <g opacity="0.92">${artLayer(11, 11, "#170929")}</g>
    <g opacity="0.96">${artLayer(7, 7, "#3b1a70")}</g>
    <g>${artLayer(3, 3, "#6d28d9")}</g>
    <g class="artFace">${artLayer(0, 0, "url(#art)")}</g>

    <rect x="656" y="108" width="308" height="126" rx="8" fill="#0d0719" fill-opacity="0.9" stroke="#5b3596" stroke-width="1.5"/>
    <text x="672" y="134" class="mono s12 lav">[SYSTEM DIAGNOSTICS]</text>
    ${diagLines}

    <text x="48" y="238" class="mono s14 pink">&gt;_ core_modules_loaded</text>
    ${modLines}

    <text x="48" y="406" class="mono s14 pink">&gt;_ connected_nodes</text>
    <text x="50" y="430" class="mono s13 fg">&gt; KAVACH    github.com/vanshrana21/kavach</text>
    <text x="524" y="430" class="mono s13 fg">&gt; LinkedIn  in/vansh-rana-bb29a0385</text>

    <text x="48" y="504" class="mono s13 fg">vanshrana21@vansh:~$ ship --and --keep-shipping</text>
    <rect x="434" y="494" width="8" height="13" fill="#e9d5ff" class="cursor barGlow"/>

    <!-- glass on top of everything -->
    <rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="url(#scan)"/>
    <rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="url(#curve)"/>
    <rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="url(#glass)"/>
  </g>
</svg>
`;
}

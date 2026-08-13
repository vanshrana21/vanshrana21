#!/usr/bin/env bun
/**
 * Regenerates README.md from README.template.md using live GitHub data.
 * Run: bun scripts/build-readme.ts
 */

const LOGIN = "vanshrana21";
const TOKEN = process.env.GITHUB_TOKEN;

const QUERY = `
query($login: String!) {
  user(login: $login) {
    name
    followers { totalCount }
    following { totalCount }
    createdAt
    contributionsCollection {
      contributionCalendar { totalContributions }
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
    }
    repositories(
      first: 100
      privacy: PUBLIC
      isFork: false
      ownerAffiliations: OWNER
      orderBy: { field: PUSHED_AT, direction: DESC }
    ) {
      totalCount
      nodes {
        name
        description
        url
        pushedAt
        stargazerCount
        isEmpty
        primaryLanguage { name color }
        languages(first: 5, orderBy: { field: SIZE, direction: DESC }) {
          nodes { name }
        }
      }
    }
  }
}`;

async function graphql() {
  if (!TOKEN) throw new Error("GITHUB_TOKEN is required (GraphQL API needs auth)");
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data.user;
}

/** "3 days ago" / "2 months ago" — relative, so the table never reads as stale. */
function ago(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

function repoTable(repos: any[]): string {
  const rows = repos
    .filter((r) => !r.isEmpty && r.name !== LOGIN)
    .map((r) => {
      const langs = r.languages.nodes.map((l: any) => `\`${l.name}\``).join(" ") || "—";
      const stars = r.stargazerCount > 0 ? ` ⭐ ${r.stargazerCount}` : "";
      const desc = r.description?.trim() || "_no description yet_";
      return `| **[${r.name}](${r.url})**${stars} | ${desc} | ${langs} | ${ago(r.pushedAt)} |`;
    });
  return [
    "| Repo | What it is | Built with | Last pushed |",
    "|---|---|---|---|",
    ...rows,
  ].join("\n");
}

function statsBlock(u: any): string {
  const c = u.contributionsCollection;
  const stars = u.repositories.nodes.reduce(
    (n: number, r: any) => n + r.stargazerCount,
    0,
  );
  const since = new Date(u.createdAt).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  return [
    `🔥 &nbsp;**${c.contributionCalendar.totalContributions.toLocaleString()}** contributions in the last year`,
    `📦 &nbsp;**${c.totalCommitContributions.toLocaleString()}** commits · **${c.totalPullRequestContributions}** PRs · **${c.totalIssueContributions}** issues`,
    `📁 &nbsp;**${u.repositories.totalCount}** public repos · ⭐ **${stars}** stars earned`,
    `👥 &nbsp;**${u.followers.totalCount}** followers · **${u.following.totalCount}** following`,
    `🗓️ &nbsp;On GitHub since **${since}**`,
  ].join("  \n");
}

/**
 * Terminal-style SVG banner, drawn from live account data.
 * Rendered as an <img> in the README, so: no external fonts, no CSS
 * animation (SMIL only — that's what GitHub's image proxy preserves).
 */
function buildHeader(u: any, today: string): string {
  const c = u.contributionsCollection;
  const F = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

  // 5-row block art: V A N S H
  const ART = [
    "█   █  ███  █   █  ████ █   █",
    "█   █ █   █ ██  █ █     █   █",
    "█   █ █████ █ █ █  ███  █████",
    " █ █  █   █ █  ██     █ █   █",
    "  █   █   █ █   █ ████  █   █",
  ];

  const modules: [string, number, string][] = [
    ["Python / FastAPI", 0.85, "Juris AI, KAVACH detection engine"],
    ["TypeScript / Bun", 0.75, "ScopeGuard, tooling, this README"],
    ["Luau / Roblox", 0.80, "Abyssal Dive — systems + progression"],
    ["Security / Guardrails", 0.70, "prompt-injection defence, phishing"],
  ];

  const bar = (frac: number, x: number, y: number) => {
    const W = 150, H = 9;
    const fill = Math.round(W * frac);
    return `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="2" fill="#241a3d"/>
    <rect x="${x}" y="${y}" width="${fill}" height="${H}" rx="2" fill="url(#bar)"/>`;
  };

  const modLines = modules
    .map(([name, frac, note], i) => {
      const y = 254 + i * 30;
      return `<text x="46" y="${y + 8}" font-family="${F}" font-size="13" fill="#c9b8f0">&gt; ${name}</text>
    ${bar(frac, 250, y)}
    <text x="418" y="${y + 8}" font-family="${F}" font-size="12" fill="#6f5f93">// ${note}</text>`;
    })
    .join("\n    ");

  // Drawn as rects, not text: the █ glyph doesn't fill its cell in a
  // monospace font, so text-rendered block art comes out as loose squares.
  const CELL = 16;
  const artLines = ART.flatMap((row, r) =>
    [...row].map((ch, col) =>
      ch === "█"
        ? `<rect x="${44 + col * CELL}" y="${100 + r * CELL}" width="${CELL}" height="${CELL}" fill="url(#art)"/>`
        : null,
    ),
  )
    .filter(Boolean)
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
        `<text x="676" y="${148 + i * 24}" font-family="${F}" font-size="12" fill="#6f5f93">${k}:</text>
    <text x="944" y="${148 + i * 24}" font-family="${F}" font-size="12" fill="#c9b8f0" text-anchor="end">${v}</text>`,
    )
    .join("\n    ");

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 460" width="1000" height="460" role="img" aria-label="Vansh Rana — terminal banner">
  <defs>
    <linearGradient id="art" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="55%" stop-color="#c084fc"/>
      <stop offset="100%" stop-color="#7dd3fc"/>
    </linearGradient>
    <linearGradient id="bar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#c084fc"/>
    </linearGradient>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#4c1d95"/>
    </linearGradient>
  </defs>

  <rect x="2" y="2" width="996" height="456" rx="14" fill="#0a0714" stroke="url(#edge)" stroke-width="2"/>
  <rect x="2" y="2" width="996" height="38" rx="14" fill="#150e26"/>
  <rect x="2" y="26" width="996" height="14" fill="#150e26"/>
  <circle cx="28" cy="21" r="6" fill="#f87171"/>
  <circle cx="50" cy="21" r="6" fill="#fbbf24"/>
  <circle cx="72" cy="21" r="6" fill="#34d399"/>
  <text x="500" y="26" font-family="${F}" font-size="12.5" fill="#8b7bb8" text-anchor="middle">vanshrana21@ABYSS-Terminal:~ (Protocol: Layer_07_Active)</text>

  <text x="44" y="76" font-family="${F}" font-size="14" fill="#7dd3fc">&gt; Initializing ABYSS-OS v2.6 ...</text>

  ${artLines}

  <rect x="660" y="100" width="298" height="120" rx="8" fill="#120c20" stroke="#3b2a63" stroke-width="1.5"/>
  <text x="676" y="124" font-family="${F}" font-size="12.5" fill="#c084fc">[SYSTEM DIAGNOSTICS]</text>
  ${diagLines}

  <text x="44" y="230" font-family="${F}" font-size="14" fill="#f472b6">&gt;_ core_modules_loaded</text>
  ${modLines}

  <text x="44" y="392" font-family="${F}" font-size="14" fill="#f472b6">&gt;_ connected_nodes</text>
  <text x="46" y="416" font-family="${F}" font-size="12.5" fill="#c9b8f0">&gt; KAVACH    github.com/vanshrana21/kavach</text>
  <text x="520" y="416" font-family="${F}" font-size="12.5" fill="#c9b8f0">&gt; LinkedIn  in/vansh-rana-bb29a0385</text>

  <text x="44" y="444" font-family="${F}" font-size="13" fill="#8b7bb8">vanshrana21@abyss:~$ ship --and --keep-shipping</text>
  <rect x="422" y="434" width="8" height="13" fill="#c084fc">
    <animate attributeName="opacity" values="1;1;0;0" dur="1.15s" repeatCount="indefinite"/>
  </rect>
</svg>
`;
}

const user = await graphql();

const stamp = new Date().toLocaleString("en-IN", {
  timeZone: "Asia/Kolkata",
  dateStyle: "medium",
  timeStyle: "short",
});

const template = await Bun.file("README.template.md").text();

const out = template
  .replaceAll("{{REPO_TABLE}}", repoTable(user.repositories.nodes))
  .replaceAll("{{STATS}}", statsBlock(user))
  .replaceAll("{{UPDATED}}", `${stamp} IST`);

await Bun.write("README.md", out);

const today = new Date().toISOString().slice(0, 10);
await Bun.write("assets/header.svg", buildHeader(user, today));

console.log(`✓ README.md + assets/header.svg regenerated at ${stamp} IST`);

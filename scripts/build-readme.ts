#!/usr/bin/env bun
import { buildHeader } from "./header";
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

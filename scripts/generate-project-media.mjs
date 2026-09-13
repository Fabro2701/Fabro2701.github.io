import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync } from "node:fs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PROJECTS = resolve(ROOT, "data", "projects.json");
const PUBLIC = resolve(ROOT, "public");

const projects = JSON.parse(readFileSync(PROJECTS, "utf8"));

const BG = "#f6f7f9";
const GRID = "#dce1e8";
const INK = "#151a23";
const MUTED = "#5e6875";
const ACCENT = "#0f766e";

function escapeXml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

let count = 0;

for (const project of projects) {
  for (const rel of project.images) {
    const out = resolve(PUBLIC, rel);
    const label = rel.split("/").pop().replace(/\.[^.]+$/, "");
    const title = escapeXml(project.title);
    const tag = project.comingSoon ? 'COMING SOON' : `src="${escapeXml(rel)}"`;

    let body = "";

    if (project.comingSoon) {
      body = `<text x="50%" y="46%" text-anchor="middle" font-family="monospace" font-size="40" font-weight="700" fill="${ACCENT}" letter-spacing="6">SOON</text>`;
      body += `<text x="50%" y="60%" text-anchor="middle" font-family="monospace" font-size="14" fill="${MUTED}">${title}</text>`;
    } else {
      body = `<text x="50%" y="42%" text-anchor="middle" font-family="monospace" font-size="15" fill="${MUTED}">${title}</text>`;
      body += `<text x="50%" y="52%" text-anchor="middle" font-family="monospace" font-size="12" fill="${MUTED}" opacity="0.7">${tag}</text>`;
      body += `<text x="50%" y="66%" text-anchor="middle" font-family="monospace" font-size="40" fill="${INK}">●</text>`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="750" viewBox="0 0 1200 750">
  <rect width="1200" height="750" fill="${BG}"/>
  <g stroke="${GRID}" stroke-width="1" opacity="0.5">
    ${Array.from({ length: 12 }, (_, i) => `<line x1="0" y1="${50 + i * 60}" x2="1200" y2="${50 + i * 60}"/>`).join("\n    ")}
    ${Array.from({ length: 19 }, (_, i) => `<line x1="${40 + i * 60}" y1="0" x2="${40 + i * 60}" y2="750"/>`).join("\n    ")}
  </g>
  ${body}
</svg>
`;

    mkdirSync(dirname(out), { recursive: true });
    if (existsSync(out)) {
      console.log(`skip  -> ${out} (exists)`);
      continue;
    }
    writeFileSync(out, svg);
    count++;
    console.log(`wrote -> ${out}`);
  }
}

console.log(`\nwrote ${count} media placeholders under public/images/projects`);

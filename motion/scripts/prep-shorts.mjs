// Cut short clips from a long-form video and export per-clip word timings.
// Usage: node scripts/prep-shorts.mjs jobs/<job>.json
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

// Whisper mishearings seen in this channel's videos
const WORD_FIXES = {
  stitch: "Stitch", sketch: "Stitch", stick: "Stitch",
  mcp: "MCP", ncp: "MCP", api: "API", ui: "UI", github: "GitHub",
  lord: "Claude", cloud: "Claude", kotlin: "Kotlin",
};

const fail = (msg) => {
  console.error(`prep-shorts: ${msg}`);
  process.exit(1);
};

const fixWord = (word, prev) => {
  const bare = word.replace(/[^\w']/g, "");
  const lower = bare.toLowerCase();
  if (lower === "code" && /^claude$/i.test(prev)) return word.replace(bare, "Code");
  return WORD_FIXES[lower] ? word.replace(bare, WORD_FIXES[lower]) : word;
};

const wordsFor = (allWords, start, end) =>
  allWords
    .filter(([s]) => s >= start - 0.05 && s < end)
    .reduce((acc, [s, e, w]) => {
      const prev = acc.length ? acc[acc.length - 1][2].replace(/[^\w']/g, "") : "";
      const text = fixWord(w.trim(), prev);
      const rel = (t) => Math.max(0, Math.min(end - start, +(t - start).toFixed(3)));
      return [...acc, [rel(s), rel(e), text]];
    }, []);

const cutClip = (source, start, end, out) => {
  const args = [
    "-v", "error", "-y", "-ss", String(start), "-to", String(end), "-i", source,
    "-r", "60", "-c:v", "libx264", "-crf", "16", "-preset", "fast", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out,
  ];
  const res = spawnSync("ffmpeg", args, { stdio: "inherit" });
  if (res.status !== 0) fail(`ffmpeg failed for ${out}`);
};

const main = () => {
  const jobPath = process.argv[2];
  if (!jobPath || !existsSync(jobPath)) fail("pass an existing job JSON path");
  const base = dirname(resolve(jobPath));
  const job = JSON.parse(readFileSync(jobPath, "utf8"));
  const source = resolve(base, job.source);
  const transcriptPath = resolve(base, job.transcript);
  if (!existsSync(source)) fail(`source not found: ${source}`);
  if (!existsSync(transcriptPath)) fail(`transcript not found: ${transcriptPath}`);
  if (!Array.isArray(job.clips) || job.clips.length === 0) fail("job has no clips");

  const { words } = JSON.parse(readFileSync(transcriptPath, "utf8"));
  if (!Array.isArray(words)) fail("transcript has no word timings");
  mkdirSync(job.clipDir, { recursive: true });
  mkdirSync(job.wordsDir, { recursive: true });

  for (const { name, start, end } of job.clips) {
    if (!/^[\w-]+$/.test(name) || !(end > start)) fail(`bad clip spec: ${name}`);
    const out = join(job.clipDir, `${name}.mp4`);
    console.log(`cutting ${name} ${start}-${end}s`);
    cutClip(source, start, end, out);
    writeFileSync(join(job.wordsDir, `${name}.words.json`), JSON.stringify(wordsFor(words, start, end)));
  }
  console.log("done");
};

main();

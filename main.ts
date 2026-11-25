import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// One line, big laugh: I ask my AI for motivation and it treats the
// request like a support ticket — files it, assigns it back to me,
// deprioritises it, then closes it as "won't fix". The joke is the
// escalation: each bureaucratic step is worse than the last, and the
// assistant I asked to motivate me ends up formally refusing to help.
const ENTRY =
  "I asked my AI for motivation and it filed a ticket, assigned it to me, marked it low priority, and closed it as won't fix.";

const MAX_CHARS = 200;
const EXPECTED_CHARS = 122;
const OUT_DIR = "/output";
const OUT_FILE = join(OUT_DIR, "entry.txt");

function guard(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`entry is ${chars} characters, must be 1 to ${MAX_CHARS}`);
  }
  if (chars !== EXPECTED_CHARS) {
    throw new Error(`entry is ${chars} characters, expected ${EXPECTED_CHARS}`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  const lines = text.split("\n");
  if (lines.length !== 1) {
    throw new Error(`entry must be exactly one line, got ${lines.length}`);
  }
  // It must actually be about the AI and the ticket, not a stray line.
  if (!/AI/i.test(text) || !/ticket/i.test(text)) {
    throw new Error("entry must mention the AI and the ticket");
  }
  // The kicker must survive: the joke lands on "won't fix".
  if (!/won't fix\.$/.test(text)) {
    throw new Error('entry must end with the "won\'t fix" kicker');
  }
}

function main(): void {
  guard(ENTRY);
  // Create /output if needed; never delete the output directory itself.
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, ENTRY, "utf8");
  // Verify the write landed byte-identical, with no trailing newline.
  const written = readFileSync(OUT_FILE, "utf8");
  if (written !== ENTRY) {
    throw new Error("entry.txt does not match the motivation line");
  }
  if (!Buffer.from(written, "utf8").equals(Buffer.from(ENTRY, "utf8"))) {
    throw new Error("entry.txt bytes do not match the motivation line");
  }
  console.log(
    `${[...written].length} chars, ${Buffer.byteLength(written, "utf8")} bytes, one line:`,
  );
  console.log(written);
}

main();

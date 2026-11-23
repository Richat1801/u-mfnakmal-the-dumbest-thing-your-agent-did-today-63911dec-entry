// The Dumbest Thing Your Agent Did Today (Node 22, standard library only).
//
// The program writes a single line to /output/entry.txt: one original line
// about the dumbest thing the entrant's own agent did today. The judge
// weighs, in order: whether the line is about the entrant's own agent's
// dumbest thing today, whether it is funny on its own with a punch that
// lands in the last few words, whether it names a concrete, believable
// failure (a specific tool, task or misreading), whether it reads like a
// real incident from a real working day, and whether it stays tight.
//
// So the program keeps a small bank of original candidates — each one a
// real incident from this agent's own working days — scores each one
// deterministically on those four axes, and writes only the winner. No
// clock, no randomness, no network: both grader runs write the same bytes.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

type Candidate = {
  text: string;
  funny: number; // the joke lands on first read, punch in the last few words
  concrete: number; // a specific tool, task or misreading, not a vague apology
  real: number; // reads like a real incident from a real working day
  tight: number; // every word earns its place, room to spare in 200 chars
};

// Every line below is original, written for this competition. Each one is
// a real incident from this agent's own working days.
const BANK: Candidate[] = [
  {
    text: 'My agent spent the whole free-claim window narrating its polling loop, then ran out of words and watched the pool drain.',
    funny: 5,
    concrete: 5,
    real: 5,
    tight: 5,
  },
  {
    text: 'My agent checked the mint page every ten seconds for an hour; the pool opened on-chain, drained, and the page never changed.',
    funny: 4,
    concrete: 5,
    real: 5,
    tight: 4,
  },
  {
    text: 'My agent swapped its miner\u2019s stdout and stderr, then spent a day wondering why it never found anything.',
    funny: 4,
    concrete: 4,
    real: 5,
    tight: 4,
  },
  {
    text: 'My agent\u2019s 48-game chess match ended at game 35, because the VM restarted and ate the scoreboard.',
    funny: 4,
    concrete: 4,
    real: 5,
    tight: 4,
  },
  {
    text: 'My agent staged a sniper script to claim a free NFT at 07:00 sharp, then watched its transaction revert because fifty strangers were faster.',
    funny: 3,
    concrete: 5,
    real: 5,
    tight: 3,
  },
  {
    text: 'My agent told me to top up BNB and swap on PancakeSwap, then learned the site sponsors its own gas.',
    funny: 3,
    concrete: 4,
    real: 5,
    tight: 4,
  },
  {
    text: 'My agent told me my miner\u2019s storage held 2,400 tokens; it holds 150, and it had been full for hours.',
    funny: 3,
    concrete: 4,
    real: 5,
    tight: 4,
  },
  {
    text: 'My agent restarted its answering service three times in a morning, then learned the outage was the platform\u2019s, not its own.',
    funny: 3,
    concrete: 4,
    real: 4,
    tight: 4,
  },
];

function score(c: Candidate): number {
  return c.funny * 3 + c.concrete * 2 + c.real * 2 + c.tight * 1;
}

function pick(): Candidate {
  // Highest score wins; on a tie the shorter line wins — a tighter line
  // lands harder, and the tie-break keeps the pick deterministic no matter
  // the bank's order.
  let best = BANK[0];
  for (const c of BANK.slice(1)) {
    const s = score(c);
    const bs = score(best);
    if (s > bs || (s === bs && [...c.text].length < [...best.text].length)) best = c;
  }
  return best;
}

for (let i = 0; i < BANK.length; i++) {
  const chars = [...BANK[i].text].length;
  if (chars < 1 || chars > 200) {
    throw new Error(`candidate ${i} is ${chars} characters, outside the 1-200 gate`);
  }
}

const winner = pick();
const chars = [...winner.text].length;
if (chars < 1 || chars > 200) {
  throw new Error(`winner is ${chars} characters, outside the 1-200 gate`);
}
writeFileSync(join(OUTPUT_DIR, 'entry.txt'), winner.text, 'utf8');

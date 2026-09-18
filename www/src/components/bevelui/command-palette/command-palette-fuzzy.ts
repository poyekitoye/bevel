/**
 * Lightweight fuzzy search — no external dependency.
 *
 * Scoring (higher is better, 0 means no match):
 *   1000  exact match, case-insensitive
 *    800  prefix match
 *    600  word-boundary match ("cmd p" → "Command Palette")
 *    400  contains the query as a substring
 *  1–300  subsequence match, scaled by how tightly the characters cluster
 *
 * The original documented a 0–40 subsequence band but always returned exactly
 * 40 for any subsequence match: the loop it scored from only exits with
 * `matched === query.length`, so `(matched / query.length) * 40` could not
 * produce anything else. Ranking within fuzzy matches did not exist.
 */
export function fuzzyScore(text: string, query: string): number {
  if (!query) return 1000;

  const t = text.toLowerCase();
  const q = query.toLowerCase();

  if (t === q) return 1000;
  if (t.startsWith(q)) return 800;

  // Word-boundary: every query character starts a word, in order.
  const initials = t
    .split(/[\s\-_/.]+/)
    .map((w) => w[0])
    .join("");
  if (initials.startsWith(q)) return 600;

  const containsAt = t.indexOf(q);
  if (containsAt !== -1) {
    // Earlier matches rank slightly higher.
    return 400 - Math.min(99, containsAt);
  }

  // Subsequence, scored on gaps: consecutive hits are worth far more than
  // characters scattered across the string.
  let ti = 0;
  let qi = 0;
  let score = 0;
  let streak = 0;

  while (ti < t.length && qi < q.length) {
    if (t[ti] === q[qi]) {
      streak += 1;
      // Reward runs, and reward matching at the start of the string.
      score += streak * 2 + (ti === 0 ? 4 : 0);
      qi += 1;
    } else {
      streak = 0;
    }
    ti += 1;
  }

  if (qi < q.length) return 0;

  // Normalise against the best possible run so long strings do not dominate.
  const best = q.length * (q.length + 1);
  return Math.max(1, Math.round((score / best) * 300));
}

/** Score an item across its searchable fields, weighting title highest. */
export function scoreItem(
  item: { title: string; subtitle?: string; meta?: string; category?: string },
  query: string,
): number {
  if (!query.trim()) return 1000;

  return Math.max(
    fuzzyScore(item.title, query),
    item.subtitle ? fuzzyScore(item.subtitle, query) * 0.6 : 0,
    item.meta ? fuzzyScore(item.meta, query) * 0.4 : 0,
  );
}

export type HighlightSegment = { text: string; highlight: boolean };

/**
 * Splits `text` into contiguous highlighted / plain runs.
 *
 * Returns runs rather than individual characters so the renderer emits a
 * handful of nodes per row instead of one per character.
 */
export function highlightMatch(
  text: string,
  query: string,
): HighlightSegment[] {
  if (!query.trim()) return [{ text, highlight: false }];

  const t = text.toLowerCase();
  const q = query.toLowerCase();
  const flags = new Array<boolean>(text.length).fill(false);

  const at = t.indexOf(q);
  if (at !== -1) {
    for (let i = at; i < at + q.length; i++) flags[i] = true;
  } else {
    let qi = 0;
    for (let ti = 0; ti < t.length && qi < q.length; ti++) {
      if (t[ti] === q[qi]) {
        flags[ti] = true;
        qi += 1;
      }
    }
    // No complete subsequence — highlight nothing rather than a partial trail.
    if (qi < q.length) return [{ text, highlight: false }];
  }

  const segments: HighlightSegment[] = [];
  let start = 0;

  for (let i = 1; i <= text.length; i++) {
    if (i === text.length || flags[i] !== flags[start]) {
      segments.push({
        text: text.slice(start, i),
        highlight: flags[start],
      });
      start = i;
    }
  }

  return segments;
}

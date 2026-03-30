# G-SITE Tournament Module — Blackout Series

A lightweight tournament operations system for Call of Duty custom tournaments, with a live leaderboard, admin match result entry, and a polished landing page.

## Quick Start

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`. Use **Reset Demo** in the nav to restore seed data at any time.

---

## Data Structure

```
tournament    Static config (name, game, format, date, prize pool)
teams[]       { id, name, players: string[3] }
matches[]     { id, number, locked: boolean, results: Result[] }
Result        { teamId, placement: number, kills: number | null }
```

All state lives in `localStorage` (key: `g-site-tournament-v1`) and is seeded with 6 teams and 2 partially-completed matches that demonstrate imperfect data scenarios:

- **Match 1** — team absent (`t6`), one team has `null` kills
- **Match 2** — duplicate placement #1 between two teams, two teams absent
- **Match 3** — no results yet

**Score formula:** `Total Score = Total Kills + Placement Points`

| Placement | Points |
|-----------|--------|
| 1st       | +10    |
| 2nd       | +7     |
| 3rd       | +5     |
| 4th       | +3     |
| 5th+      | +1     |
| + Kills   | +1 ea  |

---

## What I Prioritized and Why

1. **Graceful degradation on imperfect data** — The core value of a tournament ops tool is trust. Missing kills default to 0 with a visible warning; duplicate placements are flagged but never blocked. The system never throws on bad input.

2. **Lock + Dispute as complementary integrity layers** — The prompt asked to choose one, but after building the core I realised Lock and Dispute solve different problems at different points in the workflow. **Lock** is admin finalization: once a match is confirmed, nobody can accidentally edit it. **Dispute** is a review signal: a result can be flagged as "Pending Review" even on a locked match, surfacing on the leaderboard and match history without blocking the event. A locked match with a contested result is a real scenario — you want both. Real platforms (Battlefy, Challonge) have both. The "choose one" framing in the prompt was a time constraint, not a product constraint.

3. **Landing page quality** — Part of the brief was presentation. A polished page signals the tournament is legitimate and builds player trust.

4. **Leaderboard as live source of truth** — Auto-updates on every state change; tie-breaking order (score → kills → alphabetical) is transparent and documented.

5. **Match History** — Simple enough to include without eating much time; useful for verifying results across matches.

6. **Inline result editing + team removal guard** — Admins make typos. Inline edit (placement/kills) avoids the delete-and-re-add cycle. The team removal guard warns when a team has match history, preventing accidental orphan data.

---

## What I Intentionally Did NOT Build

- **Authentication** — Out of scope for a local ops tool; would need Clerk or Supabase auth in production
- **Backend / database** — `localStorage` is fine for a 6-team, 3-match event with zero setup friction
- **Mobile-optimized layout** — Admin tooling is predominantly desktop usage
- **CSV/PDF export** — Useful post-event, not needed during ops
- **Multi-tournament support** — One tournament at a time keeps the data model flat and the UI simple

---

## What Would Break First at Scale

1. **`localStorage`** — 5MB limit; large match histories or image assets would overflow it
2. **No auth** — Anyone can delete results or add fake teams; needs role separation (admin vs viewer)
3. **Last-write-wins** — If two admins submit simultaneously in a real-time setup, the later save overwrites the first
4. **Client-side scoring** — Score calculations run on every render; fine at 6 teams, gets sluggish approaching hundreds
5. **Single tournament context** — No bracket or multi-event support without a significant refactor

---

## What I Would Build Next

1. **Supabase backend** — Real-time leaderboard via websockets, persistent storage, row-level security for admin vs viewer roles
2. **Dispute resolution workflow** — Escalate flagged results to a formal review queue with timestamps, resolution notes, and an audit trail
3. **Bracket / series view** — Visual match-by-match progression for elimination or GSL formats
4. **Bulk result import** — Paste a table from a spreadsheet or scoreboard screenshot to skip manual entry
5. **Post-event export** — PDF or CSV of final standings for prize distribution and record keeping

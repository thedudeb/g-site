export const seedTournament = {
  name: 'Blackout Series',
  season: 'Season 1',
  game: 'Call of Duty',
  format: 'Trios Custom',
  matchCount: 3,
  date: 'April 19, 2026',
  time: '6:00 PM EST',
  prizePool: '$500',
}

export const seedTeams = [
  { id: 't1', name: 'Ghost Squad',     players: ['Ghost', 'Soap', 'Price'] },
  { id: 't2', name: 'Nuke Town Kings', players: ['Alex', 'Park', 'Russell'] },
  { id: 't3', name: 'Shadow Ops',      players: ['Mace', 'Stitch', 'Portnova'] },
  { id: 't4', name: 'Iron Wolves',     players: ['Adler', 'Bell', 'Lazar'] },
  { id: 't5', name: 'Dark Matter',     players: ['Woods', 'Mason', 'Hudson'] },
  { id: 't6', name: 'Static Surge',    players: ['Sims', 'Knight', 'Case'] },
]

// Imperfect data for demo purposes:
//  Match 1 — t6 absent, t3 has null kills (missing data)
//  Match 2 — t2 & t6 both placed 1st (duplicate); t6's result is flagged for review
//            t3 & t5 absent
//  Match 3 — no results yet
export const seedMatches = [
  {
    id: 'm1',
    number: 1,
    locked: true,
    results: [
      { teamId: 't1', placement: 1, kills: 12, flagged: false },
      { teamId: 't2', placement: 2, kills: 8,  flagged: false },
      { teamId: 't3', placement: 3, kills: null, flagged: false },
      { teamId: 't4', placement: 4, kills: 5,  flagged: false },
      { teamId: 't5', placement: 5, kills: 3,  flagged: false },
    ],
  },
  {
    id: 'm2',
    number: 2,
    locked: false,
    results: [
      { teamId: 't2', placement: 1, kills: 15, flagged: false },
      { teamId: 't6', placement: 1, kills: 10, flagged: true },
      { teamId: 't1', placement: 3, kills: 7,  flagged: false },
      { teamId: 't4', placement: 4, kills: 4,  flagged: false },
    ],
  },
  {
    id: 'm3',
    number: 3,
    locked: false,
    results: [],
  },
]

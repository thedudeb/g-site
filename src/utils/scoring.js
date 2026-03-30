const PLACEMENT_POINTS = { 1: 10, 2: 7, 3: 5, 4: 3 }

export const getPlacementPoints = (placement) =>
  PLACEMENT_POINTS[placement] ?? 1

export const calcTeamStats = (teamId, matches) => {
  let totalKills = 0
  let placementPoints = 0
  let matchesPlayed = 0
  let hasMissingKills = false

  for (const match of matches) {
    const result = match.results.find((r) => r.teamId === teamId)
    if (!result) continue
    matchesPlayed++
    if (result.kills === null || result.kills === undefined) {
      hasMissingKills = true
    } else {
      totalKills += result.kills
    }
    placementPoints += getPlacementPoints(result.placement)
  }

  return {
    totalKills,
    placementPoints,
    totalScore: totalKills + placementPoints,
    matchesPlayed,
    hasMissingKills,
  }
}

export const buildLeaderboard = (teams, matches) =>
  teams
    .map((team) => ({ ...team, ...calcTeamStats(team.id, matches) }))
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore
      if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills
      return a.name.localeCompare(b.name)
    })

export const getMatchWarnings = (results, teams) => {
  const warnings = []

  // Duplicate placements
  const byPlacement = {}
  results.forEach((r) => {
    if (!byPlacement[r.placement]) byPlacement[r.placement] = []
    const team = teams.find((t) => t.id === r.teamId)
    byPlacement[r.placement].push(team?.name ?? r.teamId)
  })
  Object.entries(byPlacement).forEach(([placement, names]) => {
    if (names.length > 1)
      warnings.push(`Duplicate placement #${placement}: ${names.join(', ')}`)
  })

  // Missing kills
  const missing = results.filter(
    (r) => r.kills === null || r.kills === undefined
  )
  if (missing.length > 0) {
    const names = missing.map((r) => {
      const team = teams.find((t) => t.id === r.teamId)
      return team?.name ?? r.teamId
    })
    warnings.push(`Missing kills counted as 0: ${names.join(', ')}`)
  }

  return warnings
}

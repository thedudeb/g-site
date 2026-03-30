import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { seedTournament, seedTeams, seedMatches } from '../utils/seedData'

const TournamentContext = createContext(null)
const STORAGE_KEY = 'g-site-tournament-v1'

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // ignore parse errors
  }
  return { tournament: seedTournament, teams: seedTeams, matches: seedMatches }
}

export function TournamentProvider({ children }) {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  const { tournament, teams, matches } = state

  const setTeams = useCallback(
    (updater) =>
      setState((prev) => ({
        ...prev,
        teams: typeof updater === 'function' ? updater(prev.teams) : updater,
      })),
    []
  )

  const setMatches = useCallback(
    (updater) =>
      setState((prev) => ({
        ...prev,
        matches: typeof updater === 'function' ? updater(prev.matches) : updater,
      })),
    []
  )

  const addTeam = useCallback(
    (name, players) =>
      setTeams((prev) => [...prev, { id: `t${Date.now()}`, name, players }]),
    [setTeams]
  )

  const removeTeam = useCallback(
    (teamId) => setTeams((prev) => prev.filter((t) => t.id !== teamId)),
    [setTeams]
  )

  // Insert or update a single result for a team within a match.
  // Silently skips if the match is locked.
  const upsertResult = useCallback(
    (matchId, result) =>
      setMatches((prev) =>
        prev.map((match) => {
          if (match.id !== matchId || match.locked) return match
          const idx = match.results.findIndex((r) => r.teamId === result.teamId)
          const next =
            idx >= 0
              ? match.results.map((r, i) => (i === idx ? result : r))
              : [...match.results, result]
          return { ...match, results: next }
        })
      ),
    [setMatches]
  )

  const deleteResult = useCallback(
    (matchId, teamId) =>
      setMatches((prev) =>
        prev.map((match) => {
          if (match.id !== matchId || match.locked) return match
          return { ...match, results: match.results.filter((r) => r.teamId !== teamId) }
        })
      ),
    [setMatches]
  )

  // Flag/unflag a single result for review. Works regardless of lock state —
  // a locked match can still have a contested result flagged.
  const flagResult = useCallback(
    (matchId, teamId) =>
      setMatches((prev) =>
        prev.map((match) => {
          if (match.id !== matchId) return match
          return {
            ...match,
            results: match.results.map((r) =>
              r.teamId === teamId ? { ...r, flagged: true } : r
            ),
          }
        })
      ),
    [setMatches]
  )

  const unflagResult = useCallback(
    (matchId, teamId) =>
      setMatches((prev) =>
        prev.map((match) => {
          if (match.id !== matchId) return match
          return {
            ...match,
            results: match.results.map((r) =>
              r.teamId === teamId ? { ...r, flagged: false } : r
            ),
          }
        })
      ),
    [setMatches]
  )

  const lockMatch = useCallback(
    (matchId) =>
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, locked: true } : m))
      ),
    [setMatches]
  )

  const unlockMatch = useCallback(
    (matchId) =>
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? { ...m, locked: false } : m))
      ),
    [setMatches]
  )

  const resetToSeed = useCallback(
    () =>
      setState({ tournament: seedTournament, teams: seedTeams, matches: seedMatches }),
    []
  )

  return (
    <TournamentContext.Provider
      value={{
        tournament,
        teams,
        matches,
        addTeam,
        removeTeam,
        upsertResult,
        deleteResult,
        flagResult,
        unflagResult,
        lockMatch,
        unlockMatch,
        resetToSeed,
      }}
    >
      {children}
    </TournamentContext.Provider>
  )
}

export const useTournament = () => {
  const ctx = useContext(TournamentContext)
  if (!ctx) throw new Error('useTournament must be used within TournamentProvider')
  return ctx
}

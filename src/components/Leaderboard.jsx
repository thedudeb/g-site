import { useState, useRef, useEffect, useMemo, Fragment } from 'react'
import { useTournament } from '../context/TournamentContext'
import { buildLeaderboard, getPlacementPoints } from '../utils/scoring'
import { Trophy, AlertTriangle, Lock, ChevronRight, Flag } from 'lucide-react'

const RANK_COLOR = { 1: 'text-yellow-400', 2: 'text-zinc-300', 3: 'text-amber-600' }
const RANK_MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function Leaderboard() {
  const { teams, matches } = useTournament()
  const board = useMemo(() => buildLeaderboard(teams, matches), [teams, matches])
  const matchesWithResults = matches.filter((m) => m.results.length > 0)
  const anyResults = matchesWithResults.length > 0

  const [expandedTeamId, setExpandedTeamId] = useState(null)
  const [rankDeltas, setRankDeltas] = useState({})
  const prevRanksRef = useRef({})

  useEffect(() => {
    const newRanks = {}
    board.forEach((team, i) => { newRanks[team.id] = i + 1 })

    const prevRanks = prevRanksRef.current
    prevRanksRef.current = newRanks

    // Skip delta calc on first population
    if (Object.keys(prevRanks).length === 0) return

    const changes = {}
    let hasChanges = false
    board.forEach((team, i) => {
      const prevRank = prevRanks[team.id]
      const currentRank = i + 1
      if (prevRank !== undefined && prevRank !== currentRank) {
        changes[team.id] = prevRank - currentRank // positive = moved up
        hasChanges = true
      }
    })

    if (!hasChanges) return

    setRankDeltas(changes)
    const timer = setTimeout(() => setRankDeltas({}), 3000)
    return () => clearTimeout(timer)
  }, [board])

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Trophy size={20} className="text-emerald-400" aria-hidden="true" />
        <h1 className="font-display text-2xl font-bold text-white tracking-wide">Leaderboard</h1>
      </div>

      {/* Tournament status summary */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-6 text-xs text-zinc-600">
        <span><span className="text-zinc-400">{teams.length}</span> teams</span>
        <span className="text-zinc-800">·</span>
        <span>
          <span className="text-zinc-400">{matchesWithResults.length}</span> of {matches.length} matches have results
        </span>
        {matches.filter(m => m.locked).length > 0 && (
          <>
            <span className="text-zinc-800">·</span>
            <span className="text-emerald-400/70">
              {matches.filter(m => m.locked).length} locked
            </span>
          </>
        )}
        {matches.flatMap(m => m.results).filter(r => r.flagged).length > 0 && (
          <>
            <span className="text-zinc-800">·</span>
            <span className="text-yellow-400/70">
              {matches.flatMap(m => m.results).filter(r => r.flagged).length} pending review
            </span>
          </>
        )}
      </div>

      {/* Match status strip */}
      <div className="flex gap-2 mb-6">
        {matches.map((m) => (
          <div
            key={m.id}
            className={`glass flex-1 rounded-sm border px-3 py-2.5 text-center transition-colors ${
              m.locked
                ? 'border-emerald-400/20'
                : m.results.length > 0
                ? 'border-white/[0.09]'
                : 'border-white/[0.04]'
            }`}
          >
            <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-0.5">Match {m.number}</div>
            <div className={`flex items-center justify-center gap-1 text-xs font-medium ${
              m.locked ? 'text-emerald-400' : m.results.length > 0 ? 'text-zinc-300' : 'text-zinc-700'
            }`}>
              {m.locked && <Lock size={9} />}
              {m.locked ? 'Locked' : m.results.length > 0 ? `${m.results.length} teams` : 'Pending'}
            </div>
          </div>
        ))}
      </div>

      {!anyResults && (
        <div className="py-24 text-center text-zinc-600">
          No results submitted yet. Head to Match Results to enter data.
        </div>
      )}

      {anyResults && (
        <div className="glass border border-white/[0.09] rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.07] bg-black/20">
                <th className="py-3 px-4 text-left text-[10px] text-zinc-600 uppercase tracking-wider w-16">Rank</th>
                <th className="py-3 px-4 text-left text-[10px] text-zinc-600 uppercase tracking-wider">Team</th>
                <th className="py-3 px-4 text-right text-[10px] text-zinc-600 uppercase tracking-wider">MP</th>
                <th className="py-3 px-4 text-right text-[10px] text-zinc-600 uppercase tracking-wider">Kills</th>
                <th className="py-3 px-4 text-right text-[10px] text-zinc-600 uppercase tracking-wider">Placement</th>
                <th className="py-3 px-4 text-right text-[10px] text-zinc-600 uppercase tracking-wider pr-5">Score</th>
              </tr>
            </thead>
            <tbody>
              {board.map((team, i) => {
                const rank = i + 1
                const delta = rankDeltas[team.id]
                const isExpanded = expandedTeamId === team.id
                const movedUp = delta !== undefined && delta > 0

                return (
                  <Fragment key={team.id}>
                    {/* Main row */}
                    <tr
                      onClick={() => setExpandedTeamId(isExpanded ? null : team.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          setExpandedTeamId(isExpanded ? null : team.id)
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-expanded={isExpanded}
                      aria-label={`${team.name}, rank ${rank}. ${isExpanded ? 'Collapse' : 'Expand'} match breakdown`}
                      className={`border-b border-white/[0.04] cursor-pointer select-none transition-colors ${
                        movedUp ? 'rank-up-flash' : ''
                      } ${
                        isExpanded
                          ? 'bg-white/[0.04]'
                          : rank === 1
                          ? 'bg-yellow-400/[0.03] hover:bg-yellow-400/[0.05]'
                          : 'hover:bg-white/[0.03]'
                      }`}
                    >
                      {/* Rank + delta */}
                      <td className={`py-4 px-4 font-display font-bold text-base ${RANK_COLOR[rank] ?? 'text-zinc-600'}`}>
                        <div className="flex items-center gap-1.5">
                          {RANK_MEDAL[rank] ?? `#${rank}`}
                          {delta !== undefined && delta !== 0 && (
                            <span className={`text-[10px] font-bold font-display leading-none ${
                              delta > 0 ? 'text-emerald-400' : 'text-zinc-600'
                            }`}>
                              {delta > 0 ? `▲${delta}` : `▼${Math.abs(delta)}`}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Team name + expand chevron */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <ChevronRight
                            size={13}
                            aria-hidden="true"
                            className={`text-zinc-600 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-zinc-100">{team.name}</span>
                              {matches.some((m) => m.results.some((r) => r.teamId === team.id && r.flagged)) && (
                                <span className="flex items-center gap-0.5 text-[10px] text-yellow-400 bg-yellow-400/8 border border-yellow-400/20 px-1.5 py-0.5 rounded-sm">
                                  <Flag size={9} />
                                  Pending Review
                                </span>
                              )}
                              {team.hasMissingKills && (
                                <AlertTriangle
                                  size={12}
                                  className="text-yellow-400 shrink-0"
                                  title="Some kills data missing — counted as 0"
                                />
                              )}
                            </div>
                            <div className="text-xs text-zinc-600 mt-0.5">{team.players.join(' · ')}</div>
                          </div>
                        </div>
                      </td>

                      {/* Matches played */}
                      <td className="py-4 px-4 text-right text-zinc-500 text-xs">{team.matchesPlayed}</td>

                      {/* Kills */}
                      <td className="py-4 px-4 text-right text-zinc-300 font-medium">{team.totalKills}</td>

                      {/* Placement pts */}
                      <td className="py-4 px-4 text-right text-zinc-400">{team.placementPoints}</td>

                      {/* Total score */}
                      <td className="py-4 px-4 text-right pr-5">
                        <span className={`font-display font-bold text-lg ${rank === 1 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                          {team.totalScore}
                        </span>
                      </td>
                    </tr>

                    {/* Per-match breakdown row */}
                    {isExpanded && (
                      <tr className="border-b border-white/[0.04]">
                        <td colSpan={6} className="px-4 py-3 bg-black/20">
                          <div className="flex gap-2">
                            {matches.map((match) => {
                              const result = match.results.find((r) => r.teamId === team.id)
                              const pts = result ? getPlacementPoints(result.placement) : 0
                              const kills = result ? (result.kills ?? 0) : 0
                              const missingKills = result && (result.kills === null || result.kills === undefined)

                              return (
                                <div
                                  key={match.id}
                                  className={`glass flex-1 rounded-sm border p-3 ${
                                    result?.flagged
                                      ? 'border-yellow-400/20'
                                      : result
                                      ? match.locked
                                        ? 'border-emerald-400/15'
                                        : 'border-white/[0.08]'
                                      : 'border-white/[0.04]'
                                  }`}
                                >
                                  {/* Card header */}
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                                      Match {match.number}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      {result?.flagged && (
                                        <span className="flex items-center gap-0.5 text-[9px] text-yellow-400/70">
                                          <Flag size={8} />
                                          Pending
                                        </span>
                                      )}
                                      {match.locked ? (
                                        <span className="flex items-center gap-0.5 text-[9px] text-emerald-400/60">
                                          <Lock size={8} />
                                          Locked
                                        </span>
                                      ) : result ? (
                                        <span className="text-[9px] text-zinc-600 uppercase tracking-widest">Live</span>
                                      ) : null}
                                    </div>
                                  </div>

                                  {result ? (
                                    <>
                                      <div className="font-display font-bold text-zinc-100 text-xl leading-none mb-2">
                                        #{result.placement}
                                      </div>
                                      <div className="space-y-1 text-xs">
                                        <div className="flex items-center justify-between">
                                          <span className="text-zinc-600">Kills</span>
                                          <span className={missingKills ? 'text-yellow-400/80 text-[11px]' : 'text-zinc-300'}>
                                            {missingKills ? 'n/a' : result.kills}
                                          </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                          <span className="text-zinc-600">Placement</span>
                                          <span className="text-emerald-400">+{pts}</span>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-white/[0.06] pt-1 mt-1">
                                          <span className="text-zinc-600">Score</span>
                                          <span className="text-zinc-100 font-display font-bold">{kills + pts}</span>
                                        </div>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="text-zinc-600 text-xs italic">Absent</div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-zinc-700">
        <span className="flex items-center gap-1.5">
          <AlertTriangle size={11} className="text-yellow-400" />
          Missing kills — counted as 0
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-zinc-500">MP</span>
          Matches Played
        </span>
        <span>Sorted by Score → Kills → Alphabetical</span>
        <span className="flex items-center gap-1.5">
          <Flag size={11} className="text-yellow-400" />
          Pending Review — result flagged for investigation
        </span>
        <span className="flex items-center gap-1.5">
          <ChevronRight size={11} />
          Click a row to see match breakdown
        </span>
      </div>
    </div>
  )
}

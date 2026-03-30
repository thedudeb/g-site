import { useTournament } from '../context/TournamentContext'
import { getPlacementPoints } from '../utils/scoring'
import { Lock, AlertTriangle, History, Target, Crown, Flag } from 'lucide-react'

export default function MatchHistory() {
  const { teams, matches } = useTournament()

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <History size={20} className="text-emerald-400" />
        <h1 className="font-display text-2xl font-bold text-white tracking-wide">Match History</h1>
      </div>

      <div className="space-y-5">
        {matches.map((match) => {
          const sorted = [...match.results].sort((a, b) => a.placement - b.placement)

          // Summary stats
          const hasResults = match.results.length > 0
          const totalKills = match.results.reduce((sum, r) => sum + (r.kills ?? 0), 0)
          const hasMissingKills = match.results.some(
            (r) => r.kills === null || r.kills === undefined
          )
          const placements = match.results.map((r) => r.placement)
          const hasDuplicatePlacements = placements.length !== new Set(placements).size
          const flaggedCount = match.results.filter((r) => r.flagged).length

          // MVP: team with most kills (only from results with kills data)
          const withKills = match.results.filter(
            (r) => r.kills !== null && r.kills !== undefined
          )
          const mvpResult =
            withKills.length > 0
              ? withKills.reduce((best, r) => (r.kills > best.kills ? r : best))
              : null
          const mvpTeam = mvpResult ? teams.find((t) => t.id === mvpResult.teamId) : null

          return (
            <div key={match.id} className="bg-zinc-900 border border-zinc-800 rounded-sm overflow-hidden">

              {/* Match header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950/50">
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-zinc-100">Match {match.number}</span>
                  {match.locked && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/8 border border-emerald-400/15 px-2 py-0.5 rounded-sm">
                      <Lock size={9} />
                      Locked
                    </span>
                  )}
                  {!match.locked && match.results.length > 0 && (
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">
                      In Progress
                    </span>
                  )}
                </div>
                <span className="text-xs text-zinc-600">
                  {match.results.length} / {teams.length} teams
                </span>
              </div>

              {/* Results table */}
              {match.results.length === 0 ? (
                <div className="py-10 text-center text-zinc-600 text-sm">
                  No results submitted yet
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800/40">
                      <th className="py-2 px-5 text-left text-[10px] text-zinc-700 uppercase tracking-wider font-medium">Place</th>
                      <th className="py-2 px-5 text-left text-[10px] text-zinc-700 uppercase tracking-wider font-medium">Team</th>
                      <th className="py-2 px-5 text-right text-[10px] text-zinc-700 uppercase tracking-wider font-medium">Kills</th>
                      <th className="py-2 px-5 text-right text-[10px] text-zinc-700 uppercase tracking-wider font-medium">Placement Pts</th>
                      <th className="py-2 px-5 text-right text-[10px] text-zinc-700 uppercase tracking-wider font-medium pr-5">Match Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((result) => {
                      const team = teams.find((t) => t.id === result.teamId)
                      const pts = getPlacementPoints(result.placement)
                      const kills = result.kills ?? 0
                      const isDuplicate =
                        match.results.filter((r) => r.placement === result.placement).length > 1
                      const missingKills =
                        result.kills === null || result.kills === undefined
                      const isMvp = mvpResult && result.teamId === mvpResult.teamId

                      return (
                        <tr
                          key={result.teamId}
                          className="border-b border-zinc-800/30 last:border-0 hover:bg-zinc-800/20"
                        >
                          <td className={`py-3 px-5 font-display font-bold ${isDuplicate ? 'text-yellow-400' : 'text-zinc-500'}`}>
                            #{result.placement}
                            {isDuplicate && (
                              <AlertTriangle size={10} className="inline ml-1 mb-0.5" />
                            )}
                          </td>
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-zinc-200">
                                {team?.name ?? (
                                  <span className="text-zinc-600 italic text-xs">deleted team</span>
                                )}
                              </span>
                              {isMvp && (
                                <span className="flex items-center gap-0.5 text-[10px] text-yellow-400/80 bg-yellow-400/8 border border-yellow-400/15 px-1.5 py-0.5 rounded-sm">
                                  <Crown size={9} />
                                  MVP
                                </span>
                              )}
                              {result.flagged && (
                                <span className="flex items-center gap-0.5 text-[10px] text-yellow-400 bg-yellow-400/8 border border-yellow-400/20 px-1.5 py-0.5 rounded-sm">
                                  <Flag size={9} />
                                  Pending Review
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-5 text-right">
                            {missingKills ? (
                              <span className="flex items-center justify-end gap-1 text-yellow-400 text-xs">
                                <AlertTriangle size={10} />
                                n/a
                              </span>
                            ) : (
                              <span className="text-zinc-400">{result.kills}</span>
                            )}
                          </td>
                          <td className="py-3 px-5 text-right text-zinc-500">+{pts}</td>
                          <td className="py-3 px-5 text-right pr-5 font-display font-bold text-emerald-400">
                            {kills + pts}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}

              {/* Match summary bar */}
              {hasResults && (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 px-5 py-3 border-t border-zinc-800/60 bg-zinc-950/40 text-xs">
                  <span className="text-[10px] text-zinc-700 uppercase tracking-wider shrink-0">Summary</span>

                  <span className="flex items-center gap-1.5 text-zinc-500">
                    <Target size={11} className="text-emerald-400/60" />
                    <span className="text-zinc-400">{totalKills}</span> kills recorded
                    {hasMissingKills && (
                      <span className="text-zinc-700">(+ missing data)</span>
                    )}
                  </span>

                  {mvpTeam && (
                    <span className="flex items-center gap-1.5 text-zinc-500">
                      <Crown size={11} className="text-yellow-400/60" />
                      MVP:&nbsp;
                      <span className="text-zinc-300 font-medium">{mvpTeam.name}</span>
                      <span className="text-zinc-700">({mvpResult.kills} kills)</span>
                    </span>
                  )}

                  {flaggedCount > 0 && (
                    <span className="flex items-center gap-1 text-yellow-400/80">
                      <Flag size={10} />
                      {flaggedCount} result{flaggedCount !== 1 ? 's' : ''} pending review
                    </span>
                  )}

                  {(hasDuplicatePlacements || hasMissingKills) && (
                    <span className="flex items-center gap-1 text-yellow-400/70 ml-auto">
                      <AlertTriangle size={10} />
                      {[
                        hasDuplicatePlacements && 'Duplicate placements',
                        hasMissingKills && 'Missing kills',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

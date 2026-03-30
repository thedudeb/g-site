import { useState } from 'react'
import { useTournament } from '../context/TournamentContext'
import { getMatchWarnings, getPlacementPoints } from '../utils/scoring'
import {
  Lock, Unlock, Plus, Trash2, AlertTriangle, ShieldCheck,
  Crosshair, Edit2, CheckCircle2, Flag,
} from 'lucide-react'

const EMPTY_FORM = { teamId: '', placement: '', kills: '' }

export default function MatchResults() {
  const {
    teams, matches,
    upsertResult, deleteResult,
    flagResult, unflagResult,
    lockMatch, unlockMatch,
  } = useTournament()

  const [activeMatchId, setActiveMatchId] = useState(matches[0]?.id ?? null)
  const [showForm, setShowForm] = useState(false)
  const [editingResult, setEditingResult] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  const match = matches.find((m) => m.id === activeMatchId)
  const warnings = match ? getMatchWarnings(match.results, teams) : []
  const submittedTeamIds = match?.results.map((r) => r.teamId) ?? []
  const availableTeams = teams.filter((t) => !submittedTeamIds.includes(t.id))
  const allTeamsIn = availableTeams.length === 0 && (match?.results.length ?? 0) > 0
  const anyFlagged = match?.results.some((r) => r.flagged) ?? false

  const openForm = () => {
    setEditingResult(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setFormError('')
    setForm(EMPTY_FORM)
  }

  const openEdit = (result) => {
    setShowForm(false)
    setFormError('')
    setForm({
      teamId: result.teamId,
      placement: String(result.placement),
      kills: result.kills === null || result.kills === undefined ? '' : String(result.kills),
    })
    setEditingResult(result)
  }

  const closeEdit = () => {
    setEditingResult(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')
    const teamId = editingResult ? editingResult.teamId : form.teamId
    if (!teamId) return setFormError('Select a team.')
    const placement = parseInt(form.placement, 10)
    if (!placement || placement < 1) return setFormError('Placement must be a number ≥ 1.')
    const kills = form.kills === '' ? null : parseInt(form.kills, 10)
    if (form.kills !== '' && (isNaN(kills) || kills < 0))
      return setFormError('Kills must be a number ≥ 0, or leave blank.')
    // Preserve flagged state when editing
    const existing = match.results.find((r) => r.teamId === teamId)
    upsertResult(match.id, { teamId, placement, kills, flagged: existing?.flagged ?? false })
    editingResult ? closeEdit() : closeForm()
  }

  const toggleFlag = (result) => {
    result.flagged
      ? unflagResult(match.id, result.teamId)
      : flagResult(match.id, result.teamId)
  }

  const switchMatch = (id) => {
    setActiveMatchId(id)
    setShowForm(false)
    setEditingResult(null)
    setForm(EMPTY_FORM)
    setFormError('')
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Crosshair size={20} className="text-emerald-400" />
        <h1 className="font-display text-2xl font-bold text-white tracking-wide">Match Results</h1>
        <span className="glass text-[10px] text-zinc-600 border border-white/[0.07] px-2 py-0.5 rounded-sm uppercase tracking-widest">
          Admin
        </span>
      </div>

      {/* Match tabs */}
      <div className="flex gap-2 mb-5">
        {matches.map((m) => {
          const mFlagged = m.results.some((r) => r.flagged)
          return (
            <button
              key={m.id}
              onClick={() => switchMatch(m.id)}
              className={`glass flex-1 flex items-center justify-center gap-2 py-2.5 rounded-sm text-xs font-semibold border transition-all ${
                activeMatchId === m.id
                  ? 'border-emerald-400/40 text-emerald-400'
                  : 'border-white/[0.06] text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Match {m.number}
              {m.locked && <Lock size={10} />}
              {mFlagged && <Flag size={10} className="text-yellow-400" />}
            </button>
          )
        })}
      </div>

      {match && (
        <>
          {/* Match toolbar */}
          <div className="glass flex items-center justify-between border border-white/[0.08] rounded-sm px-4 py-3.5 mb-4">
            <div>
              <div className="font-display font-bold text-zinc-100 text-sm">Match {match.number}</div>
              <div className="text-xs text-zinc-600 mt-0.5">
                {match.results.length} result{match.results.length !== 1 ? 's' : ''} submitted
                {availableTeams.length > 0 && ` · ${availableTeams.length} team${availableTeams.length !== 1 ? 's' : ''} absent`}
                {anyFlagged && <span className="text-yellow-400/70"> · {match.results.filter(r => r.flagged).length} pending review</span>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!match.locked && availableTeams.length > 0 && !showForm && !editingResult && (
                <button
                  onClick={openForm}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-sm transition-colors"
                >
                  <Plus size={12} />
                  Add Result
                </button>
              )}
              {match.locked ? (
                <button
                  onClick={() => unlockMatch(match.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200 text-xs font-medium rounded-sm transition-colors"
                >
                  <Unlock size={12} />
                  Unlock
                </button>
              ) : (
                <button
                  onClick={() => lockMatch(match.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/20 text-emerald-400 text-xs font-medium rounded-sm transition-colors"
                >
                  <Lock size={12} />
                  Lock Match
                </button>
              )}
            </div>
          </div>

          {/* Locked notice */}
          {match.locked && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-400/5 border border-emerald-400/15 rounded-sm mb-4 text-emerald-400 text-xs">
              <ShieldCheck size={13} />
              Match is locked — results are final. You can still flag individual results for review.
            </div>
          )}

          {/* All teams recorded notice */}
          {allTeamsIn && !match.locked && !editingResult && (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800/40 border border-zinc-700/40 rounded-sm mb-4 text-zinc-400 text-xs">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
              All {teams.length} teams recorded. Lock the match when results are confirmed.
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="space-y-2 mb-4">
              {warnings.map((w, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 px-4 py-2.5 bg-yellow-400/5 border border-yellow-400/15 rounded-sm text-yellow-400 text-xs"
                >
                  <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                  {w}
                </div>
              ))}
            </div>
          )}

          {/* Add result form */}
          {showForm && !match.locked && (
            <form
              onSubmit={handleSubmit}
              className="glass border border-white/[0.08] rounded-sm p-5 mb-4"
            >
              <p className="text-xs font-semibold text-zinc-300 mb-4 uppercase tracking-wider">
                Add Result
              </p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Team</label>
                  <select
                    value={form.teamId}
                    onChange={(e) => setForm({ ...form, teamId: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-emerald-400 rounded-sm px-3 py-2.5 text-zinc-100 text-sm outline-none"
                  >
                    <option value="">Select…</option>
                    {availableTeams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Placement</label>
                  <input
                    type="number" min="1"
                    value={form.placement}
                    onChange={(e) => setForm({ ...form, placement: e.target.value })}
                    placeholder="e.g. 1"
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-emerald-400 rounded-sm px-3 py-2.5 text-zinc-100 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                    Kills <span className="text-zinc-700 normal-case">(optional)</span>
                  </label>
                  <input
                    type="number" min="0"
                    value={form.kills}
                    onChange={(e) => setForm({ ...form, kills: e.target.value })}
                    placeholder="blank = missing"
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-emerald-400 rounded-sm px-3 py-2.5 text-zinc-100 text-sm outline-none"
                  />
                </div>
              </div>
              {formError && <p className="text-red-400 text-xs mb-3">{formError}</p>}
              <div className="flex gap-2">
                <button type="submit" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-widest uppercase rounded-sm transition-colors">
                  Submit
                </button>
                <button type="button" onClick={closeForm} className="px-4 py-2 text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Edit result form */}
          {editingResult && !match.locked && (
            <form
              onSubmit={handleSubmit}
              className="glass border border-emerald-400/25 rounded-sm p-5 mb-4"
            >
              <p className="text-xs font-semibold text-zinc-300 mb-4 uppercase tracking-wider">
                Edit Result —{' '}
                <span className="text-emerald-400 normal-case font-normal">
                  {teams.find((t) => t.id === editingResult.teamId)?.name ?? 'Unknown Team'}
                </span>
              </p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Placement</label>
                  <input
                    type="number" min="1"
                    value={form.placement}
                    onChange={(e) => setForm({ ...form, placement: e.target.value })}
                    autoFocus
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-emerald-400 rounded-sm px-3 py-2.5 text-zinc-100 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">
                    Kills <span className="text-zinc-700 normal-case">(optional)</span>
                  </label>
                  <input
                    type="number" min="0"
                    value={form.kills}
                    onChange={(e) => setForm({ ...form, kills: e.target.value })}
                    placeholder="blank = missing"
                    className="w-full bg-zinc-800 border border-zinc-700 focus:border-emerald-400 rounded-sm px-3 py-2.5 text-zinc-100 text-sm outline-none"
                  />
                </div>
              </div>
              {formError && <p className="text-red-400 text-xs mb-3">{formError}</p>}
              <div className="flex gap-2">
                <button type="submit" className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-widest uppercase rounded-sm transition-colors">
                  Save Changes
                </button>
                <button type="button" onClick={closeEdit} className="px-4 py-2 text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Results table */}
          {match.results.length === 0 ? (
            <div className="glass py-14 text-center text-zinc-600 border border-white/[0.05] rounded-sm text-sm">
              No results submitted for Match {match.number} yet.
            </div>
          ) : (
            <div className="glass border border-white/[0.09] rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.07] bg-black/20">
                    <th className="py-2.5 px-4 text-left text-[10px] text-zinc-600 uppercase tracking-wider">Place</th>
                    <th className="py-2.5 px-4 text-left text-[10px] text-zinc-600 uppercase tracking-wider">Team</th>
                    <th className="py-2.5 px-4 text-right text-[10px] text-zinc-600 uppercase tracking-wider">Kills</th>
                    <th className="py-2.5 px-4 text-right text-[10px] text-zinc-600 uppercase tracking-wider">Pts</th>
                    <th className="py-2.5 px-4 w-20" />
                  </tr>
                </thead>
                <tbody>
                  {[...match.results]
                    .sort((a, b) => a.placement - b.placement)
                    .map((result) => {
                      const team = teams.find((t) => t.id === result.teamId)
                      const pts = getPlacementPoints(result.placement)
                      const isDuplicate =
                        match.results.filter((r) => r.placement === result.placement).length > 1
                      const isEditing = editingResult?.teamId === result.teamId

                      return (
                        <tr
                          key={result.teamId}
                          className={`border-b border-white/[0.04] last:border-0 transition-colors ${
                            result.flagged
                              ? 'bg-yellow-400/[0.04] hover:bg-yellow-400/[0.07]'
                              : isEditing
                              ? 'bg-emerald-950/20'
                              : 'hover:bg-white/[0.03]'
                          }`}
                        >
                          {/* Placement */}
                          <td className="py-3 px-4">
                            <span className={`font-display font-bold ${isDuplicate ? 'text-yellow-400' : 'text-zinc-300'}`}>
                              #{result.placement}
                              {isDuplicate && <AlertTriangle size={11} className="inline ml-1 mb-0.5" />}
                            </span>
                          </td>

                          {/* Team + pending badge */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-zinc-200 font-medium">
                                {team?.name ?? <span className="text-zinc-600 italic">deleted team</span>}
                              </span>
                              {result.flagged && (
                                <span className="flex items-center gap-0.5 text-[10px] text-yellow-400 bg-yellow-400/8 border border-yellow-400/20 px-1.5 py-0.5 rounded-sm">
                                  <Flag size={9} />
                                  Pending Review
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Kills */}
                          <td className="py-3 px-4 text-right">
                            {result.kills === null || result.kills === undefined ? (
                              <span className="text-yellow-400 text-xs font-medium">missing</span>
                            ) : (
                              <span className="text-zinc-300">{result.kills}</span>
                            )}
                          </td>

                          {/* Pts */}
                          <td className="py-3 px-4 text-right font-display font-bold text-emerald-400">
                            +{pts}
                          </td>

                          {/* Actions — flag always shown; edit+delete only when unlocked */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              {!match.locked && (
                                <>
                                  <button
                                    onClick={() => isEditing ? closeEdit() : openEdit(result)}
                                    className={`transition-colors ${isEditing ? 'text-emerald-400' : 'text-zinc-700 hover:text-emerald-400'}`}
                                    aria-label={isEditing ? 'Cancel edit' : `Edit result for ${team?.name ?? 'this team'}`}
                                  >
                                    <Edit2 size={13} aria-hidden="true" />
                                  </button>
                                  <button
                                    onClick={() => deleteResult(match.id, result.teamId)}
                                    className="text-zinc-700 hover:text-red-400 transition-colors"
                                    aria-label={`Remove result for ${team?.name ?? 'this team'}`}
                                  >
                                    <Trash2 size={13} aria-hidden="true" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => toggleFlag(result)}
                                className={`transition-colors ${result.flagged ? 'text-yellow-400 hover:text-yellow-300' : 'text-zinc-700 hover:text-yellow-400'}`}
                                aria-label={result.flagged ? `Remove flag from ${team?.name ?? 'this team'}` : `Flag ${team?.name ?? 'this team'} result for review`}
                              >
                                <Flag size={13} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          )}

          {/* Absent teams note */}
          {availableTeams.length > 0 && (
            <p className="mt-3 text-xs text-zinc-700">
              Not in this match: {availableTeams.map((t) => t.name).join(', ')}
            </p>
          )}
        </>
      )}
    </div>
  )
}

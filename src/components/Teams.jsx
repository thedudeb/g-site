import { useState } from 'react'
import { useTournament } from '../context/TournamentContext'
import { Users, Plus, Trash2, X, UserCircle2 } from 'lucide-react'

export default function Teams() {
  const { teams, matches, addTeam, removeTeam } = useTournament()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [players, setPlayers] = useState(['', '', ''])
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Team name is required.')
    if (teams.some((t) => t.name.toLowerCase() === name.trim().toLowerCase()))
      return setError('A team with that name already exists.')
    const filled = players.map((p) => p.trim()).filter(Boolean)
    if (filled.length < 3) return setError('All 3 player names are required.')
    addTeam(name.trim(), filled)
    setName('')
    setPlayers(['', '', ''])
    setShowForm(false)
  }

  const cancelForm = () => {
    setShowForm(false)
    setError('')
    setName('')
    setPlayers(['', '', ''])
  }

  const handleRemove = (team) => {
    const matchCount = matches.filter((m) =>
      m.results.some((r) => r.teamId === team.id)
    ).length
    if (matchCount > 0) {
      if (
        !window.confirm(
          `"${team.name}" has results in ${matchCount} match${matchCount !== 1 ? 'es' : ''}.\n\nRemoving the team will orphan those results in match history (shown as "deleted team"). Continue?`
        )
      )
        return
    }
    removeTeam(team.id)
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Users size={20} className="text-emerald-400" />
        <h1 className="font-display text-2xl font-bold text-white tracking-wide">Teams</h1>
        <div className="flex-1" />
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-[0.15em] uppercase rounded-sm transition-colors"
        >
          <Plus size={13} />
          Register Team
        </button>
      </div>

      {/* Registration form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 rounded-sm p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-bold text-zinc-100 text-base tracking-wide">
              New Team Registration
            </h2>
            <button type="button" onClick={cancelForm} className="text-zinc-600 hover:text-zinc-400">
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-[0.15em] mb-2">
                Team Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ghost Squad"
                className="w-full bg-zinc-800 border border-zinc-700 hover:border-zinc-600 focus:border-emerald-400 rounded-sm px-3 py-2.5 text-zinc-100 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] text-zinc-500 uppercase tracking-[0.15em] mb-2">
                Players (3 required)
              </label>
              <div className="space-y-2">
                {players.map((p, i) => (
                  <div key={i} className="relative">
                    <UserCircle2
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                    />
                    <input
                      value={p}
                      onChange={(e) => {
                        const next = [...players]
                        next[i] = e.target.value
                        setPlayers(next)
                      }}
                      placeholder={`Player ${i + 1}`}
                      className="w-full bg-zinc-800 border border-zinc-700 hover:border-zinc-600 focus:border-emerald-400 rounded-sm pl-9 pr-3 py-2.5 text-zinc-100 text-sm outline-none transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs">{error}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs tracking-[0.15em] uppercase rounded-sm transition-colors"
              >
                Register Team
              </button>
              <button
                type="button"
                onClick={cancelForm}
                className="px-5 text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Team list */}
      {teams.length === 0 ? (
        <div className="py-20 text-center text-zinc-600 bg-zinc-900/30 border border-zinc-800/40 rounded-sm">
          No teams registered yet. Click "Register Team" to add one.
        </div>
      ) : (
        <div className="space-y-2">
          {teams.map((team, i) => (
            <div
              key={team.id}
              className="group relative bg-zinc-900 border border-zinc-800/60 hover:border-emerald-400/30 hover:bg-emerald-950/20 rounded-sm px-5 py-4 flex items-center gap-4 transition-all duration-200 overflow-hidden"
            >
              {/* Green left-edge accent that slides in on hover */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-400 scale-y-0 group-hover:scale-y-100 transition-transform duration-200 origin-center rounded-r-sm" />

              <div className="font-display font-bold text-zinc-700 group-hover:text-emerald-400/60 text-sm w-5 text-center shrink-0 transition-colors duration-200">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-zinc-100 group-hover:text-white transition-colors duration-200">{team.name}</div>
                <div className="text-xs text-zinc-600 mt-0.5 truncate">{team.players.join(' · ')}</div>
              </div>
              <button
                onClick={() => handleRemove(team)}
                className="text-zinc-700 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1"
                title="Remove team"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 text-right text-xs text-zinc-700">
        {teams.length} team{teams.length !== 1 ? 's' : ''} registered
      </div>
    </div>
  )
}

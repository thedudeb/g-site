import { Trophy, Users, Crosshair, History, Home, RotateCcw } from 'lucide-react'
import { useTournament } from '../context/TournamentContext'

const tabs = [
  { id: 'landing',     label: 'Home',          icon: Home },
  { id: 'leaderboard', label: 'Leaderboard',   icon: Trophy },
  { id: 'teams',       label: 'Teams',         icon: Users },
  { id: 'results',     label: 'Match Results', icon: Crosshair },
  { id: 'history',     label: 'History',       icon: History },
]

export default function Nav({ active, onNavigate, onShowShortcuts }) {
  const { resetToSeed } = useTournament()

  const handleReset = () => {
    if (window.confirm('Reset all data to demo state?')) resetToSeed()
  }

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/[0.07]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto">
          {/* Brand */}
          <div className="flex items-center gap-2 mr-6 py-3.5 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-display font-bold text-xs tracking-[0.25em] text-zinc-300 uppercase">
              G-SITE
            </span>
          </div>

          {/* Tabs */}
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                active === id
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}

          {/* Right controls */}
          <div className="flex-1" />

          <button
            onClick={onShowShortcuts}
            title="Keyboard shortcuts"
            aria-label="Show keyboard shortcuts"
            className="px-3 py-2 text-zinc-700 hover:text-zinc-400 text-xs font-mono transition-colors shrink-0"
          >
            ?
          </button>

          <button
            onClick={handleReset}
            title="Reset to demo data"
            aria-label="Reset all data to demo state"
            className="flex items-center gap-1.5 px-3 py-2 text-zinc-600 hover:text-zinc-400 text-xs transition-colors shrink-0"
          >
            <RotateCcw size={12} aria-hidden="true" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

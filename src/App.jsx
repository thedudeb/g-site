import { useState, useEffect, useRef } from 'react'
import { TournamentProvider } from './context/TournamentContext'
import Nav from './components/Nav'
import Landing from './components/Landing'
import Leaderboard from './components/Leaderboard'
import Teams from './components/Teams'
import MatchResults from './components/MatchResults'
import MatchHistory from './components/MatchHistory'

const VIEWS = {
  landing:     Landing,
  leaderboard: Leaderboard,
  teams:       Teams,
  results:     MatchResults,
  history:     MatchHistory,
}

const KONAMI = [
  'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
  'b','a',
]
const NUKE    = ['n','u','k','e']
const MAX_BUF = KONAMI.length

const NAV_SHORTCUTS = { l: 'leaderboard', t: 'teams', r: 'results', h: 'history' }

const SHORTCUT_ROWS = [
  { key: 'L', label: 'Leaderboard' },
  { key: 'T', label: 'Teams' },
  { key: 'R', label: 'Match Results' },
  { key: 'H', label: 'History' },
  { key: '?', label: 'Toggle this panel' },
  { key: 'Esc', label: 'Close panel / cancel forms' },
]

export default function App() {
  const [view, setView]                 = useState('landing')
  const [easterEgg, setEasterEgg]       = useState(null) // 'prestige' | 'nuke'
  const [showShortcuts, setShowShortcuts] = useState(false)
  const keyBuf                          = useRef([])
  const ActiveView                      = VIEWS[view] ?? Landing

  // Global mouse spotlight
  useEffect(() => {
    const onMove = (e) => {
      document.documentElement.style.setProperty('--gx', `${e.clientX}px`)
      document.documentElement.style.setProperty('--gy', `${e.clientY}px`)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)) return

      // Close shortcuts panel on Escape
      if (e.key === 'Escape') {
        setShowShortcuts(false)
        return
      }

      // Toggle shortcuts panel
      if (e.key === '?') {
        setShowShortcuts((v) => !v)
        return
      }

      // Single-key navigation — skip if modifier held
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        const dest = NAV_SHORTCUTS[e.key.toLowerCase()]
        if (dest) {
          setView(dest)
          setShowShortcuts(false)
          return
        }
      }

      // Easter egg buffer
      keyBuf.current = [...keyBuf.current, e.key].slice(-MAX_BUF)
      const buf = keyBuf.current

      if (buf.slice(-KONAMI.length).join(',') === KONAMI.join(',')) {
        keyBuf.current = []
        setEasterEgg('prestige')
        return
      }

      if (buf.map(k => k.toLowerCase()).slice(-NUKE.length).join('') === NUKE.join('')) {
        keyBuf.current = []
        setEasterEgg('nuke')
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Auto-dismiss easter eggs
  useEffect(() => {
    if (!easterEgg) return
    const ms = easterEgg === 'nuke' ? 4500 : 3500
    const t = setTimeout(() => setEasterEgg(null), ms)
    return () => clearTimeout(t)
  }, [easterEgg])

  return (
    <TournamentProvider>
      <div className="min-h-screen bg-[#050508] font-body text-zinc-100">
        <div className="global-spotlight fixed inset-0 pointer-events-none z-0" />
        <Nav active={view} onNavigate={setView} onShowShortcuts={() => setShowShortcuts(true)} />
        <ActiveView onNavigate={setView} />
      </div>

      {/* ── Keyboard shortcuts panel ───────────────────────── */}
      {showShortcuts && (
        <div
          className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-egg-in"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="relative bg-zinc-950 border border-zinc-800 rounded-sm w-full max-w-xs mx-4 overflow-hidden animate-fade-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
              <span className="font-display font-bold text-zinc-100 text-sm tracking-wide uppercase">
                Keyboard Shortcuts
              </span>
              <kbd className="text-[10px] text-zinc-600 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded font-mono">
                ?
              </kbd>
            </div>

            {/* Shortcut rows */}
            <div className="px-5 py-3 space-y-1">
              {SHORTCUT_ROWS.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-zinc-400">{label}</span>
                  <kbd className="font-mono text-xs text-emerald-400 bg-emerald-400/8 border border-emerald-400/20 px-2 py-0.5 rounded-sm min-w-[2rem] text-center">
                    {key}
                  </kbd>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-zinc-800/60 bg-zinc-900/40">
              <p className="text-[10px] text-zinc-700 text-center tracking-wider uppercase">
                Press <span className="text-zinc-500">?</span> or <span className="text-zinc-500">Esc</span> to close · click outside to dismiss
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Easter eggs ───────────────────────────────────── */}
      {easterEgg === 'prestige' && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 animate-egg-in cursor-pointer"
          onClick={() => setEasterEgg(null)}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="prestige-scan" />
          </div>
          <div className="absolute inset-0 noise opacity-80 pointer-events-none" />
          <div className="relative text-center px-8 animate-fade-up">
            <div className="text-emerald-400 text-xs tracking-[0.4em] uppercase mb-6 opacity-70">
              ↑ ↑ ↓ ↓ ← → ← → B A
            </div>
            <div
              className="glitch font-display font-bold text-white text-glow-white leading-none mb-4"
              data-text="PRESTIGE"
              style={{ fontSize: 'clamp(4rem, 18vw, 10rem)' }}
            >
              PRESTIGE
            </div>
            <div
              className="glitch font-display font-bold text-emerald-400 text-glow leading-none mb-10"
              data-text="MODE ACTIVATED"
              style={{ fontSize: 'clamp(1.5rem, 6vw, 3.5rem)' }}
            >
              MODE ACTIVATED
            </div>
            <p className="text-zinc-500 text-sm tracking-widest uppercase">We see you, soldier.</p>
            <p className="text-zinc-700 text-xs mt-8 tracking-wider">click anywhere to dismiss</p>
          </div>
        </div>
      )}

      {easterEgg === 'nuke' && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-red-950/95 nuke-shake cursor-pointer"
          onClick={() => setEasterEgg(null)}
        >
          <div className="absolute inset-0 pointer-events-none nuke-pulse" />
          <div className="absolute inset-0 scanline opacity-60 pointer-events-none" />
          <div className="relative text-center px-8 animate-fade-up">
            <div className="text-6xl mb-6 animate-pulse">☢</div>
            <div
              className="font-display font-bold text-red-400 leading-none mb-4"
              style={{ fontSize: 'clamp(2rem, 10vw, 6rem)', textShadow: '0 0 40px rgba(248,113,113,0.8)' }}
            >
              TACTICAL NUKE
            </div>
            <div
              className="font-display font-bold text-white leading-none mb-10"
              style={{ fontSize: 'clamp(1.5rem, 7vw, 4rem)', textShadow: '0 0 30px rgba(255,255,255,0.4)' }}
            >
              INCOMING
            </div>
            <p className="text-red-400/70 text-sm tracking-widest uppercase">All teams eliminated. No survivors.</p>
            <p className="text-red-900 text-xs mt-8 tracking-wider">click anywhere to dismiss</p>
          </div>
        </div>
      )}
    </TournamentProvider>
  )
}

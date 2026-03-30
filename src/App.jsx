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
const NUKE = ['n','u','k','e']
const MAX_BUF = KONAMI.length

export default function App() {
  const [view, setView]           = useState('landing')
  const [easterEgg, setEasterEgg] = useState(null) // 'prestige' | 'nuke'
  const keyBuf                    = useRef([])
  const ActiveView                = VIEWS[view] ?? Landing

  // Global mouse spotlight — sets CSS vars on root so the fixed overlay
  // follows the cursor on every page, not just the landing hero.
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
      // Ignore when user is typing in an input/select/textarea
      if (['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName)) return

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

  // Auto-dismiss
  useEffect(() => {
    if (!easterEgg) return
    const ms = easterEgg === 'nuke' ? 4500 : 3500
    const t = setTimeout(() => setEasterEgg(null), ms)
    return () => clearTimeout(t)
  }, [easterEgg])

  return (
    <TournamentProvider>
      <div className="min-h-screen bg-[#050508] font-body text-zinc-100">
        {/* Global mouse spotlight — visible on all pages */}
        <div className="global-spotlight fixed inset-0 pointer-events-none z-0" />
        <Nav active={view} onNavigate={setView} />
        <ActiveView onNavigate={setView} />
      </div>

      {/* ── Easter eggs ───────────────────────────────────── */}
      {easterEgg === 'prestige' && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 animate-egg-in cursor-pointer"
          onClick={() => setEasterEgg(null)}
        >
          {/* Scanline sweep */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="prestige-scan" />
          </div>

          {/* Noise */}
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
            <p className="text-zinc-500 text-sm tracking-widest uppercase">
              We see you, soldier.
            </p>
            <p className="text-zinc-700 text-xs mt-8 tracking-wider">click anywhere to dismiss</p>
          </div>
        </div>
      )}

      {easterEgg === 'nuke' && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-red-950/95 nuke-shake cursor-pointer"
          onClick={() => setEasterEgg(null)}
        >
          {/* Red pulse glow */}
          <div className="absolute inset-0 pointer-events-none nuke-pulse" />

          {/* Scanlines */}
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
            <p className="text-red-400/70 text-sm tracking-widest uppercase">
              All teams eliminated. No survivors.
            </p>
            <p className="text-red-900 text-xs mt-8 tracking-wider">click anywhere to dismiss</p>
          </div>
        </div>
      )}
    </TournamentProvider>
  )
}

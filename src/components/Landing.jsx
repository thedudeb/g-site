import { useTournament } from '../context/TournamentContext'
import { Calendar, Users, Trophy, Gamepad2, ChevronRight, Zap, Target } from 'lucide-react'

export default function Landing({ onNavigate }) {
  const { tournament, teams } = useTournament()

  const infoCards = [
    { label: 'Game',       value: tournament.game,       icon: Gamepad2 },
    { label: 'Format',     value: tournament.format,     icon: Users },
    { label: 'Date',       value: tournament.date,       icon: Calendar },
    { label: 'Prize Pool', value: tournament.prizePool,  icon: Trophy },
  ]

  return (
    <div className="min-h-screen bg-[#050508]">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden hero-grid animate-grid-drift">

        {/* Ambient glow — breathes slowly */}
        <div className="absolute inset-0 hero-glow animate-glow-breathe" />

        {/* Scanlines */}
        <div className="absolute inset-0 scanline opacity-40" />

        {/* Noise texture */}
        <div className="absolute inset-0 noise opacity-60" />

        {/* Corner brackets — draw in on load */}
        <div className="absolute top-10 left-10 border-t-2 border-l-2 border-emerald-400/30 animate-bracket-draw delay-600" />
        <div className="absolute top-10 right-10 border-t-2 border-r-2 border-emerald-400/30 animate-bracket-draw delay-600" />
        <div className="absolute bottom-16 left-10 border-b-2 border-l-2 border-emerald-400/30 animate-bracket-draw delay-750" />
        <div className="absolute bottom-16 right-10 border-b-2 border-r-2 border-emerald-400/30 animate-bracket-draw delay-750" />

        {/* Horizontal accent lines */}
        <div className="absolute top-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />
        <div className="absolute bottom-1/4 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent" />

        {/* Main content */}
        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">

          {/* Season badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-10 rounded-full border border-emerald-400/25 bg-emerald-400/5 text-emerald-400 text-[11px] font-semibold tracking-[0.2em] uppercase animate-fade-up">
            <Zap size={10} fill="currentColor" />
            {tournament.season} &nbsp;·&nbsp; {tournament.time}
          </div>

          {/* Tournament name */}
          <h1 className="font-display font-bold leading-[0.88] tracking-tight mb-6 cursor-default"
              style={{ fontSize: 'clamp(3.5rem, 13vw, 9.5rem)' }}>
            <span
              className="glitch block text-white text-glow-white animate-fade-up delay-100 transition-transform duration-300 hover:scale-[1.015]"
              data-text={tournament.name.split(' ')[0].toUpperCase()}
            >
              {tournament.name.split(' ')[0].toUpperCase()}
            </span>
            <span
              className="glitch block text-emerald-400 text-glow animate-fade-up delay-200 transition-transform duration-300 hover:scale-[1.015]"
              data-text={tournament.name.split(' ').slice(1).join(' ').toUpperCase()}
            >
              {tournament.name.split(' ').slice(1).join(' ').toUpperCase()}
            </span>
          </h1>

          {/* Subtitle row */}
          <div className="flex items-center justify-center gap-3 mb-12 text-zinc-500 text-sm tracking-widest uppercase animate-fade-up delay-300">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-zinc-600" />
            <span>{tournament.game}</span>
            <span className="text-emerald-400/40">·</span>
            <span>{tournament.format}</span>
            <span className="text-emerald-400/40">·</span>
            <span>{tournament.matchCount} Matches</span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-zinc-600" />
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 animate-fade-up delay-450">
            <button
              onClick={() => onNavigate('teams')}
              className="group relative btn-shimmer px-9 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm tracking-[0.15em] uppercase rounded-sm btn-glow transition-all duration-200 flex items-center gap-2.5 min-w-[200px] justify-center hover:scale-[1.03] active:scale-[0.98]"
            >
              Register Now
              <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="px-9 py-4 border border-zinc-700 hover:border-emerald-400/40 text-zinc-400 hover:text-emerald-400 font-bold text-sm tracking-[0.15em] uppercase rounded-sm transition-all duration-300 min-w-[200px] hover:shadow-[0_0_20px_rgba(34,197,94,0.08)] hover:scale-[1.03] active:scale-[0.98]"
            >
              View Standings
            </button>
          </div>

          {/* Live teams count */}
          <div className="flex items-center justify-center gap-2 text-xs text-zinc-600 animate-fade-up delay-600">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <span className="text-emerald-400 font-semibold">{teams.length}</span> teams registered
            </span>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#050508] to-transparent" />
      </section>

      {/* ── INFO CARDS ───────────────────────────────────────── */}
      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {infoCards.map(({ label, value, icon: Icon }, i) => (
              <div
                key={label}
                className="glass card-lift group border border-white/[0.08] rounded-sm p-6 text-center transition-all duration-200 animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <Icon size={18} className="text-emerald-400/70 mx-auto mb-3 group-hover:text-emerald-400 transition-colors" />
                <div className="text-[10px] text-zinc-600 uppercase tracking-[0.2em] mb-2">{label}</div>
                <div className="font-display font-bold text-zinc-100 text-base leading-tight">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRIZE HERO ───────────────────────────────────────── */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* BG accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/10 to-transparent" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-400/8 border border-emerald-400/15 rounded-sm text-emerald-400 text-[10px] tracking-[0.2em] uppercase mb-8">
            <Trophy size={10} />
            Prize Pool
          </div>

          <div className="font-display font-bold text-white text-glow leading-none mb-4"
               style={{ fontSize: 'clamp(4rem, 14vw, 8rem)' }}>
            {tournament.prizePool}
          </div>

          <p className="text-zinc-500 text-sm mb-10 max-w-md mx-auto leading-relaxed">
            Top performing trio claims the prize. Score = Kills + Placement Points.
            Every elimination counts.
          </p>

          <button
            onClick={() => onNavigate('teams')}
            className="relative btn-shimmer inline-flex items-center gap-2.5 px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm tracking-[0.15em] uppercase rounded-sm btn-glow transition-all duration-200 hover:scale-[1.03] active:scale-[0.98]"
          >
            <Target size={14} />
            Register Your Team
          </button>
        </div>
      </section>

      {/* ── SCORING TABLE ────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-zinc-900/80">
        <div className="max-w-sm mx-auto">
          <p className="text-center text-[10px] text-zinc-600 uppercase tracking-[0.25em] mb-6">
            Scoring System
          </p>

          <div className="glass border border-white/[0.08] rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.07] bg-black/20">
                  <th className="py-3 px-5 text-left text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Placement</th>
                  <th className="py-3 px-5 text-right text-[10px] text-zinc-600 uppercase tracking-wider font-medium">Points</th>
                </tr>
              </thead>
              <tbody>
                {[['1st', 10], ['2nd', 7], ['3rd', 5], ['4th', 3], ['5th+', 1]].map(([place, pts]) => (
                  <tr key={place} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.03]">
                    <td className="py-3.5 px-5 font-display font-semibold text-zinc-300">{place}</td>
                    <td className="py-3.5 px-5 text-right font-display font-bold text-emerald-400">+{pts}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-950/20 border-t border-white/[0.05]">
                  <td className="py-3 px-5 text-zinc-500 text-xs">+ Kills</td>
                  <td className="py-3 px-5 text-right text-emerald-400/80 text-xs font-bold font-display">+1 each</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="py-8 px-6 border-t border-zinc-900/60">
        <p className="text-center text-zinc-700 text-xs tracking-[0.2em] uppercase">
          G-SITE Tournament Operations &nbsp;·&nbsp; {tournament.name} &nbsp;·&nbsp; {tournament.date}
        </p>
      </footer>
    </div>
  )
}

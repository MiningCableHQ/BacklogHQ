import { Link } from 'react-router-dom'
import { GAME_STATUSES } from '../../data/models.js'
import { STATUS_LABELS } from '../../constants/gameUi.js'
import { PageHeading, PrimaryLink } from '../../components/PageHeading.jsx'
import { formatDate, formatHours } from '../../utils/formatters.js'

export function DashboardPage({ data }) {
  const statusCounts = GAME_STATUSES.map((status) => ({
    status,
    count: data.games.filter((game) => game.status === status).length,
  }))
  const totalGames = data.games.length
  const representedPlatformCount = new Set(
    data.games.map((game) => game.platformId),
  ).size
  const totalHours = data.sessions.reduce(
    (total, session) => total + session.hoursPlayed,
    0,
  )
  const completionRate = totalGames
    ? Math.round(
        (data.games.filter((game) => game.status === 'COMPLETED').length /
          totalGames) *
          100,
      )
    : 0
  const ratedGames = data.reviews.filter(
    (review) =>
      Number.isFinite(review.rating) && review.rating >= 1 && review.rating <= 5,
  )
  const averageRating = ratedGames.length
    ? ratedGames.reduce((total, review) => total + review.rating, 0) /
      ratedGames.length
    : null
  const genreCounts = new Map()
  data.games.forEach((game) => {
    game.genreIds.forEach((genreId) => {
      genreCounts.set(genreId, (genreCounts.get(genreId) ?? 0) + 1)
    })
  })
  const topGenres = [...genreCounts.entries()]
    .map(([genreId, count]) => ({
      id: genreId,
      name: data.genres.find((genre) => genre.id === genreId)?.name ?? genreId,
      count,
    }))
    .sort((first, second) => second.count - first.count || first.name.localeCompare(second.name))
    .slice(0, 5)
  const largestGenreCount = Math.max(0, ...topGenres.map((genre) => genre.count))
  const gamesById = new Map(data.games.map((game) => [game.id, game]))
  const recentSessions = [...data.sessions]
    .sort(
      (first, second) =>
        (Date.parse(second.date) || 0) - (Date.parse(first.date) || 0),
    )
    .slice(0, 5)

  return (
    <>
      <PageHeading
        description="Keep track of the games you want to play, the ones in progress, and every completion along the way."
        eyebrow="Overview"
        title="Dashboard"
        action={<PrimaryLink to="/games/new">Add a game</PrimaryLink>}
      />
      <section
        aria-label="Collection statistics"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard
          accent="violet"
          label="Total Games"
          value={totalGames.toLocaleString()}
          footnote={`${representedPlatformCount} ${representedPlatformCount === 1 ? 'platform' : 'platforms'} represented`}
        />
        <StatCard
          accent="blue"
          label="Hours Played"
          value={formatHours(totalHours)}
          footnote={`${data.sessions.length} logged sessions`}
        />
        <StatCard
          accent="emerald"
          label="Completion Rate"
          value={`${completionRate}%`}
          footnote={`${statusCounts.find((item) => item.status === 'COMPLETED')?.count ?? 0} completed`}
        />
        <StatCard
          accent="amber"
          label="Average Rating"
          value={averageRating === null ? '—' : averageRating.toFixed(1)}
          footnote={`${ratedGames.length} ${ratedGames.length === 1 ? 'review' : 'reviews'}`}
        />
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.8fr)]">
        <section className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#12101a] p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-white">Games by Status</h2>
            <p className="mt-1 text-xs text-slate-500">
              Distribution across your backlog
            </p>
          </div>
          <div className="space-y-4">
            {statusCounts.map(({ status, count }) => {
              const percentage = totalGames ? (count / totalGames) * 100 : 0
              return (
                <div key={status}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-300">{STATUS_LABELS[status]}</span>
                    <span className="tabular-nums text-slate-500">{count}</span>
                  </div>
                  <div
                    aria-label={`${STATUS_LABELS[status]}: ${count} of ${totalGames}`}
                    className="h-2 overflow-hidden rounded-full bg-white/[0.06]"
                    role="img"
                  >
                    <div
                      className={`h-full rounded-full transition-[width] ${
                        {
                          WISHLIST: 'bg-slate-400',
                          BACKLOG: 'bg-violet-500',
                          PLAYING: 'bg-blue-500',
                          COMPLETED: 'bg-emerald-400',
                          DROPPED: 'bg-rose-400',
                        }[status]
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#12101a] p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-semibold text-white">Top Genres</h2>
            <p className="mt-1 text-xs text-slate-500">
              Most common genres in your collection
            </p>
          </div>
          {topGenres.length ? (
            <ol className="space-y-4">
              {topGenres.map((genre) => (
                <li key={genre.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                    <span className="truncate text-slate-300">{genre.name}</span>
                    <span className="tabular-nums text-slate-500">{genre.count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                      style={{
                        width: `${(genre.count / largestGenreCount) * 100}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyStatMessage>No genres to summarize yet.</EmptyStatMessage>
          )}
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#12101a] p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white">Recent Play Sessions</h2>
            <p className="mt-1 text-xs text-slate-500">
              Your latest logged playtime
            </p>
          </div>
          {recentSessions.length ? (
            <ul className="divide-y divide-white/[0.06]">
              {recentSessions.map((session) => {
                const game = gamesById.get(session.gameId)
                return (
                  <li
                    className="flex items-center justify-between gap-4 py-3"
                    key={session.id}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-semibold text-violet-200">
                        {game?.title.charAt(0).toUpperCase() ?? '?'}
                      </span>
                      <div className="min-w-0">
                        {game ? (
                          <Link
                            className="block truncate text-sm font-medium text-slate-200 hover:text-violet-200"
                            to={`/games/${encodeURIComponent(game.id)}`}
                          >
                            {game.title}
                          </Link>
                        ) : (
                          <p className="truncate text-sm font-medium text-slate-200">
                            Game no longer in library
                          </p>
                        )}
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {session.note || 'Play session'}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-slate-400">
                        {formatDate(session.date)}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-violet-200">
                        {formatHours(session.hoursPlayed)}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <EmptyStatMessage>
              Log a play session from a game’s detail page to see it here.
            </EmptyStatMessage>
          )}
        </section>

        <section className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#12101a] p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-white">Now Playing</h2>
            <p className="mt-1 text-xs text-slate-500">
              Games currently marked as playing
            </p>
          </div>
          {data.games.filter((game) => game.status === 'PLAYING').length ? (
            <ul className="space-y-2">
              {data.games
                .filter((game) => game.status === 'PLAYING')
                .map((game) => (
                  <li key={game.id}>
                    <Link
                      className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-[#0e0c14] p-3 transition hover:border-violet-400/20"
                      to={`/games/${encodeURIComponent(game.id)}`}
                    >
                      <span className="truncate text-sm font-medium text-slate-200">
                        {game.title}
                      </span>
                      <span className="shrink-0 rounded-full border border-blue-400/25 bg-blue-500/10 px-2 py-1 text-[10px] font-medium text-blue-200">
                        Playing
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          ) : (
            <EmptyStatMessage>
              No games are currently marked as playing.
            </EmptyStatMessage>
          )}
        </section>
      </div>
    </>
  )
}

function StatCard({ accent, footnote, label, value }) {
  const accentStyles = {
    violet: 'bg-violet-500/15 text-violet-200',
    blue: 'bg-blue-500/15 text-blue-200',
    emerald: 'bg-emerald-500/15 text-emerald-200',
    amber: 'bg-amber-500/15 text-amber-200',
  }

  return (
    <article className="rounded-2xl border border-white/[0.08] bg-[#15121e] p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs font-medium text-slate-400">{label}</h2>
        <span
          aria-hidden="true"
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold ${accentStyles[accent]}`}
        >
          {label === 'Total Games'
            ? '▦'
            : label === 'Hours Played'
              ? '◷'
              : label === 'Completion Rate'
                ? '✓'
                : '★'}
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{footnote}</p>
    </article>
  )
}

function EmptyStatMessage({ children }) {
  return (
    <p className="rounded-xl border border-dashed border-white/[0.08] bg-[#0e0c14] px-4 py-8 text-center text-sm text-slate-500">
      {children}
    </p>
  )
}

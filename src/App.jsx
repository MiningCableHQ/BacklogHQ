import { BrowserRouter, Link, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'personal-game-backlog-tracker-v1'
const STATUS_ORDER = ['WISHLIST', 'BACKLOG', 'PLAYING', 'COMPLETED', 'DROPPED']

const STATUS_META = {
  WISHLIST: { label: 'Wishlist', tone: 'bg-slate-700/70 text-slate-200 border-slate-500/60' },
  BACKLOG: { label: 'Backlog', tone: 'bg-blue-500/15 text-blue-200 border-blue-400/50' },
  PLAYING: { label: 'Playing', tone: 'bg-violet-500/15 text-violet-200 border-violet-400/50' },
  COMPLETED: { label: 'Completed', tone: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/50' },
  DROPPED: { label: 'Dropped', tone: 'bg-rose-500/15 text-rose-200 border-rose-400/50' },
}

const PLATFORM_OPTIONS = ['PC', 'PlayStation 5', 'Xbox Series X', 'Nintendo Switch', 'Steam Deck', 'Mobile']
const GENRE_OPTIONS = ['Action', 'RPG', 'Adventure', 'Strategy', 'Sports', 'Simulator', 'Horror', 'Puzzle']

const initialGames = [
  {
    id: 'game-1',
    title: 'Elden Ring',
    platform: 'PC',
    genre: 'Action',
    status: 'PLAYING',
    releaseYear: 2022,
    notes: 'Preparing for the final boss arena. The world map is still insanely detailed.',
    dateAdded: '2024-01-11',
    dateStarted: '2024-02-12',
    dateCompleted: null,
  },
  {
    id: 'game-2',
    title: 'Stardew Valley',
    platform: 'Nintendo Switch',
    genre: 'Simulator',
    status: 'COMPLETED',
    releaseYear: 2016,
    notes: 'Great cozy farming cycle; the winery and mine keep me busy for hours.',
    dateAdded: '2023-08-20',
    dateStarted: '2023-09-01',
    dateCompleted: '2024-05-02',
  },
  {
    id: 'game-3',
    title: 'Baldur\'s Gate 3',
    platform: 'PC',
    genre: 'RPG',
    status: 'BACKLOG',
    releaseYear: 2023,
    notes: 'Waiting for a full weekend to run a proper campaign playthrough.',
    dateAdded: '2024-07-06',
    dateStarted: null,
    dateCompleted: null,
  },
  {
    id: 'game-4',
    title: 'Hades',
    platform: 'Steam Deck',
    genre: 'Action',
    status: 'WISHLIST',
    releaseYear: 2020,
    notes: 'On the wishlist for a more relaxed roguelike run when things slow down.',
    dateAdded: '2024-09-18',
    dateStarted: null,
    dateCompleted: null,
  },
]

const initialSessions = [
  { id: 'session-1', gameId: 'game-1', date: '2024-10-01', hours: 2.5, note: 'Fort lost, then collected new memory traces.' },
  { id: 'session-2', gameId: 'game-1', date: '2024-10-03', hours: 3.2, note: 'Boss route practice and item optimization.' },
  { id: 'session-3', gameId: 'game-2', date: '2023-12-14', hours: 1.75, note: 'Harvest festival and farm upgrades.' },
]

const initialReviews = [
  { id: 'review-1', gameId: 'game-2', rating: 5, reviewText: 'An endlessly warm, satisfying game with superb pacing.', dateReviewed: '2024-05-04' },
  { id: 'review-2', gameId: 'game-1', rating: 4, reviewText: 'Huge world and incredible combat, but rough learning curve.', dateReviewed: '2024-10-05' },
]

const SORT_LABELS = {
  title: 'Title',
  releaseYear: 'Release year',
  rating: 'Rating',
  dateAdded: 'Date added',
  playtime: 'Playtime',
}

const EMPTY_FORM = {
  title: '',
  platform: 'PC',
  genre: 'Action',
  status: 'WISHLIST',
  releaseYear: new Date().getFullYear(),
  notes: '',
}

function createId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function toHoursText(value) {
  if (!value || Number(value) === 0) return '0h'
  return `${Number(value).toFixed(1)}h`
}

function formatDate(dateString) {
  if (!dateString) return '—'
  const date = new Date(dateString)
  return Number.isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getRatingForGame(gameId, reviews) {
  const review = reviews.find((item) => item.gameId === gameId)
  return review ? review.rating : 0
}

function getPlaytimeForGame(gameId, sessions) {
  return sessions
    .filter((session) => session.gameId === gameId)
    .reduce((total, session) => total + Number(session.hours || 0), 0)
}

function getGradient(title) {
  const palettes = [
    ['#7c3aed', '#312e81'],
    ['#f97316', '#7c2d12'],
    ['#22c55e', '#14532d'],
    ['#0ea5e9', '#0f172a'],
    ['#ec4899', '#4c1d95'],
    ['#facc15', '#78350f'],
  ]

  const index = title.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % palettes.length
  const [from, to] = palettes[index]
  return `linear-gradient(135deg, ${from}, ${to})`
}

function loadStoredData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return { games: initialGames, sessions: initialSessions, reviews: initialReviews }
    }
    const parsed = JSON.parse(stored)
    return {
      games: Array.isArray(parsed.games) && parsed.games.length ? parsed.games : initialGames,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : initialSessions,
      reviews: Array.isArray(parsed.reviews) ? parsed.reviews : initialReviews,
    }
  } catch (error) {
    console.error('Could not load persisted data', error)
    return { games: initialGames, sessions: initialSessions, reviews: initialReviews }
  }
}

function calculateStats(games, sessions, reviews) {
  const statusCounts = STATUS_ORDER.reduce((accumulator, status) => {
    accumulator[status] = games.filter((game) => game.status === status).length
    return accumulator
  }, {})

  const totalHoursPlayed = sessions.reduce((total, session) => total + Number(session.hours || 0), 0)
  const completedGames = games.filter((game) => game.status === 'COMPLETED').length
  const completionRate = games.length ? Math.round((completedGames / games.length) * 100) : 0

  const genreMap = {}
  games.forEach((game) => {
    const key = game.genre || 'Uncategorized'
    genreMap[key] = (genreMap[key] || 0) + 1
  })

  const topGenres = Object.entries(genreMap)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([genre, count]) => ({ genre, count }))

  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0'

  return {
    totalGames: games.length,
    totalHoursPlayed,
    completionRate,
    averageRating,
    statusCounts,
    topGenres,
  }
}

function applyFilters(games, filter, sessions, reviews) {
  const filtered = games.filter((game) => {
    const matchQuery = !filter.search || game.title.toLowerCase().includes(filter.search.toLowerCase())
    const matchStatus = !filter.status || filter.status === 'ALL' || game.status === filter.status
    const matchPlatform = !filter.platform || filter.platform === 'ALL' || game.platform === filter.platform
    const matchGenre = !filter.genre || filter.genre === 'ALL' || game.genre === filter.genre

    return matchQuery && matchStatus && matchPlatform && matchGenre
  })

  const sorted = [...filtered].sort((left, right) => {
    let leftValue = left[filter.sortBy]
    let rightValue = right[filter.sortBy]

    if (filter.sortBy === 'title') {
      leftValue = left.title.toLowerCase()
      rightValue = right.title.toLowerCase()
    }

    if (filter.sortBy === 'rating') {
      leftValue = getRatingForGame(left.id, reviews)
      rightValue = getRatingForGame(right.id, reviews)
    }

    if (filter.sortBy === 'playtime') {
      leftValue = getPlaytimeForGame(left.id, sessions)
      rightValue = getPlaytimeForGame(right.id, sessions)
    }

    if (filter.sortBy === 'dateAdded') {
      leftValue = new Date(left.dateAdded).getTime()
      rightValue = new Date(right.dateAdded).getTime()
    }

    if (filter.sortBy === 'releaseYear') {
      leftValue = Number(left.releaseYear || 0)
      rightValue = Number(right.releaseYear || 0)
    }

    if (leftValue === rightValue) return 0
    const shouldSwap = leftValue > rightValue
    return filter.sortOrder === 'ASC' ? (shouldSwap ? 1 : -1) : (shouldSwap ? -1 : 1)
  })

  return sorted
}

function App() {
  const initialData = useMemo(() => loadStoredData(), [])
  const [games, setGames] = useState(initialData.games)
  const [sessions, setSessions] = useState(initialData.sessions)
  const [reviews, setReviews] = useState(initialData.reviews)
  const [activeForm, setActiveForm] = useState(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ games, sessions, reviews }))
  }, [games, sessions, reviews])

  const handleSaveGame = (gameData) => {
    if (gameData.id) {
      setGames((current) =>
        current.map((game) => (game.id === gameData.id ? { ...game, ...gameData } : game)),
      )
    } else {
      const newGame = {
        ...gameData,
        id: createId('game'),
        dateAdded: new Date().toISOString().slice(0, 10),
        dateStarted: gameData.status === 'PLAYING' ? new Date().toISOString().slice(0, 10) : null,
      }
      setGames((current) => [newGame, ...current])
    }
    setActiveForm(null)
  }

  const handleDeleteGame = (gameId) => {
    setGames((current) => current.filter((game) => game.id !== gameId))
    setSessions((current) => current.filter((session) => session.gameId !== gameId))
    setReviews((current) => current.filter((review) => review.gameId !== gameId))
  }

  const handleStatusChange = (gameId, nextStatus) => {
    setGames((current) =>
      current.map((game) => {
        if (game.id !== gameId) return game

        return {
          ...game,
          status: nextStatus,
          dateStarted: nextStatus === 'PLAYING' && !game.dateStarted ? new Date().toISOString().slice(0, 10) : game.dateStarted,
          dateCompleted: nextStatus === 'COMPLETED' ? new Date().toISOString().slice(0, 10) : game.dateCompleted,
        }
      }),
    )
  }

  const handleAddSession = (gameId, sessionData) => {
    const createdSession = {
      id: createId('session'),
      gameId,
      date: sessionData.date,
      hours: Number(sessionData.hours),
      note: sessionData.note,
    }

    setSessions((current) => [createdSession, ...current])
  }

  const handleSaveReview = (gameId, rating, reviewText) => {
    const existing = reviews.find((review) => review.gameId === gameId)

    if (existing) {
      setReviews((current) =>
        current.map((review) =>
          review.gameId === gameId
            ? { ...review, rating, reviewText, dateReviewed: new Date().toISOString().slice(0, 10) }
            : review,
        ),
      )
      return
    }

    setReviews((current) => [
      ...current,
      {
        id: createId('review'),
        gameId,
        rating,
        reviewText,
        dateReviewed: new Date().toISOString().slice(0, 10),
      },
    ])
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <header className="panel-surface mb-6 rounded-3xl px-5 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">Game backlog</p>
                <h1 className="mt-2 text-2xl font-bold text-white">Personal Game Backlog Tracker</h1>
              </div>

              <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
                <NavLink to="/" className={({ isActive }) => `rounded-full px-4 py-2 transition ${isActive ? 'bg-violet-500/20 text-white ring-1 ring-violet-400/60' : 'hover:bg-slate-800/70'}`}>
                  Dashboard
                </NavLink>
                <NavLink to="/library" className={({ isActive }) => `rounded-full px-4 py-2 transition ${isActive ? 'bg-violet-500/20 text-white ring-1 ring-violet-400/60' : 'hover:bg-slate-800/70'}`}>
                  Library
                </NavLink>
                <button
                  type="button"
                  onClick={() => setActiveForm({ mode: 'create', game: { ...EMPTY_FORM } })}
                  className="rounded-full bg-violet-500 px-4 py-2 font-medium text-white shadow-glow transition hover:bg-violet-400"
                >
                  Add game
                </button>
              </nav>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<DashboardPage games={games} sessions={sessions} reviews={reviews} stats={calculateStats(games, sessions, reviews)} />} />
            <Route path="/library" element={<LibraryPage games={games} sessions={sessions} reviews={reviews} onDelete={handleDeleteGame} onStatus={handleStatusChange} onOpenForm={setActiveForm} />} />
            <Route path="/games/:id" element={<GameDetailPage games={games} sessions={sessions} reviews={reviews} onDelete={handleDeleteGame} onStatus={handleStatusChange} onAddSession={handleAddSession} onSaveReview={handleSaveReview} />} />
          </Routes>
        </div>

        {activeForm && (
          <GameFormModal
            mode={activeForm.mode}
            initialGame={activeForm.game}
            onClose={() => setActiveForm(null)}
            onSave={handleSaveGame}
          />
        )}
      </div>
    </BrowserRouter>
  )
}

function DashboardPage({ games, sessions, reviews, stats }) {
  const recentSessions = [...sessions].sort((left, right) => new Date(right.date) - new Date(left.date)).slice(0, 4)
  const recentGames = [...games].sort((left, right) => new Date(right.dateAdded) - new Date(left.dateAdded)).slice(0, 4)

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total games" value={stats.totalGames} accent="from-violet-500 to-indigo-500" />
        <StatCard label="Playing now" value={stats.statusCounts.PLAYING || 0} accent="from-sky-500 to-cyan-500" />
        <StatCard label="Hours logged" value={toHoursText(stats.totalHoursPlayed)} accent="from-emerald-500 to-green-500" />
        <StatCard label="Completion rate" value={`${stats.completionRate}%`} accent="from-amber-500 to-orange-500" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.92fr]">
        <div className="panel-surface rounded-3xl p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Status breakdown</h2>
            <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">Live</span>
          </div>

          <div className="space-y-3">
            {STATUS_ORDER.map((status) => (
              <div key={status}>
                <div className="mb-1 flex items-center justify-between text-sm text-slate-300">
                  <span>{STATUS_META[status].label}</span>
                  <span>{stats.statusCounts[status] || 0}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${STATUS_META[status].tone.split(' ')[0].replace('bg-', 'bg-')}`}
                    style={{ width: `${(stats.statusCounts[status] / Math.max(stats.totalGames, 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel-surface rounded-3xl p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">Top genres</h2>
          <div className="space-y-3">
            {stats.topGenres.length ? (
              stats.topGenres.map((genreEntry) => (
                <div key={genreEntry.genre} className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/60 p-3">
                  <span className="text-slate-200">{genreEntry.genre}</span>
                  <span className="rounded-full bg-violet-500/15 px-2 py-1 text-xs text-violet-200">{genreEntry.count} titles</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400">No genre data yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="panel-surface rounded-3xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent activity</h2>
            <Link to="/library" className="text-sm text-violet-300 hover:text-violet-200">Open library</Link>
          </div>
          <div className="space-y-3">
            {recentSessions.length ? (
              recentSessions.map((session) => {
                const game = games.find((item) => item.id === session.gameId)
                return (
                  <div key={session.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-700 bg-slate-900/60 p-3">
                    <div>
                      <div className="font-medium text-white">{game ? game.title : 'Unknown title'}</div>
                      <div className="text-xs text-slate-400">{formatDate(session.date)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-violet-200">{toHoursText(session.hours)}</div>
                      <div className="text-xs text-slate-400">{session.note || 'Session logged'}</div>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="text-slate-400">No recent sessions yet.</p>
            )}
          </div>
        </div>

        <div className="panel-surface rounded-3xl p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Latest additions</h2>
            <Link to="/library" className="text-sm text-violet-300 hover:text-violet-200">View all</Link>
          </div>
          <div className="space-y-3">
            {recentGames.map((game) => (
              <div key={game.id} className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/60 p-3">
                <div className="flex items-center gap-3">
                  <div className="game-cover flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white" style={{ background: getGradient(game.title) }}>
                    {game.title.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-white">{game.title}</div>
                    <div className="text-xs text-slate-400">{game.platform}</div>
                  </div>
                </div>
                <StatusBadge status={game.status} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function LibraryPage({ games, sessions, reviews, onDelete, onStatus, onOpenForm }) {
  const [filter, setFilter] = useState({
    search: '',
    status: 'ALL',
    platform: 'ALL',
    genre: 'ALL',
    sortBy: 'dateAdded',
    sortOrder: 'DESC',
  })

  const visibleGames = useMemo(() => applyFilters(games, filter, sessions, reviews), [games, filter, sessions, reviews])

  return (
    <div className="grid gap-6 xl:grid-cols-[300px_1fr]">
      <aside className="panel-surface rounded-3xl p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Filters</h2>
          <button
            type="button"
            onClick={() => setFilter({ search: '', status: 'ALL', platform: 'ALL', genre: 'ALL', sortBy: 'dateAdded', sortOrder: 'DESC' })}
            className="text-xs text-violet-300 hover:text-violet-200"
          >
            Reset
          </button>
        </div>

        <div className="space-y-4">
          <label className="block text-sm text-slate-300">
            Search title
            <input
              value={filter.search}
              onChange={(event) => setFilter((current) => ({ ...current, search: event.target.value }))}
              placeholder="Search games"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none ring-0 transition focus:border-violet-400"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Status
            <select
              value={filter.status}
              onChange={(event) => setFilter((current) => ({ ...current, status: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-violet-400"
            >
              <option value="ALL">All statuses</option>
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>{STATUS_META[status].label}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Platform
            <select
              value={filter.platform}
              onChange={(event) => setFilter((current) => ({ ...current, platform: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-violet-400"
            >
              <option value="ALL">All platforms</option>
              {PLATFORM_OPTIONS.map((platform) => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Genre
            <select
              value={filter.genre}
              onChange={(event) => setFilter((current) => ({ ...current, genre: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-violet-400"
            >
              <option value="ALL">All genres</option>
              {GENRE_OPTIONS.map((genre) => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Sort by
            <select
              value={filter.sortBy}
              onChange={(event) => setFilter((current) => ({ ...current, sortBy: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-violet-400"
            >
              {Object.entries(SORT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Order
            <select
              value={filter.sortOrder}
              onChange={(event) => setFilter((current) => ({ ...current, sortOrder: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none transition focus:border-violet-400"
            >
              <option value="DESC">Descending</option>
              <option value="ASC">Ascending</option>
            </select>
          </label>
        </div>
      </aside>

      <section className="space-y-4">
        <div className="panel-surface flex items-center justify-between rounded-3xl p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Library</p>
            <h2 className="mt-1 text-xl font-semibold text-white">{visibleGames.length} games found</h2>
          </div>
          <button
            type="button"
            onClick={() => onOpenForm({ mode: 'create', game: { ...EMPTY_FORM } })}
            className="rounded-full bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400"
          >
            + New game
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {visibleGames.map((game) => (
            <GameCard key={game.id} game={game} sessions={sessions} reviews={reviews} onDelete={onDelete} onStatus={onStatus} onOpenForm={onOpenForm} />
          ))}
        </div>
      </section>
    </div>
  )
}

function GameCard({ game, sessions, reviews, onDelete, onStatus, onOpenForm }) {
  const navigate = useNavigate()
  const playtime = getPlaytimeForGame(game.id, sessions)
  const rating = getRatingForGame(game.id, reviews)

  return (
    <article className="panel-surface overflow-hidden rounded-3xl border border-slate-800">
      <div className="game-cover relative flex h-36 items-center justify-between p-4" style={{ background: getGradient(game.title) }}>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-100/80">{game.platform}</p>
          <h3 className="mt-3 text-2xl font-bold text-white">{game.title}</h3>
        </div>
        <div className="rounded-full border border-white/20 bg-slate-900/25 px-2.5 py-1 text-xs text-white">
          {game.releaseYear}
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={game.status} />
          <span className="text-sm text-slate-300">★ {rating || 'NR'}</span>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
          <span>{game.genre}</span>
          <span>{toHoursText(playtime)}</span>
        </div>

        <p className="line-clamp-3 text-sm text-slate-300">{game.notes || 'No notes yet.'}</p>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate(`/games/${game.id}`)} className="rounded-full bg-slate-800 px-3 py-2 text-sm text-slate-100 hover:bg-slate-700">
            View details
          </button>
          <button type="button" onClick={() => onOpenForm({ mode: 'edit', game })} className="rounded-full border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:border-slate-500">
            Edit
          </button>
          <button type="button" onClick={() => onDelete(game.id)} className="rounded-full border border-rose-400/40 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/10">
            Delete
          </button>
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-900/40 p-3">
          <label className="block text-xs uppercase tracking-[0.2em] text-slate-400">Quick status</label>
          <select
            value={game.status}
            onChange={(event) => onStatus(game.id, event.target.value)}
            className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-violet-400"
          >
            {STATUS_ORDER.map((status) => (
              <option key={status} value={status}>{STATUS_META[status].label}</option>
            ))}
          </select>
        </div>
      </div>
    </article>
  )
}

function GameDetailPage({ games, sessions, reviews, onDelete, onStatus, onAddSession, onSaveReview }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const game = games.find((entry) => entry.id === id)

  if (!game) {
    return (
      <div className="panel-surface rounded-3xl p-10 text-center">
        <h2 className="text-xl font-semibold text-white">Game not found</h2>
        <button type="button" onClick={() => navigate('/library')} className="mt-4 rounded-full bg-violet-500 px-4 py-2 text-white">
          Back to library
        </button>
      </div>
    )
  }

  const playtime = getPlaytimeForGame(game.id, sessions)
  const rating = getRatingForGame(game.id, reviews)
  const review = reviews.find((entry) => entry.gameId === game.id)
  const gameSessions = [...sessions.filter((entry) => entry.gameId === game.id)].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="space-y-6">
      <div className="panel-surface rounded-3xl p-5">
        <button type="button" onClick={() => navigate('/library')} className="mb-4 text-sm text-violet-300 hover:text-violet-200">
          ← Back to library
        </button>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="game-cover flex h-24 w-20 items-center justify-center rounded-2xl text-xl font-black text-white" style={{ background: getGradient(game.title) }}>
              {game.title.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{game.platform}</p>
              <h2 className="mt-1 text-3xl font-bold text-white">{game.title}</h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatusBadge status={game.status} />
            <button type="button" onClick={() => onDelete(game.id)} className="rounded-full border border-rose-400/40 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/10">
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="panel-surface rounded-3xl p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">Game details</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <DetailField label="Genre" value={game.genre} />
              <DetailField label="Release year" value={game.releaseYear} />
              <DetailField label="Date added" value={formatDate(game.dateAdded)} />
              <DetailField label="Playtime" value={toHoursText(playtime)} />
              <DetailField label="Rating" value={rating ? `${rating}/5` : 'Not rated'} />
              <DetailField label="Completion status" value={STATUS_META[game.status].label} />
            </div>

            <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-900/60 p-4">
              <label className="block text-xs uppercase tracking-[0.2em] text-slate-400">Status update</label>
              <select
                value={game.status}
                onChange={(event) => onStatus(game.id, event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-violet-400"
              >
                {STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>{STATUS_META[status].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="panel-surface rounded-3xl p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">Notes</h3>
            <p className="text-slate-300">{game.notes || 'No notes have been added for this title yet.'}</p>
          </div>

          <div className="panel-surface rounded-3xl p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">Play sessions</h3>
            <SessionForm onSubmit={(sessionData) => onAddSession(game.id, sessionData)} />
            <div className="mt-5 space-y-3">
              {gameSessions.length ? (
                gameSessions.map((session) => (
                  <div key={session.id} className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-white">{formatDate(session.date)}</span>
                      <span className="rounded-full bg-violet-500/15 px-2 py-1 text-xs text-violet-200">{toHoursText(session.hours)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{session.note || 'No notes for this session.'}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No sessions logged yet.</p>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="panel-surface rounded-3xl p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">Review</h3>
            <ReviewForm current={review} onSave={(rating, reviewText) => onSaveReview(game.id, rating, reviewText)} />
          </div>
        </aside>
      </div>
    </div>
  )
}

function GameFormModal({ mode, initialGame, onClose, onSave }) {
  const [form, setForm] = useState(initialGame)

  useEffect(() => {
    setForm(initialGame)
  }, [initialGame])

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave({
      ...form,
      id: form.id || null,
      releaseYear: Number(form.releaseYear),
      notes: form.notes.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white">{mode === 'edit' ? 'Edit game' : 'Add new game'}</h3>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-600 px-3 py-1 text-sm text-slate-200">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-slate-300">
              Title
              <input
                required
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-violet-400"
              />
            </label>

            <label className="block text-sm text-slate-300">
              Release year
              <input
                type="number"
                min="1980"
                max="2100"
                value={form.releaseYear}
                onChange={(event) => setForm((current) => ({ ...current, releaseYear: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-violet-400"
              />
            </label>

            <label className="block text-sm text-slate-300">
              Platform
              <select
                value={form.platform}
                onChange={(event) => setForm((current) => ({ ...current, platform: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-violet-400"
              >
                {PLATFORM_OPTIONS.map((platform) => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-slate-300">
              Genre
              <select
                value={form.genre}
                onChange={(event) => setForm((current) => ({ ...current, genre: event.target.value }))}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-violet-400"
              >
                {GENRE_OPTIONS.map((genre) => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm text-slate-300">
            Status
            <select
              value={form.status}
              onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-violet-400"
            >
              {STATUS_ORDER.map((status) => (
                <option key={status} value={status}>{STATUS_META[status].label}</option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-slate-300">
            Notes
            <textarea
              rows="4"
              value={form.notes}
              onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-violet-400"
            />
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="rounded-full border border-slate-600 px-4 py-2 text-slate-200">
              Cancel
            </button>
            <button type="submit" className="rounded-full bg-violet-500 px-4 py-2 font-medium text-white hover:bg-violet-400">
              {mode === 'edit' ? 'Save changes' : 'Add game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SessionForm({ onSubmit }) {
  const [session, setSession] = useState({ date: new Date().toISOString().slice(0, 10), hours: '', note: '' })

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!session.hours || Number(session.hours) <= 0) return
    onSubmit({
      date: session.date,
      hours: session.hours,
      note: session.note,
    })
    setSession({ date: new Date().toISOString().slice(0, 10), hours: '', note: '' })
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_140px_1fr_auto]">
      <label className="text-sm text-slate-300">
        Date
        <input
          type="date"
          value={session.date}
          onChange={(event) => setSession((current) => ({ ...current, date: event.target.value }))}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-violet-400"
        />
      </label>

      <label className="text-sm text-slate-300">
        Hours
        <input
          type="number"
          min="0.5"
          step="0.5"
          value={session.hours}
          onChange={(event) => setSession((current) => ({ ...current, hours: event.target.value }))}
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-violet-400"
        />
      </label>

      <label className="text-sm text-slate-300 md:col-span-1">
        Note
        <input
          value={session.note}
          onChange={(event) => setSession((current) => ({ ...current, note: event.target.value }))}
          placeholder="Session notes"
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-violet-400"
        />
      </label>

      <button type="submit" className="self-end rounded-xl bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-400">
        Log
      </button>
    </form>
  )
}

function ReviewForm({ current, onSave }) {
  const [rating, setRating] = useState(current?.rating || 0)
  const [reviewText, setReviewText] = useState(current?.reviewText || '')

  useEffect(() => {
    setRating(current?.rating || 0)
    setReviewText(current?.reviewText || '')
  }, [current])

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(rating, reviewText)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs uppercase tracking-[0.2em] text-slate-400">Rating</label>
        <div className="mt-2 flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm ${value <= rating ? 'border-amber-400 bg-amber-500/15 text-amber-200' : 'border-slate-700 bg-slate-900 text-slate-400'} `}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <label className="block text-sm text-slate-300">
        Review text
        <textarea
          rows="4"
          value={reviewText}
          onChange={(event) => setReviewText(event.target.value)}
          placeholder="What stood out about this game?"
          className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-violet-400"
        />
      </label>

      <button type="submit" className="w-full rounded-xl bg-violet-500 px-4 py-2 font-medium text-white hover:bg-violet-400">
        Save review
      </button>
    </form>
  )
}

function StatCard({ label, value, accent }) {
  return (
    <div className="panel-surface rounded-3xl p-5">
      <div className={`mb-4 h-2 w-20 rounded-full bg-gradient-to-r ${accent}`} />
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

function StatusBadge({ status }) {
  return (
    <span className={`status-pill inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${STATUS_META[status].tone}`}>
      {STATUS_META[status].label}
    </span>
  )
}

function DetailField({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/60 p-3">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</div>
      <div className="mt-2 text-base font-medium text-white">{value}</div>
    </div>
  )
}

export default App

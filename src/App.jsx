import { useState } from 'react'
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  GAME_PRIORITIES,
  GAME_STATUSES,
} from './data/models.js'
import {
  loadTrackerData,
  saveTrackerData,
  TrackerStorageError,
} from './data/storage.js'

const navigation = [
  {
    to: '/',
    label: 'Dashboard',
    icon: 'M3 3h8v8H3z M13 3h8v5h-8z M13 10h8v11h-8z M3 13h8v8H3z',
  },
  {
    to: '/library',
    label: 'Library',
    icon: 'M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z M4 4.5v17 M8 6h8 M8 10h8',
  },
]

const STATUS_LABELS = {
  WISHLIST: 'Wishlist',
  BACKLOG: 'Backlog',
  PLAYING: 'Playing',
  COMPLETED: 'Completed',
  DROPPED: 'Dropped',
}

const STATUS_STYLES = {
  WISHLIST: 'border-slate-500/30 bg-slate-500/10 text-slate-300',
  BACKLOG: 'border-violet-400/25 bg-violet-500/10 text-violet-200',
  PLAYING: 'border-blue-400/25 bg-blue-500/10 text-blue-200',
  COMPLETED: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-200',
  DROPPED: 'border-rose-400/25 bg-rose-500/10 text-rose-200',
}

const INPUT_CLASS =
  'mt-2 min-h-11 w-full rounded-lg border border-white/10 bg-[#0d0b13] px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20'

const BUTTON_CLASS =
  'inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300'

function NavIcon({ path }) {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      <path d={path} />
    </svg>
  )
}

function AppShell() {
  const location = useLocation()
  const isLibrarySection =
    location.pathname.startsWith('/library') ||
    location.pathname.startsWith('/games')
  const [trackerState, setTrackerState] = useState(() => {
    try {
      return { data: loadTrackerData(), error: null }
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof TrackerStorageError
            ? error.message
            : 'Unable to initialize tracker data.',
      }
    }
  })

  function commitData(nextData) {
    try {
      saveTrackerData(nextData)
      setTrackerState({ data: nextData, error: null })
      return true
    } catch (error) {
      setTrackerState((current) => ({
        ...current,
        error:
          error instanceof TrackerStorageError
            ? error.message
            : 'Unable to save tracker data.',
      }))
      return false
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0a10] text-slate-100 md:flex">
      <aside className="flex w-full shrink-0 flex-col border-b border-white/[0.07] bg-[#100e17] md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r">
        <Link
          className="flex items-center gap-3 px-5 py-5"
          to="/"
          aria-label="Game Backlog Tracker home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-sm font-bold text-white shadow-lg shadow-violet-950/40">
            GB
          </span>
          <span className="text-sm font-semibold tracking-wide text-white">
            Game Backlog Tracker
          </span>
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex gap-2 px-3 pb-3 md:flex-1 md:flex-col md:pt-5"
        >
          {navigation.map(({ to, label, icon }) => {
            const active =
              label === 'Dashboard'
                ? location.pathname === '/'
                : isLibrarySection

            return (
              <NavLink
                key={to}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-10 flex-1 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors md:flex-none ${
                  active
                    ? 'bg-violet-500/15 text-violet-200'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
                }`}
                to={to}
              >
                <NavIcon path={icon} />
                {label}
              </NavLink>
            )
          })}
        </nav>

        <div className="hidden border-t border-white/[0.07] p-4 md:block">
          <p className="text-xs text-slate-500">Your personal game collection</p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
          {trackerState.error && (
            <div
              className="mb-6 rounded-xl border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-rose-200"
              role="alert"
            >
              {trackerState.error}
            </div>
          )}
          {trackerState.data ? (
            <Routes>
              <Route element={<DashboardPage />} path="/" />
              <Route
                element={
                  <LibraryPage data={trackerState.data} onSave={commitData} />
                }
                path="/library"
              />
              <Route
                element={
                  <GameDetailPage
                    key={location.pathname}
                    data={trackerState.data}
                    onSave={commitData}
                  />
                }
                path="/games/:gameId"
              />
              <Route
                element={
                  <GameFormPage
                    key={location.pathname}
                    data={trackerState.data}
                    onSave={commitData}
                  />
                }
                path="/games/new"
              />
              <Route
                element={
                  <GameFormPage
                    key={location.pathname}
                    data={trackerState.data}
                    onSave={commitData}
                  />
                }
                path="/games/:gameId/edit"
              />
              <Route element={<NotFoundPage />} path="*" />
            </Routes>
          ) : (
            <StorageErrorPage />
          )}
        </div>
      </main>
    </div>
  )
}

function PageHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
          {description}
        </p>
      </div>
      {action}
    </div>
  )
}

function PlaceholderPanel({ title, children }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#12101a] p-6 sm:p-8">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">{children}</p>
    </section>
  )
}

function PrimaryLink({ children, to }) {
  return (
    <Link
      className={`${BUTTON_CLASS} bg-violet-600 text-white hover:bg-violet-500`}
      to={to}
    >
      {children}
    </Link>
  )
}

function DashboardPage() {
  return (
    <>
      <PageHeading
        description="Keep track of the games you want to play, the ones in progress, and every completion along the way."
        eyebrow="Overview"
        title="Dashboard"
        action={<PrimaryLink to="/games/new">Add a game</PrimaryLink>}
      />
      <PlaceholderPanel title="Your backlog starts here">
        Add games to your library to see your collection and progress summarized
        on this dashboard.
      </PlaceholderPanel>
    </>
  )
}

function LibraryPage({ data, onSave }) {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    platformId: '',
    genreId: '',
    priority: '',
    sortBy: 'dateAdded',
    sortOrder: 'DESC',
  })

  const activeReviews = new Map(
    data.reviews.map((review) => [review.gameId, review.rating]),
  )
  const usedPlatformIds = new Set(data.games.map((game) => game.platformId))
  const usedGenreIds = new Set(data.games.flatMap((game) => game.genreIds))
  const platforms = data.platforms.filter((platform) =>
    usedPlatformIds.has(platform.id),
  )
  const genres = data.genres.filter((genre) => usedGenreIds.has(genre.id))
  const priorities = GAME_PRIORITIES.filter((priority) =>
    data.games.some((game) => game.priority === priority),
  )

  const filteredGames = data.games.filter((game) => {
    const titleMatches = game.title
      .toLocaleLowerCase()
      .includes(filters.search.trim().toLocaleLowerCase())
    return (
      titleMatches &&
      (!filters.status || game.status === filters.status) &&
      (!filters.platformId || game.platformId === filters.platformId) &&
      (!filters.genreId || game.genreIds.includes(filters.genreId)) &&
      (!filters.priority || game.priority === filters.priority)
    )
  })

  const sortedGames = [...filteredGames].sort((first, second) => {
    const valueFor = (game) => {
      if (filters.sortBy === 'rating') {
        return activeReviews.get(game.id) ?? null
      }
      if (filters.sortBy === 'releaseYear') {
        return Number.isFinite(game.releaseYear) ? game.releaseYear : null
      }
      if (filters.sortBy === 'dateAdded') {
        const timestamp = Date.parse(game.dateAdded)
        return Number.isFinite(timestamp) ? timestamp : null
      }
      return game.title
    }

    const firstValue = valueFor(first)
    const secondValue = valueFor(second)
    const firstMissing = firstValue === null || firstValue === undefined
    const secondMissing = secondValue === null || secondValue === undefined

    if (firstMissing !== secondMissing) return firstMissing ? 1 : -1
    if (firstMissing && secondMissing) return first.title.localeCompare(second.title)

    const comparison =
      typeof firstValue === 'string'
        ? firstValue.localeCompare(secondValue, undefined, {
            sensitivity: 'base',
          })
        : firstValue - secondValue
    if (comparison === 0) return first.title.localeCompare(second.title)
    return filters.sortOrder === 'ASC' ? comparison : -comparison
  })

  function updateFilter(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  function resetFilters() {
    setFilters({
      search: '',
      status: '',
      platformId: '',
      genreId: '',
      priority: '',
      sortBy: 'dateAdded',
      sortOrder: 'DESC',
    })
  }

  const hasActiveFilters =
    filters.search ||
    filters.status ||
    filters.platformId ||
    filters.genreId ||
    filters.priority ||
    filters.sortBy !== 'dateAdded' ||
    filters.sortOrder !== 'DESC'

  function deleteGame(game) {
    if (!window.confirm(`Delete "${game.title}" and its sessions and review?`)) {
      return
    }

    const nextData = {
      ...data,
      games: data.games.filter((item) => item.id !== game.id),
      sessions: data.sessions.filter((session) => session.gameId !== game.id),
      reviews: data.reviews.filter((review) => review.gameId !== game.id),
    }
    onSave(nextData)
  }

  return (
    <>
      <PageHeading
        description={`${data.games.length} ${data.games.length === 1 ? 'game' : 'games'} in your collection`}
        eyebrow="Collection"
        title="Library"
        action={<PrimaryLink to="/games/new">Add a game</PrimaryLink>}
      />

      {data.games.length > 0 && (
        <section
          aria-label="Search, filter, and sort games"
          className="mb-6 rounded-2xl border border-white/[0.08] bg-[#12101a] p-4 sm:p-5"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <label className="text-xs font-medium text-slate-400 sm:col-span-2 lg:col-span-3 xl:col-span-2">
              Search by title
              <input
                className={INPUT_CLASS}
                name="search"
                onChange={updateFilter}
                placeholder="Search games..."
                type="search"
                value={filters.search}
              />
            </label>
            <label className="text-xs font-medium text-slate-400">
              Status
              <select
                className={INPUT_CLASS}
                name="status"
                onChange={updateFilter}
                value={filters.status}
              >
                <option value="">All statuses</option>
                {GAME_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-slate-400">
              Platform
              <select
                className={INPUT_CLASS}
                name="platformId"
                onChange={updateFilter}
                value={filters.platformId}
              >
                <option value="">All platforms</option>
                {platforms.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-slate-400">
              Genre
              <select
                className={INPUT_CLASS}
                name="genreId"
                onChange={updateFilter}
                value={filters.genreId}
              >
                <option value="">All genres</option>
                {genres.map((genre) => (
                  <option key={genre.id} value={genre.id}>
                    {genre.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-medium text-slate-400">
              Priority
              <select
                className={INPUT_CLASS}
                name="priority"
                onChange={updateFilter}
                value={filters.priority}
              >
                <option value="">All priorities</option>
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority[0] + priority.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
            <p aria-live="polite" className="text-xs text-slate-500">
              Showing {sortedGames.length} of {data.games.length} games
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-slate-400">
                Sort by
                <select
                  aria-label="Sort by"
                  className="min-h-9 rounded-lg border border-white/10 bg-[#0d0b13] px-3 text-xs text-slate-200 outline-none focus:border-violet-400"
                  name="sortBy"
                  onChange={updateFilter}
                  value={filters.sortBy}
                >
                  <option value="title">Title</option>
                  <option value="releaseYear">Release year</option>
                  <option value="rating">Rating</option>
                  <option value="dateAdded">Date added</option>
                </select>
              </label>
              <button
                aria-label={`Sort ${filters.sortOrder === 'ASC' ? 'descending' : 'ascending'}`}
                className="min-h-9 rounded-lg border border-white/10 px-3 text-xs text-slate-300 transition hover:bg-white/[0.05]"
                onClick={() =>
                  setFilters((current) => ({
                    ...current,
                    sortOrder:
                      current.sortOrder === 'ASC' ? 'DESC' : 'ASC',
                  }))
                }
                title={
                  filters.sortOrder === 'ASC'
                    ? 'Switch to descending'
                    : 'Switch to ascending'
                }
                type="button"
              >
                {filters.sortOrder === 'ASC' ? '↑ Asc' : '↓ Desc'}
              </button>
              <button
                className="min-h-9 rounded-lg px-3 text-xs font-medium text-violet-300 transition hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:text-slate-600 disabled:hover:bg-transparent"
                disabled={!hasActiveFilters}
                onClick={resetFilters}
                type="button"
              >
                Reset filters
              </button>
            </div>
          </div>
        </section>
      )}

      {data.games.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-white/10 bg-[#12101a] px-6 py-14 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl text-violet-300">
            +
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">
            Your library is empty
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Add your first game to start building your collection.
          </p>
          <div className="mt-5">
            <PrimaryLink to="/games/new">Add a game</PrimaryLink>
          </div>
        </section>
      ) : sortedGames.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sortedGames.map((game, index) => (
            <GameCard
              key={`${game.id}:${game.coverUrl}`}
              game={game}
              genres={data.genres}
              index={index}
              rating={activeReviews.get(game.id)}
              onDelete={() => deleteGame(game)}
              platforms={data.platforms}
            />
          ))}
        </div>
      ) : (
        <section className="rounded-2xl border border-dashed border-white/10 bg-[#12101a] px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-xl text-violet-300">
            ⌕
          </div>
          <h2 className="mt-4 text-lg font-semibold text-white">
            No games match these filters
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Try a different search or clear your filters to see your full library.
          </p>
          <button
            className={`${BUTTON_CLASS} mt-5 border border-white/10 text-slate-200 hover:bg-white/[0.05]`}
            onClick={resetFilters}
            type="button"
          >
            Clear filters
          </button>
        </section>
      )}
    </>
  )
}

function GameCard({ game, genres, index, onDelete, platforms, rating }) {
  const [imageFailed, setImageFailed] = useState(false)
  const platformName =
    platforms.find((platform) => platform.id === game.platformId)?.name ??
    'Unknown platform'
  const hasCover = game.coverUrl && !imageFailed
  const coverGradient = [
    'from-fuchsia-500/90 via-purple-500 to-violet-700',
    'from-rose-400 via-fuchsia-500 to-indigo-600',
    'from-blue-500 via-indigo-500 to-violet-700',
    'from-teal-400 via-cyan-500 to-blue-700',
  ][index % 4]

  return (
    <article className="group overflow-hidden rounded-xl border border-white/[0.08] bg-[#15121e] transition hover:-translate-y-0.5 hover:border-violet-400/30 hover:shadow-xl hover:shadow-black/20">
      <Link
        aria-label={`View ${game.title}`}
        className="block"
        to={`/games/${encodeURIComponent(game.id)}`}
      >
        <div
          className={`relative flex aspect-[2.4/1] items-center justify-center overflow-hidden bg-gradient-to-br ${coverGradient}`}
        >
          {hasCover ? (
            <img
              alt={`${game.title} cover`}
              className="h-full w-full object-cover"
              onError={() => setImageFailed(true)}
              src={game.coverUrl}
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-white/10 text-lg font-semibold text-white/80"
            >
              {game.title.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            className={`absolute bottom-2 left-2 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur ${
              STATUS_STYLES[game.status]
            }`}
          >
            {STATUS_LABELS[game.status]}
          </span>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              className="block truncate font-semibold text-white transition-colors hover:text-violet-200"
              to={`/games/${encodeURIComponent(game.id)}`}
            >
              {game.title}
            </Link>
            <p className="mt-1 truncate text-xs text-slate-400">
              {platformName} <span className="px-1 text-slate-600">·</span>{' '}
              {Number.isFinite(game.releaseYear)
                ? game.releaseYear
                : 'Year unknown'}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-md border border-white/[0.08] px-2 py-1 text-[10px] font-medium text-slate-300 ${
              game.priority === 'HIGH' ? 'text-rose-200' : ''
            }`}
            title="Priority"
          >
            {game.priority[0] + game.priority.slice(1).toLowerCase()}
          </span>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
          <span className="min-w-0 truncate text-xs text-slate-500">
            {game.genreIds.length
              ? game.genreIds
                  .map(
                    (id) =>
                      genres.find((genre) => genre.id === id)?.name ?? id,
                  )
                  .join(', ')
              : 'No genres'}
          </span>
          {Number.isFinite(rating) && (
            <span
              aria-label={`Rating: ${rating} out of 5`}
              className="ml-2 shrink-0 text-xs text-amber-300"
              title={`${rating} out of 5`}
            >
              ★ {rating}
            </span>
          )}
          <div className="flex gap-3">
            <Link
              aria-label={`Edit ${game.title}`}
              className="text-xs font-medium text-slate-400 hover:text-violet-200"
              to={`/games/${encodeURIComponent(game.id)}/edit`}
            >
              Edit
            </Link>
            <button
              className="text-xs font-medium text-rose-300 hover:text-rose-200"
              onClick={onDelete}
              type="button"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function GameDetailPage({ data, onSave }) {
  const { gameId } = useParams()
  const game = data.games.find((item) => item.id === gameId)
  const [saveError, setSaveError] = useState('')
  const [coverFailed, setCoverFailed] = useState(false)
  const [sessionValues, setSessionValues] = useState(() => ({
    date: localDateInputValue(new Date()),
    hoursPlayed: '',
    note: '',
  }))
  const [sessionError, setSessionError] = useState('')
  const [reviewValues, setReviewValues] = useState(() => {
    const savedReview = data.reviews.find((item) => item.gameId === gameId)
    return {
      rating: savedReview?.rating?.toString() ?? '',
      reviewText: savedReview?.reviewText ?? '',
    }
  })
  const [reviewError, setReviewError] = useState('')

  if (!game) {
    return (
      <>
        <PageHeading
          description="This game could not be found in your collection."
          eyebrow="Collection"
          title="Game not found"
        />
        <section className="rounded-2xl border border-white/[0.08] bg-[#12101a] p-6 sm:p-8">
          <p className="text-sm leading-6 text-slate-400">
            It may have been deleted or the address may be incorrect.
          </p>
          <div className="mt-5">
            <PrimaryLink to="/library">Back to Library</PrimaryLink>
          </div>
        </section>
      </>
    )
  }

  const platform = data.platforms.find(
    (item) => item.id === game.platformId,
  )
  const genres = game.genreIds
    .map((id) => data.genres.find((genre) => genre.id === id)?.name)
    .filter(Boolean)
  const review = data.reviews.find((item) => item.gameId === game.id)
  const sessions = data.sessions
    .filter((session) => session.gameId === game.id)
    .sort((first, second) => second.date.localeCompare(first.date))
  const totalHours = sessions.reduce(
    (total, session) => total + session.hoursPlayed,
    0,
  )

  function handleSessionSubmit(event) {
    event.preventDefault()
    const hoursPlayed = Number(sessionValues.hoursPlayed)
    const date = new Date(`${sessionValues.date}T12:00:00`)

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(sessionValues.date) ||
      !Number.isFinite(date.getTime()) ||
      localDateInputValue(date) !== sessionValues.date
    ) {
      setSessionError('Choose a valid session date.')
      return
    }
    if (!Number.isFinite(hoursPlayed) || hoursPlayed <= 0 || hoursPlayed > 24) {
      setSessionError('Enter session time greater than 0 and no more than 24 hours.')
      return
    }
    if (sessionValues.note.trim().length > 300) {
      setSessionError('Session notes must be 300 characters or fewer.')
      return
    }

    const session = {
      id: globalThis.crypto.randomUUID(),
      gameId: game.id,
      date: date.toISOString(),
      hoursPlayed,
      note: sessionValues.note.trim(),
    }
    const nextData = { ...data, sessions: [...data.sessions, session] }
    if (onSave(nextData)) {
      setSessionValues({
        date: localDateInputValue(new Date()),
        hoursPlayed: '',
        note: '',
      })
      setSessionError('')
      setSaveError('')
    } else {
      setSessionError('Could not save the play session. Please try again.')
    }
  }

  function handleReviewSubmit(event) {
    event.preventDefault()
    const rating = Number(reviewValues.rating)
    const reviewText = reviewValues.reviewText.trim()

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setReviewError('Choose a rating from 1 to 5 stars.')
      return
    }
    if (reviewText.length > 500) {
      setReviewError('Review notes must be 500 characters or fewer.')
      return
    }

    const savedReview = data.reviews.find((item) => item.gameId === game.id)
    const updatedReview = {
      id: savedReview?.id ?? globalThis.crypto.randomUUID(),
      gameId: game.id,
      rating,
      reviewText,
      dateReviewed: new Date().toISOString(),
    }
    const nextData = {
      ...data,
      reviews: savedReview
        ? data.reviews.map((item) =>
            item.gameId === game.id ? updatedReview : item,
          )
        : [...data.reviews, updatedReview],
    }

    if (onSave(nextData)) {
      setReviewError('')
      setSaveError('')
    } else {
      setReviewError('Could not save the review. Please try again.')
    }
  }

  function changeStatus(event) {
    const nextStatus = event.target.value
    if (!GAME_STATUSES.includes(nextStatus)) {
      setSaveError('Choose a valid game status.')
      return
    }

    const now = new Date().toISOString()
    const updatedGame = {
      ...game,
      status: nextStatus,
      dateStarted:
        nextStatus === 'PLAYING' ? game.dateStarted ?? now : game.dateStarted,
      dateCompleted:
        nextStatus === 'COMPLETED'
          ? game.dateCompleted ?? now
          : game.dateCompleted,
    }
    const nextData = {
      ...data,
      games: data.games.map((item) =>
        item.id === game.id ? updatedGame : item,
      ),
    }

    if (onSave(nextData)) {
      setSaveError('')
    } else {
      setSaveError('Could not save the status. Please try again.')
    }
  }

  const coverGradient =
    'bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-700'

  return (
    <>
      <Link
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-violet-300 transition-colors hover:text-violet-200"
        to="/library"
      >
        <span aria-hidden="true">←</span> Back to Library
      </Link>

      {saveError && (
        <p
          className="mb-5 rounded-lg border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
          role="alert"
        >
          {saveError}
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#12101a]">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[180px_minmax(0,1fr)]">
          <div
            className={`relative flex aspect-[4/5] max-h-64 items-center justify-center overflow-hidden rounded-xl ${coverGradient} lg:max-h-none`}
          >
            {game.coverUrl && !coverFailed ? (
              <img
                alt={`${game.title} cover`}
                className="absolute inset-0 h-full w-full object-cover"
                onError={() => setCoverFailed(true)}
                src={game.coverUrl}
              />
            ) : (
              <span
                aria-hidden="true"
                className="text-5xl font-semibold text-white/70"
              >
                {game.title.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                  {platform?.name ?? 'Unknown platform'}
                </p>
                <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {game.title}
                </h1>
                <p className="mt-2 text-sm text-slate-400">
                  {game.releaseYear}
                  {genres.length > 0 && (
                    <>
                      <span className="px-2 text-slate-600">·</span>
                      {genres.join(', ')}
                    </>
                  )}
                </p>
              </div>
              <PrimaryLink to={`/games/${encodeURIComponent(game.id)}/edit`}>
                Edit Game
              </PrimaryLink>
            </div>

            <div className="mt-6 border-t border-white/[0.06] pt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                {GAME_STATUSES.map((status) => {
                  const selected = game.status === status
                  return (
                    <label
                      className={`flex min-h-10 cursor-pointer items-center justify-center rounded-lg border px-3 text-xs font-medium transition-colors ${
                        selected
                          ? STATUS_STYLES[status]
                          : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                      key={status}
                    >
                      <input
                        checked={selected}
                        className="sr-only"
                        name="game-status"
                        onChange={changeStatus}
                        type="radio"
                        value={status}
                      />
                      {STATUS_LABELS[status]}
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <DetailMetric label="Total Playtime" value={`${totalHours} hrs`} />
              <DetailMetric
                label="Play Sessions"
                value={sessions.length.toString()}
              />
              <div className="rounded-xl border border-white/[0.07] bg-[#0e0c14] p-4">
                <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                  Priority
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  {game.priority[0] + game.priority.slice(1).toLowerCase()}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Notes
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                {game.notes.trim() || 'No notes added yet.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <section className="rounded-2xl border border-white/[0.08] bg-[#12101a] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-white">Play Sessions</h2>
              <p className="mt-1 text-xs text-slate-500">
                {sessions.length
                  ? 'Your logged sessions for this game.'
                  : 'No play sessions have been logged yet.'}
              </p>
            </div>
            <span className="rounded-lg border border-violet-400/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-200">
              {totalHours} hrs total
            </span>
          </div>
          <form
            className="mt-5 grid gap-3 rounded-xl border border-white/[0.07] bg-[#0e0c14] p-4 sm:grid-cols-[1fr_110px_1.3fr_auto]"
            onSubmit={handleSessionSubmit}
          >
            <label className="text-xs font-medium text-slate-400">
              Date
              <input
                className={INPUT_CLASS}
                max={localDateInputValue(new Date())}
                onChange={(event) =>
                  setSessionValues((current) => ({
                    ...current,
                    date: event.target.value,
                  }))
                }
                required
                type="date"
                value={sessionValues.date}
              />
            </label>
            <label className="text-xs font-medium text-slate-400">
              Hours
              <input
                className={INPUT_CLASS}
                max="24"
                min="0.25"
                onChange={(event) =>
                  setSessionValues((current) => ({
                    ...current,
                    hoursPlayed: event.target.value,
                  }))
                }
                required
                step="0.25"
                type="number"
                value={sessionValues.hoursPlayed}
              />
            </label>
            <label className="text-xs font-medium text-slate-400">
              Note (optional)
              <input
                className={INPUT_CLASS}
                maxLength={300}
                onChange={(event) =>
                  setSessionValues((current) => ({
                    ...current,
                    note: event.target.value,
                  }))
                }
                placeholder="What did you do this session?"
                value={sessionValues.note}
              />
            </label>
            <button
              className={`${BUTTON_CLASS} self-end bg-violet-600 text-white hover:bg-violet-500`}
              type="submit"
            >
              Add Session
            </button>
          </form>
          {sessionError && (
            <p className="mt-3 text-sm text-rose-200" role="alert">
              {sessionError}
            </p>
          )}
          {sessions.length > 0 && (
            <ul className="mt-5 divide-y divide-white/[0.06]">
              {sessions.map((session) => (
                <li
                  className="flex flex-col justify-between gap-1 py-3 sm:flex-row sm:items-center"
                  key={session.id}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {formatDate(session.date)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {session.note || 'No session note'}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-violet-200">
                    {session.hoursPlayed} {session.hoursPlayed === 1 ? 'hr' : 'hrs'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-white/[0.08] bg-[#12101a] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Your Review</h2>
              <p className="mt-1 text-xs text-slate-500">
                {review ? `Last updated ${formatDate(review.dateReviewed)}` : 'Rate and review this game.'}
              </p>
            </div>
            {review && (
              <span
                aria-label={`${review.rating} out of 5 stars`}
                className="shrink-0 tracking-widest text-amber-300"
                role="img"
              >
                {'★'.repeat(review.rating)}
                <span className="text-slate-700">
                  {'★'.repeat(5 - review.rating)}
                </span>
              </span>
            )}
          </div>
          <form className="mt-5 space-y-4" onSubmit={handleReviewSubmit}>
            <label className="block text-xs font-medium text-slate-400">
              Rating
              <select
                className={INPUT_CLASS}
                onChange={(event) =>
                  setReviewValues((current) => ({
                    ...current,
                    rating: event.target.value,
                  }))
                }
                required
                value={reviewValues.rating}
              >
                <option value="">Choose a rating</option>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating}>
                    {rating} {rating === 1 ? 'star' : 'stars'}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium text-slate-400">
              Review note (optional)
              <textarea
                className={`${INPUT_CLASS} min-h-24 resize-y py-3`}
                maxLength={500}
                onChange={(event) =>
                  setReviewValues((current) => ({
                    ...current,
                    reviewText: event.target.value,
                  }))
                }
                placeholder="What did you think of the game?"
                value={reviewValues.reviewText}
              />
            </label>
            {reviewError && (
              <p className="text-sm text-rose-200" role="alert">
                {reviewError}
              </p>
            )}
            <button
              className={`${BUTTON_CLASS} w-full bg-violet-600 text-white hover:bg-violet-500`}
              type="submit"
            >
              {review ? 'Update Review' : 'Save Review'}
            </button>
          </form>
        </section>
      </div>
    </>
  )
}

function DetailMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0e0c14] p-4">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function localDateInputValue(date) {
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 10)
}

function makeGameId(title) {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug || 'game'}-${globalThis.crypto.randomUUID()}`
}

function GameFormPage({ data, onSave }) {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const existingGame = gameId ? data.games.find((game) => game.id === gameId) : null
  const [values, setValues] = useState(() => ({
    title: existingGame?.title ?? '',
    coverUrl: existingGame?.coverUrl ?? '',
    releaseYear: existingGame?.releaseYear?.toString() ?? '',
    platformId: existingGame?.platformId ?? data.platforms[0]?.id ?? '',
    genreIds: existingGame?.genreIds ?? [],
    status: existingGame?.status ?? 'BACKLOG',
    priority: existingGame?.priority ?? 'MEDIUM',
    notes: existingGame?.notes ?? '',
  }))
  const [validationError, setValidationError] = useState('')

  if (gameId && !existingGame) {
    return (
      <>
        <PageHeading
          description="This game is not in your library."
          eyebrow="Collection"
          title="Game not found"
        />
        <PrimaryLink to="/library">Back to Library</PrimaryLink>
      </>
    )
  }

  function updateField(event) {
    const { name, value } = event.target
    setValues((current) => ({ ...current, [name]: value }))
  }

  function toggleGenre(genreId) {
    setValues((current) => ({
      ...current,
      genreIds: current.genreIds.includes(genreId)
        ? current.genreIds.filter((id) => id !== genreId)
        : [...current.genreIds, genreId],
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const title = values.title.trim()
    const releaseYear = values.releaseYear.trim()
      ? Number(values.releaseYear)
      : null
    const currentYear = new Date().getFullYear()

    if (!title) {
      setValidationError('Enter a game title.')
      return
    }
    if (
      !values.platformId ||
      !data.platforms.some((platform) => platform.id === values.platformId)
    ) {
      setValidationError('Choose a platform.')
      return
    }
    if (
      releaseYear !== null &&
      (!Number.isInteger(releaseYear) ||
        releaseYear < 1950 ||
        releaseYear > currentYear + 10)
    ) {
      setValidationError(
        `Enter a release year between 1950 and ${currentYear + 10}, or leave it blank.`,
      )
      return
    }
    if (!GAME_STATUSES.includes(values.status)) {
      setValidationError('Choose a valid game status.')
      return
    }
    if (!GAME_PRIORITIES.includes(values.priority)) {
      setValidationError('Choose a valid priority.')
      return
    }
    if (
      values.genreIds.some(
        (id) => !data.genres.some((genre) => genre.id === id),
      )
    ) {
      setValidationError('Choose valid genres.')
      return
    }

    const now = new Date().toISOString()
    const game = {
      id: existingGame?.id ?? makeGameId(title),
      title,
      coverUrl: values.coverUrl.trim(),
      releaseYear,
      platformId: values.platformId,
      genreIds: values.genreIds,
      status: values.status,
      priority: values.priority,
      notes: values.notes.trim(),
      dateAdded: existingGame?.dateAdded ?? now,
      dateStarted:
        existingGame?.dateStarted ??
        (values.status === 'PLAYING' ? now : null),
      dateCompleted:
        existingGame?.dateCompleted ??
        (values.status === 'COMPLETED' ? now : null),
    }
    const nextData = {
      ...data,
      games: existingGame
        ? data.games.map((item) => (item.id === game.id ? game : item))
        : [...data.games, game],
    }

    if (onSave(nextData)) {
      navigate('/library')
    }
  }

  return (
    <>
      <PageHeading
        description={
          existingGame
            ? 'Update the details in your collection.'
            : 'Add a game to your personal collection.'
        }
        eyebrow="Collection"
        title={existingGame ? 'Edit Game' : 'Add Game'}
      />

      <form
        className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]"
        onSubmit={handleSubmit}
      >
        <section className="space-y-6 rounded-2xl border border-white/[0.08] bg-[#12101a] p-5 sm:p-7">
          {validationError && (
            <p
              className="rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
              role="alert"
            >
              {validationError}
            </p>
          )}

          <div>
            <h2 className="text-base font-semibold text-white">Game details</h2>
            <p className="mt-1 text-xs text-slate-500">
              Fields marked required must be completed.
            </p>
          </div>

          <label className="block text-sm font-medium text-slate-300">
            Title <span className="text-rose-300">*</span>
            <input
              autoFocus
              className={INPUT_CLASS}
              maxLength={120}
              name="title"
              onChange={updateField}
              placeholder="e.g. Hollow Knight"
              required
              value={values.title}
            />
          </label>

          <label className="block text-sm font-medium text-slate-300">
            Cover image URL
            <input
              className={INPUT_CLASS}
              name="coverUrl"
              onChange={updateField}
              placeholder="https://example.com/cover.jpg"
              type="url"
              value={values.coverUrl}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-300">
              Platform <span className="text-rose-300">*</span>
              <select
                className={INPUT_CLASS}
                name="platformId"
                onChange={updateField}
                required
                value={values.platformId}
              >
                {data.platforms.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-300">
              Release year
              <input
                className={INPUT_CLASS}
                max={new Date().getFullYear() + 10}
                min="1950"
                name="releaseYear"
                onChange={updateField}
                placeholder="2025"
                type="number"
                value={values.releaseYear}
              />
            </label>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-slate-300">Genres</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.genres.map((genre) => {
                const selected = values.genreIds.includes(genre.id)
                return (
                  <label
                    className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      selected
                        ? 'border-violet-400/40 bg-violet-500/15 text-violet-200'
                        : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20'
                    }`}
                    key={genre.id}
                  >
                    <input
                      checked={selected}
                      className="sr-only"
                      onChange={() => toggleGenre(genre.id)}
                      type="checkbox"
                    />
                    {genre.name}
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-300">
              Status
              <select
                className={INPUT_CLASS}
                name="status"
                onChange={updateField}
                value={values.status}
              >
                {GAME_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-slate-300">
              Priority
              <select
                className={INPUT_CLASS}
                name="priority"
                onChange={updateField}
                value={values.priority}
              >
                {GAME_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority[0] + priority.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm font-medium text-slate-300">
            Notes
            <textarea
              className={`${INPUT_CLASS} min-h-28 resize-y py-3`}
              maxLength={2000}
              name="notes"
              onChange={updateField}
              placeholder="Anything you want to remember about this game..."
              value={values.notes}
            />
          </label>

          <div className="flex flex-wrap justify-end gap-3 border-t border-white/[0.06] pt-5">
            <Link
              className={`${BUTTON_CLASS} border border-white/10 text-slate-300 hover:bg-white/[0.05]`}
              to="/library"
            >
              Cancel
            </Link>
            <button
              className={`${BUTTON_CLASS} bg-violet-600 text-white hover:bg-violet-500`}
              type="submit"
            >
              {existingGame ? 'Save Changes' : 'Save Game'}
            </button>
          </div>
        </section>

        <GamePreview
          key={values.coverUrl}
          platform={data.platforms.find(
            (platform) => platform.id === values.platformId,
          )}
          values={values}
        />
      </form>
    </>
  )
}

function GamePreview({ platform, values }) {
  const [imageFailed, setImageFailed] = useState(false)
  const showImage = values.coverUrl && !imageFailed

  return (
    <aside className="h-fit rounded-2xl border border-white/[0.08] bg-[#12101a] p-4">
      <h2 className="mb-4 text-sm font-semibold text-white">Live Preview</h2>
      <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#171420]">
        <div className="flex aspect-[1.5/1] items-center justify-center bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-600">
          {showImage ? (
            <img
              alt={values.title ? `${values.title} cover preview` : 'Cover preview'}
              className="h-full w-full object-cover"
              onError={() => setImageFailed(true)}
              src={values.coverUrl}
            />
          ) : (
            <span className="text-3xl font-semibold text-white/70">
              {values.title?.charAt(0).toUpperCase() || '?'}
            </span>
          )}
        </div>
        <div className="p-3">
          <h3 className="truncate text-sm font-semibold text-white">
            {values.title.trim() || 'Game title'}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {platform?.name ?? 'Choose a platform'}
            {values.releaseYear && ` · ${values.releaseYear}`}
          </p>
          <div className="mt-3">
            <span
              className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                STATUS_STYLES[values.status]
              }`}
            >
              {STATUS_LABELS[values.status]}
            </span>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            {values.priority[0] + values.priority.slice(1).toLowerCase()} priority
          </p>
        </div>
      </div>
    </aside>
  )
}

function StorageErrorPage() {
  return (
    <section className="max-w-xl rounded-2xl border border-rose-400/25 bg-rose-500/10 p-6">
      <h1 className="text-xl font-semibold text-rose-100">
        Tracker data is unavailable
      </h1>
      <p className="mt-2 text-sm leading-6 text-rose-200/80">
        Enable browser storage or resolve the saved-data issue, then reload this
        page. Your data was not replaced with an empty collection.
      </p>
    </section>
  )
}

function NotFoundPage() {
  return (
    <>
      <PageHeading
        description="The page you’re looking for doesn’t exist."
        eyebrow="Not found"
        title="Page not found"
      />
      <Link className="text-sm font-medium text-violet-300 hover:text-violet-200" to="/">
        Return to dashboard
      </Link>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App

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
              <Route element={<GameDetailPage />} path="/games/:gameId" />
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

      {data.games.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.games.map((game, index) => (
            <GameCard
              key={`${game.id}:${game.coverUrl}`}
              game={game}
              genres={data.genres}
              index={index}
              onDelete={() => deleteGame(game)}
              platforms={data.platforms}
            />
          ))}
        </div>
      ) : (
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
      )}
    </>
  )
}

function GameCard({ game, genres, index, onDelete, platforms }) {
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
              {game.releaseYear}
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
          <span className="text-xs text-slate-500">
            {game.genreIds.length
              ? game.genreIds
                  .map(
                    (id) =>
                      genres.find((genre) => genre.id === id)?.name ?? id,
                  )
                  .join(', ')
              : 'No genres'}
          </span>
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

function GameDetailPage() {
  const { gameId } = useParams()

  return (
    <>
      <PageHeading
        description="A dedicated space for a game's details, progress, and play history."
        eyebrow="Game details"
        title="Game Detail"
      />
      <PlaceholderPanel title="Game details will appear here">
        This page is ready for game{' '}
        <span className="font-mono text-violet-200">{gameId}</span>.
      </PlaceholderPanel>
    </>
  )
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
    const releaseYear = Number(values.releaseYear)
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
      !Number.isInteger(releaseYear) ||
      releaseYear < 1950 ||
      releaseYear > currentYear + 10
    ) {
      setValidationError(`Enter a release year between 1950 and ${currentYear + 10}.`)
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
              Release year <span className="text-rose-300">*</span>
              <input
                className={INPUT_CLASS}
                max={new Date().getFullYear() + 10}
                min="1950"
                name="releaseYear"
                onChange={updateField}
                placeholder="2025"
                required
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

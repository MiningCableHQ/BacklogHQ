import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GAME_PRIORITIES, GAME_STATUSES } from '../../data/models.js'
import { BUTTON_CLASS, INPUT_CLASS, STATUS_LABELS, STATUS_STYLES } from '../../constants/gameUi.js'
import { PageHeading, PrimaryLink } from '../../components/PageHeading.jsx'

export function LibraryPage({ data, onSave }) {
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
                  className="min-h-11 rounded-lg border border-white/10 bg-[#0d0b13] px-3 text-xs text-slate-200 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
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
                className="min-h-11 rounded-lg border border-white/10 px-3 text-xs text-slate-300 transition hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
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
                className="min-h-11 rounded-lg px-3 text-xs font-medium text-violet-300 transition hover:bg-violet-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:text-slate-600 disabled:hover:bg-transparent"
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
              className="block truncate font-semibold text-white transition-colors hover:text-violet-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
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
              className="text-xs font-medium text-slate-400 hover:text-violet-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
              to={`/games/${encodeURIComponent(game.id)}/edit`}
            >
              Edit
            </Link>
            <button
              className="text-xs font-medium text-rose-300 hover:text-rose-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
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

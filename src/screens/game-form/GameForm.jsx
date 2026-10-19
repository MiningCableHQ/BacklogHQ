import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { GAME_PRIORITIES, GAME_STATUSES } from '../../data/models.js'
import { BUTTON_CLASS, INPUT_CLASS, STATUS_LABELS, STATUS_STYLES } from '../../constants/gameUi.js'
import { PageHeading, PrimaryLink } from '../../components/PageHeading.jsx'

function makeGameId(title) {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${slug || 'game'}-${globalThis.crypto.randomUUID()}`
}

export function GameFormPage({ data, onSave }) {
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
                    className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border px-3 text-xs font-medium transition-colors focus-within:ring-2 focus-within:ring-violet-300 focus-within:ring-offset-2 focus-within:ring-offset-[#12101a] ${
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
        <div className="flex aspect-[1.5/1] items-center justify-center bg-[#a78bf9]">
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

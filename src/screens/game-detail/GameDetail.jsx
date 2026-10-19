import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GAME_STATUSES } from '../../data/models.js'
import { BUTTON_CLASS, INPUT_CLASS, STATUS_LABELS, STATUS_STYLES } from '../../constants/gameUi.js'
import { PageHeading, PrimaryLink } from '../../components/PageHeading.jsx'
import { formatDate, localDateInputValue } from '../../utils/formatters.js'

export function GameDetailPage({ data, onSave }) {
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

  function changeStatus(nextStatus) {
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
                  {Number.isFinite(game.releaseYear)
                    ? game.releaseYear
                    : 'Year unknown'}
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
              <div
                aria-label="Game status"
                className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5"
                role="group"
              >
                {GAME_STATUSES.map((status) => {
                  const selected = game.status === status
                  return (
                    <button
                      aria-pressed={selected}
                      className={`flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-3 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 ${
                        selected
                          ? STATUS_STYLES[status]
                          : 'border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/20 hover:text-slate-200'
                      }`}
                      key={status}
                      onClick={() => changeStatus(status)}
                      type="button"
                    >
                      {STATUS_LABELS[status]}
                    </button>
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
        <section className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#12101a] p-5 sm:p-6">
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
            className="mt-5 grid gap-3 rounded-xl border border-white/[0.07] bg-[#0e0c14] p-4 md:grid-cols-[minmax(0,1fr)_110px_minmax(0,1.3fr)_auto]"
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

        <section className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#12101a] p-5 sm:p-6">
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

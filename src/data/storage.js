import { GAME_PRIORITIES, GAME_STATUSES } from './models.js'
import { createInitialData } from './initialData.js'

export const STORAGE_KEY = 'personal-game-backlog-tracker:data:v1'

export class TrackerStorageError extends Error {
  constructor(message, cause) {
    super(message, { cause })
    this.name = 'TrackerStorageError'
  }
}

function getStorage(storage) {
  try {
    const target = storage ?? globalThis.localStorage
    if (!target) {
      throw new Error('Web Storage is unavailable in this environment.')
    }
    return target
  } catch (error) {
    throw new TrackerStorageError('Unable to access browser storage.', error)
  }
}

function validateTrackerData(data) {
  const collectionNames = ['games', 'sessions', 'reviews', 'platforms', 'genres']
  if (
    !data ||
    data.version !== 1 ||
    collectionNames.some((name) => !Array.isArray(data[name]))
  ) {
    throw new TrackerStorageError(
      'Saved tracker data has an unsupported or invalid structure.',
    )
  }

  const ids = Object.fromEntries(
    collectionNames.map((name) => [
      name,
      new Set(data[name].map((record) => record?.id)),
    ]),
  )

  const hasUniqueIds = collectionNames.every(
    (name) => ids[name].size === data[name].length && !ids[name].has(undefined),
  )

  const validGames = data.games.every(
    (game) =>
      typeof game.title === 'string' &&
      typeof game.coverUrl === 'string' &&
      Number.isInteger(game.releaseYear) &&
      ids.platforms.has(game.platformId) &&
      Array.isArray(game.genreIds) &&
      game.genreIds.every((genreId) => ids.genres.has(genreId)) &&
      GAME_STATUSES.includes(game.status) &&
      GAME_PRIORITIES.includes(game.priority) &&
      typeof game.notes === 'string' &&
      typeof game.dateAdded === 'string' &&
      (game.dateStarted === null || typeof game.dateStarted === 'string') &&
      (game.dateCompleted === null || typeof game.dateCompleted === 'string'),
  )

  const validSessions = data.sessions.every(
    (session) =>
      ids.games.has(session.gameId) &&
      typeof session.date === 'string' &&
      Number.isFinite(session.hoursPlayed) &&
      session.hoursPlayed > 0 &&
      typeof session.note === 'string',
  )

  const validReviews = data.reviews.every(
    (review) =>
      ids.games.has(review.gameId) &&
      Number.isInteger(review.rating) &&
      review.rating >= 1 &&
      review.rating <= 5 &&
      typeof review.reviewText === 'string' &&
      typeof review.dateReviewed === 'string',
  )

  if (!hasUniqueIds || !validGames || !validSessions || !validReviews) {
    throw new TrackerStorageError(
      'Saved tracker data contains invalid fields or broken game relationships.',
    )
  }

  return data
}

export function saveTrackerData(data, storage) {
  validateTrackerData(data)
  const target = getStorage(storage)

  try {
    target.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    throw new TrackerStorageError('Unable to save tracker data to browser storage.', error)
  }
}

export function loadTrackerData(storage) {
  const target = getStorage(storage)
  let serialized

  try {
    serialized = target.getItem(STORAGE_KEY)
  } catch (error) {
    throw new TrackerStorageError('Unable to read tracker data from browser storage.', error)
  }

  if (serialized === null) {
    const initialData = createInitialData()
    saveTrackerData(initialData, target)
    return initialData
  }

  let data
  try {
    data = JSON.parse(serialized)
  } catch (error) {
    throw new TrackerStorageError('Saved tracker data is not valid JSON.', error)
  }

  return validateTrackerData(data)
}

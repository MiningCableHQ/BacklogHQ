export const GAME_STATUSES = Object.freeze([
  'WISHLIST',
  'BACKLOG',
  'PLAYING',
  'COMPLETED',
  'DROPPED',
])

export const GAME_PRIORITIES = Object.freeze(['LOW', 'MEDIUM', 'HIGH'])

/**
 * Dates are stored as ISO 8601 strings so records remain JSON-serializable.
 *
 * @typedef {Object} Game
 * @property {string} id
 * @property {string} title
 * @property {string} coverUrl
 * @property {number|null} releaseYear
 * @property {string} platformId
 * @property {string[]} genreIds
 * @property {'WISHLIST'|'BACKLOG'|'PLAYING'|'COMPLETED'|'DROPPED'} status
 * @property {'LOW'|'MEDIUM'|'HIGH'} priority
 * @property {string} notes
 * @property {string} dateAdded
 * @property {string|null} dateStarted
 * @property {string|null} dateCompleted
 */

/** @typedef {{ id: string, name: string, iconKey: string }} Platform */

/** @typedef {{ id: string, name: string }} Genre */

/**
 * @typedef {Object} PlaySession
 * @property {string} id
 * @property {string} gameId
 * @property {string} date
 * @property {number} hoursPlayed
 * @property {string} note
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} gameId
 * @property {number} rating
 * @property {string} reviewText
 * @property {string} dateReviewed
 */

/**
 * @typedef {Object} TrackerData
 * @property {number} version
 * @property {Game[]} games
 * @property {PlaySession[]} sessions
 * @property {Review[]} reviews
 * @property {Platform[]} platforms
 * @property {Genre[]} genres
 */

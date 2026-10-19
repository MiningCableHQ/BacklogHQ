import { useState } from 'react'
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom'
import { DashboardPage } from './screens/dashboard/Dashboard.jsx'
import { LibraryPage } from './screens/library/Library.jsx'
import { GameDetailPage } from './screens/game-detail/GameDetail.jsx'
import { GameFormPage } from './screens/game-form/GameForm.jsx'
import { NotFoundPage } from './screens/not-found/NotFound.jsx'
import { StorageErrorPage } from './screens/storage-error/StorageError.jsx'
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
          className="flex items-center gap-3 px-4 py-4 sm:px-5 sm:py-5"
          to="/"
          aria-label="BacklogHQ home"
        >
          <img
            alt=""
            aria-hidden="true"
            className="h-9 w-9 shrink-0 rounded-xl object-contain"
            src="/CableHQ.svg"
          />
          <span className="text-sm font-semibold tracking-wide text-white">
            BacklogHQ
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
                className={`flex min-h-11 flex-1 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors md:flex-none ${
                  active
                    ? 'bg-violet-500/15 text-violet-200'
                    : 'text-slate-400 hover:bg-white/[0.05] hover:text-slate-100'
                } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300`}
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
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
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
              <Route
                element={<DashboardPage data={trackerState.data} />}
                path="/"
              />
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

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default App

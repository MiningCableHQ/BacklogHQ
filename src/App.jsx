import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
} from 'react-router-dom'

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
          <Routes>
            <Route element={<DashboardPage />} path="/" />
            <Route element={<LibraryPage />} path="/library" />
            <Route element={<GameDetailPage />} path="/games/:gameId" />
            <Route element={<AddGamePage />} path="/games/new" />
            <Route element={<NotFoundPage />} path="*" />
          </Routes>
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

function DashboardPage() {
  return (
    <>
      <PageHeading
        description="Keep track of the games you want to play, the ones in progress, and every completion along the way."
        eyebrow="Overview"
        title="Dashboard"
        action={
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
            to="/games/new"
          >
            Add a game
          </Link>
        }
      />
      <PlaceholderPanel title="Your backlog starts here">
        Add games to your library to see your collection and progress summarized
        on this dashboard.
      </PlaceholderPanel>
    </>
  )
}

function LibraryPage() {
  return (
    <>
      <PageHeading
        description="Browse and organize your personal collection of games."
        eyebrow="Collection"
        title="Library"
        action={
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-violet-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
            to="/games/new"
          >
            Add a game
          </Link>
        }
      />
      <PlaceholderPanel title="Your library is ready to be filled">
        Game cards, search, and filters will appear here in a later step.
      </PlaceholderPanel>
    </>
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
        This page is ready for game <span className="font-mono text-violet-200">{gameId}</span>.
      </PlaceholderPanel>
    </>
  )
}

function AddGamePage() {
  return (
    <>
      <PageHeading
        description="Add a game to your personal backlog."
        eyebrow="Collection"
        title="Add Game"
      />
      <PlaceholderPanel title="Game form coming next">
        The game entry form will be added in a later step.
      </PlaceholderPanel>
    </>
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

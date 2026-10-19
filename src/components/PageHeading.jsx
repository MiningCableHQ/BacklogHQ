import { Link } from 'react-router-dom'
import { BUTTON_CLASS } from '../constants/gameUi.js'

export function PageHeading({ eyebrow, title, description, action }) {
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

export function PrimaryLink({ children, to }) {
  return (
    <Link
      className={`${BUTTON_CLASS} shrink-0 whitespace-nowrap bg-violet-600 text-white hover:bg-violet-500`}
      to={to}
    >
      {children}
    </Link>
  )
}

import { Link } from 'react-router-dom'
import { PageHeading } from '../../components/PageHeading.jsx'

export function NotFoundPage() {
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

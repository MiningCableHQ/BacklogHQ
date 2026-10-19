export function StorageErrorPage() {

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

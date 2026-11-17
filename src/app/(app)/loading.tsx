/**
 * Shown instantly while a page's server data loads, so navigation responds
 * on click instead of waiting for the new page to be ready.
 */
export default function AppLoading() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true" aria-label="Loading">
      <div>
        <div className="skeleton h-8 w-48" />
        <div className="skeleton mt-2 h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-24 rounded-2xl" />
        ))}
      </div>
      <div className="skeleton h-80 rounded-2xl" />
    </div>
  );
}

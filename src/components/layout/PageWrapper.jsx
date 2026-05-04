export default function PageWrapper({ title, titleAction, children }) {
  return (
    <main className="px-4 pt-4 pb-24" aria-label={title}>
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h1 className="text-xl font-black text-gaa-dark">{title}</h1>
          {titleAction && <div>{titleAction}</div>}
        </div>
      )}
      {children}
    </main>
  )
}

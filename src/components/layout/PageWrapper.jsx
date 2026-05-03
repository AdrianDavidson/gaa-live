export default function PageWrapper({ title, children }) {
  return (
    <main className="px-4 pt-4 pb-24" aria-label={title}>
      {title && (
        <h1 className="text-xl font-black text-gaa-dark mb-4">{title}</h1>
      )}
      {children}
    </main>
  )
}

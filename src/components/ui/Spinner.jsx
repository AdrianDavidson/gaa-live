export default function Spinner({ label = 'Loading…' }) {
  return (
    <div role="status" aria-label={label} className="flex justify-center py-8">
      <div className="w-8 h-8 border-4 border-gaa-green border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function Header() {
  return (
    <header className="bg-gaa-green text-white px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-black tracking-tight">GAA Live</span>
      </div>
      <span className="text-xs text-green-200 font-medium">Free scores &amp; streams</span>
    </header>
  )
}

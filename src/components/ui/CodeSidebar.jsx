const CODE_BG = {
  hurling:  'bg-gaa-hurling',
  football: 'bg-gaa-football',
}

const CODE_LABEL = {
  hurling:  'Hurling',
  football: 'Football',
}

export default function CodeSidebar({ code }) {
  const bg    = CODE_BG[code]
  const label = CODE_LABEL[code]
  if (!bg) return null

  return (
    <div
      className={`${bg} flex items-center justify-center w-7 shrink-0`}
      aria-hidden="true"
    >
      <span className="[writing-mode:vertical-rl] rotate-180 text-white text-[9px] font-bold tracking-[0.12em] uppercase select-none whitespace-nowrap">
        {label}
      </span>
    </div>
  )
}

import { useState } from 'react'

export default function EmbedPlayer({ stream }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full bg-gaa-green text-white font-bold text-lg py-3 flex items-center justify-center gap-2 min-h-[48px] hover:bg-green-800 transition-colors"
          aria-label={`Watch ${stream.title} free on YouTube`}
        >
          <span aria-hidden="true">▶</span> Watch Free
        </button>
      ) : (
        <>
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={stream.embedUrl}
              title={stream.title}
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <a
            href={stream.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-sm text-gaa-green font-bold py-2 border-t border-gray-200 min-h-[48px] flex items-center justify-center hover:underline"
          >
            Open in YouTube ↗
          </a>
        </>
      )}
    </div>
  )
}

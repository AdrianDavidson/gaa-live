const SOURCE_LABELS = {
  rte:        'RTÉ Sport RSS',
  bbc:        'BBC Sport RSS',
  hoganstand: 'HoganStand RSS',
}

export default function DataSourceNotice({ source }) {
  return (
    <p className="text-xs text-gray-400 text-right mt-1">
      Source: {SOURCE_LABELS[source] ?? source}
    </p>
  )
}

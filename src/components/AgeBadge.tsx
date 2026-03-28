interface AgeBadgeProps {
  dateAdded: string
}

export function AgeBadge({ dateAdded }: AgeBadgeProps) {
  const months = monthsAgo(dateAdded)

  if (months >= 12) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        {months}mo — Remove
      </span>
    )
  }
  if (months >= 6) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        {months}mo
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      {months}mo
    </span>
  )
}

export function monthsAgo(dateStr: string): number {
  const date = new Date(dateStr)
  const now = new Date()
  return (
    (now.getFullYear() - date.getFullYear()) * 12 +
    (now.getMonth() - date.getMonth())
  )
}

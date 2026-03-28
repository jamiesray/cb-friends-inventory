import type { Book } from '../types'
import { AgeBadge } from './AgeBadge'

interface BookCardProps {
  book: Partial<Book> & { title: string }
  showAge?: boolean
  onClick?: () => void
}

export function BookCard({ book, showAge = false, onClick }: BookCardProps) {
  return (
    <div
      className={`flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100 ${onClick ? 'active:bg-gray-50 cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CoverImage isbn={book.isbn ?? null} coverUrl={book.cover_url ?? null} />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight truncate">{book.title}</p>
        {book.author && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{book.author}</p>
        )}
        {showAge && book.date_added && (
          <div className="mt-1">
            <AgeBadge dateAdded={book.date_added} />
          </div>
        )}
      </div>
    </div>
  )
}

function CoverImage({ isbn, coverUrl }: { isbn: string | null; coverUrl: string | null }) {
  const src = coverUrl ?? (isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-S.jpg` : null)

  if (!src) {
    return <BookPlaceholder />
  }

  return (
    <img
      src={src}
      alt="Cover"
      className="w-10 h-14 object-cover rounded flex-shrink-0 bg-gray-100"
      onError={(e) => {
        const target = e.currentTarget
        target.style.display = 'none'
        const placeholder = target.nextElementSibling as HTMLElement | null
        if (placeholder) placeholder.style.display = 'flex'
      }}
    />
  )
}

function BookPlaceholder() {
  return (
    <div className="w-10 h-14 rounded flex-shrink-0 bg-blue-100 flex items-center justify-center">
      <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V6h10v2z" />
      </svg>
    </div>
  )
}

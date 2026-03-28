import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '../lib/supabase'
import { BookCard } from '../components/BookCard'
import { AgeBadge, monthsAgo } from '../components/AgeBadge'
import type { Book } from '../types'

type FilterTab = 'all' | 'aged'

interface InventoryProps {
  isAdmin: boolean
}

export function Inventory({ isAdmin }: InventoryProps) {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterTab>('all')
  const [selected, setSelected] = useState<Book | null>(null)
  const [bulkConfirm, setBulkConfirm] = useState(false)

  async function fetchBooks() {
    setLoading(true)
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('status', 'in_stock')
      .order('date_added', { ascending: false })

    if (!error && data) setBooks(data as Book[])
    setLoading(false)
  }

  useEffect(() => {
    void fetchBooks()
  }, [])

  const filtered = books.filter((b) => {
    const matchSearch =
      !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      (b.author?.toLowerCase().includes(search.toLowerCase()) ?? false)

    const matchFilter = filter === 'all' || monthsAgo(b.date_added) >= 12

    return matchSearch && matchFilter
  })

  const agedCount = books.filter((b) => monthsAgo(b.date_added) >= 12).length

  async function markAs(book: Book, status: 'sold' | 'removed') {
    const { error } = await supabase
      .from('books')
      .update({ status, date_out: new Date().toISOString() })
      .eq('id', book.id)

    if (error) {
      toast.error('Failed to update book.')
    } else {
      toast.success(status === 'sold' ? `Sold: ${book.title}` : `Removed: ${book.title}`)
      setSelected(null)
      void fetchBooks()
    }
  }

  async function bulkRemoveAged() {
    const agedIds = books
      .filter((b) => monthsAgo(b.date_added) >= 12)
      .map((b) => b.id)

    const { error } = await supabase
      .from('books')
      .update({ status: 'removed', date_out: new Date().toISOString() })
      .in('id', agedIds)

    if (error) {
      toast.error('Failed to bulk remove.')
    } else {
      toast.success(`Removed ${agedIds.length} aged-out books.`)
      setBulkConfirm(false)
      void fetchBooks()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-4 pb-2 space-y-3">
        <h2 className="text-xl font-bold">Inventory</h2>

        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
          </svg>
          <input
            type="search"
            placeholder="Search title or author…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setFilter('all')}
          >
            All ({books.length})
          </button>
          <button
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'aged' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
            onClick={() => setFilter('aged')}
          >
            Aged Out ({agedCount})
          </button>
        </div>
      </header>

      {/* Bulk remove button (admin + aged filter) */}
      {isAdmin && filter === 'aged' && agedCount > 0 && (
        <div className="px-4 pb-2">
          {!bulkConfirm ? (
            <button
              className="w-full py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold active:bg-red-100"
              onClick={() => setBulkConfirm(true)}
            >
              Remove All {agedCount} Aged-Out Books
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 active:bg-gray-50"
                onClick={() => setBulkConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold active:bg-red-700"
                onClick={() => void bulkRemoveAged()}
              >
                Confirm Remove All
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-2">
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-sm">{search ? 'No results found.' : 'No books in inventory.'}</p>
          </div>
        ) : (
          filtered.map((book) => (
            <BookCard key={book.id} book={book} showAge onClick={() => setSelected(book)} />
          ))
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <BookDetailModal
          book={selected}
          onClose={() => setSelected(null)}
          onMarkSold={() => void markAs(selected, 'sold')}
          onRemove={() => void markAs(selected, 'removed')}
        />
      )}
    </div>
  )
}

function BookDetailModal({
  book,
  onClose,
  onMarkSold,
  onRemove,
}: {
  book: Book
  onClose: () => void
  onMarkSold: () => void
  onRemove: () => void
}) {
  const added = new Date(book.date_added).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-white w-full rounded-t-3xl p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto" />

        <div className="flex gap-4 items-start">
          {(book.cover_url ?? book.isbn) && (
            <img
              src={book.cover_url ?? `https://covers.openlibrary.org/b/isbn/${book.isbn}-M.jpg`}
              alt="Cover"
              className="w-16 h-24 object-cover rounded-lg bg-gray-100 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg leading-tight">{book.title}</h3>
            {book.author && <p className="text-gray-500 text-sm mt-1">{book.author}</p>}
            {book.isbn && <p className="text-gray-400 text-xs mt-1">ISBN: {book.isbn}</p>}
            <div className="mt-2">
              <AgeBadge dateAdded={book.date_added} />
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p>Added: {added}</p>
          {book.category && <p>Category: {book.category}</p>}
          {book.notes && <p>Notes: {book.notes}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            className="py-3 rounded-xl bg-green-600 text-white font-semibold text-sm active:bg-green-700"
            onClick={onMarkSold}
          >
            Mark as Sold
          </button>
          <button
            className="py-3 rounded-xl bg-gray-100 text-gray-700 font-semibold text-sm active:bg-gray-200"
            onClick={onRemove}
          >
            Remove
          </button>
        </div>
        <button
          className="w-full py-3 text-sm text-gray-400 active:text-gray-600"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
          <div className="w-10 h-14 bg-gray-100 rounded animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </>
  )
}

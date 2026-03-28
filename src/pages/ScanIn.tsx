import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { BarcodeScanner } from '../components/BarcodeScanner'
import { BookCard } from '../components/BookCard'
import { supabase } from '../lib/supabase'
import { lookupByISBN } from '../lib/openLibrary'
import type { BookInsert } from '../types'

type ScanState = 'scanning' | 'confirming' | 'manual'

interface PreviewBook {
  isbn: string | null
  title: string
  author: string | null
  cover_url: string | null
}

export function ScanIn() {
  const [state, setState] = useState<ScanState>('scanning')
  const [preview, setPreview] = useState<PreviewBook | null>(null)
  const [loading, setLoading] = useState(false)
  const [manualForm, setManualForm] = useState({ isbn: '', title: '', author: '' })

  const handleScan = useCallback(async (code: string) => {
    setState('confirming')
    setLoading(true)
    setPreview({ isbn: code, title: 'Looking up…', author: null, cover_url: null })

    const result = await lookupByISBN(code)

    if (result) {
      setPreview({ isbn: code, title: result.title, author: result.author, cover_url: result.cover_url })
    } else {
      setPreview(null)
      setManualForm({ isbn: code, title: '', author: '' })
      setState('manual')
    }
    setLoading(false)
  }, [])

  async function addBook(book: BookInsert) {
    setLoading(true)
    const { error } = await supabase.from('books').insert({
      isbn: book.isbn ?? null,
      title: book.title,
      author: book.author ?? null,
      cover_url: book.cover_url ?? null,
      category: book.category ?? null,
      notes: book.notes ?? null,
      status: 'in_stock',
    })

    if (error) {
      toast.error('Failed to add book. Try again.')
    } else {
      toast.success(`Added: ${book.title}`)
    }

    setLoading(false)
    setState('scanning')
    setPreview(null)
  }

  function cancelConfirm() {
    setState('scanning')
    setPreview(null)
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-4 pb-2">
        <h2 className="text-xl font-bold">Scan In</h2>
        <p className="text-sm text-gray-500">Scan a book barcode to add it to inventory.</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {/* Scanner */}
        {state === 'scanning' && (
          <>
            <BarcodeScanner onScan={handleScan} active={state === 'scanning'} />
            <button
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-sm font-medium active:bg-gray-50"
              onClick={() => {
                setManualForm({ isbn: '', title: '', author: '' })
                setState('manual')
              }}
            >
              + Manual entry (no camera)
            </button>
          </>
        )}

        {/* Confirmation card */}
        {state === 'confirming' && preview && (
          <div className="space-y-4">
            <BarcodeScanner onScan={handleScan} active={false} />
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Book Found</p>
              {loading ? (
                <div className="flex items-center gap-3 py-2">
                  <div className="w-10 h-14 bg-gray-100 rounded animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ) : (
                <BookCard book={preview} />
              )}
              <div className="flex gap-3 pt-1">
                <button
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm active:bg-gray-50"
                  onClick={cancelConfirm}
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm active:bg-blue-700 disabled:opacity-50"
                  onClick={() => preview.title !== 'Looking up…' && addBook(preview)}
                >
                  Add to Inventory
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual entry form */}
        {state === 'manual' && (
          <ManualEntryForm
            initial={manualForm}
            loading={loading}
            onSubmit={(data) => addBook({ isbn: data.isbn || null, title: data.title, author: data.author || null })}
            onCancel={() => setState('scanning')}
          />
        )}
      </div>
    </div>
  )
}

interface ManualEntryFormProps {
  initial: { isbn: string; title: string; author: string }
  loading: boolean
  onSubmit: (data: { isbn: string; title: string; author: string }) => void
  onCancel: () => void
}

function ManualEntryForm({ initial, loading, onSubmit, onCancel }: ManualEntryFormProps) {
  const [form, setForm] = useState(initial)

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-4">
      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Manual Entry</p>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="ISBN (optional)"
          value={form.isbn}
          onChange={(e) => set('isbn', e.target.value)}
          className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          placeholder="Title *"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <input
          type="text"
          placeholder="Author"
          value={form.author}
          onChange={(e) => set('author', e.target.value)}
          className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm active:bg-gray-50"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          disabled={!form.title.trim() || loading}
          className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm active:bg-blue-700 disabled:opacity-50"
          onClick={() => onSubmit(form)}
        >
          {loading ? 'Adding…' : 'Add to Inventory'}
        </button>
      </div>
    </div>
  )
}

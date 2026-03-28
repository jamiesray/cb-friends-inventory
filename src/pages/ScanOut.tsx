import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { BarcodeScanner } from '../components/BarcodeScanner'
import { BookCard } from '../components/BookCard'
import { supabase } from '../lib/supabase'
import type { Book } from '../types'

type ScanState = 'scanning' | 'confirming' | 'not-found'

export function ScanOut() {
  const [state, setState] = useState<ScanState>('scanning')
  const [match, setMatch] = useState<{ book: Book; copies: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [scannedISBN, setScannedISBN] = useState('')

  const handleScan = useCallback(async (code: string) => {
    setState('confirming')
    setLoading(true)
    setScannedISBN(code)

    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('isbn', code)
      .eq('status', 'in_stock')
      .order('date_added', { ascending: true })

    if (error || !data || data.length === 0) {
      setState('not-found')
      setLoading(false)
      return
    }

    const books = data as Book[]
    setMatch({ book: books[0]!, copies: books.length })
    setLoading(false)
  }, [])

  async function markSold() {
    if (!match) return
    setLoading(true)

    const { error } = await supabase
      .from('books')
      .update({ status: 'sold', date_out: new Date().toISOString() })
      .eq('id', match.book.id)

    if (error) {
      toast.error('Failed to mark as sold.')
    } else {
      toast.success(`Sold: ${match.book.title} — $1.00`)
    }

    setLoading(false)
    setState('scanning')
    setMatch(null)
    setScannedISBN('')
  }

  function cancel() {
    setState('scanning')
    setMatch(null)
    setScannedISBN('')
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-4 pb-2">
        <h2 className="text-xl font-bold">Scan Out</h2>
        <p className="text-sm text-gray-500">Scan a book barcode to mark it as sold.</p>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        <BarcodeScanner onScan={handleScan} active={state === 'scanning'} containerId="barcode-reader-out" />

        {/* Confirming / loading */}
        {state === 'confirming' && loading && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 py-2">
              <div className="w-10 h-14 bg-gray-100 rounded animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
              </div>
            </div>
          </div>
        )}

        {/* Book found */}
        {state === 'confirming' && !loading && match && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Ready to Sell</p>
              {match.copies > 1 && (
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-medium">
                  {match.copies} copies — selling oldest
                </span>
              )}
            </div>
            <BookCard book={match.book} />
            <div className="flex gap-3 pt-1">
              <button
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm active:bg-gray-50"
                onClick={cancel}
              >
                Cancel
              </button>
              <button
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-green-600 text-white font-semibold text-sm active:bg-green-700 disabled:opacity-50"
                onClick={markSold}
              >
                Mark as Sold — $1.00
              </button>
            </div>
          </div>
        )}

        {/* Not found */}
        {state === 'not-found' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
            <div className="text-center py-4">
              <div className="text-4xl mb-2">📭</div>
              <p className="font-semibold text-gray-800">Not in inventory</p>
              <p className="text-sm text-gray-500 mt-1">ISBN: {scannedISBN}</p>
              <p className="text-sm text-gray-400 mt-1">No in-stock copies found.</p>
            </div>
            <button
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm active:bg-blue-700"
              onClick={cancel}
            >
              Scan Another
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export type BookStatus = 'in_stock' | 'sold' | 'removed'

export interface Book {
  id: string
  isbn: string | null
  title: string
  author: string | null
  cover_url: string | null
  category: string | null
  status: BookStatus
  date_added: string
  date_out: string | null
  notes: string | null
}

export interface BookInsert {
  isbn?: string | null
  title: string
  author?: string | null
  cover_url?: string | null
  category?: string | null
  notes?: string | null
}

export type Tab = 'scan-in' | 'scan-out' | 'inventory' | 'dashboard' | 'settings'

export interface OpenLibraryBook {
  title: string
  authors?: Array<{ key: string }>
}

export interface OpenLibraryAuthor {
  name: string
}

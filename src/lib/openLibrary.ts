import type { OpenLibraryBook, OpenLibraryAuthor } from '../types'

export interface BookLookupResult {
  title: string
  author: string | null
  cover_url: string | null
}

export async function lookupByISBN(isbn: string): Promise<BookLookupResult | null> {
  try {
    const res = await fetch(`https://openlibrary.org/isbn/${isbn}.json`)
    if (!res.ok) return null

    const data = (await res.json()) as OpenLibraryBook
    const title = data.title ?? ''
    if (!title) return null

    let author: string | null = null

    if (data.authors && data.authors.length > 0) {
      const authorKey = data.authors[0]?.key
      if (authorKey) {
        try {
          const authorRes = await fetch(`https://openlibrary.org${authorKey}.json`)
          if (authorRes.ok) {
            const authorData = (await authorRes.json()) as OpenLibraryAuthor
            author = authorData.name ?? null
          }
        } catch {
          // Author lookup failed — not fatal
        }
      }
    }

    const cover_url = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`

    return { title, author, cover_url }
  } catch {
    return null
  }
}

import { useState, useRef } from 'react'

interface PinEntryProps {
  onSuccess: (pin: string) => Promise<boolean>
  title?: string
  subtitle?: string
}

export function PinEntry({ onSuccess, title = 'CB Friends\nInventory', subtitle = 'Enter your PIN to continue' }: PinEntryProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!pin.trim() || loading) return

    setLoading(true)
    setError(false)

    const ok = await onSuccess(pin)

    if (!ok) {
      setLoading(false)
      setError(true)
      setPin('')
      setShake(true)
      setTimeout(() => setShake(false), 500)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 px-6">
      <div className={`w-full max-w-xs ${shake ? 'animate-shake' : ''}`}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 14H7v-2h10v2zm0-4H7v-2h10v2zm0-4H7V6h10v2z" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold whitespace-pre-line leading-tight">{title}</h1>
          <p className="text-blue-200 text-sm mt-2">{subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              autoFocus
              className={`w-full px-4 py-4 text-center text-xl tracking-widest rounded-2xl border-2 bg-white/10 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-white/50 ${
                error ? 'border-red-400' : 'border-white/20'
              }`}
            />
            {error && (
              <p className="text-red-300 text-sm text-center mt-2">Incorrect PIN. Try again.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!pin.trim() || loading}
            className="w-full py-4 bg-white text-blue-700 font-bold rounded-2xl text-lg disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  )
}

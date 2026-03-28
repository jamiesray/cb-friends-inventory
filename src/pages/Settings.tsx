import { useState } from 'react'
import toast from 'react-hot-toast'
import { supabase, setSetting } from '../lib/supabase'
import type { Book } from '../types'

interface SettingsProps {
  isAdmin: boolean
  onAdminLogin: (pin: string) => Promise<boolean>
  onAdminLogout: () => void
  onAppLogout: () => void
}

export function Settings({ isAdmin, onAdminLogin, onAdminLogout, onAppLogout }: SettingsProps) {
  const [adminPin, setAdminPin] = useState('')
  const [adminError, setAdminError] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault()
    setAdminLoading(true)
    setAdminError(false)
    const ok = await onAdminLogin(adminPin)
    if (!ok) {
      setAdminError(true)
      setAdminPin('')
    }
    setAdminLoading(false)
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col h-full">
        <header className="px-4 pt-4 pb-2">
          <h2 className="text-xl font-bold">Admin Settings</h2>
          <p className="text-sm text-gray-500">Enter admin PIN to access settings.</p>
        </header>

        <div className="px-4 mt-4">
          <form onSubmit={(e) => void handleAdminLogin(e)} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
            <input
              type="password"
              inputMode="numeric"
              placeholder="Admin PIN"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${adminError ? 'border-red-400' : 'border-gray-200'}`}
              autoFocus
            />
            {adminError && <p className="text-red-500 text-xs">Incorrect admin PIN.</p>}
            <button
              type="submit"
              disabled={!adminPin.trim() || adminLoading}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm disabled:opacity-50 active:bg-blue-700"
            >
              {adminLoading ? 'Checking…' : 'Unlock Admin'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Admin Settings</h2>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Admin</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-4">
        <ChangePinCard settingKey="access_pin" label="Change Access PIN" />
        <ChangePinCard settingKey="admin_pin" label="Change Admin PIN" />
        <ExportCard />

        <div className="space-y-2 pt-2">
          <button
            className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm active:bg-gray-200"
            onClick={onAdminLogout}
          >
            Lock Admin
          </button>
          <button
            className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium text-sm active:bg-red-100"
            onClick={onAppLogout}
          >
            Sign Out (Clear Cached PIN)
          </button>
        </div>
      </div>
    </div>
  )
}

function ChangePinCard({ settingKey, label }: { settingKey: string; label: string }) {
  const [newPin, setNewPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!newPin.trim()) return
    if (newPin !== confirm) {
      toast.error('PINs do not match.')
      return
    }
    setSaving(true)
    await setSetting(settingKey, newPin)
    toast.success(`${label} updated.`)
    setNewPin('')
    setConfirm('')
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
      <p className="font-semibold text-sm">{label}</p>
      <input
        type="password"
        inputMode="numeric"
        placeholder="New PIN"
        value={newPin}
        onChange={(e) => setNewPin(e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="password"
        inputMode="numeric"
        placeholder="Confirm PIN"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        disabled={!newPin.trim() || saving}
        className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 active:bg-blue-700"
        onClick={() => void save()}
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  )
}

function ExportCard() {
  const [exporting, setExporting] = useState(false)

  async function exportCSV() {
    setExporting(true)
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('date_added', { ascending: false })

    if (error || !data) {
      toast.error('Export failed.')
      setExporting(false)
      return
    }

    const books = data as Book[]
    const headers = ['id', 'isbn', 'title', 'author', 'category', 'status', 'date_added', 'date_out', 'notes']
    const rows = books.map((b) =>
      headers.map((h) => {
        const val = b[h as keyof Book]
        if (val == null) return ''
        return `"${String(val).replace(/"/g, '""')}"`
      }).join(',')
    )

    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cb-friends-inventory-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
    toast.success('CSV downloaded.')
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
      <p className="font-semibold text-sm">Export Data</p>
      <p className="text-xs text-gray-500">Download all books (all statuses) as a CSV file.</p>
      <button
        disabled={exporting}
        className="w-full py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold disabled:opacity-50 active:bg-gray-900"
        onClick={() => void exportCSV()}
      >
        {exporting ? 'Exporting…' : 'Download CSV'}
      </button>
    </div>
  )
}

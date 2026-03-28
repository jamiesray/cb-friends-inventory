import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import { PinEntry } from './pages/PinEntry'
import { ScanIn } from './pages/ScanIn'
import { ScanOut } from './pages/ScanOut'
import { Inventory } from './pages/Inventory'
import { Dashboard } from './pages/Dashboard'
import { Settings } from './pages/Settings'
import { BottomNav } from './components/BottomNav'
import { useState } from 'react'
import type { Tab } from './types'

export default function App() {
  const { isAuthenticated, isAdmin, loading, login, loginAdmin, logoutAdmin, logout } = useAuth()
  const [tab, setTab] = useState<Tab>('scan-in')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="text-white text-sm animate-pulse">Loading…</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <>
        <PinEntry onSuccess={login} />
        <Toaster position="top-center" />
      </>
    )
  }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-gray-50">
      <main className="flex-1 overflow-hidden flex flex-col pb-16">
        {tab === 'scan-in' && <ScanIn />}
        {tab === 'scan-out' && <ScanOut />}
        {tab === 'inventory' && <Inventory isAdmin={isAdmin} />}
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'settings' && (
          <Settings
            isAdmin={isAdmin}
            onAdminLogin={loginAdmin}
            onAdminLogout={logoutAdmin}
            onAppLogout={logout}
          />
        )}
      </main>

      <BottomNav active={tab} onTab={setTab} isAdmin={isAdmin} />
      <Toaster
        position="top-center"
        toastOptions={{
          style: { borderRadius: '12px', fontSize: '14px' },
          duration: 2500,
        }}
      />
    </div>
  )
}

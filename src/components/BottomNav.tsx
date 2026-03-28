import type { Tab } from '../types'

interface BottomNavProps {
  active: Tab
  onTab: (tab: Tab) => void
  isAdmin: boolean
}

export function BottomNav({ active, onTab, isAdmin }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        <NavButton
          label="Scan In"
          tab="scan-in"
          active={active}
          onTab={onTab}
          icon={<PlusIcon />}
        />
        <NavButton
          label="Scan Out"
          tab="scan-out"
          active={active}
          onTab={onTab}
          icon={<CartIcon />}
        />
        <NavButton
          label="Inventory"
          tab="inventory"
          active={active}
          onTab={onTab}
          icon={<ListIcon />}
        />
        <NavButton
          label="Dashboard"
          tab="dashboard"
          active={active}
          onTab={onTab}
          icon={<ChartIcon />}
        />
        <NavButton
          label="Admin"
          tab="settings"
          active={active}
          onTab={onTab}
          icon={<GearIcon />}
          badge={isAdmin}
        />
      </div>
    </nav>
  )
}

interface NavButtonProps {
  label: string
  tab: Tab
  active: Tab
  onTab: (tab: Tab) => void
  icon: React.ReactNode
  badge?: boolean
}

function NavButton({ label, tab, active, onTab, icon, badge }: NavButtonProps) {
  const isActive = active === tab
  return (
    <button
      className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative ${
        isActive ? 'text-blue-600' : 'text-gray-400'
      }`}
      onClick={() => onTab(tab)}
    >
      <span className="text-xl relative">
        {icon}
        {badge && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}

function PlusIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

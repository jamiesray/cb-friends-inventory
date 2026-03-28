import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { supabase } from '../lib/supabase'
import { monthsAgo } from '../components/AgeBadge'
import type { Book } from '../types'

interface Stats {
  inStock: number
  soldThisMonth: number
  revenueThisMonth: number
  agedOut: number
}

interface ChartData {
  month: string
  sold: number
}

export function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)

      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [inStockRes, soldMonthRes, soldHistoryRes] = await Promise.all([
        supabase.from('books').select('date_added, status').eq('status', 'in_stock'),
        supabase
          .from('books')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'sold')
          .gte('date_out', startOfMonth),
        supabase
          .from('books')
          .select('date_out')
          .eq('status', 'sold')
          .gte('date_out', sixMonthsAgo()),
      ])

      const inStockBooks = (inStockRes.data ?? []) as Pick<Book, 'date_added' | 'status'>[]
      const soldCount = soldMonthRes.count ?? 0
      const soldHistory = (soldHistoryRes.data ?? []) as Pick<Book, 'date_out'>[]

      const agedOut = inStockBooks.filter((b) => monthsAgo(b.date_added) >= 12).length

      setStats({
        inStock: inStockBooks.length,
        soldThisMonth: soldCount,
        revenueThisMonth: soldCount,
        agedOut,
      })

      setChartData(buildChartData(soldHistory))
      setLoading(false)
    }
    void load()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading dashboard…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <header className="px-4 pt-4 pb-2">
        <h2 className="text-xl font-bold">Dashboard</h2>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-24 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="In Stock"
            value={stats?.inStock ?? 0}
            icon="📚"
            color="bg-blue-50 text-blue-700"
          />
          <StatCard
            label="Aged Out"
            value={stats?.agedOut ?? 0}
            icon="🔴"
            color="bg-red-50 text-red-700"
          />
          <StatCard
            label="Sold This Month"
            value={stats?.soldThisMonth ?? 0}
            icon="✅"
            color="bg-green-50 text-green-700"
          />
          <StatCard
            label="Revenue This Month"
            value={`$${stats?.revenueThisMonth.toFixed(2) ?? '0.00'}`}
            icon="💵"
            color="bg-emerald-50 text-emerald-700"
          />
        </div>

        {/* Sales chart */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-700 mb-4">Books Sold — Last 6 Months</p>
          {chartData.every((d) => d.sold === 0) ? (
            <div className="text-center py-8 text-gray-400 text-sm">No sales data yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  formatter={(value: number) => [value, 'Sold']}
                />
                <Bar dataKey="sold" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: string; color: string }) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold leading-tight">{value}</div>
      <div className="text-xs font-medium mt-0.5 opacity-75">{label}</div>
    </div>
  )
}

function sixMonthsAgo(): string {
  const d = new Date()
  d.setMonth(d.getMonth() - 6)
  return d.toISOString()
}

function buildChartData(sold: Pick<Book, 'date_out'>[]): ChartData[] {
  const months: ChartData[] = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleString('default', { month: 'short' })
    const count = sold.filter((b) => {
      if (!b.date_out) return false
      const out = new Date(b.date_out)
      return out.getFullYear() === d.getFullYear() && out.getMonth() === d.getMonth()
    }).length
    months.push({ month: label, sold: count })
  }

  return months
}

import { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from './config'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

function Reports() {
  const [monthlyData, setMonthlyData] = useState([])
  const [comparison, setComparison] = useState(null)
  const [topCategories, setTopCategories] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    fetchReportsData()
  }, [selectedYear, selectedMonth])

  const fetchReportsData = async () => {
    try {
      setLoading(true)
      
      // Parallel Data Fetching (Optimization)
      const [monthlyResponse, comparisonResponse, topCategoriesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/transactions/reports/monthly?months=6`),
        axios.get(`${API_BASE_URL}/transactions/reports/comparison?year=${selectedYear}&month=${selectedMonth}`),
        axios.get(`${API_BASE_URL}/transactions/reports/top-categories?year=${selectedYear}&month=${selectedMonth}&limit=5`)
      ])

      setMonthlyData(monthlyResponse.data)
      setComparison(comparisonResponse.data)
      setTopCategories(topCategoriesResponse.data)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper for text colors
  const getGrowthColor = (value) => {
    if (value > 0) return 'text-green-600 dark:text-green-400'
    if (value < 0) return 'text-red-600 dark:text-red-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getGrowthIcon = (value) => {
    if (value > 0) return '↑'
    if (value < 0) return '↓'
    return '•'
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-xl text-gray-600 dark:text-gray-300">Analyzing financial data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-slide-up pb-10">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Financial Analytics</h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Deep dive into your spending patterns</p>
        </div>

        <div className="flex gap-3 bg-white dark:bg-gray-800 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white font-medium cursor-pointer"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month} className="dark:bg-gray-800">
                {new Date(2024, month - 1).toLocaleString('default', { month: 'short' })}
              </option>
            ))}
          </select>

          <div className="w-px bg-gray-200 dark:bg-gray-700"></div>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white font-medium cursor-pointer"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year} className="dark:bg-gray-800">{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Cards */}
      {comparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Month - Featured */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl p-6 text-white transform hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-blue-100 font-medium">Current Period</h4>
              <span className="bg-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                {comparison.currentMonth.period}
              </span>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-blue-200 text-sm mb-1">Income</p>
                <p className="text-2xl font-bold">₹{comparison.currentMonth.income.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-blue-200 text-sm mb-1">Expense</p>
                <p className="text-2xl font-bold text-red-200">₹{comparison.currentMonth.expense.toFixed(2)}</p>
              </div>
              <div className="pt-4 border-t border-blue-500/30">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 font-medium">Net Balance</span>
                  <span className="text-2xl font-bold">₹{comparison.currentMonth.balance.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Previous Month */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-gray-500 dark:text-gray-400 font-medium">vs. Last Month</h4>
              <span className="text-sm text-gray-400 dark:text-gray-500">{comparison.previousMonth.period}</span>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Income Change</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">₹{comparison.previousMonth.income.toFixed(0)}</p>
                </div>
                <div className={`flex items-center gap-1 font-bold ${getGrowthColor(comparison.growth.incomeVsPrevious)}`}>
                  <span>{getGrowthIcon(comparison.growth.incomeVsPrevious)}</span>
                  <span>{Math.abs(comparison.growth.incomeVsPrevious).toFixed(1)}%</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expense Change</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">₹{comparison.previousMonth.expense.toFixed(0)}</p>
                </div>
                <div className={`flex items-center gap-1 font-bold ${getGrowthColor(-comparison.growth.expenseVsPrevious)}`}>
                  <span>{getGrowthIcon(-comparison.growth.expenseVsPrevious)}</span>
                  <span>{Math.abs(comparison.growth.expenseVsPrevious).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Last Year */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-gray-500 dark:text-gray-400 font-medium">vs. Last Year</h4>
              <span className="text-sm text-gray-400 dark:text-gray-500">{comparison.lastYearMonth.period}</span>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Income Change</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">₹{comparison.lastYearMonth.income.toFixed(0)}</p>
                </div>
                <div className={`flex items-center gap-1 font-bold ${getGrowthColor(comparison.growth.incomeVsLastYear)}`}>
                  <span>{getGrowthIcon(comparison.growth.incomeVsLastYear)}</span>
                  <span>{Math.abs(comparison.growth.incomeVsLastYear).toFixed(1)}%</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expense Change</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">₹{comparison.lastYearMonth.expense.toFixed(0)}</p>
                </div>
                <div className={`flex items-center gap-1 font-bold ${getGrowthColor(-comparison.growth.expenseVsLastYear)}`}>
                  <span>{getGrowthIcon(-comparison.growth.expenseVsLastYear)}</span>
                  <span>{Math.abs(comparison.growth.expenseVsLastYear).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trend Chart */}
      {monthlyData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">6-Month Financial Trend</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis 
                  dataKey="monthLabel" 
                  stroke="#6B7280" 
                  tick={{fill: '#6B7280'}}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6B7280" 
                  tick={{fill: '#6B7280'}}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#E5E7EB' }}
                />
                <Legend iconType="circle" />
                <Line 
                  type="monotone" 
                  dataKey="totalIncome" 
                  name="Income"
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} 
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="totalExpense" 
                  name="Expense"
                  stroke="#ef4444" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} 
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Categories Grid */}
      {topCategories && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Expenses */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-red-500 rounded-full"></span>
              Top Expenses
            </h3>
            <div className="space-y-4">
              {topCategories.topExpenses.map((category, index) => (
                <div key={index} className="relative group">
                  <div className="flex items-center justify-between mb-1 relative z-10">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 dark:text-gray-400 font-mono text-sm">0{index + 1}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 dark:text-white block">₹{category.total.toFixed(0)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{category.count} txns</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Income */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-green-500 rounded-full"></span>
              Top Income Sources
            </h3>
            <div className="space-y-4">
              {topCategories.topIncome.map((category, index) => (
                <div key={index} className="relative group">
                  <div className="flex items-center justify-between mb-1 relative z-10">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 dark:text-gray-400 font-mono text-sm">0{index + 1}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900 dark:text-white block">₹{category.total.toFixed(0)}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{category.count} txns</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reports
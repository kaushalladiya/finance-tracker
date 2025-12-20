import { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from './config'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { useAuth } from './contexts/AuthContext'

function Dashboard() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
  
  // Form State
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Expense',
    category: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Filters
  const [filters, setFilters] = useState({
    type: 'All',
    category: 'All',
    startDate: '',
    endDate: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  
  // Toast
  const [toast, setToast] = useState({ show: false, message: '', type: '' })

  const showToast = (message, type) => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: '' })
    }, 3000)
  }

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`${API_BASE_URL}/transactions`)
      setTransactions(response.data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setError('Failed to load transactions. API might be down.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      const transactionData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        type: formData.type,
        category: formData.category
      }
      
      if (editingTransaction) {
        transactionData.id = editingTransaction.id
        await axios.put(`${API_BASE_URL}/transactions/${editingTransaction.id}`, transactionData)
      } else {
        await axios.post(`${API_BASE_URL}/transactions`, transactionData)
      }
      
      handleCloseModal()
      fetchTransactions()
      showToast(editingTransaction ? 'Updated successfully!' : 'Added successfully!', 'success')
    } catch (error) {
      console.error('Error saving:', error)
      showToast('Failed to save transaction.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      setIsDeleting(true)
      await axios.delete(`${API_BASE_URL}/transactions/${id}`)
      setDeleteId(null)
      fetchTransactions()
      showToast('Deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting:', error)
      showToast('Failed to delete.', 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      date: new Date(transaction.date).toISOString().split('T')[0],
      type: transaction.type,
      category: transaction.category
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTransaction(null)
    setFormData({
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      type: 'Expense',
      category: ''
    })
  }

  // Calculations
  const totalIncome = transactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = transactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpenses
  const uniqueCategories = [...new Set(transactions.map(t => t.category))].sort()

  // Filtering Logic
  const filteredTransactions = transactions.filter(transaction => {
    if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) return false
    if (filters.type !== 'All' && transaction.type !== filters.type) return false
    if (filters.category !== 'All' && transaction.category !== filters.category) return false
    if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) return false
    if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) return false
    return true
  })

  // Chart Data
  const expenseByCategory = transactions
    .filter(t => t.type === 'Expense')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
      return acc
    }, {})

  const expenseChartData = Object.entries(expenseByCategory)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  const comparisonData = [
    { name: 'Income', amount: totalIncome, color: '#10b981' },
    { name: 'Expenses', amount: totalExpenses, color: '#ef4444' }
  ]

  const clearFilters = () => {
    setFilters({ type: 'All', category: 'All', startDate: '', endDate: '' })
    setSearchTerm('')
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-pulse">
      <div className="text-4xl mb-4">💰</div>
      <div className="text-lg text-gray-500 font-mono">Loading your vault...</div>
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="text-4xl mb-4 text-red-500">⚠️</div>
      <div className="text-lg text-red-600 font-bold mb-2">Connection Error</div>
      <p className="text-gray-500">{error}</p>
    </div>
  )

  // Smart Empty State
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-6 animate-slide-up">
        <div className="bg-blue-50 dark:bg-gray-800 p-8 rounded-full">
          <span className="text-6xl">📊</span>
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome, {user?.username}!</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Your financial dashboard is looking a bit empty. Add your first transaction to unlock powerful insights and charts.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 flex items-center gap-2 group"
        >
          <span>+ Add First Transaction</span>
          <span className="group-hover:rotate-90 transition-transform duration-200">➔</span>
        </button>

        {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 text-left">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-slide-up">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Add Transaction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" required className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              <input name="amount" type="number" step="0.01" value={formData.amount} onChange={handleInputChange} placeholder="Amount" required className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              <input name="date" type="date" value={formData.date} onChange={handleInputChange} required className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="flex gap-4">
                <select name="type" value={formData.type} onChange={handleInputChange} className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Expense</option><option>Income</option>
                </select>
                <input name="category" value={formData.category} onChange={handleInputChange} placeholder="Category" required className="flex-1 p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-3 border rounded-lg text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg">{isSubmitting ? 'Saving...' : 'Save Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    )
  }

  // STANDARD DASHBOARD UI
  return (
    <div className="space-y-6 animate-slide-up pb-12">
      {/* Header with Welcome Message */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Welcome back, {user?.username}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all flex items-center gap-2"
        >
          <span>+</span> <span className="hidden sm:inline">Add Transaction</span>
        </button>
      </div>

      {/* Stats Cards - Removed 'font-mono' so it uses global Cascadia Code */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-6 text-white transform hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold opacity-90">Total Income</h3>
            <span className="text-3xl opacity-80">💰</span>
          </div>
          <p className="text-3xl font-bold mb-2">₹{totalIncome.toFixed(2)}</p>
          <p className="text-sm opacity-75">{transactions.filter(t => t.type === 'Income').length} transactions</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-lg p-6 text-white transform hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold opacity-90">Total Expenses</h3>
            <span className="text-3xl opacity-80">💸</span>
          </div>
          <p className="text-3xl font-bold mb-2">₹{totalExpenses.toFixed(2)}</p>
          <p className="text-sm opacity-75">{transactions.filter(t => t.type === 'Expense').length} transactions</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white transform hover:scale-[1.02] transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold opacity-90">Balance</h3>
            <span className="text-3xl opacity-80">💵</span>
          </div>
          <p className="text-3xl font-bold mb-2">₹{balance.toFixed(2)}</p>
          <p className="text-sm opacity-75">{balance >= 0 ? 'Surplus' : 'Deficit'}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Expense Breakdown</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `₹${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#1f2937', color: '#fff', border: 'none', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Income vs Expenses</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="name" stroke="#6b7280" tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7280" tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#1f2937', color: '#fff', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-96">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Income">Income</option>
              <option value="Expense">Expense</option>
            </select>

            <select 
              value={filters.category}
              onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))}
              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-none rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {['Date', 'Description', 'Category', 'Type', 'Amount', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => {
                const isIncome = transaction.type === 'Income'
                return (
                  <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-mono">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isIncome ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold font-mono ${isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {isIncome ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(transaction)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Edit</button>
                      <button onClick={() => setDeleteId(transaction.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Delete</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No transactions match your search.
            </div>
          )}
        </div>
      </div>

      {/* Modals & Toast */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b pb-4 dark:border-gray-700">
              {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <input name="description" value={formData.description} onChange={handleInputChange} placeholder="e.g. Grocery Shopping" required className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                   <input name="amount" type="number" step="0.01" value={formData.amount} onChange={handleInputChange} placeholder="0.00" required className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono" />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                   <input name="date" type="date" value={formData.date} onChange={handleInputChange} required className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange} className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all">
                    <option>Expense</option><option>Income</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <input name="category" value={formData.category} onChange={handleInputChange} placeholder="e.g. Food" required className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={handleCloseModal} className="flex-1 py-3 border rounded-lg text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md hover:shadow-lg transition-all">{isSubmitting ? 'Saving...' : 'Save Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-sm w-full text-center shadow-2xl animate-slide-up">
            <div className="text-5xl mb-4">🗑️</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Transaction?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone. Are you sure?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border rounded-lg text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md">{isDeleting ? '...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl text-white font-medium flex items-center gap-3 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} animate-slide-up`}>
          <span>{toast.type === 'success' ? '✅' : '❌'}</span>
          {toast.message}
        </div>
      )}
    </div>
  )
}

export default Dashboard
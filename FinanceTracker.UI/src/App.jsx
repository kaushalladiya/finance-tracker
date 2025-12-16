import { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from './config'

function App() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)
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
  const [filters, setFilters] = useState({
    type: 'All',
    category: 'All',
    startDate: '',
    endDate: ''
  })
  
  const [searchTerm, setSearchTerm] = useState('')
  
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
      setError('Failed to load transactions. Make sure your backend API is running on port 5260.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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
      showToast(
        editingTransaction ? 'Transaction updated successfully!' : 'Transaction added successfully!',
        'success'
      )
      
    } catch (error) {
      console.error('Error saving transaction:', error)
      showToast('Failed to save transaction. Please try again.', 'error')
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
      showToast('Transaction deleted successfully!', 'success')
    } catch (error) {
      console.error('Error deleting transaction:', error)
      showToast('Failed to delete transaction. Please try again.', 'error')
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

  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  const uniqueCategories = [...new Set(transactions.map(t => t.category))].sort()

  const filteredTransactions = transactions.filter(transaction => {
    // Search filter
    if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    if (filters.type !== 'All' && transaction.type !== filters.type) {
      return false
    }
    if (filters.category !== 'All' && transaction.category !== filters.category) {
      return false
    }
    if (filters.startDate) {
      const transactionDate = new Date(transaction.date)
      const filterStartDate = new Date(filters.startDate)
      if (transactionDate < filterStartDate) {
        return false
      }
    }
    if (filters.endDate) {
      const transactionDate = new Date(transaction.date)
      const filterEndDate = new Date(filters.endDate)
      if (transactionDate > filterEndDate) {
        return false
      }
    }
    return true
  })

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      type: 'All',
      category: 'All',
      startDate: '',
      endDate: ''
    })
    setSearchTerm('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">{error}</div>
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Finance Tracker</h1>
          <p className="mt-2 text-gray-600">Track your income and expenses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold opacity-90">Total Income</h3>
              <span className="text-3xl">💰</span>
            </div>
            <p className="text-3xl font-bold mb-2">₹{totalIncome.toFixed(2)}</p>
            <p className="text-sm opacity-75">{transactions.filter(t => t.type === 'Income').length} transactions</p>
          </div>

          <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold opacity-90">Total Expenses</h3>
              <span className="text-3xl">💸</span>
            </div>
            <p className="text-3xl font-bold mb-2">₹{totalExpenses.toFixed(2)}</p>
            <p className="text-sm opacity-75">{transactions.filter(t => t.type === 'Expense').length} transactions</p>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold opacity-90">Balance</h3>
              <span className="text-3xl">💵</span>
            </div>
            <p className="text-3xl font-bold mb-2">₹{balance.toFixed(2)}</p>
            <p className="text-sm opacity-75">{balance >= 0 ? 'Surplus' : 'Deficit'}</p>
          </div>
        </div>

        <div className="mb-6 flex justify-between items-center gap-4">
          {/* Search Bar */}
          <div className="flex-1 max-w-md relative">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Add Transaction Button */}
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All</option>
                <option value="Income">Income</option>
                <option value="Expense">Expense</option>
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex-shrink-0">
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {searchTerm ? (
                <span>Found <span className="font-semibold text-blue-600">{filteredTransactions.length}</span> results for "{searchTerm}"</span>
              ) : (
                <span>Showing <span className="font-semibold">{filteredTransactions.length}</span> of <span className="font-semibold">{transactions.length}</span> transactions</span>
              )}
            </div>
            {(filters.type !== 'All' || filters.category !== 'All' || filters.startDate || filters.endDate || searchTerm) && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear all filters
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                {transactions.length === 0 ? (
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {transactions.length === 0 ? "No transactions yet" : "No results found"}
              </h3>
              <p className="text-gray-500 mb-6">
                {transactions.length === 0 
                  ? "Start tracking your finances by adding your first transaction"
                  : `No transactions match your ${searchTerm ? 'search' : 'filters'}. Try adjusting your criteria.`}
              </p>
              {transactions.length === 0 && (
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Transaction
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => {
                    const isIncome = transaction.type === 'Income'
                    const badgeClass = isIncome 
                      ? 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800'
                      : 'px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800'
                    const amountClass = isIncome ? 'text-green-600' : 'text-red-600'

                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{transaction.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={badgeClass}>{transaction.type}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          <span className={amountClass}>₹{transaction.amount.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="text-blue-600 hover:text-blue-900 font-semibold mr-4 transition-colors duration-150"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteId(transaction.id)}
                            className="text-red-600 hover:text-red-900 font-semibold transition-colors duration-150"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Grocery Shopping"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Food, Salary, Transport"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (editingTransaction ? 'Updating...' : 'Adding...') : (editingTransaction ? 'Update Transaction' : 'Add Transaction')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Transaction</h3>
              <p className="text-sm text-gray-500 text-center">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 p-6 pt-0">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
          <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
            toast.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {toast.type === 'success' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
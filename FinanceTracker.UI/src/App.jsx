import { useState, useEffect } from 'react'
import axios from 'axios'
import API_BASE_URL from './config'

function App() {
  // State for transactions list
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // State for modal visibility
  const [showModal, setShowModal] = useState(false)
  
  // State for form inputs
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    type: 'Expense',
    category: ''
  })
  
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // State for delete confirmation
  const [deleteId, setDeleteId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch transactions when component loads
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

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      // Prepare data for API
      const transactionData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        type: formData.type,
        category: formData.category
      }
      
      // Send to backend
      await axios.post(`${API_BASE_URL}/transactions`, transactionData)
      
      // Success! Close modal and refresh list
      setShowModal(false)
      fetchTransactions()
      
      // Reset form
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Expense',
        category: ''
      })
      
    } catch (error) {
      console.error('Error creating transaction:', error)
      alert('Failed to create transaction. Please check your input.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete transaction
  const handleDelete = async (id) => {
    try {
      setIsDeleting(true)
      await axios.delete(`${API_BASE_URL}/transactions/${id}`)
      
      // Success! Close confirmation and refresh list
      setDeleteId(null)
      fetchTransactions()
    } catch (error) {
      console.error('Error deleting transaction:', error)
      alert('Failed to delete transaction. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  // Calculate summary statistics
  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Finance Tracker
          </h1>
          <p className="mt-2 text-gray-600">
            Track your income and expenses
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Income Card */}
          <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold opacity-90">Total Income</h3>
              <span className="text-3xl">💰</span>
            </div>
            <p className="text-3xl font-bold mb-2">₹{totalIncome.toFixed(2)}</p>
            <p className="text-sm opacity-75">{transactions.filter(t => t.type === 'Income').length} transactions</p>
          </div>

          {/* Total Expenses Card */}
          <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold opacity-90">Total Expenses</h3>
              <span className="text-3xl">💸</span>
            </div>
            <p className="text-3xl font-bold mb-2">₹{totalExpenses.toFixed(2)}</p>
            <p className="text-sm opacity-75">{transactions.filter(t => t.type === 'Expense').length} transactions</p>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold opacity-90">Balance</h3>
              <span className="text-3xl">💵</span>
            </div>
            <p className="text-3xl font-bold mb-2">₹{balance.toFixed(2)}</p>
            <p className="text-sm opacity-75">{balance >= 0 ? 'Surplus' : 'Deficit'}</p>
          </div>
        </div>

        {/* Add Transaction Button */}
        <div className="mb-6 flex justify-end">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Finance Tracker
            </h1>
            <p className="mt-2 text-gray-600">
              Track your income and expenses
            </p>
          </div>
          
          {/* Add Transaction Button */}
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200"
          >
            + Add Transaction
          </button>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                No transactions yet. Add your first transaction!
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Add Transaction
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction) => {
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
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={badgeClass}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                          <span className={amountClass}>
                            ₹{transaction.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

      {/* Modal - Add Transaction Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Add Transaction
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Body - Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
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

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount *
                </label>
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

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
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

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
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

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? 'Adding...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full transform transition-all">
            {/* Modal Header */}
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Transaction
              </h3>
              <p className="text-sm text-gray-500 text-center">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </p>
            </div>

            {/* Modal Actions */}
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
    </div>
  )
}

export default App
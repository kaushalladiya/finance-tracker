/**
 * Format date to dd-mm-yyyy format
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string (dd-mm-yyyy)
 */
export const formatDate = (date) => {
  const d = new Date(date)
  
  // Get day, month, year
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')  // Month is 0-indexed
  const year = d.getFullYear()
  
  return `${day}-${month}-${year}`
}

/**
 * Format date for input[type="date"] (yyyy-mm-dd)
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string (yyyy-mm-dd)
 */
export const formatDateForInput = (date) => {
  const d = new Date(date)
  return d.toISOString().split('T')[0]
}
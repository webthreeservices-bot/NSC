// Test the actual formatDateUtil function
const formatDate = (date, fallback = 'N/A') => {
  if (!date) {
    console.log('  → Date is falsy, returning fallback')
    return fallback
  }
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date)
    console.log('  → Created Date object:', dateObj)
    console.log('  → getTime():', dateObj.getTime())
    console.log('  → isNaN check:', isNaN(dateObj.getTime()))
    
    if (isNaN(dateObj.getTime())) {
      console.log('  → Invalid date, returning fallback')
      return fallback
    }
    
    const timestamp = dateObj.getTime()
    console.log('  → Timestamp:', timestamp)
    console.log('  → Is < 86400000?', timestamp < 86400000)
    
    // Check if date is epoch (Jan 1, 1970) or before - likely invalid
    if (timestamp < 86400000) { // Less than 1 day after epoch
      console.log('  → Epoch detected, returning fallback')
      return fallback
    }
    
    const result = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    console.log('  → Formatted result:', result)
    return result
  } catch (error) {
    console.log('  → Error:', error.message)
    return fallback
  }
}

console.log('Test 1: Valid ISO string from API')
console.log('Input:', '2025-11-05T18:06:22.913Z')
const result1 = formatDate('2025-11-05T18:06:22.913Z')
console.log('Result:', result1)

console.log('\n\nTest 2: null value')
console.log('Input:', null)
const result2 = formatDate(null)
console.log('Result:', result2)

console.log('\n\nTest 3: Empty string')
console.log('Input:', '')
const result3 = formatDate('')
console.log('Result:', result3)

console.log('\n\nTest 4: "N/A" string (what dashboard passes if null)')
console.log('Input:', 'N/A')
const result4 = formatDate('N/A')
console.log('Result:', result4)

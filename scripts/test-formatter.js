// Test the formatDate logic
const testDate = '2025-11-05T16:51:11.054Z'

console.log('Testing formatDate logic:\n')

// Simulate what formatDate does
function formatDate(date, fallback = 'N/A') {
  if (!date) {
    console.log('Step 1: No date provided, returning fallback')
    return fallback
  }
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date)
    console.log('Step 2: Created Date object:', dateObj)
    console.log('Step 3: isNaN check:', isNaN(dateObj.getTime()))
    
    if (isNaN(dateObj.getTime())) {
      console.log('Step 4: Invalid date, returning fallback')
      return fallback
    }
    
    const timestamp = dateObj.getTime()
    console.log('Step 5: Timestamp:', timestamp)
    console.log('Step 6: Is timestamp < 86400000?', timestamp < 86400000)
    
    // Check if date is epoch (Jan 1, 1970) or before - likely invalid
    if (timestamp < 86400000) { // Less than 1 day after epoch
      console.log('Step 7: Epoch detected, returning fallback')
      return fallback
    }
    
    const formatted = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    console.log('Step 8: Formatted result:', formatted)
    return formatted
  } catch (error) {
    console.log('Error caught:', error.message)
    return fallback
  }
}

console.log('\nTest 1: ISO String')
console.log('Result:', formatDate(testDate))

console.log('\n\nTest 2: Date Object')
console.log('Result:', formatDate(new Date(testDate)))

console.log('\n\nTest 3: null')
console.log('Result:', formatDate(null))

console.log('\n\nTest 4: undefined')
console.log('Result:', formatDate(undefined))

console.log('\n\nTest 5: Invalid string')
console.log('Result:', formatDate('invalid'))

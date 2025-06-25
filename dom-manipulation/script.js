// Initial quotes array
let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');

// Load quotes from local storage
function loadQuotes() {
  const savedQuotes = localStorage.getItem('quotes');
  if (savedQuotes) {
    quotes = JSON.parse(savedQuotes);
  } else {
    // Default quotes if none in storage
    quotes = [
      { text: "The only way to do great work is to love what you do.", category: "work" },
      { text: "Life is what happens when you're busy making other plans.", category: "life" },
      { text: "In the middle of difficulty lies opportunity.", category: "inspiration" },
      { text: "Simplicity is the ultimate sophistication.", category: "design" },
      { text: "The best way to predict the future is to invent it.", category: "technology" }
    ];
    saveQuotes();
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Display a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = '<p>No quotes available. Add some quotes!</p>';
    return;
  }
  
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <em>- ${quote.category}</em>
  `;
  
  // Store last viewed quote in session storage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Add a new quote
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  
  if (textInput.value.trim() === '' || categoryInput.value.trim() === '') {
    alert('Please enter both quote text and category');
    return;
  }
  
  const newQuote = {
    text: textInput.value,
    category: categoryInput.value.toLowerCase()
  };
  
  quotes.push(newQuote);
  saveQuotes();
  
  // Update categories dropdown if this is a new category
  const categoryExists = quotes.some(q => q.category === newQuote.category);
  if (!categoryExists) {
    populateCategories();
  }
  
  textInput.value = '';
  categoryInput.value = '';
  
  filterQuotes(); // Show a quote from the current filter
}

// Export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileDefaultName = 'quotes.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes = importedQuotes;
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert(`Successfully imported ${importedQuotes.length} quotes!`);
      } else {
        alert('Invalid format: Expected an array of quotes');
      }
    } catch (error) {
      alert('Error parsing JSON file: ' + error.message);
    }
  };
  reader.readAsText(file);
}

// Populate categories dropdown
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  
  // Clear existing options except "All Categories"
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }
  
  // Get unique categories
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Add category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  // Restore last selected filter if available
  const lastFilter = localStorage.getItem('lastCategoryFilter');
  if (lastFilter) {
    categoryFilter.value = lastFilter;
    filterQuotes();
  }
}

// Filter quotes based on selected category
function filterQuotes() {
  const categoryFilter = document.getElementById('categoryFilter');
  const selectedCategory = categoryFilter.value;
  
  // Save selected filter
  localStorage.setItem('lastCategoryFilter', selectedCategory);
  
  if (selectedCategory === 'all') {
    showRandomQuote();
  } else {
    const filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    if (filteredQuotes.length === 0) {
      quoteDisplay.innerHTML = `<p>No quotes in category "${selectedCategory}".</p>`;
    } else {
      const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
      const quote = filteredQuotes[randomIndex];
      quoteDisplay.innerHTML = `
        <p>"${quote.text}"</p>
        <em>- ${quote.category}</em>
      `;
    }
  }
}

// Simulate server interaction
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Using a mock API

// Sync with server (simulated)
async function syncWithServer() {
  try {
    // Simulate getting data from server
    const response = await fetch(SERVER_URL);
    if (!response.ok) throw new Error('Server error');
    
    const serverData = await response.json();
    
    // In a real app, we'd have proper server-side logic
    // For simulation, we'll just merge any new quotes
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: 'server'
    }));
    
    // Merge strategy: keep both local and server quotes, but avoid duplicates
    const newQuotes = serverQuotes.filter(serverQuote => 
      !quotes.some(localQuote => localQuote.text === serverQuote.text)
    );
    
    if (newQuotes.length > 0) {
      quotes.push(...newQuotes);
      saveQuotes();
      populateCategories();
      
      // Show notification
      const notification = document.createElement('div');
      notification.className = 'notification';
      notification.innerHTML = `
        <p>${newQuotes.length} new quotes added from server.</p>
        <button onclick="this.parentElement.remove()">Dismiss</button>
      `;
      document.body.appendChild(notification);
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 5000);
    }
  } catch (error) {
    console.error('Sync failed:', error);
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
      <p>Sync failed: ${error.message}</p>
      <button onclick="this.parentElement.remove()">Dismiss</button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }
}

// Event listeners
newQuoteBtn.addEventListener('click', showRandomQuote);

// Initialize
loadQuotes();
populateCategories();
filterQuotes();

// Sync with server every 30 seconds
setInterval(syncWithServer, 30000);

// Initial sync
syncWithServer();

// Display last viewed quote from session if available
const lastQuote = sessionStorage.getItem('lastViewedQuote');
if (lastQuote) {
  const quote = JSON.parse(lastQuote);
  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <em>- ${quote.category}</em>
    <p><small>(Last viewed quote from this session)</small></p>
  `;
}

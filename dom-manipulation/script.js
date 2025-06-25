let quotes = [];
const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Load quotes from localStorage
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: "Success is not final, failure is not fatal.", category: "Motivation" },
      { text: "To be or not to be, that is the question.", category: "Philosophy" },
    ];
    saveQuotes();
  }
}

// Show a random quote
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filtered = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes in this category.";
    return;
  }

  const random = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${random.text}" - [${random.category}]`;
  sessionStorage.setItem('lastQuote', JSON.stringify(random));
}

// Add a new quote
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert("Please fill in both quote and category.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';

  postQuoteToServer(newQuote); // simulate sending new quote to server
  alert("Quote added successfully!");
}

// Populate category filter options
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem('selectedCategory');
  if (savedFilter) {
    categoryFilter.value = savedFilter;
  }
}

// Filter quotes by selected category
function filterQuotes() {
  localStorage.setItem('selectedCategory', categoryFilter.value);
  showRandomQuote();
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON structure.");
      }
    } catch {
      alert("Error parsing JSON file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Export quotes to a JSON file
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'quotes.json';
  link.click();
}

// ✅ POST quote to server (simulated using JSONPlaceholder)
async function postQuoteToServer(quote) {
  try {
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quote)
    });

    console.log('Quote sent to server (simulated)');
  } catch (err) {
    console.error('Failed to send quote to server:', err);
  }
}

// ✅ GET quotes from server and overwrite local data (simulate server taking priority)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const serverData = await response.json();

    const fetchedQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: 'Server'
    }));

    // Simulate conflict resolution: server overwrites local
    const oldCount = quotes.length;
    quotes = [...fetchedQuotes];
    saveQuotes();
    populateCategories();

    alert(`Conflict resolved: Server quotes (${fetchedQuotes.length}) replaced local quotes (${oldCount}).`);
  } catch (error) {
    console.error("Error syncing with server:", error);
  }
}

// On page load
window.onload = () => {
  loadQuotes();
  populateCategories();

  const lastQuote = sessionStorage.getItem('lastQuote');
  if (lastQuote) {
    const q = JSON.parse(lastQuote);
    quoteDisplay.textContent = `"${q.text}" - [${q.category}]`;
  }

  // Sync immediately and every 30 seconds
  fetchQuotesFromServer();
  setInterval(fetchQuotesFromServer, 30000);
};

// Events
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

let quotes = [];
const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');

// Save quotes
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Load quotes
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) {
    quotes = JSON.parse(stored);
  } else {
    quotes = [
      { text: "Success is not final, failure is not fatal.", category: "Motivation" },
      { text: "To be or not to be, that is the question.", category: "Philosophy" }
    ];
    saveQuotes();
  }
}

// Show random quote
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

// Add quote
function addQuote() {
  const text = document.getElementById('newQuoteText').value.trim();
  const category = document.getElementById('newQuoteCategory').value.trim();

  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  alert("Quote added.");

  // Post new quote
  postQuoteToServer(newQuote);
}

// Populate filter options
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

// Filter quotes
function filterQuotes() {
  localStorage.setItem('selectedCategory', categoryFilter.value);
  showRandomQuote();
}

// Import from JSON
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert("Quotes imported.");
      } else {
        alert("Invalid JSON.");
      }
    } catch {
      alert("Error reading file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// Export to JSON
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'quotes.json';
  link.click();
}

// ✅ POST to server
async function postQuoteToServer(quote) {
  try {
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quote)
    });
    console.log("Quote posted to server.");
  } catch (error) {
    console.error("Post failed:", error);
  }
}

// ✅ GET from server and overwrite local
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    const data = await response.json();

    const serverQuotes = data.slice(0, 5).map(post => ({
      text: post.title,
      category: 'Server'
    }));

    const oldCount = quotes.length;
    quotes = [...serverQuotes]; // server takes priority
    saveQuotes();
    populateCategories();

    // ✅ Required message
    alert("Quotes synced with server!");
    console.log("Quotes synced with server!");
  } catch (error) {
    console.error("Fetch failed:", error);
  }
}


async function syncQuotes() {
  await fetchQuotesFromServer(); // auto sync
}

// On load
window.onload = () => {
  loadQuotes();
  populateCategories();

  const lastQuote = sessionStorage.getItem('lastQuote');
  if (lastQuote) {
    const q = JSON.parse(lastQuote);
    quoteDisplay.textContent = `"${q.text}" - [${q.category}]`;
  }

  // Initial + periodic sync
  syncQuotes();
  setInterval(syncQuotes, 30000);
};

document.getElementById('newQuote').addEventListener('click', showRandomQuote);



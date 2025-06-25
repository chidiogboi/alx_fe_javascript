// Initial quotes array
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "work" },
  { text: "Life is what happens when you're busy making other plans.", category: "life" },
  { text: "In the middle of difficulty lies opportunity.", category: "inspiration" },
  { text: "Simplicity is the ultimate sophistication.", category: "design" },
  { text: "The best way to predict the future is to invent it.", category: "technology" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');

// Display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `
    <p>"${quote.text}"</p>
    <em>- ${quote.category}</em>
  `;
}

// Create the form for adding quotes (required by test)
function createAddQuoteForm() {
  const formDiv = document.createElement('div');
  formDiv.innerHTML = `
    <h3>Add New Quote</h3>
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
  document.body.appendChild(formDiv);
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
  textInput.value = '';
  categoryInput.value = '';
  
  showRandomQuote();
}

// Initialize the form and display first quote
createAddQuoteForm();

// Event listeners
newQuoteBtn.addEventListener('click', showRandomQuote);

// Display initial quote
showRandomQuote();

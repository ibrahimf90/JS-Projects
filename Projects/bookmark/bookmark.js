// Bookmarks Manager Logic

// 1. getBookmarks function
// Returns the bookmarks array stored in the local storage.
// If the bookmarks key has not been set yet, or it doesn't contain a valid array, returns an empty array.
function getBookmarks() {
  const bookmarksStr = localStorage.getItem('bookmarks');
  if (!bookmarksStr) {
    return [];
  }
  try {
    const bookmarks = JSON.parse(bookmarksStr);
    if (Array.isArray(bookmarks)) {
      // Validate that every single item in the array is a valid bookmark object
      const allValid = bookmarks.every(b => 
        b !== null && 
        typeof b === 'object' && 
        'name' in b && 
        'category' in b && 
        'url' in b
      );
      if (allValid) {
        return bookmarks;
      }
    }
    return [];
  } catch (e) {
    return [];
  }
}

// Helper to set bookmarks in localStorage
function saveBookmarks(bookmarks) {
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

// 2. displayOrCloseForm function
// Toggles the hidden class on #main-section and #form-section.
function displayOrCloseForm() {
  const mainSection = document.getElementById('main-section');
  const formSection = document.getElementById('form-section');
  
  if (mainSection && formSection) {
    mainSection.classList.toggle('hidden');
    formSection.classList.toggle('hidden');
  }
}

// 3. displayOrHideCategory function
// Toggles the hidden class on #main-section and #bookmark-list-section.
function displayOrHideCategory() {
  const mainSection = document.getElementById('main-section');
  const bookmarkListSection = document.getElementById('bookmark-list-section');
  
  if (mainSection && bookmarkListSection) {
    mainSection.classList.toggle('hidden');
    bookmarkListSection.classList.toggle('hidden');
  }
}

// Helper function to update all category-name elements
function updateCategoryNames(value) {
  const categoryNameElements = document.querySelectorAll('.category-name');
  categoryNameElements.forEach(el => {
    el.innerText = value;
  });
}

// Helper to render the bookmark list for a given category
function renderCategoryList(category) {
  const categoryListDiv = document.getElementById('category-list');
  if (!categoryListDiv) return;
  
  const bookmarks = getBookmarks();
  const filteredBookmarks = bookmarks.filter(b => b.category === category);
  
  if (filteredBookmarks.length === 0) {
    categoryListDiv.innerHTML = '<p>No Bookmarks Found</p>';
  } else {
    // Generate innerHTML with radio buttons and labels containing anchor tags
    let htmlContent = '';
    filteredBookmarks.forEach(bookmark => {
      htmlContent += `<input type="radio" id="${bookmark.name}" value="${bookmark.name}" name="bookmark-radio">`;
      htmlContent += `<label for="${bookmark.name}"><a href="${bookmark.url}" target="_blank">${bookmark.name}</a></label>`;
    });
    categoryListDiv.innerHTML = htmlContent;
  }
}

// Setup Event Listeners
function setupEventListeners() {
  const categoryDropdown = document.getElementById('category-dropdown');
  const addBookmarkBtn = document.getElementById('add-bookmark-button');
  const closeFormBtn = document.getElementById('close-form-button');
  const addBookmarkBtnForm = document.getElementById('add-bookmark-button-form');
  const viewCategoryBtn = document.getElementById('view-category-button');
  const closeListBtn = document.getElementById('close-list-button');
  const deleteBookmarkBtn = document.getElementById('delete-bookmark-button');
  
  const nameInput = document.getElementById('name');
  const urlInput = document.getElementById('url');

  // When clicking #add-bookmark-button
  if (addBookmarkBtn && categoryDropdown) {
    addBookmarkBtn.addEventListener('click', () => {
      const selectedCategory = categoryDropdown.value;
      updateCategoryNames(selectedCategory);
      displayOrCloseForm();
    });
  }

  // When clicking #close-form-button
  if (closeFormBtn) {
    closeFormBtn.addEventListener('click', () => {
      displayOrCloseForm();
    });
  }

  // When clicking #add-bookmark-button-form
  if (addBookmarkBtnForm && nameInput && urlInput && categoryDropdown) {
    addBookmarkBtnForm.addEventListener('click', () => {
      const nameValue = nameInput.value.trim();
      const urlValue = urlInput.value.trim();
      const selectedCategory = categoryDropdown.value;
      
      if (!nameValue || !urlValue) {
        alert('Please enter both name and URL.');
        return;
      }
      
      // Retrieve current bookmarks, append the new one
      const bookmarks = getBookmarks();
      bookmarks.push({
        name: nameValue,
        category: selectedCategory,
        url: urlValue
      });
      
      saveBookmarks(bookmarks);
      
      // Reset input fields
      nameInput.value = '';
      urlInput.value = '';
      
      // Close form and show main section
      displayOrCloseForm();
    });
  }

  // When clicking #view-category-button
  if (viewCategoryBtn && categoryDropdown) {
    viewCategoryBtn.addEventListener('click', () => {
      const selectedCategory = categoryDropdown.value;
      updateCategoryNames(selectedCategory);
      renderCategoryList(selectedCategory);
      displayOrHideCategory();
    });
  }

  // When clicking #close-list-button
  if (closeListBtn) {
    closeListBtn.addEventListener('click', () => {
      displayOrHideCategory();
    });
  }

  // When clicking #delete-bookmark-button
  if (deleteBookmarkBtn && categoryDropdown) {
    deleteBookmarkBtn.addEventListener('click', () => {
      // Find selected radio button
      const selectedRadio = document.querySelector('input[name="bookmark-radio"]:checked');
      if (!selectedRadio) {
        alert('Please select a bookmark to delete.');
        return;
      }
      
      const bookmarkNameToDelete = selectedRadio.value;
      const selectedCategory = categoryDropdown.value;
      
      // Delete from local storage
      let bookmarks = getBookmarks();
      bookmarks = bookmarks.filter(b => !(b.name === bookmarkNameToDelete && b.category === selectedCategory));
      saveBookmarks(bookmarks);
      
      // Update the displayed bookmark list
      renderCategoryList(selectedCategory);
    });
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
  setupEventListeners();
}

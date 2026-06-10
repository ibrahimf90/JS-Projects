/**
 * Elite Gallery & Theme Switcher Logic
 * Refined for robustness and smooth navigation.
 */

// --- Theme Management ---
const themes = [
  { id: "night",     name: "Night",     message: "Night mode is on. Rest your eyes." },
  { id: "light",     name: "Light",     message: "Light mode is on. Bright and clear." },
  { id: "adventure", name: "Adventure", message: "Adventure mode is on. Let's explore!" },
  { id: "sunset",    name: "Sunset",    message: "Sunset mode is on. Golden hour vibes." }
];

const themeBtn = document.getElementById("theme-switcher-button");
const themeDropdown = document.getElementById("theme-dropdown");
const themeLabel = document.getElementById("current-theme-label");
const statusMessage = document.getElementById("status");
const body = document.body;

function setTheme(themeId) {
  themes.forEach(t => body.classList.remove(`theme-${t.id}`));
  body.classList.add(`theme-${themeId}`);
  
  const theme = themes.find(t => t.id === themeId);
  if (theme) {
    statusMessage.textContent = theme.message;
    themeLabel.textContent = `Theme: ${theme.name}`;
    localStorage.setItem('elite-theme', themeId);
  }
  closeDropdown();
}

function toggleDropdown() {
  const isExpanded = themeBtn.getAttribute("aria-expanded") === "true";
  if (isExpanded) {
    closeDropdown();
  } else {
    openDropdown();
  }
}

function openDropdown() {
  themeBtn.setAttribute("aria-expanded", "true");
  themeDropdown.hidden = false;
}

function closeDropdown() {
  themeBtn.setAttribute("aria-expanded", "false");
  themeDropdown.hidden = true;
}

if (themeBtn) {
  themeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });
}

if (themeDropdown) {
  themeDropdown.querySelectorAll('li').forEach(item => {
    item.addEventListener("click", () => {
      const themeId = item.getAttribute('data-theme');
      setTheme(themeId);
    });
  });
}

document.addEventListener("click", (e) => {
  if (themeBtn && !themeBtn.contains(e.target) && themeDropdown && !themeDropdown.contains(e.target)) {
    closeDropdown();
  }
});

// --- Lightbox Management ---
const galleryCards = document.querySelectorAll('.gallery-card');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightbox-image');
const closeBtn = document.getElementById('close-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

let currentIndex = 0;
let imagesData = [];

// Initialize images data
function initGallery() {
  imagesData = Array.from(document.querySelectorAll('.gallery-card')).map(card => {
    const img = card.querySelector('.gallery-item');
    return {
      full: img.getAttribute('data-full'),
      alt: img.alt
    };
  });
}

function openLightbox(index) {
  currentIndex = index;
  updateLightboxContent();
  lightbox.classList.add('active');
  body.style.overflow = 'hidden';
}

function updateLightboxContent() {
  if (!imagesData[currentIndex]) return;
  
  const image = imagesData[currentIndex];
  
  // Reset animation
  lightboxImage.style.animation = 'none';
  void lightboxImage.offsetWidth; // force reflow
  lightboxImage.style.animation = null;
  
  lightboxImage.src = image.full;
  lightboxImage.alt = image.alt;
}

function closeLightbox() {
  if (lightbox) {
    lightbox.classList.remove('active');
    body.style.overflow = '';
  }
}

function showNext() {
  if (imagesData.length === 0) return;
  currentIndex = (currentIndex + 1) % imagesData.length;
  updateLightboxContent();
}

function showPrev() {
  if (imagesData.length === 0) return;
  currentIndex = (currentIndex - 1 + imagesData.length) % imagesData.length;
  updateLightboxContent();
}

// Event Listeners
galleryCards.forEach((card, index) => {
  card.addEventListener('click', () => {
    openLightbox(index);
  });
});

if (closeBtn) {
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeLightbox();
  });
}

if (nextBtn) {
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showNext();
  });
}

if (prevBtn) {
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showPrev();
  });
}

if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
    closeDropdown();
  } else if (e.key === 'ArrowRight' && lightbox.classList.contains('active')) {
    showNext();
  } else if (e.key === 'ArrowLeft' && lightbox.classList.contains('active')) {
    showPrev();
  }
});

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initGallery();
  const savedTheme = localStorage.getItem('elite-theme') || 'night';
  setTheme(savedTheme);
});

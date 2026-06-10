document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector("header");
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.querySelector(".nav-links");
  const dropdownItems = document.querySelectorAll(".nav-item-dropdown");

  // Navbar scroll effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Mobile Menu Toggle
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  // Dropdown Menu Handling
  dropdownItems.forEach((item) => {
    const link = item.querySelector(".nav-link-projects");
    if (link) {
      link.addEventListener("click", (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          item.classList.toggle("active");
        }
      });
    }
  });

  // Close menu when a link is clicked
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("active");
      dropdownItems.forEach((item) => item.classList.remove("active"));
    });
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#") return;

      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
        });
        // Close mobile menu after navigation
        if (navLinks.classList.contains("active")) {
          navLinks.classList.remove("active");
        }
      }
    });
  });

  // Category Filtering (if implemented)
  const categoryBtns = document.querySelectorAll(".category-btn");
  const projectCards = document.querySelectorAll(".project-card");

  if (categoryBtns.length > 0) {
    categoryBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Update active button
        categoryBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.getAttribute("data-category");

        projectCards.forEach((card) => {
          const category = card.getAttribute("data-category");

          if (filter === "all" || filter === category) {
            card.style.display = "flex";
            // Re-trigger fade-in animation
            card.classList.remove("fade-in");
            void card.offsetWidth; // Force reflow
            card.classList.add("fade-in");
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }

  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document
    .querySelectorAll(
      ".project-card, .hero-content, .gallery-big-box, .projects-section",
    )
    .forEach((el) => {
      observer.observe(el);
    });

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!header.contains(e.target) && navLinks.classList.contains("active")) {
      navLinks.classList.remove("active");
      dropdownItems.forEach((item) => item.classList.remove("active"));
    }
  });

  // Handle window resize - close mobile menu on larger screens
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove("active");
      dropdownItems.forEach((item) => item.classList.remove("active"));
    }
  });
});

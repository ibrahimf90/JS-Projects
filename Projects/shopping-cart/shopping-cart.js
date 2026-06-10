const cartContainer = document.getElementById("cart-container");
const productsContainer = document.getElementById("products-container");
const dessertCards = document.getElementById("dessert-card-container");
const cartBtn = document.getElementById("cart-btn");
const closeCartBtn = document.getElementById("close-cart-btn");
const clearCartBtn = document.getElementById("clear-cart-btn");
const cartSubTotal = document.getElementById("subtotal");
const cartTaxes = document.getElementById("taxes");
const cartTotal = document.getElementById("total");
const showHideCartSpan = document.getElementById("show-hide-cart");
const cartEmptyMsg = document.getElementById("cart-empty-msg");
let isCartShowing = false;

function formatMoney(amount) {
  return `$${amount.toFixed(2)}`;
}

function updateEmptyState() {
  const hasItems = cart.items.length > 0;
  cartEmptyMsg.hidden = hasItems;
  clearCartBtn.disabled = !hasItems;
}

function buildProductRow(id, name, price, count) {
  return `
    <div class="product-row">
      <p class="product-info">
        <span class="product-count">${count}x</span> ${name}
        <span class="product-price">${formatMoney(price)}</span>
      </p>
      <button
        type="button"
        class="remove-item-btn"
        data-id="${id}"
        aria-label="Remove ${name}"
      >
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </div>
  `;
}

function setCartOpen(open) {
  isCartShowing = open;
  showHideCartSpan.textContent = open ? "Hide" : "Show";
  cartContainer.hidden = !open;
  cartBtn.setAttribute("aria-expanded", String(open));
}

class Dessert {
  constructor(id, name, price, icon, category) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.icon = icon;
    this.category = category;
  }
}

const products = [
  new Dessert(1, "Vanilla Cupcakes (6 Pack)", 12.99, "🧁", "cupcakes"),
  new Dessert(2, "French Macaron (4 Pack)", 9.99, "🍪", "macarons"),
  new Dessert(3, "Chocolate Pretzels (4 Pack)", 10.99, "🥨", "pretzels"),
  new Dessert(4, "Strawberry Ice Cream", 2.99, "🍦", "ice-cream"),
  new Dessert(5, "Pumpkin Cupcake", 3.99, "🧁", "cupcakes"),
  new Dessert(6, "Chocolate Cupcake", 5.99, "🧁", "cupcakes"),
  new Dessert(7, "Chocolate Macarons (4 Pack)", 9.99, "🍪", "macarons"),
  new Dessert(8, "Strawberry Pretzel", 4.99, "🥨", "pretzels"),
  new Dessert(9, "Butter Pecan Ice Cream", 2.99, "🍦", "ice-cream"),
  new Dessert(10, "Rocky Road Ice Cream", 2.99, "🍦", "ice-cream"),
  new Dessert(11, "Vanilla Macarons (5 Pack)", 11.99, "🍪", "macarons"),
  new Dessert(12, "Lemon Cupcakes (4 Pack)", 12.99, "🧁", "cupcakes"),
];

let currentCategory = "all";

function renderProducts() {
  dessertCards.innerHTML = "";

  const filteredProducts = currentCategory === "all" 
    ? products 
    : products.filter(p => p.category === currentCategory);

  filteredProducts.forEach(({ name, id, price, icon }) => {
    dessertCards.innerHTML += `
      <div class="dessert-card">
        <div class="dessert-icon">${icon}</div>
        <h2>${name}</h2>
        <p class="dessert-price">$${price}</p>
        <button 
          id="${id}" 
          class="btn add-to-cart-btn">Add to cart
        </button>
      </div>
    `;
  });

  attachCartListeners();
}

function attachCartListeners() {
  const addToCartBtns = document.getElementsByClassName("add-to-cart-btn");
  [...addToCartBtns].forEach((btn) => {
    btn.removeEventListener("click", handleAddToCart);
    btn.addEventListener("click", handleAddToCart);
  });
}

function handleAddToCart(event) {
  cart.addItem(Number(event.target.id), products);
  cart.calculateTotal();
}

function handleRemoveItem(event) {
  const removeBtn = event.target.closest(".remove-item-btn");
  if (!removeBtn) {
    return;
  }

  cart.removeItem(Number(removeBtn.dataset.id), products);
  cart.calculateTotal();
}

class ShoppingCart {
  constructor() {
    this.items = [];
    this.total = 0;
    this.taxRate = 8.25;
  }

  addItem(id, products) {
    const product = products.find((item) => item.id === id);
    const { name, price } = product;
    this.items.push(product);

    const count = this.items.filter((item) => item.id === id).length;
    const existingProductDiv = document.getElementById(`product-id${id}`);

    if (existingProductDiv) {
      existingProductDiv.innerHTML = buildProductRow(id, name, price, count);
    } else {
      productsContainer.insertAdjacentHTML(
        "beforeend",
        `
        <div id="product-id${id}" class="product">
          ${buildProductRow(id, name, price, count)}
        </div>
      `,
      );
    }

    document.getElementById("cart-notification").textContent = this.items.length;
    updateEmptyState();
  }

  removeItem(id, products) {
    const itemIndex = this.items.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      return;
    }

    this.items.splice(itemIndex, 1);
    const product = products.find((item) => item.id === id);
    const { name, price } = product;
    const count = this.items.filter((item) => item.id === id).length;
    const productDiv = document.getElementById(`product-id${id}`);

    if (count === 0) {
      productDiv.remove();
    } else {
      productDiv.innerHTML = buildProductRow(id, name, price, count);
    }

    document.getElementById("cart-notification").textContent = this.items.length;
    updateEmptyState();
  }

  clearCart() {
    if (!this.items.length) {
      return;
    }

    const isCartCleared = confirm(
      "Are you sure you want to clear all items from your shopping cart?",
    );

    if (isCartCleared) {
      this.items = [];
      this.total = 0;
      productsContainer.querySelectorAll(".product").forEach((el) => el.remove());
      cartSubTotal.textContent = formatMoney(0);
      cartTaxes.textContent = formatMoney(0);
      cartTotal.textContent = formatMoney(0);
      document.getElementById("cart-notification").textContent = 0;
      updateEmptyState();
    }
  }

  calculateTaxes(amount) {
    return parseFloat(((this.taxRate / 100) * amount).toFixed(2));
  }

  calculateTotal() {
    const subTotal = this.items.reduce((total, item) => total + item.price, 0);
    const tax = this.calculateTaxes(subTotal);
    this.total = subTotal + tax;
    cartSubTotal.textContent = formatMoney(subTotal);
    cartTaxes.textContent = formatMoney(tax);
    cartTotal.textContent = formatMoney(this.total);
    return this.total;
  }
}

const cart = new ShoppingCart();

renderProducts();
updateEmptyState();

productsContainer.addEventListener("click", handleRemoveItem);

cartBtn.addEventListener("click", () => {
  setCartOpen(!isCartShowing);
});

closeCartBtn.addEventListener("click", () => {
  setCartOpen(false);
});

clearCartBtn.addEventListener("click", cart.clearCart.bind(cart));

// Category filtering
const categoryButtons = document.querySelectorAll(".category-btn");
categoryButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentCategory = btn.dataset.category;
    
    // Update active state
    categoryButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    renderProducts();
  });
});

// Place Order button
const placeOrderBtn = document.getElementById("place-order-btn");
if (placeOrderBtn) {
  placeOrderBtn.addEventListener("click", () => {
    if (cart.items.length === 0) {
      alert("Your cart is empty. Please add items before placing an order.");
      return;
    }
    alert("to the payment page this demo is finish");
  });
}

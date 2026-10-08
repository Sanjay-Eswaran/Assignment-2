const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    description: "Comfortable over-ear headphones with clear sound.",
    price: 79.99,
    emoji: "🎧"
  },
  {
    id: 2,
    name: "Smart Watch",
    description: "Track time, activity, and everyday notifications.",
    price: 129.99,
    emoji: "⌚"
  },
  {
    id: 3,
    name: "Travel Backpack",
    description: "Lightweight everyday backpack with laptop storage.",
    price: 54.99,
    emoji: "🎒"
  },
  {
    id: 4,
    name: "Mechanical Keyboard",
    description: "Compact keyboard with a satisfying tactile feel.",
    price: 89.99,
    emoji: "⌨️"
  },
  {
    id: 5,
    name: "Coffee Mug",
    description: "Minimal ceramic mug for your desk or kitchen.",
    price: 14.99,
    emoji: "☕"
  },
  {
    id: 6,
    name: "Desk Lamp",
    description: "Adjustable LED desk lamp with a clean design.",
    price: 39.99,
    emoji: "💡"
  },
  {
    id: 7,
    name: "Running Shoes",
    description: "Lightweight shoes designed for everyday running.",
    price: 69.99,
    emoji: "👟"
  },
  {
    id: 8,
    name: "Water Bottle",
    description: "Reusable insulated bottle for hot or cold drinks.",
    price: 24.99,
    emoji: "🧴"
  }
];

const TAX_RATE = 0.08;
const CART_KEY = "shopeasy-cart";

let cart = loadCart();

const productGrid = document.getElementById("productGrid");
const productCount = document.getElementById("productCount");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const emptyCart = document.getElementById("emptyCart");
const cartContent = document.getElementById("cartContent");
const subtotalEl = document.getElementById("subtotal");
const taxEl = document.getElementById("tax");
const totalEl = document.getElementById("total");
const checkoutTotalEl = document.getElementById("checkoutTotal");
const checkoutModal = document.getElementById("checkoutModal");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutSuccess = document.getElementById("checkoutSuccess");
const toast = document.getElementById("toast");

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function renderProducts() {
  productCount.textContent = `${products.length} items`;

  productGrid.innerHTML = products.map(product => `
    <article class="product-card">
      <div class="product-image" aria-hidden="true">${product.emoji}</div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="price-row">
          <span class="price">${formatCurrency(product.price)}</span>
          <button class="primary-button" data-add="${product.id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join("");
}

function getCartDetails() {
  return cart
    .map(item => {
      const product = products.find(product => product.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean);
}

function getTotals() {
  const subtotal = getCartDetails().reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const tax = subtotal * TAX_RATE;
  return {
    subtotal,
    tax,
    total: subtotal + tax
  };
}

function renderCart() {
  const details = getCartDetails();
  const itemCount = details.reduce((sum, item) => sum + item.quantity, 0);

  cartCount.textContent = itemCount;

  if (details.length === 0) {
    emptyCart.classList.remove("hidden");
    cartContent.classList.add("hidden");
    return;
  }

  emptyCart.classList.add("hidden");
  cartContent.classList.remove("hidden");

  cartItems.innerHTML = details.map(item => `
    <article class="cart-item">
      <div class="cart-item-image" aria-hidden="true">${item.product.emoji}</div>

      <div>
        <h3>${item.product.name}</h3>
        <div class="cart-item-price">${formatCurrency(item.product.price)} each</div>

        <div class="quantity-controls">
          <button data-decrease="${item.product.id}" aria-label="Decrease quantity">−</button>
          <strong>${item.quantity}</strong>
          <button data-increase="${item.product.id}" aria-label="Increase quantity">+</button>
        </div>

        <div>
          <button class="remove-button" data-remove="${item.product.id}">Remove</button>
        </div>
      </div>

      <div class="item-total">${formatCurrency(item.product.price * item.quantity)}</div>
    </article>
  `).join("");

  const totals = getTotals();
  subtotalEl.textContent = formatCurrency(totals.subtotal);
  taxEl.textContent = formatCurrency(totals.tax);
  totalEl.textContent = formatCurrency(totals.total);
  checkoutTotalEl.textContent = formatCurrency(totals.total);
}

function addToCart(productId) {
  const existing = cart.find(item => item.productId === productId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }

  saveCart();
  renderCart();

  const product = products.find(product => product.id === productId);
  showToast(`${product.name} added to cart`);
}

function updateQuantity(productId, amount) {
  const item = cart.find(item => item.productId === productId);
  if (!item) return;

  item.quantity += amount;

  if (item.quantity <= 0) {
    cart = cart.filter(cartItem => cartItem.productId !== productId);
  }

  saveCart();
  renderCart();
}

function removeFromCart(productId) {
  cart = cart.filter(item => item.productId !== productId);
  saveCart();
  renderCart();
}

function clearCart() {
  if (cart.length === 0) return;

  cart = [];
  saveCart();
  renderCart();
  showToast("Cart cleared");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}

function openCheckout() {
  if (cart.length === 0) {
    showToast("Your cart is empty");
    return;
  }

  checkoutForm.reset();
  clearValidationErrors();
  checkoutSuccess.classList.add("hidden");
  checkoutModal.classList.remove("hidden");
  document.getElementById("name").focus();
}

function closeCheckout() {
  checkoutModal.classList.add("hidden");
}

function clearValidationErrors() {
  document.querySelectorAll(".error").forEach(element => {
    element.textContent = "";
  });

  document.querySelectorAll("#checkoutForm input, #checkoutForm textarea").forEach(element => {
    element.removeAttribute("aria-invalid");
  });
}

function setFieldError(fieldName, message) {
  const error = document.querySelector(`[data-error-for="${fieldName}"]`);
  const field = document.getElementById(fieldName);

  if (error) error.textContent = message;
  if (field) field.setAttribute("aria-invalid", "true");
}

function validateCheckout() {
  clearValidationErrors();

  const values = {
    name: document.getElementById("name").value.trim(),
    email: document.getElementById("email").value.trim(),
    address: document.getElementById("address").value.trim(),
    city: document.getElementById("city").value.trim(),
    zip: document.getElementById("zip").value.trim()
  };

  let valid = true;

  if (values.name.length < 2) {
    setFieldError("name", "Please enter your full name.");
    valid = false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    setFieldError("email", "Please enter a valid email address.");
    valid = false;
  }

  if (values.address.length < 5) {
    setFieldError("address", "Please enter a valid shipping address.");
    valid = false;
  }

  if (values.city.length < 2) {
    setFieldError("city", "Please enter your city.");
    valid = false;
  }

  if (!/^[A-Za-z0-9\-\s]{3,10}$/.test(values.zip)) {
    setFieldError("zip", "Please enter a valid postal code.");
    valid = false;
  }

  return valid;
}

function placeOrder(event) {
  event.preventDefault();

  if (!validateCheckout()) return;

  const orderId = `ORD-${Date.now().toString().slice(-8)}`;

  checkoutSuccess.textContent =
    `Order ${orderId} placed successfully. This demo does not process real payments.`;

  checkoutSuccess.classList.remove("hidden");

  cart = [];
  saveCart();
  renderCart();

  setTimeout(closeCheckout, 2500);
}

productGrid.addEventListener("click", event => {
  const button = event.target.closest("[data-add]");
  if (!button) return;
  addToCart(Number(button.dataset.add));
});

cartItems.addEventListener("click", event => {
  const increase = event.target.closest("[data-increase]");
  const decrease = event.target.closest("[data-decrease]");
  const remove = event.target.closest("[data-remove]");

  if (increase) updateQuantity(Number(increase.dataset.increase), 1);
  if (decrease) updateQuantity(Number(decrease.dataset.decrease), -1);
  if (remove) removeFromCart(Number(remove.dataset.remove));
});

document.getElementById("clearCart").addEventListener("click", clearCart);

document.getElementById("cartToggle").addEventListener("click", () => {
  document.getElementById("cartSection").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("checkoutButton").addEventListener("click", openCheckout);
document.getElementById("closeModal").addEventListener("click", closeCheckout);
checkoutForm.addEventListener("submit", placeOrder);

checkoutModal.addEventListener("click", event => {
  if (event.target === checkoutModal) closeCheckout();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !checkoutModal.classList.contains("hidden")) {
    closeCheckout();
  }
});

renderProducts();
renderCart();

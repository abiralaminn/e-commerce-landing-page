// ---------- Book data ----------
// c1 and c2 are the two colors used for each cover
const books = [
  { id: 1,  title: "The Salt Road",      author: "Mara Ellison",  price: 16.99, old: 21.0,  cat: "Fiction",     rating: 5, reviews: 214, c1: "#c9772e", c2: "#7a3412", tag: "Bestseller" },
  { id: 2,  title: "Quiet Harbors",      author: "Tomas Reyes",   price: 14.5,  old: null,  cat: "Non-fiction", rating: 4, reviews: 98,  c1: "#2f5d62", c2: "#14302f", tag: "" },
  { id: 3,  title: "Glass Kingdoms",     author: "Iris Vandal",   price: 19.99, old: 24.99, cat: "Fantasy",     rating: 5, reviews: 342, c1: "#6b4a8a", c2: "#2c1c45", tag: "Sale" },
  { id: 4,  title: "Small Wins Daily",   author: "Priya Nandan",  price: 12.99, old: null,  cat: "Self-growth", rating: 4, reviews: 176, c1: "#3f7d4e", c2: "#173d24", tag: "New" },
  { id: 5,  title: "Paper Moons",        author: "Elias Crane",   price: 15.25, old: null,  cat: "Fiction",     rating: 4, reviews: 87,  c1: "#b84a5a", c2: "#5e1626", tag: "" },
  { id: 6,  title: "The Long Signal",    author: "Dr. A. Hossain", price: 22.0, old: 27.5,  cat: "Non-fiction", rating: 5, reviews: 129, c1: "#35557c", c2: "#14233a", tag: "Sale" },
  { id: 7,  title: "Ember & Thorn",      author: "Kaia Strand",   price: 18.4,  old: null,  cat: "Fantasy",     rating: 5, reviews: 261, c1: "#a8432a", c2: "#3d150b", tag: "Bestseller" },
  { id: 8,  title: "Focus Like Water",   author: "Jonah Beck",    price: 13.75, old: null,  cat: "Self-growth", rating: 4, reviews: 143, c1: "#2b8a9a", c2: "#0f3f49", tag: "" }
];

// The book of the month is not in the grid, so we keep it separate
const featuredBook = { id: 99, title: "The Lantern Keeper", author: "Nora Whitlock", price: 18.99, old: 24.0, cat: "Fiction", rating: 5, reviews: 58, c1: "#d6a84e", c2: "#8a5a14", tag: "" };

const FREE_SHIPPING = 50;

// ---------- Grab elements ----------
const grid = document.getElementById("productGrid");
const filterWrap = document.getElementById("filters");
const cartItemsBox = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const subtotalEl = document.getElementById("subtotal");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const toast = document.getElementById("toast");

// ---------- Cart (saved in the browser) ----------
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem("folio-cart")) || [];
} catch (e) {
  cart = [];
}

function saveCart() {
  try { localStorage.setItem("folio-cart", JSON.stringify(cart)); } catch (e) { /* ignore */ }
}

// find a book by id (grid books + featured book)
function findBook(id) {
  return [...books, featuredBook].find(b => b.id === id);
}

const money = n => "$" + n.toFixed(2);

// ---------- Draw the product cards ----------
function showBooks(category) {
  const list = category === "All" ? books : books.filter(b => b.cat === category);

  grid.innerHTML = list.map((b, i) => {
    const stars = "★".repeat(b.rating) + "☆".repeat(5 - b.rating);
    const tagClass = b.tag === "Sale" ? "tag sale" : "tag";
    return `
      <article class="card" style="animation-delay:${i * 60}ms">
        <div class="card-img">
          ${b.tag ? `<span class="${tagClass}">${b.tag}</span>` : ""}
          <div class="cover" style="--c1:${b.c1}; --c2:${b.c2};">
            <small>${b.cat}</small><h4>${b.title}</h4><span>${b.author}</span>
          </div>
        </div>
        <span class="card-cat">${b.cat}</span>
        <h3>${b.title}</h3>
        <p class="author">${b.author}</p>
        <div class="rating">${stars}<small>(${b.reviews})</small></div>
        <div class="card-foot">
          <div class="price"><strong>${money(b.price)}</strong>${b.old ? `<s>${money(b.old)}</s>` : ""}</div>
          <button class="add-btn" data-add="${b.id}">Add to cart</button>
        </div>
      </article>`;
  }).join("");
}

// ---------- Draw the cart ----------
function drawCart() {
  let total = 0;
  let count = 0;

  if (cart.length === 0) {
    cartItemsBox.innerHTML = `<p class="empty">Your cart is empty.<br>Find something good to read!</p>`;
  } else {
    cartItemsBox.innerHTML = cart.map(item => {
      const b = findBook(item.id);
      total += b.price * item.qty;
      count += item.qty;
      return `
        <div class="item">
          <div class="cover" style="--c1:${b.c1}; --c2:${b.c2};"><h4 style="font-size:.5rem">${b.title}</h4></div>
          <div>
            <h4>${b.title}</h4>
            <p class="a">${b.author}</p>
            <div class="qty">
              <button data-minus="${b.id}" aria-label="Less">−</button>
              <span>${item.qty}</span>
              <button data-plus="${b.id}" aria-label="More">+</button>
            </div>
          </div>
          <div class="item-right">
            <strong>${money(b.price * item.qty)}</strong>
            <button class="remove" data-remove="${b.id}">Remove</button>
          </div>
        </div>`;
    }).join("");
  }

  // totals + badge
  subtotalEl.textContent = money(total);
  cartCount.textContent = count;

  // free shipping bar
  const left = FREE_SHIPPING - total;
  const text = document.getElementById("shipText");
  if (total === 0) {
    text.textContent = `Add ${money(FREE_SHIPPING)} more to get free shipping`;
  } else if (left > 0) {
    text.innerHTML = `Add <strong>${money(left)}</strong> more to get free shipping`;
  } else {
    text.innerHTML = "🎉 You get <strong>free shipping</strong>!";
  }
  document.getElementById("barFill").style.width = Math.min(100, (total / FREE_SHIPPING) * 100) + "%";

  saveCart();
}

// ---------- Cart actions ----------
function addToCart(id) {
  const found = cart.find(i => i.id === id);
  if (found) found.qty++;
  else cart.push({ id: id, qty: 1 });

  drawCart();
  showToast(`"${findBook(id).title}" added to cart`);

  // little bounce on the badge
  cartCount.classList.remove("pop");
  void cartCount.offsetWidth; // restart animation
  cartCount.classList.add("pop");
}

function changeQty(id, amount) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += amount;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  drawCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  drawCart();
}

function openCart() {
  drawer.classList.add("open");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
}
function closeCart() {
  drawer.classList.remove("open");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// ---------- Click handling (one listener for all buttons) ----------
document.addEventListener("click", e => {
  const add = e.target.closest("[data-add]");
  const plus = e.target.closest("[data-plus]");
  const minus = e.target.closest("[data-minus]");
  const remove = e.target.closest("[data-remove]");

  if (add) addToCart(Number(add.dataset.add));
  if (plus) changeQty(Number(plus.dataset.plus), 1);
  if (minus) changeQty(Number(minus.dataset.minus), -1);
  if (remove) removeItem(Number(remove.dataset.remove));
});

document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });

document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (cart.length === 0) return showToast("Your cart is empty");
  showToast("This is a demo. Checkout is not connected.");
});

// ---------- Filters ----------
function setFilter(name) {
  document.querySelectorAll(".filter").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === name);
  });
  showBooks(name);
}

filterWrap.addEventListener("click", e => {
  const btn = e.target.closest(".filter");
  if (btn) setFilter(btn.dataset.filter);
});

// category cards also set the filter, then scroll to the shop
document.querySelectorAll(".cat").forEach(card => {
  card.addEventListener("click", () => setFilter(card.dataset.filter));
});

// ---------- Mobile menu ----------
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");

menuBtn.addEventListener("click", () => {
  menuBtn.classList.toggle("open");
  nav.classList.toggle("open");
});
nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    menuBtn.classList.remove("open");
    nav.classList.remove("open");
  });
});

// ---------- Header shadow on scroll ----------
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 10);
});

// ---------- Fade-in when scrolling ----------
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

// ---------- Newsletter ----------
document.getElementById("newsForm").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("newsEmail").value.trim();
  const msg = document.getElementById("newsMsg");
  const looksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!looksValid) {
    msg.textContent = "Please enter a valid email address.";
    msg.className = "form-msg err";
    return;
  }
  msg.textContent = "Thanks for joining! Your 10% code is READMORE10.";
  msg.className = "form-msg ok";
  e.target.reset();
});

// ---------- Start ----------
document.getElementById("year").textContent = new Date().getFullYear();
showBooks("All");
drawCart();

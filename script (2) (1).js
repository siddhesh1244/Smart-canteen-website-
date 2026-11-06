const MENU = [
  { id: 1, name: "Masala Dosa", cat: "Breakfast", price: 50, veg: true, emoji: "🥞", desc: "Crispy dosa with potato filling, chutney and sambar." },
  { id: 2, name: "Idli Sambar", cat: "Breakfast", price: 35, veg: true, emoji: "🍚", desc: "Four soft idlis with sambar and coconut chutney." },
  { id: 3, name: "Poha", cat: "Breakfast", price: 30, veg: true, emoji: "🍛", desc: "Flattened rice with peanuts, onion and lemon." },
  { id: 4, name: "Veg Thali", cat: "Meals", price: 90, veg: true, emoji: "🍱", desc: "Roti, rice, dal, sabzi, salad and pickle." },
  { id: 5, name: "Chicken Biryani", cat: "Meals", price: 120, veg: false, emoji: "🍗", desc: "Fragrant basmati rice cooked with spiced chicken." },
  { id: 6, name: "Rajma Chawal", cat: "Meals", price: 70, veg: true, emoji: "🍲", desc: "Kidney bean curry served with steamed rice." },
  { id: 7, name: "Veg Sandwich", cat: "Snacks", price: 40, veg: true, emoji: "🥪", desc: "Grilled sandwich with fresh vegetables and cheese." },
  { id: 8, name: "Samosa (2 pcs)", cat: "Snacks", price: 25, veg: true, emoji: "🥟", desc: "Crispy pastry stuffed with spiced potato." },
  { id: 9, name: "Egg Roll", cat: "Snacks", price: 55, veg: false, emoji: "🌯", desc: "Paratha wrapped around egg, onion and sauce." },
  { id: 10, name: "Masala Chai", cat: "Drinks", price: 15, veg: true, emoji: "🍵", desc: "Hot ginger and cardamom tea." },
  { id: 11, name: "Cold Coffee", cat: "Drinks", price: 45, veg: true, emoji: "🥤", desc: "Chilled coffee blended with milk and ice." },
  { id: 12, name: "Fresh Lime Soda", cat: "Drinks", price: 25, veg: true, emoji: "🍋", desc: "Sweet or salted, served cold." }
];

let cart = JSON.parse(localStorage.getItem("canteenCart") || "{}");
let activeCat = "All";

const menuGrid = document.getElementById("menuGrid");
const filters = document.getElementById("filters");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const cartError = document.getElementById("cartError");
const drawer = document.getElementById("drawer");
const overlay = document.getElementById("overlay");
const slotSelect = document.getElementById("slot");
const modal = document.getElementById("modal");

function renderFilters() {
  const cats = ["All", ...new Set(MENU.map(m => m.cat))];
  filters.innerHTML = "";
  cats.forEach(c => {
    const b = document.createElement("button");
    b.textContent = c;
    if (c === activeCat) b.classList.add("active");
    b.onclick = () => { activeCat = c; renderFilters(); renderMenu(); };
    filters.appendChild(b);
  });
}

function renderMenu() {
  menuGrid.innerHTML = "";
  MENU.filter(m => activeCat === "All" || m.cat === activeCat).forEach(m => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="emoji">${m.emoji}</div>
      <h3><span class="dot ${m.veg ? "veg" : "non"}"></span>${m.name}</h3>
      <p class="desc">${m.desc}</p>
      <div class="row">
        <span class="price">₹${m.price}</span>
        <button class="add-btn">Add</button>
      </div>`;
    card.querySelector(".add-btn").onclick = () => addToCart(m.id);
    menuGrid.appendChild(card);
  });
}

function saveCart() {
  localStorage.setItem("canteenCart", JSON.stringify(cart));
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart();
  renderCart();
}

function renderCart() {
  const ids = Object.keys(cart);
  let total = 0, count = 0;
  cartItems.innerHTML = "";

  if (ids.length === 0) {
    cartItems.innerHTML = '<p class="empty">Your cart is empty.</p>';
  }

  ids.forEach(id => {
    const item = MENU.find(m => m.id == id);
    const qty = cart[id];
    total += item.price * qty;
    count += qty;
    const line = document.createElement("div");
    line.className = "cart-line";
    line.innerHTML = `
      <div class="name">${item.name}<br><small>₹${item.price} each</small></div>
      <div class="qty">
        <button aria-label="Decrease">-</button>
        <span>${qty}</span>
        <button aria-label="Increase">+</button>
      </div>
      <strong>₹${item.price * qty}</strong>`;
    const btns = line.querySelectorAll("button");
    btns[0].onclick = () => changeQty(id, -1);
    btns[1].onclick = () => changeQty(id, 1);
    cartItems.appendChild(line);
  });

  cartCount.textContent = count;
  cartTotal.textContent = "₹" + total;
}

function buildSlots() {
  slotSelect.innerHTML = "";
  const now = new Date();
  let minutes = now.getHours() * 60 + now.getMinutes() + 15;
  minutes = Math.ceil(minutes / 15) * 15;
  const open = 8 * 60, close = 17 * 60;
  if (minutes < open) minutes = open;

  const slots = [];
  for (let m = minutes; m <= close; m += 15) slots.push(m);

  if (slots.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Canteen closed for today";
    slotSelect.appendChild(opt);
    return;
  }

  slots.forEach(m => {
    const h = Math.floor(m / 60), min = m % 60;
    const label = new Date(2000, 0, 1, h, min).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const opt = document.createElement("option");
    opt.value = label;
    opt.textContent = label;
    slotSelect.appendChild(opt);
  });
}

function openCart() {
  buildSlots();
  cartError.textContent = "";
  drawer.classList.add("open");
  overlay.classList.add("show");
}

function closeCart() {
  drawer.classList.remove("open");
  overlay.classList.remove("show");
}

function placeOrder() {
  if (Object.keys(cart).length === 0) {
    cartError.textContent = "Add at least one item first.";
    return;
  }
  if (!slotSelect.value) {
    cartError.textContent = "No pickup slots available right now.";
    return;
  }

  const last = parseInt(localStorage.getItem("canteenToken") || "100", 10);
  const token = last + 1;
  localStorage.setItem("canteenToken", token);

  document.getElementById("tokenNo").textContent = "#" + token;
  document.getElementById("tokenInfo").textContent =
    "Pickup at " + slotSelect.value + ". Total " + cartTotal.textContent + ".";

  cart = {};
  saveCart();
  renderCart();
  closeCart();
  modal.classList.add("show");
}

document.getElementById("openCart").onclick = openCart;
document.getElementById("closeCart").onclick = closeCart;
overlay.onclick = closeCart;
document.getElementById("placeOrder").onclick = placeOrder;
document.getElementById("closeModal").onclick = () => modal.classList.remove("show");

renderFilters();
renderMenu();
renderCart();

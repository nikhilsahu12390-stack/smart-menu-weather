const firebaseConfig = {
  apiKey: "AIzaSyBQT0bQYJlHwV0zUQGmQTBiFSauYhdAEOc",
  authDomain: "summer-weather-menu.firebaseapp.com",
  projectId: "summer-weather-menu",
  storageBucket: "summer-weather-menu.firebasestorage.app",
  messagingSenderId: "739249916204",
  appId: "1:739249916204:web:3a76e0f4b27e13521b8489"
};
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.firestore();

// 🛒 CART LOGIC
let cart = [];

window.addToCart = function(name, priceStr) {
    cart.push({ name, price: priceStr });
    updateCartUI();
    
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = "Added ✅";
    btn.style.background = "#10b981";
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = "#1f2937";
    }, 1000);
}

function updateCartUI() {
    const cartBtn = document.getElementById('floating-cart-btn');
    const modal = document.getElementById('cart-modal');
    if(cart.length > 0) {
        cartBtn.style.display = 'block';
        cartBtn.innerHTML = `🛒 View Cart (${cart.length})`;
    } else {
        cartBtn.style.display = 'none';
        modal.style.display = 'none';
        document.getElementById('cart-overlay').style.display = 'none';
    }
}

window.toggleCart = function() {
    const modal = document.getElementById('cart-modal');
    const overlay = document.getElementById('cart-overlay');
    const isHidden = modal.style.display !== 'block';
    modal.style.display = isHidden ? 'block' : 'none';
    overlay.style.display = isHidden ? 'block' : 'none';
    if(isHidden) renderCartItems();
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = cart.map((item, index) => `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span>${item.name}</span> <b>${item.price}</b>
            <button onclick="removeFromCart(${index})">X</button>
        </div>
    `).join('');
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
    renderCartItems();
}

window.checkout = function() {
    const msg = `Order: ` + cart.map(i => `${i.name} (${i.price})`).join(', ');
    window.open(`https://api.whatsapp.com/send?phone=919999999999&text=${encodeURIComponent(msg)}`, '_blank');
}

// 🍽️ MENU & WEATHER LOGIC
async function initMenu() {
    const menuContainer = document.getElementById("menu-container");
    const staticMenu = [
        { category: "PASTA", items: [{name: "Saffron Pasta", price: "₹395"}, {name: "Pomodoro", price: "₹395"}] },
        { category: "PIZZA", items: [{name: "Margherita", price: "₹395"}, {name: "Loaded Chicken", price: "₹475"}] }
    ];

    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=30.3165&longitude=78.0322&current=temperature_2m,rain,weather_code`);
        const data = await res.json();
        const weatherMode = (data.current.rain > 0 || data.current.weather_code >= 51) ? "rainy" : (data.current.temperature_2m > 25 ? "sunny" : "cold");
        document.body.className = `theme-${weatherMode}`;

        const snapshot = await db.collection("menu items").get();
        let html = "";
        
        snapshot.forEach(doc => {
            const item = doc.data();
            if (item.Weather?.toLowerCase() === weatherMode) {
                html += `<div class="special-card">🌟 ${item.Name} - ${item.Price}</div>`;
            }
        });

        staticMenu.forEach(cat => {
            html += `<h3>${cat.category}</h3><div class="menu-grid">` + 
                cat.items.map(i => `<div class="item-card">${i.name} <b>${i.price}</b><button onclick="addToCart('${i.name}','${i.price}')">Add +</button></div>`).join('') +
                `</div>`;
        });

        menuContainer.innerHTML = html;
    } catch (e) { console.error(e); }
}

window.onload = initMenu;

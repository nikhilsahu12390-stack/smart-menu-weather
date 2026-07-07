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
    if(!cartBtn || !modal) return;
    
    if(cart.length > 0) {
        cartBtn.style.display = 'block';
        cartBtn.innerHTML = `🛒 View Cart (${cart.length})`;
    } else {
        cartBtn.style.display = 'none';
        modal.style.display = 'none';
        const overlay = document.getElementById('cart-overlay');
        if(overlay) overlay.style.display = 'none';
    }
}

window.toggleCart = function() {
    const modal = document.getElementById('cart-modal');
    const overlay = document.getElementById('cart-overlay');
    if(!modal || !overlay) return;

    const isHidden = modal.style.display !== 'block';
    modal.style.display = isHidden ? 'block' : 'none';
    overlay.style.display = isHidden ? 'block' : 'none';
    if(isHidden) renderCartItems();
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    if(!container) return;
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
    if(cart.length === 0) return;
    const msg = `Order from Doon Cafe:\n` + cart.map((i, idx) => `${idx+1}. ${i.name} (${i.price})`).join('\n');
    window.open(`https://api.whatsapp.com/send?phone=919999999999&text=${encodeURIComponent(msg)}`, '_blank');
}

// 🍽️ MENU & WEATHER LOGIC
async function initMenu() {
    const menuContainer = document.getElementById("menu-container");
    if(!menuContainer) return;

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
            
            // 🔥 SAFE ACCESS: Dono (Capital/Small) check kar raha hai
            const w = item.Weather || item.weather || "";
            const n = item.Name || item.name || "Menu Item";
            const p = item.Price || item.price || "N/A";
            const emoji = item.Emoji || item.emoji || "🍽️";

            if (w.toLowerCase() === weatherMode) {
                // String escape for onclick
                const safeName = n.toString().replace(/'/g, "\\'");
                html += `
                    <div class="special-card" style="padding: 20px; background: white; border: 2px solid #4f46e5; border-radius: 16px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <span style="font-size: 30px;">${emoji}</span>
                        <h3 style="margin: 5px 0;">${n}</h3>
                        <p style="font-weight: bold; color: #10b981;">${p}</p>
                        <button onclick="addToCart('${safeName}', '${p}')" style="background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">Add +</button>
                    </div>`;
            }
        });

        staticMenu.forEach(cat => {
            html += `<h3 style="margin-top: 30px;">${cat.category}</h3><div class="menu-grid">` + 
                cat.items.map(i => `
                    <div class="item-card" style="background: white; padding: 15px; border-radius: 12px; border: 1px solid #eee;">
                        <div style="font-weight: 600;">${i.name}</div>
                        <div style="color: #059669; font-weight: bold;">${i.price}</div>
                        <button onclick="addToCart('${i.name.replace(/'/g, "\\'")}','${i.price}')" style="margin-top: 10px; width: 100%; background: #1f2937; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer;">Add +</button>
                    </div>`).join('') +
                `</div>`;
        });

        menuContainer.innerHTML = html;
    } catch (e) { 
        console.error("Menu Load Error:", e);
        menuContainer.innerHTML = "<p>Menu load karne mein dikkat aayi. Refresh karke dekhein.</p>";
    }
}

window.onload = initMenu;

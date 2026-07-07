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

const LAT = "30.3165";
const LON = "78.0322";

// 🛒 CART SYSTEM LOGIC
let cart = [];

window.addToCart = function(name, priceStr) {
    cart.push({ name: name, price: priceStr });
    updateCartUI();
    
    // Chota sa alert ki item add ho gaya
    const btn = event.currentTarget;
    const originalText = btn.innerHTML;
    btn.innerHTML = "Added ✅";
    btn.style.background = "#10b981"; // Green color
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = "#1f2937";
    }, 1500);
}

function updateCartUI() {
    const cartBtn = document.getElementById('floating-cart-btn');
    if(cart.length > 0) {
        cartBtn.style.display = 'block';
        cartBtn.innerHTML = `🛒 View Cart (${cart.length} items)`;
    } else {
        cartBtn.style.display = 'none';
        document.getElementById('cart-modal').style.display = 'none';
        document.getElementById('cart-overlay').style.display = 'none';
    }
}

window.toggleCart = function() {
    const modal = document.getElementById('cart-modal');
    const overlay = document.getElementById('cart-overlay');
    if(modal.style.display === 'block') {
        modal.style.display = 'none';
        overlay.style.display = 'none';
    } else {
        renderCartItems();
        modal.style.display = 'block';
        overlay.style.display = 'block';
    }
}

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    let html = "";
    cart.forEach((item, index) => {
        html += `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid #f3f4f6; padding-bottom:8px;">
            <span style="font-weight:600; font-size:14px; color:#374151;">${item.name}</span>
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-weight:bold; color:#10b981;">${item.price}</span>
                <button onclick="removeFromCart(${index})" style="background:#ef4444; color:white; border:none; border-radius:50%; width:24px; height:24px; cursor:pointer; font-weight:bold;">X</button>
            </div>
        </div>`;
    });
    container.innerHTML = html;
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    updateCartUI();
    if(cart.length > 0) renderCartItems();
}

window.checkout = function() {
    if(cart.length === 0) return;
    const shopOwnerNumber = "919999999999"; // <-- Apne client ka number yahan daalo
    
    let message = `Hello Doon Cafe! *New Order* 🚨\n\nI want to order:\n`;
    cart.forEach((item, i) => {
        message += `${i+1}. ${item.name} (${item.price})\n`;
    });
    message += `\nPlease prepare my order!`;
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${shopOwnerNumber}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// 🎨 INJECTING CUSTOM CSS FOR GRID & CART UI
const customCSS = `
    .menu-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    @media (max-width: 1024px) { .menu-grid { grid-template-columns: repeat(3, 1fr); } }
    @media (max-width: 768px) { .menu-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 480px) { .menu-grid { grid-template-columns: 1fr; } }
    
    .cart-btn { position: fixed; bottom: 30px; right: 30px; background: #4f46e5; color: white; padding: 16px 28px; border-radius: 50px; font-weight: bold; font-size: 16px; cursor: pointer; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4); z-index: 1000; display: none; transition: transform 0.2s; }
    .cart-btn:hover { transform: scale(1.05); }
    
    .cart-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 20px; box-shadow: 0 20px 50px rgba(0,0,0,0.3); z-index: 1001; display: none; width: 90%; max-width: 450px; max-height: 80vh; overflow-y: auto; }
    .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 1000; display: none; }
`;
const styleSheet = document.createElement("style");
styleSheet.innerText = customCSS;
document.head.appendChild(styleSheet);

// HTML FOR CART
const cartHTML = `
    <div id="cart-overlay" class="overlay" onclick="toggleCart()"></div>
    <div id="cart-modal" class="cart-modal">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h2 style="margin:0; font-size:24px; color:#1f2937;">Your Order 🛒</h2>
            <button onclick="toggleCart()" style="background:none; border:none; font-size:20px; cursor:pointer;">✖</button>
        </div>
        <div id="cart-items-container" style="margin-bottom: 25px;"></div>
        <button onclick="checkout()" style="width:100%; padding:14px; background:#10b981; color:white; border:none; border-radius:12px; font-weight:bold; cursor:pointer; font-size:16px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);">Send Order to WhatsApp 📲</button>
    </div>
    <div id="floating-cart-btn" class="cart-btn" onclick="toggleCart()">🛒 View Cart</div>
`;
document.body.insertAdjacentHTML('beforeend', cartHTML);

// 📜 HARDCODED FULL MENU DATA
const staticMenu = [
    {
        category: "🍝 PASTA",
        items: [
            { name: "Saffron Leaf Signature Pasta", price: "₹395" },
            { name: "Pomodoro Veg/Non-Veg Pasta", price: "₹395/475" },
            { name: "Genoa Pesto Veg/Non-Veg Pasta", price: "₹395/445" },
            { name: "Ek Hot Arrabbiata Veg/Non-Veg", price: "₹325/375" },
            { name: "Alfredo Lala Veg/Non-Veg", price: "₹395/445" }
        ]
    },
    {
        category: "🍕 PIZZA",
        items: [
            { name: "Margherita Pizza", price: "₹395/445" },
            { name: "Loaded Chicken Pizza", price: "₹475/545" },
            { name: "Chinawala Chicken Pizza", price: "₹495/545" },
            { name: "Chinawala Paneer Pizza", price: "₹375/495" }
        ]
    },
    {
        category: "🥟 DIM SUMS",
        items: [
            { name: "Veg Momo", price: "₹225" },
            { name: "Paneer Momo", price: "₹325" },
            { name: "Chicken Momo", price: "₹375" },
            { name: "Tandoori Momo Veg/Non-veg", price: "₹325/375" }
        ]
    },
    {
        category: "🍹 BEVERAGES",
        items: [
            { name: "Masala Tea", price: "₹95" },
            { name: "Virgin Mojito", price: "₹175" },
            { name: "Cold Coffee with Ice Cream", price: "₹245" },
            { name: "Blue Curacao", price: "₹195" }
        ]
    }
];

async function checkWeatherAndSetTheme() {
    const menuContainer = document.getElementById("menu-container");

    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,rain,weather_code`);
        const data = await response.json();
        
        const temp = data.current.temperature_2m;
        const isRain = data.current.rain > 0;
        let weatherMode = "cold"; 

        if (isRain || data.current.weather_code >= 51) weatherMode = "rainy";
        else if (temp > 25) weatherMode = "sunny";

        // 🔥 FIRESTORE SE WEATHER SPECIAL ITEM NIKALNA
        const snapshot = await db.collection("menu items").get();
        let specialItemHTML = "";

        snapshot.forEach(doc => {
            const itemData = doc.data();
            const targetWeather = itemData.Weather || itemData.weather || "";

            if (targetWeather.toLowerCase() === weatherMode.toLowerCase()) {
                // FIXED: Box size limit kar diya (max-width: 300px) taaki wo compact 4x4 square jaisa dikhe
                specialItemHTML = `
                    <div style="margin-bottom: 50px; text-align: center;">
                        <h3 style="font-size: 20px; font-weight: 800; color: #1e1b4b; margin-bottom: 15px;">🌟 Today's Weather Special</h3>
                        <div style="max-width: 320px; margin: 0 auto; background: white; padding: 25px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 2px solid #6366f1;">
                            <div style="font-size: 50px; margin-bottom: 10px;">${itemData.Emoji || itemData.emoji || "🍽️"}</div>
                            <h4 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 5px;">${itemData.Name || itemData.name}</h4>
                            <p style="color: #6b7280; font-size: 13px; margin-bottom: 15px; min-height: 40px;">${itemData.Description || itemData.description}</p>
                            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f3f4f6; padding-top: 15px;">
                                <span style="font-size: 22px; font-weight: 900; color: #4f46e5;">${itemData.Price || itemData.price}</span>
                                <button onclick="addToCart('${itemData.Name.replace(/'/g, "\\'")}', '${itemData.Price}')" style="background: #4f46e5; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold;">
                                    Add +
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }
        });

        // 🔥 STATIC FULL MENU HTML BANANA (Grid me 4 per row)
        let fullMenuHTML = "";
        staticMenu.forEach(cat => {
            let itemsHTML = "";
            cat.items.forEach(item => {
                itemsHTML += `
                    <div style="background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.04); border: 1px solid #f3f4f6; display: flex; flex-direction: column; justify-content: space-between;">
                        <h4 style="font-size: 16px; font-weight: 700; color: #1f2937; margin: 0 0 10px 0;">${item.name}</h4>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                            <span style="font-size: 16px; font-weight: 800; color: #10b981;">${item.price}</span>
                            <button onclick="addToCart('${item.name.replace(/'/g, "\\'")}', '${item.price}')" style="background: #1f2937; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold;">
                                Add +
                            </button>
                        </div>
                    </div>
                `;
            });

            fullMenuHTML += `
                <div style="margin-bottom: 40px;">
                    <h3 style="font-size: 20px; font-weight: 800; color: #4b5563; margin-bottom: 20px; text-transform: uppercase;">${cat.category}</h3>
                    <div class="menu-grid">
                        ${itemsHTML}
                    </div>
                </div>
            `;
        });

        menuContainer.innerHTML = `
            ${specialItemHTML}
            <div style="margin-top: 40px; max-width: 1200px; margin-left: auto; margin-right: auto; padding: 0 20px;">
                ${fullMenuHTML}
            </div>
        `;

    } catch (error) {
        console.error("Error:", error);
    }
}

window.onload = checkWeatherAndSetTheme;

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

function addToCart(name, price) {
    cart.push({ name, price });
    // Update button count
    const btn = document.getElementById('cart-float');
    if (btn) btn.innerText = `🛒 View Cart (${cart.length})`;
    alert(`${name} added to cart!`);
}

function checkout() {
    if (cart.length === 0) { alert("Cart is empty!"); return; }
    let msg = "Hello Doon Cafe! *New Order Alert* 🚨\n\nI want to order:\n";
    cart.forEach((item, index) => {
        msg += `${index + 1}. ${item.name} (${item.price})\n`;
    });
    msg += "\nPlease prepare it!";
    
    const whatsappUrl = `https://api.whatsapp.com/send?phone=919999999999&text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');
}

// Dehradun Coordinates
const LAT = "30.3165";
const LON = "78.0322";

// Static Menu (As provided)
const staticMenu = [
    { category: "🍝 PASTA", items: [{ name: "Saffron Leaf Signature Pasta", price: "₹395" }, { name: "Pomodoro Veg/Non-Veg Pasta", price: "₹395/475" }, { name: "Genoa Pesto Veg/Non-Veg Pasta", price: "₹395/445" }, { name: "Ek Hot Arrabbiata Veg/Non-Veg", price: "₹325/375" }, { name: "Alfredo Lala Veg/Non-Veg Pasta", price: "₹395/445" }] },
    { category: "🍕 PIZZA", items: [{ name: "Margherita Pizza 10\" & 12\"", price: "₹395/445" }, { name: "Loaded Chicken Pizza 10\" & 12\"", price: "₹475/545" }, { name: "Chinawala Chicken Pizza 10\" & 12\"", price: "₹495/545" }, { name: "Chinawala Paneer Pizza 10\" & 12\"", price: "₹375/495" }, { name: "Murgh Makhanwala Pizza 10\" & 12\"", price: "₹495/575" }, { name: "All Veggies Pizza 10\" & 12\"", price: "₹395/425" }] },
    { category: "🥟 DIM SUMS", items: [{ name: "Veg Momo", price: "₹225" }, { name: "Paneer Momo", price: "₹325" }, { name: "Chicken Momo", price: "₹375" }, { name: "Crystal Momo Veg/Non-veg", price: "₹445/495" }, { name: "Atta Momo Veg/Non-veg", price: "₹325/375" }, { name: "Tandoori Momo Veg/Non-veg", price: "₹325/375" }] },
    { category: "🥪 SANDWICH & BURGER", items: [{ name: "Club Sandwich Veg/Non-Veg", price: "₹395/425" }, { name: "Grilled Sandwich Veg/Non-Veg", price: "₹345/425" }, { name: "Kathi Roll Veg/Non-Veg", price: "₹375/475" }, { name: "Egg Roll", price: "₹395" }, { name: "Veg Farmhouse Burger", price: "₹375" }, { name: "Bbq Chicken Cheese Burger", price: "₹475" }, { name: "Classic American Burger Non-Veg", price: "₹475" }] },
    { category: "🍲 SOUP", items: [{ name: "Cream Soup (Tomato/Mushroom/Veg/Chicken)", price: "₹195/225" }, { name: "Lung-Fung Soup Veg/Non-Veg", price: "₹195/225" }, { name: "Manchow Soup Veg/Non-Veg", price: "₹195/225" }, { name: "Hot N Sour Soup Veg/Non-Veg", price: "₹195/225" }, { name: "Sweet Corn Soup Veg/Non-Veg", price: "₹195/225" }, { name: "Baked Vegetable Soup", price: "₹245" }] },
    { category: "🍗 NON-VEG MAIN COURSE", items: [{ name: "Murgh Tikka Lababdar", price: "₹575/855" }, { name: "Kadai Chicken Half/Full", price: "₹575/855" }, { name: "Butter Chicken Half/Full", price: "₹575/855" }, { name: "Pahadi Chicken Curry Half/Full", price: "₹575/855" }, { name: "Chicken Rara Half/Full", price: "₹575/855" }, { name: "Chicken Changezi Half/Full", price: "₹575/855" }, { name: "Mutton Dooniya Curry", price: "₹595" }, { name: "Mutton Rara", price: "₹595" }, { name: "Dooniya Fish Curry", price: "₹625" }, { name: "Dooniya Prawns Curry", price: "₹1125" }, { name: "Kasmiri Mutton Rogan Josh", price: "₹595" }] },
    { category: "🍹 BEVERAGES", items: [{ name: "Mineral Water", price: "₹60" }, { name: "Cold Drink", price: "₹70" }, { name: "Masala Tea", price: "₹95" }, { name: "Green Tea", price: "₹80" }, { name: "Lemon Tea", price: "₹105" }, { name: "Fresh Lime Water", price: "₹100" }, { name: "Fresh Lime Soda", price: "₹120" }, { name: "Masala Lemonade", price: "₹175" }, { name: "Blue Curacao", price: "₹195" }, { name: "Virgin Mojito", price: "₹175" }, { name: "Lemon Ice Tea", price: "₹175" }, { name: "Peach Ice Tea", price: "₹175" }, { name: "Masala Chach", price: "₹145" }, { name: "Sweet Lassi", price: "₹145" }, { name: "Cold Coffee", price: "₹195" }, { name: "Cold Coffee with Ice Cream", price: "₹245" }, { name: "Soda 750 ML", price: "₹50" }] }
];

async function checkWeatherAndSetTheme() {
    const badge = document.getElementById("weather-badge");
    const heroTitle = document.getElementById("hero-title");
    const heroDesc = document.getElementById("hero-desc");
    const menuContainer = document.getElementById("menu-container");

    try {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,rain,weather_code`);
        const data = await response.json();
        
        const temp = data.current.temperature_2m;
        const isRain = data.current.rain > 0;
        const weatherCode = data.current.weather_code;

        let weatherMode = "cold"; 
        document.body.classList.remove('theme-rainy', 'theme-sunny', 'theme-cold');

        if (isRain || weatherCode >= 51) {
            document.body.classList.add('theme-rainy');
            if(badge) badge.innerHTML = "🌧️ Monsoon Mode Active";
            if(heroTitle) heroTitle.innerHTML = "Chai & Rains in Doon!";
            if(heroDesc) heroDesc.innerHTML = "Outside it's pouring. Enjoy our special hot snacks.";
            weatherMode = "rainy";
        } else if (temp > 25) {
            document.body.classList.add('theme-sunny');
            if(badge) badge.innerHTML = `☀️ Summer Mode (${temp}°C)`;
            if(heroTitle) heroTitle.innerHTML = "Beat the Dehradun Heat!";
            if(heroDesc) heroDesc.innerHTML = "Cool down instantly with our premium refreshing iced chillers.";
            weatherMode = "sunny";
        } else {
            document.body.classList.add('theme-cold');
            if(badge) badge.innerHTML = `🥶 Cozy Evening Mode (${temp}°C)`;
            if(heroTitle) heroTitle.innerHTML = "Warm & Cozy Vibe";
            if(heroDesc) heroDesc.innerHTML = "The hills are cold tonight. Grab something warm.";
            weatherMode = "cold";
        }

        const snapshot = await db.collection("menu items").get();
        let specialItemHTML = "";

        snapshot.forEach(doc => {
            const itemData = doc.data();
            const targetWeather = itemData.Weather || itemData.weather || "";

            if (targetWeather.toLowerCase() === weatherMode.toLowerCase()) {
                const n = itemData.Name || itemData.name || "Special Item";
                const p = itemData.Price || itemData.price || "₹0";
                const fEmoji = itemData.Emoji || itemData.emoji || "🍽️";

                // Fix: Compacted design for special box
                specialItemHTML = `
                    <div style="max-width: 400px; margin: 0 auto 40px auto; background: white; padding: 20px; border-radius: 20px; border: 2px solid #6366f1; text-align: center; box-shadow: 0 10px 15px rgba(0,0,0,0.1);">
                        <h4 style="margin: 0 0 10px 0; color: #4f46e5; font-size: 14px;">🌟 WEATHER SPECIAL</h4>
                        <div style="font-size: 40px; margin-bottom: 10px;">${fEmoji}</div>
                        <h3 style="margin: 0 0 10px 0;">${n}</h3>
                        <p style="font-weight: bold; font-size: 18px; margin-bottom: 15px; color: #10b981;">${p}</p>
                        <button onclick="addToCart('${n.replace(/'/g, "\\'")}', '${p}')" style="background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 10px; cursor: pointer; font-weight: bold;">Add to Cart ➕</button>
                    </div>
                `;
            }
        });

        let fullMenuHTML = "";
        staticMenu.forEach(cat => {
            let itemsHTML = "";
            cat.items.forEach(item => {
                itemsHTML += `
                    <div style="background: white; padding: 15px; border-radius: 12px; border: 1px solid #e5e7eb; display: flex; flex-direction: column; justify-content: space-between;">
                        <h4 style="font-size: 14px; font-weight: 600; color: #1f2937; margin: 0 0 10px 0;">${item.name}</h4>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                            <span style="font-weight: 800; color: #10b981;">${item.price}</span>
                            <button onclick="addToCart('${item.name.replace(/'/g, "\\'")}', '${item.price}')" style="background: #1f2937; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;">Add ➕</button>
                        </div>
                    </div>
                `;
            });

            fullMenuHTML += `
                <div style="margin-bottom: 40px;">
                    <h3 style="margin-bottom: 15px; font-weight: 800; color: #374151; border-left: 4px solid #4f46e5; padding-left: 10px;">${cat.category}</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 15px;">
                        ${itemsHTML}
                    </div>
                </div>
            `;
        });

        menuContainer.innerHTML = `
            ${specialItemHTML}
            <div style="max-width: 1100px; margin: 0 auto; padding: 0 15px;">
                <h2 style="text-align: center; margin-bottom: 30px;">📜 OUR FULL CAFE MENU</h2>
                ${fullMenuHTML}
            </div>
            <div style="height: 100px;"></div>
        `;

        // Add Floating Cart Button
        if(!document.getElementById('cart-float')) {
            document.body.insertAdjacentHTML('beforeend', `<div id="cart-float" style="position:fixed; bottom:20px; right:20px; background:#10b981; color:white; padding:15px 25px; border-radius:30px; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.3); z-index:9999; font-weight:bold; font-size:16px;" onclick="checkout()">🛒 View Cart (0)</div>`);
        }

    } catch (error) { console.error("Error:", error); }
}

window.onload = checkWeatherAndSetTheme;

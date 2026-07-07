const firebaseConfig = {
  apiKey: "AIzaSyBQT0bQYJlHwV0zUQGmQTBiFSauYhdAEOc",
  authDomain: "summer-weather-menu.firebaseapp.com",
  projectId: "summer-weather-menu",
  storageBucket: "summer-weather-menu.firebasestorage.app",
  messagingSenderId: "739249916204",
  appId: "1:739249916204:web:3a76e0f4b27e13521b8489"
};


// Firebase Initialize
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Dehradun Coordinates
const LAT = "30.3165";
const LON = "78.0322";

// 📜 HARDCODED FULL MENU DATA (Mausam se alag, hmesha dikhega)
const staticMenu = [
    {
        category: "🍝 PASTA",
        items: [
            { name: "Saffron Leaf Signature Pasta", price: "₹395" },
            { name: "Pomodoro Veg/Non-Veg Pasta", price: "₹395/475" },
            { name: "Genoa Pesto Veg/Non-Veg Pasta", price: "₹395/445" },
            { name: "Ek Hot Arrabbiata Veg/Non-Veg", price: "₹325/375" },
            { name: "Alfredo Lala Veg/Non-Veg Pasta", price: "₹395/445" }
        ]
    },
    {
        category: "🍕 PIZZA",
        items: [
            { name: "Margherita Pizza 10\" & 12\"", price: "₹395/445" },
            { name: "Loaded Chicken Pizza 10\" & 12\"", price: "₹475/545" },
            { name: "Chinawala Chicken Pizza 10\" & 12\"", price: "₹495/545" },
            { name: "Chinawala Paneer Pizza 10\" & 12\"", price: "₹375/495" },
            { name: "Murgh Makhanwala Pizza 10\" & 12\"", price: "₹495/575" },
            { name: "All Veggies Pizza 10\" & 12\"", price: "₹395/425" }
        ]
    },
    {
        category: "🥟 DIM SUMS",
        items: [
            { name: "Veg Momo", price: "₹225" },
            { name: "Paneer Momo", price: "₹325" },
            { name: "Chicken Momo", price: "₹375" },
            { name: "Crystal Momo Veg/Non-veg", price: "₹445/495" },
            { name: "Atta Momo Veg/Non-veg", price: "₹325/375" },
            { name: "Tandoori Momo Veg/Non-veg", price: "₹325/375" }
        ]
    },
    {
        category: "🥪 SANDWICH & BURGER",
        items: [
            { name: "Club Sandwich Veg/Non-Veg", price: "₹395/425" },
            { name: "Grilled Sandwich Veg/Non-Veg", price: "₹345/425" },
            { name: "Kathi Roll Veg/Non-Veg", price: "₹375/475" },
            { name: "Egg Roll", price: "₹395" },
            { name: "Veg Farmhouse Burger", price: "₹375" },
            { name: "Bbq Chicken Cheese Burger", price: "₹475" },
            { name: "Classic American Burger Non-Veg", price: "₹475" }
        ]
    },
    {
        category: "🍲 SOUP",
        items: [
            { name: "Cream Soup (Tomato/Mushroom/Veg/Chicken)", price: "₹195/225" },
            { name: "Lung-Fung Soup Veg/Non-Veg", price: "₹195/225" },
            { name: "Manchow Soup Veg/Non-Veg", price: "₹195/225" },
            { name: "Hot N Sour Soup Veg/Non-Veg", price: "₹195/225" },
            { name: "Sweet Corn Soup Veg/Non-Veg", price: "₹195/225" },
            { name: "Baked Vegetable Soup", price: "₹245" }
        ]
    },
    {
        category: "🍗 NON-VEG MAIN COURSE",
        items: [
            { name: "Murgh Tikka Lababdar", price: "₹575/855" },
            { name: "Kadai Chicken Half/Full", price: "₹575/855" },
            { name: "Butter Chicken Half/Full", price: "₹575/855" },
            { name: "Pahadi Chicken Curry Half/Full", price: "₹575/855" },
            { name: "Chicken Rara Half/Full", price: "₹575/855" },
            { name: "Chicken Changezi Half/Full", price: "₹575/855" },
            { name: "Mutton Dooniya Curry", price: "₹595" },
            { name: "Mutton Rara", price: "₹595" },
            { name: "Dooniya Fish Curry", price: "₹625" },
            { name: "Dooniya Prawns Curry", price: "₹1125" },
            { name: "Kasmiri Mutton Rogan Josh", price: "₹595" }
        ]
    },
    {
        category: "🍹 BEVERAGES",
        items: [
            { name: "Mineral Water", price: "₹60" },
            { name: "Cold Drink", price: "₹70" },
            { name: "Masala Tea", price: "₹95" },
            { name: "Green Tea", price: "₹80" },
            { name: "Lemon Tea", price: "₹105" },
            { name: "Fresh Lime Water", price: "₹100" },
            { name: "Fresh Lime Soda", price: "₹120" },
            { name: "Masala Lemonade", price: "₹175" },
            { name: "Blue Curacao", price: "₹195" },
            { name: "Virgin Mojito", price: "₹175" },
            { name: "Lemon Ice Tea", price: "₹175" },
            { name: "Peach Ice Tea", price: "₹175" },
            { name: "Masala Chach", price: "₹145" },
            { name: "Sweet Lassi", price: "₹145" },
            { name: "Cold Coffee", price: "₹195" },
            { name: "Cold Coffee with Ice Cream", price: "₹245" },
            { name: "Soda 750 ML", price: "₹50" }
        ]
    }
];

async function checkWeatherAndSetTheme() {
    const badge = document.getElementById("weather-badge");
    const heroTitle = document.getElementById("hero-title");
    const heroDesc = document.getElementById("hero-desc");
    const menuContainer = document.getElementById("menu-container");

    try {
        // Live Weather Fetching
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
        } 
        else if (temp > 25) {
            document.body.classList.add('theme-sunny');
            if(badge) badge.innerHTML = `☀️ Summer Mode (${temp}°C)`;
            if(heroTitle) heroTitle.innerHTML = "Beat the Dehradun Heat!";
            if(heroDesc) heroDesc.innerHTML = "Cool down instantly with our premium refreshing iced chillers.";
            weatherMode = "sunny";
        } 
        else {
            document.body.classList.add('theme-cold');
            if(badge) badge.innerHTML = `🥶 Cozy Evening Mode (${temp}°C)`;
            if(heroTitle) heroTitle.innerHTML = "Warm & Cozy Vibe";
            if(heroDesc) heroDesc.innerHTML = "The hills are cold tonight. Grab something warm.";
            weatherMode = "cold";
        }

        // 🔥 FIRESTORE SE WEATHER SPECIAL ITEM NIKALNA
        const snapshot = await db.collection("menu items").get();
        let specialItemHTML = "";

        snapshot.forEach(doc => {
            const itemData = doc.data();
            const targetWeather = itemData.Weather || itemData.weather || "";

            if (targetWeather.toLowerCase() === weatherMode.toLowerCase()) {
                const finalName = itemData.Name || itemData.name || "Special Item";
                const finalEmoji = itemData.Emoji || itemData.emoji || "🍽️";
                const finalDescription = itemData.Description || itemData.description || "";
                const finalPrice = itemData.Price || itemData.price || "₹0";

                specialItemHTML = `
                    <div style="margin-bottom: 40px; text-align: center;">
                        <h3 style="font-size: 22px; font-weight: 800; color: #1e1b4b; background: #e0e7ff; padding: 8px 20px; border-radius: 9999px; display: inline-block; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">🌟 Today's Weather Special</h3>
                        <div style="max-w: 420px; margin: 0 auto; background: white; padding: 30px; border-radius: 24px; box-shadow: 0 15px 35px rgba(0,0,0,0.1); border: 3px solid #6366f1; transform: scale(1.02);">
                            <div style="font-size: 65px; margin-bottom: 15px;">${finalEmoji}</div>
                            <h4 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 8px;">${finalName}</h4>
                            <p style="color: #4b5563; font-size: 14px; margin-bottom: 20px;">${finalDescription}</p>
                            <div style="display: flex; justify-content: space-between; align-items: center; background: #f9fafb; padding: 12px 20px; border-radius: 16px;">
                                <span style="font-size: 26px; font-weight: 900; color: #4f46e5;">${finalPrice}</span>
                                <button onclick="sendOrder('${finalName.replace(/'/g, "\\'")}', '${finalPrice}')" style="background: #4f46e5; color: white; border: none; padding: 12px 26px; border-radius: 12px; cursor: pointer; font-size: 16px; font-weight: bold; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3); transition: 0.2s;">
                                    Order Special 📲
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }
        });

        // 🔥 STATIC FULL MENU KA HTML BANANA (Grid Category Layout)
        let fullMenuHTML = "";
        staticMenu.forEach(cat => {
            let itemsHTML = "";
            cat.items.forEach(item => {
                itemsHTML += `
                    <div style="background: white; padding: 18px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.03); border: 1px solid #f3f4f6; display: flex; flex-direction: column; justify-content: space-between; text-align: left;">
                        <div>
                            <h4 style="font-size: 16px; font-weight: 700; color: #1f2937; margin: 0 0 6px 0; line-height: 1.4;">${item.name}</h4>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; pt: 8px; border-top: 1px dashed #f3f4f6;">
                            <span style="font-size: 18px; font-weight: 800; color: #10b981;">${item.price}</span>
                            <button onclick="sendOrder('${item.name.replace(/'/g, "\\'")}', '${item.price}')" style="background: #1f2937; color: white; border: none; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                                Order 📲
                            </button>
                        </div>
                    </div>
                `;
            });

            fullMenuHTML += `
                <div style="margin-bottom: 45px;">
                    <h3 style="font-size: 20px; font-weight: 800; color: #1f2937; border-left: 5px solid #4f46e5; padding-left: 12px; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px;">${cat.category}</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px;">
                        ${itemsHTML}
                    </div>
                </div>
            `;
        });

        // 🔥 DONO KO CONTAINER ME DAALNA
        menuContainer.innerHTML = `
            ${specialItemHTML || '<p style="text-align: center; color: #9ca3af; font-style: italic; margin-bottom: 30px;">No specific weather match today. Explore full menu below!</p>'}
            
            <div style="margin-top: 50px; border-top: 2px dashed #e5e7eb; padding-top: 40px; max-width: 1100px; margin-left: auto; margin-right: auto; padding-left: 15px; padding-right: 15px;">
                <h2 style="font-size: 28px; font-weight: 900; color: #1f2937; text-align: center; margin-bottom: 40px; position: relative;">📜 OUR FULL CAFE MENU</h2>
                ${fullMenuHTML}
            </div>
        `;

    } catch (error) {
        console.error("Error building premium layout:", error);
    }
}

// WhatsApp redirect function (Direct Item Name aur Price pass karega)
function sendOrder(itemName, itemPrice) {
    // Client ka actual mobile number yahan 91 ke sath daalo
    const shopOwnerNumber = "919999999999"; 
    
    const message = `Hello Doon Cafe! *New Order Alert* 🚨\n\nI want to order:\n📦 *Item:* ${itemName}\n💰 *Price:* ${itemPrice}\n\nPlease prepare it!`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${shopOwnerNumber}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

window.onload = checkWeatherAndSetTheme;

// 1. Firebase Configuration (Apni asli keys yahan daalo)
const firebaseConfig = {
  apiKey: "AIzaSyBQT0bQYJlHwV0zUQGmQTBiFSauYhdAEOc",
  authDomain: "summer-weather-menu.firebaseapp.com",
  projectId: "summer-weather-menu",
  storageBucket: "summer-weather-menu.firebasestorage.app",
  messagingSenderId: "739249916204",
  appId: "1:739249916204:web:3a76e0f4b27e13521b8489"
};

// Firebase ko initialize karna
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Dehradun (Rajpur Road) Coordinates
const LAT = "30.3165";
const LON = "78.0322";

// 2. Live Weather Fetch karne aur Database se Item nikaalne ka function
async function checkWeatherAndSetTheme() {
    const badge = document.getElementById("weather-badge");
    const heroTitle = document.getElementById("hero-title");
    const heroDesc = document.getElementById("hero-desc");
    const menuContainer = document.getElementById("menu-container"); // Jahan item dikhega

    try {
        // Live data fetching from free API
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,rain,weather_code`);
        const data = await response.json();
        
        const temp = data.current.temperature_2m;
        const isRain = data.current.rain > 0;
        const weatherCode = data.current.weather_code;

        console.log(`Current Dehradun Temp: ${temp}°C, Rain: ${isRain}`);

        // Default weather status variable
        let weatherMode = "cold"; 

        // Remove any default classes first
        document.body.classList.remove('theme-rainy', 'theme-sunny', 'theme-cold');

        // Logic 1: Agar Baarish ho rhi ho (Rain value > 0)
        if (isRain || weatherCode >= 51) {
            document.body.classList.add('theme-rainy');
            badge.innerHTML = "🌧️ Monsoon Mode Active";
            heroTitle.innerHTML = "Chai & Rains in Doon!";
            heroDesc.innerHTML = "Outside it's pouring. Enjoy our special hot snacks made just for this weather.";
            weatherMode = "rainy";
        } 
        // Logic 2: Agar Tez Dhoop/Garmi ho (Temp 25°C se zyada)
        else if (temp > 25) {
            document.body.classList.add('theme-sunny');
            badge.innerHTML = `☀️ Summer Mode (${temp}°C)`;
            heroTitle.innerHTML = "Beat the Dehradun Heat!";
            heroDesc.innerHTML = "Cool down instantly with our premium refreshing iced chillers.";
            weatherMode = "sunny";
        } 
        // Logic 3: Agar Thand ho
        else {
            document.body.classList.add('theme-cold');
            badge.innerHTML = `🥶 Cozy Evening Mode (${temp}°C)`;
            heroTitle.innerHTML = "Warm & Cozy Vibe";
            heroDesc.innerHTML = "The hills are cold tonight. Grab something warm to keep you comfortable.";
            weatherMode = "cold";
        }

        // 🔥 FIRESTORE SE LIVE DATA LENA 🔥
        // Hum us item ko dhoondenge jiska 'weather' hamare current 'weatherMode' se match karega
        const snapshot = await db.collection("menu_items").where("weather", "==", weatherMode).get();
        
        if (!snapshot.empty) {
            const itemData = snapshot.docs[0].data();
            
            // HTML ke andar Dynamic Card insert karna
            menuContainer.innerHTML = `
                <div class="menu-item max-w-sm mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-6 border border-gray-100 text-center">
                    <div class="text-6xl my-4">${itemData.emoji || '🍽️'}</div>
                    <h4 class="text-2xl font-bold text-gray-800 mb-2">${itemData.name}</h4>
                    <p class="text-gray-500 text-sm mb-4">${itemData.description}</p>
                    <div class="flex justify-between items-center mt-6">
                        <span class="text-3xl font-extrabold text-indigo-600">${itemData.price}</span>
                        <button onclick="sendOrder()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition duration-200">
                            Order Now 📲
                        </button>
                    </div>
                </div>
            `;
        } else {
            menuContainer.innerHTML = `<p class="text-center text-gray-500">No item found in database for this weather.</p>`;
        }

    } catch (error) {
        console.error("Weather fetch or Firestore failed:", error);
        badge.innerHTML = "✨ Doon Special Mode";
        if(menuContainer) {
            menuContainer.innerHTML = `<p class="text-center text-gray-500">Koshish jaari hai... Loading Menu!</p>`;
        }
    }
}

// 3. WhatsApp par automatic order bhejne ka function
function sendOrder() {
    const visibleItem = document.querySelector('.menu-item');
    
    let itemName = "Special Item";
    let itemPrice = "Market Price";

    if (visibleItem) {
        itemName = visibleItem.querySelector('h4').innerText;
        itemPrice = visibleItem.querySelector('.font-extrabold').innerText;
    }

    // Shopkeeper ka WhatsApp Number
    const shopOwnerNumber = "919999999999"; 

    // Professional message formatting
    const message = `Hello Doon Cafe! *New Order Alert* 🚨\n\nI scanned your Smart QR and want to order:\n📦 *Item:* ${itemName}\n💰 *Price:* ${itemPrice}\n\nPlease prepare it!`;

    // Encode message for URL
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${shopOwnerNumber}&text=${encodeURIComponent(message)}`;
    
    // Direct link open karna
    window.open(whatsappUrl, '_blank');
}

// Website load hote hi weather check aur database fetch run karo
window.onload = checkWeatherAndSetTheme;

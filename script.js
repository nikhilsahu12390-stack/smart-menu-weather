const firebaseConfig = {
  apiKey: "AIzaSyBQT0bQYJlHwV0zUQGmQTBiFSauYhdAEOc",
  authDomain: "summer-weather-menu.firebaseapp.com",
  projectId: "summer-weather-menu",
  storageBucket: "summer-weather-menu.firebasestorage.app",
  messagingSenderId: "739249916204",
  appId: "1:739249916204:web:3a76e0f4b27e13521b8489"
};

// Firebase Initialize karna
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Dehradun (Rajpur Road) Coordinates
const LAT = "30.3165";
const LON = "78.0322";

// 2. Main Function: Weather check karna aur uske hisab se card load karna
async function checkWeatherAndSetTheme() {
    const badge = document.getElementById("weather-badge");
    const heroTitle = document.getElementById("hero-title");
    const heroDesc = document.getElementById("hero-desc");
    const menuContainer = document.getElementById("menu-container");

    try {
        // Open-Meteo API se live weather data nikalna
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,rain,weather_code`);
        const data = await response.json();
        
        const temp = data.current.temperature_2m;
        const isRain = data.current.rain > 0;
        const weatherCode = data.current.weather_code;

        console.log(`Live Doon Temp: ${temp}°C, Rain: ${isRain}`);

        let weatherMode = "cold"; 

        // CSS Themes ko reset karna
        document.body.classList.remove('theme-rainy', 'theme-sunny', 'theme-cold');

        // Mausam ke hisab se UI Mode set karna
        if (isRain || weatherCode >= 51) {
            document.body.classList.add('theme-rainy');
            badge.innerHTML = "🌧️ Monsoon Mode Active";
            heroTitle.innerHTML = "Chai & Rains in Doon!";
            heroDesc.innerHTML = "Outside it's pouring. Enjoy our special hot snacks made just for this weather.";
            weatherMode = "rainy";
        } 
        else if (temp > 25) {
            document.body.classList.add('theme-sunny');
            badge.innerHTML = `☀️ Summer Mode (${temp}°C)`;
            heroTitle.innerHTML = "Beat the Dehradun Heat!";
            heroDesc.innerHTML = "Cool down instantly with our premium refreshing iced chillers.";
            weatherMode = "sunny";
        } 
        else {
            document.body.classList.add('theme-cold');
            badge.innerHTML = `🥶 Cozy Evening Mode (${temp}°C)`;
            heroTitle.innerHTML = "Warm & Cozy Vibe";
            heroDesc.innerHTML = "The hills are cold tonight. Grab something warm to keep you comfortable.";
            weatherMode = "cold";
        }

        // 🔥 FIRESTORE FETCH: 'menu items' collection se saara data lekar loop chalana
        const snapshot = await db.collection("menu items").get();
        let matchedItem = null;

        snapshot.forEach(doc => {
            const itemData = doc.data();
            // Capital 'Weather' ya lowercase 'weather' dono ko check karega
            const targetWeather = itemData.Weather || itemData.weather;
            
            if (targetWeather && targetWeather.toLowerCase() === weatherMode.toLowerCase()) {
                matchedItem = itemData;
            }
        });
        
        // Agar item mil jata hai toh use premium layout me screen par render karna
        if (matchedItem) {
            // Capital aur Lowercase field names ke fallbacks
            const finalName = matchedItem.Name || matchedItem.name || "Special Item";
            const finalEmoji = matchedItem.Emoji || matchedItem.emoji || "🍽️";
            const finalDescription = matchedItem.Description || matchedItem.description || "";
            const finalPrice = matchedItem.Price || matchedItem.price || "Market Price";

            menuContainer.innerHTML = `
                <div class="menu-item max-w-sm mx-auto bg-white rounded-2xl shadow-xl overflow-hidden p-6 border border-gray-100 text-center">
                    <div class="text-6xl my-4">${finalEmoji}</div>
                    <h4 class="text-2xl font-bold text-gray-800 mb-2">${finalName}</h4>
                    <p class="text-gray-500 text-sm mb-4">${finalDescription}</p>
                    <div class="flex justify-between items-center mt-6">
                        <span class="text-3xl font-extrabold text-indigo-600">${finalPrice}</span>
                        <button onclick="sendOrder()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-xl shadow-md transition duration-200">
                            Order Now 📲
                        </button>
                    </div>
                </div>
            `;
        } else {
            menuContainer.innerHTML = `<p class="text-center text-gray-500">No item found in database for "${weatherMode}" weather.</p>`;
        }

    } catch (error) {
        console.error("Weather fetch or Firestore failed:", error);
        badge.innerHTML = "✨ Doon Special Mode";
        if(menuContainer) {
            menuContainer.innerHTML = `<p class="text-center text-gray-500">Connecting to server... Please refresh!</p>`;
        }
    }
}

// 3. WhatsApp Redirect Function (Automatic details fetch karega)
function sendOrder() {
    const visibleItem = document.querySelector('.menu-item');
    
    let itemName = "Special Item";
    let itemPrice = "Market Price";

    if (visibleItem) {
        itemName = visibleItem.querySelector('h4').innerText;
        const priceElement = visibleItem.querySelector('.text-indigo-600');
        itemPrice = priceElement ? priceElement.innerText : "Market Price";
    }

    // Apne client ka WhatsApp number yahan country code (91) ke sath daalo
    const shopOwnerNumber = "919999999999"; 

    const message = `Hello Doon Cafe! *New Order Alert* 🚨\n\nI scanned your Smart QR and want to order:\n📦 *Item:* ${itemName}\n💰 *Price:* ${itemPrice}\n\nPlease prepare it!`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${shopOwnerNumber}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Page load hote hi poora logic run hoga
window.onload = checkWeatherAndSetTheme;

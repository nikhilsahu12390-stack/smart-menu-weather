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

// 2. Main Function: Weather check karna, Special highlight karna aur Poora Menu load karna
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

        // CSS Themes reset karna
        document.body.classList.remove('theme-rainy', 'theme-sunny', 'theme-cold');

        // Mausam ke hisab se Mode decide karna
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

        // 🔥 DATABASE SE SAARE ITEMS NIKALNA
        const snapshot = await db.collection("menu items").get();
        
        let specialItemHTML = "";
        let fullMenuHTML = "";

        snapshot.forEach(doc => {
            const itemData = doc.data();
            
            // Capital aur Lowercase field handles
            const finalName = itemData.Name || itemData.name || "Special Item";
            const finalEmoji = itemData.Emoji || itemData.emoji || "🍽️";
            const finalDescription = itemData.Description || itemData.description || "";
            const finalPrice = itemData.Price || itemData.price || "Market Price";
            const targetWeather = itemData.Weather || itemData.weather;

            // Card HTML Code (Dynamic parameters ke sath taaki direct sahi text WhatsApp par jaye)
            const cardHTML = `
                <div class="bg-white rounded-2xl shadow-md overflow-hidden p-6 border border-gray-100 text-center transition duration-300 hover:shadow-xl">
                    <div class="text-5xl my-3">${finalEmoji}</div>
                    <h4 class="text-xl font-bold text-gray-800 mb-1">${finalName}</h4>
                    <p class="text-gray-500 text-xs mb-4 min-h-[32px]">${finalDescription}</p>
                    <div class="flex justify-between items-center mt-4">
                        <span class="text-2xl font-extrabold text-indigo-600">${finalPrice}</span>
                        <button onclick="sendOrder('${finalName.replace(/'/g, "\\'")}', '${finalPrice}')" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-1.5 px-4 rounded-xl text-sm shadow-sm transition duration-200">
                            Order 📲
                        </button>
                    </div>
                </div>
            `;

            // 1. Agar item ka weather current weather se match hota hai, toh use Special banao
            if (targetWeather && targetWeather.toLowerCase() === weatherMode.toLowerCase()) {
                specialItemHTML = `
                    <div class="mb-10 text-center">
                        <h3 class="text-xl font-extrabold text-indigo-900 mb-4 inline-block bg-indigo-100 px-4 py-1 rounded-full">🌟 Today's Weather Special</h3>
                        <div class="max-w-md mx-auto bg-gradient-to-br from-white to-indigo-50/30 rounded-3xl shadow-xl overflow-hidden p-8 border-2 border-indigo-400 text-center transform scale-105 transition duration-300">
                            <div class="text-7xl my-4 animate-bounce">${finalEmoji}</div>
                            <h4 class="text-3xl font-bold text-gray-800 mb-2">${finalName}</h4>
                            <p class="text-gray-600 text-sm mb-6">${finalDescription}</p>
                            <div class="flex justify-between items-center bg-white p-4 rounded-2xl shadow-inner">
                                <span class="text-3xl font-black text-indigo-600">${finalPrice}</span>
                                <button onclick="sendOrder('${finalName.replace(/'/g, "\\'")}', '${finalPrice}')" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition duration-200">
                                    Order Special 📲
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }

            // 2. Baaki saare items Full Menu ki list me judte jayenge
            fullMenuHTML += cardHTML;
        });

        // 🔥 POORA LAYOUT SCREEN PAR RENDER KARNA
        menuContainer.innerHTML = `
            ${specialItemHTML || '<p class="text-center text-gray-400 mb-6">No special item for this weather today.</p>'}
            
            <div class="mt-12 border-t border-gray-200/60 pt-8">
                <h3 class="text-2xl font-bold text-gray-800 mb-6 text-center">📜 Explore Our Full Menu</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    ${fullMenuHTML}
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Failed to load menu:", error);
        badge.innerHTML = "✨ Doon Special Mode";
        if(menuContainer) {
            menuContainer.innerHTML = `<p class="text-center text-gray-500">Connecting to server... Please refresh!</p>`;
        }
    }
}

// 3. Smart WhatsApp Function: Ab ye button se seedha dynamic values leta hai
function sendOrder(itemName, itemPrice) {
    // Apne client ka real WhatsApp number yahan daalo country code (91) ke sath
    const shopOwnerNumber = "919999999999"; 

    const message = `Hello Doon Cafe! *New Order Alert* 🚨\n\nI scanned your Smart QR and want to order:\n📦 *Item:* ${itemName}\n💰 *Price:* ${itemPrice}\n\nPlease prepare it!`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${shopOwnerNumber}&text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Page load par execution trigger karna
window.onload = checkWeatherAndSetTheme;

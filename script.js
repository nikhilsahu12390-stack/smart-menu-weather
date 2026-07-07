// Dehradun (Rajpur Road) Coordinates
const LAT = "30.3165";
const LON = "78.0322";

// 1. Live Weather Fetch karne ka function (Open-Meteo API - No Key Needed)
async function checkWeatherAndSetTheme() {
    const badge = document.getElementById("weather-badge");
    const heroTitle = document.getElementById("hero-title");
    const heroDesc = document.getElementById("hero-desc");

    try {
        // Live data fetching from free API
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,rain,weather_code`);
        const data = await response.json();
        
        const temp = data.current.temperature_2m;
        const isRain = data.current.rain > 0;
        const weatherCode = data.current.weather_code;

        console.log(`Current Dehradun Temp: ${temp}°C, Rain: ${isRain}`);

        // Remove any default classes first
        document.body.classList.remove('theme-rainy', 'theme-sunny', 'theme-cold');

        // Logic 1: Agar Baarish ho rhi ho (Rain value > 0)
        if (isRain || weatherCode >= 51) {
            document.body.classList.add('theme-rainy');
            badge.innerHTML = "🌧️ Monsoon Mode Active";
            heroTitle.innerHTML = "Chai & Rains in Doon!";
            heroDesc.innerHTML = "Outside it's pouring. Enjoy our special hot snacks made just for this weather.";
        } 
        // Logic 2: Agar Tez Dhoop/Garmi ho (Temp 25°C se zyada)
        else if (temp > 25) {
            document.body.classList.add('theme-sunny');
            badge.innerHTML = `☀️ Summer Mode (${temp}°C)`;
            heroTitle.innerHTML = "Beat the Dehradun Heat!";
            heroDesc.innerHTML = "Cool down instantly with our premium refreshing iced chillers.";
        } 
        // Logic 3: Agar Thand ho (Temp 25°C ya usse kam - Dehradun Evening/Winter Vibe)
        else {
            document.body.classList.add('theme-cold');
            badge.innerHTML = `🥶 Cozy Evening Mode (${temp}°C)`;
            heroTitle.innerHTML = "Warm & Cozy Vibe";
            heroDesc.innerHTML = "The hills are cold tonight. Grab something warm to keep you comfortable.";
        }

    } catch (error) {
        console.error("Weather fetch failed, loading default fallback:", error);
        // Fallback: Agar internet down ho, toh standard default cold mode active kar do
        document.body.classList.add('theme-cold');
        badge.innerHTML = "✨ Doon Special Mode";
    }
}

// 2. WhatsApp par automatic order bhejne ka function
function sendOrder() {
    // Jo menu item abhi screen par visible hai, uski details nikalna
    const visibleItem = document.querySelector('.menu-item:not([style*="display: none"])');
    
    let itemName = "Special Item";
    let itemPrice = "Market Price";

    if (visibleItem) {
        itemName = visibleItem.querySelector('h4').innerText;
        itemPrice = visibleItem.querySelector('.font-extrabold').innerText;
    }

    // Shopkeeper ka WhatsApp Number (Example ke liye abhi dummy dala hai)
    // Client ko dete waqt yahan unka actual number 91 ke sath daal dena
    const shopOwnerNumber = "919999999999"; 

    // Ek mast professional message formatting
    const message = `Hello Doon Cafe! *New Order Alert* 🚨\n\nI scanned your Smart QR and want to order:\n📦 *Item:* ${itemName}\n💰 *Price:* ${itemPrice}\n\nPlease prepare it!`;

    // Encode message for URL
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${shopOwnerNumber}&text=${encodeURIComponent(message)}`;
    
    // Direct link open karna
    window.open(whatsappUrl, '_blank');
}

// Website load hote hi weather check run karo
window.onload = checkWeatherAndSetTheme;

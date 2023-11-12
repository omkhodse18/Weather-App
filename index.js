const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]")
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const notFoundContainer = document.querySelector(".not-found-container");
const api_Key = "9595f4535cdc6504e9ecb7d1951d7e50";

let currentTab = userTab;

currentTab.classList.add("current-tab");

getfromSessionStorage();

// Tab switching
function switchTab(clickedTab){
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            // I am on your weather container, and now click on search weather tab so active search weather tab
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            notFoundContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else{
            // I am on search container,and now click on your weather tab so active your weather tab
            grantAccessContainer.classList.remove("active");
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            notFoundContainer.classList.remove("active");


            // Now, i am on your weather section,so i have to display weathe .... so lets check local storage first for coordinates, if we have saved them there
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener('click',()=>{
    switchTab(userTab);
});

searchTab.addEventListener('click',()=>{
    switchTab(searchTab);
});

// Checks if co-ordinates are already presen in session storage
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");

    if(!localCoordinates){
        grantAccessContainer.classList.add("active");
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;

    // Make grant container invisible;
    grantAccessContainer.classList.remove("active");

    // Make loader visible
    loadingScreen.classList.add("active");

    // API call 
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_Key}&units=metric`);
        
        if(response.status !== 200){
            loadingScreen.classList.remove("active");
            notFoundContainer.classList.add("active");
        }else{
            const data = await response.json();
            // Make loader invisible
            loadingScreen.classList.remove("active");
    
            userInfoContainer.classList.add("active");
            
            renderWeatherInfo(data);
        }

    } catch (error) {

        loadingScreen.classList.remove("active");
        alert("Enter valid city name");
        console.log("Error occurs => ", error);
        
    }
}

function renderWeatherInfo(weatherInfo){
    // Firstly we have to fetch elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDescription]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temperature = document.querySelector("[data-temprature]");
    const windspeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // fetch values from weatherInfo object and put it
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;

    temperature.innerText = `${weatherInfo?.main?.temp} °C`;

    windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;

    humidity.innerText = `${weatherInfo?.main?.humidity}%`;

    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert("No geolocation support available");
    }
}

function showPosition(position){
    const userCoordinates = {
        lat : position.coords.latitude,
        lon : position.coords.longitude
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));

    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");

grantAccessButton.addEventListener("click", getLocation);

let searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit" , (e) => {
    e.preventDefault(); 
    let cityName = searchInput.value;
    if(cityName === "") return;

    fetchSearchWeatherInfo(cityName);

});

async function fetchSearchWeatherInfo(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${api_Key}&units=metric`);

        if(response.status !== 200){
            loadingScreen.classList.remove("active");
            notFoundContainer.classList.add("active");
        }
        else{
            
            
            const data = await response.json();
            
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        }
        
    } catch (error) {
        loadingScreen.classList.remove("active");
        notFoundContainer.classList.add("active");
        alert("Enter valid city name");
        console.log("Search city error occurs => ", error);
    }
}


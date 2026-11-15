//================ Select Elements ================
// wrapper
const wrapper = document.querySelector("#global-country-custom");
// Trigger
const trigger = wrapper.querySelector(".custom-select-trigger");
// Dropdown
const dropdown = wrapper.querySelector(".custom-select-dropdown");
// Select Country Name from Dropdown
const selectOptions = Array.from(
  wrapper.querySelectorAll(".custom-select-option"),
);
// Search country Dropdown
const selectSearch = document.querySelector(".custom-select-search input");
// Capital City for Selected country
const cityName = document.querySelector("#global-city");
// Year 2026  -- 2027   --  2028
const globalYear = document.querySelector("#global-year");
// Destination
const selectedDestination = document.querySelector(".selected-destination");
const selectedFlag = document.querySelector(".selected-flag");
const selectedCountryName = document.querySelector(".selected-country-name");
const selectedCityName = document.querySelector(".selected-city-name");
const clearButton = document.querySelector(".clear-selection-btn");
// Modal Overlay
const modalOverlay = document.querySelector(".modal-overlay");
const modalBody = document.querySelector("#modal-body");
const modalCloseBtn = document.querySelector("#modal-close-btn");
// Toast Overlay
const toastContainer = document.querySelector(".toast-container");
const toastMessage = document.querySelector("#toast-message");
const toastText = document.querySelector("#toast-text");
const toastCloseBtn = document.querySelector("#toast-close-btn");

// const holidaysContent = document.querySelector("#holidays-content");
// const currentSelectionBadge = document.querySelector(
//   ".current-selection-badge",
// );

// SideBar Active Link and change URL
const navItems = document.querySelectorAll(".nav-item");
// Sections
const sections = document.querySelectorAll(".view");
//================ Variables ================

let selectedCountryCode = "";
let selectedCountry = "";
let currentYear = new Date().getFullYear();

//================ Actions ================

// Toggle Dropdown
function toggleDropdown() {
  dropdown.classList.toggle("open");
  trigger.classList.toggle("open");
}

// Close Dropdown
function closeDropdown() {
  dropdown.classList.remove("open");
  trigger.classList.remove("open");
}

// Clear Selection
function clearGlobalSelection() {
  selectedCountryCode = "";
  selectedCountry = "";

  selectedCountryName.textContent = "";
  selectedCityName.textContent = "";
  cityName.value = "";

  selectedDestination.style.display = "none";

  showToast("Selection Cleared");
}

// **************************************************
// Use OOP
// Country
class Country {
  constructor(name, code, flag) {
    this.name = name;
    this.code = code;
    this.flag = flag;
  }
  getInfo() {
    return `${this.name} , ${this.code} , ${this.flag}`;
  }
}
// country Manager
class CountryManager {
  async getAvailableCountries() {
    try {
      const response = await fetch(
        "https://date.nager.at/api/v3/AvailableCountries",
      );
      if (!response.ok) {
        throw new Error("Failed To fetch Countries");
      }
      const data = await response.json();
      const countries = data.map(
        (country) =>
          new Country(
            country.name,
            country.countryCode,
            `https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png`,
          ),
      );
      return countries;
    } catch (error) {
      console.log("Error Fetching Countries ", error);
      return [];
    }
  }
}
// Holiday
class Holiday {
  constructor(date, localName, name, countryCode, fixed, global, types) {
    this.date = date;
    this.localName = localName;
    this.name = name;
    this.countryCode = countryCode;
    this.fixed = fixed;
    this.global = global;
    this.types = types;
  }
  getHolidayInfo() {
    return `${this.date} ,${this.localName} , ${this.name} , ${this.countryCode}, ${this.types}`;
  }
}
// Holiday Manager
class HolidayManager {
  async getHolidays(currentYear, countryCode) {
    try {
      const response = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${currentYear}/${countryCode}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Holidays");
      }
      const data = await response.json();
      const holidays = data.map(
        (holiday) =>
          new Holiday(
            holiday.date,
            holiday.localName,
            holiday.name,
            holiday.countryCode,
            holiday.fixed,
            holiday.global,
            holiday.types,
          ),
      );
      return holidays;
    } catch (error) {
      console.log("Erroe Fetching Holidays ", error);
      return [];
    }
  }
}

// long Weekend
class LongWeekend {
  constructor(startDate, endDate, dayCount, needBridgeDay) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.dayCount = dayCount;
    this.needBridgeDay = needBridgeDay;
  }
}

// Long Weekends Manager
class LongWeekendsManager {
  async getLongWeekends(year, countryCode) {
    try {
      const response = await fetch(
        `https://date.nager.at/api/v3/LongWeekend/${year}/${countryCode}`,
      );
      if (!response.ok) {
        throw new Error("Failed to Fetch Long Weekends");
      }
      const data = await response.json();
      const weekends = data.map(
        (weekend) =>
          new LongWeekend(
            weekend.startDate,
            weekend.endDate,
            weekend.dayCount,
            weekend.needBridgeDay,
          ),
      );
      return weekends;
    } catch (error) {
      console.log("Error Fetching Weekends", error);
      return [];
    }
  }
}

// GeoCoding Manager
class GeocodingManager {
  async getCoordinates(countryName) {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(countryName)}&count=1&language=en&format=json`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Country");
      }
      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        console.log("Country NOt Found.");
        return null;
      }
      const { latitude, longitude, name, country } = data.results[0];
      return {
        latitude,
        longitude,
        name,
        country,
      };
    } catch (error) {
      console.log("Error fetching Country");
      return null;
    }
  }
}

// Weather Manager
class WeatherManager {
  async getWeather(latitude, longitude) {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant&timezone=auto`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Weather ");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.log("Error Fetching Weather ", error);
      return null;
    }
  }
  getCurrentWeather(data) {
    let {
      temperature_2m,
      relative_humidity_2m,
      apparent_temperature,
      weather_code,
      wind_speed_10m,
      uv_index,
    } = data.current;
    return {
      temperature: temperature_2m,
      humidity: relative_humidity_2m,
      feelsLike: apparent_temperature,
      weatherCode: weather_code,
      windSpeed: wind_speed_10m,
      uvIndex: uv_index,
    };
  }
  getDailyForecast(data) {
    let {
      time,
      weather_code,
      temperature_2m_max,
      temperature_2m_min,
      precipitation_probability_max,
      sunrise,
      sunset,
    } = data.daily;
    return {
      time,
      weatherCode: weather_code,
      maxTemperature: temperature_2m_max,
      minTemperature: temperature_2m_min,
      precipitationProbability: precipitation_probability_max,
      sunrise,
      sunset,
    };
  }
  getHourlyForecast(data) {
    const { time, temperature_2m, weather_code, precipitation_probability } =
      data.hourly;
    return {
      time,
      temperature: temperature_2m,
      weatherCode: weather_code,
      precipitationProbability: precipitation_probability,
    };
  }
}

// Event
class Event {
  constructor(name, date, image, category, venue, priceRanges, url) {
    this.name = name;
    this.date = date;
    this.image = image;
    this.category = category;
    this.venue = venue;
    this.priceRanges = priceRanges;
    this.url = url;
  }
  getEventInfo() {
    return `${this.name} , ${this.date} , ${this.image} , ${this.category}, ${this.venue} ,${this.priceRanges}, ${this.url}`;
  }
}

// Events Manager
class EventsManager {
  async getEvents(cityName, countryCode) {
    try {
      const response = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=VwECw2OiAzxVzIqnwmKJUG41FbeXJk1y&city=${encodeURIComponent(cityName)}&countryCode=${countryCode}&size=20`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Eevents.");
      }
      const data = await response.json();
      const events = data._embedded?.events.map(
        (event) =>
          new Event(
            event.name,
            event.dates?.start?.dateTime,
            event.images?.[0]?.url,
            event.classifications?.[0]?.segment?.name,
            event._embedded?.venues?.[0]?.name,
            event.priceRanges,
            event.url,
          ),
      );
      return events;
    } catch (error) {
      console.log("Error Fetching Events", error);
      return [];
    }
  }
}

// Currency Converter
class CurrencyConverter {
  async getExchangeRate(baseCode) {
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/9d7687eb4feeb653fdb03cd5/latest/${baseCode}`,
      );
      if (!response.ok) {
        throw new Error("Failed to Fetch Currency Rate ");
      }
      const data = await response.json();
      let { time_last_update_utc, base_code, conversion_rates } = data;

      return {
        conversionRates: conversion_rates,
        lastUpdate: time_last_update_utc,
        baseCode: base_code,
      };
    } catch (error) {
      console.log("Error Fetching currency rate");
      return null;
    }
  }
  async convertAmount(BaseCurrency, TargetCurrency, amount) {
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/9d7687eb4feeb653fdb03cd5/pair/${BaseCurrency}/${TargetCurrency}/${amount}`,
      );

      if (!response.ok) {
        throw new Error("Failed to Convert Currency");
      }

      const data = await response.json();

      return data.conversion_result;
    } catch (error) {
      console.log("Error Converting Currency", error);
      return null;
    }
  }
}
// Country Details
class CountryDetails {
  constructor(
    commonName,
    officialName,
    capital,
    coordinates,
    population,
    area,
    languages,
    currencies,
    flagPng,
    flagSvg,
    borders,
    timezones,
  ) {
    this.commonName = commonName;
    this.officialName = officialName;
    this.capital = capital;
    this.coordinates = coordinates;
    this.population = population;
    this.area = area;
    this.languages = languages;
    this.currencies = currencies;
    this.flagPng = flagPng;
    this.flagSvg = flagSvg;
    this.borders = borders;
    this.timezones = timezones;
  }
}
// Country Details Manager

class CountryDetailsManager {
  async getCountryDetails(countryCode) {
    try {
      const response = await fetch(
        `https://api.restcountries.com/countries/v5/codes.alpha_2/${countryCode}`,
        {
          headers: {
            Authorization: "Bearer rc_live_37879d68dc4e47bd8b65cf2c94b6b2bd",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const result = await response.json();
      const country = result.data.objects[0];
      if (!country) return null;

      return new CountryDetails(
        country.names.common,
        country.names.official,
        country.capital?.[0] ?? "Unknown",
        country.capital_info?.latlng,
        country.population,
        country.area,
        country.languages,
        country.currencies,
        country.flags?.png,
        country.flags?.svg,
        country.borders,
        country.timezones,
      );
    } catch (error) {
      console.error("Error Fetching Country Details:", error);
      return null;
    }
  }
}
// Sunrise and Sunset
class SunriseSunset {
  constructor(
    sunrise,
    sunset,
    solarNoon,
    dayLength,
    civilTwilightBegin,
    civilTwilightEnd,
    nauticalTwilightBegin,
    nauticalTwilightEnd,
    astronomicalTwilightBegin,
    astronomicalTwilightEnd,
  ) {
    this.sunrise = sunrise;
    this.sunset = sunset;
    this.solarNoon = solarNoon;
    this.dayLength = dayLength;
    this.civilTwilightBegin = civilTwilightBegin;
    this.civilTwilightEnd = civilTwilightEnd;
    this.nauticalTwilightBegin = nauticalTwilightBegin;
    this.nauticalTwilightEnd = nauticalTwilightEnd;
    this.astronomicalTwilightBegin = astronomicalTwilightBegin;
    this.astronomicalTwilightEnd = astronomicalTwilightEnd;
  }
}
// Sunrise and Sunset Manager
class SunriseSunsetManager {
  async getSunTimes(latitude, longitude, date) {
    try {
      const response = await fetch(
        `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${date}&formatted=0`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Sunrise and Sunset .");
      }
      const data = await response.json();
      let { results } = data;
      return new SunriseSunset(
        results.sunrise,
        results.sunset,
        results.solar_noon,
        results.day_length,
        results.civil_twilight_begin,
        results.civil_twilight_end,
        results.nautical_twilight_begin,
        results.nautical_twilight_end,
        results.astronomical_twilight_begin,
        results.astronomical_twilight_end,
      );
    } catch (error) {
      console.log("Error Fetching Sunrise and Sunset", error);
      return null;
    }
  }
}
// Flag Manager
class FlagManager {
  getFlagPNG(countryCode, size) {
    return `https://flagcdn.com/${size}/${countryCode.toLowerCase()}.png`;
  }
  getFlagSVG(countryCode) {
    return `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
  }
}

// Plan Manager
class PlanManager {
  constructor() {
    this.plans = JSON.parse(localStorage.getItem("plans")) || [];
  }
  //   getAllPlans() – retrieve all saved plans.
  // addPlan(plan) – save a new Holiday, Event, or Long Weekend.
  // deletePlan(planId) – delete a saved plan.
  // updatePlan(planId, updatedData) – update a saved plan.
  savePlans() {
    localStorage.setItem("plans", JSON.stringify(this.plans));
  }
  getAllPlans() {
    return this.plans;
  }
  addPlan(plan) {
    this.plans.push(plan);
    this.savePlans();
  }
  deletePlan(planId) {
    const index = this.plans.findIndex((plan) => plan.id === planId);

    if (index === -1) {
      return false;
    }

    this.plans.splice(index, 1);
    this.savePlans();

    return true;
  }
  updatePlan(planId, updatedData) {
    this.plans = this.plans.map((plan) => {
      if (plan.id === planId) {
        return Object.assign(plan, updatedData);
      }

      return plan;
    });
    this.savePlans();
  }
}

// UI Manager

class UIManager {
  constructor() {
    const toastCloseBtn = document.querySelector("#toast-close-btn");
    const modalCloseBtn = document.querySelector("#modal-close-btn");
  }
  // Active section
  showView(viewName) {
    const sections = document.querySelectorAll(".view");
    sections.forEach((section) => {
      section.classList.remove("active");
      if (section.getAttribute("id") === `${viewName}-view`) {
        section.classList.add("active");
      }
    });
    this.updateActiveNav(viewName);
  }
  //   Active link
  updateActiveNav(viewName) {
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      item.classList.remove("active");
      if (item.dataset.view === viewName) {
        item.classList.add("active");
        window.location.hash = viewName;
      }
    });
  }
  //  Show Loading Overlay
  showLoading(message = "Loading...") {
    const loading = document.querySelector(".loading-overlay");
    const loadingText = document.querySelector("#loading-text");
    loading.classList.remove("hidden");
    loadingText.textContent = message;
  }
  //  hide Loading Overlay
  hideLoading() {
    const loading = document.querySelector(".loading-overlay");
    loading.classList.add("hidden");
  }
  //   Toast Notification
  showToast(message, type = "success") {
    toastContainer.classList.remove("hidden");
    toastMessage.classList.add(type);
    toastText.textContent = message;
    toastCloseBtn.addEventListener("click", () => this.hideToast());

    setTimeout(() => {
      this.hideToast();
    }, 4000);
  }
  // Hide Toast
  hideToast() {
    toastContainer.classList.add("hidden");
  }

  // Modal overlay
  // Show Modal
  showModal(content) {
    modalOverlay.classList.remove("hidden");
    modalBody.innerHTML = content;
    modalCloseBtn.addEventListener("click", () => this.hideModal());
  }
  // Hide Modal
  hideModal() {
    modalOverlay.classList.add("hidden");
    modalBody.innerHTML = "";
  }
  //   Plans
  displayPlans(plans) {
    const plansContent = document.querySelector("#plans-content");

    if (plans.length === 0) {
      plansContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">
          <i class="fa-solid fa-heart-crack"></i>
        </div>
        <h3>No Saved Plans Yet</h3>
        <p>
          Start exploring and save holidays, events, or long weekends
          you like!
        </p>
        <button class="btn-primary" id="start-exploring-btn">
          <i class="fa-solid fa-compass"></i> Start Exploring
        </button>
      </div>
    `;
      return;
    }

    // Display Plans
    plansContent.innerHTML = plans
      .map(
        (plan) => `<div class="plan-card">
        <span class="plan-card-type holiday">${plan.type}</span>
       <div class="plan-card-content">
          
        <h4>${plan.title}</h4>
        <div class="plan-card-details">
          <div>
          <i data-fa-i2svg=""><svg class="svg-inline--fa fa-calendar" aria-hidden="true" focusable="false" data-prefix="far" data-icon="calendar" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg=""><path fill="currentColor" d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z"></path></svg></i>
          ${plan.date || ""}
          </div>
          <div>
          <i data-fa-i2svg=""><svg class="svg-inline--fa fa-circle-info" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle-info" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"></path></svg></i>
          ${plan.title}
          </div>
        </div>
      
          <div class="plan-card-actions">
            <button class="btn-plan-remove" onclick="removePlan(${plan.id})">
              <i data-fa-i2svg=""><svg class="svg-inline--fa fa-trash" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="trash" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg=""><path fill="currentColor" d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"></path></svg></i> 
              Remove
            </button>
          </div>
        </div>
      </div>`,
      )
      .join("");
  }
  // Holidays
  displayHolidays(holidays, countryName, year) {
    const viewHeaderCard = document.querySelector(".view-header-card");
    const container = document.querySelector("#holidays-content");
    viewHeaderCard.innerHTML = ` <div class="view-header-icon">
                <i class="fa-solid fa-calendar-days"></i>
              </div>
              <div class="view-header-content">
                <h2>Public Holidays Explorer</h2>
                <p>
                  Browse public holidays for ${countryName} and plan your trips around
                  them
                </p>
              </div>
              <div class="view-header-selection" id="holidays-selection">
                <div class="current-selection-badge">
                  <img
                    src="https://flagcdn.com/w40/${holidays[0].countryCode.toLowerCase()}.png"
                    alt="${countryName}"
                    class="selection-flag"
                  />
                  <span>${countryName}</span>
                  <span class="selection-year">${year}</span>
                </div>
              </div>`;
    if (!container) return;

    if (!holidays || holidays.length === 0) {
      container.innerHTML = `
      <div class="empty-state">
        <h3>No Holidays Found</h3>
        <p>No public holidays available for this country and year.</p>
      </div>
    `;
      return;
    }

    container.innerHTML = holidays
      .map((holiday) => {
        const date = new Date(holiday.date);
        return `
      <div class="holiday-card">
        <div class="holiday-card-header">
          <div class="holiday-date-box">
            <span class="day">${date.getDate()}</span>
            <span class="month">
              ${date.toLocaleString("en", { month: "short" })}
            </span>
          </div>

          <button class="holiday-action-btn">
            <i class="fa-regular fa-heart"></i>
          </button>
        </div>

        <h3>${holiday.localName}</h3>
        <p class="holiday-name">${holiday.name}</p>

        <div class="holiday-card-footer">
          <span class="holiday-day-badge">
            <i class="fa-regular fa-calendar"></i>
            ${date.toLocaleDateString("en", { weekday: "long" })}
          </span>

          <span class="holiday-type-badge">${holiday.types[0]}</span>
        </div>
      </div>
    `;
      })
      .join("");
  }
  // Display Events
  displayEvents(events) {
    const container = document.querySelector("#events-content");

    if (!container) {
      return;
    }

    if (!events || events.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No Events Found</h3>
          <p>No events available for this city.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = events
      .map((event) => {
        return `
        <div class="event-card">

          <img
            src="${this.escapeHTML(event.image)}"
            alt="Event Image"
          />

          <div class="event-info">

            <h3>${this.escapeHTML(event.name)}</h3>

            <p>${this.escapeHTML(event.category)}</p>

            <p>${this.escapeHTML(event.date)}</p>

            <p>${this.escapeHTML(event.venue)}</p>

            <a
              href="${this.escapeHTML(event.url)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Tickets
            </a>

          </div>

        </div>
      `;
      })
      .join("");
  }
  //   Display Weather
  displayWeather(weather, cityName) {
    const container = document.querySelector("#weather-content");

    if (!container) return;

    if (!weather) {
      container.innerHTML = "<p>Weather information unavailable.</p>";
      return;
    }

    const current = weather.current;

    container.innerHTML = `
      <div class="weather-hero-card">
        <h3 class="weather-location">${cityName}</h3>
        <h2 class="temp-value">${current.temperature}°C</h2>
        <p>Feels like ${current.feelsLike}°C</p>
        <p>Humidity: ${current.humidity}%</p>
        <p>Wind Speed: ${current.windSpeed} km/h</p>
      </div>

      <h3>Hourly Forecast</h3>

      <div class="hourly-scroll">
        ${weather.hourly
          .slice(0, 12)
          .map(
            (hour) => `
          <div class="hourly-item">
            <p>${hour.time.slice(11, 16)}</p>
            <p>${hour.temperature}°C</p>
            <p>${hour.precipitationProbability}%</p>
          </div>
        `,
          )
          .join("")}
      </div>

      <h3>7-Day Forecast</h3>

      <div class="forecast-list">
        ${weather.daily
          .map(
            (day) => `
          <div class="forecast-day">
            <p class="day-date">${day.time}</p>
            <p class="temp-max">${day.maxTemperature}°C</p>
            <p class="temp-min">${day.minTemperature}°C</p>
            <p>${day.precipitationProbability}% rain</p>
          </div>
        `,
          )
          .join("")}
      </div>
    `;
  }
  // Display Long Weekends
  displayLongWeekends(longWeekends) {
    const container = document.querySelector("#lw-content");

    if (!container) {
      return;
    }

    if (!longWeekends || longWeekends.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No Long Weekends Found</h3>
          <p>No long weekends available for this year.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = longWeekends
      .map((weekend) => {
        return `
        <div class="lw-card">

          <h3>Long Weekend</h3>

          <p>
            Start Date:
            ${this.escapeHTML(weekend.startDate)}
          </p>

          <p>
            End Date:
            ${this.escapeHTML(weekend.endDate)}
          </p>

          <p>
            Days:
            ${this.escapeHTML(weekend.dayCount)}
          </p>
          <p> 
          ${weekend.needBridgeDay ? "Bridge day needed" : "No bridge day needed"}
          </p>

        </div>
      `;
      })
      .join("");
  }

  // Display Sunrise and Sunset
  displaySunTimes(sunTimes, cityName, date) {
    const container = document.querySelector("#sun-times-content");

    if (!container) return;

    if (!sunTimes) {
      container.innerHTML = "<p>Sun times unavailable.</p>";
      return;
    }

    // Format time
    const formatTime = (value) => {
      if (!value) return "--:--";

      return new Date(value).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    // Format date
    const selectedDate = new Date(`${date}T12:00:00`);

    const formattedDate = selectedDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const dayName = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    // Calculate daylight
    const daylightSeconds = Number(sunTimes.dayLength);
    const daylightHours = Math.floor(daylightSeconds / 3600);
    const daylightMinutes = Math.floor((daylightSeconds % 3600) / 60);

    const daylightPercentage = ((daylightSeconds / 86400) * 100).toFixed(1);

    const darknessSeconds = 86400 - daylightSeconds;
    const darknessHours = Math.floor(darknessSeconds / 3600);
    const darknessMinutes = Math.floor((darknessSeconds % 3600) / 60);

    const daylightText = `${daylightHours}h ${daylightMinutes}m`;
    const darknessText = `${darknessHours}h ${darknessMinutes}m`;

    container.innerHTML = `
    <div class="sun-main-card">
      <div class="sun-main-header">
        <div class="sun-location">
          <h2><i class="fa-solid fa-location-dot"></i> ${cityName}</h2>
          <p>Sun times for your selected location</p>
        </div>
        <div class="sun-date-display">
          <div class="date">${formattedDate}</div>
          <div class="day">${dayName}</div>
        </div>
      </div>

      <div class="sun-times-grid">
        <div class="sun-time-card dawn">
          <div class="icon"><i class="fa-solid fa-moon"></i></div>
          <div class="label">Dawn</div>
          <div class="time">${formatTime(sunTimes.civilTwilightBegin)}</div>
          <div class="sub-label">Civil Twilight</div>
        </div>

        <div class="sun-time-card sunrise">
          <div class="icon"><i class="fa-solid fa-sun"></i></div>
          <div class="label">Sunrise</div>
          <div class="time">${formatTime(sunTimes.sunrise)}</div>
          <div class="sub-label">Golden Hour Start</div>
        </div>

        <div class="sun-time-card noon">
          <div class="icon"><i class="fa-solid fa-sun"></i></div>
          <div class="label">Solar Noon</div>
          <div class="time">${formatTime(sunTimes.solarNoon)}</div>
          <div class="sub-label">Sun at Highest</div>
        </div>

        <div class="sun-time-card sunset">
          <div class="icon"><i class="fa-solid fa-sun"></i></div>
          <div class="label">Sunset</div>
          <div class="time">${formatTime(sunTimes.sunset)}</div>
          <div class="sub-label">Golden Hour End</div>
        </div>

        <div class="sun-time-card dusk">
          <div class="icon"><i class="fa-solid fa-moon"></i></div>
          <div class="label">Dusk</div>
          <div class="time">${formatTime(sunTimes.civilTwilightEnd)}</div>
          <div class="sub-label">Civil Twilight</div>
        </div>

        <div class="sun-time-card daylight">
          <div class="icon">
            <i class="fa-solid fa-hourglass-half"></i>
          </div>
          <div class="label">Day Length</div>
          <div class="time">${daylightText}</div>
          <div class="sub-label">Total Daylight</div>
        </div>
      </div>
    </div>

    <div class="day-length-card">
      <h3>
        <i class="fa-solid fa-chart-pie"></i> Daylight Distribution
      </h3>
      <div class="day-progress">
        <div class="day-progress-bar">
          <div class="day-progress-fill" style="width: ${daylightPercentage}%"></div>
        </div>
      </div>
      <div class="day-length-stats">
        <div class="day-stat">
          <div class="value">${daylightText}</div>
          <div class="label">Daylight</div>
        </div>
        <div class="day-stat">
          <div class="value">${daylightPercentage}%</div>
          <div class="label">of 24 Hours</div>
        </div>
        <div class="day-stat">
          <div class="value">${darknessText}</div>
          <div class="label">Darkness</div>
        </div>
      </div>
    </div>
  `;
  }

  //   Display country Details
  displayCountryDetails(details) {
    const container = document.querySelector("#country-details-content");

    if (!container) return;

    if (!details) {
      container.innerHTML = "<p>Country details unavailable.</p>";
      return;
    }

    container.innerHTML = `
      <div class="country-details-card">
        <img src="${details.flagPng}" alt="Country flag">
        <h3>${details.commonName}</h3>
        <p>Official Name: ${details.officialName}</p>
        <p>Capital: ${details.capital}</p>
        <p>Population: ${details.population.toLocaleString()}</p>
        <p>Area: ${details.area.toLocaleString()} km²</p>
        <p>Languages: ${details.languages.join(", ") || "Unknown"}</p>
        <p>Timezones: ${details.timezones.join(", ")}</p>
      </div>
    `;
  }

  // Display Currency Result
  displayCurrencyResult(
    result,
    fromCurrency,
    toCurrency,
    amount,
    lastUpdate = null,
  ) {
    const container = document.querySelector("#currency-result");

    if (!container) return;

    if (
      result === null ||
      result === undefined ||
      !Number.isFinite(Number(result))
    ) {
      container.innerHTML = "<p>Currency conversion unavailable.</p>";
      return;
    }

    const formattedAmount = Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const formattedResult = Number(result).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const exchangeRate = Number(result) / Number(amount);

    container.innerHTML = `
    <div class="conversion-display">
      <div class="conversion-from">
        <span class="amount">${formattedAmount}</span>
        <span class="currency-code">${fromCurrency}</span>
      </div>

      <div class="conversion-equals">
        <i class="fa-solid fa-equals"></i>
      </div>

      <div class="conversion-to">
        <span class="amount">${formattedResult}</span>
        <span class="currency-code">${toCurrency}</span>
      </div>
    </div>

    <div class="exchange-rate-info">
      <p>1 ${fromCurrency} = ${exchangeRate.toFixed(4)} ${toCurrency}</p>
      <small>Last updated: ${lastUpdate || "Latest available rate"}</small>
    </div>
  `;
  }
}
//  <button class="btn-plan-remove" onclick="removePlan(${plan.id})">
//   <i data-fa-i2svg=""><svg class="svg-inline--fa fa-trash" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="trash" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg=""><path fill="currentColor" d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"></path></svg></i>
//   Remove
// </button>
// App Controler
class App {
  constructor() {
    this.countryManager = new CountryManager();
    this.holidayManager = new HolidayManager();
    this.geocodingManager = new GeocodingManager();
    this.weatherManager = new WeatherManager();
    this.longWeekendManager = new LongWeekendsManager();
    this.eventsManager = new EventsManager();
    this.currencyConverter = new CurrencyConverter();
    this.countryDetailsManager = new CountryDetailsManager();
    this.sunriseSunsetManager = new SunriseSunsetManager();
    this.flagManager = new FlagManager();
    this.planManager = new PlanManager();
    this.uiManager = new UIManager();
    this.selectedCountryCode = "";
    this.selectedCountry = "";
    this.selectedCity = "";
    this.selectedYear = "";
    this.destinationData = null;
  }
  init() {
    console.log("Application Start");
    this.setupEventListeners();
  }
  setupEventListeners() {
    // ==============================
    // Sidebar Events
    // ==============================
    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach((item) => {
      item.addEventListener("click", () => {
        const viewName = item.dataset.view;

        window.location.hash = viewName;
        this.uiManager.showView(viewName);
      });
    });

    // ==============================
    // Dropdown Elements
    // ==============================
    const wrapper = document.querySelector("#global-country-custom");
    const trigger = wrapper.querySelector(".custom-select-trigger");
    const dropdown = wrapper.querySelector(".custom-select-dropdown");
    const selectSearch = wrapper.querySelector(".country-search");
    const selectOptions = wrapper.querySelectorAll(".custom-select-option");

    // ==============================
    // Destination Elements
    // ==============================
    const cityName = document.querySelector("#global-city");
    const globalYear = document.querySelector("#global-year");

    const selectedDestination = document.querySelector(".selected-destination");
    const selectedFlag = document.querySelector(".selected-flag");
    const selectedCountryName = document.querySelector(
      ".selected-country-name",
    );
    const selectedCityName = document.querySelector(".selected-city-name");

    const clearButton = document.querySelector(".clear-selection-btn");
    const exploreBtn = document.querySelector("#global-search-btn");

    // ==============================
    // Dropdown Events
    // ==============================
    trigger.addEventListener("click", () => {
      dropdown.classList.toggle("open");
      trigger.classList.toggle("open");
    });

    selectSearch.addEventListener("input", () => {
      const searchValue = selectSearch.value.trim().toLowerCase();

      selectOptions.forEach((option) => {
        const countryName = option
          .querySelector(".country-name")
          .textContent.trim()
          .toLowerCase();

        option.style.display = countryName.includes(searchValue)
          ? "flex"
          : "none";
      });
    });

    // ==============================
    // Select Country
    // ==============================

    selectOptions.forEach((option) => {
      option.addEventListener("click", () => {
        const flag = option.querySelector(".flag-img").src;
        const countryName = option
          .querySelector(".country-name")
          .textContent.trim();

        const countryCode = option.dataset.value;

        this.selectedCountryCode = countryCode;
        this.selectedCountry = countryName;

        // Update Dropdown Trigger
        trigger.querySelector(".flag-img").src = flag;
        trigger.querySelector(".selected-text").textContent = countryName;

        // Update Destination
        selectedCountryName.textContent = countryName;
        selectedFlag.querySelector("img").src = flag;
        selectedDestination.style.display = "flex";

        // Reset City
        cityName.value = "";
        selectedCityName.textContent = "";

        // Close Dropdown
        dropdown.classList.remove("open");
        trigger.classList.remove("open");
      });
    });

    // ==============================
    // City Input
    // ==============================
    cityName.addEventListener("input", () => {
      const city = cityName.value.trim();

      selectedCityName.textContent = city ? `• ${city}` : "";
    });

    // ==============================
    // Clear Selection
    // ==============================
    clearButton.addEventListener("click", () => {
      this.selectedCountryCode = "";
      this.selectedCountry = "";

      selectedCountryName.textContent = "";
      selectedCityName.textContent = "";

      cityName.value = "";
      globalYear.value = "";

      selectedDestination.style.display = "none";

      this.uiManager.showToast("Selection Cleared");
    });

    // ==============================
    // Explore Button
    // ==============================
    exploreBtn.addEventListener("click", async () => {
      const city = cityName.value.trim();
      const year = Number(globalYear.value);
      const countryCode = this.selectedCountryCode;

      if (!countryCode) {
        this.uiManager.showToast("Please Select a Country", "error");
        return;
      }

      if (!city) {
        this.uiManager.showToast("Please Select a City", "error");
        cityName.focus();
        return;
      }

      if (!year) {
        this.uiManager.showToast("Please Select a Year", "error");
        globalYear.focus();
        return;
      }

      this.selectedCity = city;
      this.selectedYear = year;
      await this.exploreDestination();
    });
  }
  async exploreDestination() {
    const countryCode = this.selectedCountryCode;
    const city = this.selectedCity;
    const year = this.selectedYear;
    this.uiManager.showLoading("Loading Destination....");
    try {
      //    Fetch Main Data
      const results = await Promise.allSettled([
        this.holidayManager.getHolidays(year, countryCode),
        this.longWeekendManager.getLongWeekends(year, countryCode),
        this.geocodingManager.getCoordinates(city),
        this.eventsManager.getEvents(city, countryCode),
        this.countryDetailsManager.getCountryDetails(countryCode),
      ]);
      // Extract Results
      const holidays =
        results[0].status === "fulfilled" ? results[0].value : [];
      const longWeekends =
        results[1].status === "fulfilled" ? results[1].value : [];
      const coordinates =
        results[2].status === "fulfilled" ? results[2].value : null;
      const events = results[3].status === "fulfilled" ? results[3].value : [];
      const countryDetails =
        results[4].status === "fulfilled" ? results[4].value : null;
      // Fetch Weather
      let weather = null;
      if (coordinates) {
        weather = await this.weatherManager.getWeather(
          coordinates.latitude,
          coordinates.longitude,
        );
      }
      const weatherData = weather
        ? {
            current: this.weatherManager.getCurrentWeather(weather),
            daily: this.weatherManager.getDailyForecast(weather),
            hourly: this.weatherManager.getHourlyForecast(weather),
          }
        : null;
      this.destinationData = {
        country: this.selectedCountry,
        countryCode,
        city,
        year,
        holidays,
        longWeekends,
        coordinates,
        events,
        countryDetails,
        weather: weatherData,
      };
      this.uiManager.displayHolidays(holidays);

      this.uiManager.displayEvents(events);

      this.uiManager.displayLongWeekends(longWeekends);
      this.uiManager.showToast("Destination Data Loaded Successfully!");
    } catch (error) {
      this.uiManager.showToast("Failed to Loaded Destination Data!");
    } finally {
      this.uiManager.hideLoading();
    }
  }
  //   Currency Converter
  convertCurrency(baseCurrency, targetCurrency, amount) {
    return this.currencyConverter.convertAmount(
      baseCurrency,
      targetCurrency,
      amount,
    );
  }
  //   my Plan
  displayPlans() {
    const savedPlans = this.planManager.getAllPlans();
    this.uiManager.displayPlans(savedPlans);
  }
  createPlan(plan) {
    return this.planManager.addPlan(plan);
  }
  updatePlan(planId, updatedData) {
    return this.planManager.updatePlan(planId, updatedData);
  }
  deletePlan(planId) {
    const isDeleted = this.planManager.deletePlan(planId);

    if (isDeleted) {
      this.displayPlans();
      this.uiManager.showToast("Plan Deleted Successfully!");
    } else {
      this.uiManager.showToast("Plan Not Found!", "error");
    }
  }
}
const app = new App();
app.init();

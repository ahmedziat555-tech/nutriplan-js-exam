// ---------- Country ----------
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
      return data.map(
        (country) =>
          new Country(
            country.name,
            country.countryCode,
            `https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png`,
          ),
      );
    } catch (error) {
      console.log("Error Fetching Countries", error);
      return [];
    }
  }
}

// ---------- Holiday ----------
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

class HolidayManager {
  async getHolidays(year, countryCode) {
    try {
      const response = await fetch(
        `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Holidays");
      }
      const data = await response.json();
      return data.map(
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
    } catch (error) {
      console.log("Error Fetching Holidays", error);
      return [];
    }
  }
}

// ---------- Long Weekend ----------
class LongWeekend {
  constructor(startDate, endDate, dayCount, needBridgeDay) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.dayCount = dayCount;
    this.needBridgeDay = needBridgeDay;
  }
}

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
      return data.map(
        (weekend) =>
          new LongWeekend(
            weekend.startDate,
            weekend.endDate,
            weekend.dayCount,
            weekend.needBridgeDay,
          ),
      );
    } catch (error) {
      console.log("Error Fetching Weekends", error);
      return [];
    }
  }
}

// ---------- Geocoding (city name -> latitude / longitude) ----------
class GeocodingManager {
  async getCoordinates(cityName, countryCode) {
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=en&format=json`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch City");
      }
      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        console.log("City Not Found.");
        return null;
      }
      // Prefer the result that belongs to the selected country
      const match =
        data.results.find((place) => place.country_code === countryCode) ||
        data.results[0];

      return {
        latitude: match.latitude,
        longitude: match.longitude,
        name: match.name,
        country: match.country,
        timezone: match.timezone,
      };
    } catch (error) {
      console.log("Error fetching City", error);
      return null;
    }
  }
}

// ---------- Weather ----------
class WeatherManager {
  async getWeather(latitude, longitude) {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_direction_10m_dominant&timezone=auto`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Weather");
      }
      return await response.json();
    } catch (error) {
      console.log("Error Fetching Weather", error);
      return null;
    }
  }
  getCurrentWeather(data) {
    const {
      time,
      temperature_2m,
      relative_humidity_2m,
      apparent_temperature,
      weather_code,
      wind_speed_10m,
      uv_index,
    } = data.current;
    return {
      time,
      temperature: temperature_2m,
      humidity: relative_humidity_2m,
      feelsLike: apparent_temperature,
      weatherCode: weather_code,
      windSpeed: wind_speed_10m,
      uvIndex: uv_index,
    };
  }
  getDailyForecast(data) {
    const {
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

// ---------- Events ----------
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

class EventsManager {
  async getEvents(cityName, countryCode) {
    // First try: events in the selected city
    let events = await this.fetchEvents(
      `city=${encodeURIComponent(cityName)}&countryCode=${countryCode}`,
    );

    // Second try: if the city has nothing, search the whole country
    if (events.length === 0) {
      events = await this.fetchEvents(`countryCode=${countryCode}`);
    }
    return events;
  }

  async fetchEvents(searchPart) {
    try {
      const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=VwECw2OiAzxVzIqnwmKJUG41FbeXJk1y&${searchPart}&size=20`;
      const response = await fetch(url);
      console.log("Events status:", response.status);

      if (!response.ok) {
        throw new Error("Failed to fetch Events.");
      }
      const data = await response.json();
      console.log("Events data:", data);

      // If there are no events, Ticketmaster does not send _embedded
      const list = data._embedded?.events || [];

      return list.map(
        (event) =>
          new Event(
            event.name,
            event.dates?.start?.dateTime || event.dates?.start?.localDate,
            event.images?.[0]?.url,
            event.classifications?.[0]?.segment?.name,
            event._embedded?.venues?.[0]?.name,
            event.priceRanges,
            event.url,
          ),
      );
    } catch (error) {
      console.log("Error Fetching Events", error);
      return [];
    }
  }
}

// ---------- Currency ----------
class CurrencyConverter {
  async getExchangeRate(baseCode) {
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/9d7687eb4feeb653fdb03cd5/latest/${baseCode}`,
      );
      if (!response.ok) {
        throw new Error("Failed to Fetch Currency Rate");
      }
      const data = await response.json();
      const { time_last_update_utc, base_code, conversion_rates } = data;

      return {
        conversionRates: conversion_rates,
        lastUpdate: time_last_update_utc,
        baseCode: base_code,
      };
    } catch (error) {
      console.log("Error Fetching currency rate", error);
      return null;
    }
  }
  async convertAmount(baseCurrency, targetCurrency, amount) {
    try {
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/9d7687eb4feeb653fdb03cd5/pair/${baseCurrency}/${targetCurrency}/${amount}`,
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

// ---------- Country Details ----------
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
    region,
    continent,
    callingCode,
    drivingSide,
    weekStart,
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
    this.region = region;
    this.continent = continent;
    this.callingCode = callingCode;
    this.drivingSide = drivingSide;
    this.weekStart = weekStart;
  }
}

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

      // Open the console (F12) to see all the fields this API gives you
      console.log("Country details from API:", country);

      return new CountryDetails(
        country.names.common,
        country.names.official,
        country.capital?.[0] ?? "Unknown",
        country.capital_info?.latlng,
        country.population,
        country.area,
        this.makeList(country.languages),
        this.makeCurrencyList(country.currencies),
        country.flags?.png,
        country.flags?.svg,
        country.borders || [],
        country.timezones || [],
        country.region ? `${country.region} • ${country.subregion || ""}` : "",
        country.continents?.[0] || country.region || "",
        country.idd?.root
          ? country.idd.root + (country.idd.suffixes?.[0] || "")
          : "",
        country.car?.side || "",
        country.start_of_week || country.startOfWeek || "",
      );
    } catch (error) {
      console.error("Error Fetching Country Details (v5):", error);

      return await this.getCountryDetailsBackup(countryCode);
    }
  }

  async getCountryDetailsBackup(countryCode) {
    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/alpha/${countryCode}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const result = await response.json();
      const country = Array.isArray(result) ? result[0] : result;
      if (!country) return null;

      return new CountryDetails(
        country.name?.common,
        country.name?.official,
        country.capital?.[0] ?? "Unknown",
        country.capitalInfo?.latlng,
        country.population,
        country.area,
        this.makeList(country.languages),
        this.makeCurrencyList(country.currencies),
        country.flags?.png,
        country.flags?.svg,
        country.borders || [],
        country.timezones || [],
        country.region ? `${country.region} • ${country.subregion || ""}` : "",
        country.continents?.[0] || "",
        country.idd?.root
          ? country.idd.root + (country.idd.suffixes?.[0] || "")
          : "",
        country.car?.side || "",
        country.startOfWeek || "",
      );
    } catch (error) {
      console.error("Error Fetching Country Details (backup):", error);
      return null;
    }
  }

  makeList(value) {
    if (!value) return [];
    const list = Array.isArray(value) ? value : Object.values(value);
    return list.map((item) =>
      typeof item === "string" ? item : item.name || item.common || "",
    );
  }

  // Turn currencies (object or array) into ["Egyptian pound (EGP)", ...]
  makeCurrencyList(value) {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value.map((c) =>
        typeof c === "string" ? c : `${c.name} (${c.code})`,
      );
    }
    return Object.entries(value).map(([code, c]) => `${c.name} (${code})`);
  }
}

// ---------- Sunrise & Sunset ----------
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

class SunriseSunsetManager {
  async getSunTimes(latitude, longitude, date) {
    try {
      const response = await fetch(
        `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${date}&formatted=0`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch Sunrise and Sunset.");
      }
      const data = await response.json();
      const results = data.results;
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

// ---------- Flags ----------
class FlagManager {
  getFlagPNG(countryCode, size) {
    return `https://flagcdn.com/${size}/${countryCode.toLowerCase()}.png`;
  }
  getFlagSVG(countryCode) {
    return `https://flagcdn.com/${countryCode.toLowerCase()}.svg`;
  }
}

// ---------- Plans (saved in localStorage) ----------
class PlanManager {
  constructor() {
    this.plans = JSON.parse(localStorage.getItem("plans")) || [];
  }
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
  clearAll() {
    this.plans = [];
    this.savePlans();
  }
}

// =====================================================
//  2) UI MANAGER  (everything that changes the screen)
// =====================================================

// Convert Open-Meteo weather code to an icon + text
function getWeatherInfo(code) {
  if (code === 0) return { icon: "fa-sun", text: "Clear sky" };
  if (code <= 3) return { icon: "fa-cloud-sun", text: "Partly cloudy" };
  if (code <= 48) return { icon: "fa-smog", text: "Fog" };
  if (code <= 67) return { icon: "fa-cloud-rain", text: "Rain" };
  if (code <= 77) return { icon: "fa-snowflake", text: "Snow" };
  if (code <= 82) return { icon: "fa-cloud-showers-heavy", text: "Showers" };
  return { icon: "fa-bolt", text: "Thunderstorm" };
}

class UIManager {
  constructor() {
    this.toastTimer = null;
    this.titles = {
      dashboard: [
        "Dashboard",
        "Welcome back! Ready to plan your next adventure?",
      ],
      holidays: ["Holidays", "Explore public holidays around the world"],
      events: ["Events", "Discover concerts, sports and more"],
      weather: ["Weather", "Check the weather forecast"],
      "long-weekends": ["Long Weekends", "Find the best mini-trips"],
      currency: ["Currency", "Convert between currencies"],
      "sun-times": ["Sun Times", "Sunrise and sunset times"],
      "my-plans": ["My Plans", "Your saved holidays, events and trips"],
    };
  }

  // ---------- Navigation ----------
  showView(viewName) {
    document.querySelectorAll(".view").forEach((section) => {
      section.classList.remove("active");
      if (section.id === `${viewName}-view`) {
        section.classList.add("active");
      }
    });

    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active");
      if (item.dataset.view === viewName) {
        item.classList.add("active");
      }
    });

    if (this.titles[viewName]) {
      document.querySelector("#page-title").textContent =
        this.titles[viewName][0];
      document.querySelector("#page-subtitle").textContent =
        this.titles[viewName][1];
    }
  }

  // ---------- Loading ----------
  showLoading(message = "Loading...") {
    document.querySelector("#loading-overlay").classList.remove("hidden");
    document.querySelector("#loading-text").textContent = message;
  }
  hideLoading() {
    document.querySelector("#loading-overlay").classList.add("hidden");
  }

  // ---------- Toast ----------
  showToast(message, type = "success") {
    const toastMessage = document.querySelector("#toast-message");
    toastMessage.classList.remove("success", "error", "warning", "info");
    toastMessage.classList.add(type);
    document.querySelector("#toast-text").textContent = message;
    document.querySelector("#toast-container").classList.remove("hidden");

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.hideToast(), 4000);
  }
  hideToast() {
    document.querySelector("#toast-container").classList.add("hidden");
  }

  // ---------- Modal ----------
  showModal(content) {
    document.querySelector("#modal-body").innerHTML = content;
    document.querySelector("#modal-overlay").classList.remove("hidden");
  }
  hideModal() {
    document.querySelector("#modal-overlay").classList.add("hidden");
    document.querySelector("#modal-body").innerHTML = "";
  }

  // ---------- Header date & time ----------
  updateDateTime() {
    const now = new Date();
    document.querySelector("#current-datetime").textContent =
      now.toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
  }

  // ---------- Small badges that show "Egypt - Cairo - 2026" ----------
  updateBadge(viewId, flag, country, extra, text) {
    const view = document.querySelector(viewId);
    if (!view) return;

    const badge = view.querySelector(".current-selection-badge");
    if (badge) {
      const img = badge.querySelector("img");
      const spans = badge.querySelectorAll("span");
      if (img) img.src = flag;
      if (spans[0]) spans[0].textContent = country;
      if (spans[1]) spans[1].textContent = extra;
    }

    const paragraph = view.querySelector(".view-header-content p");
    if (paragraph && text) paragraph.textContent = text;
  }

  updatePlansCount(plans) {
    document.querySelector("#stat-saved").textContent = plans.length;

    const badge = document.querySelector("#plans-count");
    badge.textContent = plans.length;
    badge.classList.toggle("hidden", plans.length === 0);

    document.querySelector("#filter-all-count").textContent = plans.length;
    document.querySelector("#filter-holiday-count").textContent = plans.filter(
      (p) => p.type === "holiday",
    ).length;
    document.querySelector("#filter-event-count").textContent = plans.filter(
      (p) => p.type === "event",
    ).length;
    document.querySelector("#filter-lw-count").textContent = plans.filter(
      (p) => p.type === "longweekend",
    ).length;
  }

  // ---------- Country information (dashboard) ----------
  displayCountryInfo(country, countryCode) {
    if (!country) return;

    const setText = (id, value) => {
      document.querySelector(`#${id}`).textContent = value || "—";
    };

    const setTags = (id, values, className = "extra-tag") => {
      const container = document.querySelector(`#${id}`);
      container.innerHTML = "";
      if (!values || values.length === 0) values = ["Not available"];
      values.forEach((value) => {
        const tag = document.createElement("span");
        tag.className = className;
        tag.textContent = value;
        container.appendChild(tag);
      });
    };

    // Flag: we build it from the country code (always works)
    const flag = document.querySelector("#country-flag");
    flag.src = `https://flagcdn.com/w160/${countryCode.toLowerCase()}.png`;
    flag.alt = `${country.commonName} flag`;

    setText("country-name", country.commonName);
    setText("country-official-name", country.officialName);
    setText("country-region", country.region);
    setText("country-capital", country.capital);
    setText(
      "country-population",
      Number(country.population || 0).toLocaleString(),
    );
    setText(
      "country-area",
      `${Number(country.area || 0).toLocaleString()} km²`,
    );
    setText("country-continent", country.continent);
    setText("country-calling-code", country.callingCode);
    setText("country-driving-side", country.drivingSide);
    setText("country-week-start", country.weekStart);

    setTags("country-currencies", country.currencies);
    setTags("country-languages", country.languages);
    setTags("country-neighbors", country.borders, "extra-tag border-tag");

    // Local time of the country
    const timeZone = country.timezones[0];
    setText("country-time-zone", timeZone);
    this.startLocalClock(timeZone);

    // Google Maps link
    document.querySelector("#country-map-link").href =
      `https://www.google.com/maps/place/${encodeURIComponent(country.commonName)}`;
  }

  startLocalClock(timeZone) {
    clearInterval(this.clockTimer);
    if (!timeZone) return;

    const update = () => {
      try {
        // timezones look like "UTC+02:00", so we use an offset instead of a zone name
        const match = timeZone.match(/UTC([+-])(\d{2}):(\d{2})/);
        let date = new Date();
        if (match) {
          const sign = match[1] === "-" ? -1 : 1;
          const offsetMinutes =
            sign * (Number(match[2]) * 60 + Number(match[3]));
          date = new Date(date.getTime() + offsetMinutes * 60000);
          document.querySelector("#country-local-time").textContent =
            date.toLocaleTimeString("en-US", {
              timeZone: "UTC",
            });
        } else {
          document.querySelector("#country-local-time").textContent =
            date.toLocaleTimeString("en-US", {
              timeZone,
            });
        }
      } catch (error) {
        document.querySelector("#country-local-time").textContent = "--:--:--";
      }
    };

    update();
    this.clockTimer = setInterval(update, 1000);
  }

  // ---------- Holidays ----------
  displayHolidays(holidays) {
    const container = document.querySelector("#holidays-content");

    if (holidays.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No Holidays Found</h3>
          <p>No public holidays available for this country and year.</p>
        </div>`;
      return;
    }

    container.innerHTML = holidays
      .map((holiday, index) => {
        const date = new Date(`${holiday.date}T12:00:00`);
        return `
        <div class="holiday-card">
          <div class="holiday-card-header">
            <div class="holiday-date-box">
              <span class="day">${date.getDate()}</span>
              <span class="month">${date.toLocaleString("en", { month: "short" })}</span>
            </div>
            <button class="holiday-action-btn" data-type="holiday" data-index="${index}">
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
            <span class="holiday-type-badge">${holiday.types?.[0] || "Public"}</span>
          </div>
        </div>`;
      })
      .join("");
  }

  // ---------- Events ----------
  displayEvents(events) {
    const container = document.querySelector("#events-content");

    if (events.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No Events Found</h3>
          <p>No events available for this city.</p>
        </div>`;
      return;
    }

    container.innerHTML = events
      .map((event, index) => {
        const date = event.date
          ? new Date(event.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Date unavailable";
        return `
        <div class="event-card">
          <div class="event-card-image">
            ${event.image ? `<img src="${event.image}" alt="Event" />` : ""}
            <span class="event-card-category">${event.category || "Event"}</span>
            <button class="event-card-save" data-type="event" data-index="${index}">
              <i class="fa-regular fa-heart"></i>
            </button>
          </div>
          <div class="event-card-body">
            <h3>${event.name}</h3>
            <div class="event-card-info">
              <div><i class="fa-regular fa-calendar"></i> ${date}</div>
              <div><i class="fa-solid fa-location-dot"></i> ${event.venue || "Venue unavailable"}</div>
            </div>
            <div class="event-card-footer">
              <button class="btn-event" data-type="event" data-index="${index}">
                <i class="fa-regular fa-heart"></i> Save
              </button>
              <a href="${event.url}" class="btn-buy-ticket" target="_blank" rel="noopener noreferrer">
                <i class="fa-solid fa-ticket"></i> Buy Tickets
              </a>
            </div>
          </div>
        </div>`;
      })
      .join("");
  }

  // ---------- Long weekends ----------
  displayLongWeekends(longWeekends) {
    const container = document.querySelector("#lw-content");

    if (longWeekends.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No Long Weekends Found</h3>
          <p>No long weekends available for this year.</p>
        </div>`;
      return;
    }

    container.innerHTML = longWeekends
      .map(
        (weekend, index) => `
        <div class="lw-card">
          <div class="lw-card-header">
            <span class="lw-badge">
              <i class="fa-solid fa-calendar-days"></i> ${weekend.dayCount} Days
            </span>
            <button class="holiday-action-btn" data-type="longweekend" data-index="${index}">
              <i class="fa-regular fa-heart"></i>
            </button>
          </div>
          <h3>Long Weekend #${index + 1}</h3>
          <div class="lw-dates">
            <i class="fa-regular fa-calendar"></i>
            ${weekend.startDate} → ${weekend.endDate}
          </div>
          <div class="lw-info-box ${weekend.needBridgeDay ? "warning" : "success"}">
            <i class="fa-solid ${weekend.needBridgeDay ? "fa-exclamation-triangle" : "fa-check-circle"}"></i>
            ${weekend.needBridgeDay ? "Bridge day needed" : "No extra days off needed!"}
          </div>
        </div>`,
      )
      .join("");
  }

  // ---------- Weather ----------
  displayWeather(weather, cityName) {
    const container = document.querySelector("#weather-content");

    if (!weather) {
      container.innerHTML = "<p>Weather information unavailable.</p>";
      return;
    }

    const { current, hourly, daily } = weather;
    const info = getWeatherInfo(current.weatherCode);

    // Hourly: start from the current hour and show 12 hours
    let start = hourly.time.findIndex(
      (t) => t.slice(0, 13) >= current.time.slice(0, 13),
    );
    if (start === -1) start = 0;

    let hoursHTML = "";
    for (let i = start; i < start + 12 && i < hourly.time.length; i++) {
      hoursHTML += `
        <div class="hourly-item ${i === start ? "now" : ""}">
          <span class="hourly-time">${i === start ? "Now" : hourly.time[i].slice(11, 16)}</span>
          <div class="hourly-icon"><i class="fa-solid ${getWeatherInfo(hourly.weatherCode[i]).icon}"></i></div>
          <span class="hourly-temp">${Math.round(hourly.temperature[i])}°</span>
        </div>`;
    }

    // Daily: 7 days
    const daysHTML = daily.time
      .map((day, i) => {
        const date = new Date(`${day}T12:00:00`);
        return `
        <div class="forecast-day ${i === 0 ? "today" : ""}">
          <div class="forecast-day-name">
            <span class="day-label">${i === 0 ? "Today" : date.toLocaleDateString("en", { weekday: "short" })}</span>
            <span class="day-date">${date.toLocaleDateString("en", { day: "numeric", month: "short" })}</span>
          </div>
          <div class="forecast-icon"><i class="fa-solid ${getWeatherInfo(daily.weatherCode[i]).icon}"></i></div>
          <div class="forecast-temps">
            <span class="temp-max">${Math.round(daily.maxTemperature[i])}°</span>
            <span class="temp-min">${Math.round(daily.minTemperature[i])}°</span>
          </div>
          <div class="forecast-precip">
            <i class="fa-solid fa-droplet"></i><span>${daily.precipitationProbability[i] ?? 0}%</span>
          </div>
        </div>`;
      })
      .join("");

    container.innerHTML = `
      <div class="weather-hero-card">
        <div class="weather-location">
          <i class="fa-solid fa-location-dot"></i>
          <span>${cityName}</span>
        </div>
        <div class="weather-hero-main">
          <div class="weather-hero-left">
            <div class="weather-hero-icon"><i class="fa-solid ${info.icon}"></i></div>
            <div class="weather-hero-temp">
              <span class="temp-value">${Math.round(current.temperature)}</span>
              <span class="temp-unit">°C</span>
            </div>
          </div>
          <div class="weather-hero-right">
            <div class="weather-condition">${info.text}</div>
            <div class="weather-feels">Feels like ${Math.round(current.feelsLike)}°C</div>
            <div class="weather-high-low">
              <span class="high"><i class="fa-solid fa-arrow-up"></i> ${Math.round(daily.maxTemperature[0])}°</span>
              <span class="low"><i class="fa-solid fa-arrow-down"></i> ${Math.round(daily.minTemperature[0])}°</span>
            </div>
          </div>
        </div>
      </div>

      <div class="weather-details-grid">
        <div class="weather-detail-card">
          <div class="detail-icon humidity"><i class="fa-solid fa-droplet"></i></div>
          <div class="detail-info">
            <span class="detail-label">Humidity</span>
            <span class="detail-value">${current.humidity}%</span>
          </div>
        </div>
        <div class="weather-detail-card">
          <div class="detail-icon wind"><i class="fa-solid fa-wind"></i></div>
          <div class="detail-info">
            <span class="detail-label">Wind</span>
            <span class="detail-value">${current.windSpeed} km/h</span>
          </div>
        </div>
        <div class="weather-detail-card">
          <div class="detail-icon uv"><i class="fa-solid fa-sun"></i></div>
          <div class="detail-info">
            <span class="detail-label">UV Index</span>
            <span class="detail-value">${current.uvIndex}</span>
          </div>
        </div>
        <div class="weather-detail-card">
          <div class="detail-icon precip"><i class="fa-solid fa-cloud-rain"></i></div>
          <div class="detail-info">
            <span class="detail-label">Precipitation</span>
            <span class="detail-value">${daily.precipitationProbability[0] ?? 0}%</span>
          </div>
        </div>
      </div>

      <div class="weather-section">
        <h3 class="weather-section-title"><i class="fa-solid fa-clock"></i> Hourly Forecast</h3>
        <div class="hourly-scroll">${hoursHTML}</div>
      </div>

      <div class="weather-section">
        <h3 class="weather-section-title"><i class="fa-solid fa-calendar-week"></i> 7-Day Forecast</h3>
        <div class="forecast-list">${daysHTML}</div>
      </div>`;
    const card = document.querySelector(".weather-hero-card");
    card.style.background = "linear-gradient(135deg, #2193b0, #6dd5ed)";
  }

  // ---------- Sunrise & sunset ----------
  displaySunTimes(sunTimes, cityName, date, timezone) {
    const container = document.querySelector("#sun-times-content");

    if (!sunTimes) {
      container.innerHTML = "<p>Sun times unavailable.</p>";
      return;
    }

    const formatTime = (value) => {
      if (!value) return "--:--";
      return new Date(value).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: timezone,
      });
    };

    const selectedDate = new Date(`${date}T12:00:00`);
    const formattedDate = selectedDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const dayName = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
    });

    // Day length (the API gives it in seconds)
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
            <div class="icon"><i class="fa-solid fa-hourglass-half"></i></div>
            <div class="label">Day Length</div>
            <div class="time">${daylightText}</div>
            <div class="sub-label">Total Daylight</div>
          </div>
        </div>
      </div>

      <div class="day-length-card">
        <h3><i class="fa-solid fa-chart-pie"></i> Daylight Distribution</h3>
        <div class="day-progress">
          <div class="day-progress-bar">
            <div class="day-progress-fill" style="width: ${daylightPercentage}%"></div>
          </div>
        </div>
        <div class="day-length-stats">
          <div class="day-stat"><div class="value">${daylightText}</div><div class="label">Daylight</div></div>
          <div class="day-stat"><div class="value">${daylightPercentage}%</div><div class="label">of 24 Hours</div></div>
          <div class="day-stat"><div class="value">${darknessText}</div><div class="label">Darkness</div></div>
        </div>
      </div>`;
  }

  // ---------- Currency ----------
  displayCurrencyResult(result, fromCurrency, toCurrency, amount, lastUpdate) {
    const container = document.querySelector("#currency-result");

    if (result === null || !Number.isFinite(Number(result))) {
      container.innerHTML = "<p>Currency conversion unavailable.</p>";
      return;
    }

    const format = (number) =>
      Number(number).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const rate = Number(result) / Number(amount);

    container.innerHTML = `
      <div class="conversion-display">
        <div class="conversion-from">
          <span class="amount">${format(amount)}</span>
          <span class="currency-code">${fromCurrency}</span>
        </div>
        <div class="conversion-equals"><i class="fa-solid fa-equals"></i></div>
        <div class="conversion-to">
          <span class="amount">${format(result)}</span>
          <span class="currency-code">${toCurrency}</span>
        </div>
      </div>
      <div class="exchange-rate-info">
        <p>1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}</p>
        <small>Last updated: ${lastUpdate || "Latest available rate"}</small>
      </div>`;
  }

  // Update the "Quick Convert" cards
  displayPopularCurrencies(rates) {
    document.querySelectorAll(".popular-currency-card").forEach((card) => {
      const code = card.querySelector(".code").textContent.trim();
      const rate = rates[code];
      if (rate) {
        card.querySelector(".rate").textContent = Number(rate).toFixed(4);
      }
    });
  }

  // ---------- My Plans ----------
  displayPlans(plans, filter = "all") {
    const container = document.querySelector("#plans-content");

    const list =
      filter === "all" ? plans : plans.filter((plan) => plan.type === filter);

    if (list.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="fa-solid fa-heart-crack"></i></div>
          <h3>No Saved Plans Yet</h3>
          <p>Start exploring and save holidays, events, or long weekends you like!</p>
          <button class="btn-primary" id="start-exploring-btn">
            <i class="fa-solid fa-compass"></i> Start Exploring
          </button>
        </div>`;
      return;
    }

    container.innerHTML = list
      .map(
        (plan) => `
        <div class="plan-card">
          <span class="plan-card-type ${plan.type}">${plan.type}</span>
          <div class="plan-card-content">
            <h4>${plan.title}</h4>
            <div class="plan-card-details">
              <div><i class="fa-regular fa-calendar"></i> ${plan.date || ""}</div>
              <div><i class="fa-solid fa-circle-info"></i> ${plan.details || ""}</div>
            </div>
            <div class="plan-card-actions">
              <button class="btn-plan-remove" data-plan-id="${plan.id}">
                <i class="fa-solid fa-trash"></i> Remove
              </button>
            </div>
          </div>
        </div>`,
      )
      .join("");
  }
}

// =====================================================
//  3) APP  (connects everything together)
// =====================================================

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

    this.selectedCountryCode = "EG"; // Egypt is selected by default in the HTML
    this.selectedCountry = "Egypt";
    this.selectedCity = "";
    this.selectedYear = "";
    this.currentFilter = "all";
    this.destinationData = null; // holds the last loaded data
  }

  init() {
    this.setupNavigation();
    this.setupCountryDropdown();
    this.setupDestinationControls();
    this.setupSaveButtons();
    this.setupPlansEvents();
    this.setupCurrency();
    this.setupModalAndToast();

    // Header clock
    this.uiManager.updateDateTime();
    setInterval(() => this.uiManager.updateDateTime(), 60000);

    // Show the saved plans count
    this.uiManager.updatePlansCount(this.planManager.getAllPlans());
    this.displayPlans();

    // Load cities for the default country + number of countries
    this.loadCities(this.selectedCountry);
    this.loadCountriesCount();

    // Open the view from the URL (#holidays ...)
    const view = window.location.hash.replace("#", "");
    if (view) this.uiManager.showView(view);

    console.log("Application Start");
  }

  // ---------- Sidebar ----------
  setupNavigation() {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        const viewName = item.dataset.view;
        window.location.hash = viewName;
        this.uiManager.showView(viewName);
        if (viewName === "my-plans") this.displayPlans();
      });
    });
  }

  // ---------- Country dropdown ----------
  setupCountryDropdown() {
    const wrapper = document.querySelector("#global-country-custom");
    const trigger = wrapper.querySelector(".custom-select-trigger");
    const dropdown = wrapper.querySelector(".custom-select-dropdown");
    const searchInput = wrapper.querySelector(".custom-select-search input");
    const options = wrapper.querySelectorAll(".custom-select-option");

    // Open / close
    trigger.addEventListener("click", () => {
      dropdown.classList.toggle("open");
      trigger.classList.toggle("open");
    });

    // Close when clicking outside
    document.addEventListener("click", (event) => {
      if (!wrapper.contains(event.target)) {
        dropdown.classList.remove("open");
        trigger.classList.remove("open");
      }
    });

    // Search
    searchInput.addEventListener("input", () => {
      const text = searchInput.value.trim().toLowerCase();
      options.forEach((option) => {
        const name = option
          .querySelector(".country-name")
          .textContent.trim()
          .toLowerCase();
        option.style.display = name.includes(text) ? "flex" : "none";
      });
    });

    // Choose a country
    options.forEach((option) => {
      option.addEventListener("click", () => {
        const flag = option.querySelector(".flag-img").src;
        const name = option.querySelector(".country-name").textContent.trim();

        this.selectedCountryCode = option.dataset.value;
        this.selectedCountry = name;

        // Update the trigger
        trigger.querySelector(".flag-img").src = flag;
        trigger.querySelector(".selected-text").textContent = name;

        // Update "selected destination" box
        document.querySelector(".selected-country-name").textContent = name;
        document.querySelector(".selected-flag img").src = flag;
        document.querySelector(".selected-destination").style.display = "flex";
        document.querySelector(".selected-city-name").textContent = "";

        // Close dropdown and load the cities of this country
        dropdown.classList.remove("open");
        trigger.classList.remove("open");
        this.loadCities(name);
      });
    });
  }

  // ---------- City, Year, Explore, Clear ----------
  setupDestinationControls() {
    const citySelect = document.querySelector("#global-city");
    const yearSelect = document.querySelector("#global-year");

    citySelect.addEventListener("change", () => {
      const city = citySelect.value;
      document.querySelector(".selected-city-name").textContent = city
        ? `• ${city}`
        : "";
    });

    // Clear
    document
      .querySelector("#clear-selection-btn")
      .addEventListener("click", () => {
        this.selectedCountryCode = "";
        this.selectedCountry = "";
        this.selectedCity = "";
        citySelect.value = "";
        document.querySelector(".selected-country-name").textContent = "";
        document.querySelector(".selected-city-name").textContent = "";
        document.querySelector(".selected-destination").style.display = "none";
        document.querySelector(
          ".custom-select-trigger .selected-text",
        ).textContent = "Select Country";
        this.uiManager.showToast("Selection Cleared");
      });

    // Explore
    document
      .querySelector("#global-search-btn")
      .addEventListener("click", async () => {
        const city = citySelect.value.trim();
        const year = Number(yearSelect.value);

        if (!this.selectedCountryCode) {
          this.uiManager.showToast("Please Select a Country", "error");
          return;
        }
        if (!city) {
          this.uiManager.showToast("Please Select a City", "error");
          return;
        }
        if (!year) {
          this.uiManager.showToast("Please Select a Year", "error");
          return;
        }

        this.selectedCity = city;
        this.selectedYear = year;
        await this.exploreDestination();
      });
  }

  // ---------- Load all the data for the selected destination ----------
  async exploreDestination() {
    const countryCode = this.selectedCountryCode;
    const country = this.selectedCountry;
    const city = this.selectedCity;
    const year = this.selectedYear;

    this.uiManager.showLoading("Loading destination data...");

    try {
      // Every manager catches its own errors, so these never throw
      const [holidays, longWeekends, coordinates, events, countryDetails] =
        await Promise.all([
          this.holidayManager.getHolidays(year, countryCode),
          this.longWeekendManager.getLongWeekends(year, countryCode),
          this.geocodingManager.getCoordinates(city, countryCode),
          this.eventsManager.getEvents(city, countryCode),
          this.countryDetailsManager.getCountryDetails(countryCode),
        ]);

      // Weather and sun times need the coordinates
      let weatherData = null;
      let sunTimes = null;
      const today = new Date().toISOString().slice(0, 10);

      if (coordinates) {
        const [weather, sun] = await Promise.all([
          this.weatherManager.getWeather(
            coordinates.latitude,
            coordinates.longitude,
          ),
          this.sunriseSunsetManager.getSunTimes(
            coordinates.latitude,
            coordinates.longitude,
            today,
          ),
        ]);
        sunTimes = sun;
        if (weather) {
          weatherData = {
            current: this.weatherManager.getCurrentWeather(weather),
            daily: this.weatherManager.getDailyForecast(weather),
            hourly: this.weatherManager.getHourlyForecast(weather),
          };
        }
      }

      // Keep the data (the save buttons use it)
      this.destinationData = {
        country,
        countryCode,
        city,
        year,
        holidays,
        longWeekends,
        coordinates,
        events,
        countryDetails,
        weather: weatherData,
        sunTimes,
      };

      // Show everything
      const flag = this.flagManager.getFlagPNG(countryCode, "w40");
      this.uiManager.updateBadge(
        "#holidays-view",
        flag,
        country,
        year,
        `Browse public holidays for ${country} and plan your trips around them`,
      );
      this.uiManager.updateBadge("#long-weekends-view", flag, country, year);
      this.uiManager.updateBadge(
        "#events-view",
        flag,
        country,
        `• ${city}`,
        `Discover concerts, sports, theatre and more in ${city}`,
      );
      this.uiManager.updateBadge(
        "#weather-view",
        flag,
        country,
        `• ${city}`,
        `Check 7-day weather forecasts for ${city}`,
      );
      this.uiManager.updateBadge("#sun-times-view", flag, country, `• ${city}`);

      this.uiManager.displayCountryInfo(countryDetails, countryCode);
      this.uiManager.displayHolidays(holidays);
      this.uiManager.displayEvents(events);
      this.uiManager.displayLongWeekends(longWeekends);
      this.uiManager.displayWeather(weatherData, city);
      this.uiManager.displaySunTimes(
        sunTimes,
        city,
        today,
        coordinates?.timezone,
      );
      document.querySelector("#stat-holidays").textContent = holidays.length;

      this.uiManager.showToast("Destination Data Loaded Successfully!");
    } catch (error) {
      console.error("Failed to load destination data:", error);
      this.uiManager.showToast("Failed to load destination data", "error");
    } finally {
      this.uiManager.hideLoading();
    }
  }

  // ---------- Save (heart) buttons ----------
  setupSaveButtons() {
    // One listener on the document catches every heart button,
    // even the ones created later by JavaScript.
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-type][data-index]");
      if (!button || !this.destinationData) return;

      const type = button.dataset.type;
      const index = Number(button.dataset.index);
      let plan = null;

      if (type === "holiday") {
        const holiday = this.destinationData.holidays[index];
        plan = {
          type: "holiday",
          title: holiday.name,
          date: holiday.date,
          details: `${this.destinationData.country} - ${holiday.localName}`,
        };
      } else if (type === "event") {
        const item = this.destinationData.events[index];
        plan = {
          type: "event",
          title: item.name,
          date: item.date ? item.date.slice(0, 10) : "",
          details: item.venue || this.destinationData.city,
        };
      } else if (type === "longweekend") {
        const weekend = this.destinationData.longWeekends[index];
        plan = {
          type: "longweekend",
          title: `Long Weekend (${weekend.dayCount} days)`,
          date: `${weekend.startDate} → ${weekend.endDate}`,
          details: this.destinationData.country,
        };
      }

      if (!plan) return;

      // Don't save the same thing twice
      const alreadySaved = this.planManager
        .getAllPlans()
        .some(
          (p) =>
            p.type === plan.type &&
            p.title === plan.title &&
            p.date === plan.date,
        );

      if (alreadySaved) {
        this.uiManager.showToast("Already saved in My Plans", "warning");
        return;
      }

      plan.id = Date.now();
      this.createPlan(plan);
      this.uiManager.showToast("Added to My Plans!");
    });
  }

  // ---------- My Plans ----------
  setupPlansEvents() {
    // Filter buttons
    document.querySelectorAll(".plan-filter").forEach((button) => {
      button.addEventListener("click", () => {
        document
          .querySelectorAll(".plan-filter")
          .forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
        this.currentFilter = button.dataset.filter;
        this.displayPlans();
      });
    });

    // Remove + "Start Exploring" (buttons are created by JS, so we listen on the container)
    document
      .querySelector("#plans-content")
      .addEventListener("click", (event) => {
        const removeButton = event.target.closest("[data-plan-id]");
        if (removeButton) {
          this.deletePlan(Number(removeButton.dataset.planId));
        }
        if (event.target.closest("#start-exploring-btn")) {
          window.location.hash = "dashboard";
          this.uiManager.showView("dashboard");
        }
      });

    // Clear all
    document
      .querySelector("#clear-all-plans-btn")
      .addEventListener("click", async () => {
        if (this.planManager.getAllPlans().length === 0) return;

        const answer = await Swal.fire({
          title: "Clear all plans?",
          text: "You can't undo this.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Yes, clear all",
        });

        if (answer.isConfirmed) {
          this.planManager.clearAll();
          this.displayPlans();
          this.uiManager.updatePlansCount(this.planManager.getAllPlans());
          this.uiManager.showToast("All plans cleared");
        }
      });
  }

  displayPlans() {
    this.uiManager.displayPlans(
      this.planManager.getAllPlans(),
      this.currentFilter,
    );
  }

  createPlan(plan) {
    this.planManager.addPlan(plan);
    this.uiManager.updatePlansCount(this.planManager.getAllPlans());
    this.displayPlans();
  }

  updatePlan(planId, updatedData) {
    this.planManager.updatePlan(planId, updatedData);
    this.displayPlans();
  }

  deletePlan(planId) {
    const isDeleted = this.planManager.deletePlan(planId);
    if (isDeleted) {
      this.uiManager.updatePlansCount(this.planManager.getAllPlans());
      this.displayPlans();
      this.uiManager.showToast("Plan Deleted Successfully!");
    } else {
      this.uiManager.showToast("Plan Not Found!", "error");
    }
  }

  // ---------- Currency ----------
  setupCurrency() {
    document
      .querySelector("#convert-btn")
      .addEventListener("click", () => this.handleCurrencyConversion());

    document
      .querySelector("#swap-currencies-btn")
      .addEventListener("click", () => {
        const from = document.querySelector("#currency-from");
        const to = document.querySelector("#currency-to");
        const oldFrom = from.value;
        from.value = to.value;
        to.value = oldFrom;
        this.handleCurrencyConversion();
      });
  }

  async handleCurrencyConversion() {
    const amount = Number(document.querySelector("#currency-amount").value);
    const fromCurrency = document.querySelector("#currency-from").value;
    const toCurrency = document.querySelector("#currency-to").value;

    if (!amount || amount <= 0) {
      this.uiManager.showToast("Enter an amount greater than zero", "error");
      return;
    }

    this.uiManager.showLoading("Fetching exchange rates...");
    const data = await this.currencyConverter.getExchangeRate(fromCurrency);
    this.uiManager.hideLoading();

    const rate = data?.conversionRates?.[toCurrency];
    if (!rate) {
      this.uiManager.displayCurrencyResult(null);
      this.uiManager.showToast("Could not load the exchange rate", "error");
      return;
    }

    this.uiManager.displayCurrencyResult(
      amount * rate,
      fromCurrency,
      toCurrency,
      amount,
      data.lastUpdate,
    );
    this.uiManager.displayPopularCurrencies(data.conversionRates);
  }

  // ---------- Toast + Modal close buttons ----------
  setupModalAndToast() {
    document
      .querySelector("#toast-close-btn")
      .addEventListener("click", () => this.uiManager.hideToast());
    document
      .querySelector("#modal-close-btn")
      .addEventListener("click", () => this.uiManager.hideModal());
  }

  // ---------- Extra loaders ----------
  async loadCountriesCount() {
    const countries = await this.countryManager.getAvailableCountries();
    if (countries.length > 0) {
      document.querySelector("#stat-countries").textContent = countries.length;
    }
  }

  // Fill the City <select> with the cities of the chosen country
  async loadCities(countryName) {
    const citySelect = document.querySelector("#global-city");
    citySelect.innerHTML = `<option value="">Loading cities...</option>`;

    try {
      const response = await fetch(
        "https://countriesnow.space/api/v0.1/countries/cities",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ country: countryName }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch cities");
      }
      const result = await response.json();
      const cities = result.data;

      if (!Array.isArray(cities) || cities.length === 0) {
        throw new Error("No cities found");
      }

      citySelect.innerHTML = `<option value="">Select a city</option>`;
      cities.forEach((city) => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
      });
    } catch (error) {
      console.error("Cities Error:", error);
      citySelect.innerHTML = `<option value="">Unable to load cities</option>`;
    }
  }
}

// =====================================================
//  START
// =====================================================
const app = new App();
app.init();

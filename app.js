const STORAGE_KEY = "imbuckleyy-dashboard-v6";
const DEFAULT_SHIFT_CONFIG = {
  startDate: "2026-04-29",
  dayStart: "05:30",
  dayEnd: "18:30",
  nightStart: "18:30",
  nightEnd: "06:30"
};
const SCHEDULE_END_DATE = "2035-12-31";

const defaultState = {
  events: [],
  billDefinitions: [],
  shiftConfig: { ...DEFAULT_SHIFT_CONFIG },
  finance: {
    income: "",
    flexSpend: "",
    goal: ""
  },
  chat: [
    {
      role: "assistant",
      message: "Private chat is wired for a real server-side OpenAI response now. Once the key is configured on deploy, I can help with schedules, bills, errands, plans, meals, and day-to-day stuff."
    }
  ],
  files: [
    {
      id: crypto.randomUUID(),
      name: "Shared plans",
      content: "- Groceries\n- Date night ideas\n- Bills to watch\n- Shows to binge",
      updatedAt: Date.now()
    }
  ],
  activeFileId: null,
  weatherZip: "",
  lolPlayers: "",
  lolRegion: "na",
  fmhyPage: "video",
  fmhySearch: ""
};

let state = loadState();
const runtime = {
  weather: null,
  nhlGames: [],
  fmhy: null,
  fmhySections: [],
  chatBusy: false,
  calendar: null,
  nhlRefreshTimer: null
};

const els = {
  liveClock: document.getElementById("liveClock"),
  siteMenu: document.getElementById("siteMenu"),
  navLinks: document.querySelectorAll("[data-nav-link]"),
  refreshTicker: document.getElementById("refreshTicker"),
  nhlTicker: document.getElementById("nhlTicker"),
  nhlGames: document.getElementById("nhlGames"),
  useGpsWeather: document.getElementById("useGpsWeather"),
  zipWeatherForm: document.getElementById("zipWeatherForm"),
  zipInput: document.getElementById("zipInput"),
  weatherOutput: document.getElementById("weatherOutput"),
  weatherForecast: document.getElementById("weatherForecast"),
  weatherHero: document.getElementById("weatherHero"),
  nextShiftSummary: document.getElementById("nextShiftSummary"),
  nextShiftMeta: document.getElementById("nextShiftMeta"),
  nextBillSummary: document.getElementById("nextBillSummary"),
  nextBillMeta: document.getElementById("nextBillMeta"),
  leftoverSummary: document.getElementById("leftoverSummary"),
  leftoverMeta: document.getElementById("leftoverMeta"),
  chatSummary: document.getElementById("chatSummary"),
  chatSummaryMeta: document.getElementById("chatSummaryMeta"),
  eventForm: document.getElementById("eventForm"),
  eventTitle: document.getElementById("eventTitle"),
  eventDate: document.getElementById("eventDate"),
  billForm: document.getElementById("billForm"),
  billName: document.getElementById("billName"),
  billAmount: document.getElementById("billAmount"),
  billFrequency: document.getElementById("billFrequency"),
  billFirstDue: document.getElementById("billFirstDue"),
  shiftForm: document.getElementById("shiftForm"),
  shiftStart: document.getElementById("shiftStart"),
  dayStartTime: document.getElementById("dayStartTime"),
  dayEndTime: document.getElementById("dayEndTime"),
  nightStartTime: document.getElementById("nightStartTime"),
  nightEndTime: document.getElementById("nightEndTime"),
  schedulePatternTitle: document.getElementById("schedulePatternTitle"),
  schedulePatternMeta: document.getElementById("schedulePatternMeta"),
  scheduleNowCards: document.getElementById("scheduleNowCards"),
  scheduleCalendar: document.getElementById("scheduleCalendar"),
  scheduleList: document.getElementById("scheduleList"),
  scheduleEditForm: document.getElementById("scheduleEditForm"),
  scheduleEditId: document.getElementById("scheduleEditId"),
  scheduleEditTitle: document.getElementById("scheduleEditTitle"),
  scheduleEditDate: document.getElementById("scheduleEditDate"),
  scheduleEditCancel: document.getElementById("scheduleEditCancel"),
  incomeInput: document.getElementById("incomeInput"),
  flexSpendInput: document.getElementById("flexSpendInput"),
  goalInput: document.getElementById("goalInput"),
  incomeSummary: document.getElementById("incomeSummary"),
  budgetChart: document.getElementById("budgetChart"),
  financeInsights: document.getElementById("financeInsights"),
  recurringSummary: document.getElementById("recurringSummary"),
  goalSummary: document.getElementById("goalSummary"),
  freeCashSummary: document.getElementById("freeCashSummary"),
  billCollectionMeta: document.getElementById("billCollectionMeta"),
  billDefinitionList: document.getElementById("billDefinitionList"),
  lolForm: document.getElementById("lolForm"),
  lolPlayers: document.getElementById("lolPlayers"),
  lolRegion: document.getElementById("lolRegion"),
  lolResults: document.getElementById("lolResults"),
  chatLog: document.getElementById("chatLog"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  chatBubbleTemplate: document.getElementById("chatBubbleTemplate"),
  chatStatus: document.getElementById("chatStatus"),
  fmhySearch: document.getElementById("fmhySearch"),
  refreshFmhy: document.getElementById("refreshFmhy"),
  fmhyCategories: document.getElementById("fmhyCategories"),
  fmhyMeta: document.getElementById("fmhyMeta"),
  fmhyResults: document.getElementById("fmhyResults"),
  fileForm: document.getElementById("fileForm"),
  fileName: document.getElementById("fileName"),
  fileList: document.getElementById("fileList"),
  fileTitle: document.getElementById("fileTitle"),
  fileContent: document.getElementById("fileContent"),
  saveFile: document.getElementById("saveFile"),
  deleteFile: document.getElementById("deleteFile")
};

init();

function init() {
  primeInputs();
  bindEvents();
  tickClock();
  setInterval(tickClock, 1000);
  renderAll();
  loadNhlData();
  loadFmhyPage();
  runtime.nhlRefreshTimer = window.setInterval(loadNhlData, 120000);

  if (state.weatherZip) {
    lookupWeatherByQuery(state.weatherZip);
  } else if (navigator.geolocation) {
    handleGpsWeather();
  } else {
    renderWeatherStatus("Use GPS or type a city, zip, or postal code to load the weather.");
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return structuredClone(defaultState);
    }

    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(defaultState),
      ...parsed,
      finance: {
        ...defaultState.finance,
        ...(parsed.finance || {})
      },
      shiftConfig: {
        ...DEFAULT_SHIFT_CONFIG,
        ...(parsed.shiftConfig || {})
      },
      fmhyPage: sanitizeFmhyPage(parsed.fmhyPage || defaultState.fmhyPage)
    };
  } catch (error) {
    console.error("Failed to load saved state", error);
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function primeInputs() {
  els.zipInput.value = state.weatherZip;
  els.lolPlayers.value = state.lolPlayers;
  els.lolRegion.value = state.lolRegion;
  els.incomeInput.value = state.finance.income;
  els.flexSpendInput.value = state.finance.flexSpend;
  els.goalInput.value = state.finance.goal;
  els.fmhySearch.value = state.fmhySearch;
  els.shiftStart.value = state.shiftConfig.startDate;
  els.dayStartTime.value = state.shiftConfig.dayStart;
  els.dayEndTime.value = state.shiftConfig.dayEnd;
  els.nightStartTime.value = state.shiftConfig.nightStart;
  els.nightEndTime.value = state.shiftConfig.nightEnd;
  els.billFirstDue.value = todayIso();

  if (!state.activeFileId && state.files.length) {
    state.activeFileId = state.files[0].id;
  }
}

function bindEvents() {
  els.navLinks.forEach((link) => link.addEventListener("click", closeMenu));
  els.refreshTicker.addEventListener("click", loadNhlData);
  els.useGpsWeather.addEventListener("click", handleGpsWeather);
  els.zipWeatherForm.addEventListener("submit", handleZipWeather);
  els.eventForm.addEventListener("submit", handleEventSubmit);
  els.billForm.addEventListener("submit", handleBillSubmit);
  els.shiftForm.addEventListener("submit", handleShiftSubmit);
  els.scheduleEditForm.addEventListener("submit", handleEventEditSave);
  els.scheduleEditCancel.addEventListener("click", hideScheduleEditForm);
  [els.incomeInput, els.flexSpendInput, els.goalInput].forEach((input) => {
    input.addEventListener("input", handleFinanceInput);
  });
  els.lolForm.addEventListener("submit", handleLolCompare);
  els.chatForm.addEventListener("submit", handleChatSubmit);
  els.chatInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      els.chatForm.requestSubmit();
    }
  });
  els.fmhySearch.addEventListener("input", handleFmhySearchInput);
  els.refreshFmhy.addEventListener("click", loadFmhyPage);
  els.fileForm.addEventListener("submit", handleFileCreate);
  els.saveFile.addEventListener("click", handleFileSave);
  els.deleteFile.addEventListener("click", handleFileDelete);
}

function closeMenu() {
  if (window.bootstrap && els.siteMenu) {
    window.bootstrap.Offcanvas.getOrCreateInstance(els.siteMenu).hide();
  }
}

function tickClock() {
  els.liveClock.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderAll() {
  renderSchedule();
  renderFinance();
  renderChat();
  renderFiles();
  renderFmhy();
  renderChatSummary();
}

async function loadNhlData() {
  els.nhlTicker.textContent = "Loading the NHL scoreboard…";
  els.nhlGames.innerHTML = "";

  const sources = [
    "nhl-proxy.php",
    "https://api-web.nhle.com/v1/score/now"
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`NHL request failed: ${response.status}`);
      }

      const data = await response.json();
      runtime.nhlGames = Array.isArray(data.games) ? data.games : [];
      renderNhl();
      return;
    } catch (error) {
      console.warn("NHL source failed", source, error);
    }
  }

  els.nhlTicker.textContent = "The NHL feed is unavailable right now.";
  els.nhlGames.innerHTML = `<div class="col-12"><div class="panel"><p class="status-text mb-0">Official NHL data could not be loaded.</p></div></div>`;
}

function renderNhl() {
  if (!runtime.nhlGames.length) {
    els.nhlTicker.textContent = "No NHL games are listed at the moment.";
    els.nhlGames.innerHTML = `<div class="col-12"><div class="panel"><p class="status-text mb-0">No games on the official scoreboard right now.</p></div></div>`;
    return;
  }

  const stamp = new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
  els.nhlTicker.textContent = `${runtime.nhlGames.map(formatNhlTicker).join("   •   ")}   •   Updated ${stamp}`;
  els.nhlGames.innerHTML = runtime.nhlGames.slice(0, 8).map((game) => `
    <div class="col-12 col-md-6 col-xl-3">
      <article class="nhl-game-card">
        <div class="section-kicker">${escapeHtml(formatNhlStatus(game))}</div>
        <div class="nhl-teams">
          <div>
            <div>${escapeHtml(getNhlTeamName(game.awayTeam))}</div>
            <div class="status-text">${escapeHtml(getNhlTeamAbbrev(game.awayTeam))}</div>
          </div>
          <div class="nhl-score">${escapeHtml(String(game.awayTeam?.score ?? "-"))}</div>
        </div>
        <div class="nhl-teams">
          <div>
            <div>${escapeHtml(getNhlTeamName(game.homeTeam))}</div>
            <div class="status-text">${escapeHtml(getNhlTeamAbbrev(game.homeTeam))}</div>
          </div>
          <div class="nhl-score">${escapeHtml(String(game.homeTeam?.score ?? "-"))}</div>
        </div>
        <div class="status-text mt-2">${escapeHtml(formatNhlVenue(game))}</div>
      </article>
    </div>
  `).join("");
}

function formatNhlTicker(game) {
  return `${getNhlTeamAbbrev(game.awayTeam)} ${game.awayTeam?.score ?? "-"} - ${game.homeTeam?.score ?? "-"} ${getNhlTeamAbbrev(game.homeTeam)} (${formatNhlStatus(game)})`;
}

function getNhlTeamName(team) {
  return team?.name?.default || team?.commonName?.default || team?.placeName?.default || team?.abbrev || "Team";
}

function getNhlTeamAbbrev(team) {
  return team?.abbrev || getNhlTeamName(team);
}

function formatNhlStatus(game) {
  if (game.gameState === "LIVE" || game.gameState === "CRIT") {
    const periodLabel = game.periodDescriptor?.periodType === "OT"
      ? "OT"
      : game.periodDescriptor?.number
        ? `P${game.periodDescriptor.number}`
        : "Live";
    return `Live ${periodLabel} • ${game.clock?.timeRemaining || "00:00"}`;
  }
  if (game.gameState === "FINAL" || game.gameState === "OFF") {
    return "Final";
  }
  const kickoff = game.startTimeUTC ? new Date(game.startTimeUTC) : null;
  return kickoff ? kickoff.toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" }) : "Scheduled";
}

function formatNhlVenue(game) {
  const venue = game.venue?.default || "Arena TBD";
  const series = game.seriesStatus?.seriesTitle ? ` • ${game.seriesStatus.seriesTitle}` : "";
  return `${venue}${series}`;
}

function handleGpsWeather() {
  if (!navigator.geolocation) {
    renderWeatherStatus("Geolocation is not available in this browser.");
    return;
  }

  renderWeatherStatus("Checking your location…");
  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    try {
      const weather = await fetchWeather(coords.latitude, coords.longitude, "Current location");
      runtime.weather = weather;
      state.weatherZip = "";
      saveState();
      renderWeather();
    } catch (error) {
      console.error(error);
      renderWeatherStatus("Could not load weather from your current location.");
    }
  }, () => {
    renderWeatherStatus("Location permission was denied. Try a zip or postal code instead.");
  });
}

async function handleZipWeather(event) {
  event.preventDefault();
  const query = els.zipInput.value.trim();
  if (!query) {
    renderWeatherStatus("Enter a city, zip, or postal code first.");
    return;
  }

  state.weatherZip = query;
  saveState();
  await lookupWeatherByQuery(query);
}

async function lookupWeatherByQuery(query) {
  renderWeatherStatus(`Looking up weather for ${query}…`);

  try {
    const match = await lookupLocation(query);

    if (!match) {
      renderWeatherStatus("No location match found. Try a city, province/state, or postal code.");
      return;
    }

    runtime.weather = await fetchWeather(match.latitude, match.longitude, match.label);
    renderWeather();
  } catch (error) {
    console.error(error);
    renderWeatherStatus("Weather lookup failed.");
  }
}

async function lookupLocation(query) {
  const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`, {
    cache: "no-store"
  });

  if (geoResponse.ok) {
    const geoData = await geoResponse.json();
    const match = geoData.results?.[0];

    if (match) {
      return {
        latitude: match.latitude,
        longitude: match.longitude,
        label: [match.name, match.admin1, match.country].filter(Boolean).join(", ")
      };
    }
  }

  const fallbackResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json"
    }
  });

  if (!fallbackResponse.ok) {
    return null;
  }

  const fallbackData = await fallbackResponse.json();
  const fallback = fallbackData?.[0];
  if (!fallback) {
    return null;
  }

  return {
    latitude: Number(fallback.lat),
    longitude: Number(fallback.lon),
    label: fallback.display_name
  };
}

async function fetchWeather(latitude, longitude, label) {
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=5`, {
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`);
  }

  const data = await response.json();
  return {
    label,
    current: data.current,
    daily: data.daily
  };
}

function renderWeather() {
  if (!runtime.weather) {
    renderWeatherStatus("Weather data is not loaded yet.");
    return;
  }

  const { current, daily, label } = runtime.weather;
  const meta = weatherCodeMeta(current.weather_code);
  const humidity = Number(current.relative_humidity_2m ?? 0);
  const rainChance = Number(daily.precipitation_probability_max?.[0] ?? 0);

  const detailMarkup = `
    <div class="weather-visual">
      <div class="weather-scene ${escapeHtml(meta.scene)}">
        <div class="weather-scene-lines"></div>
      </div>
      <div>
        <div class="weather-icon">${meta.icon}</div>
        <div class="weather-temp">${Math.round(current.temperature_2m)}°C</div>
        <div class="weather-location">${escapeHtml(label)}</div>
        <div class="weather-label mt-2">${escapeHtml(meta.label)}</div>
        <div class="status-text mt-2">Auto-populated and saved in this browser.</div>
      </div>
    </div>
    <div class="weather-detail-grid">
      <div class="weather-detail">
        <div class="section-kicker">Feels like</div>
        <div class="summary-value">${Math.round(current.apparent_temperature)}°C</div>
      </div>
      <div class="weather-detail">
        <div class="section-kicker">Wind</div>
        <div class="summary-value">${Math.round(current.wind_speed_10m)} km/h</div>
      </div>
      <div class="weather-detail">
        <div class="section-kicker">Humidity</div>
        <div class="summary-value">${humidity}%</div>
      </div>
      <div class="weather-detail">
        <div class="section-kicker">Today</div>
        <div class="summary-value">${Math.round(daily.temperature_2m_max[0])}° / ${Math.round(daily.temperature_2m_min[0])}°</div>
      </div>
      <div class="weather-detail">
        <div class="section-kicker">Rain chance</div>
        <div class="summary-value">${rainChance}%</div>
      </div>
      <div class="weather-detail">
        <div class="section-kicker">Outlook</div>
        <div class="summary-value">${escapeHtml(meta.shortLabel)}</div>
      </div>
    </div>
  `;

  els.weatherOutput.innerHTML = detailMarkup;
  if (els.weatherHero) {
    els.weatherHero.className = `weather-hero panel weather-hero-panel mb-3 ${meta.scene}`;
    els.weatherHero.innerHTML = detailMarkup;
  }
  els.weatherForecast.innerHTML = daily.time.map((date, index) => `
    <div class="col-12 col-sm-6 col-lg-4 col-xl">
      <div class="forecast-card h-100">
        <span class="forecast-icon">${weatherCodeMeta(daily.weather_code[index]).icon}</span>
        <div class="fw-bold">${escapeHtml(formatShortDate(date))}</div>
        <div class="status-text">${escapeHtml(weatherCodeMeta(daily.weather_code[index]).label)}</div>
        <div class="mt-2 fw-semibold">${Math.round(daily.temperature_2m_max[index])}° / ${Math.round(daily.temperature_2m_min[index])}°</div>
        <div class="status-text mt-2">${Math.round(daily.precipitation_probability_max[index] ?? 0)}% precip</div>
      </div>
    </div>
  `).join("");
}

function renderWeatherStatus(message) {
  const markup = `<p class="status-text mb-0">${escapeHtml(message)}</p>`;
  els.weatherOutput.innerHTML = markup;
  if (els.weatherHero) {
    els.weatherHero.className = "weather-hero panel weather-hero-panel mb-3";
    els.weatherHero.innerHTML = markup;
  }
  els.weatherForecast.innerHTML = `<div class="col-12"><div class="panel"><p class="status-text mb-0">Forecast will show here once weather is loaded.</p></div></div>`;
}

function weatherCodeMeta(code) {
  const map = {
    0: { icon: "☀️", label: "Clear skies", shortLabel: "Clear", scene: "sunny" },
    1: { icon: "🌤️", label: "Mostly clear", shortLabel: "Bright", scene: "sunny" },
    2: { icon: "⛅", label: "Partly cloudy", shortLabel: "Mixed sky", scene: "cloudy" },
    3: { icon: "☁️", label: "Overcast", shortLabel: "Cloudy", scene: "cloudy" },
    45: { icon: "🌫️", label: "Foggy", shortLabel: "Fog", scene: "cloudy" },
    48: { icon: "🌫️", label: "Icy fog", shortLabel: "Fog", scene: "cloudy" },
    51: { icon: "🌦️", label: "Light drizzle", shortLabel: "Drizzle", scene: "rainy" },
    53: { icon: "🌦️", label: "Drizzle", shortLabel: "Drizzle", scene: "rainy" },
    55: { icon: "🌧️", label: "Heavy drizzle", shortLabel: "Rainy", scene: "rainy" },
    61: { icon: "🌧️", label: "Light rain", shortLabel: "Rain", scene: "rainy" },
    63: { icon: "🌧️", label: "Rain", shortLabel: "Rain", scene: "rainy" },
    65: { icon: "🌧️", label: "Heavy rain", shortLabel: "Heavy rain", scene: "rainy" },
    71: { icon: "🌨️", label: "Light snow", shortLabel: "Snow", scene: "snowy" },
    73: { icon: "🌨️", label: "Snow", shortLabel: "Snow", scene: "snowy" },
    75: { icon: "❄️", label: "Heavy snow", shortLabel: "Snow", scene: "snowy" },
    80: { icon: "🌦️", label: "Rain showers", shortLabel: "Showers", scene: "rainy" },
    81: { icon: "🌧️", label: "Showers", shortLabel: "Showers", scene: "rainy" },
    82: { icon: "🌧️", label: "Heavy showers", shortLabel: "Showers", scene: "rainy" },
    95: { icon: "⛈️", label: "Thunderstorms", shortLabel: "Storms", scene: "stormy" },
    96: { icon: "⛈️", label: "Storms and hail", shortLabel: "Storms", scene: "stormy" },
    99: { icon: "⛈️", label: "Strong storms", shortLabel: "Storms", scene: "stormy" }
  };

  return map[code] || { icon: "🌥️", label: "Mixed conditions", shortLabel: "Mixed", scene: "cloudy" };
}

function handleEventSubmit(event) {
  event.preventDefault();
  const title = els.eventTitle.value.trim();
  const date = els.eventDate.value;

  if (!title || !date) {
    return;
  }

  state.events.push({
    id: crypto.randomUUID(),
    title,
    date
  });

  els.eventForm.reset();
  saveState();
  renderSchedule();
}

function handleBillSubmit(event) {
  event.preventDefault();
  const name = els.billName.value.trim();
  const amount = Number(els.billAmount.value);
  const frequency = els.billFrequency.value;
  const firstDue = els.billFirstDue.value;

  if (!name || amount <= 0 || !firstDue) {
    return;
  }

  state.billDefinitions.push({
    id: crypto.randomUUID(),
    name,
    amount,
    frequency,
    firstDue
  });

  els.billForm.reset();
  els.billFirstDue.value = todayIso();
  saveState();
  renderSchedule();
  renderFinance();
}

function handleShiftSubmit(event) {
  event.preventDefault();
  state.shiftConfig = {
    startDate: els.shiftStart.value || DEFAULT_SHIFT_CONFIG.startDate,
    dayStart: els.dayStartTime.value || DEFAULT_SHIFT_CONFIG.dayStart,
    dayEnd: els.dayEndTime.value || DEFAULT_SHIFT_CONFIG.dayEnd,
    nightStart: els.nightStartTime.value || DEFAULT_SHIFT_CONFIG.nightStart,
    nightEnd: els.nightEndTime.value || DEFAULT_SHIFT_CONFIG.nightEnd
  };
  saveState();
  renderSchedule();
}

function buildShiftItems() {
  const start = new Date(`${state.shiftConfig.startDate}T00:00:00`);
  const end = getScheduleHorizonEnd();
  const items = [];
  const horizonStart = startOfDay(new Date());
  const renderStart = start < horizonStart ? start : horizonStart;

  for (let cursor = new Date(renderStart); cursor <= end; cursor = addDays(cursor, 1)) {
    const diffDays = Math.floor((startOfDay(cursor).getTime() - start.getTime()) / 86400000);
    if (diffDays < 0) {
      continue;
    }

    const cycleDay = diffDays % 28;
    const iso = toDateInputValue(cursor);

    if (cycleDay <= 6) {
      items.push({
        id: `shift-day-${iso}`,
        source: "shift",
        type: "shift-day",
        title: "Alamos day shift",
        date: iso,
        time: formatShiftTimeRange(state.shiftConfig.dayStart, state.shiftConfig.dayEnd)
      });
      continue;
    }

    if (cycleDay >= 13 && cycleDay <= 19) {
      items.push({
        id: `shift-night-${iso}`,
        source: "shift",
        type: "shift-night",
        title: "Alamos night shift",
        date: iso,
        time: formatShiftTimeRange(state.shiftConfig.nightStart, state.shiftConfig.nightEnd)
      });
      continue;
    }

    items.push({
      id: `off-${iso}`,
      source: "shift",
      type: "off",
      title: "Home day",
      date: iso,
      time: cycleDay === 12
        ? "Home until 6:30 p.m., then night shift"
        : cycleDay === 20
          ? "Home after 6:30 a.m."
          : "Off"
    });
  }

  return items;
}

function buildBillOccurrences() {
  const occurrences = [];
  const horizon = getScheduleHorizonEnd();

  state.billDefinitions.forEach((definition) => {
    if (!definition.firstDue) {
      return;
    }

    let due = new Date(`${definition.firstDue}T00:00:00`);
    if (Number.isNaN(due.getTime())) {
      return;
    }

    while (due <= horizon) {
      occurrences.push({
        id: `${definition.id}-${toDateInputValue(due)}`,
        source: "bill",
        definitionId: definition.id,
        type: "bill",
        title: definition.name,
        amount: definition.amount,
        date: toDateInputValue(due)
      });

      if (definition.frequency === "one-time") {
        break;
      }

      if (definition.frequency === "weekly") {
        due = addDays(due, 7);
      } else if (definition.frequency === "biweekly") {
        due = addDays(due, 14);
      } else {
        due = appMonthAddJs(due, 1);
      }
    }
  });

  return occurrences;
}

function getScheduleItems() {
  const shifts = buildShiftItems();
  const bills = buildBillOccurrences();
  const events = state.events.map((event) => ({
    ...event,
    source: "event",
    type: "event"
  }));

  return [...shifts, ...bills, ...events].sort((a, b) => {
    if (a.date === b.date) {
      return (a.type || "").localeCompare(b.type || "");
    }
    return new Date(`${a.date}T00:00:00`) - new Date(`${b.date}T00:00:00`);
  });
}

function renderSchedule() {
  const items = getScheduleItems();
  renderScheduleSpotlight(items);
  renderScheduleCalendar(items);
  renderUpcomingSchedule(items);
  renderSummaryCards(items);
}

function renderScheduleSpotlight(items) {
  const today = startOfDay(new Date());
  const nextShift = items.find((item) => item.source === "shift" && item.type !== "off" && new Date(`${item.date}T00:00:00`) >= today);
  const nextHome = items.find((item) => item.source === "shift" && item.type === "off" && new Date(`${item.date}T00:00:00`) >= today);
  const nextExtra = items.find((item) => (item.source === "event" || item.source === "bill") && new Date(`${item.date}T00:00:00`) >= today);

  els.schedulePatternTitle.textContent = "Wednesday to Tuesday days, then Tuesday to Tuesday nights";
  els.schedulePatternMeta.textContent = `Day block: ${formatShiftTimeRange(state.shiftConfig.dayStart, state.shiftConfig.dayEnd)} from Wednesday morning through Tuesday evening. Night block: ${formatShiftTimeRange(state.shiftConfig.nightStart, state.shiftConfig.nightEnd)} starting the following Tuesday evening and ending the next Tuesday morning.`;

  const cards = [
    nextShift ? {
      label: shortItemTitle(nextShift),
      title: formatLongDate(nextShift.date),
      meta: nextShift.time
    } : {
      label: "No next shift",
      title: "Adjust the pattern",
      meta: "Work blocks will show here."
    },
    nextHome ? {
      label: "Next home day",
      title: formatLongDate(nextHome.date),
      meta: "Off"
    } : {
      label: "No home block",
      title: "Pattern missing",
      meta: "Home days will show here."
    },
    nextExtra ? {
      label: nextExtra.source === "bill" ? "Next bill" : "Next event",
      title: nextExtra.title,
      meta: nextExtra.source === "bill"
        ? `${formatLongDate(nextExtra.date)} • ${formatCurrency(nextExtra.amount)}`
        : formatLongDate(nextExtra.date)
    } : {
      label: "Nothing extra",
      title: "No bills or events yet",
      meta: "Add something below."
    }
  ];

  els.scheduleNowCards.innerHTML = cards.map((card) => `
    <div class="schedule-now-card">
      <div class="section-kicker">${escapeHtml(card.label)}</div>
      <strong>${escapeHtml(card.title)}</strong>
      <div class="status-text">${escapeHtml(card.meta)}</div>
    </div>
  `).join("");
}

function renderScheduleCalendar(items) {
  if (!els.scheduleCalendar) {
    return;
  }

  if (!window.FullCalendar) {
    els.scheduleCalendar.innerHTML = `<div class="panel"><p class="status-text mb-0">Calendar library did not load.</p></div>`;
    return;
  }

  const calendarEvents = items.map((item) => ({
    id: item.id,
    title: buildCalendarTitle(item),
    start: item.date,
    allDay: true,
    backgroundColor: getCalendarEventColor(item),
    borderColor: getCalendarEventColor(item),
    extendedProps: {
      type: item.type,
      source: item.source,
      meta: formatScheduleItemMeta(item)
    }
  }));

  if (!runtime.calendar) {
    runtime.calendar = new window.FullCalendar.Calendar(els.scheduleCalendar, {
      initialView: "dayGridMonth",
      height: "auto",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,listWeek"
      },
      buttonText: {
        today: "Today",
        month: "Month",
        list: "List"
      },
      eventTimeFormat: {
        hour: "numeric",
        minute: "2-digit",
        meridiem: "short"
      },
      eventDidMount(info) {
        info.el.title = info.event.extendedProps.meta;
      }
    });
    runtime.calendar.render();
  }

  runtime.calendar.removeAllEvents();
  runtime.calendar.addEventSource(calendarEvents);
}

function renderUpcomingSchedule(items) {
  const today = startOfDay(new Date());
  const dayGroups = Array.from({ length: 14 }, (_, index) => {
    const date = addDays(today, index);
    const iso = toDateInputValue(date);
    return {
      iso,
      items: items.filter((item) => item.date === iso)
    };
  }).filter((group) => group.items.length);

  if (!dayGroups.length) {
    els.scheduleList.innerHTML = `<div class="panel"><p class="status-text mb-0">Nothing scheduled yet.</p></div>`;
    return;
  }

  els.scheduleList.innerHTML = dayGroups.map((group) => `
    <article class="schedule-item">
      <div>
        <div class="schedule-title">
          <strong>${escapeHtml(formatLongDate(group.iso))}</strong>
          ${group.iso === todayIso() ? `<span class="pill off">Today</span>` : ""}
        </div>
        <div class="schedule-meta">${escapeHtml(scheduleGroupMeta(group.items))}</div>
      </div>
      <div class="schedule-stack">
        ${group.items.map((item) => `
          <div class="schedule-entry-row">
            <div>
              <div class="d-flex flex-wrap align-items-center gap-2">
                <span class="pill ${escapeHtml(item.type)}">${escapeHtml(shortItemTitle(item))}</span>
                <strong>${escapeHtml(displayScheduleItemLabel(item))}</strong>
              </div>
              <div class="status-text mt-1">${escapeHtml(formatScheduleItemMeta(item))}</div>
            </div>
            <div class="d-flex flex-wrap gap-2">
              ${item.source === "event" ? `
                <button class="btn btn-sm btn-outline-light" type="button" data-edit-event="${item.id}">Edit</button>
                <button class="btn btn-sm btn-outline-danger" type="button" data-delete-event="${item.id}">Delete</button>
              ` : ""}
            </div>
          </div>
        `).join("")}
      </div>
    </article>
  `).join("");

  els.scheduleList.querySelectorAll("[data-edit-event]").forEach((button) => {
    button.addEventListener("click", () => showScheduleEditForm(button.dataset.editEvent));
  });

  els.scheduleList.querySelectorAll("[data-delete-event]").forEach((button) => {
    button.addEventListener("click", () => deleteEvent(button.dataset.deleteEvent));
  });
}

function renderSummaryCards(items) {
  if (!els.nextShiftSummary || !els.nextBillSummary || !els.leftoverSummary) {
    return;
  }

  const today = startOfDay(new Date());
  const nextShift = items.find((item) => item.source === "shift" && item.type !== "off" && new Date(`${item.date}T00:00:00`) >= today);
  const nextBill = items.find((item) => item.source === "bill" && new Date(`${item.date}T00:00:00`) >= today);
  const finance = getFinanceSnapshot();

  els.nextShiftSummary.textContent = nextShift ? shortItemTitle(nextShift) : "Nothing set";
  els.nextShiftMeta.textContent = nextShift ? `${formatLongDate(nextShift.date)} • ${nextShift.time}` : "No work shifts found in the current pattern.";

  els.nextBillSummary.textContent = nextBill ? `${nextBill.title} ${formatCurrency(nextBill.amount)}` : "No bills";
  els.nextBillMeta.textContent = nextBill ? formatLongDate(nextBill.date) : "Add recurring bills to see due dates.";

  els.leftoverSummary.textContent = formatCurrency(finance.leftover);
  els.leftoverMeta.textContent = finance.income ? `Income ${formatCurrency(finance.income)} • recurring ${formatCurrency(finance.recurring)}` : "Add your monthly income to see the real number.";
}

function showScheduleEditForm(eventId) {
  const event = state.events.find((item) => item.id === eventId);
  if (!event) {
    return;
  }

  els.scheduleEditId.value = event.id;
  els.scheduleEditTitle.value = event.title;
  els.scheduleEditDate.value = event.date;
  els.scheduleEditForm.classList.remove("hidden");
  els.scheduleEditForm.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideScheduleEditForm() {
  els.scheduleEditForm.classList.add("hidden");
  els.scheduleEditForm.reset();
}

function handleEventEditSave(event) {
  event.preventDefault();
  const current = state.events.find((item) => item.id === els.scheduleEditId.value);
  if (!current) {
    return;
  }

  current.title = els.scheduleEditTitle.value.trim() || current.title;
  current.date = els.scheduleEditDate.value || current.date;
  saveState();
  hideScheduleEditForm();
  renderSchedule();
}

function deleteEvent(eventId) {
  state.events = state.events.filter((item) => item.id !== eventId);
  saveState();
  renderSchedule();
}

function handleFinanceInput() {
  state.finance = {
    income: els.incomeInput.value,
    flexSpend: els.flexSpendInput.value,
    goal: els.goalInput.value
  };
  saveState();
  renderFinance();
  renderSummaryCards(getScheduleItems());
}

function getFinanceSnapshot() {
  const income = Number(state.finance.income) || 0;
  const flexSpend = Number(state.finance.flexSpend) || 0;
  const goal = Number(state.finance.goal) || 0;
  const recurring = state.billDefinitions.reduce((total, bill) => total + estimateMonthlyBill(bill), 0);
  const totalSpend = recurring + flexSpend;
  const leftover = income - totalSpend;
  const goalGap = Math.max(goal - leftover, 0);

  return { income, flexSpend, goal, recurring, totalSpend, leftover, goalGap };
}

function renderFinance() {
  const snapshot = getFinanceSnapshot();
  els.incomeSummary.textContent = formatCurrency(snapshot.income);
  els.recurringSummary.textContent = formatCurrency(snapshot.recurring);
  els.goalSummary.textContent = snapshot.goal ? formatCurrency(snapshot.goalGap) : "No goal";
  els.freeCashSummary.textContent = formatCurrency(snapshot.leftover);

  const tips = [];
  if (!snapshot.income) {
    tips.push("Add income to get a real monthly picture.");
  } else {
    tips.push(`Income saved in the browser: ${formatCurrency(snapshot.income)}.`);
    tips.push(`${state.billDefinitions.length} saved bill${state.billDefinitions.length === 1 ? "" : "s"} with a monthly load of ${formatCurrency(snapshot.recurring)}.`);
    tips.push(`Other monthly spending is ${formatCurrency(snapshot.flexSpend)}.`);
    tips.push(snapshot.leftover >= 0 ? `Estimated free cash after bills and spending: ${formatCurrency(snapshot.leftover)}.` : `You are over budget by ${formatCurrency(Math.abs(snapshot.leftover))}.`);
    if (snapshot.goal) {
      tips.push(snapshot.goalGap === 0 ? "Your current setup covers the savings goal." : `${formatCurrency(snapshot.goalGap)} more is needed to hit the goal.`);
    }
  }

  els.financeInsights.innerHTML = tips.map((tip) => `<div class="finance-tip">${escapeHtml(tip)}</div>`).join("");
  els.billCollectionMeta.textContent = state.billDefinitions.length
    ? `${state.billDefinitions.length} bills saved locally. Add as many as you need; they will stay here.`
    : "Add as many bills as you need and they will stay saved in the browser.";
  drawBudgetChart(snapshot);
  renderBillDefinitions();
}

function renderBillDefinitions() {
  if (!state.billDefinitions.length) {
    els.billDefinitionList.innerHTML = `<div class="panel"><p class="status-text mb-0">No bills added yet.</p></div>`;
    return;
  }

  const allOccurrences = buildBillOccurrences(450);
  const today = startOfDay(new Date());
  const sortedBills = [...state.billDefinitions].sort((a, b) => {
    const nextA = allOccurrences.find((item) => item.definitionId === a.id && new Date(`${item.date}T00:00:00`) >= today);
    const nextB = allOccurrences.find((item) => item.definitionId === b.id && new Date(`${item.date}T00:00:00`) >= today);
    return new Date(`${nextA?.date || "2999-12-31"}T00:00:00`) - new Date(`${nextB?.date || "2999-12-31"}T00:00:00`);
  });

  els.billDefinitionList.innerHTML = sortedBills.map((bill) => {
    const nextDates = allOccurrences
      .filter((item) => item.definitionId === bill.id && new Date(`${item.date}T00:00:00`) >= today)
      .slice(0, 3)
      .map((item) => formatShortDate(item.date));
    return `
      <div class="bill-card">
        <div class="bill-card-header">
          <div>
            <div class="section-kicker">${escapeHtml(bill.frequency)}</div>
            <div class="fw-bold">${escapeHtml(bill.name)}</div>
          </div>
          <div class="bill-card-amount">${escapeHtml(formatCurrency(bill.amount))}</div>
        </div>
        <div class="status-text mb-2">First due ${escapeHtml(formatLongDate(bill.firstDue))}</div>
        <div class="status-text mb-2">${nextDates.length ? `Next: ${escapeHtml(nextDates.join(" • "))}` : "No future due dates found."}</div>
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div class="status-text">Monthly impact ${escapeHtml(formatCurrency(estimateMonthlyBill(bill)))}</div>
          <button class="btn btn-sm btn-outline-danger" type="button" data-delete-bill="${bill.id}">Delete</button>
        </div>
      </div>
    `;
  }).join("");

  els.billDefinitionList.querySelectorAll("[data-delete-bill]").forEach((button) => {
    button.addEventListener("click", () => {
      state.billDefinitions = state.billDefinitions.filter((bill) => bill.id !== button.dataset.deleteBill);
      saveState();
      renderSchedule();
      renderFinance();
    });
  });
}

function estimateMonthlyBill(bill) {
  if (bill.frequency === "weekly") {
    return (bill.amount * 52) / 12;
  }
  if (bill.frequency === "biweekly") {
    return (bill.amount * 26) / 12;
  }
  if (bill.frequency === "one-time") {
    return 0;
  }
  return bill.amount;
}

function drawBudgetChart(snapshot) {
  const canvas = els.budgetChart;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const recurring = Math.max(snapshot.recurring, 0);
  const flexSpend = Math.max(snapshot.flexSpend, 0);
  const leftover = Math.max(snapshot.leftover, 0);
  const total = Math.max(snapshot.income, recurring + flexSpend + leftover, 1);

  const slices = [
    { value: recurring, color: "#f0ad4e" },
    { value: flexSpend, color: "#ff7b88" },
    { value: leftover, color: "#55d6a1" },
    { value: Math.max(total - recurring - flexSpend - leftover, 0), color: "rgba(255,255,255,0.08)" }
  ];

  let current = -Math.PI / 2;
  slices.forEach((slice) => {
    if (slice.value <= 0) {
      return;
    }
    const angle = (slice.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.strokeStyle = slice.color;
    ctx.lineWidth = 24;
    ctx.lineCap = "round";
    ctx.arc(canvas.width / 2, canvas.height / 2, 88, current, current + angle);
    ctx.stroke();
    current += angle;
  });

  ctx.fillStyle = "#f4f7fb";
  ctx.font = '700 24px "Segoe UI"';
  ctx.textAlign = "center";
  ctx.fillText(formatCompactCurrency(snapshot.income), canvas.width / 2, canvas.height / 2 - 4);
  ctx.fillStyle = "#95a3b8";
  ctx.font = '600 12px "Segoe UI"';
  ctx.fillText("monthly income", canvas.width / 2, canvas.height / 2 + 18);
}

async function handleLolCompare(event) {
  event.preventDefault();
  const players = els.lolPlayers.value.trim();
  const region = els.lolRegion.value;

  state.lolPlayers = players;
  state.lolRegion = region;
  saveState();

  if (!players) {
    els.lolResults.innerHTML = `<div class="col-12"><div class="panel"><p class="status-text mb-0">Add Riot IDs like Name#Tag to compare players.</p></div></div>`;
    return;
  }

  els.lolResults.innerHTML = `<div class="col-12"><div class="panel"><p class="status-text mb-0">Loading OP.GG and Lolalytics data…</p></div></div>`;

  try {
    const response = await fetch(`lol-compare.php?region=${encodeURIComponent(region)}&players=${encodeURIComponent(players)}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || "League comparison failed.");
    }
    renderLolResults(data.players || []);
  } catch (error) {
    console.error(error);
    els.lolResults.innerHTML = `<div class="col-12"><div class="panel"><p class="status-text mb-0">League comparison could not be loaded.</p></div></div>`;
  }
}

function renderLolResults(players = []) {
  if (!players.length) {
    els.lolResults.innerHTML = `<div class="col-12"><div class="panel"><p class="status-text mb-0">No player data to show yet.</p></div></div>`;
    return;
  }

  els.lolResults.innerHTML = players.map((player) => {
    if (!player.ok) {
      return `
        <div class="col-12 col-xl-6">
          <article class="lol-card">
            <div class="section-kicker">Unavailable</div>
            <h3>${escapeHtml(player.player)}</h3>
            <p class="status-text mb-2">${escapeHtml(player.error || "Unable to load profile.")}</p>
            ${player.source ? `<a href="${escapeAttribute(player.source)}" target="_blank" rel="noreferrer noopener">Open source</a>` : ""}
          </article>
        </div>
      `;
    }

    return `
      <div class="col-12 col-xl-6">
        <article class="lol-card">
          <div class="lol-topline">
            <div>
              <div class="section-kicker">OP.GG</div>
              <h3 class="mb-1">${escapeHtml(player.player)}</h3>
              <div class="lol-record">${escapeHtml(String(player.record.wins))}W ${escapeHtml(String(player.record.losses))}L • ${escapeHtml(String(player.record.winRate))}% WR</div>
            </div>
            <div class="text-end">
              <div class="lol-rank">${escapeHtml(player.rank || "Unranked")}</div>
              <div class="status-text">${player.lp !== null ? `${escapeHtml(String(player.lp))} LP` : "No LP shown"}</div>
            </div>
          </div>
          <div class="lol-champ-list">
            ${(player.champions || []).length ? player.champions.map((champion) => `
              <div class="champ-card">
                <div class="champ-card-top">
                  <strong>${escapeHtml(champion.name)}</strong>
                  <span>${escapeHtml(String(champion.winRate))}% player WR</span>
                </div>
                <div class="status-text mt-1">${escapeHtml(String(champion.wins))}W ${escapeHtml(String(champion.losses))}L</div>
                <div class="champ-meta">
                  <span>${champion.lolalytics?.tier ? `Tier ${escapeHtml(champion.lolalytics.tier)}` : "Tier N/A"}</span>
                  <span>${champion.lolalytics?.winRate ? `${escapeHtml(String(champion.lolalytics.winRate))}% Lolalytics WR` : "WR N/A"}</span>
                  <span>${champion.lolalytics?.pickRate ? `${escapeHtml(String(champion.lolalytics.pickRate))}% pick` : "Pick N/A"}</span>
                  <span>${champion.lolalytics?.banRate ? `${escapeHtml(String(champion.lolalytics.banRate))}% ban` : "Ban N/A"}</span>
                </div>
                <div class="d-flex flex-wrap gap-2 mt-2">
                  <a class="btn btn-sm btn-outline-light" href="${escapeAttribute(player.source)}" target="_blank" rel="noreferrer noopener">OP.GG</a>
                  ${champion.lolalyticsUrl ? `<a class="btn btn-sm btn-outline-light" href="${escapeAttribute(champion.lolalyticsUrl)}" target="_blank" rel="noreferrer noopener">Lolalytics</a>` : ""}
                </div>
              </div>
            `).join("") : `<div class="status-text">No champion summary was found on OP.GG for this player.</div>`}
          </div>
        </article>
      </div>
    `;
  }).join("");
}

async function handleChatSubmit(event) {
  event.preventDefault();
  const message = els.chatInput.value.trim();
  if (!message || runtime.chatBusy) {
    return;
  }

  state.chat.push({ role: "user", message });
  els.chatInput.value = "";
  runtime.chatBusy = true;
  els.chatStatus.textContent = "Thinking…";
  renderChat();
  renderChatSummary();

  try {
    const response = await fetch("openai-chat.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages: state.chat })
    });
    const data = await response.json();

    if (!response.ok || !data.ok) {
      throw new Error(data.error || "The chat request failed.");
    }

    state.chat.push({ role: "assistant", message: data.reply });
    els.chatStatus.textContent = "Connected";
  } catch (error) {
    console.error(error);
    state.chat.push({
      role: "assistant",
      message: `Chat is not ready yet: ${error.message}`
    });
    els.chatStatus.textContent = "Server needs key";
  } finally {
    runtime.chatBusy = false;
    saveState();
    renderChat();
    renderChatSummary();
  }
}

function renderChat() {
  els.chatLog.innerHTML = "";
  state.chat.forEach((entry) => {
    const bubble = els.chatBubbleTemplate.content.firstElementChild.cloneNode(true);
    bubble.classList.add(entry.role);
    bubble.querySelector(".chat-role").textContent = entry.role === "assistant" ? "Assistant" : "You";
    bubble.querySelector(".chat-message").textContent = entry.message;
    els.chatLog.appendChild(bubble);
  });
  els.chatLog.scrollTop = els.chatLog.scrollHeight;
}

function renderChatSummary() {
  if (!els.chatSummary || !els.chatSummaryMeta) {
    return;
  }

  const lastAssistantMessage = [...state.chat].reverse().find((entry) => entry.role === "assistant")?.message || "";

  if (runtime.chatBusy) {
    els.chatSummary.textContent = "Thinking…";
    els.chatSummaryMeta.textContent = "Sending your message through the private server-side endpoint.";
    return;
  }

  if (lastAssistantMessage.startsWith("Chat is not ready yet:")) {
    els.chatSummary.textContent = "Needs setup";
    els.chatSummaryMeta.textContent = "Add OPENAI_API_KEY in GitHub Actions secrets so the server can answer.";
    return;
  }

  els.chatSummary.textContent = state.chat.length > 1 ? "Live" : "Ready";
  els.chatSummaryMeta.textContent = "Private chat runs through the server-side OpenAI endpoint.";
}

function handleFmhyPageChange(pageSlug) {
  state.fmhyPage = sanitizeFmhyPage(pageSlug);
  saveState();
  loadFmhyPage();
}

function handleFmhySearchInput() {
  state.fmhySearch = els.fmhySearch.value.trim();
  saveState();
  renderFmhy();
}

async function loadFmhyPage() {
  els.fmhyMeta.textContent = "Loading FMHY page…";
  els.fmhyResults.innerHTML = `<div class="panel"><p class="status-text mb-0">Loading links from FMHY…</p></div>`;
  runtime.fmhy = null;

  try {
    const response = await fetch(`fmhy-proxy.php?page=${encodeURIComponent(state.fmhyPage)}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      throw new Error(data.error || "FMHY load failed.");
    }
    runtime.fmhy = data;
    renderFmhy();
  } catch (error) {
    console.error(error);
    runtime.fmhy = null;
    els.fmhyMeta.textContent = "FMHY could not be loaded right now.";
    els.fmhyResults.innerHTML = `<div class="panel"><p class="status-text mb-0">FMHY content could not be loaded.</p></div>`;
  }
}

function renderFmhy() {
  els.fmhySearch.value = state.fmhySearch;

  if (!runtime.fmhy) {
    els.fmhyCategories.innerHTML = "";
    runtime.fmhySections = [];
    return;
  }

  const categories = Array.isArray(runtime.fmhy.categories) ? runtime.fmhy.categories : [];
  els.fmhyCategories.innerHTML = categories.map((category) => `
    <button
      type="button"
      class="portal-chip-button ${category.slug === state.fmhyPage ? "active" : ""}"
      data-fmhy-slug="${escapeAttribute(category.slug)}"
    >
      ${escapeHtml(category.label)}
    </button>
  `).join("");

  els.fmhyCategories.querySelectorAll("[data-fmhy-slug]").forEach((button) => {
    button.addEventListener("click", () => {
      handleFmhyPageChange(button.dataset.fmhySlug);
    });
  });

  const query = state.fmhySearch.toLowerCase();
  const sections = (runtime.fmhy.sections || [])
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!query) {
          return true;
        }
        return [section.title, item.label, item.description, item.url].join(" ").toLowerCase().includes(query);
      })
    }))
    .filter((section) => section.items.length);
  runtime.fmhySections = sections;

  const totalLinks = sections.reduce((sum, section) => sum + section.items.length, 0);
  els.fmhyMeta.innerHTML = `
    <div><strong>${escapeHtml(runtime.fmhy.title || "FMHY")}</strong></div>
    <div class="status-text">${escapeHtml(runtime.fmhy.description || "")}</div>
    <div class="status-text">${sections.length} sections • ${totalLinks} links • Source: <a href="${escapeAttribute(runtime.fmhy.source)}" target="_blank" rel="noreferrer noopener">${escapeHtml(runtime.fmhy.source)}</a></div>
  `;

  if (!sections.length) {
    els.fmhyResults.innerHTML = `<div class="panel"><p class="status-text mb-0">No FMHY links matched your filter.</p></div>`;
    return;
  }

  els.fmhyResults.innerHTML = sections.map((section, index) => `
    <details class="fmhy-section" ${index === 0 ? "open" : ""} data-fmhy-section-index="${index}">
      <summary>
        <span>${escapeHtml(section.title)}</span>
        <span class="status-text">${section.items.length} links</span>
      </summary>
      <div class="fmhy-grid" data-fmhy-grid>
        ${index === 0 ? renderFmhyItems(section.items) : `<div class="status-text">Open to load links.</div>`}
      </div>
    </details>
  `).join("");

  els.fmhyResults.querySelectorAll("[data-fmhy-section-index]").forEach((sectionEl) => {
    const index = Number.parseInt(sectionEl.dataset.fmhySectionIndex || "", 10);
    const grid = sectionEl.querySelector("[data-fmhy-grid]");
    if (!grid || Number.isNaN(index)) {
      return;
    }

    sectionEl.addEventListener("toggle", () => {
      if (!sectionEl.open || grid.dataset.loaded === "true") {
        return;
      }
      const section = runtime.fmhySections[index];
      if (!section) {
        return;
      }
      grid.innerHTML = renderFmhyItems(section.items);
      grid.dataset.loaded = "true";
    });
  });
}

function renderFmhyItems(items) {
  return items.map((item) => `
    <div class="fmhy-item">
      <a href="${escapeAttribute(item.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(item.label)}</a>
      <div class="status-text">${escapeHtml(item.description || "")}</div>
    </div>
  `).join("");
}

function handleFileCreate(event) {
  event.preventDefault();
  const name = els.fileName.value.trim();
  if (!name) {
    return;
  }

  const file = {
    id: crypto.randomUUID(),
    name,
    content: "",
    updatedAt: Date.now()
  };
  state.files.unshift(file);
  state.activeFileId = file.id;
  els.fileForm.reset();
  saveState();
  renderFiles();
}

function renderFiles() {
  if (!state.files.length) {
    els.fileList.innerHTML = `<div class="panel"><p class="status-text mb-0">No notes yet.</p></div>`;
    els.fileTitle.value = "";
    els.fileContent.value = "";
    return;
  }

  const orderedFiles = [...state.files].sort((a, b) => b.updatedAt - a.updatedAt);
  const active = orderedFiles.find((file) => file.id === state.activeFileId) || orderedFiles[0];
  state.activeFileId = active.id;

  els.fileList.innerHTML = orderedFiles.map((file) => `
    <button type="button" class="file-entry ${file.id === active.id ? "active" : ""}" data-file-id="${file.id}">
      <div class="fw-bold">${escapeHtml(file.name)}</div>
      <div class="file-time mt-1">${new Date(file.updatedAt).toLocaleString()}</div>
    </button>
  `).join("");

  els.fileList.querySelectorAll("[data-file-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeFileId = button.dataset.fileId;
      saveState();
      renderFiles();
    });
  });

  els.fileTitle.value = active.name;
  els.fileContent.value = active.content;
}

function handleFileSave() {
  const active = state.files.find((file) => file.id === state.activeFileId);
  if (!active) {
    return;
  }

  active.name = els.fileTitle.value.trim() || active.name;
  active.content = els.fileContent.value;
  active.updatedAt = Date.now();
  saveState();
  renderFiles();
}

function handleFileDelete() {
  if (!state.activeFileId) {
    return;
  }

  state.files = state.files.filter((file) => file.id !== state.activeFileId);
  state.activeFileId = state.files[0]?.id || null;
  saveState();
  renderFiles();
}

function shortItemTitle(item) {
  if (item.type === "off") {
    return "Home";
  }
  if (item.type === "shift-day") {
    return "Day shift";
  }
  if (item.type === "shift-night") {
    return "Night shift";
  }
  if (item.type === "bill") {
    return "Bill";
  }
  if (item.type === "event") {
    return "Event";
  }
  return item.title;
}

function displayScheduleItemLabel(item) {
  if (item.type === "shift-day") {
    return "Alamos day shift";
  }
  if (item.type === "shift-night") {
    return "Alamos night shift";
  }
  if (item.type === "off") {
    return "Home day";
  }
  return item.title;
}

function formatScheduleItemMeta(item) {
  const parts = [];
  if (item.time) {
    parts.push(item.time);
  }
  if (typeof item.amount === "number") {
    parts.push(formatCurrency(item.amount));
  }
  if (item.source === "event" && !parts.length) {
    parts.push("Saved event");
  }
  if (!parts.length) {
    parts.push(formatLongDate(item.date));
  }
  return parts.join(" • ");
}

function scheduleGroupMeta(items) {
  return items.map((item) => shortItemTitle(item)).join(" • ");
}

function buildCalendarTitle(item) {
  if (item.type === "shift-day") {
    return "Day shift";
  }
  if (item.type === "shift-night") {
    return "Night shift";
  }
  if (item.type === "off") {
    return "Off";
  }
  if (item.type === "bill") {
    return `${item.title} ${formatCurrency(item.amount)}`;
  }
  return item.title;
}

function getCalendarEventColor(item) {
  if (item.type === "shift-day") {
    return "#50c78d";
  }
  if (item.type === "shift-night") {
    return "#5da9ff";
  }
  if (item.type === "bill") {
    return "#f0ad4e";
  }
  if (item.type === "event") {
    return "#ff7d92";
  }
  return "#728198";
}

function formatShiftTimeRange(startTime, endTime) {
  if (!startTime || !endTime) {
    return "Time TBD";
  }
  return `${formatClockTime(startTime)} - ${formatClockTime(endTime)}`;
}

function formatClockTime(value) {
  const [hoursString = "0", minutesString = "00"] = String(value).split(":");
  const hours = Number(hoursString);
  const minutes = Number(minutesString);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function sanitizeFmhyPage(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?fmhy\.net\//, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .replace(/[^a-z0-9-]/g, "");

  return normalized || "video";
}

function todayIso() {
  return toDateInputValue(startOfDay(new Date()));
}

function getScheduleHorizonEnd() {
  return startOfDay(new Date(`${SCHEDULE_END_DATE}T00:00:00`));
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLongDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatShortDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(amount || 0);
}

function formatCompactCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1
  }).format(amount || 0);
}

function appMonthAddJs(date, months) {
  const base = new Date(date);
  const currentDay = base.getDate();
  const target = new Date(base.getFullYear(), base.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(currentDay, lastDay));
  return target;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(String(value));
}

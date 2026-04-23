const STORAGE_KEY = "imbuckleyy-dashboard-v1";

const defaultState = {
  events: [],
  bills: [],
  shifts: [],
  finance: { income: "", expenses: "", goal: "" },
  chat: [
    {
      role: "bot",
      message: "Private mode is live. I can help brainstorm plans, budgets, meals, or reminders."
    }
  ],
  fmhy: {
    categories: {
      Streaming: [
        { label: "FMHY", url: "https://fmhy.net/" },
        { label: "Internet Archive", url: "https://archive.org/" }
      ],
      Tools: [
        { label: "12ft Ladder", url: "https://12ft.io/" },
        { label: "Wayback Machine", url: "https://web.archive.org/" }
      ]
    }
  },
  files: [
    {
      id: crypto.randomUUID(),
      name: "Weekend ideas",
      content: "- Movie night\n- Costco run\n- Try a new ramen spot",
      updatedAt: Date.now()
    }
  ],
  activeFileId: null,
  weatherZip: "",
  lolPlayers: "",
  riotApiKey: ""
};

let state = loadState();

const proxyCatalog = [
  {
    label: "12ft Ladder",
    description: "Reader-mode style wrapper for article pages.",
    url: "https://12ft.io/"
  },
  {
    label: "Wayback Machine",
    description: "Open archived copies of pages without ad-heavy originals.",
    url: "https://web.archive.org/"
  },
  {
    label: "TXTify",
    description: "Text-focused proxy for clutter-free article reading.",
    url: "https://txtify.it/"
  }
];

const els = {
  liveClock: document.getElementById("liveClock"),
  menuToggle: document.getElementById("menuToggle"),
  menuDrawer: document.getElementById("menuDrawer"),
  menuScrim: document.getElementById("menuScrim"),
  navLinks: document.querySelectorAll("[data-nav-link]"),
  nhlTicker: document.getElementById("nhlTicker"),
  refreshTicker: document.getElementById("refreshTicker"),
  useGpsWeather: document.getElementById("useGpsWeather"),
  zipWeatherForm: document.getElementById("zipWeatherForm"),
  zipInput: document.getElementById("zipInput"),
  weatherOutput: document.getElementById("weatherOutput"),
  lolForm: document.getElementById("lolForm"),
  lolPlayers: document.getElementById("lolPlayers"),
  lolApiKey: document.getElementById("lolApiKey"),
  lolTableBody: document.getElementById("lolTableBody"),
  chatLog: document.getElementById("chatLog"),
  chatForm: document.getElementById("chatForm"),
  chatInput: document.getElementById("chatInput"),
  chatBubbleTemplate: document.getElementById("chatBubbleTemplate"),
  eventForm: document.getElementById("eventForm"),
  eventTitle: document.getElementById("eventTitle"),
  eventDate: document.getElementById("eventDate"),
  billForm: document.getElementById("billForm"),
  billName: document.getElementById("billName"),
  billAmount: document.getElementById("billAmount"),
  billFrequency: document.getElementById("billFrequency"),
  billDay: document.getElementById("billDay"),
  shiftForm: document.getElementById("shiftForm"),
  shiftPattern: document.getElementById("shiftPattern"),
  shiftStart: document.getElementById("shiftStart"),
  scheduleList: document.getElementById("scheduleList"),
  incomeInput: document.getElementById("incomeInput"),
  expenseInput: document.getElementById("expenseInput"),
  goalInput: document.getElementById("goalInput"),
  budgetChart: document.getElementById("budgetChart"),
  financeInsights: document.getElementById("financeInsights"),
  categoryForm: document.getElementById("categoryForm"),
  categoryInput: document.getElementById("categoryInput"),
  linkForm: document.getElementById("linkForm"),
  linkCategory: document.getElementById("linkCategory"),
  linkLabel: document.getElementById("linkLabel"),
  linkUrl: document.getElementById("linkUrl"),
  linksContainer: document.getElementById("linksContainer"),
  proxyLinks: document.getElementById("proxyLinks"),
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
  renderAll();
  tickClock();
  setInterval(tickClock, 1000);
  loadNhlTicker();
  renderProxyLinks();
  if (state.weatherZip) {
    lookupWeatherByQuery(state.weatherZip);
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
      finance: { ...defaultState.finance, ...(parsed.finance || {}) },
      fmhy: {
        categories: {
          ...defaultState.fmhy.categories,
          ...((parsed.fmhy && parsed.fmhy.categories) || {})
        }
      }
    };
  } catch (error) {
    console.error("Failed to load state", error);
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function primeInputs() {
  els.zipInput.value = state.weatherZip || "";
  els.lolPlayers.value = state.lolPlayers || "";
  els.lolApiKey.value = state.riotApiKey || "";
  els.incomeInput.value = state.finance.income;
  els.expenseInput.value = state.finance.expenses;
  els.goalInput.value = state.finance.goal;
  if (!state.activeFileId && state.files.length) {
    state.activeFileId = state.files[0].id;
  }
}

function bindEvents() {
  els.menuToggle?.addEventListener("click", toggleMenu);
  els.menuScrim?.addEventListener("click", closeMenu);
  els.navLinks?.forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
  els.refreshTicker.addEventListener("click", loadNhlTicker);
  els.useGpsWeather.addEventListener("click", handleGpsWeather);
  els.zipWeatherForm.addEventListener("submit", handleZipWeather);
  els.lolForm.addEventListener("submit", handleLolCompare);
  els.chatForm.addEventListener("submit", handleChatSubmit);
  els.eventForm.addEventListener("submit", handleEventSubmit);
  els.billForm.addEventListener("submit", handleBillSubmit);
  els.shiftForm.addEventListener("submit", handleShiftSubmit);
  [els.incomeInput, els.expenseInput, els.goalInput].forEach((input) => {
    input.addEventListener("input", handleFinanceInput);
  });
  els.categoryForm.addEventListener("submit", handleCategorySubmit);
  els.linkForm.addEventListener("submit", handleLinkSubmit);
  els.fileForm.addEventListener("submit", handleFileCreate);
  els.saveFile.addEventListener("click", handleFileSave);
  els.deleteFile.addEventListener("click", handleFileDelete);
}

function toggleMenu() {
  const isOpen = els.menuDrawer.classList.toggle("is-open");
  els.menuScrim.classList.toggle("is-open", isOpen);
  els.menuToggle.classList.toggle("is-open", isOpen);
  els.menuToggle.setAttribute("aria-expanded", String(isOpen));
  els.menuDrawer.setAttribute("aria-hidden", String(!isOpen));
}

function closeMenu() {
  els.menuDrawer?.classList.remove("is-open");
  els.menuScrim?.classList.remove("is-open");
  els.menuToggle?.classList.remove("is-open");
  els.menuToggle?.setAttribute("aria-expanded", "false");
  els.menuDrawer?.setAttribute("aria-hidden", "true");
}

function renderAll() {
  renderChat();
  renderSchedule();
  renderFinance();
  renderLinks();
  renderFiles();
}

function tickClock() {
  els.liveClock.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

async function loadNhlTicker() {
  els.nhlTicker.textContent = "Loading latest NHL scores...";
  try {
    const response = await fetch("https://nhl-score-api.herokuapp.com/api/scores/latest");
    if (!response.ok) {
      throw new Error(`Ticker request failed: ${response.status}`);
    }
    const data = await response.json();
    const games = Array.isArray(data.games) ? data.games : Array.isArray(data) ? data : [];
    if (!games.length) {
      els.nhlTicker.textContent = "No live NHL games right now. Check back later.";
      return;
    }
    const tickerLine = games.map(formatGameTicker).join("   •   ");
    els.nhlTicker.textContent = tickerLine;
  } catch (error) {
    console.error(error);
    els.nhlTicker.textContent = "Unable to load NHL scores right now.";
  }
}

function formatGameTicker(game) {
  const away = game.away || game.awayTeam || game.teams?.away?.team?.name || "Away";
  const home = game.home || game.homeTeam || game.teams?.home?.team?.name || "Home";
  const awayScore = game.awayScore ?? game.teams?.away?.score ?? "-";
  const homeScore = game.homeScore ?? game.teams?.home?.score ?? "-";
  const status = game.status || game.period || game.gameState || "Final/Live";
  return `${away} ${awayScore} - ${homeScore} ${home} (${status})`;
}

function handleGpsWeather() {
  if (!navigator.geolocation) {
    renderWeatherStatus("Geolocation is not available in this browser.");
    return;
  }
  renderWeatherStatus("Checking your location...");
  navigator.geolocation.getCurrentPosition(async ({ coords }) => {
    try {
      const weather = await fetchWeather(coords.latitude, coords.longitude);
      renderWeather(weather);
    } catch (error) {
      console.error(error);
      renderWeatherStatus("Could not load weather from your current location.");
    }
  }, () => {
    renderWeatherStatus("Location permission was denied. Use the zip box instead.");
  });
}

async function handleZipWeather(event) {
  event.preventDefault();
  const query = els.zipInput.value.trim();
  if (!query) {
    renderWeatherStatus("Enter a zip or postal code first.");
    return;
  }
  state.weatherZip = query;
  saveState();
  await lookupWeatherByQuery(query);
}

async function lookupWeatherByQuery(query) {
  renderWeatherStatus(`Looking up weather for ${query}...`);
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();
    const match = geoData.results && geoData.results[0];
    if (!match) {
      renderWeatherStatus("No location match found. Try city + province/state or a postal code.");
      return;
    }
    const weather = await fetchWeather(match.latitude, match.longitude, match.name, match.admin1, match.country);
    renderWeather(weather);
  } catch (error) {
    console.error(error);
    renderWeatherStatus("Weather lookup failed. Try again in a moment.");
  }
}

async function fetchWeather(latitude, longitude, city = "Current location", region = "", country = "") {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather request failed: ${response.status}`);
  }
  const data = await response.json();
  return {
    location: [city, region, country].filter(Boolean).join(", "),
    temp: data.current.temperature_2m,
    feels: data.current.apparent_temperature,
    wind: data.current.wind_speed_10m,
    code: data.current.weather_code,
    high: data.daily.temperature_2m_max[0],
    low: data.daily.temperature_2m_min[0]
  };
}

function renderWeather(weather) {
  const conditions = describeWeatherCode(weather.code);
  els.weatherOutput.innerHTML = `
    <div class="weather-stats">
      <h3>${escapeHtml(weather.location)}</h3>
      <p><strong>${weather.temp}&deg;C</strong> and ${conditions}</p>
      <p class="status-text">Feels like ${weather.feels}&deg;C • Wind ${weather.wind} km/h</p>
      <p class="status-text">Today: High ${weather.high}&deg;C / Low ${weather.low}&deg;C</p>
    </div>
  `;
}

function renderWeatherStatus(message) {
  els.weatherOutput.innerHTML = `<p class="status-text">${escapeHtml(message)}</p>`;
}

function describeWeatherCode(code) {
  const map = {
    0: "clear skies",
    1: "mostly clear",
    2: "partly cloudy",
    3: "overcast",
    45: "foggy",
    48: "rime fog",
    51: "light drizzle",
    61: "light rain",
    63: "rain",
    71: "snow",
    80: "showers",
    95: "thunderstorms"
  };
  return map[code] || "mixed conditions";
}

async function handleLolCompare(event) {
  event.preventDefault();
  const players = els.lolPlayers.value
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  state.lolPlayers = els.lolPlayers.value.trim();
  state.riotApiKey = els.lolApiKey.value.trim();
  saveState();

  if (!players.length) {
    renderLolRows([]);
    return;
  }

  renderLolRows(players.map((player) => ({
    player,
    status: "Loading...",
    level: "-",
    queue: "-",
    rank: "-"
  })));

  const rows = await Promise.all(players.map((player) => fetchLolPlayer(player, state.riotApiKey)));
  renderLolRows(rows);
}

async function fetchLolPlayer(player, apiKey) {
  if (!apiKey) {
    return {
      player,
      status: "Mock mode",
      level: randomRange(65, 480),
      queue: ["Solo/Duo", "Flex", "Normals"][randomRange(0, 2)],
      rank: ["Gold II", "Platinum IV", "Emerald III", "Diamond IV"][randomRange(0, 3)]
    };
  }

  try {
    const encoded = encodeURIComponent(player);
    const summonerRes = await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${encoded}`, {
      headers: { "X-Riot-Token": apiKey }
    });
    if (!summonerRes.ok) {
      throw new Error(`Summoner lookup failed: ${summonerRes.status}`);
    }
    const summoner = await summonerRes.json();
    const leagueRes = await fetch(`https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summoner.id}`, {
      headers: { "X-Riot-Token": apiKey }
    });
    const queues = leagueRes.ok ? await leagueRes.json() : [];
    const solo = queues.find((queue) => queue.queueType === "RANKED_SOLO_5x5");
    return {
      player,
      status: "Live",
      level: summoner.summonerLevel ?? "-",
      queue: solo ? "Solo/Duo" : (queues[0]?.queueType || "No ranked data"),
      rank: solo ? `${solo.tier} ${solo.rank}` : "Unranked"
    };
  } catch (error) {
    console.error(error);
    return {
      player,
      status: "Unavailable",
      level: "-",
      queue: "-",
      rank: "Check Riot key / player tag"
    };
  }
}

function renderLolRows(rows) {
  if (!rows.length) {
    els.lolTableBody.innerHTML = `<tr><td colspan="5" class="empty-row">Add player names to compare.</td></tr>`;
    return;
  }
  els.lolTableBody.innerHTML = rows.map((row) => `
    <tr>
      <td>${escapeHtml(String(row.player))}</td>
      <td>${escapeHtml(String(row.status))}</td>
      <td>${escapeHtml(String(row.level))}</td>
      <td>${escapeHtml(String(row.queue))}</td>
      <td>${escapeHtml(String(row.rank))}</td>
    </tr>
  `).join("");
}

function handleChatSubmit(event) {
  event.preventDefault();
  const message = els.chatInput.value.trim();
  if (!message) {
    return;
  }
  state.chat.push({ role: "user", message });
  state.chat.push({ role: "bot", message: buildMockResponse(message) });
  els.chatInput.value = "";
  saveState();
  renderChat();
}

function renderChat() {
  els.chatLog.innerHTML = "";
  state.chat.forEach((entry) => {
    const node = els.chatBubbleTemplate.content.firstElementChild.cloneNode(true);
    node.classList.add(entry.role);
    node.querySelector(".chat-role").textContent = entry.role === "user" ? "You" : "Assistant";
    node.querySelector(".chat-message").textContent = entry.message;
    els.chatLog.appendChild(node);
  });
  els.chatLog.scrollTop = els.chatLog.scrollHeight;
}

function buildMockResponse(message) {
  const lower = message.toLowerCase();
  if (lower.includes("dinner") || lower.includes("food")) {
    return "Try a low-effort plan: one comfort meal tonight, one freezer backup, and one delivery budget cap for the week.";
  }
  if (lower.includes("money") || lower.includes("budget")) {
    return "Start with fixed bills, then choose one savings target and one guilt-free fun amount so the month feels sustainable.";
  }
  if (lower.includes("date")) {
    return "Mini date plan: pick a time block, choose food first, then add one tiny extra like a walk, playlist, or dessert stop.";
  }
  return "I can help turn that into a short plan, checklist, budget split, or reminder sequence. Try being a bit more specific.";
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
    type: "event",
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
  const day = Number(els.billDay.value);

  if (!name || !amount || !day) {
    return;
  }

  const generated = generateBillOccurrences(name, amount, frequency, day);
  state.bills.push(...generated);
  els.billForm.reset();
  saveState();
  renderSchedule();
}

function generateBillOccurrences(name, amount, frequency, day) {
  const items = [];
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);

  for (let i = 0; i < 12; i += 1) {
    if (frequency === "monthly") {
      const billDate = new Date(start.getFullYear(), start.getMonth() + i, Math.min(day, 28));
      items.push({
        id: crypto.randomUUID(),
        type: "bill",
        title: `${name} - $${amount.toFixed(2)}`,
        amount,
        date: toDateInputValue(billDate)
      });
    } else {
      for (let w = 0; w < 4; w += 1) {
        const weeklyDate = new Date(start.getFullYear(), start.getMonth() + i, 1 + ((day - 1) % 7) + (w * 7));
        items.push({
          id: crypto.randomUUID(),
          type: "bill",
          title: `${name} - $${amount.toFixed(2)}`,
          amount,
          date: toDateInputValue(weeklyDate)
        });
      }
    }
  }

  return items;
}

function handleShiftSubmit(event) {
  event.preventDefault();
  const pattern = els.shiftPattern.value;
  const startDate = els.shiftStart.value;
  if (!startDate) {
    return;
  }
  state.shifts.push(...generateShiftEvents(pattern, startDate));
  els.shiftForm.reset();
  saveState();
  renderSchedule();
}

function generateShiftEvents(pattern, startDate) {
  const [workDays, offDays] = pattern.split("/").map(Number);
  const items = [];
  const start = new Date(`${startDate}T00:00:00`);
  let cursor = new Date(start);

  for (let cycle = 0; cycle < 6; cycle += 1) {
    for (let work = 0; work < workDays; work += 1) {
      items.push({
        id: crypto.randomUUID(),
        type: "shift",
        title: `Alamos Work Day ${work + 1}`,
        date: toDateInputValue(cursor),
        pattern
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    for (let off = 0; off < offDays; off += 1) {
      items.push({
        id: crypto.randomUUID(),
        type: "shift",
        title: `Alamos Off Day ${off + 1}`,
        date: toDateInputValue(cursor),
        pattern
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return items;
}

function renderSchedule() {
  const today = startOfDay(new Date());
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + 30);
  const items = [...state.events, ...state.bills, ...state.shifts]
    .filter((item) => {
      const itemDate = startOfDay(new Date(`${item.date}T00:00:00`));
      return itemDate >= today && itemDate <= cutoff;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (!items.length) {
    els.scheduleList.innerHTML = `<div class="panel"><p class="status-text">Nothing scheduled in the next 30 days yet.</p></div>`;
    return;
  }

  els.scheduleList.innerHTML = items.map((item) => `
    <article class="schedule-item">
      <div>
        <div class="schedule-title">
          <strong>${escapeHtml(item.title)}</strong>
          <span class="pill ${escapeHtml(item.type)}">${escapeHtml(item.type)}</span>
        </div>
        <p class="schedule-meta">${formatLongDate(item.date)}${item.amount ? ` • $${item.amount.toFixed(2)}` : ""}${item.pattern ? ` • ${item.pattern}` : ""}</p>
      </div>
      <div class="schedule-actions">
        <button type="button" data-action="edit-schedule" data-id="${item.id}" class="ghost-btn">Edit</button>
        <button type="button" data-action="delete-schedule" data-id="${item.id}" class="ghost-btn">Delete</button>
      </div>
    </article>
  `).join("");

  els.scheduleList.querySelectorAll("[data-action='delete-schedule']").forEach((button) => {
    button.addEventListener("click", () => deleteScheduleItem(button.dataset.id));
  });
  els.scheduleList.querySelectorAll("[data-action='edit-schedule']").forEach((button) => {
    button.addEventListener("click", () => editScheduleItem(button.dataset.id));
  });
}

function deleteScheduleItem(id) {
  state.events = state.events.filter((item) => item.id !== id);
  state.bills = state.bills.filter((item) => item.id !== id);
  state.shifts = state.shifts.filter((item) => item.id !== id);
  saveState();
  renderSchedule();
}

function editScheduleItem(id) {
  const item = [...state.events, ...state.bills, ...state.shifts].find((entry) => entry.id === id);
  if (!item) {
    return;
  }
  const newTitle = window.prompt("Edit title", item.title);
  if (newTitle === null) {
    return;
  }
  const newDate = window.prompt("Edit date (YYYY-MM-DD)", item.date);
  if (!newDate) {
    return;
  }
  item.title = newTitle.trim() || item.title;
  item.date = newDate;
  saveState();
  renderSchedule();
}

function handleFinanceInput() {
  state.finance = {
    income: els.incomeInput.value,
    expenses: els.expenseInput.value,
    goal: els.goalInput.value
  };
  saveState();
  renderFinance();
}

function renderFinance() {
  const income = Number(state.finance.income) || 0;
  const expenses = Number(state.finance.expenses) || 0;
  const goal = Number(state.finance.goal) || 0;
  const remaining = Math.max(income - expenses, 0);
  const goalGap = Math.max(goal - remaining, 0);

  drawBudgetChart(income, expenses, remaining);

  const tips = [];
  if (!income && !expenses) {
    tips.push("Add income and expenses to get a live snapshot.");
  } else {
    const expenseRatio = income ? expenses / income : 1;
    tips.push(`Monthly remaining: $${remaining.toFixed(2)}`);
    tips.push(expenseRatio > 0.75 ? "Spending is heavy relative to income. Trim one recurring cost or cap takeout for a quick win." : "Your expense ratio looks manageable. Protect the margin with an automatic transfer.");
    tips.push(goal ? (goalGap > 0 ? `You are $${goalGap.toFixed(2)} short of the savings goal.` : "Savings goal is covered at the current pace.") : "Set a savings goal to get tighter coaching.");
  }

  els.financeInsights.innerHTML = tips.map((tip) => `<div class="finance-tip">${escapeHtml(tip)}</div>`).join("");
}

function drawBudgetChart(income, expenses, remaining) {
  const canvas = els.budgetChart;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const total = Math.max(income, expenses + remaining, 1);
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = 92;
  const lineWidth = 26;
  const start = -Math.PI / 2;
  const slices = [
    { value: expenses, color: "#73a7ff" },
    { value: remaining, color: "#8bf3d5" },
    { value: Math.max(total - (expenses + remaining), 0), color: "rgba(255,255,255,0.08)" }
  ];

  let current = start;
  slices.forEach((slice) => {
    const angle = (slice.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.strokeStyle = slice.color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.arc(centerX, centerY, radius, current, current + angle);
    ctx.stroke();
    current += angle;
  });

  ctx.fillStyle = "#f2f6fb";
  ctx.font = '700 28px "Trebuchet MS"';
  ctx.textAlign = "center";
  ctx.fillText(`$${Math.round(income)}`, centerX, centerY - 2);
  ctx.fillStyle = "#8fa2bb";
  ctx.font = '500 12px "Consolas"';
  ctx.fillText("income", centerX, centerY + 18);
}

function handleCategorySubmit(event) {
  event.preventDefault();
  const category = els.categoryInput.value.trim();
  if (!category || state.fmhy.categories[category]) {
    return;
  }
  state.fmhy.categories[category] = [];
  els.categoryForm.reset();
  saveState();
  renderLinks();
}

function handleLinkSubmit(event) {
  event.preventDefault();
  const category = els.linkCategory.value.trim();
  const label = els.linkLabel.value.trim();
  const url = els.linkUrl.value.trim();
  if (!category || !label || !url) {
    return;
  }
  if (!state.fmhy.categories[category]) {
    state.fmhy.categories[category] = [];
  }
  state.fmhy.categories[category].push({ label, url });
  els.linkForm.reset();
  saveState();
  renderLinks();
}

function renderLinks() {
  const categories = Object.entries(state.fmhy.categories);
  if (!categories.length) {
    els.linksContainer.innerHTML = `<div class="panel"><p class="status-text">No categories yet.</p></div>`;
    return;
  }

  els.linksContainer.innerHTML = categories.map(([category, links]) => `
    <details class="accordion" open>
      <summary>
        <span>${escapeHtml(category)}</span>
        <span class="meta">${links.length} links</span>
      </summary>
      <div class="accordion-body">
        ${links.length ? links.map((link, index) => `
          <div class="link-item">
            <a href="${escapeAttribute(link.url)}" target="_blank" rel="noreferrer noopener">${escapeHtml(link.label)}</a>
            <div class="file-entry-actions">
              <button class="ghost-btn" type="button" data-remove-link="${escapeAttribute(category)}::${index}">Delete</button>
            </div>
          </div>
        `).join("") : `<p class="status-text">No links in this category yet.</p>`}
        <button class="ghost-btn" type="button" data-remove-category="${escapeAttribute(category)}">Delete Category</button>
      </div>
    </details>
  `).join("");

  els.linksContainer.querySelectorAll("[data-remove-link]").forEach((button) => {
    button.addEventListener("click", () => {
      const [category, index] = button.dataset.removeLink.split("::");
      state.fmhy.categories[category].splice(Number(index), 1);
      saveState();
      renderLinks();
    });
  });

  els.linksContainer.querySelectorAll("[data-remove-category]").forEach((button) => {
    button.addEventListener("click", () => {
      delete state.fmhy.categories[button.dataset.removeCategory];
      saveState();
      renderLinks();
    });
  });
}

function renderProxyLinks() {
  els.proxyLinks.innerHTML = proxyCatalog.map((entry) => `
    <article class="proxy-link">
      <strong>${escapeHtml(entry.label)}</strong>
      <p class="status-text">${escapeHtml(entry.description)}</p>
      <a href="${escapeAttribute(entry.url)}" target="_blank" rel="noreferrer noopener">Open</a>
    </article>
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
    els.fileList.innerHTML = `<div class="muted">No files yet.</div>`;
    els.fileTitle.value = "";
    els.fileContent.value = "";
    return;
  }

  const activeFile = state.files.find((file) => file.id === state.activeFileId) || state.files[0];
  state.activeFileId = activeFile.id;
  els.fileList.innerHTML = state.files.map((file) => `
    <button type="button" class="file-entry ${file.id === activeFile.id ? "active" : ""}" data-file-id="${file.id}">
      <strong>${escapeHtml(file.name)}</strong>
      <div class="file-time">${new Date(file.updatedAt).toLocaleString()}</div>
    </button>
  `).join("");

  els.fileList.querySelectorAll("[data-file-id]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeFileId = button.dataset.fileId;
      renderFiles();
    });
  });

  els.fileTitle.value = activeFile.name;
  els.fileContent.value = activeFile.content;
}

function handleFileSave() {
  const activeFile = state.files.find((file) => file.id === state.activeFileId);
  if (!activeFile) {
    return;
  }
  activeFile.name = els.fileTitle.value.trim() || activeFile.name;
  activeFile.content = els.fileContent.value;
  activeFile.updatedAt = Date.now();
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

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLongDate(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
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

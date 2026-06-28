// PokéMMO All-in-One Companion Tool Logic

// ==========================================
// 1. STATE & LOCAL STORAGE
// ==========================================
const DEFAULT_PRICES = {
    powerItem: 10000,
    everstone: 5000,
    rawParent: 5000,
    ditto1x: 8000,
    ditto2x: 50000,
    ditto3x: 220000,
    ditto4x: 900000,
    ditto5x: 4000000,
    dittoNature: 10000
};

let prices = { ...DEFAULT_PRICES };
let gymReruns = {};
let activeTab = 'breeding';

// New Module States
let ledgerRecords = [];
let gardenCrops = [];
let activeSubFarmingTab = 'thief';
let shinyHunts = [];
let calculatedPlayerSpeed = 154;

function loadLocalStorage() {
    const savedPrices = localStorage.getItem('pokemmo_prices');
    if (savedPrices) prices = { ...DEFAULT_PRICES, ...JSON.parse(savedPrices) };
    
    const savedGyms = localStorage.getItem('pokemmo_gyms');
    if (savedGyms) gymReruns = JSON.parse(savedGyms);

    const savedLedger = localStorage.getItem('pokemmo_ledger');
    if (savedLedger) ledgerRecords = JSON.parse(savedLedger);

    const savedGarden = localStorage.getItem('pokemmo_garden');
    if (savedGarden) gardenCrops = JSON.parse(savedGarden);

    const savedHunts = localStorage.getItem('pokemmo_hunts');
    if (savedHunts) shinyHunts = JSON.parse(savedHunts);
}

function savePrices() { localStorage.setItem('pokemmo_prices', JSON.stringify(prices)); }
function saveGyms() { localStorage.setItem('pokemmo_gyms', JSON.stringify(gymReruns)); }
function saveLedger() { localStorage.setItem('pokemmo_ledger', JSON.stringify(ledgerRecords)); }
function saveGarden() { localStorage.setItem('pokemmo_garden', JSON.stringify(gardenCrops)); }
function saveHunts() { localStorage.setItem('pokemmo_hunts', JSON.stringify(shinyHunts)); }

// ==========================================
// 2. GYM RERUN TRACKER DATA & LOGIC
// ==========================================
const GYM_LEADERS = [
    // KANTO
    { id: 'kanto_brock', region: 'kanto', city: 'Pewter City', name: 'Brock', type: 'rock', payout: 12400 },
    { id: 'kanto_misty', region: 'kanto', city: 'Cerulean City', name: 'Misty', type: 'water', payout: 12600 },
    { id: 'kanto_surge', region: 'kanto', city: 'Vermilion City', name: 'Lt. Surge', type: 'electric', payout: 12500 },
    { id: 'kanto_erika', region: 'kanto', city: 'Celadon City', name: 'Erika', type: 'grass', payout: 12600 },
    { id: 'kanto_koga', region: 'kanto', city: 'Fuchsia City', name: 'Koga', type: 'poison', payout: 12800 },
    { id: 'kanto_sabrina', region: 'kanto', city: 'Saffron City', name: 'Sabrina', type: 'psychic', payout: 12700 },
    { id: 'kanto_blaine', region: 'kanto', city: 'Cinnabar Island', name: 'Blaine', type: 'fire', payout: 12900 },
    { id: 'kanto_blue', region: 'kanto', city: 'Viridian City', name: 'Blue', type: 'normal', payout: 13200 },
    // HOENN
    { id: 'hoenn_roxanne', region: 'hoenn', city: 'Rustboro City', name: 'Roxanne', type: 'rock', payout: 12400 },
    { id: 'hoenn_brawly', region: 'hoenn', city: 'Dewford Town', name: 'Brawly', type: 'fighting', payout: 12500 },
    { id: 'hoenn_wattson', region: 'hoenn', city: 'Mauville City', name: 'Wattson', type: 'electric', payout: 12600 },
    { id: 'hoenn_flannery', region: 'hoenn', city: 'Lavaridge Town', name: 'Flannery', type: 'fire', payout: 12700 },
    { id: 'hoenn_norman', region: 'hoenn', city: 'Petalburg City', name: 'Norman', type: 'normal', payout: 12900 },
    { id: 'hoenn_winona', region: 'hoenn', city: 'Fortree City', name: 'Winona', type: 'flying', payout: 12800 },
    { id: 'hoenn_tateliza', region: 'hoenn', city: 'Mossdeep City', name: 'Tate & Liza', type: 'psychic', payout: 13000 },
    { id: 'hoenn_juan', region: 'hoenn', city: 'Sootopolis City', name: 'Juan', type: 'water', payout: 13100 },
    // SINNOH
    { id: 'sinnoh_roark', region: 'sinnoh', city: 'Oreburgh City', name: 'Roark', type: 'rock', payout: 13200 },
    { id: 'sinnoh_gardenia', region: 'sinnoh', city: 'Eterna City', name: 'Gardenia', type: 'grass', payout: 13400 },
    { id: 'sinnoh_fantina', region: 'sinnoh', city: 'Hearthome City', name: 'Fantina', type: 'ghost', payout: 13600 },
    { id: 'sinnoh_maylene', region: 'sinnoh', city: 'Veilstone City', name: 'Maylene', type: 'fighting', payout: 13500 },
    { id: 'sinnoh_wake', region: 'sinnoh', city: 'Pastoria City', name: 'Crasher Wake', type: 'water', payout: 13600 },
    { id: 'sinnoh_byron', region: 'sinnoh', city: 'Canalave City', name: 'Byron', type: 'steel', payout: 13700 },
    { id: 'sinnoh_candice', region: 'sinnoh', city: 'Snowpoint City', name: 'Candice', type: 'ice', payout: 13800 },
    { id: 'sinnoh_volkner', region: 'sinnoh', city: 'Sunyshore City', name: 'Volkner', type: 'electric', payout: 14000 },
    // UNOVA
    { id: 'unova_striaton', region: 'unova', city: 'Striaton City', name: 'Striaton Triad', type: 'water', payout: 14200 },
    { id: 'unova_lenora', region: 'unova', city: 'Nacrene City', name: 'Lenora', type: 'normal', payout: 14300 },
    { id: 'unova_burgh', region: 'unova', city: 'Castelia City', name: 'Burgh', type: 'bug', payout: 14400 },
    { id: 'unova_elesa', region: 'unova', city: 'Nimbasa City', name: 'Elesa', type: 'electric', payout: 14500 },
    { id: 'unova_clay', region: 'unova', city: 'Driftveil City', name: 'Clay', type: 'ground', payout: 14700 },
    { id: 'unova_skyla', region: 'unova', city: 'Mistralton City', name: 'Skyla', type: 'flying', payout: 14600 },
    { id: 'unova_brycen', region: 'unova', city: 'Icirrus City', name: 'Brycen', type: 'ice', payout: 14800 },
    { id: 'unova_drayden', region: 'unova', city: 'Opelucid City', name: 'Drayden/Iris', type: 'dragon', payout: 15000 },
    { id: 'unova_cheren', region: 'unova', city: 'Aspertia City', name: 'Cheren', type: 'normal', payout: 14400 },
    { id: 'unova_roxie', region: 'unova', city: 'Virbank City', name: 'Roxie', type: 'poison', payout: 14500 },
    { id: 'unova_marlon', region: 'unova', city: 'Humilau City', name: 'Marlon', type: 'water', payout: 14900 },
    // JOHTO
    { id: 'johto_falkner', region: 'johto', city: 'Violet City', name: 'Falkner', type: 'flying', payout: 12400 },
    { id: 'johto_bugsy', region: 'johto', city: 'Azalea Town', name: 'Bugsy', type: 'bug', payout: 12500 },
    { id: 'johto_whitney', region: 'johto', city: 'Goldenrod City', name: 'Whitney', type: 'normal', payout: 12800 },
    { id: 'johto_morty', region: 'johto', city: 'Ecruteak City', name: 'Morty', type: 'ghost', payout: 12700 },
    { id: 'johto_chuck', region: 'johto', city: 'Cianwood City', name: 'Chuck', type: 'fighting', payout: 12600 },
    { id: 'johto_jasmine', region: 'johto', city: 'Olivine City', name: 'Jasmine', type: 'steel', payout: 12900 },
    { id: 'johto_pryce', region: 'johto', city: 'Mahogany Town', name: 'Pryce', type: 'ice', payout: 12800 },
    { id: 'johto_clair', region: 'johto', city: 'Blackthorn City', name: 'Clair', type: 'dragon', payout: 13200 },
    // OTHER
    { id: 'other_morimoto', region: 'other', city: 'Castelia City (Unova)', name: 'Game Freak Morimoto', type: 'dark', payout: 16200 },
    { id: 'other_cynthia', region: 'other', city: 'Undella Town (Unova)', name: 'Cynthia', type: 'dragon', payout: 18500 },
    { id: 'other_red', region: 'other', city: 'Mt. Silver (Johto)', name: 'Red', type: 'normal', payout: 21000 }
];

let activeRegion = 'kanto';
const COOLDOWN_TIME = 18 * 60 * 60 * 1000;

function getMultiplier() { return parseFloat(document.getElementById('money-multiplier').value); }

function updateGymStats() {
    let totalEarned = 0;
    let completedCount = 0;
    const now = Date.now();
    const multiplier = getMultiplier();

    GYM_LEADERS.forEach(gym => {
        const cooldownEnd = gymReruns[gym.id];
        if (cooldownEnd && now < cooldownEnd) {
            completedCount++;
            totalEarned += Math.round(gym.payout * multiplier);
        }
    });

    document.getElementById('gym-count').innerText = `${completedCount} / ${GYM_LEADERS.length}`;
    document.getElementById('gym-earnings').innerText = `${totalEarned.toLocaleString()} ¥`;
}

function toggleGym(gymId, checked) {
    if (checked) {
        gymReruns[gymId] = Date.now() + COOLDOWN_TIME;
    } else {
        delete gymReruns[gymId];
    }
    saveGyms();
    renderGymList();
    updateGymStats();
}

function resetAllGyms() {
    gymReruns = {};
    saveGyms();
    renderGymList();
    updateGymStats();
}

function renderGymList() {
    const listContainer = document.getElementById('gym-list');
    listContainer.innerHTML = '';
    const now = Date.now();
    const multiplier = getMultiplier();
    const filtered = GYM_LEADERS.filter(gym => gym.region === activeRegion);

    filtered.forEach(gym => {
        const cooldownEnd = gymReruns[gym.id];
        const isOnCooldown = cooldownEnd && now < cooldownEnd;

        let timerHtml = '';
        if (isOnCooldown) {
            const diff = cooldownEnd - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            timerHtml = `<div class="gym-timer" data-end="${cooldownEnd}">Cooldown: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}</div>`;
        } else {
            timerHtml = `<div class="gym-timer" style="color: var(--accent-green)">Ready</div>`;
        }

        const estPayout = Math.round(gym.payout * multiplier);
        const card = document.createElement('div');
        card.className = `gym-card ${isOnCooldown ? 'cooldown' : 'available'}`;
        card.id = `gym-card-${gym.id}`;
        card.innerHTML = `
            <div class="gym-header">
                <div>
                    <div class="gym-name">${gym.name}</div>
                    <div class="gym-city">${gym.city}</div>
                </div>
                <span class="gym-type-badge type-${gym.type}">${gym.type}</span>
            </div>
            <div class="gym-payout">${estPayout.toLocaleString()} ¥</div>
            <div class="gym-footer">
                ${timerHtml}
                <input type="checkbox" class="gym-checkbox" ${isOnCooldown ? 'checked' : ''} onchange="toggleGym('${gym.id}', this.checked)">
            </div>
        `;
        listContainer.appendChild(card);
    });
}

// ==========================================
// 3. GTL FLIP LEDGER & PORTFOLIO LOGIC
// ==========================================
function getListingFee(sellPrice) {
    let fee = Math.round(sellPrice * 0.05);
    return Math.max(1000, Math.min(25000, fee));
}

function calculateLedgerTaxPreview() {
    const buyPrice = parseInt(document.getElementById('ledger-buy-price').value) || 0;
    const sellPrice = parseInt(document.getElementById('ledger-sell-price').value) || 0;
    const qty = parseInt(document.getElementById('ledger-quantity').value) || 1;
    const status = document.getElementById('ledger-status').value;

    const singleFee = getListingFee(sellPrice);
    const totalFee = singleFee; // upfront fee is charged once per listing

    let estProfit = 0;
    if (status === 'sold') {
        estProfit = (sellPrice * qty) - (buyPrice * qty) - totalFee;
    } else if (status === 'cancelled') {
        estProfit = - (buyPrice * qty) - totalFee;
    } else {
        // Active escrow, potential profit when sold
        estProfit = (sellPrice * qty) - (buyPrice * qty) - totalFee;
    }

    document.getElementById('ledger-fee-preview').innerText = `${totalFee.toLocaleString()} ¥`;
    const profitEl = document.getElementById('ledger-profit-preview');
    profitEl.innerText = `${estProfit.toLocaleString()} ¥`;
    if (estProfit >= 0) {
        profitEl.className = 'net-profit-pos';
    } else {
        profitEl.className = 'net-profit-neg';
    }
}

function toggleLedgerStatusSelect(val) {
    const sellInput = document.getElementById('ledger-sell-price');
    if (val === 'cancelled') {
        sellInput.value = 0;
        sellInput.disabled = true;
    } else {
        sellInput.disabled = false;
    }
    calculateLedgerTaxPreview();
}

function saveLedgerRecord() {
    const name = document.getElementById('ledger-name').value;
    const qty = parseInt(document.getElementById('ledger-quantity').value) || 1;
    const buy = parseInt(document.getElementById('ledger-buy-price').value) || 0;
    const sell = parseInt(document.getElementById('ledger-sell-price').value) || 0;
    const status = document.getElementById('ledger-status').value;

    const fee = getListingFee(sell);

    const record = {
        id: 'record_' + Date.now(),
        name,
        qty,
        buy,
        sell,
        fee,
        status,
        timestamp: Date.now()
    };

    ledgerRecords.push(record);
    saveLedger();
    renderLedgerTable();
    updateLedgerPortfolio();

    // Reset Form
    document.getElementById('ledger-form').reset();
    document.getElementById('ledger-sell-price').disabled = false;
    calculateLedgerTaxPreview();
}

function deleteLedgerRecord(id) {
    ledgerRecords = ledgerRecords.filter(r => r.id !== id);
    saveLedger();
    renderLedgerTable();
    updateLedgerPortfolio();
}

function clearLedgerHistory() {
    ledgerRecords = [];
    saveLedger();
    renderLedgerTable();
    updateLedgerPortfolio();
}

function updateLedgerPortfolio() {
    let totalProfit = 0;
    let totalEscrow = 0;
    let totalFees = 0;
    let totalInvestment = 0;
    let successfulSales = 0;

    ledgerRecords.forEach(r => {
        const itemFee = r.fee;
        totalFees += itemFee;

        if (r.status === 'sold') {
            const profit = (r.sell * r.qty) - (r.buy * r.qty) - itemFee;
            totalProfit += profit;
            totalInvestment += (r.buy * r.qty) + itemFee;
            successfulSales++;
        } else if (r.status === 'cancelled') {
            const loss = - (r.buy * r.qty) - itemFee;
            totalProfit += loss;
        } else {
            // Active Escrow listing
            totalEscrow += (r.buy * r.qty) + itemFee;
        }
    });

    const profitEl = document.getElementById('ledger-total-profit');
    profitEl.innerText = `${totalProfit.toLocaleString()} ¥`;
    if (totalProfit >= 0) {
        profitEl.className = 'ledger-stat-val net-profit-pos';
    } else {
        profitEl.className = 'ledger-stat-val net-profit-neg';
    }

    document.getElementById('ledger-total-escrow').innerText = `${totalEscrow.toLocaleString()} ¥`;
    document.getElementById('ledger-total-fees').innerText = `${totalFees.toLocaleString()} ¥`;

    let avgRoi = 0;
    if (totalInvestment > 0) {
        avgRoi = Math.round((totalProfit / totalInvestment) * 1000) / 10;
    }
    document.getElementById('ledger-avg-roi').innerText = `${avgRoi} %`;
}

function renderLedgerTable() {
    const tableBody = document.getElementById('ledger-table-body');
    tableBody.innerHTML = '';

    const query = document.getElementById('ledger-search').value.toLowerCase();
    const filtered = ledgerRecords.filter(r => r.name.toLowerCase().includes(query));

    filtered.forEach(r => {
        let netProfit = 0;
        let statusBadge = '';
        if (r.status === 'sold') {
            netProfit = (r.sell * r.qty) - (r.buy * r.qty) - r.fee;
            statusBadge = '<span class="badge-yield">SOLD</span>';
        } else if (r.status === 'cancelled') {
            netProfit = - (r.buy * r.qty) - r.fee;
            statusBadge = '<span class="badge-scent" style="background: rgba(239,68,68,0.15); color: #f87171;">CANCEL</span>';
        } else {
            netProfit = (r.sell * r.qty) - (r.buy * r.qty) - r.fee;
            statusBadge = '<span class="badge-scent" style="background: rgba(59,130,246,0.15); color: #60a5fa;">LISTED</span>';
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${r.name}</strong></td>
            <td>${r.qty}</td>
            <td>${(r.buy * r.qty).toLocaleString()} ¥</td>
            <td>${r.status === 'cancelled' ? '-' : (r.sell * r.qty).toLocaleString() + ' ¥'}</td>
            <td style="color: var(--accent-red);">${r.fee.toLocaleString()} ¥</td>
            <td class="${netProfit >= 0 ? 'net-profit-pos' : 'net-profit-neg'}">${netProfit.toLocaleString()} ¥</td>
            <td>${statusBadge}</td>
            <td>
                <button class="btn btn-secondary" onclick="deleteLedgerRecord('${r.id}')" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;">Delete</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// ==========================================
// 4. BERRY GARDEN RECIPES & MULTI-SLOT LOGIC
// ==========================================
const BERRY_RECIPES = {
    leppa: {
        name: 'Leppa Berry (PP Restore)',
        seeds: '1x Very Spicy Seed + 1x Plain Sweet Seed + 1x Plain Bitter Seed',
        growth: '20 Hours',
        growthMs: 20 * 60 * 60 * 1000,
        water: 'Water every 9-10 Hours',
        waterMs: 9.5 * 60 * 60 * 1000,
        yield: '5 - 7 Berries',
        notes: 'Most popular berry in the game. Used for infinite horde training and shiny hunting. Extremely liquid market.'
    },
    sitrus: {
        name: 'Sitrus Berry (HP Restore)',
        seeds: '1x Very Sweet Seed + 1x Very Bitter Seed + 1x Very Sour Seed',
        growth: '44 Hours',
        growthMs: 44 * 60 * 60 * 1000,
        water: 'Water every 18-20 Hours',
        waterMs: 19 * 60 * 60 * 1000,
        yield: '7 - 9 Berries',
        notes: 'Can be sold directly to Pokemart vendors for a guaranteed 800 ¥ each. Stable cash maker.'
    },
    lum: {
        name: 'Lum Berry (Status Cure)',
        seeds: '1x Very Spicy Seed + 1x Very Dry Seed + 1x Very Sweet Seed',
        growth: '44 Hours',
        growthMs: 44 * 60 * 60 * 1000,
        water: 'Water every 18-20 Hours',
        waterMs: 19 * 60 * 60 * 1000,
        yield: '7 - 8 Berries',
        notes: 'Highly demanded in competitive PvP. High trade volumes.'
    },
    oran: {
        name: 'Oran Berry (Early Level HP)',
        seeds: '1x Plain Spicy Seed + 1x Plain Dry Seed + 1x Plain Sweet Seed',
        growth: '16 Hours',
        growthMs: 16 * 60 * 60 * 1000,
        water: 'Water every 7-8 Hours',
        waterMs: 7.5 * 60 * 60 * 1000,
        yield: '5 - 6 Berries',
        notes: 'Low growth time. Useful to quickly yield basic level seeds.'
    },
    cheri: {
        name: 'Cheri Berry (Spicy)',
        seeds: '2x Plain Spicy Seeds OR 1x Very Spicy Seed',
        growth: '16 Hours',
        growthMs: 16 * 60 * 60 * 1000,
        water: 'Water every 7-8 Hours',
        waterMs: 7.5 * 60 * 60 * 1000,
        yield: '4 - 5 Berries',
        notes: 'Farmed primarily to harvest back Spicy Seeds. Consumed to craft status remedies.'
    },
    chesto: {
        name: 'Chesto Berry (Dry)',
        seeds: '2x Plain Dry Seeds OR 1x Very Dry Seed',
        growth: '16 Hours',
        growthMs: 16 * 60 * 60 * 1000,
        water: 'Water every 7-8 Hours',
        waterMs: 7.5 * 60 * 60 * 1000,
        yield: '4 - 5 Berries',
        notes: 'Farmed to extract Dry Seeds.'
    },
    pecha: {
        name: 'Pecha Berry (Sweet)',
        seeds: '2x Plain Sweet Seeds OR 1x Very Sweet Seed',
        growth: '16 Hours',
        growthMs: 16 * 60 * 60 * 1000,
        water: 'Water every 7-8 Hours',
        waterMs: 7.5 * 60 * 60 * 1000,
        yield: '4 - 5 Berries',
        notes: 'Farmed to extract Sweet Seeds.'
    },
    rawst: {
        name: 'Rawst Berry (Bitter)',
        seeds: '2x Plain Bitter Seeds OR 1x Very Bitter Seed',
        growth: '16 Hours',
        growthMs: 16 * 60 * 60 * 1000,
        water: 'Water every 7-8 Hours',
        waterMs: 7.5 * 60 * 60 * 1000,
        yield: '4 - 5 Berries',
        notes: 'Farmed to extract Bitter Seeds.'
    },
    aspear: {
        name: 'Aspear Berry (Sour)',
        seeds: '2x Plain Sour Seeds OR 1x Very Sour Seed',
        growth: '16 Hours',
        growthMs: 16 * 60 * 60 * 1000,
        water: 'Water every 7-8 Hours',
        waterMs: 7.5 * 60 * 60 * 1000,
        yield: '4 - 5 Berries',
        notes: 'Farmed to extract Sour Seeds.'
    }
};

function renderBerryRecipeDetails(val) {
    const details = BERRY_RECIPES[val];
    const container = document.getElementById('berry-recipe-details-card');
    container.innerHTML = `
        <div style="font-size: 0.95rem;">
            <strong style="color: var(--primary); font-size: 1.05rem;">${details.name}</strong><br>
            <div style="margin-top: 0.5rem;">
                • <strong>Recipe:</strong> ${details.seeds}<br>
                • <strong>Growth Time:</strong> ${details.growth}<br>
                • <strong>Water Rate:</strong> ${details.water}<br>
                • <strong>Expected Yield:</strong> ${details.yield}
            </div>
            <div style="margin-top: 0.75rem; font-size: 0.8rem; color: var(--text-muted); border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 0.5rem;">
                ${details.notes}
            </div>
        </div>
    `;
}

function plantCropInGarden() {
    const cropName = document.getElementById('garden-plant-name').value;
    const location = document.getElementById('garden-plant-location').value || 'Unspecified Plot';

    // Get stats based on name
    let detailsKey = 'leppa';
    if (cropName.includes('Sitrus')) detailsKey = 'sitrus';
    else if (cropName.includes('Lum')) detailsKey = 'lum';
    else if (cropName.includes('Oran')) detailsKey = 'oran';
    else if (cropName.includes('Cheri')) detailsKey = 'cheri';
    else if (cropName.includes('Chesto')) detailsKey = 'chesto';
    else if (cropName.includes('Pecha')) detailsKey = 'pecha';
    else if (cropName.includes('Rawst')) detailsKey = 'rawst';
    else if (cropName.includes('Aspear')) detailsKey = 'aspear';

    const details = BERRY_RECIPES[detailsKey];
    const now = Date.now();

    const crop = {
        id: 'crop_' + Date.now(),
        name: cropName,
        location,
        plantedTime: now,
        maturityTime: now + details.growthMs,
        waterInterval: details.waterMs,
        lastWateredTime: now,
        wiltTime: now + details.growthMs + (8 * 60 * 60 * 1000) // Wilts 8h after maturity
    };

    gardenCrops.push(crop);
    saveGarden();
    renderGardenSlots();
}

function waterCropSlot(id) {
    const crop = gardenCrops.find(c => c.id === id);
    if (crop) {
        crop.lastWateredTime = Date.now();
        saveGarden();
        renderGardenSlots();
    }
}

function harvestCropSlot(id) {
    gardenCrops = gardenCrops.filter(c => c.id !== id);
    saveGarden();
    renderGardenSlots();
}

function renderGardenSlots() {
    const grid = document.getElementById('garden-slots-grid');
    grid.innerHTML = '';

    if (gardenCrops.length === 0) {
        grid.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-muted); width: 100%;">
                No active crop slots. Select a recipe and plant one!
            </div>
        `;
        return;
    }

    const now = Date.now();

    gardenCrops.forEach(c => {
        const isMature = now >= c.maturityTime;
        const isWilted = now >= c.wiltTime;

        // Soil moisture timer status
        const nextWateringDue = c.lastWateredTime + c.waterInterval;
        const waterDiff = nextWateringDue - now;
        const isWateringNeeded = waterDiff <= 0;

        let statusClass = 'growing';
        let statusText = 'Growing';
        if (isWilted) {
            statusClass = 'wilted';
            statusText = 'Wilted & Dead';
        } else if (isMature) {
            statusClass = 'harvest-ready';
            statusText = 'Ready to Harvest!';
        } else if (isWateringNeeded) {
            statusClass = 'watering-needed';
            statusText = 'Dry Soil (Needs Water!)';
        }

        // Calculate progress percentage
        let progress = 0;
        if (!isMature) {
            const totalDuration = c.maturityTime - c.plantedTime;
            const elapsed = now - c.plantedTime;
            progress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
        } else {
            progress = 100;
        }

        // Formulate remaining times
        let mainTimer = '';
        if (isWilted) {
            mainTimer = 'Wilted';
        } else if (isMature) {
            const wiltDiff = c.wiltTime - now;
            const hrs = Math.floor(wiltDiff / (1000 * 60 * 60));
            const mins = Math.floor((wiltDiff % (1000 * 60 * 60)) / (1000 * 60));
            mainTimer = `Wilts in: ${hrs}h ${mins}m`;
        } else {
            const growDiff = c.maturityTime - now;
            const hrs = Math.floor(growDiff / (1000 * 60 * 60));
            const mins = Math.floor((growDiff % (1000 * 60 * 60)) / (1000 * 60));
            mainTimer = `Matures in: ${hrs}h ${mins}m`;
        }

        let waterTimer = '';
        if (!isMature && !isWilted) {
            if (isWateringNeeded) {
                waterTimer = '<span style="color: var(--accent-yellow)">Dry! Water immediately</span>';
            } else {
                const hrs = Math.floor(waterDiff / (1000 * 60 * 60));
                const mins = Math.floor((waterDiff % (1000 * 60 * 60)) / (1000 * 60));
                waterTimer = `Water in: ${hrs}h ${mins}m`;
            }
        } else {
            waterTimer = '-';
        }

        const card = document.createElement('div');
        card.className = `garden-slot-card ${statusClass}`;
        card.innerHTML = `
            <div>
                <div class="garden-slot-header">
                    <div>
                        <div class="garden-slot-title">${c.name}</div>
                        <div class="garden-slot-location">${c.location}</div>
                    </div>
                    <span class="gym-type-badge" style="background: rgba(255,255,255,0.06)">${statusText}</span>
                </div>
                <div class="garden-progress-container">
                    <div class="garden-progress-label">
                        <span>Progress</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="garden-progress-bg">
                        <div class="garden-progress-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;">
                    Timing: <strong>${mainTimer}</strong><br>
                    Soil Status: <strong>${waterTimer}</strong>
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                ${(!isMature && !isWilted) ? `<button class="btn btn-secondary" onclick="waterCropSlot('${c.id}')" style="flex: 1; padding: 0.4rem;">Water</button>` : ''}
                ${(isMature || isWilted) ? `<button class="btn btn-success" onclick="harvestCropSlot('${c.id}')" style="flex: 1; padding: 0.4rem;">Harvest</button>` : `<button class="btn btn-danger" onclick="harvestCropSlot('${c.id}')" style="padding: 0.4rem;">Uproot</button>`}
            </div>
        `;
        grid.appendChild(card);
    });
}

// Tick garden cards every 30 seconds to update bars
setInterval(() => {
    if (activeTab === 'berry') {
        renderGardenSlots();
    }
}, 30000);

// ==========================================
// 5. THIEF GUIDE & PICKUP TABLES DATA
// ==========================================
const THIEF_ITEMS = [
    // Kanto
    { name: 'Amulet Coin', type: 'valuable', region: 'Kanto', holder: 'Meowth', rate: 'Rare (5% hold rate)', location: 'Route 5 / Route 8 / Bond Bridge', tips: 'Crucial for Gym reruns. Sells on GTL for ~18k-20k ¥. Use Frisk + Thief.' },
    { name: 'Lucky Egg (Small)', type: 'valuable', region: 'Kanto', holder: 'Chansey', rate: 'Rare (5% hold rate)', location: 'Safari Zone', tips: 'Increases EXP gain by 1.5x. Good market value.' },
    { name: 'Light Ball', type: 'held', region: 'Kanto', holder: 'Pikachu', rate: 'Rare (5% hold rate)', location: 'Viridian Forest / Power Plant', tips: 'Doubles Pikachu\'s Attack and Sp. Atk.' },
    { name: 'Tiny Mushroom', type: 'valuable', region: 'Kanto', holder: 'Paras', rate: 'Common (50% hold rate)', location: 'Mt. Moon', tips: 'Can be sold to NPCs or used to relearn moves.' },
    
    // Hoenn
    { name: 'Heart Scale', type: 'valuable', region: 'Hoenn', holder: 'Luvdisc', rate: 'Common (50% hold rate)', location: 'Route 128 / Ever Grande (Fish)', tips: 'Used to relearn moves at tutors. Easy to farm with Old Rod.' },
    { name: 'Hard Stone', type: 'held', region: 'Hoenn', holder: 'Aron / Geodude', rate: 'Rare (5% hold rate)', location: 'Granite Cave', tips: 'Boosts Rock type moves.' },
    { name: 'Everstone', type: 'held', region: 'Hoenn', holder: 'Geodude', rate: 'Rare (5% hold rate)', location: 'Granite Cave', tips: 'Essential breeding item to lock natures.' },
    { name: 'Dragon Fang', type: 'held', region: 'Hoenn', holder: 'Bagon', rate: 'Rare (5% hold rate)', location: 'Meteor Falls', tips: 'Boosts Dragon type moves.' },
    
    // Sinnoh
    { name: 'Leftovers', type: 'held', region: 'Sinnoh', holder: 'Munchlax / Snorlax', rate: 'Held (100%)', location: 'Honey Trees / Swarms', tips: 'Top passive competitive recovery item.' },
    { name: 'Poison Barb', type: 'held', region: 'Sinnoh', holder: 'Roselia', rate: 'Rare (5%)', location: 'Route 208 / Trophy Garden', tips: 'Boosts Poison type moves.' },
    { name: 'Metronome', type: 'held', region: 'Sinnoh', holder: 'Kricketune', rate: 'Rare (5%)', location: 'Route 210 / 215', tips: 'Boosts consecutive same-move damage.' },
    
    // Unova
    { name: 'Spell Tag', type: 'held', region: 'Unova', holder: 'Yamask / Shuppet', rate: 'Rare (5%)', location: 'Relic Castle / Route 13', tips: 'Boosts Ghost type moves.' },
    { name: 'Silk Scarf', type: 'held', region: 'Unova', holder: 'Audino', rate: 'Rare (5%)', location: 'Rustling Grass', tips: 'Boosts Normal type moves. Easy to locate.' },
    { name: 'Miracle Seed', type: 'held', region: 'Unova', holder: 'Maractus / Cherubi', rate: 'Rare (5%)', location: 'Desert Resort / Route 12', tips: 'Boosts Grass type moves.' },
    { name: 'Soft Sand', type: 'held', region: 'Unova', holder: 'Sandile / Krokorok', rate: 'Rare (5%)', location: 'Desert Resort', tips: 'Boosts Ground type moves.' },

    // Johto
    { name: 'Metal Coat', type: 'held', region: 'Johto', holder: 'Magnemite', rate: 'Rare (5%)', location: 'Route 38 / Route 39', tips: 'Used to evolve Scyther and Onix. Boosts Steel moves.' },
    { name: 'Sharp Beak', type: 'held', region: 'Johto', holder: 'Doduo / Fearow', rate: 'Rare (5%)', location: 'Route 26 / 27', tips: 'Boosts Flying type moves.' },
    { name: 'Dragon Scale', type: 'held', region: 'Johto', holder: 'Dratini', rate: 'Rare (5%)', location: 'Dragon\'s Den', tips: 'Used to evolve Seadra into Kingdra.' }
];

const PICKUP_TABLES = {
    kanto: {
        "91_100": [
            { item: 'Leftovers', rarity: 'Very Rare', chance: '1%', val: 'Valuable', note: 'Top-tier pickup item. High GTL value.' },
            { item: 'PP Up', rarity: 'Rare', chance: '3%', val: 'Valuable', note: 'Increases max move PP.' },
            { item: 'Rare Candy', rarity: 'Rare', chance: '4%', val: 'Valuable', note: 'Levels up Pokémon.' },
            { item: 'King\'s Rock', rarity: 'Rare', chance: '5%', val: 'Held Item', note: 'Enables flinching / evolves Slowpoke.' },
            { item: 'Everstone', rarity: 'Uncommon', chance: '10%', val: 'Breeding', note: 'Locks nature.' },
            { item: 'Ultra Ball', rarity: 'Common', chance: '15%', val: 'Consumable', note: 'High catch multiplier.' },
            { item: 'Great Ball', rarity: 'Common', chance: '20%', val: 'Consumable', note: 'Standard catch ball.' },
            { item: 'Super Potion', rarity: 'Common', chance: '23%', val: 'Consumable', note: 'Health potion.' },
            { item: 'Escape Rope', rarity: 'Common', chance: '19%', val: 'Consumable', note: 'Cave escape utility.' }
        ],
        "81_90": [
            { item: 'PP Up', rarity: 'Very Rare', chance: '2%', val: 'Valuable', note: 'High value drop.' },
            { item: 'Rare Candy', rarity: 'Rare', chance: '4%', val: 'Valuable', note: 'Levels up Pokémon.' },
            { item: 'Full Restore', rarity: 'Uncommon', chance: '10%', val: 'Consumable', note: 'Full recovery.' },
            { item: 'Hyper Potion', rarity: 'Common', chance: '34%', val: 'Consumable', note: 'Health recovery.' },
            { item: 'Full Heal', rarity: 'Common', chance: '50%', val: 'Consumable', note: 'Status heal.' }
        ],
        "1_10": [
            { item: 'Potion', rarity: 'Common', chance: '40%', val: 'Consumable', note: 'Low level healing.' },
            { item: 'Poké Ball', rarity: 'Common', chance: '30%', val: 'Consumable', note: 'Basic ball.' },
            { item: 'Antidote', rarity: 'Common', chance: '20%', val: 'Consumable', note: 'Poison remedy.' },
            { item: 'Oran Berry', rarity: 'Uncommon', chance: '8%', val: 'Berry', note: 'Basic berry.' },
            { item: 'Rare Candy', rarity: 'Very Rare', chance: '2%', val: 'Valuable', note: 'Rare drop at low levels.' }
        ]
    },
    hoenn: {
        // Hoenn is identical to Kanto in PokéMMO
    },
    sinnoh: {
        "91_100": [
            { item: 'Shiny Stone', rarity: 'Very Rare', chance: '2%', val: 'Evolution', note: 'Used to evolve Togetic, Roselia.' },
            { item: 'Dusk Stone', rarity: 'Very Rare', chance: '2%', val: 'Evolution', note: 'Used to evolve Murkrow, Misdreavus.' },
            { item: 'Dawn Stone', rarity: 'Very Rare', chance: '2%', val: 'Evolution', note: 'Used to evolve Kirlia (M), Snorunt (F).' },
            { item: 'PP Up', rarity: 'Rare', chance: '4%', val: 'Valuable', note: 'Increases max move PP.' },
            { item: 'Rare Candy', rarity: 'Rare', chance: '5%', val: 'Valuable', note: 'Levels up Pokémon.' },
            { item: 'Everstone', rarity: 'Uncommon', chance: '10%', val: 'Breeding', note: 'Locks nature.' },
            { item: 'Ultra Ball', rarity: 'Common', chance: '15%', val: 'Consumable', note: 'Catch ball.' },
            { item: 'Full Restore', rarity: 'Common', chance: '20%', val: 'Consumable', note: 'Full recovery.' },
            { item: 'Max Repel', rarity: 'Common', chance: '45%', val: 'Consumable', note: 'Blocks wild encounters.' }
        ],
        "81_90": [
            { item: 'Dusk Stone', rarity: 'Very Rare', chance: '2%', val: 'Evolution', note: 'Evolves specific Ghost/Dark types.' },
            { item: 'Rare Candy', rarity: 'Rare', chance: '5%', val: 'Valuable', note: 'Levels up Pokémon.' },
            { item: 'Hyper Potion', rarity: 'Common', chance: '43%', val: 'Consumable', note: 'Health recovery.' },
            { item: 'Full Heal', rarity: 'Common', chance: '50%', val: 'Consumable', note: 'Status heal.' }
        ],
        "1_10": [
            { item: 'Potion', rarity: 'Common', chance: '40%', val: 'Consumable', note: 'Low level healing.' },
            { item: 'Poké Ball', rarity: 'Common', chance: '30%', val: 'Consumable', note: 'Basic ball.' },
            { item: 'Oran Berry', rarity: 'Uncommon', chance: '18%', val: 'Berry', note: 'Basic berry.' },
            { item: 'Rare Candy', rarity: 'Very Rare', chance: '12%', val: 'Valuable', note: 'Rare drop.' }
        ]
    },
    unova: {
        "91_100": [
            { item: 'Prism Scale', rarity: 'Very Rare', chance: '2%', val: 'Evolution', note: 'Used to evolve Feebas into Milotic.' },
            { item: 'PP Max', rarity: 'Very Rare', chance: '1%', val: 'Valuable', note: 'Maxes out move PP. High GTL value.' },
            { item: 'King\'s Rock', rarity: 'Rare', chance: '5%', val: 'Held Item', note: 'Enables flinching.' },
            { item: 'Rare Candy', rarity: 'Rare', chance: '7%', val: 'Valuable', note: 'Levels up Pokémon.' },
            { item: 'PP Up', rarity: 'Rare', chance: '5%', val: 'Valuable', note: 'Increases max move PP.' },
            { item: 'Everstone', rarity: 'Uncommon', chance: '10%', val: 'Breeding', note: 'Locks nature.' },
            { item: 'Ultra Ball', rarity: 'Common', chance: '15%', val: 'Consumable', note: 'Catch ball.' },
            { item: 'Full Heal', rarity: 'Common', chance: '25%', val: 'Consumable', note: 'Status cure.' },
            { item: 'Max Ether', rarity: 'Common', chance: '30%', val: 'Consumable', note: 'Restores 10 PP.' }
        ],
        "81_90": [
            { item: 'Prism Scale', rarity: 'Very Rare', chance: '2%', val: 'Evolution', note: 'Evolves Feebas.' },
            { item: 'Rare Candy', rarity: 'Rare', chance: '5%', val: 'Valuable', note: 'Levels up.' },
            { item: 'Max Ether', rarity: 'Common', chance: '43%', val: 'Consumable', note: 'PP restore.' },
            { item: 'Full Heal', rarity: 'Common', chance: '50%', val: 'Consumable', note: 'Status cure.' }
        ],
        "1_10": [
            { item: 'Potion', rarity: 'Common', chance: '40%', val: 'Consumable', note: 'Healing.' },
            { item: 'Poké Ball', rarity: 'Common', chance: '30%', val: 'Consumable', note: 'Basic ball.' },
            { item: 'Tiny Mushroom', rarity: 'Uncommon', chance: '20%', val: 'Valuable', note: 'Sell to NPC.' },
            { item: 'Rare Candy', rarity: 'Very Rare', chance: '10%', val: 'Valuable', note: 'Rare drop.' }
        ]
    },
    johto: {
        "91_100": [
            { item: 'Prism Scale', rarity: 'Very Rare', chance: '2%', val: 'Evolution', note: 'Evolves Feebas.' },
            { item: 'Shiny Stone', rarity: 'Very Rare', chance: '2%', val: 'Evolution', note: 'Evolves Togetic/Roselia.' },
            { item: 'Sun Stone', rarity: 'Very Rare', chance: '2%', val: 'Evolution', note: 'Evolves Sunkern/Gloom.' },
            { item: 'PP Up', rarity: 'Rare', chance: '5%', val: 'Valuable', note: 'Increases move PP.' },
            { item: 'Rare Candy', rarity: 'Rare', chance: '5%', val: 'Valuable', note: 'Levels up.' },
            { item: 'Everstone', rarity: 'Uncommon', chance: '10%', val: 'Breeding', note: 'Locks nature.' },
            { item: 'Ultra Ball', rarity: 'Common', chance: '15%', val: 'Consumable', note: 'Catch ball.' },
            { item: 'Hyper Potion', rarity: 'Common', chance: '25%', val: 'Consumable', note: 'Restores 200 HP.' },
            { item: 'Escape Rope', rarity: 'Common', chance: '34%', val: 'Consumable', note: 'Cave escape utility.' }
        ],
        "81_90": [
            { item: 'Sun Stone', rarity: 'Very Rare', chance: '3%', val: 'Evolution', note: 'Evolves specific Grass/Fire types.' },
            { item: 'Rare Candy', rarity: 'Rare', chance: '5%', val: 'Valuable', note: 'Levels up.' },
            { item: 'Hyper Potion', rarity: 'Common', chance: '42%', val: 'Consumable', note: 'Restores HP.' },
            { item: 'Full Heal', rarity: 'Common', chance: '50%', val: 'Consumable', note: 'Status cure.' }
        ],
        "1_10": [
            { item: 'Potion', rarity: 'Common', chance: '40%', val: 'Consumable', note: 'Healing.' },
            { item: 'Poké Ball', rarity: 'Common', chance: '30%', val: 'Consumable', note: 'Basic ball.' },
            { item: 'Escape Rope', rarity: 'Uncommon', chance: '20%', val: 'Consumable', note: 'Escape cave.' },
            { item: 'Rare Candy', rarity: 'Very Rare', chance: '10%', val: 'Valuable', note: 'Rare drop.' }
        ]
    }
};

function switchSubFarmingTab(tab) {
    activeSubFarmingTab = tab;
    document.getElementById('btn-sub-thief').className = `region-tab-btn ${tab === 'thief' ? 'active' : ''}`;
    document.getElementById('btn-sub-pickup').className = `region-tab-btn ${tab === 'pickup' ? 'active' : ''}`;

    document.getElementById('sub-farming-thief').style.display = tab === 'thief' ? 'block' : 'none';
    document.getElementById('sub-farming-pickup').style.display = tab === 'pickup' ? 'block' : 'none';

    if (tab === 'thief') renderThiefDirectory();
    else renderPickupTableFromUI();
}

function renderThiefDirectory() {
    const grid = document.getElementById('thief-results-grid');
    grid.innerHTML = '';

    const query = document.getElementById('thief-search-input').value.toLowerCase();
    const regionFilter = document.getElementById('thief-filter-region').value;
    const typeFilter = document.getElementById('thief-filter-item').value;

    const filtered = THIEF_ITEMS.filter(item => {
        const matchesQuery = item.name.toLowerCase().includes(query) || item.holder.toLowerCase().includes(query);
        const matchesRegion = regionFilter === 'all' || item.region.toLowerCase() === regionFilter;
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        return matchesQuery && matchesRegion && matchesType;
    });

    filtered.forEach(item => {
        const card = document.createElement('div');
        card.className = 'directory-card';
        card.innerHTML = `
            <div>
                <div class="directory-card-title" style="display:flex; justify-content:space-between; align-items:center;">
                    <span>${item.name}</span>
                    <span class="badge-scent" style="background:rgba(59,130,246,0.1); color:#60a5fa; font-size:0.65rem; padding:0.05rem 0.25rem;">${item.region}</span>
                </div>
                <div class="directory-card-row" style="margin-top:0.4rem">
                    <span class="directory-card-label">Wild Holder:</span>
                    <span class="directory-card-value">${item.holder}</span>
                </div>
                <div class="directory-card-row">
                    <span class="directory-card-label">Encounter Rate:</span>
                    <span class="directory-card-value">${item.rate}</span>
                </div>
                <div class="directory-card-row">
                    <span class="directory-card-label">Best Route:</span>
                    <span class="directory-card-value" style="font-size:0.75rem">${item.location}</span>
                </div>
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 0.5rem; margin-top: 0.5rem;">
                <strong>Farming Tip:</strong> ${item.tips}
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderPickupTableFromUI() {
    const bracket = document.getElementById('pickup-level-select').value;
    const region = document.getElementById('pickup-region-select').value;
    renderPickupTable(bracket, region);
}

function renderPickupTable(bracket, region) {
    const tbody = document.getElementById('pickup-table-body');
    tbody.innerHTML = '';

    const targetRegion = region === 'hoenn' ? 'kanto' : region;
    const regionTables = PICKUP_TABLES[targetRegion] || PICKUP_TABLES['kanto'];
    const list = regionTables[bracket] || regionTables["91_100"];

    list.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.item}</strong></td>
            <td>${item.rarity}</td>
            <td><span class="badge-yield">${item.chance}</span></td>
            <td><span class="badge-scent" style="background:rgba(59,130,246,0.1); color:#60a5fa">${item.val}</span></td>
            <td style="font-size:0.8rem; color:var(--text-muted)">${item.note}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================
// 6. SHINY ENCOUNTER TRACKER LOGIC
// ==========================================
function getShinyHuntProbability(encounters) {
    const rate = 1 / 30000;
    const prob = (1 - Math.pow((29999 / 30000), encounters)) * 100;
    return Math.round(prob * 100) / 100; // Round to 2 decimals
}

function createNewShinyHunt() {
    const pkmn = document.getElementById('shiny-hunt-pokemon').value || 'Unknown Pokémon';
    const method = document.getElementById('shiny-hunt-method').value;
    const initial = parseInt(document.getElementById('shiny-hunt-initial').value) || 0;

    const hunt = {
        id: 'hunt_' + Date.now(),
        name: pkmn,
        method,
        count: initial,
        elapsedTime: 0,
        lastActiveTime: null,
        isPaused: true
    };

    shinyHunts.push(hunt);
    saveHunts();
    renderShinyHunts();

    document.getElementById('shiny-hunt-pokemon').value = '';
    document.getElementById('shiny-hunt-initial').value = 0;
}

function incrementShinyCount(id, amt) {
    const hunt = shinyHunts.find(h => h.id === id);
    if (hunt) {
        hunt.count = Math.max(0, hunt.count + amt);
        saveHunts();
        renderShinyHunts();
    }
}

function toggleShinyHuntTimer(id) {
    const hunt = shinyHunts.find(h => h.id === id);
    if (hunt) {
        if (hunt.isPaused) {
            hunt.isPaused = false;
            hunt.lastActiveTime = Date.now();
        } else {
            hunt.isPaused = true;
            if (hunt.lastActiveTime) {
                hunt.elapsedTime += Date.now() - hunt.lastActiveTime;
                hunt.lastActiveTime = null;
            }
        }
        saveHunts();
        renderShinyHunts();
    }
}

function resetShinyHuntCount(id) {
    if (confirm('Are you sure you want to reset this shiny hunt encounter count to 0?')) {
        const hunt = shinyHunts.find(h => h.id === id);
        if (hunt) {
            hunt.count = 0;
            hunt.elapsedTime = 0;
            hunt.lastActiveTime = null;
            hunt.isPaused = true;
            saveHunts();
            renderShinyHunts();
        }
    }
}

function deleteShinyHunt(id) {
    if (confirm('Delete this shiny hunt session?')) {
        shinyHunts = shinyHunts.filter(h => h.id !== id);
        saveHunts();
        renderShinyHunts();
    }
}

function renderShinyHunts() {
    const grid = document.getElementById('shiny-hunts-grid');
    grid.innerHTML = '';

    if (shinyHunts.length === 0) {
        grid.innerHTML = `
            <div style="padding: 3rem; text-align: center; color: var(--text-muted); width: 100%;">
                No active hunts. Set up a target Pokémon above to begin tracking!
            </div>
        `;
        return;
    }

    shinyHunts.forEach(h => {
        const prob = getShinyHuntProbability(h.count);
        
        // Calculate session active timing
        let elapsedTotalMs = h.elapsedTime;
        if (!h.isPaused && h.lastActiveTime) {
            elapsedTotalMs += Date.now() - h.lastActiveTime;
        }

        const hrs = Math.floor(elapsedTotalMs / (1000 * 60 * 60));
        const mins = Math.floor((elapsedTotalMs % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((elapsedTotalMs % (1000 * 60)) / 1000);
        const timerStr = `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;

        // Calculate rate of encounters per hour
        let hourlyRate = 0;
        if (elapsedTotalMs > 0) {
            hourlyRate = Math.round(h.count / (elapsedTotalMs / (1000 * 60 * 60)));
        }

        const card = document.createElement('div');
        card.className = 'shiny-hunter-card';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start">
                <div>
                    <h3 style="font-weight:700; font-size:1.15rem; color:#fff">${h.name}</h3>
                    <span style="font-size:0.75rem; color:var(--text-muted)">Method: ${h.method === 'horde' ? 'Sweet Scent Horde' : h.method === 'egg' ? 'Egg Hatch' : 'Single'}</span>
                </div>
                <button class="btn btn-secondary" onclick="deleteShinyHunt('${h.id}')" style="padding:0.25rem 0.5rem; font-size:0.7rem; border-color:rgba(239,68,68,0.15); color:var(--accent-red)">Remove</button>
            </div>
            
            <div class="shiny-count-display">${h.count.toLocaleString()}</div>

            <div class="shiny-details-row">
                <span>Shiny Probability</span>
                <strong style="color:var(--accent-pink)">${prob}%</strong>
            </div>
            <div class="shiny-details-row">
                <span>Time Spent</span>
                <strong>${timerStr}</strong>
            </div>
            <div class="shiny-details-row">
                <span>Rate Per Hour</span>
                <strong>${hourlyRate}/h</strong>
            </div>

            <div class="shiny-btn-group">
                ${h.method === 'horde' ? 
                  `<button class="btn btn-primary" style="background:var(--accent-pink); box-shadow:0 4px 10px rgba(236,72,153,0.3)" onclick="incrementShinyCount('${h.id}', 5)">+5 Horde</button>` : 
                  `<button class="btn btn-primary" style="background:var(--accent-pink); box-shadow:0 4px 10px rgba(236,72,153,0.3)" onclick="incrementShinyCount('${h.id}', 1)">+1 Hatch</button>`
                }
                <button class="btn btn-secondary" onclick="incrementShinyCount('${h.id}', -1)">-1</button>
            </div>
            <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
                <button class="btn btn-secondary" style="flex:1" onclick="toggleShinyHuntTimer('${h.id}')">${h.isPaused ? 'Resume Session' : 'Pause Session'}</button>
                <button class="btn btn-secondary" onclick="resetShinyHuntCount('${h.id}')">Reset</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Tick timers on active hunts
setInterval(() => {
    if (activeTab === 'shiny') {
        renderShinyHunts();
    }
}, 1000);

// ==========================================
// 7. PVP SPEED MATCH TIERS & CALCULATORS
// ==========================================
const SPEED_TIERS_DB = [
    { name: 'Aerodactyl', base: 130, notes: 'Fastest lead. Stealth Rock setter.' },
    { name: 'Weavile', base: 125, notes: 'Physical Ice/Dark sweep threat.' },
    { name: 'Alakazam', base: 120, notes: 'Special psychic glass cannon.' },
    { name: 'Starmie', base: 115, notes: 'Special attacker, Rapid Spinner.' },
    { name: 'Gengar', base: 110, notes: 'Special ghost sweep. Cursed Body (no Levitate).' },
    { name: 'Mienshao', base: 105, notes: 'High physical fighting damage.' },
    { name: 'Garchomp', base: 102, notes: 'Top-tier physical dragon sweeping hazard.' },
    { name: 'Hydreigon', base: 98, notes: 'Special dark/dragon choice attacker.' },
    { name: 'Haxorus', base: 97, notes: 'Dragon Dance dragon threat.' },
    { name: 'Darmanitan', base: 95, notes: 'Sheer Force flare blitz wallbreaker.' },
    { name: 'Lucario', base: 90, notes: 'Sword Dance physical priority.' },
    { name: 'Excadrill', base: 88, notes: 'Sand Rush double speed sweeper.' },
    { name: 'Rotom-Wash', base: 86, notes: 'Hydro Pump / Volt Switch pivot.' },
    { name: 'Dragonite', base: 80, notes: 'Multiscale, Dragon Dance.' },
    { name: 'Scizor', base: 65, notes: 'Bullet Punch technician priority.' },
    { name: 'Conkeldurr', base: 45, notes: 'Flame Orb Guts physical threat.' },
    { name: 'Reuniclus', base: 30, notes: 'Magic Guard. Trick Room threat.' }
];

let activeSpeedFilter = 'all';

function runSpeedMatchCalculations() {
    const base = parseInt(document.getElementById('speed-calc-base').value) || 102;
    const iv = parseInt(document.getElementById('speed-calc-iv').value) || 31;
    const ev = parseInt(document.getElementById('speed-calc-ev').value) || 252;
    const nature = parseFloat(document.getElementById('speed-calc-nature').value) || 1.0;

    // Stat stages boosts multipliers
    const stageVal = parseFloat(document.getElementById('speed-calc-stage').value);
    let stageMult = 1.0;
    if (stageVal >= 0) {
        stageMult = stageVal;
    } else {
        const absVal = Math.abs(stageVal);
        stageMult = 2 / (2 + absVal);
    }

    const hasScarf = document.getElementById('speed-calc-scarf').checked;
    const hasTailwind = document.getElementById('speed-calc-tailwind').checked;
    const hasParalysis = document.getElementById('speed-calc-paralysis').checked;

    // Standard Lvl 50 Speed Formula
    let stat = Math.floor(Math.floor((2 * base + iv + Math.floor(ev / 4)) * 50 / 100) + 5);
    stat = Math.floor(stat * nature);

    // Apply modifiers
    let finalSpeed = stat;
    if (stageMult !== 1.0) finalSpeed = Math.floor(finalSpeed * stageMult);
    if (hasScarf) finalSpeed = Math.floor(finalSpeed * 1.5);
    if (hasTailwind) finalSpeed = Math.floor(finalSpeed * 2.0);
    if (hasParalysis) finalSpeed = Math.floor(finalSpeed * 0.5);

    calculatedPlayerSpeed = finalSpeed;
    document.getElementById('speed-calc-result-stat').innerText = finalSpeed;

    renderSpeedTiersList();
}

function filterSpeedTiersList(val) {
    activeSpeedFilter = val;
    renderSpeedTiersList();
}

function renderSpeedTiersList() {
    const container = document.getElementById('speed-tiers-list');
    container.innerHTML = '';

    // Calculate level 50 speeds for the database targets
    const computedDb = SPEED_TIERS_DB.map(target => {
        // Max Speed: 31 IV, 252 EV, +Nature
        let max = Math.floor(Math.floor((2 * target.base + 31 + Math.floor(252 / 4)) * 50 / 100) + 5);
        max = Math.floor(max * 1.1);

        // Neutral Speed: 31 IV, 252 EV, neutral Nature
        let neutral = Math.floor(Math.floor((2 * target.base + 31 + Math.floor(252 / 4)) * 50 / 100) + 5);

        // Min Speed: 31 IV, 0 EV, neutral Nature
        let min = Math.floor(Math.floor((2 * target.base + 31 + 0) * 50 / 100) + 5);

        return {
            ...target,
            max,
            neutral,
            min
        };
    });

    // Filter list
    let filtered = computedDb;
    if (activeSpeedFilter === 'outspeed') {
        filtered = computedDb.filter(t => calculatedPlayerSpeed > t.max);
    } else if (activeSpeedFilter === 'outspeeded') {
        filtered = computedDb.filter(t => calculatedPlayerSpeed <= t.max);
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted)">No targets match filters.</div>`;
        return;
    }

    filtered.forEach(t => {
        const playerOutspeedsMax = calculatedPlayerSpeed > t.max;
        const div = document.createElement('div');
        div.className = `speed-tier-item ${playerOutspeedsMax ? 'outspeeds-target' : 'outspeeded-by'}`;
        div.innerHTML = `
            <div>
                <div class="speed-tier-name">${t.name} <span style="font-size:0.7rem; color:var(--text-muted)">Base ${t.base}</span></div>
                <div class="speed-tier-meta">
                    Max: <strong>${t.max}</strong> | Neutral: <strong>${t.neutral}</strong> | Min: <strong>${t.min}</strong><br>
                    <span style="font-size:0.7rem; font-style:italic">${t.notes}</span>
                </div>
            </div>
            <div class="speed-val-badge" style="background:${playerOutspeedsMax ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}; color:${playerOutspeedsMax ? '#34d399' : '#f87171'}">
                ${playerOutspeedsMax ? 'Outspeed (You)' : 'Slower'}
            </div>
        `;
        container.appendChild(div);
    });
}

// ==========================================
// 8. BREEDING SOLVER ENGINE (RE-CALLED)
// ==========================================
class BreedingNode {
    constructor(stats, hasNature, gender, idPrefix = 'n') {
        this.stats = [...stats].sort();
        this.hasNature = hasNature;
        this.gender = gender;
        this.id = idPrefix + '_' + Math.random().toString(36).substr(2, 9);
        this.left = null;
        this.right = null;
        this.item = null;
        this.cost = 0;
        this.desc = '';
    }
}

function buildBreedingTree(stats, hasNature, gender, genderRatio, idPrefix = 'node') {
    const node = new BreedingNode(stats, hasNature, gender, idPrefix);

    if (stats.length === 0 && hasNature) {
        node.desc = "Raw Nature Parent";
        node.item = "Everstone";
        return node;
    }
    if (stats.length === 1 && !hasNature) {
        node.desc = `Raw 1x31 ${stats[0]}`;
        node.item = getPowerItemName(stats[0]);
        return node;
    }

    if (genderRatio === 'genderless') {
        if (hasNature) {
            node.item = "Everstone";
            const lastStat = stats[stats.length - 1];
            node.left = buildBreedingTree(stats.slice(0, stats.length - 1), true, 'Ditto', genderRatio, 'beldum');
            node.right = buildBreedingTree(stats, false, 'Ditto', genderRatio, 'ditto');
            node.right.item = getPowerItemName(lastStat);
            node.desc = `Breed ${stats.length}x31 + Nature`;
        } else {
            const statA = stats[stats.length - 2];
            const statB = stats[stats.length - 1];
            node.left = buildBreedingTree(stats.slice(0, stats.length - 1), false, 'Ditto', genderRatio, 'beldum');
            node.right = buildBreedingTree([...stats.slice(0, stats.length - 2), statB], false, 'Ditto', genderRatio, 'ditto');
            node.left.item = getPowerItemName(statA);
            node.right.item = getPowerItemName(statB);
            node.desc = `Breed ${stats.length}x31 (No Nature)`;
        }
        return node;
    }

    const useDittoShortcuts = document.getElementById('ditto-shortcuts-toggle') && document.getElementById('ditto-shortcuts-toggle').checked;
    
    if (useDittoShortcuts) {
        if (hasNature) {
            const lastStat = stats[stats.length - 1];
            node.left = buildBreedingTree(stats.slice(0, stats.length - 1), true, 'Female', genderRatio, 'nat');
            node.right = buildBreedingTree(stats, false, 'Ditto', genderRatio, 'ditto');
            node.left.item = "Everstone";
            node.right.item = getPowerItemName(lastStat);
            node.desc = `Breed ${stats.length}x31 + Nature`;
        } else {
            const statA = stats[stats.length - 2];
            const statB = stats[stats.length - 1];
            node.left = buildBreedingTree(stats.slice(0, stats.length - 1), false, 'Female', genderRatio, 'stat');
            node.right = buildBreedingTree([...stats.slice(0, stats.length - 2), statB], false, 'Ditto', genderRatio, 'ditto');
            node.left.item = getPowerItemName(statA);
            node.right.item = getPowerItemName(statB);
            node.desc = `Breed ${stats.length}x31`;
        }
        return node;
    }

    const childGenderA = 'Male';
    const childGenderB = 'Female';

    if (hasNature) {
        const lastStat = stats[stats.length - 1];
        node.left = buildBreedingTree(stats.slice(0, stats.length - 1), true, childGenderA, genderRatio, 'nat');
        node.right = buildBreedingTree(stats, false, childGenderB, genderRatio, 'stat');
        node.left.item = "Everstone";
        node.right.item = getPowerItemName(lastStat);
        node.desc = `Breed ${stats.length}x31 + Nature`;
    } else {
        const statA = stats[stats.length - 2];
        const statB = stats[stats.length - 1];
        node.left = buildBreedingTree(stats.slice(0, stats.length - 1), false, childGenderA, genderRatio, 'stat');
        node.right = buildBreedingTree([...stats.slice(0, stats.length - 2), statB], false, childGenderB, genderRatio, 'stat');
        node.left.item = getPowerItemName(statA);
        node.right.item = getPowerItemName(statB);
        node.desc = `Breed ${stats.length}x31`;
    }
    return node;
}

function getPowerItemName(stat) {
    switch (stat) {
        case 'HP': return 'Power Weight';
        case 'Atk': return 'Power Bracer';
        case 'Def': return 'Power Belt';
        case 'SpA': return 'Power Lens';
        case 'SpD': return 'Power Band';
        case 'Spe': return 'Power Anklet';
        default: return 'Power Item';
    }
}

function calculateNodeCosts(node, genderRatio) {
    if (!node) return;

    calculateNodeCosts(node.left, genderRatio);
    calculateNodeCosts(node.right, genderRatio);

    if (!node.left && !node.right) {
        if (node.gender === 'Ditto') {
            if (node.hasNature) node.cost = prices.dittoNature;
            else {
                const k = node.stats.length;
                if (k === 1) node.cost = prices.ditto1x;
                else if (k === 2) node.cost = prices.ditto2x;
                else if (k === 3) node.cost = prices.ditto3x;
                else if (k === 4) node.cost = prices.ditto4x;
                else if (k === 5) node.cost = prices.ditto5x;
                else node.cost = prices.rawParent;
            }
        } else {
            node.cost = node.hasNature ? prices.everstone + prices.rawParent : prices.rawParent;
        }
        return;
    }

    let breedingFee = 0;
    if (genderRatio !== 'genderless') {
        if (node.gender !== 'Any') {
            breedingFee = getGenderSelectionFee(node.gender, genderRatio);
        }
    }

    let itemsCost = 0;
    if (node.left && node.left.item) {
        itemsCost += node.left.item === 'Everstone' ? prices.everstone : prices.powerItem;
    }
    if (node.right && node.right.item) {
        itemsCost += node.right.item === 'Everstone' ? prices.everstone : prices.powerItem;
    }

    node.cost = node.left.cost + node.right.cost + breedingFee + itemsCost;
}

function getGenderSelectionFee(gender, ratio) {
    if (gender === 'Any' || gender === 'Ditto') return 0;
    if (ratio === '50_50') return 5000;
    if (ratio === '875_125') return gender === 'Female' ? 21000 : 1000;
    if (ratio === '75_25_male') return gender === 'Female' ? 9000 : 2000;
    if (ratio === '75_25_female') return gender === 'Male' ? 9000 : 2000;
    return 5000;
}



function calculateAndRenderBreeding() {
    const activeIvs = [];
    const ivCheckboxes = document.querySelectorAll('.iv-checkbox');
    ivCheckboxes.forEach(cb => { if (cb.checked) activeIvs.push(cb.value); });

    const hasNature = document.getElementById('nature-select').value === 'yes';
    const genderRatio = document.getElementById('gender-ratio').value;

    if (activeIvs.length === 0 && !hasNature) {
        document.getElementById('breeding-tree-container').innerHTML = `
            <div style="padding: 3rem; text-align: center; color: var(--text-muted);">
                Select at least one 31 IV or toggle Nature to generate a breeding tree.
            </div>
        `;
        document.getElementById('total-breeding-cost').innerText = '0 ¥';
        document.getElementById('total-parents-needed').innerText = '0 parents';
        document.getElementById('breeding-summary-details').innerHTML = 'Select stats to calculate required items.';
        return;
    }

    const root = buildBreedingTree(activeIvs, hasNature, 'Any', genderRatio, 'root');
    window.currentBreedingRoot = root;
    calculateNodeCosts(root, genderRatio);

    let rawParents = 0, powerItems = 0, everstones = 0;
    let dittosCount = { '1x': 0, '2x': 0, '3x': 0, '4x': 0, '5x': 0, 'nature': 0 };

    function countNodes(node) {
        if (!node) return;
        if (!node.left && !node.right) {
            if (node.gender === 'Ditto') {
                if (node.hasNature) dittosCount['nature']++;
                else {
                    const k = node.stats.length;
                    if (k === 1) dittosCount['1x']++;
                    else if (k === 2) dittosCount['2x']++;
                    else if (k === 3) dittosCount['3x']++;
                    else if (k === 4) dittosCount['4x']++;
                    else if (k === 5) dittosCount['5x']++;
                }
            } else {
                rawParents++;
            }
        }
        if (node.left && node.left.item) {
            if (node.left.item === 'Everstone') everstones++;
            else powerItems++;
        }
        if (node.right && node.right.item) {
            if (node.right.item === 'Everstone') everstones++;
            else powerItems++;
        }
        countNodes(node.left);
        countNodes(node.right);
    }
    countNodes(root);

    document.getElementById('total-breeding-cost').innerText = `${root.cost.toLocaleString()} ¥`;
    let parentsText = `${rawParents} regular parent${rawParents !== 1 ? 's' : ''}`;
    let dittoSum = Object.values(dittosCount).reduce((a, b) => a + b, 0);
    if (dittoSum > 0) parentsText += ` + ${dittoSum} Ditto${dittoSum !== 1 ? 's' : ''}`;
    document.getElementById('total-parents-needed').innerText = parentsText;

    let detailsHtml = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.85rem;">
            <div>
                <strong style="color: var(--primary);">Required Items:</strong><br>
                • ${powerItems}x Power Items (${(powerItems * prices.powerItem).toLocaleString()} ¥)<br>
                • ${everstones}x Everstones (${(everstones * prices.everstone).toLocaleString()} ¥)
            </div>
            <div>
                <strong style="color: var(--accent-blue);">Raw Parent Breakdown:</strong><br>
                • ${rawParents}x Species Parents (${(rawParents * prices.rawParent).toLocaleString()} ¥)<br>
    `;
    if (dittoSum > 0) {
        detailsHtml += `• Dittos: `;
        let dittoDetails = [];
        if (dittosCount['nature'] > 0) dittoDetails.push(`${dittosCount['nature']}x Nature (${(dittosCount['nature'] * prices.dittoNature).toLocaleString()} ¥)`);
        if (dittosCount['1x'] > 0) dittoDetails.push(`${dittosCount['1x']}x 1x31 (${(dittosCount['1x'] * prices.ditto1x).toLocaleString()} ¥)`);
        if (dittosCount['2x'] > 0) dittoDetails.push(`${dittosCount['2x']}x 2x31 (${(dittosCount['2x'] * prices.ditto2x).toLocaleString()} ¥)`);
        if (dittosCount['3x'] > 0) dittoDetails.push(`${dittosCount['3x']}x 3x31 (${(dittosCount['3x'] * prices.ditto3x).toLocaleString()} ¥)`);
        if (dittosCount['4x'] > 0) dittoDetails.push(`${dittosCount['4x']}x 4x31 (${(dittosCount['4x'] * prices.ditto4x).toLocaleString()} ¥)`);
        if (dittosCount['5x'] > 0) dittoDetails.push(`${dittosCount['5x']}x 5x31 (${(dittosCount['5x'] * prices.ditto5x).toLocaleString()} ¥)`);
        detailsHtml += dittoDetails.join(', ') + '<br>';
    }
    detailsHtml += `</div></div>`;
    document.getElementById('breeding-summary-details').innerHTML = detailsHtml;
}

function setupPricesPanel() {
    const container = document.getElementById('prices-panel-inputs');
    container.innerHTML = '';
    Object.keys(prices).forEach(key => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        let labelText = key.replace(/([A-Z])/g, ' $1');
        labelText = labelText.charAt(0).toUpperCase() + labelText.slice(1);
        if (key.includes('ditto') && key !== 'dittoNature') {
            labelText = `Ditto ${key.replace('ditto', '')} IV`;
        }
        formGroup.innerHTML = `
            <label style="margin-bottom:0.25rem">${labelText} (¥)</label>
            <input type="number" id="price-input-${key}" value="${prices[key]}" onchange="updatePriceValue('${key}', this.value)" style="padding:0.4rem 0.6rem">
        `;
        container.appendChild(formGroup);
    });
}

function updatePriceValue(key, val) {
    prices[key] = parseInt(val) || 0;
    savePrices();
    calculateAndRenderBreeding();
}

function resetPricesToDefault() {
    prices = { ...DEFAULT_PRICES };
    savePrices();
    setupPricesPanel();
    calculateAndRenderBreeding();
}

// ==========================================
// 9. CATCH RATE CALCULATOR DATA & LOGIC
// ==========================================
function calculateCatchRate() {
    const baseRate = parseInt(document.getElementById('catch-base-rate').value) || 45;
    const pkmnLevel = parseInt(document.getElementById('catch-level').value) || 30;
    const hpPercent = parseFloat(document.getElementById('catch-hp-percent').value) || 100;
    const statusModifier = parseFloat(document.getElementById('catch-status').value) || 1.0;
    const ballModifier = parseFloat(document.getElementById('catch-ball').value) || 1.0;

    const estMaxHp = Math.floor(0.01 * (2 * 80 + 15) * pkmnLevel) + pkmnLevel + 10;
    const estCurrentHp = Math.max(1, Math.round(estMaxHp * (hpPercent / 100)));

    let X = ((3 * estMaxHp - 2 * estCurrentHp) / (3 * estMaxHp)) * baseRate * ballModifier * statusModifier;
    X = Math.min(255, Math.max(0, X));

    let finalProbability = 0;
    if (X >= 255) {
        finalProbability = 100;
    } else {
        const Y = Math.floor(65535 / Math.pow(255 / X, 0.25));
        const shakeProbability = Y / 65536;
        finalProbability = Math.pow(shakeProbability, 4) * 100;
    }

    finalProbability = Math.round(finalProbability * 100) / 100;
    const progressCircle = document.getElementById('catch-progress-bar');
    const strokeDashOffset = 377 - (377 * (finalProbability / 100));
    progressCircle.style.strokeDashoffset = strokeDashOffset;

    if (finalProbability > 70) progressCircle.style.stroke = 'var(--accent-green)';
    else if (finalProbability > 30) progressCircle.style.stroke = 'var(--accent-blue)';
    else progressCircle.style.stroke = 'var(--accent-red)';

    document.getElementById('catch-probability-text').innerText = `${finalProbability}%`;

    const infoText = document.getElementById('catch-calc-info');
    let avgThrows = Math.round(100 / finalProbability * 10) / 10;
    if (finalProbability === 0) avgThrows = '∞';
    
    infoText.innerHTML = `
        Estimated Max HP: <strong>${estMaxHp}</strong> | Current HP: <strong>${estCurrentHp}</strong><br>
        Average Throws Required: <strong>${avgThrows}</strong> ball${avgThrows !== 1 ? 's' : ''}
    `;
}

function onPokemonSelectChange(selectVal) {
    const baseRateInput = document.getElementById('catch-base-rate');
    if (selectVal !== 'custom') {
        baseRateInput.value = selectVal;
        baseRateInput.disabled = true;
    } else {
        baseRateInput.disabled = false;
        baseRateInput.value = 45;
    }
    calculateCatchRate();
}

// EV Horde Guide
const EV_GUIDE_DATA = {
    hp: [
        { region: 'Hoenn', location: 'Rusturf Tunnel', pokemon: 'Whismur', level: 'Lv 5-10', scent: 'Yes', rate: '100%', yield: '5 HP', notes: 'Extremely easy lower level horde, perfect for starter training.' },
        { region: 'Kanto', location: 'Island 5 (Water Path)', pokemon: 'Marill', level: 'Lv 5-15', scent: 'Yes', rate: '100%', yield: '5 HP', notes: 'Requires surf/sweet scent. Fast and consistent.' },
        { region: 'Sinnoh', location: 'Route 201', pokemon: 'Bidoof', level: 'Lv 2-4', scent: 'Yes', rate: '100%', yield: '5 HP', notes: 'Requires sweet scent. Low level, highly accessible.' },
        { region: 'Unova', location: 'Route 8', pokemon: 'Palpitoad / Shelmet', level: 'Lv 30-33', scent: 'Yes', rate: '100%', yield: '10 HP', notes: 'Double EV yield! Higher levels require Surf/Earthquake to clear quickly.' },
        { region: 'Johto', location: 'Ruin Valley', pokemon: 'Wooper / Marill', level: 'Lv 20-25', scent: 'Yes', rate: '100%', yield: '5-10 HP', notes: 'Very reliable water-side training location.' }
    ],
    atk: [
        { region: 'Hoenn', location: 'Mt. Pyre (Inside)', pokemon: 'Shuppet', level: 'Lv 25-30', scent: 'Yes', rate: '100%', yield: '5 Atk', notes: 'Immune to normal/fighting moves. Use Dark/Ghost/Steel spread moves.' },
        { region: 'Kanto', location: 'Route 4 (Grass)', pokemon: 'Mankey', level: 'Lv 10-15', scent: 'Yes', rate: '100%', yield: '5 Atk', notes: 'Great low level site.' },
        { region: 'Sinnoh', location: 'Ruin Maniac Cave', pokemon: 'Geodude', level: 'Lv 20-24', scent: 'Yes', rate: '100%', yield: '5 Atk / Def', notes: 'Yields physical Attack/Defense. Watch out for Sturdy.' },
        { region: 'Unova', location: 'Route 1', pokemon: 'Scraggy', level: 'Lv 5', scent: 'Yes', rate: '100%', yield: '5 Atk', notes: 'Perfect low-level attack training.' },
        { region: 'Johto', location: 'Mt. Mortar', pokemon: 'Machop / Tyrogue', level: 'Lv 15-20', scent: 'Yes', rate: '100%', yield: '5 Atk', notes: 'Solid attack horde.' }
    ],
    def: [
        { region: 'Hoenn', location: 'Magma Hideout', pokemon: 'Graveler / Torkoal', level: 'Lv 30-35', scent: 'Yes', rate: '100%', yield: '10 Def', notes: 'Excellent high-yield defense training. Bring Surf.' },
        { region: 'Kanto', location: 'Victory Road (1F)', pokemon: 'Geodude / Onix', level: 'Lv 30-40', scent: 'Yes', rate: '100%', yield: '5-10 Def', notes: 'Geodudes yield 1 Def, Gravelers/Onix yield 2. Watch out for Sturdy.' },
        { region: 'Sinnoh', location: 'Iron Island', pokemon: 'Graveler / Steelix', level: 'Lv 30-35', scent: 'Yes', rate: '100%', yield: '10 Def', notes: 'High yield defense. Water/Grass moves recommended.' },
        { region: 'Unova', location: 'Victory Road (Inside)', pokemon: 'Durant', level: 'Lv 38-40', scent: 'Yes', rate: '100%', yield: '10 Def', notes: 'Fastest defense training in Unova. Bring Fire spread moves.' },
        { region: 'Johto', location: 'Route 45', pokemon: 'Graveler / Skarmory', level: 'Lv 25-30', scent: 'Yes', rate: '100%', yield: '10 Def', notes: 'High defense yield.' }
    ],
    spa: [
        { region: 'Hoenn', location: 'Route 113', pokemon: 'Spinda', level: 'Lv 15-17', scent: 'Yes', rate: '100%', yield: '5 Sp.Atk', notes: 'No sturdy, low levels, highly recommended.' },
        { region: 'Kanto', location: 'Pokemon Tower (3F)', pokemon: 'Gastly / Haunter', level: 'Lv 15-25', scent: 'Yes', rate: '100%', yield: '5-10 Sp.Atk', notes: 'Excellent Sp. Atk. Ghost type makes them immune to normal moves.' },
        { region: 'Sinnoh', location: 'Old Chateau', pokemon: 'Gastly', level: 'Lv 14-16', scent: 'Yes', rate: '100%', yield: '5 Sp.Atk', notes: 'Classic Sinnoh spot.' },
        { region: 'Unova', location: 'Celestial Tower (3F)', pokemon: 'Litwick', level: 'Lv 26-29', scent: 'Yes', rate: '100%', yield: '5 Sp.Atk', notes: 'Highly consistent. Fire/Ghost. Flash Fire ability can block Fire moves.' },
        { region: 'Johto', location: 'Route 35 (Water)', pokemon: 'Psyduck', level: 'Lv 10-15', scent: 'Yes', rate: '100%', yield: '5 Sp.Atk', notes: 'Surf to find Psyduck hordes.' }
    ],
    spd: [
        { region: 'Hoenn', location: 'Route 115 (Water)', pokemon: 'Tentacool / Tentacruel', level: 'Lv 20-35', scent: 'Yes', rate: '100%', yield: '5-10 Sp.Def', notes: 'Bring Electric/Grass spread moves.' },
        { region: 'Kanto', location: 'Ruin Valley (Grass)', pokemon: 'Tentacool', level: 'Lv 20-25', scent: 'Yes', rate: '100%', yield: '5 Sp.Def', notes: 'Reliable water spot.' },
        { region: 'Sinnoh', location: 'Route 223 (Water)', pokemon: 'Tentacruel / Mantyke', level: 'Lv 35-40', scent: 'Yes', rate: '100%', yield: '10 Sp.Def', notes: 'High levels, bring high level electric spread moves like Discharge.' },
        { region: 'Unova', location: 'Route 18 (Water)', pokemon: 'Frillish', level: 'Lv 10-20', scent: 'Yes', rate: '100%', yield: '5 Sp.Def', notes: 'Easy water surf spot.' },
        { region: 'Johto', location: 'Route 41 (Water)', pokemon: 'Tentacool', level: 'Lv 15-20', scent: 'Yes', rate: '100%', yield: '5 Sp.Def', notes: 'Fast SpD training.' }
    ],
    spe: [
        { region: 'Hoenn', location: 'Route 104', pokemon: 'Wingull / Zigzagoon', level: 'Lv 5-10', scent: 'Yes', rate: '100%', yield: '5 Speed', notes: 'Extremely easy speed horde.' },
        { region: 'Kanto', location: 'Diglett\'s Cave', pokemon: 'Diglett / Dugtrio', level: 'Lv 15-30', scent: 'Yes', rate: '100%', yield: '5-10 Speed', notes: 'Watch out for Arena Trap. Digletts yield 1 Spe, Dugtrios yield 2.' },
        { region: 'Sinnoh', location: 'Route 205 (Water)', pokemon: 'Buizel', level: 'Lv 10-12', scent: 'Yes', rate: '100%', yield: '5 Speed', notes: 'Highly consistent water speed spot.' },
        { region: 'Unova', location: 'Route 3 (Water)', pokemon: 'Basculin', level: 'Lv 20-25', scent: 'Yes', rate: '100%', yield: '10 Speed', notes: 'Fastest Speed training in the game. Yields 10 Speed EVs per horde!' },
        { region: 'Johto', location: 'Route 38', pokemon: 'Rattata / Meowth', level: 'Lv 15-18', scent: 'Yes', rate: '100%', yield: '5 Speed', notes: 'Highly accessible.' }
    ]
};

let activeEvStat = 'hp';
function renderEvGuide() {
    const tableBody = document.getElementById('ev-table-body');
    tableBody.innerHTML = '';
    const regionFilter = document.getElementById('ev-filter-region').value;
    const hordes = EV_GUIDE_DATA[activeEvStat];

    const filtered = hordes.filter(h => {
        return regionFilter === 'all' || h.region.toLowerCase() === regionFilter;
    });

    if (filtered.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
                    No optimal hordes for this stat in the selected region. Try another region or "All Regions".
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach(horde => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${horde.region}</strong></td>
            <td>${horde.location}</td>
            <td>${horde.pokemon}</td>
            <td>${horde.level}</td>
            <td><span class="badge-scent">${horde.scent}</span></td>
            <td><span class="badge-yield">${horde.yield}</span></td>
            <td style="font-size: 0.8rem; color: var(--text-muted);">${horde.notes}</td>
        `;
        tableBody.appendChild(tr);
    });
}

// ==========================================
// 10. TAB NAVIGATION & INITIALIZATION
// ==========================================
function switchTab(tabName) {
    activeTab = tabName;
    
    // Switch Active Button Class across all tabs & sub-tabs
    const tabs = document.querySelectorAll('.tab-btn, .dropdown-menu button');
    tabs.forEach(tab => {
        if (tab.id === `nav-btn-${tabName}`) tab.classList.add('active');
        else tab.classList.remove('active');
    });

    // Handle styling on parent dropdown headers if a child is active
    const breedingGroup = document.getElementById('nav-btn-group-breeding');
    const farmingGroup = document.getElementById('nav-btn-group-farming');
    const battleGroup = document.getElementById('nav-btn-group-battle');

    if (breedingGroup) {
        if (['breeding', 'catch'].includes(tabName)) breedingGroup.classList.add('active');
        else breedingGroup.classList.remove('active');
    }
    if (farmingGroup) {
        if (['money', 'gyms', 'gtl', 'berry', 'thief'].includes(tabName)) farmingGroup.classList.add('active');
        else farmingGroup.classList.remove('active');
    }
    if (battleGroup) {
        if (['pvp', 'ev', 'typematch'].includes(tabName)) battleGroup.classList.add('active');
        else battleGroup.classList.remove('active');
    }

    // Switch Active Content Div
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(c => {
        if (c.id === `${tabName}-tab`) c.classList.add('active');
        else c.classList.remove('active');
    });

    // Run Render Routines
    if (tabName === 'gyms') {
        renderGymList();
        updateGymStats();
    } else if (tabName === 'ev') {
        renderEvGuide();
    } else if (tabName === 'breeding') {
        calculateAndRenderBreeding();
    } else if (tabName === 'gtl') {
        renderLedgerTable();
        updateLedgerPortfolio();
        calculateLedgerTaxPreview();
    } else if (tabName === 'berry') {
        renderBerryRecipeDetails(document.getElementById('berry-recipe-select').value);
        renderGardenSlots();
    } else if (tabName === 'thief') {
        switchSubFarmingTab(activeSubFarmingTab);
    } else if (tabName === 'shiny') {
        renderShinyHunts();
    } else if (tabName === 'pvp') {
        runSpeedMatchCalculations();
    } else if (tabName === 'money') {
        renderMoneyTab();
    } else if (tabName === 'story') {
        renderStoryTab();
    } else if (tabName === 'typematch') {
        initTypeCalculator();
    }
}

function switchRegion(regionName) {
    activeRegion = regionName;
    const buttons = document.querySelectorAll('.region-tab-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(regionName)) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    renderGymList();
}

function switchEvStat(statName) {
    activeEvStat = statName;
    const buttons = document.querySelectorAll('.ev-tab-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(statName)) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    renderEvGuide();
}

// DOM Page Load
window.addEventListener('DOMContentLoaded', () => {
    loadLocalStorage();
    setupPricesPanel();
    loadMoneyTracker();
    loadStoryProgression();
    
    // Hook up checkboxes for breeding IV cards
    const ivCheckboxes = document.querySelectorAll('.iv-checkbox');
    ivCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            const card = cb.closest('.iv-checkbox-card');
            if (cb.checked) card.classList.add('active');
            else card.classList.remove('active');
            calculateAndRenderBreeding();
        });
    });

    // Initialize all renders
    calculateAndRenderBreeding();
    calculateCatchRate();
    runSimStep();
    renderMoneyTab();
    renderStoryTab();

    // Initialize Supabase Cloud Sync
    if (typeof initSupabase === 'function') {
        initSupabase();
    }
});

// ==========================================
// 11. POKÉMON BREEDING EGG GROUP DATABASE & LOOKUP
// ==========================================

let currentLookupPokemon = null;

function lookupBreedingPokemon(query) {
    const resultsDiv = document.getElementById('breed-lookup-results');
    const normalized = query.trim().toLowerCase();

    if (normalized.length < 2) {
        resultsDiv.style.display = 'none';
        resultsDiv.innerHTML = '';
        currentLookupPokemon = null;
        return;
    }

    // List of standard egg groups
    const EGG_GROUPS = ['monster', 'field', 'dragon', 'water 1', 'water 2', 'water 3', 'bug', 'flying', 'fairy', 'grass', 'human-like', 'mineral', 'amorphous', 'ditto', 'genderless', 'undiscovered'];

    // Check if query is an egg group match
    const isEggGroupMatch = EGG_GROUPS.find(g => g.includes(normalized) || normalized.includes(g));

    if (isEggGroupMatch) {
        const groupName = isEggGroupMatch.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const matchingPkmn = [];
        Object.keys(POKEMON_BREED_DB).forEach(key => {
            const pkmn = POKEMON_BREED_DB[key];
            if (pkmn.groups.some(g => g.toLowerCase() === isEggGroupMatch)) {
                matchingPkmn.push(pkmn);
            }
        });

        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = `
            <div style="font-size: 0.85rem; text-align: left;">
                <strong style="color: var(--primary); font-size:1.05rem; display:block; margin-bottom:0.4rem;">Egg Group: ${groupName}</strong>
                <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.5rem;">
                    Found ${matchingPkmn.length} compatible species in this group:
                </div>
                <div style="max-height: 180px; overflow-y: auto; font-size: 0.75rem; line-height: 1.6; padding-right: 0.25rem;">
                    ${matchingPkmn.map(p => `• <strong>${p.name}</strong> (${p.groups.join('/')})`).join('<br>')}
                </div>
            </div>
        `;
        currentLookupPokemon = null;
        return;
    }

    // Direct lookup by species name
    let match = POKEMON_BREED_DB[normalized];

    // If no direct lookup, try partial match
    if (!match) {
        const keys = Object.keys(POKEMON_BREED_DB);
        const partialKey = keys.find(k => k.includes(normalized));
        if (partialKey) match = POKEMON_BREED_DB[partialKey];
    }

    if (!match) {
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = `
            <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center;">
                No matches found. Try species name (e.g. Ralts) or Egg Group (e.g. Field).
            </div>
        `;
        currentLookupPokemon = null;
        return;
    }

    currentLookupPokemon = match;
    resultsDiv.style.display = 'block';

    // Find compatible breeding partners
    const partners = [];
    const targetGroups = match.groups;

    if (!targetGroups.includes('Undiscovered') && !targetGroups.includes('Genderless')) {
        Object.keys(POKEMON_BREED_DB).forEach(key => {
            const pkmn = POKEMON_BREED_DB[key];
            if (pkmn.name !== match.name && !pkmn.groups.includes('Undiscovered') && pkmn.groups !== 'Genderless') {
                const sharesGroup = pkmn.groups.some(g => targetGroups.includes(g));
                if (sharesGroup) {
                    partners.push(pkmn);
                }
            }
        });
    }

    // Build compatible partner list HTML
    let partnersHtml = '';
    if (match.groups.includes('Genderless')) {
        partnersHtml = `
            <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--accent-pink);">
                <strong>Compatible Partners:</strong> Ditto (Only breeds with Ditto!)
            </div>
        `;
    } else if (match.groups.includes('Undiscovered')) {
        partnersHtml = `
            <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--accent-red);">
                <strong>Compatible Partners:</strong> None (Baby Pokémon cannot breed).
            </div>
        `;
    } else {
        const partnerNames = partners.map(p => {
            const groupsStyled = p.groups.map(g => {
                if (targetGroups.includes(g)) return `<span style="color:var(--accent-green)">${g}</span>`;
                return g;
            }).join('/');
            
            const isBridge = p.groups.length > 1;
            const bridgeIndicator = isBridge ? ' <span style="color:var(--accent-blue); font-size:0.65rem;">[Bridge]</span>' : '';

            return `• <strong>${p.name}</strong> (${groupsStyled})${bridgeIndicator}`;
        });

        partnersHtml = `
            <div style="margin-top: 0.75rem; border-top: 1px dashed rgba(255,255,255,0.05); padding-top: 0.5rem;">
                <strong style="font-size:0.8rem; color:#fff; display:block; margin-bottom:0.25rem;">Compatible Partners (Same Egg Group):</strong>
                <div style="max-height: 150px; overflow-y: auto; font-size: 0.75rem; line-height: 1.5; padding-right: 0.25rem;">
                    ${partnerNames.length > 0 ? partnerNames.join('<br>') : 'Ditto'}
                </div>
            </div>
        `;
    }

    let applyBtn = '';
    if (match.ratio !== 'undiscovered') {
        applyBtn = `<button class="btn btn-secondary" onclick="applyLookupToCalculator('${match.ratio}')" style="width: 100%; padding: 0.35rem 0.5rem; font-size: 0.75rem; margin-top: 0.75rem;">Apply Ratio to Calc</button>`;
    }

    // Wrap egg groups in links that trigger search by group
    const groupsHtml = match.groups.map(g => {
        return `<span style="color:var(--primary); cursor:pointer; text-decoration:underline;" onclick="triggerGroupSearch('${g}')">${g}</span>`;
    }).join(' / ');

    resultsDiv.innerHTML = `
        <div style="font-size: 0.85rem; text-align: left;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.4rem;">
                <strong style="color: var(--primary); font-size:1.05rem;">${match.name}</strong>
                <span class="badge-scent" style="background:rgba(236,72,153,0.1); color:var(--accent-pink)">${match.ratioText || match.ratio}</span>
            </div>
            <div>
                • <strong>Egg Group(s):</strong> ${groupsHtml}<br>
                • <strong>Breeding Advice:</strong> ${match.note}
            </div>
            ${partnersHtml}
            ${applyBtn}
        </div>
    `;
}

function triggerGroupSearch(groupName) {
    const input = document.getElementById('breed-lookup-input');
    if (input) {
        input.value = groupName;
        lookupBreedingPokemon(groupName);
    }
}

function applyLookupToCalculator(ratio) {
    const ratioSelect = document.getElementById('gender-ratio');
    ratioSelect.value = ratio;
    calculateAndRenderBreeding();
}

// ==========================================
// 12. QUICK DAYCARE BREED STEP SIMULATOR
// ==========================================
function runSimStep() {
    const resultsDiv = document.getElementById('sim-results');
    
    // Toggle active visual styles on simulator checkboxes
    document.querySelectorAll('.sim-parent-checkbox, .sim-partner-checkbox').forEach(cb => {
        const card = cb.closest('.iv-checkbox-card');
        if (cb.checked) card.classList.add('active');
        else card.classList.remove('active');
    });

    const parentStats = [];
    const partnerStats = [];
    
    document.querySelectorAll('.sim-parent-checkbox').forEach(cb => { if (cb.checked) parentStats.push(cb.value); });
    document.querySelectorAll('.sim-partner-checkbox').forEach(cb => { if (cb.checked) partnerStats.push(cb.value); });

    if (parentStats.length === 0 && partnerStats.length === 0) {
        resultsDiv.innerHTML = `<span style="color: var(--text-muted);">Toggle which 31 IV stats your parents have on the left to see the daycare holding setup and child outcome advice!</span>`;
        return;
    }

    const allStats = new Set([...parentStats, ...partnerStats]);
    const sharedStats = parentStats.filter(s => partnerStats.includes(s));
    const diffParent = parentStats.filter(s => !partnerStats.includes(s));
    const diffPartner = partnerStats.filter(s => !parentStats.includes(s));

    const totalDiff = diffParent.length + diffPartner.length;

    let html = '';

    if (totalDiff > 2) {
        // Warning: stats will be lost
        html += `
            <div style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 8px; padding: 0.75rem; color: #f87171;">
                <strong style="font-size: 0.95rem; display: block; margin-bottom: 0.25rem;">⚠️ Warning: Stat Loss Detected!</strong>
                You selected ${totalDiff} differing stats (Parent: ${diffParent.join('/') || 'none'} vs Partner: ${diffPartner.join('/') || 'none'}).<br><br>
                Because you can only lock **two stats** with Power Items, you cannot lock all differing stats. Unlocked stats will be averaged, and you will lose them.<br><br>
                <strong>Recommendation:</strong> Your partner must share the same base stats and have at most one new differing stat.
            </div>
        `;
    } else {
        // Safe breed
        let itemParent = 'No Item';
        let itemPartner = 'No Item';

        if (diffParent.length === 1 && diffPartner.length === 1) {
            itemParent = getPowerItemName(diffParent[0]);
            itemPartner = getPowerItemName(diffPartner[0]);
        } else if (diffParent.length === 1 && diffPartner.length === 0) {
            itemParent = getPowerItemName(diffParent[0]);
            itemPartner = sharedStats.length > 0 ? getPowerItemName(sharedStats[0]) : 'Everstone';
        } else if (diffPartner.length === 1 && diffParent.length === 0) {
            itemPartner = getPowerItemName(diffPartner[0]);
            itemParent = sharedStats.length > 0 ? getPowerItemName(sharedStats[0]) : 'Everstone';
        } else if (diffParent.length === 0 && diffPartner.length === 0 && sharedStats.length > 0) {
            itemParent = getPowerItemName(sharedStats[0]);
            itemPartner = sharedStats.length > 1 ? getPowerItemName(sharedStats[1]) : 'Everstone';
        }

        const babyStats = Array.from(allStats).sort();

        html += `
            <div style="background: rgba(16, 185, 129, 0.04); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 10px; padding: 0.75rem; margin-bottom: 0.75rem; color: #fff;">
                <strong style="color: var(--accent-green); font-size: 0.95rem; display: block; margin-bottom: 0.4rem;">✅ Valid Daycare Breed</strong>
                • Parent A holds: <strong style="color:#fbbf24">${itemParent}</strong><br>
                • Partner holds: <strong style="color:#fbbf24">${itemPartner}</strong><br>
                • Resulting Baby: <span class="badge-yield" style="background:rgba(16,185,129,0.15); color:#34d399; font-size:0.75rem;">${babyStats.length}x31 (${babyStats.join('/')})</span><br>
                <span style="font-size:0.75rem; color:var(--text-muted); font-style:italic; display:block; margin-top:0.4rem;">
                    * Shared stats (${sharedStats.join('/') || 'none'}) pass down naturally because both parents have them.
                </span>
            </div>
        `;

        const nextStats = ['HP', 'Atk', 'Def', 'SpA', 'SpD', 'Spe'].filter(s => !allStats.has(s));
        if (nextStats.length > 0) {
            html += `
                <div style="background: rgba(59, 130, 246, 0.03); border: 1px solid rgba(59, 130, 246, 0.15); border-radius: 8px; padding: 0.65rem 0.75rem; font-size: 0.8rem; margin-top: 0.5rem; line-height: 1.4;">
                    <strong>Next step suggestion:</strong><br>
                    To breed this baby to the next tier, breed or buy a partner carrying the **same stats** (${babyStats.join('/')}) plus **one new stat** from: [${nextStats.join(', ')}].
                </div>
            `;
        } else {
            html += `
                <div style="background: rgba(167, 139, 250, 0.03); border: 1px solid rgba(167, 139, 250, 0.15); border-radius: 8px; padding: 0.65rem 0.75rem; font-size: 0.8rem; margin-top: 0.5rem;">
                    <strong>Perfect 6x31 Simulated!</strong> You reached maximum IVs.
                </div>
            `;
        }
    }

    resultsDiv.innerHTML = html;
}

// ==========================================
// 13. MONEY-MAKING ROUTINE ENGINE
// ==========================================
const DAILY_CHORES_DATA = [
    { id: 'kantogyms', name: 'Kanto Gym Rerun Route', reward: 120000, time: 0.75, desc: 'Clear 7-8 Kanto gyms (usually Blaine, Sabrina, Erika, Misty, Brock, Lt. Surge).' },
    { id: 'hoenngyms', name: 'Hoenn Gym Rerun Route', reward: 135000, time: 0.8, desc: 'Clear Hoenn gyms (Flannery, Winona, Norman, Roxanne, Brawly, Wattson).' },
    { id: 'sinnohgyms', name: 'Sinnoh Gym Rerun Route', reward: 140000, time: 0.85, desc: 'Clear Sinnoh gyms (Roark, Gardenia, Maylene, Crasher Wake, Byron, Candice).' },
    { id: 'unovagyms', name: 'Unova Gym Rerun Route', reward: 150000, time: 0.9, desc: 'Clear Unova gyms (Cilan/Chili/Cress, Lenora, Burgh, Elesa, Clay, Skyla).' },
    { id: 'johtogyms', name: 'Johto Gym Rerun Route', reward: 110000, time: 0.7, desc: 'Clear Johto gyms (Falkner, Bugsy, Whitney, Morty, Chuck, Jasmine, Pryce).' },
    { id: 'alphaswarms', name: 'Daily Alpha Swarm Captures', reward: 80000, time: 0.4, desc: 'Locate and capture the 4 active daily Alpha spawns for valuable IVs/Abilities.' },
    { id: 'berrywatering', name: 'Water & Maintain Berry Plots', reward: 75000, time: 0.2, desc: 'Passive yield of Leppa/Rawst berries at Abundant Shrine or Hoenn Mistralton.' },
    { id: 'thieffarming', name: '1-Hour Thief Target Farming', reward: 150000, time: 1.0, desc: 'Thief farm Everstones/Heart Scales in Hoenn, or Metronomes in Sinnoh.' },
    { id: 'dittofarming', name: '1-Hour Desert Underpass Ditto Catching', reward: 180000, time: 1.0, desc: 'Catch Dittos in Hoenn Desert Underpass. Bulk sell or GTL trade high IVs.' }
];

const FARMING_METHODS_DATA = [
    {
        title: 'Ditto Catching (Desert Underpass)',
        region: 'Hoenn',
        yield: '180,000 - 240,000 ¥ / hr',
        desc: 'Catch Dittos using a level 100 Smeargle with False Swipe, Spore, and Substitute. Keep boxes of "Shittos" to sell in bulk or GTL list nature/31-IV matches.'
    },
    {
        title: 'Thief Farming (Heart Scales / Everstones)',
        region: 'Hoenn / Sinnoh / Kanto',
        yield: '140,000 - 180,000 ¥ / hr',
        desc: 'Use a Banette or Covet/Thief Pokémon with Frisk ability. Thief Luvdiscs (Route 128) for Heart Scales, or Roggenrola/Geodudes for Everstones.'
    },
    {
        title: 'Pay Day / Pickup Farming',
        region: 'Kanto (Cape Brink) / Johto',
        yield: '90,000 - 130,000 ¥ / hr',
        desc: 'Run a Level 100 Meowth with Pickup ability and Pay Day. Grind low-tier wild encounters to gain direct Yen + passive Pickup drops (PP Up, Oran).'
    }
];

let checkedDailyChores = {};

function loadMoneyTracker() {
    try {
        const stored = localStorage.getItem('checked_daily_chores');
        if (stored) checkedDailyChores = JSON.parse(stored);
        else checkedDailyChores = {};
    } catch(e) {
        checkedDailyChores = {};
    }
}

function saveMoneyTracker() {
    localStorage.setItem('checked_daily_chores', JSON.stringify(checkedDailyChores));
}

function toggleDailyChore(choreId) {
    checkedDailyChores[choreId] = !checkedDailyChores[choreId];
    saveMoneyTracker();
    renderMoneyTab();
}

function resetDailyChores() {
    checkedDailyChores = {};
    saveMoneyTracker();
    renderMoneyTab();
}

function renderMoneyTab() {
    const container = document.getElementById('money-chores-list');
    if (!container) return;
    container.innerHTML = '';

    let totalEarned = 0;
    let totalTime = 0;

    DAILY_CHORES_DATA.forEach(chore => {
        const isChecked = !!checkedDailyChores[chore.id];
        if (isChecked) {
            totalEarned += chore.reward;
            totalTime += chore.time;
        }

        const div = document.createElement('div');
        div.className = `iv-checkbox-card ${isChecked ? 'active' : ''}`;
        div.style.padding = '0.75rem';
        div.style.cursor = 'pointer';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.setAttribute('onclick', `toggleDailyChore('${chore.id}')`);

        div.innerHTML = `
            <div style="display:flex; align-items:center; gap:0.6rem; flex:1;">
                <input type="checkbox" ${isChecked ? 'checked' : ''} style="pointer-events:none;">
                <div style="text-align:left;">
                    <strong style="color:#fff; font-size:0.85rem; display:block;">${chore.name}</strong>
                    <span style="font-size:0.75rem; color:var(--text-muted);">${chore.desc}</span>
                </div>
            </div>
            <div style="text-align:right; min-width:110px;">
                <span style="color:var(--primary); font-weight:700; font-size:0.9rem;">+${chore.reward.toLocaleString()} ¥</span><br>
                <span style="font-size:0.7rem; color:var(--text-muted);">${chore.time} hours</span>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById('daily-earned-total').innerText = `${totalEarned.toLocaleString()} ¥`;
    document.getElementById('daily-time-spent').innerText = `${totalTime.toFixed(2)} hrs`;
    
    const efficiency = totalTime > 0 ? Math.round(totalEarned / totalTime) : 0;
    document.getElementById('daily-hourly-efficiency').innerText = `${efficiency.toLocaleString()} ¥ / hr`;

    const farmingContainer = document.getElementById('farming-methods-container');
    if (!farmingContainer) return;
    farmingContainer.innerHTML = '';
    
    FARMING_METHODS_DATA.forEach(m => {
        const div = document.createElement('div');
        div.className = 'card';
        div.style.background = 'rgba(0,0,0,0.1)';
        div.style.border = '1px solid rgba(255,255,255,0.03)';
        div.style.marginBottom = '0';
        div.style.textAlign = 'left';
        div.innerHTML = `
            <h3 style="font-size:0.85rem; color:var(--primary); margin-bottom:0.4rem; font-family:'Press Start 2P', monospace;">${m.title}</h3>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.5rem;">
                Region: <strong style="color:#fff">${m.region}</strong> | Yield: <strong style="color:var(--accent-green)">${m.yield}</strong>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.4;">${m.desc}</p>
        `;
        farmingContainer.appendChild(div);
    });
}

// ==========================================
// 14. REGIONAL GUIDES & PROGRESSION ENGINE
// ==========================================
const REGIONAL_STORY_DB = {
    kanto: {
        name: 'Kanto (FireRed/LeafGreen)',
        caps: [
            { badges: '0 Badges', cap: 'Lv 20' },
            { badges: '1 Badge', cap: 'Lv 20' },
            { badges: '2 Badges', cap: 'Lv 26' },
            { badges: '3 Badges', cap: 'Lv 32' },
            { badges: '4 Badges', cap: 'Lv 37' },
            { badges: '5 Badges', cap: 'Lv 46' },
            { badges: '6 Badges', cap: 'Lv 47' },
            { badges: '7 Badges', cap: 'Lv 50' },
            { badges: '8 Badges', cap: 'Lv 55' },
            { badges: 'Elite Four', cap: 'Lv 62' },
            { badges: 'Post-Game Champion', cap: 'Lv 100' }
        ],
        milestones: [
            { text: 'Defeated Brock (Boulder Badge)', level: 20, hm: 'None' },
            { text: 'Defeated Misty (Cascade Badge)', level: 26, hm: 'Cut' },
            { text: 'Defeated Lt. Surge (Thunder Badge)', level: 32, hm: 'Fly' },
            { text: 'Defeated Erika (Rainbow Badge)', level: 37, hm: 'Strength' },
            { text: 'Defeated Koga (Soul Badge)', level: 46, hm: 'Surf' },
            { text: 'Defeated Sabrina (Marsh Badge)', level: 47, hm: 'Rock Smash' },
            { text: 'Defeated Blaine (Volcano Badge)', level: 50, hm: 'Waterfall' },
            { text: 'Defeated Giovanni (Earth Badge)', level: 55, hm: 'None' }
        ],
        team: {
            title: 'Kanto Easy-Clear Team Recommendation',
            pokemons: [
                { name: 'Gyarados', role: 'Physical Sweeper', moves: 'Dragon Dance, Waterfall, Crunch, Ice Fang', loc: 'Buy Magikarp at Route 4 or fish anywhere' },
                { name: 'Alakazam', role: 'Special Sweeper', moves: 'Psychic, Shadow Ball, Focus Blast, Recover', loc: 'Catch Abra at Route 24/25' },
                { name: 'Krookodile', role: 'Moxie Sweeper (Imported)', moves: 'Earthquake, Crunch, Rock Slide, Brick Break', loc: 'GTL purchase (extremely cheap)' }
            ]
        },
        storyline: [
            { step: '1. Starter & Oak\'s Parcel', desc: 'Acquire your starter Pokémon at Pallet Town. Head north to Viridian City, collect Oak\'s Parcel from the Poké Mart, and deliver it back to Oak to obtain your Pokédex and 5 Poké Balls.' },
            { step: '2. Viridian Forest & Brock', desc: 'Travel north through Route 2 and enter Viridian Forest. Grind levels on bugs if needed, then reach Pewter City. Defeat Gym Leader Brock (Rock type) using Water/Grass moves. (Obedience cap increases to Level 20).' },
            { step: '3. Mt. Moon & Fossil Selection', desc: 'Buy the Level 5 Magikarp at the Route 4 Pokémon Center for 500¥ (essential for Gyarados physical sweeper!). Navigate through Mt. Moon, clear out Team Rocket grunts, and choose either the Dome or Helix Fossil.' },
            { step: '4. Nugget Bridge & Misty', desc: 'Arrive in Cerulean City. Head north, defeat your Rival, and clear Nugget Bridge. Save Bill at Route 25 to receive the S.S. Ticket. Return to Cerulean and defeat Misty (Water type) using Grass/Electric moves. (Obedience cap: Level 26).' },
            { step: '5. S.S. Anne & Lt. Surge', desc: 'Walk south through the Underground Path to Vermilion City. Board the S.S. Anne, battle trainers for EXP, and assist the seasick Captain to get HM01 Cut. Teach it to clear the bush to Lt. Surge\'s Gym. Defeat Surge (Electric type) using Ground moves. (Obedience cap: Level 32).' },
            { step: '6. Rock Tunnel & Pokémon Tower', desc: 'Go east to Route 9, enter Rock Tunnel (HM05 Flash is optional but helpful; you can navigate in the dark). Reach Lavender Town and scale the Pokémon Tower until you get blocked by the ghost. Travel west to Celadon City.' },
            { step: '7. Rocket Hideout & Erika', desc: 'In Celadon City, clear Erika\'s Gym (Grass type) using Fire/Flying moves (Obedience cap: Level 37). Visit the Game Corner, press the poster switch, and clear the Rocket Hideout under the building. Defeat Giovanni to get the Silph Scope.' },
            { step: '8. Ghost Marowak & Poké Flute', desc: 'Return to Lavender Town with the Silph Scope. Ascend Pokémon Tower, soothe the ghost of Marowak, and defeat Team Rocket at the top. Speak to Mr. Fuji to get the Poké Flute. Wake up the sleeping Snorlax on Route 12 or 16.' },
            { step: '9. Silph Co. & Sabrina', desc: 'Gain entry to Saffron City. Enter the Silph Co. building, navigate the teleporter pads, defeat your Rival, and clear Giovanni to get the Master Ball. Defeat Sabrina (Psychic type) using Bug/Ghost/Dark moves. (Obedience cap: Level 47).' },
            { step: '10. Safari Zone & Koga', desc: 'Travel south to Fuchsia City. Enter the Safari Zone, locate the Warden\'s Gold Teeth and HM03 Surf. Give the teeth to the Warden to get HM04 Strength. Defeat Koga (Poison type) using Psychic/Ground moves. (Obedience cap: Level 46).' },
            { step: '11. Cinnabar Mansion & Blaine', desc: 'Surf south from Pallet Town or Fuchsia City to Cinnabar Island. Search the Pokémon Mansion to find the Secret Key. Unlock Cinnabar Gym and defeat Blaine (Fire type) using Water/Ground/Rock moves. (Obedience cap: Level 50).' },
            { step: '12. Viridian Gym & Giovanni', desc: 'Go back to Viridian City. The locked gym is now open! Defeat Gym Leader Giovanni (Ground type) using Water/Grass/Ice moves. (Obedience cap: Level 55).' },
            { step: '13. Victory Road & Elite Four', desc: 'Head west to Route 22, traverse Victory Road using HM04 Strength. Arrive at the Indigo Plateau. Defeat the Elite Four (Lorelei, Bruno, Agatha, Lance) and your Rival (Champion) to clear the region! (Obedience cap: Level 62 / Post-game Level 100).' }
        ]
    },
    hoenn: {
        name: 'Hoenn (Ruby/Sapphire/Emerald)',
        caps: [
            { badges: '0 Badges', cap: 'Lv 20' },
            { badges: '1 Badge', cap: 'Lv 20' },
            { badges: '2 Badges', cap: 'Lv 24' },
            { badges: '3 Badges', cap: 'Lv 28' },
            { badges: '4 Badges', cap: 'Lv 33' },
            { badges: '5 Badges', cap: 'Lv 35' },
            { badges: '6 Badges', cap: 'Lv 38' },
            { badges: '7 Badges', cap: 'Lv 44' },
            { badges: '8 Badges', cap: 'Lv 47' },
            { badges: 'Elite Four', cap: 'Lv 58' },
            { badges: 'Post-Game Champion', cap: 'Lv 100' }
        ],
        milestones: [
            { text: 'Defeated Roxanne (Stone Badge)', level: 20, hm: 'Cut' },
            { text: 'Defeated Brawly (Knuckle Badge)', level: 24, hm: 'Flash' },
            { text: 'Defeated Wattson (Dynamo Badge)', level: 28, hm: 'Rock Smash' },
            { text: 'Defeated Flannery (Heat Badge)', level: 33, hm: 'Strength' },
            { text: 'Defeated Norman (Balance Badge)', level: 35, hm: 'Surf' },
            { text: 'Defeated Winona (Feather Badge)', level: 38, hm: 'Fly' },
            { text: 'Defeated Tate & Liza (Mind Badge)', level: 44, hm: 'Dive' },
            { text: 'Defeated Wallace/Juan (Rain Badge)', level: 47, hm: 'Waterfall' }
        ],
        team: {
            title: 'Hoenn Easy-Clear Team Recommendation',
            pokemons: [
                { name: 'Swampert', role: 'Mixed Tank', moves: 'Waterfall, Earthquake, Ice Beam, Rock Slide', loc: 'Starter selection' },
                { name: 'Gardevoir', role: 'Special Sweeper', moves: 'Psychic, Dazzling Gleam, Thunderbolt, Calm Mind', loc: 'Catch Ralts at Route 102' },
                { name: 'Breloom', role: 'Physical Spore Attacker', moves: 'Seed Bomb, Mach Punch, Spore, Rock Tomb', loc: 'Catch Shroomish in Petalburg Woods' }
            ]
        },
        storyline: [
            { step: '1. Littleroot to Petalburg', desc: 'Save Professor Birch on Route 101 to get your starter. Deliver Birch\'s bag, beat May/Brendan, and get your Pokédex. Head west to Petalburg City and talk to your father, Norman.' },
            { step: '2. Petalburg Woods & Roxanne', desc: 'Walk through Petalburg Woods, defeat the Aqua grunt, and reach Rustboro City. Clear Rustboro Gym Leader Roxanne (Rock type) using Water/Grass moves. (Obedience cap: Level 20. HM01 Cut is now usable).' },
            { step: '3. Dewford Gym & Brawly', desc: 'Recover Peeko the Wingull and the Devon Parts in Rusturf Tunnel. Sail with Mr. Briney to Dewford Town. Defeat Brawly (Fighting type) using Flying/Psychic moves. (Obedience cap: Level 24. HM05 Flash is usable).' },
            { step: '4. Slateport Musem & Wattson', desc: 'Deliver Devon Parts in Slateport City Museum while fighting off Team Aqua. Walk north to Mauville City. Defeat Gym Leader Wattson (Electric type) using Ground moves. (Obedience cap: Level 28. HM06 Rock Smash is usable).' },
            { step: '5. Mt. Chimney & Flannery', desc: 'Go north, navigate Route 112, and take the Cable Car up Mt. Chimney. Defeat Team Aqua/Magma Boss Archie/Maxie. Go down Jagged Pass to Lavaridge Town and defeat Flannery (Fire type). (Obedience cap: Level 33. HM04 Strength is usable).' },
            { step: '6. Petalburg Gym & Norman', desc: 'Return to Petalburg City and challenge Norman (Normal type) using Fighting moves. (Obedience cap: Level 35). Collect HM03 Surf from Wally\'s house. You can now traverse water!' },
            { step: '7. Weather Institute & Winona', desc: 'Surf east from Mauville, clear the Weather Institute to get Castform, and beat your Rival. Arrive in Fortree City. Get the Devon Scope from Steven on Route 120, reveal the invisible Kecleon, and defeat Winona (Flying type). (Obedience cap: Level 38. HM02 Fly is usable).' },
            { step: '8. Mt. Pyre & Hideouts', desc: 'Travel east to Lilycove City. Go to Mt. Pyre, fight off Team Aqua/Magma, and get the Magma Emblem. Clear the Magma Hideout in Jagged Pass and the Aqua Hideout in Lilycove Cove.' },
            { step: '9. Mossdeep Gym & Tate & Liza', desc: 'Surf east to Mossdeep City. Defeat Tate & Liza in a double battle (Psychic type) using Ghost/Dark/Bug moves. (Obedience cap: Level 44. HM08 Dive is usable). Speak to Steven to receive HM08 Dive.' },
            { step: '10. Seafloor Cavern & Cave of Origin', desc: 'Dive on Route 128 to locate the Seafloor Cavern. Clear the cavern, defeat Archie/Maxie, and watch Groudon/Kyogre escape. Surf to Sootopolis City. Go to the Cave of Origin, calm/defeat the Legendary Pokémon, and unlock Sootopolis Gym.' },
            { step: '11. Wallace & Waterfall', desc: 'Defeat Gym Leader Wallace/Juan (Water type) in Sootopolis Gym. (Obedience cap: Level 47. HM07 Waterfall is usable). You can now scale waterfalls to reach Ever Grande City.' },
            { step: '12. Ever Grande & Elite Four', desc: 'Scale the waterfall at Ever Grande City, clear Victory Road, and enter the Pokémon League. Defeat the Elite Four (Sidney, Phoebe, Glacia, Drake) and Steven/Wallace (Champion) to clear the region! (Obedience cap: Level 58 / Post-game Level 100).' }
        ]
    },
    sinnoh: {
        name: 'Sinnoh (Platinum)',
        caps: [
            { badges: '0 Badges', cap: 'Lv 20' },
            { badges: '1 Badge', cap: 'Lv 27' },
            { badges: '2 Badges', cap: 'Lv 29' },
            { badges: '3 Badges', cap: 'Lv 34' },
            { badges: '4 Badges', cap: 'Lv 37' },
            { badges: '5 Badges', cap: 'Lv 43' },
            { badges: '6 Badges', cap: 'Lv 46' },
            { badges: '7 Badges', cap: 'Lv 52' },
            { badges: '8 Badges', cap: 'Lv 60' },
            { badges: 'Elite Four', cap: 'Lv 62' },
            { badges: 'Post-Game Champion', cap: 'Lv 100' }
        ],
        milestones: [
            { text: 'Defeated Roark (Coal Badge)', level: 27, hm: 'Rock Smash' },
            { text: 'Defeated Gardenia (Forest Badge)', level: 29, hm: 'Cut' },
            { text: 'Defeated Fantina (Relic Badge)', level: 34, hm: 'Fly' },
            { text: 'Defeated Maylene (Cobble Badge)', level: 37, hm: 'Strength' },
            { text: 'Defeated Crasher Wake (Fen Badge)', level: 43, hm: 'Defog' },
            { text: 'Defeated Byron (Mine Badge)', level: 46, hm: 'Surf' },
            { text: 'Defeated Candice (Icicle Badge)', level: 52, hm: 'Rock Climb' },
            { text: 'Defeated Volkner (Beacon Badge)', level: 60, hm: 'Waterfall' }
        ],
        team: {
            title: 'Sinnoh Easy-Clear Team Recommendation',
            pokemons: [
                { name: 'Infernape', role: 'Mixed Sweeper', moves: 'Flamethrower, Close Combat, Grass Knot, U-turn', loc: 'Starter selection' },
                { name: 'Staraptor', role: 'Physical Sweeper', moves: 'Brave Bird, Close Combat, Return, U-turn', loc: 'Catch Starly at Route 201' },
                { name: 'Garchomp', role: 'Dragon Sweeper', moves: 'Earthquake, Outrage, Rock Slide, Swords Dance', loc: 'Catch Gible in Wayward Cave' }
            ]
        },
        storyline: [
            { step: '1. Twinleaf to Oreburgh', desc: 'Start in Twinleaf Town. Choose starter at Lake Verity. Get your Pokédex in Jubilife City. Travel east through Oreburgh Gate to Oreburgh City. Defeat Roark (Coal Badge, cap level 27).' },
            { step: '2. Valley Windworks & Eterna Forest', desc: 'Go north to Jubilife and then to Floaroma Town. Clean Team Galactic out of Valley Windworks. Traverse Eterna Forest and arrive in Eterna City.' },
            { step: '3. Eterna Gym & Bicycle', desc: 'Defeat Eterna Gym Leader Gardenia (Forest Badge, cap level 29). Clear Eterna Galactic Building, rescue the Cycle Shop owner, and claim your Bicycle. Teach HM01 Cut.' },
            { step: '4. Hearthome Gym & Fantina', desc: 'Ride down Cycling Road, travel through Mt. Coronet to Hearthome City. Defeat Gym Leader Fantina (Relic Badge, cap level 34) using Ghost/Dark moves.' },
            { step: '5. Solaceon Town & Veilstone Gym', desc: 'Head east through Solaceon Town to Veilstone City. Challenge and defeat Gym Leader Maylene (Cobble Badge, cap level 37) using Flying/Psychic moves.' },
            { step: '6. Pastoria Gym & Crasher Wake', desc: 'Head south along the coast to Pastoria City. Defeat Crasher Wake (Fen Badge, cap level 43). Chase the Galactic Grunt to Valor Lakefront.' },
            { step: '7. Celestic Town & Strength', desc: 'Go north from Solaceon Town to Celestic Town. Defeat the Galactic Grunt in the ruins and retrieve HM04 Strength from Cynthia\'s grandmother.' },
            { step: '8. Canalave Gym & Byron', desc: 'Travel west to Canalave City. Defeat Gym Leader Byron (Mine Badge, cap level 46) using Fire/Fighting/Ground moves. Visit Iron Island if you want a Riolu Egg.' },
            { step: '9. Commander Battles & Snowpoint Gym', desc: 'Visit Lakes Valor, Verity, and Acuity to fight off Team Galactic Commanders Saturn, Mars, and Jupiter. Navigate Route 216/217 to Snowpoint City and defeat Candice (Icicle Badge, cap level 52).' },
            { step: '10. Galactic HQ & Spear Pillar', desc: 'Clear Galactic HQ in Veilstone City (defeat Cyrus). Scale Mt. Coronet to the Spear Pillar. Defeat Team Galactic commanders and stop Cyrus in the Distortion World/Spear Pillar.' },
            { step: '11. Sunyshore Gym & Volkner', desc: 'Reach Sunyshore City. Defeat Gym Leader Volkner (Beacon Badge, cap level 60) using Ground type moves.' },
            { step: '12. Victory Road & League', desc: 'Surf north to Victory Road. Clear the cave and challenge the Sinnoh Elite Four (Aaron, Bertha, Flint, Lucian) and Champion Cynthia (cap level 62 / Post-game Level 100).' }
        ]
    },
    unova: {
        name: 'Unova (Black/White)',
        caps: [
            { badges: '0 Badges', cap: 'Lv 20' },
            { badges: '1 Badge', cap: 'Lv 20' },
            { badges: '2 Badges', cap: 'Lv 24' },
            { badges: '3 Badges', cap: 'Lv 27' },
            { badges: '4 Badges', cap: 'Lv 31' },
            { badges: '5 Badges', cap: 'Lv 35' },
            { badges: '6 Badges', cap: 'Lv 38' },
            { badges: '7 Badges', cap: 'Lv 42' },
            { badges: '8 Badges', cap: 'Lv 45' },
            { badges: 'Elite Four', cap: 'Lv 56' },
            { badges: 'Post-Game Champion', cap: 'Lv 100' }
        ],
        milestones: [
            { text: 'Defeated Trio (Trio Badge)', level: 20, hm: 'Cut' },
            { text: 'Defeated Lenora (Basic Badge)', level: 24, hm: 'None' },
            { text: 'Defeated Burgh (Insect Badge)', level: 27, hm: 'None' },
            { text: 'Defeated Elesa (Bolt Badge)', level: 31, hm: 'Strength' },
            { text: 'Defeated Clay (Quake Badge)', level: 35, hm: 'Fly' },
            { text: 'Defeated Skyla (Jet Badge)', level: 38, hm: 'Surf' },
            { text: 'Defeated Brycen (Freeze Badge)', level: 42, hm: 'Waterfall' },
            { text: 'Defeated Iris/Drayden (Legend Badge)', level: 45, hm: 'Dive' }
        ],
        team: {
            title: 'Unova Easy-Clear Team Recommendation',
            pokemons: [
                { name: 'Samurott', role: 'Mixed Attacker', moves: 'Surf, Aqua Jet, Ice Beam, Megahorn', loc: 'Starter selection' },
                { name: 'Krookodile', role: 'Moxie Sweeper', moves: 'Earthquake, Crunch, Rock Slide, Brick Break', loc: 'Catch Sandile in Desert Resort' },
                { name: 'Sigilyph', role: 'Special Sweeper', moves: 'Air Slash, Psychic, Ice Beam, Roost', loc: 'Catch in Desert Resort' }
            ]
        },
        storyline: [
            { step: '1. Nuvema to Striaton', desc: 'Choose your starter in Nuvema Town. Walk to Accumula Town, watch Ghetsis\' Team Plasma speech. Reach Striaton City. Defeat Cilan/Chili/Cress (Trio Badge, cap level 20).' },
            { step: '2. Dreamyard & Lenora', desc: 'Obtain HM01 Cut. Go east to the Dreamyard, battle Team Plasma, and get a free elemental monkey. Go west to Nacrene City and defeat Lenora in the Museum (Basic Badge, cap level 24).' },
            { step: '3. Pinwheel Forest & Burgh', desc: 'Chase Team Plasma through Pinwheel Forest. Walk across Skyarrow Bridge to Castelia City. Defeat Gym Leader Burgh (Insect Badge, cap level 27).' },
            { step: '4. Desert Resort & Elesa', desc: 'Walk north to Desert Resort (buy a Sandile here for Moxie Krookodile!). Reach Nimbasa City and defeat Elesa (Bolt Badge, cap level 31).' },
            { step: '5. Cold Storage & Clay', desc: 'Cross the Driftveil Drawbridge. In Driftveil City, defeat Team Plasma at the Cold Storage, then defeat Clay (Quake Badge, cap level 35).' },
            { step: '6. Chargestone Cave & Skyla', desc: 'Clear Chargestone Cave. Reach Mistralton City and scale Celestial Tower to ring the bell. Defeat Skyla (Jet Badge, cap level 38).' },
            { step: '7. Twist Mountain & Brycen', desc: 'Go through Twist Mountain to Icirrus City. Defeat Brycen (Freeze Badge, cap level 42). Clear the Dragonspiral Tower.' },
            { step: '8. Relic Castle & Opelucid', desc: 'Navigate the sand in Relic Castle, speak to Alder. Travel to Opelucid City and defeat Iris/Drayden (Legend Badge, cap level 45).' },
            { step: '9. Victory Road & N\'s Castle', desc: 'Navigate Victory Road. Defeat the Elite Four (Shauntal, Grimsley, Caitlin, Marshal). Defeat N and Ghetsis in N\'s Castle to clear the main story! (Obedience cap: Level 56 / Post-game Level 100).' }
        ]
    },
    johto: {
        name: 'Johto (HeartGold/SoulSilver)',
        caps: [
            { badges: '0 Badges', cap: 'Lv 20' },
            { badges: '1 Badge', cap: 'Lv 24' },
            { badges: '2 Badges', cap: 'Lv 29' },
            { badges: '3 Badges', cap: 'Lv 32' },
            { badges: '4 Badges', cap: 'Lv 37' },
            { badges: '5 Badges', cap: 'Lv 39' },
            { badges: '6 Badges', cap: 'Lv 41' },
            { badges: '7 Badges', cap: 'Lv 46' },
            { badges: '8 Badges', cap: 'Lv 48' },
            { badges: 'Ho-Oh Defeated', cap: 'Lv 55' },
            { badges: 'Elite Four', cap: 'Lv 60' },
            { badges: 'Post-Game Champion', cap: 'Lv 100' }
        ],
        milestones: [
            { text: 'Defeated Falkner (Zephyr Badge)', level: 24, hm: 'Flash' },
            { text: 'Defeated Bugsy (Hive Badge)', level: 29, hm: 'Cut' },
            { text: 'Defeated Whitney (Plain Badge)', level: 32, hm: 'Rock Smash' },
            { text: 'Defeated Morty (Fog Badge)', level: 37, hm: 'Surf' },
            { text: 'Defeated Chuck (Storm Badge)', level: 39, hm: 'Fly' },
            { text: 'Defeated Jasmine (Mineral Badge)', level: 41, hm: 'Strength' },
            { text: 'Defeated Pryce (Glacier Badge)', level: 46, hm: 'Whirlpool' },
            { text: 'Defeated Clair (Rising Badge)', level: 48, hm: 'Waterfall' }
        ],
        team: {
            title: 'Johto Easy-Clear Team Recommendation',
            pokemons: [
                { name: 'Typhlosion', role: 'Special Sweeper', moves: 'Eruption, Flamethrower, Extrasensory, Hidden Power', loc: 'Starter selection' },
                { name: 'Ampharos', role: 'Special Attacker', moves: 'Thunderbolt, Power Gem, Signal Beam, Cotton Guard', loc: 'Catch Mareep at Route 32' },
                { name: 'Heracross', role: 'Physical Attacker', moves: 'Close Combat, Megahorn, Rock Tomb, Swords Dance', loc: 'Headbutt trees in Azalea Town' }
            ]
        },
        storyline: [
            { step: '1. New Bark to Violet City', desc: 'Select starter in New Bark Town. Visit Mr. Pokémon to get the Mystery Egg, meet your Rival, and return the egg to Professor Elm. Reach Violet City, clear Sprout Tower, and defeat Falkner (Zephyr Badge, cap level 24).' },
            { step: '2. Union Cave & Slowpoke Well', desc: 'Travel south through Union Cave to Azalea Town. Defeat Team Rocket grunts in the Slowpoke Well. Defeat Bugsy (Hive Badge, cap level 29).' },
            { step: '3. Ilex Forest & Whitney', desc: 'Teach HM01 Cut. Navigate Ilex Forest (catch Farfetch\'d). Reach Goldenrod City. Defeat Whitney (Plain Badge, cap level 32). (Buy a female Geodude or Machop to clear her Miltank easily!).' },
            { step: '4. Burned Tower & Morty', desc: 'Go north to Ecruteak City. Wake up the legendary beasts in the Burned Tower. Defeat Morty (Fog Badge, cap level 37).' },
            { step: '5. Cianwood Island & Chuck', desc: 'Go to Olivine City, see the sick Ampharos in the lighthouse. Surf west to Cianwood City. Get the Secret Medicine, and defeat Chuck (Storm Badge, cap level 39).' },
            { step: '6. Lighthouse Medicine & Jasmine', desc: 'Return to Olivine City. Give the medicine to the lighthouse Ampharos. Defeat Gym Leader Jasmine (Mineral Badge, cap level 41).' },
            { step: '7. Lake of Rage & Pryce', desc: 'Go north through Mahogany Town to the Lake of Rage. Catch/defeat the Red Gyarados. Clear the Rocket Hideout in Mahogany Town with Lance. Defeat Pryce (Glacier Badge, cap level 46).' },
            { step: '8. Radio Tower & Clair', desc: 'Clean out Team Rocket from the Goldenrod Radio Tower. Walk through Ice Path to Blackthorn City. Defeat Clair (Rising Badge, cap level 48). Solve the Dragon\'s Den quiz to get the Rising Badge.' },
            { step: '9. Victory Road & Indigo Plateau', desc: 'Return to New Bark Town, surf east to Kanto. Traverse Victory Road to the Indigo Plateau. Defeat the Johto Elite Four and Champion Lance (cap level 60 / Post-game Level 100).' }
        ]
    }
};

let activeStoryRegion = 'kanto';
let completedStoryBadges = {};

function loadStoryProgression() {
    try {
        const stored = localStorage.getItem('completed_story_badges');
        if (stored) completedStoryBadges = JSON.parse(stored);
        else completedStoryBadges = {};
    } catch(e) {
        completedStoryBadges = {};
    }
}

function saveStoryProgression() {
    localStorage.setItem('completed_story_badges', JSON.stringify(completedStoryBadges));
}

function toggleStoryBadge(regionName, badgeIdx) {
    const key = `${regionName}_${badgeIdx}`;
    completedStoryBadges[key] = !completedStoryBadges[key];
    saveStoryProgression();
    renderStoryTab();
}

function switchStoryRegion(regionName) {
    activeStoryRegion = regionName;
    const buttons = document.querySelectorAll('#story-tab .ev-tab-btn');
    buttons.forEach(btn => {
        if (btn.id === `story-btn-${regionName}`) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    renderStoryTab();
}

function renderStoryTab() {
    const data = REGIONAL_STORY_DB[activeStoryRegion];
    const milestonesList = document.getElementById('story-milestones-list');
    if (!milestonesList) return;
    milestonesList.innerHTML = '';

    let maxObedienceLevel = 20;
    let completedCount = 0;

    data.milestones.forEach((m, idx) => {
        const key = `${activeStoryRegion}_${idx}`;
        const isChecked = !!completedStoryBadges[key];
        
        if (isChecked) {
            completedCount++;
            if (m.level > maxObedienceLevel) {
                maxObedienceLevel = m.level;
            }
        }

        const div = document.createElement('div');
        div.className = `iv-checkbox-card ${isChecked ? 'active' : ''}`;
        div.style.padding = '0.55rem 0.75rem';
        div.style.cursor = 'pointer';
        div.style.display = 'flex';
        div.style.alignItems = 'center';
        div.setAttribute('onclick', `toggleStoryBadge('${activeStoryRegion}', ${idx})`);

        div.innerHTML = `
            <input type="checkbox" ${isChecked ? 'checked' : ''} style="pointer-events:none; margin-right:0.5rem;">
            <span style="font-size:0.8rem; font-weight:600; color:#fff;">${m.text}</span>
        `;
        milestonesList.appendChild(div);
    });

    const capsTbody = document.getElementById('story-caps-table-body');
    if (capsTbody) {
        capsTbody.innerHTML = '';
        data.caps.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${c.badges}</strong></td>
                <td><span class="badge-yield">${c.cap}</span></td>
            `;
            capsTbody.appendChild(tr);
        });
    }

    const canDoUl = document.getElementById('story-can-do-list');
    const cannotDoUl = document.getElementById('story-cannot-do-list');
    if (canDoUl && cannotDoUl) {
        canDoUl.innerHTML = '';
        cannotDoUl.innerHTML = '';

        const liLevel = document.createElement('li');
        liLevel.innerHTML = `Pokémon up to <strong>Level ${maxObedienceLevel}</strong> will obey you in battle.`;
        canDoUl.appendChild(liLevel);

        const liLevelWarn = document.createElement('li');
        liLevelWarn.innerHTML = `Pokémon above <strong>Level ${maxObedienceLevel}</strong> will disobey or hurt themselves.`;
        cannotDoUl.appendChild(liLevelWarn);

        const usableHms = [];
        const lockedHms = [];

        data.milestones.forEach((m, idx) => {
            if (m.hm !== 'None') {
                const key = `${activeStoryRegion}_${idx}`;
                const isChecked = !!completedStoryBadges[key];
                if (isChecked) {
                    usableHms.push(m.hm);
                } else {
                    lockedHms.push(m.hm);
                }
            }
        });

        const liHm = document.createElement('li');
        if (usableHms.length > 0) {
            liHm.innerHTML = `Use HMs outside of battle: <strong>${usableHms.join(', ')}</strong>.`;
        } else {
            liHm.innerHTML = `No HMs usable outside of battle yet.`;
        }
        canDoUl.appendChild(liHm);

        const liHmLocked = document.createElement('li');
        if (lockedHms.length > 0) {
            liHmLocked.innerHTML = `Cannot use these HMs outside of battle yet: <strong>${lockedHms.join(', ')}</strong>.`;
        } else {
            liHmLocked.innerHTML = `All HM locks for this region have been cleared!`;
        }
        cannotDoUl.appendChild(liHmLocked);

        const liProgress = document.createElement('li');
        if (completedCount === 0) {
            liProgress.innerHTML = `Begin by heading to the 1st Gym Leader and defeating them!`;
            cannotDoUl.appendChild(liProgress);
        } else if (completedCount < data.milestones.length) {
            const nextMilestone = data.milestones.find((m, idx) => !completedStoryBadges[`${activeStoryRegion}_${idx}`]);
            liProgress.innerHTML = `Next Target: <strong>${nextMilestone.text}</strong>.`;
            canDoUl.appendChild(liProgress);
        } else {
            liProgress.innerHTML = `Story cleared! You can now access Level 100 caps in this region.`;
            canDoUl.appendChild(liProgress);
        }
    }

    const teamCard = document.getElementById('story-team-recommendation');
    if (teamCard) {
        teamCard.innerHTML = '';
        let teamHtml = `
            <h3 style="font-size:0.85rem; color:var(--primary); margin-bottom:0.75rem; font-family:'Press Start 2P', monospace; text-align:left;">Recommended Team</h3>
            <div style="display:flex; flex-direction:column; gap:0.6rem;">
        `;
        data.team.pokemons.forEach(pkmn => {
            teamHtml += `
                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.04); padding:0.6rem; border-radius:8px; font-size:0.8rem; text-align:left;">
                    <strong style="color:#fff">${pkmn.name}</strong> - <span style="color:var(--text-muted); font-size:0.7rem;">${pkmn.role}</span><br>
                    • Moveset: <span style="color:var(--accent-green); font-size:0.75rem;">${pkmn.moves}</span><br>
                    • Location: <span style="font-size:0.7rem; color:var(--text-muted);">${pkmn.loc}</span>
                </div>
            `;
        });
        teamHtml += `</div>`;
        teamCard.innerHTML = teamHtml;
    }

    // 5. Render Step-by-Step Story Walkthrough Guide
    const walkthroughContainer = document.getElementById('story-walkthrough-container');
    const walkthroughTitle = document.getElementById('story-walkthrough-title');
    if (walkthroughContainer && data.storyline) {
        if (walkthroughTitle) {
            walkthroughTitle.innerText = `${data.name} - Step-by-Step Story Walkthrough`;
        }
        walkthroughContainer.innerHTML = '';
        
        let html = '<div style="display:flex; flex-direction:column; gap:0.85rem;">';
        data.storyline.forEach(item => {
            const regionName = activeStoryRegion.charAt(0).toUpperCase() + activeStoryRegion.slice(1);
            const videoQuery = `PokeMMO ${regionName} Walkthrough ${item.step}`;
            const videoUrl = item.video || `https://www.youtube.com/results?search_query=${encodeURIComponent(videoQuery)}`;
            
            html += `
                <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.03); padding:0.85rem; border-radius:8px; display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
                    <div style="flex:1;">
                        <strong style="color:var(--primary); font-size:0.85rem; display:block; margin-bottom:0.3rem;">${item.step}</strong>
                        <p style="font-size:0.8rem; color:var(--text-muted); line-height:1.45; margin:0;">${item.desc}</p>
                    </div>
                    <a href="${videoUrl}" target="_blank" class="yt-guide-btn" style="font-family:'Press Start 2P', monospace; font-size:0.45rem; padding:0.4rem 0.65rem; border-radius:4px; text-decoration:none; display:flex; align-items:center; gap:0.3rem; white-space:nowrap; margin-top:0.15rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); color:var(--text-muted); transition: all 0.2s ease;">
                        📺 Video
                    </a>
                </div>
            `;
        });
        html += '</div>';
        walkthroughContainer.innerHTML = html;
    }
}

// ==========================================
// 15. CLOUD DATABASE SYNC ENGINE (LOCAL REST API)
// ==========================================
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? '' 
    : 'https://privatesite-production.up.railway.app';

let syncTimeout = null;

// Returns the storage that holds session credentials
function getAuthStorage() {
    if (localStorage.getItem('sync_user_id')) return localStorage;
    if (sessionStorage.getItem('sync_user_id')) return sessionStorage;
    return localStorage; // Default fallback to save state
}

function getSyncUserId() {
    return localStorage.getItem('sync_user_id') || sessionStorage.getItem('sync_user_id');
}

function getSyncUserEmail() {
    return localStorage.getItem('sync_user_email') || sessionStorage.getItem('sync_user_email');
}

function initSupabase() {
    checkAuthState();
}

function checkAuthState() {
    const userId = getSyncUserId();
    const email = getSyncUserEmail();

    if (userId && email) {
        showLoggedInUI(email);
        if (!sessionStorage.getItem('initial_sync_done')) {
            downloadCloudData(userId);
            sessionStorage.setItem('initial_sync_done', 'true');
        }
    } else {
        showLoggedOutUI();
    }
}

function toggleAuthModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) {
        modal.style.display = modal.style.display === 'none' ? 'flex' : 'none';
    }
}

function toggleConfigSection() {
    const configSection = document.getElementById('auth-config-section');
    if (configSection) {
        configSection.style.display = configSection.style.display === 'none' ? 'block' : 'none';
    }
}

function showLoggedInUI(email) {
    const loginSection = document.getElementById('auth-login-section');
    const statusSection = document.getElementById('auth-status-section');
    const emailDisplay = document.getElementById('auth-user-email');
    
    if (loginSection) loginSection.style.display = 'none';
    if (statusSection) statusSection.style.display = 'block';
    if (emailDisplay) emailDisplay.innerText = email;
    updateSyncButtonUI(true, '☁️ Connected');
}

function showLoggedOutUI() {
    const loginSection = document.getElementById('auth-login-section');
    const statusSection = document.getElementById('auth-status-section');
    
    if (loginSection) loginSection.style.display = 'block';
    if (statusSection) statusSection.style.display = 'none';
    updateSyncButtonUI(false, '👤 Sync Offline');
}

function updateSyncButtonUI(connected, text) {
    const btn = document.getElementById('user-profile-btn');
    if (btn) {
        btn.innerText = text;
        if (connected) {
            btn.style.borderColor = 'var(--accent-green)';
            btn.style.color = 'var(--accent-green)';
        } else {
            btn.style.borderColor = 'rgba(255,255,255,0.08)';
            btn.style.color = 'var(--text-muted)';
        }
    }
}

async function handleLogin() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();

    if (!email || !password) {
        alert('Please fill in both fields.');
        return;
    }

    try {
        setSyncBadgeStatus('Logging in...', '#ffde00');
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();

        if (!result.success) throw new Error(result.error || 'Login failed');

        const rememberMe = document.getElementById('auth-remember-me');
        const store = (rememberMe && rememberMe.checked) ? localStorage : sessionStorage;
        
        // Clear the opposite storage to avoid persistence conflicts
        if (store === localStorage) {
            sessionStorage.removeItem('sync_user_id');
            sessionStorage.removeItem('sync_user_email');
        } else {
            localStorage.removeItem('sync_user_id');
            localStorage.removeItem('sync_user_email');
        }

        store.setItem('sync_user_id', result.userId);
        store.setItem('sync_user_email', result.email);
        
        showLoggedInUI(result.email);
        setSyncBadgeStatus('Synced', '#34d399');
        await downloadCloudData(result.userId);
    } catch (e) {
        alert('Login failed: ' + e.message);
        setSyncBadgeStatus('Failed', 'var(--accent-red)');
    }
}

async function handleSignup() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value.trim();

    if (!email || !password) {
        alert('Please fill in both fields.');
        return;
    }

    try {
        setSyncBadgeStatus('Signing up...', '#ffde00');
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();

        if (!result.success) throw new Error(result.error || 'Signup failed');

        alert('Signup successful! You can now log in.');
        setSyncBadgeStatus('Registered', '#34d399');
    } catch (e) {
        alert('Signup failed: ' + e.message);
        setSyncBadgeStatus('Failed', 'var(--accent-red)');
    }
}

function handleLogout() {
    localStorage.removeItem('sync_user_id');
    localStorage.removeItem('sync_user_email');
    sessionStorage.removeItem('sync_user_id');
    sessionStorage.removeItem('sync_user_email');
    sessionStorage.removeItem('initial_sync_done');
    showLoggedOutUI();
    alert('Logged out successfully.');
}

async function forceSyncData() {
    const userId = getSyncUserId();
    if (userId) {
        setSyncBadgeStatus('Syncing...', '#ffde00');
        await uploadCloudData(userId);
    } else {
        alert('You must be logged in to sync.');
    }
}

function scheduleCloudSync() {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(async () => {
        const userId = getSyncUserId();
        if (userId) {
            setSyncBadgeStatus('Saving...', '#ffde00');
            await uploadCloudData(userId);
        }
    }, 2000);
}

function setSyncBadgeStatus(text, color) {
    const badge = document.getElementById('sync-status-badge');
    if (badge) {
        badge.innerText = text;
        badge.style.color = color;
    }
}

function getLocalDataPayload() {
    return {
        prices: localStorage.getItem('pokemmo_prices'),
        gyms: localStorage.getItem('pokemmo_gyms'),
        acquired_nodes: localStorage.getItem('pokemmo_acquired_nodes'),
        ledger: localStorage.getItem('pokemmo_ledger'),
        garden: localStorage.getItem('pokemmo_garden'),
        hunts: localStorage.getItem('pokemmo_hunts'),
        chores: localStorage.getItem('checked_daily_chores'),
        badges: localStorage.getItem('completed_story_badges')
    };
}

async function uploadCloudData(userId) {
    try {
        const payload = getLocalDataPayload();
        const response = await fetch(`${API_BASE_URL}/api/sync/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, data: payload })
        });
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        setSyncBadgeStatus('Synced', '#34d399');
    } catch (e) {
        console.error('Cloud upload failed:', e);
        setSyncBadgeStatus('Sync Failed', 'var(--accent-red)');
    }
}

async function downloadCloudData(userId) {
    try {
        setSyncBadgeStatus('Downloading...', '#ffde00');
        const response = await fetch(`${API_BASE_URL}/api/sync/download?userId=${userId}`);
        const result = await response.json();

        if (!result.success) throw new Error(result.error);

        if (result.data) {
            const cloudPayload = result.data;
            let changesMade = false;

            const keys = ['prices', 'gyms', 'acquired_nodes', 'ledger', 'garden', 'hunts', 'chores', 'badges'];
            const localKeyMap = {
                prices: 'pokemmo_prices',
                gyms: 'pokemmo_gyms',
                acquired_nodes: 'pokemmo_acquired_nodes',
                ledger: 'pokemmo_ledger',
                garden: 'pokemmo_garden',
                hunts: 'pokemmo_hunts',
                chores: 'checked_daily_chores',
                badges: 'completed_story_badges'
            };

            window.isDownloadingCloudState = true;

            keys.forEach(k => {
                const cloudVal = cloudPayload[k];
                const localKey = localKeyMap[k];
                if (cloudVal && cloudVal !== localStorage.getItem(localKey)) {
                    localStorage.setItem(localKey, cloudVal);
                    changesMade = true;
                }
            });

            window.isDownloadingCloudState = false;

            if (changesMade) {
                loadFromStorageAndReInit();
            }
        }
        setSyncBadgeStatus('Synced', '#34d399');
    } catch (e) {
        console.error('Cloud download failed:', e);
        setSyncBadgeStatus('Download Failed', 'var(--accent-red)');
    }
}

function loadFromStorageAndReInit() {
    try {
        const cachedPrices = localStorage.getItem('pokemmo_prices');
        if (cachedPrices) prices = JSON.parse(cachedPrices);

        const cachedGyms = localStorage.getItem('pokemmo_gyms');
        if (cachedGyms) gymReruns = JSON.parse(cachedGyms);

        const cachedLedger = localStorage.getItem('pokemmo_ledger');
        if (cachedLedger) ledgerRecords = JSON.parse(cachedLedger);

        const cachedGarden = localStorage.getItem('pokemmo_garden');
        if (cachedGarden) gardenCrops = JSON.parse(cachedGarden);

        const cachedHunts = localStorage.getItem('pokemmo_hunts');
        if (cachedHunts) shinyHunts = JSON.parse(cachedHunts);

        const cachedChores = localStorage.getItem('checked_daily_chores');
        if (cachedChores) checkedDailyChores = JSON.parse(cachedChores);

        const cachedStory = localStorage.getItem('completed_story_badges');
        if (cachedStory) completedStoryBadges = JSON.parse(cachedStory);

        calculateAndRenderBreeding();
        calculateCatchRate();
        runSimStep();
        renderMoneyTab();
        renderStoryTab();
        renderGymList();
        renderLedgerTable();
        renderGardenGrid();
        renderShinyHuntsList();
        if (typeof updateStats === 'function') updateStats();
        if (typeof updateGymStats === 'function') updateGymStats();
    } catch (e) {
        console.error('Failed to parse downloaded cloud state:', e);
    }
}

const originalSetItem = localStorage.setItem;
localStorage.setItem = function(key, value) {
    originalSetItem.apply(this, arguments);
    if (!window.isDownloadingCloudState) {
        if (key.startsWith('pokemmo_') || key === 'completed_story_badges' || key === 'checked_daily_chores') {
            scheduleCloudSync();
        }
    }
};

// ==========================================
// 16. TYPE MATCHUP CALCULATOR DATA & LOGIC
// ==========================================
const TYPE_CHART = {
  'Normal':   { 'Normal': 1, 'Fire': 1, 'Water': 1, 'Electric': 1, 'Grass': 1, 'Ice': 1, 'Fighting': 1, 'Poison': 1, 'Ground': 1, 'Flying': 1, 'Psychic': 1, 'Bug': 1, 'Rock': 0.5, 'Ghost': 0, 'Dragon': 1, 'Dark': 1, 'Steel': 0.5 },
  'Fire':     { 'Normal': 1, 'Fire': 0.5, 'Water': 0.5, 'Electric': 1, 'Grass': 2, 'Ice': 2, 'Fighting': 1, 'Poison': 1, 'Ground': 1, 'Flying': 1, 'Psychic': 1, 'Bug': 2, 'Rock': 0.5, 'Ghost': 1, 'Dragon': 0.5, 'Dark': 1, 'Steel': 2 },
  'Water':    { 'Normal': 1, 'Fire': 2, 'Water': 0.5, 'Electric': 1, 'Grass': 0.5, 'Ice': 1, 'Fighting': 1, 'Poison': 1, 'Ground': 2, 'Flying': 1, 'Psychic': 1, 'Bug': 1, 'Rock': 2, 'Ghost': 1, 'Dragon': 0.5, 'Dark': 1, 'Steel': 1 },
  'Electric': { 'Normal': 1, 'Fire': 1, 'Water': 2, 'Electric': 0.5, 'Grass': 0.5, 'Ice': 1, 'Fighting': 1, 'Poison': 1, 'Ground': 0, 'Flying': 2, 'Psychic': 1, 'Bug': 1, 'Rock': 1, 'Ghost': 1, 'Dragon': 0.5, 'Dark': 1, 'Steel': 1 },
  'Grass':    { 'Normal': 1, 'Fire': 0.5, 'Water': 2, 'Electric': 1, 'Grass': 0.5, 'Ice': 1, 'Fighting': 1, 'Poison': 0.5, 'Ground': 2, 'Flying': 0.5, 'Psychic': 1, 'Bug': 0.5, 'Rock': 2, 'Ghost': 1, 'Dragon': 0.5, 'Dark': 1, 'Steel': 0.5 },
  'Ice':      { 'Normal': 1, 'Fire': 0.5, 'Water': 0.5, 'Electric': 1, 'Grass': 2, 'Ice': 0.5, 'Fighting': 1, 'Poison': 1, 'Ground': 2, 'Flying': 2, 'Psychic': 1, 'Bug': 1, 'Rock': 1, 'Ghost': 1, 'Dragon': 2, 'Dark': 1, 'Steel': 0.5 },
  'Fighting': { 'Normal': 2, 'Fire': 1, 'Water': 1, 'Electric': 1, 'Grass': 1, 'Ice': 2, 'Fighting': 1, 'Poison': 0.5, 'Ground': 1, 'Flying': 0.5, 'Psychic': 0.5, 'Bug': 0.5, 'Rock': 2, 'Ghost': 0, 'Dragon': 1, 'Dark': 2, 'Steel': 2 },
  'Poison':   { 'Normal': 1, 'Fire': 1, 'Water': 1, 'Electric': 1, 'Grass': 2, 'Ice': 1, 'Fighting': 1, 'Poison': 0.5, 'Ground': 0.5, 'Flying': 1, 'Psychic': 1, 'Bug': 1, 'Rock': 0.5, 'Ghost': 0.5, 'Dragon': 1, 'Dark': 1, 'Steel': 0 },
  'Ground':   { 'Normal': 1, 'Fire': 2, 'Water': 1, 'Electric': 2, 'Grass': 0.5, 'Ice': 1, 'Fighting': 1, 'Poison': 2, 'Ground': 1, 'Flying': 0, 'Psychic': 1, 'Bug': 0.5, 'Rock': 2, 'Ghost': 1, 'Dragon': 1, 'Dark': 1, 'Steel': 2 },
  'Flying':   { 'Normal': 1, 'Fire': 1, 'Water': 1, 'Electric': 0.5, 'Grass': 2, 'Ice': 1, 'Fighting': 2, 'Poison': 1, 'Ground': 1, 'Flying': 1, 'Psychic': 1, 'Bug': 2, 'Rock': 0.5, 'Ghost': 1, 'Dragon': 1, 'Dark': 1, 'Steel': 0.5 },
  'Psychic':  { 'Normal': 1, 'Fire': 1, 'Water': 1, 'Electric': 1, 'Grass': 1, 'Ice': 1, 'Fighting': 2, 'Poison': 2, 'Ground': 1, 'Flying': 1, 'Psychic': 0.5, 'Bug': 1, 'Rock': 1, 'Ghost': 1, 'Dragon': 1, 'Dark': 0, 'Steel': 0.5 },
  'Bug':      { 'Normal': 1, 'Fire': 0.5, 'Water': 1, 'Electric': 1, 'Grass': 2, 'Ice': 1, 'Fighting': 0.5, 'Poison': 0.5, 'Ground': 1, 'Flying': 0.5, 'Psychic': 2, 'Bug': 1, 'Rock': 1, 'Ghost': 0.5, 'Dragon': 1, 'Dark': 2, 'Steel': 0.5 },
  'Rock':     { 'Normal': 1, 'Fire': 2, 'Water': 1, 'Electric': 1, 'Grass': 1, 'Ice': 2, 'Fighting': 0.5, 'Poison': 1, 'Ground': 0.5, 'Flying': 2, 'Psychic': 1, 'Bug': 2, 'Rock': 1, 'Ghost': 1, 'Dragon': 1, 'Dark': 1, 'Steel': 0.5 },
  'Ghost':    { 'Normal': 0, 'Fire': 1, 'Water': 1, 'Electric': 1, 'Grass': 1, 'Ice': 1, 'Fighting': 1, 'Poison': 1, 'Ground': 1, 'Flying': 1, 'Psychic': 2, 'Bug': 1, 'Rock': 1, 'Ghost': 2, 'Dragon': 1, 'Dark': 0.5, 'Steel': 0.5 },
  'Dragon':   { 'Normal': 1, 'Fire': 1, 'Water': 1, 'Electric': 1, 'Grass': 1, 'Ice': 1, 'Fighting': 1, 'Poison': 1, 'Ground': 1, 'Flying': 1, 'Psychic': 1, 'Bug': 1, 'Rock': 1, 'Ghost': 1, 'Dragon': 2, 'Dark': 1, 'Steel': 0.5 },
  'Dark':     { 'Normal': 1, 'Fire': 1, 'Water': 1, 'Electric': 1, 'Grass': 1, 'Ice': 1, 'Fighting': 0.5, 'Poison': 1, 'Ground': 1, 'Flying': 1, 'Psychic': 2, 'Bug': 1, 'Rock': 1, 'Ghost': 2, 'Dragon': 1, 'Dark': 0.5, 'Steel': 0.5 },
  'Steel':    { 'Normal': 1, 'Fire': 0.5, 'Water': 0.5, 'Electric': 0.5, 'Grass': 1, 'Ice': 2, 'Fighting': 1, 'Poison': 1, 'Ground': 1, 'Flying': 1, 'Psychic': 1, 'Bug': 1, 'Rock': 2, 'Ghost': 1, 'Dragon': 1, 'Dark': 1, 'Steel': 0.5 },
};

function initTypeCalculator() {
    const primarySelect = document.getElementById('type-calc-primary');
    const secondarySelect = document.getElementById('type-calc-secondary');
    if (!primarySelect || !secondarySelect) return;

    primarySelect.innerHTML = '';
    secondarySelect.innerHTML = '<option value="None">None</option>';

    Object.keys(TYPE_CHART).sort().forEach(type => {
        primarySelect.innerHTML += `<option value="${type}">${type}</option>`;
        secondarySelect.innerHTML += `<option value="${type}">${type}</option>`;
    });

    primarySelect.value = 'Normal';
    secondarySelect.value = 'None';
    runTypeMatchupCalculations();
}

function runTypeMatchupCalculations() {
    const type1 = document.getElementById('type-calc-primary').value;
    const type2 = document.getElementById('type-calc-secondary').value;
    const resultsDiv = document.getElementById('type-calc-results');
    if (!resultsDiv) return;

    const matchups = {};
    Object.keys(TYPE_CHART).forEach(attackingType => {
        let mult = TYPE_CHART[attackingType][type1];
        if (type2 !== 'None' && type1 !== type2) {
            mult *= TYPE_CHART[attackingType][type2];
        }
        matchups[attackingType] = mult;
    });

    const groups = { 4: [], 2: [], 1: [], 0.5: [], 0.25: [], 0: [] };
    Object.keys(matchups).forEach(type => {
        groups[matchups[type]].push(type);
    });

    let html = '';

    const formatGroup = (multiplier, label, colorClass, styleBg) => {
        const typesList = groups[multiplier];
        if (typesList && typesList.length > 0) {
            html += `
                <div style="background: ${styleBg}; border: 1px solid rgba(255,255,255,0.03); padding: 0.75rem; border-radius: 6px;">
                    <span style="font-size: 0.8rem; font-weight: 700; color: ${colorClass}; display: block; margin-bottom: 0.4rem;">
                        ${label} (${multiplier}x)
                    </span>
                    <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
            `;
            typesList.sort().forEach(t => {
                html += `<span class="badge-scent" style="background: rgba(255,255,255,0.05); color: #fff; font-size: 0.7rem; padding: 0.25rem 0.5rem; border: 1px solid rgba(255,255,255,0.08);">${t}</span>`;
            });
            html += `</div></div>`;
        }
    };

    formatGroup(4, 'Double Weakness', 'var(--accent-red)', 'rgba(239, 68, 68, 0.04)');
    formatGroup(2, 'Weakness', '#fca5a5', 'rgba(239, 68, 68, 0.02)');
    formatGroup(0.5, 'Resistance', '#93c5fd', 'rgba(59, 130, 246, 0.02)');
    formatGroup(0.25, 'Double Resistance', 'var(--accent-green)', 'rgba(16, 185, 129, 0.04)');
    formatGroup(0, 'Immunity', 'var(--text-muted)', 'rgba(255,255,255,0.01)');
    formatGroup(1, 'Neutral Damage', '#e5e7eb', 'rgba(255,255,255,0.02)');

    resultsDiv.innerHTML = html;
}


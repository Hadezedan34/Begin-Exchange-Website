// API URL for live exchange rates (free, no API key required)
const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

// Exchange rate mapping from API currency codes to our codes
const currencyMapping: { [key: string]: string } = {
    "USD": "USD",
    "EUR": "EUR",
    "SYP": "SYP",
    "EGP": "EGY",
    "CNY": "YIN"
};

// Currency names for display
const currencyNames: { [key: string]: string } = {
    "USD": "US Dollar",
    "EUR": "Euro",
    "SYP": "Syrian Pound",
    "EGP": "Egyptian Pound",
    "CNY": "Chinese Yuan"
};

// Default rates (fallback)
const rates: { [key: string]: number } = {
    "USD": 1,
    "EUR": 0.92,
    "SYP": 15000,
    "EGP": 48,
    "YIN": 0.14
};

// DOM Elements
const amountinput = document.getElementById('amount-input2') as HTMLInputElement;
const fromcurrency = document.getElementById('countrylist1') as HTMLSelectElement;
const tocurrency = document.getElementById('countrylist2') as HTMLSelectElement;
const convertbrn = document.getElementById('button-convert') as HTMLButtonElement;
const resaultdiv = document.getElementById('convert-div') as HTMLDivElement;

// Quick converter elements
const quickAmount = document.getElementById('quick-amount') as HTMLInputElement;
const quickFrom = document.getElementById('quick-from') as HTMLSelectElement;
const quickTo = document.getElementById('quick-to') as HTMLSelectElement;
const quickResult = document.getElementById('quick-result') as HTMLInputElement;
const quickConvertBtn = document.getElementById('quick-convert-btn') as HTMLButtonElement;

// Swap button
const swapBtn = document.getElementById('swap-currencies') as HTMLButtonElement;

// Refresh button
const refreshBtn = document.getElementById('refresh-rates') as HTMLButtonElement;

// Function to fetch live exchange rates
async function fetchLiveRates() {
    try {
        const response = await fetch(EXCHANGE_API_URL);
        const data = await response.json();
        
        if (data.rates) {
            // Update rates object
            rates["USD"] = 1;
            rates["EUR"] = data.rates["EUR"] || rates["EUR"];
            rates["SYP"] = data.rates["SYP"] || rates["SYP"];
            rates["EGP"] = data.rates["EGP"] || rates["EGP"];
            rates["YIN"] = data.rates["CNY"] || rates["YIN"];
            
            // Update the table
            updateRatesTable(data.rates);
            
            // Update last updated time
            const lastUpdated = document.getElementById('last-updated');
            const marketUpdateTime = document.getElementById('market-update-time');
            const now = new Date();
            const timeString = now.toLocaleTimeString();
            
            if (lastUpdated) {
                lastUpdated.textContent = `Last updated: ${timeString}`;
            }
            if (marketUpdateTime) {
                marketUpdateTime.textContent = timeString;
            }
            
            // Update popular pairs
            updatePopularPairs(data.rates);
            
            console.log('Live rates loaded:', rates);
        }
    } catch (error) {
        console.error('Error fetching live rates:', error);
    }
}

// Update the rates table
function updateRatesTable(apiRates: { [key: string]: number }) {
    const tableBody = document.getElementById('rates-table-body');
    if (!tableBody) return;
    
    let html = '';
    const currencies = [
        { code: 'USD', name: 'US Dollar' },
        { code: 'EUR', name: 'Euro' },
        { code: 'GBP', name: 'British Pound' },
        { code: 'JPY', name: 'Japanese Yen' },
        { code: 'CNY', name: 'Chinese Yuan' },
        { code: 'EGP', name: 'Egyptian Pound' },
        { code: 'SYP', name: 'Syrian Pound' }
    ];
    
    currencies.forEach(currency => {
        const rate = apiRates[currency.code];
        if (rate) {
            const change = (Math.random() * 2 - 1).toFixed(2);
            const changeClass = parseFloat(change) >= 0 ? 'positive' : 'negative';
            const changeIcon = parseFloat(change) >= 0 ? 'fa-caret-up' : 'fa-caret-down';
            
            html += `
                <tr>
                    <td><strong>${currency.code}</strong></td>
                    <td>${currency.name}</td>
                    <td>${rate.toFixed(4)}</td>
                    <td><span class="pair-change ${changeClass}"><i class="fas ${changeIcon}"></i> ${Math.abs(parseFloat(change)).toFixed(2)}%</span></td>
                </tr>
            `;
        }
    });
    
    tableBody.innerHTML = html;
}

// Update popular pairs in sidebar
function updatePopularPairs(apiRates: { [key: string]: number }) {
    const pairs = [
        { id: 'pair-usd-eur', from: 'USD', to: 'EUR', rate: apiRates['EUR'] },
        { id: 'pair-usd-gbp', from: 'USD', to: 'GBP', rate: apiRates['GBP'] },
        { id: 'pair-eur-jpy', from: 'EUR', to: 'JPY', rate: apiRates['JPY'] },
        { id: 'pair-usd-cny', from: 'USD', to: 'CNY', rate: apiRates['CNY'] }
    ];
    
    pairs.forEach(pair => {
        const element = document.getElementById(pair.id);
        if (element && pair.rate) {
            element.textContent = pair.rate.toFixed(4);
        }
    });
}

// Main converter function
function convertCurrency(amount: number, from: string, to: string): number {
    // Convert to USD first, then to target currency
    const inUSD = amount / rates[from];
    return inUSD * rates[to];
}

// Main convert button handler
convertbrn.addEventListener('click', () => {
    const amount = Number(amountinput.value);
    const from = fromcurrency.value;
    const to = tocurrency.value;
    
    if (isNaN(amount) || amount <= 0) {
        if (resaultdiv) {
            resaultdiv.innerHTML = '<span class="result-placeholder">Please enter a valid amount</span>';
        }
        return;
    }
    
    const result = convertCurrency(amount, from, to);
    
    if (resaultdiv) {
        resaultdiv.innerHTML = `${result.toFixed(2)} ${to}`;
    }
});

// Quick converter handler
quickConvertBtn.addEventListener('click', () => {
    const amount = Number(quickAmount.value);
    const from = quickFrom.value;
    const to = quickTo.value;
    
    if (isNaN(amount) || amount <= 0) {
        quickResult.value = 'Invalid amount';
        return;
    }
    
    const result = convertCurrency(amount, from, to);
    quickResult.value = result.toFixed(2);
});

// Swap currencies handler
swapBtn.addEventListener('click', () => {
    const fromValue = fromcurrency.value;
    const toValue = tocurrency.value;
    
    fromcurrency.value = toValue;
    tocurrency.value = fromValue;
});

// Refresh rates handler
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        fetchLiveRates();
    });
}

// Load navbar (keeping original functionality)
async function loadnavbar() {
    try {
        const response = await fetch('./components/navbar.html');
        const navbarhtml = await response.text();
        const placeholder = document.getElementById("navbar-placeholder");
        if (placeholder) {
            placeholder.innerHTML = navbarhtml;
        }
    } catch (error) {
        console.log('couldnt load placeholder for the navbar');
    }
}

// Initialize
loadnavbar();
fetchLiveRates();

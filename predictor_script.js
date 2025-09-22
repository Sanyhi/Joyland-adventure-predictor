// --- Storage Key for Simulation Predictor ---
const STORAGE_KEY = 'simulationPredictorRecords';

// --- Pattern Definitions ---
const patterns = {
  P1: "xDxfxxDtxDxfT",
  P2: "xxFxDtxxDTDxf",
  P3: "xxDtxxFxDTxfD",
  P4: "xxtxDxFxDxDFT"
};

const encounterValues = {
  x: 250,
  D: 300,
  f: 550,
  F: 700,
  t: [100, 200, 300], // GC
  T: [100, 1980]      // JC
};

// --- Utility Functions ---
function getRecords() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function getTotalMeters() {
  return getRecords().length;
}

function expectedValue(symbol) {
  if (['x', 'D', 'f', 'F'].includes(symbol)) return encounterValues[symbol];
  if (symbol === 't') return encounterValues.t.reduce((a, b) => a + b) / encounterValues.t.length;
  if (symbol === 'T') return (encounterValues.T[0] + encounterValues.T[1]) / 2;
  return 0;
}

// --- Pattern Recognition & Prediction ---
function predictNext(records) {
  const encounterSymbols = records.map(r => r.symbol);
  // Exclude patterns already used in this cycle (not implemented here for simplicity)
  let bestMatch = null, bestScore = -1;
  for (const [name, sequence] of Object.entries(patterns)) {
    let score = 0;
    for (let i = 0; i < encounterSymbols.length; i++) {
      if (sequence[i] === encounterSymbols[i]) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = name;
    }
  }
  if (!bestMatch) return { pattern: null, next: null, ev: 0, suggestion: "Pattern not identifiable yet." };
  const nextIndex = encounterSymbols.length;
  const nextSymbol = patterns[bestMatch][nextIndex];
  const ev = expectedValue(nextSymbol);
  let suggestion = "";
  if (nextSymbol === 'F') suggestion = "Guaranteed Monster encounter. Use maximum multiplier.";
  else if (ev >= 700) suggestion = `Likely ${nextSymbol} with EV ${ev.toFixed(2)} JC. Proceed.`;
  else suggestion = `EV ${ev.toFixed(2)} JC is below threshold. Consider skipping.`;
  return { pattern: bestMatch, next: nextSymbol, ev, suggestion };
}

// --- UI Update Functions ---
function updateMultiplierVisibility() {
  const totalMeters = getTotalMeters();
  const multiplier = document.getElementById("multiplier");
  if (totalMeters < 10) {
    multiplier.style.display = "none";
    multiplier.value = "1x1m";
  } else {
    multiplier.style.display = "inline-block";
  }
}

function updatePrediction() {
  const records = getRecords();
  const { pattern, next, ev, suggestion } = predictNext(records);
  document.getElementById("patternInfo").textContent = `Pattern: ${pattern || 'Unknown'}`;
  document.getElementById("nextSymbol").textContent = `Next: ${next || '?'}`;
  document.getElementById("evInfo").textContent = `EV: ${ev.toFixed(2)} JC`;
  document.getElementById("suggestion").textContent = suggestion;
  const gif = next ? `${next}.gif` : "uncertain.gif";
  document.getElementById("predictionGif").src = gif;
  // Probability breakdown (optional, can be expanded)
}

function recordEncounter() {
  const type = document.getElementById("encounterType").value;
  let symbol = "?";
  switch (type) {
    case "Normal encounter": symbol = 'x'; break;
    case "Choose 1 encounter": symbol = 'D'; break;
    case "Little devil (puzzle) encounter": symbol = 'f'; break;
    case "Monster (Axe throw) encounter": symbol = 'F'; break;
    case "Treasure chest (gold)": symbol = 't'; break;
    case "Treasure chest (jackpot)": symbol = 'T'; break;
  }
  let multiplierValue = "1x1m";
  if (getTotalMeters() >= 10) {
    multiplierValue = document.getElementById("multiplier").value;
  }
  let amount = "";
  if (symbol === 't' || symbol === 'T') {
    amount = document.getElementById("amount").value;
  }
  const record = { type, symbol, multiplier: multiplierValue, amount };
  const records = getRecords();
  records.push(record);
  saveRecords(records);
  updateMultiplierVisibility();
  updatePrediction();
  updateSummary();
}

function updateSummary() {
  const records = getRecords();
  let html = "<b>Recorded Encounters:</b><br>";
  records.forEach((r, i) => {
    html += `${i + 1}. ${r.type} (${r.symbol}) - Multiplier: ${r.multiplier}${r.amount ? `, Amount: ${r.amount}` : ""}<br>`;
  });
  document.getElementById("summaryOutput").innerHTML = html;
}

// --- Import/Export ---
function exportData() {
  const data = getRecords();
  navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  alert("Data copied to clipboard!");
}

function importData() {
  const text = document.getElementById("importArea").value;
  try {
    const data = JSON.parse(text);
    saveRecords(data);
    updateMultiplierVisibility();
    updatePrediction();
    updateSummary();
    alert("Data imported successfully!");
  } catch (e) {
    alert("Failed to import data.");
  }
}

// --- Checkbox for Summary ---
function toggleSummary() {
  const checked = document.getElementById("showSummary").checked;
  document.getElementById("summarySection").style.display = checked ? "block" : "none";
}

// --- On Page Load ---
window.onload = () => {
  updateMultiplierVisibility();
  updatePrediction();
  updateSummary();
  document.getElementById("encounterType").addEventListener("change", () => {
    const type = document.getElementById("encounterType").value;
    const show = type.includes("Treasure chest");
    document.getElementById("multiplier").style.display = show && getTotalMeters() >= 10 ? "inline-block" : "none";
    document.getElementById("amount").style.display = show ? "inline-block" : "none";
  });
  document.getElementById("showSummary").addEventListener("change", toggleSummary);
};

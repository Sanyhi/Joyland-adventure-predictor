// --- Pattern and Value Definitions ---
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
  T: [100, 1980] // JC
};

const riskWeights = {
  "Low Risk": 1.0,
  "Medium Risk": 1.3,
  "High Risk": 1.6
};

// --- Utility Functions ---
function loadSimulationData() {
  return JSON.parse(localStorage.getItem("simulatorData")) || {};
}

function getRecords() {
  return JSON.parse(localStorage.getItem("simulationPredictorRecords")) || [];
}

function saveRecords(records) {
  localStorage.setItem("simulationPredictorRecords", JSON.stringify(records));
}

function expectedValue(symbol, riskLevel) {
  const weight = riskWeights[riskLevel] || 1.0;
  if (["x", "D", "f", "F"].includes(symbol)) return encounterValues[symbol] * weight;
  if (symbol === "t") return (encounterValues.t.reduce((a, b) => a + b) / encounterValues.t.length) * weight;
  if (symbol === "T") return ((encounterValues.T[0] + encounterValues.T[1]) / 2) * weight;
  return 0;
}

function getPatternProbabilities(records) {
  const symbols = records.map(r => r.symbol);
  const matches = Object.entries(patterns).filter(([_, seq]) =>
    symbols.every((s, i) => seq[i] === s)
  );
  const nextCounts = {};
  matches.forEach(([_, seq]) => {
    const next = seq[symbols.length];
    if (next) nextCounts[next] = (nextCounts[next] || 0) + 1;
  });
  const total = matches.length;
  const probabilities = {};
  for (const [sym, count] of Object.entries(nextCounts)) {
    probabilities[sym] = count / total;
  }
  return { probabilities, total };
}

function showPrediction(records) {
  const { probabilities } = getPatternProbabilities(records);
  const simData = loadSimulationData();
  const certain = Object.keys(probabilities).length === 1;
  const nextSymbol = certain ? Object.keys(probabilities)[0] : null;
  const gif = certain ? `${nextSymbol}.gif` : "uncertain.gif";
  document.getElementById("predictionGif").src = gif;

  if (certain) {
    const ev = expectedValue(nextSymbol, simData.riskLevel);
    document.getElementById("patternInfo").textContent = `Pattern: Certain (${nextSymbol})`;
    document.getElementById("nextSymbol").textContent = `Next: ${nextSymbol}`;
    document.getElementById("evInfo").textContent = `EV: ${ev.toFixed(2)} JC`;
    document.getElementById("suggestion").textContent =
      nextSymbol === "F"
        ? "Guaranteed Monster encounter. Use maximum multiplier."
        : ev >= 700
        ? `Likely ${nextSymbol} with EV ${ev.toFixed(2)} JC. Proceed.`
        : `EV ${ev.toFixed(2)} JC is below threshold. Consider skipping.`;
  } else {
    const probText = Object.entries(probabilities)
      .map(([sym, p]) => `${sym}: ${(p * 100).toFixed(1)}%`)
      .join(", ");
    document.getElementById("patternInfo").textContent = "Pattern: Uncertain";
    document.getElementById("nextSymbol").textContent = `Next: ${probText}`;
    document.getElementById("evInfo").textContent = "";
    document.getElementById("suggestion").textContent = "No certain prediction. Probabilities shown.";
  }
}

function updateUI() {
  const records = getRecords();
  const meters = records.length;
  document.getElementById("totalMeters").textContent = meters;

  let totalJC = 0, totalGC = 0;
  records.forEach(r => {
    if (r.symbol === "T") totalJC += r.amount || 0;
    if (r.symbol === "t") totalGC += r.amount || 0;
  });

  document.getElementById("totalJC").textContent = `Total JC Acquired: ${totalJC}`;
  document.getElementById("totalGC").textContent = `Total GC Acquired: ${totalGC}`;

  document.getElementById("multiplier").style.display = meters >= 10 ? "inline-block" : "none";

  showPrediction(records);

  const simData = loadSimulationData();
  const gold = simData.currentGold || 0;
  const purchasable = Math.floor(gold / 280);
  document.getElementById("gcPower").textContent = `You can purchase ${purchasable} compasses with your gold. You get 45 free per event.`;
}

function recordEncounter() {
  const type = document.getElementById("encounterType").value;
  const symbolMap = {
    "Normal encounter": "x",
    "Choose 1 encounter": "D",
    "Little devil (puzzle) encounter": "f",
    "Monster (Axe throw) encounter": "F",
    "Treasure chest (gold)": "t",
    "Treasure chest (jackpot)": "T"
  };
  const symbol = symbolMap[type] || "?";

  const records = getRecords();
  const multiplier = records.length >= 10 ? document.getElementById("multiplier").value : "1x1m";
  const amount = ["t", "T"].includes(symbol) ? parseInt(document.getElementById("amount").value || "0") : null;

  records.push({ type, symbol, multiplier, amount });
  saveRecords(records);
  updateUI();
}

function exportData() {
  const data = getRecords();
  navigator.clipboard.writeText(JSON.stringify(data, null, 2));
  alert("Data copied to clipboard!");
}

function importData() {
  try {
    const text = document.getElementById("importArea").value;
    const data = JSON.parse(text);
    saveRecords(data);
    updateUI();
    alert("Data imported successfully!");
  } catch {
    alert("Failed to import data.");
  }
}

function toggleSummary() {
  const checked = document.getElementById("showSummary").checked;
  document.getElementById("summarySection").style.display = checked ? "block" : "none";
}

window.onload = () => {
  updateUI();
  document.getElementById("encounterType").addEventListener("change", () => {
    const type = document.getElementById("encounterType").value;
    const showAmount = type.includes("Treasure chest");
    document.getElementById("amount").style.display = showAmount ? "inline-block" : "none";
  });
  document.getElementById("showSummary").addEventListener("change", toggleSummary);
};

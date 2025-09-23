
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
  T: [100, 1980]      // JC
};

const riskWeights = {
  "Low Risk": 1.0,
  "Medium Risk": 1.3,
  "High Risk": 1.6
};

function loadSimulationData() {
  return JSON.parse(localStorage.getItem("simulatorData")) || {};
}

function expectedValue(symbol, riskLevel) {
  const weight = riskWeights[riskLevel] || 1.0;
  if (["x", "D", "f", "F"].includes(symbol)) {
    return encounterValues[symbol] * weight;
  }
  if (symbol === "t") {
    const avgGC = encounterValues.t.reduce((a, b) => a + b) / encounterValues.t.length;
    return avgGC * weight;
  }
  if (symbol === "T") {
    const avgJC = (encounterValues.T[0] + encounterValues.T[1]) / 2;
    return avgJC * weight;
  }
  return 0;
}

function getPatternProbabilities(records, usedPatterns = []) {
  const encounterSymbols = records.map(r => r.symbol);
  const candidates = Object.entries(patterns).filter(([k]) => !usedPatterns.includes(k));
  let matches = [];
  for (const [name, sequence] of candidates) {
    let match = true;
    for (let i = 0; i < encounterSymbols.length; i++) {
      if (sequence[i] !== encounterSymbols[i]) {
        match = false;
        break;
      }
    }
    if (match) matches.push([name, sequence]);
  }
  const nextCounts = {};
  for (const [name, sequence] of matches) {
    const nextSymbol = sequence[encounterSymbols.length];
    if (nextSymbol) {
      nextCounts[nextSymbol] = (nextCounts[nextSymbol] || 0) + 1;
    }
  }
  const total = matches.length;
  let probabilities = {};
  for (const [symbol, count] of Object.entries(nextCounts)) {
    probabilities[symbol] = count / total;
  }
  return {probabilities, total};
}

function predictNext(records, usedPatterns = []) {
  const encounterSymbols = records.map(r => r.symbol);
  const candidates = Object.entries(patterns).filter(([k]) => !usedPatterns.includes(k));
  let bestMatch = null, bestScore = -1;
  for (const [name, sequence] of candidates) {
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
  const simData = loadSimulationData();
  const ev = expectedValue(nextSymbol, simData.riskLevel);
  let suggestion = "";
  if (nextSymbol === 'F') {
    suggestion = "Guaranteed Monster encounter. Use maximum multiplier.";
  } else if (ev >= 700) {
    suggestion = `Likely ${nextSymbol} with EV ${ev.toFixed(2)} JC. Proceed.`;
  } else {
    suggestion = `EV ${ev.toFixed(2)} JC is below threshold. Consider skipping.`;
  }
  return { pattern: bestMatch, next: nextSymbol, ev, suggestion };
}

function showPrediction(records) {
  const {probabilities, total} = getPatternProbabilities(records);
  const simData = loadSimulationData();
  let certain = false;
  let nextSymbol = null;
  if (Object.keys(probabilities).length === 1) {
    certain = true;
    nextSymbol = Object.keys(probabilities)[0];
  }
  const gif = certain ? `${nextSymbol}.gif` : "uncertain.gif";
  document.getElementById("predictionGif").src = gif;
  if (certain) {
    const ev = expectedValue(nextSymbol, simData.riskLevel);
    document.getElementById("patternInfo").textContent = `Pattern: Certain (${nextSymbol})`;
    document.getElementById("nextSymbol").textContent = `Next: ${nextSymbol}`;
    document.getElementById("evInfo").textContent = `EV: ${ev.toFixed(2)} JC`;
    document.getElementById("suggestion").textContent = (nextSymbol === 'F') ? "Guaranteed Monster encounter. Use maximum multiplier." : (ev >= 700 ? `Likely ${nextSymbol} with EV ${ev.toFixed(2)} JC. Proceed.` : `EV ${ev.toFixed(2)} JC is below threshold. Consider skipping.`);
  } else {
    let probText = Object.entries(probabilities).map(([sym, p]) => `${sym}: ${(p*100).toFixed(1)}%`).join(", ");
    document.getElementById("patternInfo").textContent = `Pattern: Uncertain`;
    document.getElementById("nextSymbol").textContent = `Next: ${probText}`;
    document.getElementById("evInfo").textContent = '';
    document.getElementById("suggestion").textContent = 'No certain prediction. Probabilities shown.';
  }
}

function calculateCompassPurchasingPower(currentGold) {
  const goldPerCompass = 280;
  const purchasable = Math.floor(currentGold / goldPerCompass);
  return purchasable;
}

function getFreeCompassesPerEvent() {
  return 45;
}

function getRecords() {
  return JSON.parse(localStorage.getItem('simulationPredictorRecords')) || [];
}

function saveRecords(records) {
  localStorage.setItem('simulationPredictorRecords', JSON.stringify(records));
}

function updatePrediction() {
  const records = getRecords();
  showPrediction(records);
  const simData = loadSimulationData();
  const currentGold = simData.currentGold || 0;
  const purchasable = calculateCompassPurchasingPower(currentGold);
  const freeCompasses = getFreeCompassesPerEvent();
  document.getElementById("gcPower").textContent = `You can purchase ${purchasable} compasses with your gold. You get ${freeCompasses} free per event.`;
}

window.onload = () => {
  updatePrediction();
};

function getNextPrediction(sequence, usedPatterns) {
  const patterns = {
    P1: "xDxfxxDtxDxfT",
    P2: "xxFxDtxxDTDxf",
    P3: "xxDtxxFxDTxfD",
    P4: "xxtxDxFxDxDFT"
  };

  // Step 1: Remove completed pattern from consideration
  const availablePatterns = Object.entries(patterns).filter(([key]) => !usedPatterns.includes(key));

  // Step 2: Determine where the last pattern ended
  // Assume last pattern was exactly matched and ended at step N
  // Start new pattern search from the first new symbol after that
  const lastPatternLength = 13; // P2 is 13 steps long
  const newSequence = sequence.slice(lastPatternLength); // Only use new steps

  // Step 3: Match new sequence to start of remaining patterns
  const matches = {};
  availablePatterns.forEach(([name, pattern]) => {
    let match = true;
    for (let i = 0; i < newSequence.length; i++) {
      if (pattern[i] !== newSequence[i]) {
        match = false;
        break;
      }
    }
    if (match) {
      const nextSymbol = pattern[newSequence.length];
      if (nextSymbol) {
        matches[nextSymbol] = (matches[nextSymbol] || 0) + 1;
      }
    }
  });

  // Step 4: Calculate probabilities
  const totalMatches = Object.values(matches).reduce((a, b) => a + b, 0);
  const probabilities = {};
  for (const [symbol, count] of Object.entries(matches)) {
    probabilities[symbol] = count / totalMatches;
  }

  return probabilities;
}

const milestoneRewards = [
  { m: 15, compass: 5, jc: 100 },
  { m: 30, compass: 0, jc: 100 },
  { m: 45, compass: 5, jc: 100 },
  { m: 60, compass: 0, jc: 200 },
  { m: 90, compass: 0, jc: 200 },
  { m: 120, compass: 10, jc: 200 },
  { m: 150, compass: 0, jc: 300 },
  { m: 180, compass: 10, jc: 300 },
  { m: 210, compass: 10, jc: 300 },
  { m: 240, compass: 0, jc: 400 },
  { m: 270, compass: 10, jc: 400 },
  { m: 300, compass: 0, jc: 400 },
  { m: 360, compass: 0, jc: 500 },
  { m: 420, compass: 0, jc: 500 },
  { m: 480, compass: 20, jc: 500 },
  { m: 540, compass: 0, jc: 500 },
  { m: 600, compass: 0, jc: 500 },
  { m: 660, compass: 0, jc: 500 },
  { m: 720, compass: 0, jc: 500 },
  { m: 780, compass: 0, jc: 500 },
  { m: 900, compass: 0, jc: 500 },
  { m: 1050, compass: 0, jc: 500 },
  { m: 1200, compass: 0, jc: 500 },
  { m: 1350, compass: 0, jc: 500 }
];

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

function confirmDeleteRecords() {
  const records = getRecords();
  const backup = JSON.stringify(records, null, 2);
  const confirmDelete = confirm("Are you sure you want to delete all recorded encounters?\nYou can copy the data to clipboard before deleting.");
  if (confirmDelete) {
    const copy = confirm("Do you want to copy the current data to clipboard before deletion?");
    if (copy) {
      navigator.clipboard.writeText(backup);
      alert("Data copied to clipboard.");
    }
    saveRecords([]);
    updateUI();
    alert("All records deleted.");
  }
}

function calculateMilestoneRewards(meters) {
  let totalJC = 0;
  let totalCompasses = 0;

  milestoneRewards.forEach(reward => {
    if (meters >= reward.m) {
      totalJC += reward.jc;
      totalCompasses += reward.compass;
    }
  });

  document.getElementById("milestoneJC").textContent = `Milestone JC Earned: ${totalJC}`;
  document.getElementById("milestoneCompasses").textContent = `Milestone Compasses Earned: ${totalCompasses}`;
}

// --- Mining Compass Calculation Until Next Odd-Week Sunday 20:00 ---
function calculateMiningUntilOddSunday(lifetimePrivilege = true) {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysSinceStart = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
  const currentWeek = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);
  const nextOddWeek = currentWeek % 2 === 0 ? currentWeek + 1 : currentWeek;

  const daysToNextOddWeek = (nextOddWeek - currentWeek) * 7;
  const nextOddSunday = new Date(now);
  nextOddSunday.setDate(now.getDate() + daysToNextOddWeek + (7 - nextOddSunday.getDay()));
  nextOddSunday.setHours(20, 0, 0, 0);

  const minutesRemaining = Math.floor((nextOddSunday - now) / 60000);
  let compasses = Math.floor(minutesRemaining / 10);
  const maxCompasses = lifetimePrivilege ? 1000 : 100;
  compasses = Math.min(compasses, maxCompasses);
  const gc = compasses * 15;

  return { compasses, gc };
}

// --- Gold Strategy Calculator for Meter Goals ---
function calculateGoldStrategy(playerData) {
  const meterGoals = {
    "300m": 50760,
    "360m": 68040,
    "600m": 125640,
    "900m": 212040
  };

  const GOLD_CHEST_AVG = 200;
  const mining = calculateMiningUntilOddSunday(playerData.lifetimePrivilege);
  const startingGold = playerData.startingGold || 51400;
  const eventGC = playerData.eventGC || 88000;
  const umbraGC = 50 * 62;

  const totalNaturalGC = startingGold + eventGC + mining.gc + umbraGC;
  const strategies = {};

  for (const [goal, requiredGC] of Object.entries(meterGoals)) {
    const deficit = requiredGC - totalNaturalGC;
    let goldChestNeeded = 0;
    let strategy = "";

    if (deficit > 0) {
      goldChestNeeded = Math.ceil(deficit / GOLD_CHEST_AVG);
      strategy = `
        ❌ You cannot reach ${goal} with natural resources alone.
        ➤ You need approximately ${goldChestNeeded} gold chest encounters.
        ➤ Focus on pattern prediction to target 't' events.
        ➤ Use multipliers only when gold chests are guaranteed.
        ➤ Once ${requiredGC} GC is reached, switch to max EV strategy.
      `;
    } else {
      strategy = `
        ✅ You can reach ${goal} with your current resources.
        ➤ Switch to maximum EV strategy.
        ➤ Optimize for JC, milestone rewards, and efficient compass usage.
      `;
    }

    strategies[goal] = {
      requiredGC,
      totalNaturalGC,
      deficit: Math.max(0, deficit),
      goldChestNeeded,
      strategy: strategy.trim()
    };
  }

  return strategies;
}

// --- Example Usage (can be triggered on page load or button click) ---
function displayGoldStrategy() {
  const simData = loadSimulationData();
  const strategies = calculateGoldStrategy(simData);
  const goal = simData.priority.includes("300m") ? "300m"
              : simData.priority.includes("360m") ? "360m"
              : simData.priority.includes("600m") ? "600m"
              : "900m";

  const strategyText = strategies[goal].strategy;
  document.getElementById("strategyGuide").innerText = strategyText;
}

// Pattern Definitions
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

// --- Utility Functions ---
function loadSimulationData() {
  const data = JSON.parse(localStorage.getItem("simulatorData")) || {};
  return {
    lifetimePrivilege: data.lifetimePrivilege || data.privilege || data.lifetime || false,
    currentGold: data.currentGold || data.gold || data.startingGold || 0,
    priority: data.priority || "",
    riskLevel: data.riskLevel || data.risk || "Low Risk",
    bossFightRanking: data.bossFightRanking || data.bossRanking || 0,
    arenaRanking: data.arenaRanking || 0,
    bossFightDmg: data.bossFightDmg || data.bossDamage || 0,
    merchantHaggling: data.merchantHaggling || data.merchant || 0,
    chaosBlitz: data.chaosBlitz || data.blitz || 0
  };
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

// --- Advanced Gold Calculator ---
function calculateAdvancedGoldRequirements() {
  const simData = loadSimulationData();
  const hasLifetime = simData.lifetimePrivilege;
  const startingGold = simData.currentGold;
  const priority = simData.priority;
  
  const GOAL_900M_GC = 212040;
  const COMPASS_COST_DAILY_SHOP = 280;
  const COMPASS_COST_SPECIAL = 288;
  const FREE_COMPASSES_PER_DAY = 15;
  const EVENT_DAYS = 3;
  
  let milestoneCompasses = 0;
  milestoneRewards.forEach(reward => {
    milestoneCompasses += reward.compass || 0;
  });
  
  const dailyShopCompasses = Math.floor(startingGold / COMPASS_COST_DAILY_SHOP);
  const specialShopCompasses = Math.floor((startingGold - (dailyShopCompasses * COMPASS_COST_DAILY_SHOP)) / COMPASS_COST_SPECIAL);
  const totalPurchasableCompasses = dailyShopCompasses + specialShopCompasses;
  const totalFreeCompasses = FREE_COMPASSES_PER_DAY * EVENT_DAYS;
  const totalAvailableCompasses = totalPurchasableCompasses + totalFreeCompasses + milestoneCompasses;
  
  const GOLD_CHEST_AVG = 200;
  const COMPASSES_PER_GOLD_CHEST = 67;
  const goldChestsNeeded = Math.ceil(GOAL_900M_GC / GOLD_CHEST_AVG);
  const compassesForGoldChests = goldChestsNeeded * COMPASSES_PER_GOLD_CHEST;
  const overflowCompasses = Math.max(0, totalAvailableCompasses - compassesForGoldChests);
  
  let adjustedStartingGold = startingGold;
  let lifetimeAdjustment = 0;
  
  if (hasLifetime) {
    lifetimeAdjustment = 9450;
    adjustedStartingGold = startingGold + lifetimeAdjustment;
    const adjDailyShopCompasses = Math.floor(adjustedStartingGold / COMPASS_COST_DAILY_SHOP);
    const adjSpecialShopCompasses = Math.floor((adjustedStartingGold - (adjDailyShopCompasses * COMPASS_COST_DAILY_SHOP)) / COMPASS_COST_SPECIAL);
    const adjTotalPurchasableCompasses = adjDailyShopCompasses + adjSpecialShopCompasses;
    const adjTotalAvailableCompasses = adjTotalPurchasableCompasses + totalFreeCompasses + milestoneCompasses;
    const adjOverflowCompasses = Math.max(0, adjTotalAvailableCompasses - compassesForGoldChests);
    
    return {
      goalGC: GOAL_900M_GC,
      startingGold,
      adjustedStartingGold,
      hasLifetime,
      totalAvailableCompasses: adjTotalAvailableCompasses,
      goldChestsNeeded,
      compassesForGoldChests,
      overflowCompasses: adjOverflowCompasses,
      milestoneCompasses,
      dailyFreeCompasses: totalFreeCompasses,
      purchasableCompasses: adjTotalPurchasableCompasses,
      minimumRequiredGold: 66000 - lifetimeAdjustment,
      canReach900m: adjTotalAvailableCompasses >= compassesForGoldChests
    };
  }
  
  return {
    goalGC: GOAL_900M_GC,
    startingGold,
    adjustedStartingGold: startingGold,
    hasLifetime,
    totalAvailableCompasses,
    goldChestsNeeded,
    compassesForGoldChests,
    overflowCompasses,
    milestoneCompasses,
    dailyFreeCompasses: totalFreeCompasses,
    purchasableCompasses: totalPurchasableCompasses,
    minimumRequiredGold: 66000,
    canReach900m: totalAvailableCompasses >= compassesForGoldChests
  };
}

// --- Enhanced Recommendation System ---
function getEnhancedRecommendation(nextSymbol, ev, probabilities) {
  const simData = loadSimulationData();
  const records = getRecords();
  const totalMeters = records.length;
  const goldCalc = calculateAdvancedGoldRequirements();
  
  let totalJCFromEncounters = 0;
  records.forEach(r => {
    if (["x", "D", "f", "F", "T"].includes(r.symbol)) {
      totalJCFromEncounters += r.amount || 0;
    }
  });
  
  let milestoneJC = 0;
  milestoneRewards.forEach(reward => {
    if (totalMeters >= reward.m) {
      milestoneJC += reward.jc;
    }
  });
  
  const totalJC = totalJCFromEncounters + milestoneJC;
  const isGoldPriority = simData.priority && simData.priority.includes("Gold");
  const isJCPriority = simData.priority && simData.priority.includes("Joyland coin");
  
  let recommendation = "";
  let multiplierAdvice = "";

  if (isGoldPriority) {
    if (nextSymbol === "t") {
      recommendation = "💰 GOLD STRATEGY: Gold chest guaranteed! Use 50x1m - MAXIMIZE GOLD!";
      multiplierAdvice = "50x1m";
    } else {
      recommendation = "🪙 GOLD STRATEGY: Use 1x1m - save compasses for gold chests only";
      multiplierAdvice = "1x1m";
    }
    recommendation += `\n🎯 Gold Progress: ${goldCalc.startingGold.toLocaleString()}/${goldCalc.goalGC.toLocaleString()} GC`;
    recommendation += `\n📊 Available Compasses: ${goldCalc.totalAvailableCompasses} (${goldCalc.overflowCompasses} overflow)`;
    
  } else if (isJCPriority) {
    if (!goldCalc.canReach900m) {
      if (nextSymbol === "t") {
        recommendation = "⚠️ JC Strategy - Need Gold: Gold chest! Use 50x1m to reach 900m goal";
        multiplierAdvice = "50x1m";
      } else {
        recommendation = "⚠️ JC Strategy - Need Gold: Use 1x1m - focus on gold chests for 900m";
        multiplierAdvice = "1x1m";
      }
    } else if (goldCalc.overflowCompasses > 0) {
      if (nextSymbol === "F") {
        recommendation = `🔥 JC Strategy: Monster encounter! Use 50x1m (${goldCalc.overflowCompasses} overflow compasses available)`;
        multiplierAdvice = "50x1m";
      } else if (nextSymbol === "t") {
        recommendation = `💰 JC Strategy: Gold chest - use 50x1m for safety margin`;
        multiplierAdvice = "50x1m";
      } else if (ev >= 700) {
        recommendation = `🎯 JC Strategy: High EV (${ev.toFixed(0)} JC)! Use 50x1m`;
        multiplierAdvice = "50x1m";
      } else {
        recommendation = `📊 JC Strategy: Use 1x1m - save for high-value encounters`;
        multiplierAdvice = "1x1m";
      }
    } else {
      if (nextSymbol === "t") {
        recommendation = "💰 JC Strategy: Gold chest - use 50x1m to maintain 900m goal";
        multiplierAdvice = "50x1m";
      } else {
        recommendation = "📊 JC Strategy: Use 1x1m - no overflow compasses available";
        multiplierAdvice = "1x1m";
      }
    }
    recommendation += `\n🎯 900m Goal: ${goldCalc.canReach900m ? '✅ Achievable' : '❌ Not achievable'}`;
    recommendation += `\n📊 Overflow: ${goldCalc.overflowCompasses} compasses for JC`;
  }

  if (multiplierAdvice && document.getElementById("multiplier").style.display !== "none") {
    const multiplierSelect = document.getElementById("multiplier");
    if (multiplierAdvice === "50x1m") {
      multiplierSelect.value = "50x1m";
    } else if (multiplierAdvice === "1x1m") {
      multiplierSelect.value = "1x1m";
    }
  }

  return recommendation;
}

// --- Prediction and Display Functions ---
function showPrediction(records) {
  const { probabilities, total } = getPatternProbabilities(records);
  const simData = loadSimulationData();
  const certain = Object.keys(probabilities).length === 1;
  const nextSymbol = certain ? Object.keys(probabilities)[0] : null;
  const gif = certain ? `${nextSymbol}.gif` : "uncertain.gif";
  
  const gifElement = document.getElementById("predictionGif");
  gifElement.src = gif;
  
  const certaintyPercent = certain ? 100 : (total > 0 ? Math.max(...Object.values(probabilities)) * 100 : 0);
  document.getElementById("certaintyInfo").textContent = `Prediction Certainty: ${certaintyPercent.toFixed(1)}%`;
 const predictionDisplay = {};
  Object.entries(probabilities).forEach(([sym, prob]) => {
    predictionDisplay[sym] = `${(prob * 100).toFixed(1)}%`;
  });
  
  // Update the new frontend display
  updatePredictionDisplay(predictionDisplay);
  
  // Get multiplier recommendation from your existing logic
  const ev = certain ? expectedValue(nextSymbol, simData.riskLevel) : 0;
  const recommendation = getEnhancedRecommendation(nextSymbol, ev, probabilities);
  
  // Extract multiplier advice from recommendation text
  let multiplierRec = "--";
  if (recommendation.includes("50x1m")) multiplierRec = "50x1m";
  else if (recommendation.includes("1x1m")) multiplierRec = "1x1m";
  else if (recommendation.includes("20x1m")) multiplierRec = "20x1m";
  else if (recommendation.includes("10x1m")) multiplierRec = "10x1m";
  else if (recommendation.includes("5x1m")) multiplierRec = "5x1m";
  
  updateMultiplierRecommendation(multiplierRec);
  
  if (certain) {
    const ev = expectedValue(nextSymbol, simData.riskLevel);
    document.getElementById("patternInfo").textContent = `Pattern: Certain (${nextSymbol})`;
    document.getElementById("nextSymbol").textContent = `Next: ${nextSymbol}`;
    document.getElementById("evInfo").textContent = `Base EV: ${ev.toFixed(2)} JC`;
    
    const recommendation = getEnhancedRecommendation(nextSymbol, ev, probabilities);
    document.getElementById("suggestion").textContent = recommendation;
  } else {
    const probText = Object.entries(probabilities)
      .map(([sym, p]) => `${sym}: ${(p * 100).toFixed(1)}%`)
      .join(", ");
    document.getElementById("patternInfo").textContent = "Pattern: Uncertain";
    document.getElementById("nextSymbol").textContent = `Possible: ${probText}`;
    
    const isGoldFocus = simData.priority && simData.priority.includes("Gold");
    if (isGoldFocus) {
      document.getElementById("evInfo").textContent = "";
      document.getElementById("suggestion").textContent = "🪙 GOLD STRATEGY: Uncertain prediction. Use 1x1m - save for guaranteed gold chests.";
      if (document.getElementById("multiplier").style.display !== "none") {
        document.getElementById("multiplier").value = "1x1m";
      }
    } else {
      let weightedEV = 0;
      Object.entries(probabilities).forEach(([symbol, prob]) => {
        weightedEV += expectedValue(symbol, simData.riskLevel) * prob;
      });
      document.getElementById("evInfo").textContent = `Weighted EV: ${weightedEV.toFixed(2)} JC`;
      const recommendation = getEnhancedRecommendation(null, weightedEV, probabilities);
      document.getElementById("suggestion").textContent = recommendation;
    }
  }
}

function updateUI() {
  const records = getRecords();
  const meters = records.length;
  document.getElementById("totalMeters").textContent = meters;

  let totalJCFromEncounters = 0, totalGC = 0;
  records.forEach(r => {
    if (["x", "D", "f", "F", "T"].includes(r.symbol)) {
      totalJCFromEncounters += r.amount || 0;
    }
    if (r.symbol === "t") totalGC += r.amount || 0;
  });

  let milestoneJC = 0;
  milestoneRewards.forEach(reward => {
    if (meters >= reward.m) {
      milestoneJC += reward.jc;
    }
  });

  const totalJC = totalJCFromEncounters + milestoneJC;
  const JC_TARGET = 84000;
  const jcRemaining = Math.max(0, JC_TARGET - totalJC);
  const simData = loadSimulationData();
  const isGoldFocus = simData.priority && simData.priority.includes("Gold");

  document.getElementById("totalJC").textContent = `Total JC Acquired: ${totalJC.toLocaleString()}`;
  document.getElementById("totalGC").textContent = `Total GC Acquired: ${totalGC.toLocaleString()}`;
  
  if (isGoldFocus) {
    document.getElementById("totalCombined").textContent = `JC Progress: ${totalJC.toLocaleString()}/${JC_TARGET.toLocaleString()} (${jcRemaining.toLocaleString()} needed)`;
  } else {
    document.getElementById("totalCombined").textContent = `Total JC + GC Value: ${(totalJC + totalGC).toLocaleString()}`;
  }

  document.getElementById("multiplier").style.display = meters >= 10 ? "inline-block" : "none";
  showPrediction(records);
  calculateMilestoneRewards(meters);

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
  let multiplier = records.length >= 10 ? document.getElementById("multiplier").value : "1x1m";
  
  const simData = loadSimulationData();
  const isGoldFocus = simData.priority && simData.priority.includes("Gold");
  
  if (isGoldFocus && symbol !== "t" && records.length >= 10) {
    multiplier = "1x1m";
    document.getElementById("multiplier").value = "1x1m";
  }
  
  const amount = ["t", "T"].includes(symbol) ? parseInt(document.getElementById("amount").value || "0") : null;
  const multiplierValue = parseInt(multiplier.split('x')[0]) || 1;

  let finalAmount = amount;
  if (["x", "D", "f", "F"].includes(symbol)) {
    const baseValue = encounterValues[symbol];
    finalAmount = baseValue * multiplierValue;
  } else if (["t", "T"].includes(symbol) && amount) {
    finalAmount = amount * multiplierValue;
  }

  records.push({ 
    type, 
    symbol, 
    multiplier, 
    multiplierValue,
    amount: finalAmount 
  });
  saveRecords(records);
  updateUI();
}

// --- Import/Export and Utility Functions ---
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

// --- Initialize on Load ---
window.onload = () => {
  updateUI();
  document.getElementById("encounterType").addEventListener("change", () => {
    const type = document.getElementById("encounterType").value;
    const showAmount = type.includes("Treasure chest");
    document.getElementById("amount").style.display = showAmount ? "inline-block" : "none";
  });
  document.getElementById("showSummary").addEventListener("change", toggleSummary);
};

// Add this function to the code - Gold Strategy Calculator for Meter Goals
function calculateGoldStrategy(playerData) {
  const meterGoals = {
    "300m": 50760,
    "360m": 68040,
    "600m": 125640,
    "900m": 212040
  };

  const GOLD_CHEST_AVG = 200;
  const mining = calculateMiningUntilOddSunday(playerData.lifetimePrivilege);
  const startingGold = playerData.currentGold || 51400;
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

// Add the mining calculation function that's referenced
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

// Update the calculateDynamicGCIncome function with correct tables and logic
function calculateDynamicGCIncome() {
  const now = new Date();
  const simData = loadSimulationData();

  // Calculate end date: next odd-week Sunday at 20:00
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const daysSinceStart = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
  const currentWeek = Math.ceil((daysSinceStart + startOfYear.getDay() + 1) / 7);
  const nextOddWeek = currentWeek % 2 === 0 ? currentWeek + 1 : currentWeek;
  const daysToNextOddWeek = (nextOddWeek - currentWeek) * 7;
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + daysToNextOddWeek + (7 - endDate.getDay()));
  endDate.setHours(20, 0, 0, 0);

  const totalDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
  const weekdays = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    return d.getDay();
  });

  const countWeekday = (day) => weekdays.filter(d => d === day).length;

  // Arena daily rewards table
  const arenaDailyRewards = {
    0: 0,
    1: 300,
    2: 200,
    3: 100,
    6: 80,
    11: 60,
    51: 40,
    501: 20
  };

  // Arena weekly rewards table (only count Mondays)
  const arenaWeeklyRewards = {
    0: 0,
    1: 2000,
    2: 1600,
    3: 1200,
    4: 1000,
    6: 800,
    11: 600,
    51: 400,
    501: 200
  };

  // Boss Fight daily rewards table
  const bossFightDailyRewards = {
    0: 0,
    1: 300,
    2: 200,
    3: 100,
    4: 80,
    11: 60,
    51: 40,
    101: 20,
    501: 20
  };

  // Boss Fight GC after fight table (per day)
  const bossFightGCFight = 610; // GC after fight per day

  // Calculate arena rewards
  const arenaRanking = simData.arenaRanking || 0;
  let arenaDailyGC = 0;
  let arenaWeeklyGC = 0;

  // Find the appropriate arena daily reward
  for (const [maxRank, reward] of Object.entries(arenaDailyRewards).sort((a, b) => b[0] - a[0])) {
    if (arenaRanking >= parseInt(maxRank)) {
      arenaDailyGC = reward * totalDays;
      break;
    }
  }

  // Calculate weekly arena rewards (only on Mondays)
  const mondaysCount = countWeekday(1); // 1 = Monday
  for (const [maxRank, reward] of Object.entries(arenaWeeklyRewards).sort((a, b) => b[0] - a[0])) {
    if (arenaRanking >= parseInt(maxRank)) {
      arenaWeeklyGC = reward * mondaysCount;
      break;
    }
  }

  // Calculate Boss Fight rewards
  const bossFightRanking = simData.bossFightRanking || 0;
  let bossFightDailyGC = 0;

  // Find the appropriate boss fight daily reward
  for (const [maxRank, reward] of Object.entries(bossFightDailyRewards).sort((a, b) => b[0] - a[0])) {
    if (bossFightRanking >= parseInt(maxRank)) {
      bossFightDailyGC = reward * totalDays;
      break;
    }
  }

  // Boss Fight GC after fight (every day)
  const bossFightGCFightTotal = bossFightGCFight * totalDays;

  // GC sources using local data
  const lifetimePrivilege = simData.lifetimePrivilege || false;
  const merchantHaggling = simData.merchantHaggling || 0;
  const chaosBlitz = simData.chaosBlitz || 0;

  const dailyGC = {
    // Using actual local data
    umbraFree: lifetimePrivilege ? 620 * 10 * totalDays : 0,
    dailyQuests: 750 * totalDays,
    lifetimePrivilege: lifetimePrivilege ? 500 * totalDays : 0,
    library: 281 * totalDays,
    advertising: 100 * totalDays,
    
    // Boss fight rewards using actual ranking
    bossFightDaily: bossFightDailyGC,
    bossFightGCFight: bossFightGCFightTotal,
    
    // Arena rewards using actual ranking
    arenaDaily: arenaDailyGC,
    arenaWeekly: arenaWeeklyGC,
    
    // Merchant haggling using actual input value
    merchantHaggling: merchantHaggling * totalDays,
    
    campaign: 1770 * totalDays,
    
    // Chaos blitz using actual input value with proper calculation
    blitz: calculateBlitzGC(chaosBlitz),
    
    signInFriday: 310 * countWeekday(5),
    joylandQuestsBiweekly: 15300 * Math.floor(countWeekday(5) / 2),
    guildEventThursday: 12000 * countWeekday(4),
    
    // Guild Umbras Thursday depends on lifetime privilege
    guildUmbrsThursday: lifetimePrivilege ? 1240 * countWeekday(4) : 0,
    
    umbraKeysPurchase: calculateUmbraKeyGC(simData.currentGold || 0),
    milestoneBonus: simData.priority && simData.priority.includes("360m") ? 3100 : 0
  };

  const totalGC = Object.values(dailyGC).reduce((a, b) => a + b, 0);

  return {
    startDate: now,
    endDate,
    totalDays,
    dailyGC,
    totalGC,
    startingGold: simData.currentGold || 0,
    eventGold: totalGC // This is the calculated event GC
  };
}

// Update Chaos Blitz calculation with proper values
function calculateBlitzGC(chaosBlitz) {
  // Chaos Blitz GC values based on usage
  const blitzCosts = {
    1: -49,
    2: -(49 + 89),
    3: -(49 + 89 + 189),
    4: -(49 + 89 + 189 + 189),
    5: -(49 + 89 + 189 + 189 + 189),
    6: -(49 + 89 + 189 + 189 + 189 + 189)
  };


  // Return the GC value for the given chaos blitz amount
  return blitzValues[chaosBlitz] || 0;
}

// Remove the old helper functions since we're using tables now
function calculateBossFightGC(ranking, damage, totalDays) {
  // This is now handled by the boss fight reward tables
  return 0;
}

function calculateBossFightDamageGC(damage, totalDays) {
  // This is now handled by the boss fight GC after fight table
  return 0;
}

// Update the display function to show detailed breakdown with correct categories
function displayGoldStrategy() {
  const simData = loadSimulationData();
  const strategies = calculateGoldStrategy(simData);
  const dynamicIncome = calculateDynamicGCIncome();
  
  const goal = simData.priority && simData.priority.includes("300m") ? "300m"
              : simData.priority && simData.priority.includes("360m") ? "360m"
              : simData.priority && simData.priority.includes("600m") ? "600m"
              : "900m";

  const strategyText = strategies[goal].strategy;
  
  // Add detailed breakdown with correct categories
  const breakdown = `
  
📊 Detailed Income Breakdown:
• Starting Gold: ${dynamicIncome.startingGold.toLocaleString()} GC
• Event Gold (calculated): ${dynamicIncome.totalGC.toLocaleString()} GC

Daily Rewards (${dynamicIncome.totalDays} days):
• Arena Daily: ${dynamicIncome.dailyGC.arenaDaily.toLocaleString()} GC
• Arena Weekly: ${dynamicIncome.dailyGC.arenaWeekly.toLocaleString()} GC
• Boss Fight Daily: ${dynamicIncome.dailyGC.bossFightDaily.toLocaleString()} GC
• Boss Fight GC After Fight: ${dynamicIncome.dailyGC.bossFightGCFight.toLocaleString()} GC
• Merchant Haggling: ${dynamicIncome.dailyGC.merchantHaggling.toLocaleString()} GC
• Daily Quests: ${dynamicIncome.dailyGC.dailyQuests.toLocaleString()} GC
• Library: ${dynamicIncome.dailyGC.library.toLocaleString()} GC
• Advertising: ${dynamicIncome.dailyGC.advertising.toLocaleString()} GC
• Campaign: ${dynamicIncome.dailyGC.campaign.toLocaleString()} GC

Weekly Rewards:
• Guild Event Thursday: ${dynamicIncome.dailyGC.guildEventThursday.toLocaleString()} GC
• Guild Umbras Thursday: ${dynamicIncome.dailyGC.guildUmbrsThursday.toLocaleString()} GC
• Sign-In Friday: ${dynamicIncome.dailyGC.signInFriday.toLocaleString()} GC
• Joyland Quests: ${dynamicIncome.dailyGC.joylandQuestsBiweekly.toLocaleString()} GC

Special:
• Chaos Blitz: ${dynamicIncome.dailyGC.blitz.toLocaleString()} GC
• Umbra Keys: ${dynamicIncome.dailyGC.umbraKeysPurchase.toLocaleString()} GC
• Lifetime Privilege: ${dynamicIncome.dailyGC.lifetimePrivilege.toLocaleString()} GC
• Umbra Free: ${dynamicIncome.dailyGC.umbraFree.toLocaleString()} GC
• Milestone Bonus: ${dynamicIncome.dailyGC.milestoneBonus.toLocaleString()} GC
  `;

  document.getElementById("strategyGuide").innerText = strategyText + breakdown;
}


function toggleSummarySection() {
  const showSummary = document.getElementById('showSummary').checked;
  const summarySection = document.getElementById('summarySection');
  summarySection.style.display = showSummary ? 'block' : 'none';
}

// Function to update prediction percentages
function updatePredictionDisplay(predictions) {
  const container = document.getElementById('predictionPercentages');
  if (!container) return;
  
  let html = '';
  for (const [encounter, percentage] of Object.entries(predictions)) {
    html += `<div style="display: inline-block; margin: 0 10px;">${encounter}: ${percentage}%</div>`;
  }
  container.innerHTML = html;
}

// Function to update multiplier recommendation
function updateMultiplierRecommendation(recommendation) {
  const element = document.getElementById('multiplierRecommendation');
  if (element) {
    element.textContent = recommendation;
  }
}


function calculateRealPercentages() {
  // Get current pattern history
  const recentEncounters = getRecentEncounters(); // Your function that gets last 2-3 encounters
  
  // Analyze what patterns are possible from current position
  const possibleNextEncounters = analyzePatterns(recentEncounters);
  
  // Calculate actual probabilities based on pattern frequency
  const totalPossibilities = possibleNextEncounters.length;
  const probabilityCount = {};
  
  possibleNextEncounters.forEach(encounter => {
    probabilityCount[encounter] = (probabilityCount[encounter] || 0) + 1;
  });
  
  // Convert to percentages
  const predictions = {};
  for (const [encounter, count] of Object.entries(probabilityCount)) {
    const percentage = Math.round((count / totalPossibilities) * 100);
    predictions[encounter] = `${percentage}%`;
  }
  
  updatePredictionDisplay(predictions);
  
  // Also update multiplier based on actual probabilities
  const recommendedMultiplier = calculateMultiplier(predictions);
  updateMultiplierRecommendation(recommendedMultiplier);
}

// Example based on your pattern:
// If current pattern is "Normal" -> possible next: ["Normal", "Normal", "Choose 1"]
// Then percentages would be: Normal: 66%, Choose 1: 33%

function updatePredictionDisplay(predictions) {
  const container = document.getElementById("predictionPercentages");
  if (!container) return;
  
  let html = '';
  for (const [encounter, percentage] of Object.entries(predictions)) {
    const displayName = getEncounterDisplayName(encounter);
    html += `<div style="display: inline-block; margin: 0 10px;">${displayName}: ${percentage}</div>`;
  }
  container.innerHTML = html || '<div>No pattern data</div>';
}

function updateMultiplierRecommendation(recommendation) {
  const element = document.getElementById("multiplierRecommendation");
  if (element) {
    element.textContent = recommendation;
  }
}

function getEncounterDisplayName(symbol) {
  const names = {
    "x": "Normal",
    "D": "Choose 1", 
    "f": "Devil",
    "F": "Monster",
    "t": "Gold Chest",
    "T": "Jackpot"
  };
  return names[symbol] || symbol;
}

// Add this to your existing initialization
document.addEventListener('DOMContentLoaded', function() {
  // Initialize the prediction display
  updatePredictionDisplay({
    "Normal": "0%",
    "Choose 1": "0%", 
    "Devil": "0%",
    "Monster": "0%",
    "Gold Chest": "0%",
    "Jackpot": "0%"
  });
  updateMultiplierRecommendation("--");
});

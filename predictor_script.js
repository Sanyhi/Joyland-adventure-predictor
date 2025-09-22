
const patterns = {
  P1: [..."xDxfxxDtxDxfT"],
  P2: [..."xxFxDtxxDTDxf"],
  P3: [..."xxDtxxFxDTxfD"],
  P4: [..."xxtxDxFxDxDFT"]
};

const encounterValues = {
  x: 250,
  D: 300,
  f: 550,
  F: 700,
  t: [100, 200, 300],
  T: [100, 1980]
};

function expectedValue(symbol) {
  if (['x', 'D', 'f', 'F'].includes(symbol)) return encounterValues[symbol];
  if (symbol === 't') return encounterValues.t.reduce((a,b)=>a+b)/encounterValues.t.length;
  if (symbol === 'T') return (encounterValues.T[0] + encounterValues.T[1]) / 2;
  return 0;
}

function predictNext(encounters, usedPatterns) {
  const candidates = Object.entries(patterns).filter(([k]) => !usedPatterns.includes(k));
  let bestMatch = null, bestScore = -1;

  for (const [name, sequence] of candidates) {
    let score = 0;
    for (let i = 0; i < encounters.length; i++) {
      if (sequence[i] === encounters[i]) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = name;
    }
  }

  if (!bestMatch) return { pattern: null, next: null, ev: 0, suggestion: "Pattern not identifiable yet." };

  const nextIndex = encounters.length;
  const nextSymbol = patterns[bestMatch][nextIndex];
  const ev = expectedValue(nextSymbol);
  let suggestion = "";

  if (nextSymbol === 'F') suggestion = "Guaranteed Monster encounter. Use maximum multiplier.";
  else if (ev >= 700) suggestion = `Likely ${nextSymbol} with EV ${ev.toFixed(2)} JC. Proceed.`;
  else suggestion = `EV ${ev.toFixed(2)} JC is below threshold. Consider skipping.`;

  return { pattern: bestMatch, next: nextSymbol, ev, suggestion };
}

function updatePrediction() {
  const records = JSON.parse(localStorage.getItem('encounterRecords')) || [];
  const encounterSymbols = records.map(r => {
    switch (r.encounter) {
      case "Normal encounter": return 'x';
      case "Choose 1 encounter": return 'D';
      case "Little devil (puzzle) encounter": return 'f';
      case "Monster (Axe throw) encounter": return 'F';
      case "Treasure chest (gold)": return 't';
      case "Treasure chest (jackpot)": return 'T';
      default: return '?';
    }
  });

  const usedPatterns = [];
  const { pattern, next, ev, suggestion } = predictNext(encounterSymbols, usedPatterns);

  document.getElementById("patternInfo").textContent = `Pattern: ${pattern || 'Unknown'}`;
  document.getElementById("nextSymbol").textContent = `Next: ${next || '?'}`;
  document.getElementById("evInfo").textContent = `EV: ${ev.toFixed(2)} JC`;
  document.getElementById("suggestion").textContent = suggestion;

  const gif = next ? `${next}.gif` : "uncertain.gif";
  document.getElementById("predictionGif").src = gif;
}

window.onload = () => {
  updatePrediction();
};

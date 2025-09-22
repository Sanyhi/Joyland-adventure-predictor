
function recordEncounter() {
  const encounter = document.getElementById('encounter').value;
  const multiplier = document.getElementById('multiplier').value;
  const amount = document.getElementById('amount').value;
  const risk = document.getElementById('risk').value;
  const priority = document.getElementById('priority').value;

  const record = {
    risk,
    priority,
    encounter,
    multiplier,
    amount
  };

  let records = JSON.parse(localStorage.getItem('encounterRecords')) || [];
  records.push(record);
  localStorage.setItem('encounterRecords', JSON.stringify(records));
  alert('Encounter recorded successfully.');
}

window.onload = () => {
  document.getElementById("encounter").addEventListener("change", function() {
    const value = this.value;
    const multiplier = document.getElementById("multiplier");
    const amount = document.getElementById("amount");
    if (value === "GoldChest" || value === "JackpotChest") {
      multiplier.style.display = "inline-block";
      amount.style.display = "inline-block";
    } else {
      multiplier.style.display = "none";
      amount.style.display = "none";
    }
  });
};

document.addEventListener("DOMContentLoaded", () => {
  ensureUserId();
  const simData = loadSimulationData();
  document.getElementById("riskLevel").value = simData.riskLevel || "Low Risk";
  document.getElementById("priority").value = simData.priority || "Gold";
  updateSummary();

  document.getElementById("encounterType").addEventListener("change", () => {
    const type = document.getElementById("encounterType").value;
    const showMultiplier = type.includes("Treasure chest");
    document.getElementById("multiplier").style.display = showMultiplier ? "inline-block" : "none";
    document.getElementById("amount").style.display = showMultiplier ? "inline-block" : "none";
  });
});

function recordEncounter() {
  const type = document.getElementById("encounterType").value;
  const multiplier = document.getElementById("multiplier").value;
  const amount = document.getElementById("amount").value;
  const encounter = { type };
  if (type.includes("Treasure chest")) {
    encounter.multiplier = multiplier;
    encounter.amount = parseInt(amount);
    encounter.resource = type.includes("gold") ? "GC" : "JC";
  }
  recordEncounter(encounter);
  updateSummary();
}

function updateSummary() {
  const data = exportData();
  document.getElementById("summaryOutput").textContent = data;
}

function exportToClipboard() {
  navigator.clipboard.writeText(exportData());
  alert("Data copied to clipboard");
}

function importFromText() {
  const text = document.getElementById("importArea").value;
  if (importData(text)) {
    alert("Data imported successfully");
    updateSummary();
  } else {
    alert("Failed to import data");
  }
}

function goBack() {
  window.location.href = "simulator.html";
}

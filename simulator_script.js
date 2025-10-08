function loadSimulationData() {
  const data = JSON.parse(localStorage.getItem("simulatorData")) || {};
  if (data.risk) document.getElementById("risk").value = data.risk;
  if (data.priority) document.getElementById("priority").value = data.priority;
  if (data.gc) document.getElementById("gc").value = data.gc;
  if (data.bossFightRanking) document.getElementById("bossFightRanking").value = data.bossFightRanking;
  if (data.arenaRanking) document.getElementById("arenaRanking").value = data.arenaRanking;
  if (data.bossFightDmg) document.getElementById("bossFightDmg").value = data.bossFightDmg;
  if (data.merchantHaggling) document.getElementById("merchantHaggling").value = data.merchantHaggling;
  if (data.chaosBlitz) document.getElementById("chaosBlitz").value = data.chaosBlitz;
  if (data.lifetimePrivilege) document.getElementById("lifetimePrivilege").checked = true;
}
window.onload = () => {
  loadSimulationData();
  // existing logic...
};

window.onload = () => {
  const confirmBtn = document.getElementById("confirmBtn");
  const toPredictorBtn = document.getElementById("toPredictorBtn");

  function allFilled() {
    const requiredFields = ["risk", "priority", "gc", "bossFightRanking", "arenaRanking", "bossFightDmg", "merchantHaggling", "chaosBlitz"];
    return requiredFields.every(id => document.getElementById(id).value.trim() !== "");
  }

  function showConfirmIfReady() {
    confirmBtn.style.display = allFilled() ? "inline-block" : "none";
  }

  document.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("input", showConfirmIfReady);
    el.addEventListener("change", showConfirmIfReady);
  });

  confirmBtn.addEventListener("click", () => {
    const data = {
      risk: document.getElementById("risk").value,
      priority: document.getElementById("priority").value,
      gc: document.getElementById("gc").value,
      bossFightRanking: document.getElementById("bossFightRanking").value,
      arenaRanking: document.getElementById("arenaRanking").value,
      bossFightDmg: document.getElementById("bossFightDmg").value,
      merchantHaggling: document.getElementById("merchantHaggling").value,
      chaosBlitz: document.getElementById("chaosBlitz").value,
      lifetimePrivilege: document.getElementById("lifetimePrivilege").checked
    };
    localStorage.setItem("simulatorData", JSON.stringify(data));
    toPredictorBtn.style.display = "inline-block";
  });
};

function toggleInputs()
  {
  const lifetime = document.getElementById("privlige").checked;
  const goldMining = document.getElementById("goldMining").checked;
  document.getElementById("magicKeyContainer").style.display = lifetime ? "block" : "none";
  document.getElementById("compassContainer").style.display = goldMining ? "block" : "none";
}

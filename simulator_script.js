
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

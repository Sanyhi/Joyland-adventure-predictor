
window.onload = () => {
  const confirmBtn = document.getElementById("confirm");
  const nextPageBtn = document.getElementById("nextPage");

  function allFilled() {
    const requiredFields = ["risk", "priority", "bossRank", "arenaRank", "bossDmg", "merchant", "chaos"];
    return requiredFields.every(id => document.getElementById(id).value.trim() !== "");
  }

  function showConfirmIfReady() {
    confirmBtn.style.display = allFilled() ? "inline-block" : "none";
    nextPageBtn.style.display = "none";
  }

  document.querySelectorAll("input, select").forEach(el => {
    el.addEventListener("input", showConfirmIfReady);
    el.addEventListener("change", showConfirmIfReady);
  });

  confirmBtn.addEventListener("click", () => {
    const data = {
      risk: document.getElementById("risk").value,
      priority: document.getElementById("priority").value,
      bossRank: document.getElementById("bossRank").value,
      arenaRank: document.getElementById("arenaRank").value,
      bossDmg: document.getElementById("bossDmg").value,
      privilege: document.getElementById("privilege").checked,
      merchant: document.getElementById("merchant").value,
      chaos: document.getElementById("chaos").value
    };
    localStorage.setItem("simulatorData", JSON.stringify(data));
    nextPageBtn.style.display = "inline-block";
  });
};

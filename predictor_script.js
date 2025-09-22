
window.onload = () => {
  const data = JSON.parse(localStorage.getItem('simulatorData')) || {};
  document.getElementById('riskValue').textContent = data.risk || 'N/A';
  document.getElementById('priorityValue').textContent = data.priority || 'N/A';

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

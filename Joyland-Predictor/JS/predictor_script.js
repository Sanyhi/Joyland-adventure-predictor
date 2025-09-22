
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

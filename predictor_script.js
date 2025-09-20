
window.onload = () => {
  // Function to update predictor page with simulation data
function updatePredictorPage() {
    // Get values from simulation page
    const riskLevel = document.getElementById('risk-level').value;
    const preference = document.getElementById('preference').value;
    
    // Set values on predictor page
    document.getElementById('predictor-risk').value = riskLevel;
    document.getElementById('predictor-preference').value = preference;
    
    // Update displayed values
    document.getElementById('display-risk').textContent = riskLevel;
    document.getElementById('display-preference').textContent = preference;
}

// Function to record actions
let actionCount = 0;

function recordAction() {
    actionCount++;
    const encounterType = document.getElementById('encounter-type').value;
    const encounterValue = `${actionCount}x1m`;
    
    // Update encounter value display
    document.getElementById('encounter-value').textContent = encounterValue;
    
    // Add to action log
    const actionList = document.getElementById('action-list');
    const actionItem = document.createElement('div');
    actionItem.className = 'action-item';
    actionItem.textContent = `Action ${actionCount}: ${encounterType} - ${encounterValue}`;
    actionList.appendChild(actionItem);
    
    // Show special button after 10 actions
    if (actionCount >= 10) {
        document.getElementById('special-btn').style.display = 'block';
    }
}

// Function for special action
function specialAction() {
    alert('Special action activated! You have recorded 10 or more actions.');
}

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

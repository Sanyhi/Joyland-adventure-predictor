function saveSimulationData(data) {
  localStorage.setItem("joyland_simulation", JSON.stringify(data));
}

function loadSimulationData() {
  return JSON.parse(localStorage.getItem("joyland_simulation")) || {};
}

function recordEncounter(encounter) {
  const history = JSON.parse(localStorage.getItem("joyland_encounters")) || [];
  history.push(encounter);
  localStorage.setItem("joyland_encounters", JSON.stringify(history));
}

function loadEncounters() {
  return JSON.parse(localStorage.getItem("joyland_encounters")) || [];
}

function exportData() {
  const data = {
    simulation: loadSimulationData(),
    encounters: loadEncounters()
  };
  return JSON.stringify(data, null, 2);
}

function importData(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.simulation) saveSimulationData(data.simulation);
    if (data.encounters) localStorage.setItem("joyland_encounters", JSON.stringify(data.encounters));
    return true;
  } catch (e) {
    console.error("Invalid import data", e);
    return false;
  }
}

function ensureUserId() {
  let userId = localStorage.getItem("joyland_user_id");
  if (!userId) {
    userId = "user_" + Date.now();
    localStorage.setItem("joyland_user_id", userId);
  }
  return userId;
}

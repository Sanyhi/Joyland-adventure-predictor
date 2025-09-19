
function updateDateTime() {
  const now = new Date();
  document.getElementById("currentDateTime").textContent = now.toLocaleString();
}

function getJoylandEventStatus() {
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  let nextEventDate = new Date(now);
  nextEventDate.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7));
  while (getWeekNumber(nextEventDate) % 2 === 0) {
    nextEventDate.setDate(nextEventDate.getDate() + 7);
  }
  const eventStart = new Date(nextEventDate);
  const eventEnd = new Date(eventStart);
  eventEnd.setDate(eventStart.getDate() + 3);
  if (now >= eventStart && now <= eventEnd) {
    const dayNumber = Math.floor((now - eventStart) / (1000 * 60 * 60 * 24)) + 1;
    return `Joyland Event: Day ${dayNumber}`;
  } else {
    const daysLeft = Math.ceil((eventStart - now) / (1000 * 60 * 60 * 24));
    return `Next Joyland Event in ${daysLeft} day(s)`;
  }
}

function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1)/7);
  return weekNo;
}

window.onload = () => {
  updateDateTime();
  document.getElementById("eventCountdown").textContent = getJoylandEventStatus();
  setInterval(updateDateTime, 1000);
};

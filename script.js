
document.getElementById("encounter").addEventListener("change", function() {
    const value = this.value;
    const multiplierSection = document.getElementById("multiplierSection");
    const amountSection = document.getElementById("amountSection");

    if (value === "GoldChest" || value === "JackpotChest") {
        multiplierSection.style.display = "block";
        amountSection.style.display = "block";
    } else {
        multiplierSection.style.display = "none";
        amountSection.style.display = "none";
    }
});

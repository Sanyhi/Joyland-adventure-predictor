
function saveData() {
    const data = {
        risk: document.getElementById('risk').value,
        priority: document.getElementById('priority').value,
        bossRank: document.getElementById('bossRank').value,
        arenaRank: document.getElementById('arenaRank').value,
        bossDmg: document.getElementById('bossDmg').value,
        privilege: document.getElementById('privilege').checked,
        merchant: document.getElementById('merchant').value,
        chaos: document.getElementById('chaos').value
    };
    localStorage.setItem('simulatorData', JSON.stringify(data));
    document.getElementById('nextPage').style.display = 'inline-block';
}

function checkFields() {
    const required = ['risk', 'priority', 'bossRank', 'arenaRank', 'bossDmg', 'merchant', 'chaos'];
    let allFilled = required.every(id => document.getElementById(id).value !== '');
    if (allFilled) {
        document.getElementById('confirm').style.display = 'inline-block';
    } else {
        document.getElementById('confirm').style.display = 'none';
        document.getElementById('nextPage').style.display = 'none';
    }
}

window.onload = () => {
    document.querySelectorAll('select, input[type=number]').forEach(el => {
        el.addEventListener('input', checkFields);
    });
};

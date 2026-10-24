// --- GESTION DES ONGLETS ---
function switchTab(tab) {
    document.querySelectorAll('.document-container').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('module-' + tab).classList.add('active');
    event.target.classList.add('active');
}

// --- IMPORTATION DES LOGOS ---
function previewImage(input, imgId) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById(imgId).src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// --- GESTION DES TABLEAUX ---
let devisData = [
    { qte: 2, lib: "Boites email Gris", pu: 30 },
    { qte: 3, lib: "Boites email blanc", pu: 30 },
    { qte: 3, lib: "Sceaux latex PDF", pu: 55 },
    { qte: 5, lib: "Boites email PDF", pu: 30 },
    { qte: 8, lib: "Litres pétrole", pu: 3 },
    { qte: 5, lib: "Rouleaux", pu: 3 },
    { qte: 5, lib: "Roulettes", pu: 2 },
    { qte: 2, lib: "Sceaux latex blanc", pu: 55 },
    { qte: 2, lib: "Boites email noir", pu: 30 },
    { qte: 3, lib: "Boites vernis", pu: 30 },
    { qte: 5, lib: "Pièces colorants", pu: 3 },
    { qte: 6, lib: "Brosses", pu: 2 },
    { qte: 2, lib: "Sceaux vides", pu: 3 }
];

let factureData = [
    { lib: "Boîte Email blanc pour plinthes", unite: "Pce", qte: 27, pu: 2 },
    { lib: "Tonnelet latex blanc pour murs", unite: "Pce", qte: 5, pu: 10 }
];

function renderTable(type) {
    const tbody = document.getElementById(`tbody-${type}`);
    tbody.innerHTML = '';
    const data = type === 'devis' ? devisData : factureData;

    data.forEach((item, index) => {
        const tr = document.createElement('tr');
        if(type === 'devis') {
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="number" value="${item.qte}" onchange="updateLine('${type}', ${index}, 'qte', this.value)" style="width:50px"></td>
                <td><input type="text" value="${item.lib}" onchange="updateLine('${type}', ${index}, 'lib', this.value)" style="width:100%; border:none"></td>
                <td><input type="number" value="${item.pu}" onchange="updateLine('${type}', ${index}, 'pu', this.value)" style="width:60px"></td>
                <td class="pt-cell">${item.qte * item.pu}</td>
            `;
        } else {
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="text" value="${item.lib}" onchange="updateLine('${type}', ${index}, 'lib', this.value)" style="width:100%; border:none"></td>
                <td><input type="text" value="${item.unite}" onchange="updateLine('${type}', ${index}, 'unite', this.value)" style="width:40px; border:none"></td>
                <td><input type="number" value="${item.qte}" onchange="updateLine('${type}', ${index}, 'qte', this.value)" style="width:50px"></td>
                <td><input type="number" value="${item.pu}" onchange="updateLine('${type}', ${index}, 'pu', this.value)" style="width:60px"></td>
                <td class="pt-cell">${item.qte * item.pu}</td>
            `;
        }
        tbody.appendChild(tr);
    });
    calculerTotaux(type);
}

function updateLine(type, index, field, value) {
    const data = type === 'devis' ? devisData : factureData;
    data[index][field] = field === 'qte' || field === 'pu' ? parseFloat(value) : value;
    renderTable(type);
}

function ajouterLigne(type) {
    const data = type === 'devis' ? devisData : factureData;
    if(type === 'devis') data.push({ qte: 1, lib: "", pu: 0 });
    else data.push({ lib: "", unite: "Pce", qte: 1, pu: 0 });
    renderTable(type);
}

// --- CALCULS ET MONNAIE ---
function calculerTotaux(type) {
    const data = type === 'devis' ? devisData : factureData;
    let sousTotal = 0;
    
    data.forEach(item => { sousTotal += (item.qte * item.pu); });
    
    const mainOeuvre = parseFloat(document.getElementById(`${type === 'devis' ? 'dev' : 'fact'}-main-oeuvre`).value) || 0;
    const totalGlobal = sousTotal + mainOeuvre;

    if(type === 'devis') {
        document.getElementById('dev-total').innerText = sousTotal.toFixed(2);
        document.getElementById('dev-totaux').innerText = totalGlobal.toFixed(2);
        document.getElementById('dev-global').innerText = totalGlobal.toFixed(2);
        genererLettres(totalGlobal, 'devis');
    } else {
        document.getElementById('fact-sous-total').innerText = sousTotal.toFixed(2);
        document.getElementById('fact-global').innerText = totalGlobal.toFixed(2);
        genererLettres(totalGlobal, 'facture');
    }
}

// Changement de devise (Met à jour les symboles et le texte)
function changeDevise(type) {
    const devise = document.getElementById(`devise-${type}`).value;
    const symboles = document.querySelectorAll(`#module-${type} .symbole-devise`);
    symboles.forEach(el => el.innerText = devise);
    calculerTotaux(type);
}

// --- CONVERSION NOMBRE EN LETTRES (FRANÇAIS) ---
function genererLettres(nombre, type) {
    const deviseSelect = document.getElementById(`devise-${type}`).value;
    const nomDevise = deviseSelect === '$' ? "Dollars américains" : "Francs congolais";
    
    // Séparation entier / décimal
    let entier = Math.floor(nombre);
    let decimal = Math.round((nombre - entier) * 100);
    
    let texte = `${nomDevise} ${convertirEntier(entier)}`;
    if (decimal > 0) texte += ` virgule ${convertirEntier(decimal)}`;
    
    // Majuscule au début
    texte = texte.charAt(0).toUpperCase() + texte.slice(1);
    
    document.getElementById(`${type === 'devis' ? 'dev' : 'fact'}-lettres`).innerText = texte;
}

function convertirEntier(n) {
    if (n === 0) return "zéro";
    const unites = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
    const dizaines = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];
    
    if (n < 20) return unites[n];
    if (n < 100) {
        let d = Math.floor(n / 10);
        let u = n % 10;
        if (d === 7 || d === 9) return dizaines[d - 1] + "-" + unites[10 + u];
        return dizaines[d] + (u === 1 && d !== 8 ? "-et-" : (u > 0 ? "-" : "")) + unites[u];
    }
    if (n < 1000) {
        let c = Math.floor(n / 100);
        let r = n % 100;
        let cent = c === 1 ? "cent" : unites[c] + " cent";
        return cent + (r > 0 ? " " + convertirEntier(r) : "");
    }
    if (n < 1000000) {
        let m = Math.floor(n / 1000);
        let r = n % 1000;
        let mille = m === 1 ? "mille" : convertirEntier(m) + " mille";
        return mille + (r > 0 ? " " + convertirEntier(r) : "");
    }
    return n.toString(); // Simplifié pour ce cas d'usage
}

// --- SIGNATURE TACTILE ---
const canvases = {};
function initSignature(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    let drawing = false;

    // Ajuster la taille du canvas
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';

    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const start = (e) => { e.preventDefault(); drawing = true; const pos = getPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y); };
    const move = (e) => { e.preventDefault(); if (!drawing) return; const pos = getPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke(); };
    const end = (e) => { e.preventDefault(); drawing = false; };

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', move);
    canvas.addEventListener('mouseup', end);
    canvas.addEventListener('mouseout', end);
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', move, { passive: false });
    canvas.addEventListener('touchend', end);
}

function clearCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// --- INITIALISATION ---
window.onload = () => {
    renderTable('devis');
    renderTable('facture');
    initSignature('canvas-devis');
    initSignature('canvas-facture');

    // Enregistrement du Service Worker pour la PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(() => console.log('SW Registered'));
    }
};
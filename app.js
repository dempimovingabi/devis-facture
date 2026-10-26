// --- GESTION DE LA SAUVEGARDE (LOCAL STORAGE) ---
function saveState() {
    localStorage.setItem('dempi_devisData', JSON.stringify(devisData));
    localStorage.setItem('dempi_factureData', JSON.stringify(factureData));

    document.querySelectorAll('input, textarea, [contenteditable="true"]').forEach(el => {
        let key = el.id || el.className || 'input_' + Array.from(document.querySelectorAll('input, textarea, [contenteditable]')).indexOf(el);
        if (el.hasAttribute('contenteditable')) {
            localStorage.setItem('dempi_content_' + key, el.innerHTML);
        } else {
            localStorage.setItem('dempi_val_' + key, el.value);
        }
    });
}

function loadState() {
    const savedDevis = localStorage.getItem('dempi_devisData');
    if (savedDevis) devisData = JSON.parse(savedDevis);

    const savedFacture = localStorage.getItem('dempi_factureData');
    if (savedFacture) factureData = JSON.parse(savedFacture);

    document.querySelectorAll('input, textarea, [contenteditable="true"]').forEach(el => {
        let key = el.id || el.className || 'input_' + Array.from(document.querySelectorAll('input, textarea, [contenteditable]')).indexOf(el);
        if (el.hasAttribute('contenteditable')) {
            const saved = localStorage.getItem('dempi_content_' + key);
            if (saved) el.innerHTML = saved;
        } else {
            const saved = localStorage.getItem('dempi_val_' + key);
            if (saved !== null) el.value = saved;
        }
    });

    // Charger les réglages de style
    const savedLineHeight = localStorage.getItem('dempi_line_height');
    if(savedLineHeight) {
        document.getElementById('global-line-height').value = savedLineHeight;
        document.documentElement.style.setProperty('--global-line-height', savedLineHeight);
    }
    
    const savedSigColor = localStorage.getItem('dempi_sig_color');
    if(savedSigColor) document.getElementById('signature-color').value = savedSigColor;

    const savedRowHeight = localStorage.getItem('dempi_row_height');
    if(savedRowHeight) {
        document.getElementById('table-row-height').value = savedRowHeight;
        document.documentElement.style.setProperty('--table-cell-padding', savedRowHeight + 'px');
    }

    renderTable('devis');
    renderTable('facture');
    document.querySelectorAll('.auto-resize, .input-textarea-cell').forEach(autoResizeTextarea);
}

function clearAllData() {
    if(confirm("Voulez-vous vraiment effacer TOUTES les données et recommencer à zéro ?")) {
        localStorage.clear();
        location.reload();
    }
}

// --- REDIMENSIONNEMENT DES COLONNES ---
function initColumnResize() {
    const resizers = document.querySelectorAll('.resizer');
    resizers.forEach(resizer => {
        let startX, startWidth, th;
        
        const startResize = (e) => {
            e.preventDefault();
            th = resizer.parentElement;
            startX = e.touches ? e.touches[0].pageX : e.pageX;
            startWidth = th.offsetWidth;
            
            document.addEventListener('mousemove', doResize);
            document.addEventListener('mouseup', stopResize);
            document.addEventListener('touchmove', doResize, { passive: false });
            document.addEventListener('touchend', stopResize);
        };

        const doResize = (e) => {
            if(!th) return;
            const x = e.touches ? e.touches[0].pageX : e.pageX;
            const newWidth = startWidth + (x - startX);
            
            if (newWidth > 30) {
                th.style.width = newWidth + 'px';
                const colIndex = Array.from(th.parentElement.children).indexOf(th);
                const table = th.closest('table');
                table.querySelectorAll('tbody tr').forEach(row => {
                    if(row.children[colIndex]) row.children[colIndex].style.width = newWidth + 'px';
                });
            }
        };

        const stopResize = () => {
            document.removeEventListener('mousemove', doResize);
            document.removeEventListener('mouseup', stopResize);
            document.removeEventListener('touchmove', doResize);
            document.removeEventListener('touchend', stopResize);
            saveState();
        };

        resizer.addEventListener('mousedown', startResize);
        resizer.addEventListener('touchstart', startResize, { passive: false });
    });
}

function resetTableWidths() {
    if(confirm("Réinitialiser la largeur de toutes les colonnes ?")) {
        document.querySelectorAll('.custom-table th, .custom-table td').forEach(cell => {
            cell.style.width = '';
        });
    }
}

// --- NAVIGATION ET MENU ---
function toggleMenu() { document.getElementById('side-menu').classList.toggle('open'); }
function switchTab(tab, btnElement) {
    document.querySelectorAll('.document-container').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('module-' + tab).classList.add('active');
    if(btnElement) btnElement.classList.add('active');
    toggleMenu();
}

// --- MISE EN PAGE GLOBALE ---
function updateGlobalStyle() {
    const lineHeight = document.getElementById('global-line-height').value;
    document.documentElement.style.setProperty('--global-line-height', lineHeight);
    localStorage.setItem('dempi_line_height', lineHeight);
    document.querySelectorAll('.auto-resize, .input-textarea-cell').forEach(autoResizeTextarea);
}

function updateSignatureColor() {
    const color = document.getElementById('signature-color').value;
    localStorage.setItem('dempi_sig_color', color);
    // La nouvelle couleur s'appliquera aux prochains traits tracés
}

// --- PERSONNALISATION ENTETE ---
function updateHeaderStyle() {
    const font = document.getElementById('header-font').value;
    const size = document.getElementById('header-size').value + 'px';
    const color = document.getElementById('header-color').value;
    const isBold = document.getElementById('header-bold').checked;
    const isItalic = document.getElementById('header-italic').checked;
    const wordart = document.getElementById('header-wordart').value;

    document.querySelectorAll('.main-title').forEach(el => {
        el.style.fontFamily = font;
        el.style.fontSize = size;
        el.style.color = (wordart === 'none') ? color : '';
        el.style.fontWeight = isBold ? 'bold' : 'normal';
        el.style.fontStyle = isItalic ? 'italic' : 'normal';
        el.className = 'main-title'; 
        if(wordart !== 'none') el.classList.add(wordart);
    });
    saveState();
}

// --- PERSONNALISATION TABLEAU ---
function updateTableStyle() {
    const font = document.getElementById('table-font').value;
    const size = document.getElementById('table-size').value + 'px';
    const color = document.getElementById('table-color').value;
    const wordart = document.getElementById('table-wordart').value;

    document.querySelectorAll('.custom-table').forEach(table => {
        table.style.setProperty('--table-font', font);
        table.style.setProperty('--table-size', size);
        table.style.setProperty('--table-color', color);
        
        // Gérer les classes WordArt
        table.className = 'custom-table';
        if(wordart !== 'none') table.classList.add(wordart);
    });
    saveState();
}

function updateTableDimensions() {
    const height = document.getElementById('table-row-height').value;
    document.documentElement.style.setProperty('--table-cell-padding', height + 'px');
    localStorage.setItem('dempi_row_height', height);
    document.querySelectorAll('.input-textarea-cell').forEach(autoResizeTextarea);
}

// --- IMPORTATION D'IMAGES ---
function previewImage(input, imgId) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            const img = document.getElementById(imgId);
            img.src = e.target.result;
            if(imgId === 'img-sceau') {
                img.style.display = 'block';
                document.getElementById('stamp-placeholder').style.display = 'none';
            }
            localStorage.setItem('dempi_img_' + imgId, e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function loadImages() {
    ['img-gauche', 'img-droite', 'img-gauche-f', 'img-droite-f', 'img-sceau'].forEach(id => {
        const savedImg = localStorage.getItem('dempi_img_' + id);
        if (savedImg) {
            const img = document.getElementById(id);
            if(img) {
                img.src = savedImg;
                if(id === 'img-sceau') {
                    img.style.display = 'block';
                    const ph = document.getElementById('stamp-placeholder');
                    if(ph) ph.style.display = 'none';
                }
            }
        }
    });
}

// --- GESTION DES DONNEES ---
let devisData = [
    { qte: 2, lib: "Boites email Gris", pu: 30 },
    { qte: 3, lib: "Boites email blanc", pu: 30 }
];
let factureData = [
    { lib: "Boîte Email blanc pour plinthes", unite: "Pce", qte: 27, pu: 2 }
];

function autoResizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}

function renderTable(type) {
    const tbody = document.getElementById(`tbody-${type}`);
    tbody.innerHTML = '';
    const data = type === 'devis' ? devisData : factureData;

    data.forEach((item, index) => {
        const tr = document.createElement('tr');
        if(type === 'devis') {
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><input type="number" value="${item.qte}" oninput="updateLine('${type}', ${index}, 'qte', this.value)" style="width:100%; text-align:center; border:none; background:transparent;"></td>
                <td><textarea class="input-textarea-cell" oninput="autoResizeTextarea(this); updateLine('${type}', ${index}, 'lib', this.value)">${item.lib}</textarea></td>
                <td><input type="number" value="${item.pu}" oninput="updateLine('${type}', ${index}, 'pu', this.value)" style="width:100%; text-align:center; border:none; background:transparent;"></td>
                <td class="pt-cell">${(item.qte * item.pu).toFixed(2)}</td>
                <td class="no-print"><button class="btn-del" onclick="deleteLine('${type}', ${index})">X</button></td>
            `;
        } else {
            tr.innerHTML = `
                <td>${index + 1}</td>
                <td><textarea class="input-textarea-cell" oninput="autoResizeTextarea(this); updateLine('${type}', ${index}, 'lib', this.value)">${item.lib}</textarea></td>
                <td><input type="text" value="${item.unite}" oninput="updateLine('${type}', ${index}, 'unite', this.value)" style="width:100%; border:none; text-align:center; background:transparent;"></td>
                <td><input type="number" value="${item.qte}" oninput="updateLine('${type}', ${index}, 'qte', this.value)" style="width:100%; text-align:center; border:none; background:transparent;"></td>
                <td><input type="number" value="${item.pu}" oninput="updateLine('${type}', ${index}, 'pu', this.value)" style="width:100%; text-align:center; border:none; background:transparent;"></td>
                <td class="pt-cell">${(item.qte * item.pu).toFixed(2)}</td>
                <td class="no-print"><button class="btn-del" onclick="deleteLine('${type}', ${index})">X</button></td>
            `;
        }
        tbody.appendChild(tr);
    });
    tbody.querySelectorAll('.input-textarea-cell').forEach(autoResizeTextarea);
    calculerTotaux(type);
}

function updateLine(type, index, field, value) {
    const data = type === 'devis' ? devisData : factureData;
    data[index][field] = (field === 'qte' || field === 'pu') ? parseFloat(value) || 0 : value;
    const row = document.getElementById(`tbody-${type}`).children[index];
    if (row) row.querySelector('.pt-cell').innerText = (data[index].qte * data[index].pu).toFixed(2);
    calculerTotaux(type);
    saveState();
}

function ajouterLigne(type) {
    const data = type === 'devis' ? devisData : factureData;
    if(type === 'devis') data.push({ qte: 1, lib: "Nouvel article", pu: 0 });
    else data.push({ lib: "Nouvel article", unite: "Pce", qte: 1, pu: 0 });
    renderTable(type);
    saveState();
}

function deleteLine(type, index) {
    if(confirm("Voulez-vous vraiment supprimer cette ligne ?")) {
        const data = type === 'devis' ? devisData : factureData;
        data.splice(index, 1);
        renderTable(type);
        saveState();
    }
}

// --- CALCULS ---
function calculerTotaux(type) {
    const data = type === 'devis' ? devisData : factureData;
    let sousTotal = 0;
    data.forEach(item => { sousTotal += (item.qte * item.pu); });
    
    const pctInput = document.getElementById(`${type === 'devis' ? 'dev' : 'fact'}-main-oeuvre-pct`);
    const valInput = document.getElementById(`${type === 'devis' ? 'dev' : 'fact'}-main-oeuvre-val`);
    
    const pourcentage = parseFloat(pctInput.value) || 0;
    const mainOeuvreVal = sousTotal * (pourcentage / 100);
    valInput.value = mainOeuvreVal.toFixed(2);

    const totalGlobal = sousTotal + mainOeuvreVal;

    if(type === 'devis') {
        document.getElementById('dev-total').innerText = sousTotal.toFixed(2);
        document.getElementById('dev-global').innerText = totalGlobal.toFixed(2);
    } else {
        document.getElementById('fact-sous-total').innerText = sousTotal.toFixed(2);
        document.getElementById('fact-global').innerText = totalGlobal.toFixed(2);
    }
    genererLettres(totalGlobal, type);
}

function changeDevise(type) {
    const devise = document.getElementById(`devise-${type}`).value;
    document.querySelectorAll(`#module-${type} .symbole-devise`).forEach(el => el.innerText = devise);
    calculerTotaux(type);
    saveState();
}

// --- CONVERSION LETTRES ---
function genererLettres(nombre, type) {
    const deviseSelect = document.getElementById(`devise-${type}`).value;
    const nomDevise = deviseSelect === '$' ? "Dollars américains" : "Francs congolais";
    
    let entier = Math.floor(nombre);
    let decimal = Math.round((nombre - entier) * 100);
    let texteDecimal = decimal > 0 ? `, ${decimal < 10 ? 'zéro ' : ''}${convertirEntier(decimal)}` : "";
    
    let texte = `${nomDevise} ${convertirEntier(entier)}${texteDecimal}`;
    texte = texte.charAt(0).toUpperCase() + texte.slice(1).toLowerCase();
    
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
        return dizaines[d] + (u === 1 && d !== 8 ? "-et-un" : (u > 0 ? "-" + unites[u] : ""));
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
    return n.toString();
}

// --- SIGNATURE TACTILE ---
function initSignature(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let drawing = false;

    // Récupérer la couleur choisie
    const sigColor = document.getElementById('signature-color').value;
    
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = sigColor;

    const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
    };

    const start = (e) => { 
        e.preventDefault(); 
        drawing = true; 
        // Mettre à jour la couleur à chaque nouveau trait
        ctx.strokeStyle = document.getElementById('signature-color').value;
        const pos = getPos(e); 
        ctx.beginPath(); 
        ctx.moveTo(pos.x, pos.y); 
    };
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
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    loadImages();
    
    initSignature('canvas-devis');
    initSignature('canvas-facture');
    initColumnResize();

    // Appliquer les styles sauvegardés au démarrage
    updateTableStyle();
    updateGlobalStyle();

    document.querySelectorAll('input, textarea, [contenteditable="true"]').forEach(el => {
        el.addEventListener('input', saveState);
        el.addEventListener('blur', saveState);
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW Error', err));
        });
    }
});

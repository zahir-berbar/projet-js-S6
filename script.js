const listeMots = [
    "chat", "chien", "soleil", "ordinateur", "clavier",
    "maison", "jardin", "voiture", "musique", "livre",
    "table", "chaise", "fenêtre", "porte", "lumière",
    "écran", "souris", "café", "pain", "eau",
    "arbre", "fleur", "nuage", "montagne", "rivière",
    "téléphone", "radio", "télévision", "journal", "lettre",
    "école", "bureau", "magasin", "restaurant", "hôpital",
    "train", "avion", "bateau", "vélo", "moto",
    "rouge", "bleu", "vert", "jaune", "noir",
    "grand", "petit", "beau", "bon", "rapide",
    "jouer", "courir", "sauter", "danser", "chanter",
    "manger", "boire", "dormir", "lire", "écrire",
    "ville", "pays", "monde", "terre", "ciel",
    "jour", "nuit", "matin", "soir", "heure",
    "ami", "famille", "frère", "sœur", "parent",
    "programmation", "développement", "algorithme", "architecture", "cybersécurité",
    "intelligence", "artificielle", "apprentissage", "automatisation", "optimisation",
    "température", "atmosphère", "photosynthèse", "chromosome", "médicament",
    "bibliothèque", "mathématiques", "philosophie", "psychologie", "sociologie",
    "responsabilité", "environnement", "biodiversité", "développement", "transformation",
    "extraordinaire", "magnifique", "spectaculaire", "incroyable", "fantastique",
    "communication", "collaboration", "coordination", "organisation", "planification"
];

const motsCourts = listeMots.filter(mot => mot.length <= 5);
const motsMoyens = listeMots.filter(mot => mot.length >= 6 && mot.length <= 8);
const motsLongs = listeMots.filter(mot => mot.length >= 9);

const parametresUrl = window.location.search.split("?")[1]?.split("=") || ["Facile", "0"];
const niveauSelectionne = parseInt(parametresUrl[1]) || 0;

const vitesseChute = [50, 35, 25];
const delaiEntreMots = [4000, 3000, 2000];

function choisirListeSelonNiveau() {
    const selection = niveauSelectionne === 0 ? motsCourts : (niveauSelectionne === 1 ? motsMoyens : motsLongs);
    return selection.length ? selection : listeMots;
}

const badgeNiveau = document.getElementById("badge-niveau");
const libellesNiveaux = ["Facile", "Moyen", "Difficile"];
badgeNiveau.innerText = libellesNiveaux[niveauSelectionne] || parametresUrl[0] || "Facile";

let pointsActuels = 0;
let viesRestantes = 3;
let motsAffiches = [];
let temporisateurNouveauMot;
let compteurMots = 0;
let ecouteurSaisieLie = false;
const SYMBOLE_COEUR = "\u2764\uFE0F";

const zoneChute = document.getElementById("zone-chute");
const pileMots = document.getElementById("pile-mots");
const champTexte = document.getElementById("champ-texte");
const indicateurScore = document.getElementById("compteur-score");

const conteneurPalmares = document.getElementById("palmares");

const CLE_PALMARES = "palmaresClavierMaison";

const afficheurVies = document.createElement('p');
afficheurVies.id = 'badge-vies';
afficheurVies.innerText = `${SYMBOLE_COEUR} Vies: ${viesRestantes}`;
document.querySelector('.infos-partie').appendChild(afficheurVies);
const boutonRejouer = document.getElementById("bouton-rejouer");

//recuperer l'historique des scores depuis le localStorage

function chargerPalmares() {
    try {
        const sauvegarde = localStorage.getItem(CLE_PALMARES);
        return sauvegarde ? JSON.parse(sauvegarde) : [];
    } catch (e) {
        return [];
    }
}

// afficher l'historique des scores 
function afficherPalmares(liste) {
    if (!conteneurPalmares) return;

    if (!liste.length) {
        conteneurPalmares.innerHTML = `
            <div class="entete-palmares">
                <span>Meilleurs scores</span>
            </div>
            <p class="palmares-vide">Aucun score enregistré pour l'instant.</p>
        `;
        return;
    }

    const items = liste.map((entree, index) => {
        const date = new Date(entree.date).toLocaleDateString('fr-FR');
        return `
            <li class="item-palmares">
                <strong>${index + 1}. ${entree.score} pts</strong>
                <span>${entree.niveau} · ${date}</span>
            </li>
        `;
    }).join("");

    conteneurPalmares.innerHTML = `
        <div class="entete-palmares">
            <span>Meilleurs scores</span>
            <span>Top 5</span>
        </div>
        <ol class="liste-palmares">
            ${items}
        </ol>
    `;
}

function enregistrerPalmares(liste) {
    try {
        localStorage.setItem(CLE_PALMARES, JSON.stringify(liste));
    } catch (e) {
        // localStorage désactivé ou plein
    }
}

function mettreAJourPalmares(score, niveauLabel) {
    const scores = chargerPalmares();
    scores.push({
        score: score,
        niveau: niveauLabel,
        date: new Date().toISOString()
    });
    scores.sort((a, b) => b.score - a.score);
    const meilleurs = scores.slice(0, 5);
    enregistrerPalmares(meilleurs);
    return meilleurs;
}



function genererPositionHorizontale() {
    const minPercent = 10;
    const maxPercent = 90;
    return Math.floor(Math.random() * (maxPercent - minPercent) + minPercent);
}

function creerBulleMot(texte, id) {
    const blocMot = document.createElement('div');
    blocMot.className = 'falling-word';
    blocMot.textContent = texte;
    blocMot.id = `mot-${id}`;
    blocMot.style.top = '-50px';
    blocMot.style.left = `${genererPositionHorizontale()}%`;
    pileMots.appendChild(blocMot);

    return {
        id: id,
        texte: texte,
        element: blocMot,
        position: -50,
        intervalle: null,
        hauteurLimite: zoneChute.clientHeight - 80
    };
}

function declencherChute(mot) {
    mot.intervalle = setInterval(() => {
        mot.position += 2;
        mot.element.style.top = `${mot.position}px`;

        if (mot.position >= mot.hauteurLimite) {
            motManque(mot);
        }
    }, vitesseChute[niveauSelectionne]);
}

function motManque(mot) {
    mot.element.classList.add('missed');
    interrompreChute(mot);

    viesRestantes--;
    afficheurVies.innerText = `${SYMBOLE_COEUR} Vies: ${viesRestantes}`;

    if (viesRestantes <= 0) {
        finirPartie();
    }

    setTimeout(() => {
        retirerMot(mot);
    }, 500);
}

function motAttrape(mot) {
    interrompreChute(mot);
    mot.element.style.transition = 'all 0.3s ease';
    mot.element.style.transform = 'translateX(-50%) scale(1.5)';
    mot.element.style.opacity = '0';

    pointsActuels += 1;
    indicateurScore.innerText = `Score: ${pointsActuels}`;

    setTimeout(() => {
        retirerMot(mot);
    }, 300);
}

function interrompreChute(mot) {
    if (mot.intervalle) {
        clearInterval(mot.intervalle);
        mot.intervalle = null;
    }
}

function retirerMot(mot) {
    if (mot.element && mot.element.parentNode) {
        mot.element.parentNode.removeChild(mot.element);
    }
    motsAffiches = motsAffiches.filter(item => item.id !== mot.id);
    mettreEnAvantMotActif();
}

function mettreEnAvantMotActif() {
    motsAffiches.forEach(item => item.element.classList.remove('active'));

    if (motsAffiches.length > 0) {
        motsAffiches[0].element.classList.add('active');
    }
}

function injecterNouveauMot() {
    if (viesRestantes <= 0) return;

    const listeSelonNiveau = choisirListeSelonNiveau();
    const motChoisi = listeSelonNiveau[Math.floor(Math.random() * listeSelonNiveau.length)];
    const nouveauMot = creerBulleMot(motChoisi, compteurMots++);
    motsAffiches.push(nouveauMot);
    declencherChute(nouveauMot);

    if (motsAffiches.length === 1) {
        nouveauMot.element.classList.add('active');
    }

    temporisateurNouveauMot = setTimeout(injecterNouveauMot, delaiEntreMots[niveauSelectionne]);
}

function validerSaisie() {
    const saisie = champTexte.value.trim();

    if (saisie === '' || motsAffiches.length === 0) {
        champTexte.value = '';
        return;
    }

    const motIdentique = motsAffiches.find(item => item.texte === saisie);

    if (motIdentique) {
        champTexte.classList.add('correct');
        setTimeout(() => {
            champTexte.classList.remove('correct');
        }, 300);

        motAttrape(motIdentique);
        champTexte.value = '';
    } else {
        champTexte.classList.add('incorrect');
        setTimeout(() => {
            champTexte.classList.remove('incorrect');
            champTexte.value = '';
        }, 300);
    }
}

function surveillerSaisie() {
    const saisie = champTexte.value.trim();

    if (saisie === '') {
        champTexte.style.borderColor = '#c7d2fe';
        return;
    }

    const motIdentique = motsAffiches.find(item => item.texte === saisie);

    if (motIdentique) {
        champTexte.classList.add('correct');
        setTimeout(() => {
            champTexte.classList.remove('correct');
        }, 200);

        motAttrape(motIdentique);
        champTexte.value = '';
        champTexte.style.borderColor = '#c7d2fe';
        return;
    }

    const debuteComme = motsAffiches.some(item =>
        item.texte.startsWith(saisie)
    );

    if (!debuteComme) {
        champTexte.style.borderColor = '#fca5a5';
    } else {
        champTexte.style.borderColor = '#86efac';
    }
}

function finirPartie() {
    motsAffiches.forEach(mot => interrompreChute(mot));
    clearTimeout(temporisateurNouveauMot);

    const scoresMisAJour = mettreAJourPalmares(pointsActuels, badgeNiveau.innerText);
    afficherPalmares(scoresMisAJour);

    champTexte.disabled = true;
    champTexte.value = `GAME OVER - Score: ${pointsActuels}`;
    champTexte.style.backgroundColor = '#fee2e2';
    champTexte.style.color = '#991b1b';
    champTexte.style.fontWeight = 'bold';
    champTexte.style.textAlign = 'center';
}

function remettreAZeroPartie() {
    motsAffiches.forEach(interrompreChute);
    clearTimeout(temporisateurNouveauMot);
    temporisateurNouveauMot = null;
    pileMots.innerHTML = '';
    motsAffiches = [];
    compteurMots = 0;

    pointsActuels = 0;
    viesRestantes = 3;
    indicateurScore.innerText = `Score: ${pointsActuels}`;
    afficheurVies.innerText = `${SYMBOLE_COEUR} Vies: ${viesRestantes}`;

    champTexte.disabled = false;
    champTexte.value = '';
    champTexte.classList.remove('correct', 'incorrect');
    champTexte.style.backgroundColor = '';
    champTexte.style.color = '';
    champTexte.style.fontWeight = '';
    champTexte.style.textAlign = '';
    champTexte.style.borderColor = '#c7d2fe';

    injecterNouveauMot();
    champTexte.focus();
}

if (boutonRejouer) {
    boutonRejouer.addEventListener('click', remettreAZeroPartie);
}

function lancerPartie() {
    if (!ecouteurSaisieLie) {
        champTexte.addEventListener('input', surveillerSaisie);
        ecouteurSaisieLie = true;
    }
    injecterNouveauMot();
    champTexte.disabled = false;
    champTexte.focus();
}

// vider la zone ou les mots tombent

pileMots.innerHTML = '';

afficherPalmares(chargerPalmares());

lancerPartie();

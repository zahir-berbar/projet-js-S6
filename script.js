const allWords = [
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
// Pools par taille de mot
const smallWords = allWords.filter(w => w.length <= 5);
const mediumWords = allWords.filter(w => w.length >= 6 && w.length <= 8);
const largeWords = allWords.filter(w => w.length >= 9);

// Récupérer la difficulté dans l'url
const params = window.location.search.split("?")[1]?.split("=") || ["Facile", "0"];
const difficulte = parseInt(params[1]) || 0;

// Tableau des difficultés - TEMPS AUGMENTÉ
const vitesseDefilement = [50, 35, 25]; // Vitesse réduite
const delaiApparition = [4000, 3000, 2000]; // Plus de temps entre les mots (4s, 3s, 2s)



function getPoolByDifficulty(){
    const pool = difficulte === 0 ? smallWords : (difficulte === 1 ? mediumWords : largeWords);
    return pool.length ? pool : allWords;
}

// Afficher le niveau
const niveau = document.getElementById("niveau");
const niveauTexte = ["Facile", "Moyen", "Difficile"];
niveau.innerText = niveauTexte[difficulte] || params[0] || "Facile";

// Variables de jeu
let scoreValue = 0;
let viesValue = 3; // 3 vies
let activeWords = [];
let nextWordTimeout;
let wordIdCounter = 0;
let inputListenerAttached = false;
const HEART = "\u2764\uFE0F";

const displayArea = document.getElementById("display-area");
const tabMot = document.getElementById("tabMot");
const textToEnter = document.getElementById("input-text");
const scoreElement = document.getElementById("score");
const highScoresContainer = document.getElementById("highscores");
const BEST_SCORES_KEY = "typingGameBestScores";

// Créer l'affichage des vies
const viesElement = document.createElement('p');
viesElement.id = 'vies';
viesElement.innerText = `${HEART} Vies: ${viesValue}`;
document.querySelector('.details').appendChild(viesElement);
const replayBtn = document.getElementById("replay");

function loadBestScores(){
    try{
        const stored = localStorage.getItem(BEST_SCORES_KEY);
        return stored ? JSON.parse(stored) : [];
    }catch(e){
        return [];
    }
}

function saveBestScores(list){
    try{
        localStorage.setItem(BEST_SCORES_KEY, JSON.stringify(list));
    }catch(e){
        // localStorage peut être désactivé
    }
}

function recordBestScore(score, niveauLabel){
    const scores = loadBestScores();
    scores.push({
        score: score,
        niveau: niveauLabel,
        date: new Date().toISOString()
    });
    scores.sort((a,b) => b.score - a.score);
    const topFive = scores.slice(0,5);
    saveBestScores(topFive);
    return topFive;
}

function renderBestScores(list){
    if(!highScoresContainer) return;

    if(!list.length){
        highScoresContainer.innerHTML = `
            <div class="highscores-header">
                <span>Meilleurs scores</span>
            </div>
            <p class="highscores-empty">Aucun score enregistré pour l'instant.</p>
        `;
        return;
    }

    const items = list.map((entry, index) => {
        const date = new Date(entry.date).toLocaleDateString('fr-FR');
        return `
            <li class="highscore-item">
                <strong>${index + 1}. ${entry.score} pts</strong>
                <span>${entry.niveau} · ${date}</span>
            </li>
        `;
    }).join("");

    highScoresContainer.innerHTML = `
        <div class="highscores-header">
            <span>Meilleurs scores</span>
            <span>Top 5</span>
        </div>
        <ol class="highscores-list">
            ${items}
        </ol>
    `;
}

// Fonction pour générer une position horizontale aléatoire
function getRandomHorizontalPosition() {
    const minPercent = 10;
    const maxPercent = 90;
    return Math.floor(Math.random() * (maxPercent - minPercent) + minPercent);
}

// Créer un nouveau mot
function createWord(text, id) {
    const wordDiv = document.createElement('div');
    wordDiv.className = 'falling-word';
    wordDiv.textContent = text;
    wordDiv.id = `word-${id}`;
    wordDiv.style.top = '-50px';
    wordDiv.style.left = `${getRandomHorizontalPosition()}%`;
    tabMot.appendChild(wordDiv);
    
    return {
        id: id,
        text: text,
        element: wordDiv,
        position: -50,
        interval: null,
        maxHeight: displayArea.clientHeight - 80
    };
}

// Démarrer la chute d'un mot
function startFalling(word) {
    word.interval = setInterval(() => {
        word.position += 2;
        word.element.style.top = `${word.position}px`;

        if (word.position >= word.maxHeight) {
            wordMissed(word);
        }
    }, vitesseDefilement[difficulte]);
}

// Mot raté (arrive en bas)
function wordMissed(word) {
    word.element.classList.add('missed');
    stopWord(word);
    
    // Perdre une vie
    viesValue--;
    viesElement.innerText = `${HEART} Vies: ${viesValue}`;
    
    // Vérifier si le jeu est terminé
    if (viesValue <= 0) {
        gameOver();
    }
    
    setTimeout(() => {
        removeWord(word);
    }, 500);
}

// Mot réussi
function wordMatched(word) {
    stopWord(word);
    word.element.style.transition = 'all 0.3s ease';
    word.element.style.transform = 'translateX(-50%) scale(1.5)';
    word.element.style.opacity = '0';
    
    // +1 point par mot
    scoreValue += 1;
    scoreElement.innerText = `Score: ${scoreValue}`;
    
    setTimeout(() => {
        removeWord(word);
    }, 300);
}

// Arrêter la chute d'un mot
function stopWord(word) {
    if (word.interval) {
        clearInterval(word.interval);
        word.interval = null;
    }
}

// Supprimer un mot
function removeWord(word) {
    if (word.element && word.element.parentNode) {
        word.element.parentNode.removeChild(word.element);
    }
    activeWords = activeWords.filter(w => w.id !== word.id);
    updateActiveWord();
}

// Mettre à jour le mot actif (premier dans la liste)
function updateActiveWord() {
    // Retirer la classe active de tous les mots
    activeWords.forEach(w => w.element.classList.remove('active'));
    
    // Ajouter la classe active au premier mot
    if (activeWords.length > 0) {
        activeWords[0].element.classList.add('active');
    }
}

// Fonction pour ajouter un nouveau mot

function addNewWord() {
    // Ne pas ajouter de nouveaux mots si le jeu est terminé
    if (viesValue <= 0) return;
    
    const pool = getPoolByDifficulty();
    const randomWord = pool[Math.floor(Math.random() * pool.length)];
    const newWord = createWord(randomWord, wordIdCounter++);
    activeWords.push(newWord);
    startFalling(newWord);

    if (activeWords.length === 1) {
        newWord.element.classList.add('active');
    }

    nextWordTimeout = setTimeout(addNewWord, delaiApparition[difficulte]);
}

// Fonction de validation (appelée uniquement avec Entrée)
function validateInput() {
    const inputValue = textToEnter.value.trim();
    
    if (inputValue === '' || activeWords.length === 0) {
        textToEnter.value = '';
        return;
    }

    // Chercher si le mot tapé correspond à un mot à l'écran
    const matchedWord = activeWords.find(word => word.text === inputValue);
    
    if (matchedWord) {
        // Mot correct !
        textToEnter.classList.add('correct');
        setTimeout(() => {
            textToEnter.classList.remove('correct');
        }, 300);
        
        wordMatched(matchedWord);
        textToEnter.value = '';
    } else {
        // Mot incorrect - vider la case avec animation
        textToEnter.classList.add('incorrect');
        setTimeout(() => {
            textToEnter.classList.remove('incorrect');
            textToEnter.value = '';
        }, 300);
    }
}

// Vérification en temps réel pour feedback visuel (sans validation)
function checkInput() {
    const inputValue = textToEnter.value.trim();

    if (inputValue === '') {
        textToEnter.style.borderColor = '#c7d2fe';
        return;
    }

    // Cherche un mot EXACTEMENT égal à ce qui est tapé
    const matchedWord = activeWords.find(word => word.text === inputValue);

    if (matchedWord) {
        // Validation automatique
        textToEnter.classList.add('correct');
        setTimeout(() => {
            textToEnter.classList.remove('correct');
        }, 200);

        wordMatched(matchedWord);
        textToEnter.value = '';
        textToEnter.style.borderColor = '#c7d2fe';
        return;
    }

    // Feedback visuel pendant la frappe
    const hasPrefix = activeWords.some(word =>
        word.text.startsWith(inputValue)
    );

    if (!hasPrefix) {
        textToEnter.style.borderColor = '#fca5a5'; // rouge
    } else {
        textToEnter.style.borderColor = '#86efac'; // vert
    }
}

// Game Over
function gameOver() {
    // Arrêter tous les intervalles
    activeWords.forEach(word => stopWord(word));
    clearTimeout(nextWordTimeout);
    
    const updatedScores = recordBestScore(scoreValue, niveau.innerText);
    renderBestScores(updatedScores);
    
    // Désactiver l'input
    textToEnter.disabled = true;
    textToEnter.value = `GAME OVER - Score: ${scoreValue}`;
    textToEnter.style.backgroundColor = '#fee2e2';
    textToEnter.style.color = '#991b1b';
    textToEnter.style.fontWeight = 'bold';
    textToEnter.style.textAlign = 'center';
}

function resetGame(){
    activeWords.forEach(stopWord);
    clearTimeout(nextWordTimeout);
    nextWordTimeout = null;
    tabMot.innerHTML = '';
    activeWords = [];
    wordIdCounter = 0;

    scoreValue = 0;
    viesValue = 3;
    scoreElement.innerText = `Score: ${scoreValue}`;
    viesElement.innerText = `${HEART} Vies: ${viesValue}`;

    textToEnter.disabled = false;
    textToEnter.value = '';
    textToEnter.classList.remove('correct','incorrect');
    textToEnter.style.backgroundColor = '';
    textToEnter.style.color = '';
    textToEnter.style.fontWeight = '';
    textToEnter.style.textAlign = '';
    textToEnter.style.borderColor = '#c7d2fe';

    addNewWord();
    textToEnter.focus();
}

if(replayBtn){
    replayBtn.addEventListener('click', resetGame);
}

// Démarrer le jeu
function startGame() {
    if(!inputListenerAttached){
        textToEnter.addEventListener('input', checkInput);
        inputListenerAttached = true;
    }
    addNewWord();
    textToEnter.disabled = false;
    textToEnter.focus();
}

// Nettoyer au départ
tabMot.innerHTML = '';

// Afficher les scores existants
renderBestScores(loadBestScores());

// Démarrer !
startGame();

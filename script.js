const words = [
    "chat",
    "chien",
    "soleil",
    "ordinateur",
    "clavier",
    "chat",
    "chien",
    "soleil",
    "ordinateur",
    "clavier"
]


const tTF = [document.getElementById("tM0"),
    document.getElementById("tM1"),
    document.getElementById("tM2"),
    document.getElementById("tM3"),
    document.getElementById("tM4")
]


let index = 0
let scoreValue=0
let interval

//recuperer la difficulté dans l'url
const params = window.location.search.split("?")[1].split("=")
difficulte=parseInt(params[1]) 

//tableau des difficulte
const vitesseDefilement=[20,10,1]

//afficher le niveau

const niveau=document.getElementById("niveau")
niveau.innerText=params[0]



let intervalMove = []
let i = getRandomIndex(0, tTF.length-1)


//afficher le premier mot
const timerMove = function (i) {
    intervalMove[i] = setInterval(() => move(i), vitesseDefilement[difficulte])
}

tTF[i].innerText = words[getRandomIndex(0,words.length-1)]
timerMove(i)
i = getRandomIndex(0, tTF.length-1)

// const textToFind = document.getElementById("text-to-find")
// textToFind.innerText = words[index]



const demarrerTimer = function () {
    clearInterval(interval) 
    interval = setInterval(afficherMotsSuivant, 1 * 1000)
}


const compare = function() {
    const score=document.getElementById("score")
    if(textToEnter.value == words[index]){

        scoreValue++
        afficherMotsSuivant()
        score.innerText="Score: "+scoreValue
        textToEnter.value=''
        demarrerTimer()

    }
}



//deplace le mot de 1 px

const move = function(i) {

    const tM = document.getElementById("tM" + i)
    const proprietes = window.getComputedStyle(tM)

    posMot = parseInt(proprietes.top) + 1

    if(posMot >= parseInt(window.getComputedStyle(document.getElementById("display-area")).height)-34){
        tM.innerText = ""
        clearInterval(intervalMove[i])
    }
    
    tM.style.top = posMot + "px"
}

const afficherMotsSuivant=function(){
    index++
    if(index >= words.length){
        index = 0
    }
    tTF[i].innerText = words[getRandomIndex(0,words.length-1)]
    timerMove(i)
    i = getRandomIndex(0, tTF.length-1)
  
}

function getRandomIndex(min, max) {
    return Math.trunc(Math.random() * (max - min) + min);
}

const startGame = function() {
    demarrerTimer()
    const tM = document.getElementById("tM" + i)
    const textToEnter = document.getElementById("input-text")
    textToEnter.addEventListener("input", compare)
}

startGame()
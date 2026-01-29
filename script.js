

const demarrerTimer = function () {
    clearInterval(interval) 
    interval = setInterval(afficherMotsSuivant, vitesse * 1000)
}

const afficherMotsSuivant=function(){
    index++
    if(index >= words.length){
        index = 0
    }
    textToFind.innerText = words[index]
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

const words = [
    "chat",
    "chien",
    "soleil",
    "ordinateur",
    "clavier"
]
let index = 0
let scoreValue=0
let interval

//recuperer la difficulté dans l'url
const params = window.location.search.split("?")[1].split("=")

vitesse=parseInt(params[1]) || 4

const niveau=document.getElementById("niveau")
niveau.innerText=params[0]
console.log(niveau.value)



//afficher le premier mot

const textToFind = document.getElementById("text-to-find")
textToFind.innerText = words[index]

demarrerTimer()
const textToEnter = document.getElementById("input-text")
textToEnter.addEventListener("input", compare)
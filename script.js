const words = [
    "chat",
    "chien",
    "soleil",
    "ordinateur",
    "clavier"
]
let index = 0
let scoreValue=0
const vitesse=5
let interval


//afficher le premier mot

const textToFind = document.getElementById("text-to-find")
textToFind.innerText = words[index]


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



demarrerTimer()
const textToEnter = document.getElementById("input-text")
textToEnter.addEventListener("input", compare)
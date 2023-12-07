const io = require('../src/server')
class Controller {
    async Connection(req, res) {
       
    }
    async msgFiltter(msg) {
        if (msg) {
            let msgArray = msg.split('')
            let arrayMensagemSemEspaço = []
            let spaces = 0
            msgArray.forEach(msgVerification => {
                msgVerification === ' ' || msgVerification === '\n' ? spaces++ : arrayMensagemSemEspaço.push(msgVerification)
            });
            if (spaces === msg.length) {
                return null
            }
            else {
                let arrayComUmEspaço = msgArray.join('')
                return arrayComUmEspaço
            }
        }
        return
    }
    async msgTroll(msg){
        if (msg) {
            let words = msg.split(' ')
            let wordsFinal = []
            let emoji = undefined
            let arrays = await this.getKeyWords()
            words.forEach(word => {
                let foundGoblin = arrays.arrayGoblin.find(w => word === w)
                let foundPleading = arrays.arrayPleadingFace.find(w => word === w)
                let foundAlien = arrays.arrayAlien.find(w => word === w)
                if (foundGoblin) {
                    word = word + ' &#128122 '
                    if(emoji === undefined){
                        emoji = true
                    }
                }
                if (foundPleading) {
                    word = word + ' &#129402 '
                    if (emoji === undefined) {
                        emoji = true
                    }
                }
                if (foundAlien) {
                    word = word + ' &#128125 ' + '(não tem o alien cinza &#128122) '
                    if (emoji === undefined) {
                        emoji = true
                    }
                }
                if (word === 'lol' || word === 'Lol' || word === "LOL" || word === "loll" || word === ".lol" || word === '.LOL' || word === '.l0l' || word === 'l0l' || word === '.L0l' || word === ';Lol' || word === ';lol' || word === ',lol') {
                    word = 'eu te amo ' + word
                    
                }
                if (word === 'feio' || word === 'Feio' || word === "horrivel" || word === "Horrivel" || word === "Horrível" || word === "horrível") {
                    word ='lindo uma beleza, uma obra prima, tão lindo quanto o maravilhoso paulo'
                }
                if (word === 'fg' || word === 'FG' || word === 'Fg' || word === 'efege') {
                    word = "eu amo o " + word                    
                }
                if(word === 'oi' || word === "Oi"){
                    word = 'eae'
                }
                if(word === 'batata' || word === 'Batata'){
                    word = word + ' :D '
                }
                if (word === 'medo' || word === "Medo") {
                    word = ' tesão '
                }
                if (word === 'faf' || word === 'fafo' || word === 'alef') {
                    word = word + ' &#129361 '
                    if (emoji === undefined) {
                        emoji = true
                    }
                }
                if(word === 'Andi' || word == 'andi' || word === 'Andí' || word === "andí"){
                    word = word + ' &#129488 '
                    if (emoji === undefined) {
                        emoji = true
                    }
                }
                if(word === "mulher" || word === "Mulher") {
                    word = ' lindinha '
                }
                if(word === 'homem' || word === "Homem") {
                    word = ' gostosinho '
                }
                if(word === "loira" || word === 'Loira') {
                    word = 'burra'
                }
                if (word === "LOIRA") {
                    word = 'BURRA'
                }
                if (word === "loirinha" || word === 'Loirinha') {
                    word = 'burrinha'
                }
                if (word === "perfeito" || word === 'Perfeito' || word === "PERFEITO") {
                    word = 'Doctor Who'
                }
                if(word === 'triste', word === 'Triste'){
                    word = 'feliz'
                }
                if(word === 'pirralha', word === 'Pirralha'){
                    word = 'pessoa que deve 30 reais para o paulo'
                }
                if(word === 'rafa' || word === 'Rafa' || word === 'ella' || word === 'Ella' || word === 'rafaela' || word === 'Rafaela' || word === 'rafaela souza' || word === 'Rafaela Souza' || word === 'rafaela Souza' || word === 'Rafaela souza' || word === 'Rafaela faria' || word === 'Rafaela Faria' || word === 'rafaela Faria' || word === 'ella souza' || word === 'Ella Souza' || word === 'ella Souza' || word === 'Ella Souza' || word === 'Ella Faria' || word === 'ella faria' || word === 'Ella faria' || word === 'ella Faria') {
                    word = 'a melhor amiga do Ribas'
                }
                if(word === 'erg' || word === 'Erg' || word === 'erglareo' || word === 'Erglareo') {
                    word = 'indio'
                }
                wordsFinal.push(word)
            })
            if(emoji) {
                wordsFinal.unshift('(-emoji#)|')
            }
            let finalMsg = wordsFinal.join(' ')
            return finalMsg
        }
        return 
    }
    async getKeyWords(word){
        let arrayGoblin = ['Paulo', 'Paulou', 'paulinho', 'paulito', 'paulo', 'paulo ribas', 'Paulo Ribas', 'Ribas', 'ribas', '33', 'josé','José', 'paulobrasil', 'brasil', 'paulobrasil33', 'pau lo', 'Pau lo']
        let arrayPleadingFace = ['gusta', 'Gusta', 'Ovatsug']
        let arrayAlien = ['nicolas', 'rari']
        return new Promise((resolve, reject) => {
            return resolve({arrayGoblin, arrayPleadingFace, arrayAlien})
        })

    }
    async stopSpam(msgs){
        if (!msgs) return
        let arrayKeysWord = ['lol' ,'Lol' ,"LOL" ,"loll", ".lol" ,'.LOL', 'feio', 'Feio', 'horrivel', 'Horrivel', 'horrível', 'Horrível', 'nicolas', 'rari']
        let count = 0
        let text = msgs.split(' ')
        text.forEach( word => {
            let exits = arrayKeysWord.find(key => {
                return key === word
            })
            if (exits) {
                count++
            }
        })
        return new Promise((resolve, reject) => {
            if (count > 5) {
                reject('(-emoji#)| tentei quebrar o chat, mas não dá pra enviar &#129322 &#129322')
            }
            resolve(count)
        })
    }

}

module.exports = new Controller
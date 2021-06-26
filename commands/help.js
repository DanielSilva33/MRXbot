const prefix = require("../config.json");
const commands = require("../scripts/commandsReader")(prefix.prefix);

const descriptions = {
    "!help": "Lista todos os comandos do canal!",
    "!clear": "Apaga todas as mensagens do canal!",
    "!ping": "pinga o bot!"
}

module.exports = (msg) => {
    var text = "Comandos: \n";

    Object.keys(commands).forEach(command => {
        text += `\n ${command}: ${descriptions[command] ? descriptions[command] : "Not Found"}`
    });

    msg.reply(text);
}
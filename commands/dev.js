const Discord = require("discord.js");

module.exports = async (msg) => {

    let embed = new Discord.MessageEmbed()
        .setColor('#68F586')
        .setTitle(`:space_invader: **Desenvolvedor** :space_invader:`)
        .setDescription(`Criado e desenvolvido por @defaultXd#3834
        **Github:** https://github.com/DanielSilva33
        **Linkedin:** https://www.linkedin.com/in/daniel-silva-1a3209196/`)
        .setImage('https://claudia.abril.com.br/wp-content/uploads/2020/01/bob-esponja-colecao-nike-1.gif')
        .setTimestamp();
    await msg.reply(embed);
}
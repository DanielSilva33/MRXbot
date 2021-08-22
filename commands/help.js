const Discord = require("discord.js");

module.exports = async (msg) => {

    let embed = new Discord.MessageEmbed()
        .setColor('#68F586')
        //.setAuthor(member.user.tag, member.user.displayAvatarURL())
        .setTitle(`:space_invader: **Comandos do bot** :space_invader:`)
        .setDescription(`**!help**
        *lista todos os comandos.*
        
        **!dev** 
        *Github do desenvolvedor e criador do bot.*
        
        **!play LINK_DA_MUSICA**
        *Comando para ouvir musicas com o nosso bot.*
        
        **!pause**
        *Pausa a musica que está tocando.*
        
        **!resume**
        *Continua tocando a musica pausada.*`)
        .setTimestamp();
    await msg.reply(embed);
}
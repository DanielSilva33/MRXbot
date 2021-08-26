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

        **!bot**
        *Link de convite para utilizar o bot MRX no seu servidor.*

        **!tempo NOME_CIDADE**
        *Retorna os dados climaticos da cidade!*
        
        **!play LINK_DA_MUSICA**
        *Comando para ouvir musicas com o nosso bot.*
        
        **!pause**
        *Pausa a musica que está tocando.*
        
        **!resume**
        *Continua tocando a musica pausada.*

        **!skip**
        *Pula para a proxima musica na fila.
        
        **!end**
        *Para a musica que está tocando e limpa as musicas que estão em fila!*`)
        .setTimestamp();
    await msg.reply(embed);
}
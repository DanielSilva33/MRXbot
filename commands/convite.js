const Discord = require("discord.js");

module.exports = async (msg) => {

    let embed = new Discord.MessageEmbed()
        .setColor('#68F586')
        .setTitle(`:space_invader: **Convite** :space_invader:`)
        .setDescription(`Link de convite para o nosso servidor:
        https://discord.gg/2XkCaSGYgP`)
        .setImage('http://25.media.tumblr.com/tumblr_lolhcftkij1qgcmwro1_500.gif')
        .setTimestamp();
    await msg.reply(embed);
}
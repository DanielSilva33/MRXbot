const Discord = require("discord.js");

module.exports = async (msg) => {

    let embed = new Discord.MessageEmbed()
        .setColor('#68F586')
        .setTitle(`:space_invader: **Link de convite** :space_invader:`)
        .setDescription(`Convite o bot MRX para o seu servidor: [Clique aqui](https://discord.com/oauth2/authorize?client_id=786033678706409472&scope=bot&permissions=8)`)
        .setTimestamp();
    await msg.reply(embed);
}
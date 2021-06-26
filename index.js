const Discord = require("discord.js");
const config = require("./config.json");
const commands = require("./scripts/commandsReader")(config.prefix);

const client = new Discord.Client();

client.once("ready", () => {
    console.log(`Bot online: ${client.user.tag}!`);
});

client.on("message", (msg) => {
    if (!msg.author.bot && msg.content.charAt(0) === "!") {
        const verifyContent = msg.content.split(" ");

        if (commands[verifyContent[0]]) {
            commands[verifyContent[0]](msg);
        } else {
            msg.reply("Command not found!")
        }
    }
});

client.on("guildMemberAdd", (member) => {
    const welcomeChannel = member.guild.channels.cache.find(channel => channel.id === config.welcomeChannelId);
    welcomeChannel.send(`O usuário ${member.user} acabou de entrar no servidor! :)`);

    member.send("Bem-vindo ao servidor MRX, Respeite as regras e divirta-se!");
});


client.login(config.token);